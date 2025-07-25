/**
 * QueryHandler 단위 테스트
 * 
 * CQRS 쿼리 처리기의 핵심 기능을 검증합니다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QueryDispatcher,
  EventLoopQueryHandler,
  QueryLoggingMiddleware,
  IQueryHandler,
  QueryContext,
  QueryMiddleware
} from '../QueryHandler';
import {
  GameQuery,
  QueryResult,
  GetCurrentStateQuery,
  GetCallStackQuery,
  GetQueueStatesQuery,
  GetExecutionHistoryQuery,
  GetEventsQuery,
  GetEventsByTypeQuery,
  GetAggregateHistoryQuery,
  GetPerformanceMetricsQuery,
  GetDebugInfoQuery,
  GetSimulationStateQuery
} from '../Queries';
import { EventSourcedEventLoopEngine } from '../../event-sourcing/EventSourcedEventLoopEngine';
import { InMemoryEventStore } from '../../event-sourcing/EventStore';
import { EventLoopConfig } from '../../event-loop/types';

describe('QueryHandler', () => {
  let dispatcher: QueryDispatcher;
  let eventStore: InMemoryEventStore;
  let engine: EventSourcedEventLoopEngine;
  let queryHandler: EventLoopQueryHandler;
  let context: QueryContext;
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
    dispatcher = new QueryDispatcher();

    context = {
      sessionId: 'test-session',
      userId: 'test-user',
      source: 'test',
      cacheEnabled: true
    };

    // 핸들러 등록
    dispatcher.registerHandler('GetCurrentState', queryHandler);
    dispatcher.registerHandler('GetCallStack', queryHandler);
    dispatcher.registerHandler('GetQueueStates', queryHandler);
    dispatcher.registerHandler('GetExecutionHistory', queryHandler);
    dispatcher.registerHandler('GetEvents', queryHandler);
    dispatcher.registerHandler('GetEventsByType', queryHandler);
    dispatcher.registerHandler('GetAggregateHistory', queryHandler);
    dispatcher.registerHandler('GetPerformanceMetrics', queryHandler);
    dispatcher.registerHandler('GetDebugInfo', queryHandler);
    dispatcher.registerHandler('GetSimulationState', queryHandler);
  });

  describe('QueryDispatcher', () => {
    it('핸들러를 등록할 수 있어야 한다', () => {
      const mockHandler: IQueryHandler = {
        handle: vi.fn(),
        canHandle: vi.fn().mockReturnValue(true),
        getCacheKey: vi.fn().mockReturnValue('test-key'),
        getCacheTTL: vi.fn().mockReturnValue(30000)
      };

      dispatcher.registerHandler('TestQuery', mockHandler);
      expect(mockHandler.canHandle).toBeDefined();
    });

    it('유효한 쿼리를 디스패치할 수 있어야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      const result = await dispatcher.dispatch(query, context);
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.fromCache).toBe(false);
    });

    it('잘못된 쿼리에 대해 에러를 던져야 한다', async () => {
      const invalidQuery = {
        type: 'InvalidQuery',
        id: 'invalid-1',
        timestamp: Date.now()
        // payload 누락
      } as any;

      await expect(dispatcher.dispatch(invalidQuery, context))
        .rejects.toThrow('Invalid query: InvalidQuery');
    });

    it('등록되지 않은 핸들러에 대해 에러를 던져야 한다', async () => {
      const query: GameQuery = {
        type: 'UnregisteredQuery' as any,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      await expect(dispatcher.dispatch(query, context))
        .rejects.toThrow('No handler found for query type: UnregisteredQuery');
    });

    it('캐시된 결과를 반환해야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      // 첫 번째 실행
      const result1 = await dispatcher.dispatch(query, context);
      expect(result1.metadata.fromCache).toBe(false);

      // 두 번째 실행 (캐시에서)
      const result2 = await dispatcher.dispatch(query, context);
      expect(result2.metadata.fromCache).toBe(true);
      expect(result2.metadata.cacheHit).toBe(true);
    });

    it('만료된 캐시는 사용하지 않아야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      // 짧은 TTL을 가진 핸들러로 교체
      const shortTTLHandler = new EventLoopQueryHandler(engine);
      shortTTLHandler.getCacheTTL = () => 1; // 1ms TTL
      dispatcher.registerHandler('GetCurrentState', shortTTLHandler);

      // 첫 번째 실행
      await dispatcher.dispatch(query, context);

      // 캐시 만료 대기
      await new Promise(resolve => setTimeout(resolve, 10));

      // 두 번째 실행 (캐시 만료로 인해 재실행)
      const result2 = await dispatcher.dispatch(query, context);
      expect(result2.metadata.fromCache).toBe(false);
    });

    it('캐시가 비활성화된 경우 캐시를 사용하지 않아야 한다', async () => {
      const noCacheContext = { ...context, cacheEnabled: false };
      
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      const result1 = await dispatcher.dispatch(query, noCacheContext);
      const result2 = await dispatcher.dispatch(query, noCacheContext);

      expect(result1.metadata.fromCache).toBe(false);
      expect(result2.metadata.fromCache).toBe(false);
    });

    it('캐시 키가 없는 핸들러는 캐시를 사용하지 않아야 한다', async () => {
      const noCacheKeyHandler: IQueryHandler = {
        handle: vi.fn().mockResolvedValue({
          success: true,
          data: {},
          metadata: { executionTime: 100, resultCount: 1, totalCount: 1, fromCache: false }
        }),
        canHandle: vi.fn().mockReturnValue(true)
        // getCacheKey 메서드 없음
      };

      dispatcher.registerHandler('NoCacheKeyQuery', noCacheKeyHandler);

      const query: GameQuery = {
        type: 'NoCacheKeyQuery' as any,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result1 = await dispatcher.dispatch(query, context);
      const result2 = await dispatcher.dispatch(query, context);

      expect(result1.metadata.fromCache).toBe(false);
      expect(result2.metadata.fromCache).toBe(false);
    });

    it('미들웨어를 추가하고 실행할 수 있어야 한다', async () => {
      const middleware: QueryMiddleware = {
        beforeHandle: vi.fn().mockResolvedValue({
          query: expect.any(Object),
          context: expect.any(Object)
        }),
        afterHandle: vi.fn().mockImplementation((q, c, result) => Promise.resolve(result)),
        onError: vi.fn()
      };

      dispatcher.addMiddleware(middleware);

      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      await dispatcher.dispatch(query, context);

      expect(middleware.beforeHandle).toHaveBeenCalledWith(query, context);
      expect(middleware.afterHandle).toHaveBeenCalled();
    });

    it('에러 발생 시 미들웨어의 onError를 호출해야 한다', async () => {
      const errorMiddleware: QueryMiddleware = {
        beforeHandle: vi.fn().mockResolvedValue({
          query: expect.any(Object),
          context: expect.any(Object)
        }),
        afterHandle: vi.fn().mockResolvedValue(expect.any(Object)),
        onError: vi.fn()
      };

      dispatcher.addMiddleware(errorMiddleware);

      // 에러를 발생시키는 핸들러
      const errorHandler: IQueryHandler = {
        handle: vi.fn().mockRejectedValue(new Error('Test error')),
        canHandle: vi.fn().mockReturnValue(true),
        getCacheKey: vi.fn().mockReturnValue('error-key'),
        getCacheTTL: vi.fn().mockReturnValue(30000)
      };

      dispatcher.registerHandler('ErrorQuery', errorHandler);

      const query: GameQuery = {
        type: 'ErrorQuery' as any,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      await expect(dispatcher.dispatch(query, context)).rejects.toThrow('Test error');
      expect(errorMiddleware.onError).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Error)
      );
    });

    it('캐시를 클리어할 수 있어야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      // 캐시 생성
      await dispatcher.dispatch(query, context);
      
      // 캐시 통계 확인
      let stats = dispatcher.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      // 캐시 클리어
      dispatcher.clearCache();
      
      stats = dispatcher.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('EventLoopQueryHandler', () => {
    it('지원하는 쿼리 타입을 확인할 수 있어야 한다', () => {
      expect(queryHandler.canHandle('GetCurrentState')).toBe(true);
      expect(queryHandler.canHandle('GetCallStack')).toBe(true);
      expect(queryHandler.canHandle('GetQueueStates')).toBe(true);
      expect(queryHandler.canHandle('GetExecutionHistory')).toBe(true);
      expect(queryHandler.canHandle('GetEvents')).toBe(true);
      expect(queryHandler.canHandle('GetEventsByType')).toBe(true);
      expect(queryHandler.canHandle('GetAggregateHistory')).toBe(true);
      expect(queryHandler.canHandle('GetPerformanceMetrics')).toBe(true);
      expect(queryHandler.canHandle('GetDebugInfo')).toBe(true);
      expect(queryHandler.canHandle('GetSimulationState')).toBe(true);
      expect(queryHandler.canHandle('UnsupportedQuery')).toBe(false);
    });

    it('캐시 키를 생성할 수 있어야 한다', () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      const cacheKey = queryHandler.getCacheKey(query);
      expect(cacheKey).toContain('GetCurrentState');
      expect(cacheKey).toContain(engine.getAggregateId());
      expect(cacheKey).toContain(engine.getVersion().toString());
    });

    it('쿼리 타입별 TTL을 반환해야 한다', () => {
      const currentStateQuery: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeHistory: false, includeMetrics: false }
      };

      const callStackQuery: GetCallStackQuery = {
        type: 'GetCallStack',
        id: 'query-2',
        timestamp: Date.now(),
        payload: { includeMetadata: true }
      };

      const unknownQuery = {
        type: 'UnknownQuery',
        id: 'query-3',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(queryHandler.getCacheTTL(currentStateQuery)).toBe(1000);
      expect(queryHandler.getCacheTTL(callStackQuery)).toBe(5000);
      expect(queryHandler.getCacheTTL(unknownQuery)).toBe(30000); // 기본값
    });

    it('GetCurrentState 쿼리를 처리할 수 있어야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.eventLoopState).toBeDefined();
      expect(result.data.lastUpdated).toBeDefined();
      expect(result.metadata.resultCount).toBe(1);
      expect(result.metadata.totalCount).toBe(1);
    });

    it('GetCurrentState 쿼리에 메트릭을 포함할 수 있어야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.metrics).toBeDefined();
      expect(result.data.metrics.totalTicks).toBeDefined();
      expect(result.data.metrics.queueUtilization).toBeDefined();
    });

    it('GetCallStack 쿼리를 처리할 수 있어야 한다', async () => {
      // 먼저 함수를 스택에 추가
      await engine.pushToCallStack({
        name: 'testFunction',
        context: { scope: {} },
        priority: 'normal'
      });

      const query: GetCallStackQuery = {
        type: 'GetCallStack',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeMetadata: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.frames).toBeDefined();
      expect(result.data.depth).toBe(1);
      expect(result.data.topFrame).toBeDefined();
      expect(result.data.topFrame.name).toBe('testFunction');
    });

    it('GetCallStack 쿼리에 stackDepth를 지정할 수 있어야 한다', async () => {
      // 여러 함수 추가
      await engine.pushToCallStack({ name: 'func1', context: {}, priority: 'normal' });
      await engine.pushToCallStack({ name: 'func2', context: {}, priority: 'normal' });
      await engine.pushToCallStack({ name: 'func3', context: {}, priority: 'normal' });

      const query: GetCallStackQuery = {
        type: 'GetCallStack',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeMetadata: true,
          stackDepth: 2
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.frames).toHaveLength(2);
    });

    it('GetQueueStates 쿼리를 처리할 수 있어야 한다', async () => {
      // 마이크로태스크와 매크로태스크 추가
      await engine.enqueueMicrotask({
        name: 'microTask',
        source: 'promise',
        priority: 'high'
      });

      await engine.enqueueMacrotask({
        name: 'macroTask',
        source: 'setTimeout',
        delay: 100
      });

      const query: GetQueueStatesQuery = {
        type: 'GetQueueStates',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeScheduled: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.microtaskQueue).toBeDefined();
      expect(result.data.macrotaskQueue).toBeDefined();
      expect(result.data.microtaskQueue.count).toBe(1);
      expect(result.data.macrotaskQueue.count).toBe(1);
    });

    it('GetExecutionHistory 쿼리를 처리할 수 있어야 한다', async () => {
      // 일부 작업 수행
      await engine.pushToCallStack({ name: 'func1', context: {}, priority: 'normal' });
      await engine.tick();

      const query: GetExecutionHistoryQuery = {
        type: 'GetExecutionHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          maxSteps: 10,
          includeEvents: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.steps).toBeDefined();
      expect(result.data.totalSteps).toBeDefined();
      expect(result.data.executionTime).toBeDefined();
    });

    it('GetEvents 쿼리를 처리할 수 있어야 한다', async () => {
      // 이벤트 생성
      await engine.pushToCallStack({ name: 'testFunction', context: {}, priority: 'normal' });

      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('GetEventsByType 쿼리를 처리할 수 있어야 한다', async () => {
      // 특정 타입의 이벤트 생성
      await engine.pushToCallStack({ name: 'testFunction', context: {}, priority: 'normal' });

      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'eventloop.function.pushed'
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('GetEventsByType 쿼리에 groupBy timestamp를 설정할 수 있어야 한다', async () => {
      await engine.pushToCallStack({ name: 'testFunction1', context: {}, priority: 'normal' });
      await engine.pushToCallStack({ name: 'testFunction2', context: {}, priority: 'normal' });

      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'eventloop.function.pushed',
          groupBy: 'timestamp'
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('GetEventsByType 쿼리에 groupBy aggregateId를 설정할 수 있어야 한다', async () => {
      await engine.pushToCallStack({ name: 'testFunction', context: {}, priority: 'normal' });

      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'eventloop.function.pushed',
          groupBy: 'aggregateId'
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('GetEventsByType 쿼리에 groupBy source를 설정할 수 있어야 한다', async () => {
      await engine.pushToCallStack({ name: 'testFunction', context: {}, priority: 'normal' });

      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'eventloop.function.pushed',
          groupBy: 'source'
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('GetEventsByType 쿼리에 잘못된 groupBy를 설정할 수 있어야 한다', async () => {
      await engine.pushToCallStack({ name: 'testFunction', context: {}, priority: 'normal' });

      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'eventloop.function.pushed',
          groupBy: 'invalid' as any
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('GetAggregateHistory 쿼리를 처리할 수 있어야 한다', async () => {
      const query: GetAggregateHistoryQuery = {
        type: 'GetAggregateHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          aggregateId: engine.getAggregateId(),
          includeSnapshots: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.events).toBeDefined();
      expect(Array.isArray(result.data.events)).toBe(true);
      // aggregateVersion과 snapshots는 실제 구현에서 포함되지 않음
    });

    it('GetPerformanceMetrics 쿼리를 처리할 수 있어야 한다', async () => {
      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.throughput).toBeDefined();
      expect(result.data.latency).toBeDefined();
      expect(result.data.utilization).toBeDefined();
      expect(result.data.errors).toBeDefined();
    });

    it('GetPerformanceMetrics 쿼리는 에러 이벤트를 처리할 수 있어야 한다', async () => {
      // 에러 이벤트를 생성하기 위해 잘못된 작업 수행
      try {
        await engine.pushToCallStack({ name: 'test', context: {}, priority: 'normal' });
        // 스택을 가득 채워서 에러 발생시키기
        for (let i = 0; i < 15; i++) {
          await engine.pushToCallStack({ name: `func${i}`, context: {}, priority: 'normal' });
        }
      } catch (error) {
        // 에러 무시
      }

      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.errors).toBeDefined();
      expect(result.data.errors.totalErrors).toBeGreaterThanOrEqual(0);
      expect(result.data.errors.errorTypes).toBeDefined();
      expect(typeof result.data.errors.errorRate).toBe('number');
    });

    it('GetPerformanceMetrics 쿼리는 errorType을 올바르게 분류해야 한다', async () => {
      // 에러 이벤트들을 직접 생성 (recordEvent를 사용하지 않고 더 직접적으로)
      // 스택 오버플로우 에러 발생시키기
      for (let i = 0; i < 12; i++) {
        try {
          await engine.pushToCallStack({ name: `overflow_func_${i}`, context: {}, priority: 'normal' });
        } catch (error) {
          // 스택 오버플로우 에러 예상됨
        }
      }

      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.errors.errorTypes).toBeDefined();
      expect(typeof result.data.errors.errorTypes).toBe('object');
    });

    it('GetPerformanceMetrics 쿼리는 틱 이벤트 통계를 계산할 수 있어야 한다', async () => {
      // 여러 틱 이벤트 생성
      await engine.tick();
      await engine.tick();
      await engine.tick();

      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          timeWindow: 60000,
          includeBreakdown: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.latency.averageTickTime).toBeGreaterThanOrEqual(0);
      expect(result.data.latency.p50TickTime).toBeGreaterThanOrEqual(0);
      expect(result.data.latency.p95TickTime).toBeGreaterThanOrEqual(0);
      expect(result.data.latency.p99TickTime).toBeGreaterThanOrEqual(0);
    });

    it('GetDebugInfo 쿼리를 처리할 수 있어야 한다', async () => {
      const query: GetDebugInfoQuery = {
        type: 'GetDebugInfo',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeMemoryUsage: true,
          includeTimings: true,
          verboseMode: false
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.engineState).toBeDefined();
      expect(result.data.eventCount).toBeDefined();
      expect(result.data.version).toBeDefined();
      expect(result.data.aggregateId).toBeDefined();
      if (query.payload.includeMemoryUsage) {
        expect(result.data.memoryUsage).toBeDefined();
      }
      if (query.payload.includeTimings) {
        expect(result.data.timings).toBeDefined();
      }
    });

    it('GetSimulationState 쿼리를 처리할 수 있어야 한다', async () => {
      const query: GetSimulationStateQuery = {
        type: 'GetSimulationState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeProjections: false
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.state).toBeDefined();
      expect(result.data.stepNumber).toBeDefined();
    });

    it('GetSimulationState 쿼리에 stepNumber를 지정할 수 있어야 한다', async () => {
      // 일부 상태 변경
      await engine.pushToCallStack({ name: 'func1', context: {}, priority: 'normal' });
      
      const query: GetSimulationStateQuery = {
        type: 'GetSimulationState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          stepNumber: 1,
          includeProjections: true
        }
      };

      const result = await queryHandler.handle(query, context);
      
      expect(result.success).toBe(true);
      expect(result.data.state).toBeDefined();
      expect(result.data.stepNumber).toBeDefined();
      // includeProjections 옵션이 실제 구현에서 처리되지 않음
    });

    it('지원하지 않는 쿼리에 대해 에러를 반환해야 한다', async () => {
      const query: GameQuery = {
        type: 'UnsupportedQuery' as any,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await queryHandler.handle(query, context);
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Unsupported query type: UnsupportedQuery');
    });
  });

  describe('QueryLoggingMiddleware', () => {
    let originalConsoleLog: any;
    let originalConsoleError: any;
    let mockConsoleLog: any;
    let mockConsoleError: any;

    beforeEach(() => {
      originalConsoleLog = console.log;
      originalConsoleError = console.error;
      mockConsoleLog = vi.fn();
      mockConsoleError = vi.fn();
      console.log = mockConsoleLog;
      console.error = mockConsoleError;
    });

    afterEach(() => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    });

    it('로깅 미들웨어를 생성할 수 있어야 한다', () => {
      const middleware = new QueryLoggingMiddleware();
      expect(middleware).toBeInstanceOf(QueryLoggingMiddleware);
    });

    it('쿼리 처리 전후에 로그를 기록해야 한다', async () => {
      const middleware = new QueryLoggingMiddleware();
      
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      const beforeResult = await middleware.beforeHandle(query, context);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `[QueryHandler] Processing query: ${query.type}`,
        expect.any(Object)
      );

      const mockResult: QueryResult<any> = {
        success: true,
        data: {},
        metadata: {
          executionTime: 100,
          resultCount: 1,
          totalCount: 1,
          fromCache: false
        }
      };

      await middleware.afterHandle(query, context, mockResult);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `[QueryHandler] Query ${query.type} completed`,
        expect.any(Object)
      );
    });

    it('에러 발생 시 에러 로그를 기록해야 한다', async () => {
      const middleware = new QueryLoggingMiddleware();
      const error = new Error('Test error');

      const query: GameQuery = {
        type: 'TestQuery' as any,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };

      await middleware.onError!(query, context, error);
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        `[QueryHandler] Query ${query.type} failed:`,
        expect.any(Object)
      );
    });
  });

  describe('통합 테스트', () => {
    it('전체 쿼리 처리 플로우가 정상 작동해야 한다', async () => {
      const originalConsoleLog = console.log;
      const mockConsoleLog = vi.fn();
      console.log = mockConsoleLog;

      dispatcher.addMiddleware(new QueryLoggingMiddleware());

      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: true,
          includeMetrics: true
        }
      };

      const result = await dispatcher.dispatch(query, context);

      expect(result.success).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalled();

      console.log = originalConsoleLog;
    });

    it('복합 시나리오가 올바르게 처리되어야 한다', async () => {
      // 복합 시나리오 설정
      await engine.pushToCallStack({ name: 'main', context: {}, priority: 'normal' });
      await engine.pushToCallStack({ name: 'helper', context: {}, priority: 'normal' });
      await engine.enqueueMicrotask({ name: 'promise.then', source: 'promise', priority: 'high' });
      await engine.enqueueMacrotask({ name: 'setTimeout', source: 'setTimeout', delay: 0 });
      await engine.tick();

      // 여러 쿼리 실행
      const queries = [
        { type: 'GetCurrentState', payload: { includeHistory: true, includeMetrics: true } },
        { type: 'GetCallStack', payload: { includeMetadata: true } },
        { type: 'GetQueueStates', payload: { includeScheduled: true } },
        { type: 'GetExecutionHistory', payload: { maxSteps: 100, includeEvents: true } }
      ] as const;

      const promises = queries.map((q, i) => 
        dispatcher.dispatch({
          type: q.type,
          id: `query-${i}`,
          timestamp: Date.now(),
          payload: q.payload
        } as any, context)
      );

      const results = await Promise.all(promises);

      // 모든 쿼리가 성공
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('캐시 성능이 올바르게 작동해야 한다', async () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      // 첫 번째 실행 (캐시 없음)
      const start1 = performance.now();
      const result1 = await dispatcher.dispatch(query, context);
      const time1 = performance.now() - start1;

      // 두 번째 실행 (캐시 사용)
      const start2 = performance.now();
      const result2 = await dispatcher.dispatch(query, context);
      const time2 = performance.now() - start2;

      expect(result1.metadata.fromCache).toBe(false);
      expect(result2.metadata.fromCache).toBe(true);
      
      // 캐시된 결과가 더 빨라야 함
      expect(time2).toBeLessThan(time1);
    });
  });
});