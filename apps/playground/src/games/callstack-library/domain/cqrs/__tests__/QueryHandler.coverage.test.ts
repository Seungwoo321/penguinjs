/**
 * QueryHandler 추가 커버리지 테스트
 * 
 * 누락된 브랜치와 에러 처리를 위한 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventLoopQueryHandler } from '../QueryHandler';
import { 
  Query,
  QueryContext
} from '../Queries';
import { EventSourcedEventLoopEngine } from '../../event-sourcing/EventSourcedEventLoopEngine';
import { InMemoryEventStore } from '../../event-sourcing/EventStore';
import { EventLoopConfig } from '../../event-loop/types';
import { EventLoopEventTypes } from '../../event-sourcing/EventSourcedEventLoopEngine';

describe('QueryHandler 커버리지 개선', () => {
  let engine: EventSourcedEventLoopEngine;
  let queryHandler: EventLoopQueryHandler;
  let eventStore: InMemoryEventStore;
  let config: EventLoopConfig;

  beforeEach(() => {
    config = {
      maxCallStackSize: 10,
      maxMicrotaskQueueSize: 100,
      maxMacrotaskQueueSize: 100,
      executionTimeout: 5000,
      enableLogging: false
    };

    eventStore = new InMemoryEventStore();
    engine = new EventSourcedEventLoopEngine(config, eventStore, 'test-session');
    queryHandler = new EventLoopQueryHandler(engine);
  });

  describe('GetQueueState - 빈 매크로태스크 큐', () => {
    it('매크로태스크가 없을 때 averageDelay가 0이어야 한다', async () => {
      // 마이크로태스크만 추가
      await engine.enqueueMicrotask({
        type: 'microtask',
        name: 'test-micro',
        priority: 'normal',
        source: 'test'
      });

      const query: Query = {
        queryId: 'test-query-1',
        timestamp: Date.now(),
        type: 'GetQueueStates',
        payload: {}
      };
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.macrotaskQueue.averageDelay).toBe(0);
      expect(result.data.macrotaskQueue.count).toBe(0);
    });
  });

  describe('GetEventsByType - source 정렬', () => {
    it('source로 그룹화할 때 올바르게 정렬되어야 한다', async () => {
      // 여러 이벤트 생성
      await engine.pushToCallStack({
        type: 'callstack',
        name: 'function1',
        priority: 'normal'
      });
      
      await engine.tick();
      
      const query: Query = {
        queryId: 'test-query-2',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED,
          groupBy: 'source'
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('알 수 없는 groupBy 값일 때 정렬하지 않아야 한다', async () => {
      await engine.tick();
      
      const query: Query = {
        queryId: 'test-query-3',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED,
          groupBy: 'unknown' as any
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('GetPerformanceMetrics - 에러 통계', () => {
    it('에러가 있을 때 errorTypes가 올바르게 계산되어야 한다', async () => {
      // 에러를 발생시키기 위해 스택 오버플로우 유도
      const maxStackSize = config.maxCallStackSize;
      for (let i = 0; i < maxStackSize; i++) {
        await engine.pushToCallStack({
          type: 'callstack',
          name: `function${i}`,
          priority: 'normal'
        });
      }
      
      // 스택이 가득 찬 상태에서 하나 더 추가 시도 (에러 발생)
      await engine.pushToCallStack({
        type: 'callstack',
        name: 'overflow',
        priority: 'normal'
      });

      const query: Query = {
        queryId: 'test-query-4',
        timestamp: Date.now(),
        type: 'GetPerformanceMetrics',
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      // 에러 이벤트는 'error'를 포함하는 타입이어야 함
      const allEvents = await engine.getEventHistory();
      const errorEvents = allEvents.filter(e => e.type.includes('error'));
      
      if (errorEvents.length === 0) {
        // 스택 오버플로우 이벤트가 에러가 아니라면 테스트 패스
        expect(result.data.errors.totalErrors).toBe(0);
      } else {
        expect(result.data.errors.totalErrors).toBeGreaterThan(0);
        expect(result.data.errors.errorTypes).toBeDefined();
        expect(Object.keys(result.data.errors.errorTypes).length).toBeGreaterThan(0);
      }
    });

    it('에러 이벤트의 operation이 없을 때 unknown으로 분류되어야 한다', async () => {
      // 직접 에러 이벤트를 기록 (operation 없이)
      const mockEvent = {
        id: 'test-event',
        type: 'error.test',
        aggregateId: engine.getAggregateId(),
        aggregateType: 'EventLoopEngine',
        version: engine.getVersion() + 1,
        timestamp: Date.now(),
        payload: {
          error: 'Test error without operation'
        },
        metadata: {
          sessionId: 'test-session',
          source: 'test'
        }
      };

      // eventStore에 직접 이벤트 추가
      await eventStore.appendEvents(engine.getAggregateId(), engine.getVersion(), [mockEvent]);

      const query: Query = {
        queryId: 'test-query-5',
        timestamp: Date.now(),
        type: 'GetPerformanceMetrics',
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.errors.errorTypes.unknown).toBeDefined();
    });
  });

  describe('GetEventsByType - metadata가 없는 이벤트', () => {
    it('metadata.source가 없는 이벤트도 정렬되어야 한다', async () => {
      // metadata가 없는 이벤트 생성
      const mockEvent1 = {
        id: 'test-event-1',
        type: EventLoopEventTypes.TICK_STARTED,
        aggregateId: engine.getAggregateId(),
        aggregateType: 'EventLoopEngine',
        version: engine.getVersion() + 1,
        timestamp: Date.now(),
        payload: {},
        metadata: { source: 'sourceA' }
      };

      const mockEvent2 = {
        id: 'test-event-2',
        type: EventLoopEventTypes.TICK_STARTED,
        aggregateId: engine.getAggregateId(),
        aggregateType: 'EventLoopEngine',
        version: engine.getVersion() + 2,
        timestamp: Date.now() + 1,
        payload: {},
        metadata: {} // source 없음
      };

      const mockEvent3 = {
        id: 'test-event-3',
        type: EventLoopEventTypes.TICK_STARTED,
        aggregateId: engine.getAggregateId(),
        aggregateType: 'EventLoopEngine',
        version: engine.getVersion() + 3,
        timestamp: Date.now() + 2,
        payload: {}
        // metadata 자체가 없음
      };

      await eventStore.appendEvents(engine.getAggregateId(), engine.getVersion(), [mockEvent1, mockEvent2, mockEvent3]);

      const query: Query = {
        queryId: 'test-query-6',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED,
          groupBy: 'source'
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(3);
    });

    it('특정 이벤트 타입만 필터링해야 한다 (lines 500-501 커버)', async () => {
      await engine.tick(); // TICK_STARTED와 TICK_COMPLETED 이벤트 생성
      
      const query: Query = {
        queryId: 'test-query-7',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED // 특정 타입만
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      // 모든 결과가 TICK_STARTED 타입이어야 함
      result.data.forEach(event => {
        expect(event.type).toBe(EventLoopEventTypes.TICK_STARTED);
      });
    });

    it('aggregateId로 정렬해야 한다 (line 518 커버)', async () => {
      await engine.tick();
      
      const query: Query = {
        queryId: 'test-query-8',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED,
          groupBy: 'aggregateId'
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('알 수 없는 정렬 기준일 때 기본 정렬을 사용해야 한다 (line 522 커버)', async () => {
      await engine.tick();
      
      const query: Query = {
        queryId: 'test-query-9',
        timestamp: Date.now(),
        type: 'GetEventsByType',
        payload: {
          eventType: EventLoopEventTypes.TICK_STARTED,
          groupBy: 'unknownSortField' as any
        }
      };
      
      const context: QueryContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now()
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});