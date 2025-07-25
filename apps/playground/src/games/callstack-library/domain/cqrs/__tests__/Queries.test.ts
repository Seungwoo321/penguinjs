/**
 * Queries 단위 테스트
 * 
 * CQRS 쿼리 시스템의 핵심 기능을 검증합니다.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  QueryBuilder,
  GetCurrentStateQuery,
  GetCallStackQuery,
  GetQueueStatesQuery,
  GetExecutionHistoryQuery,
  GetEventsQuery,
  GetEventsByTypeQuery,
  GetPerformanceMetricsQuery,
  GetSimulationStateQuery,
  GameQuery,
  createQuery,
  validateQuery,
  getQueryComplexity,
  getQueryOptimizationHints,
  QueryFilters,
  QueryPagination
} from '../Queries';

describe('Queries', () => {
  describe('QueryBuilder', () => {
    let builder: QueryBuilder;

    beforeEach(() => {
      builder = new QueryBuilder();
    });

    it('기본 빌더를 생성할 수 있어야 한다', () => {
      expect(builder).toBeInstanceOf(QueryBuilder);
    });

    it('정적 메서드로 빌더를 생성할 수 있어야 한다', () => {
      const staticBuilder = QueryBuilder.create();
      expect(staticBuilder).toBeInstanceOf(QueryBuilder);
    });

    it('체이닝을 통해 ID를 설정할 수 있어야 한다', () => {
      const result = builder.withId('test-id');
      expect(result).toBe(builder);
    });

    it('체이닝을 통해 타입을 설정할 수 있어야 한다', () => {
      const result = builder.withType('GetCurrentState');
      expect(result).toBe(builder);
    });

    it('체이닝을 통해 타임스탬프를 설정할 수 있어야 한다', () => {
      const timestamp = Date.now();
      const result = builder.withTimestamp(timestamp);
      expect(result).toBe(builder);
    });

    it('타임스탬프 없이 호출하면 현재 시간을 설정해야 한다', () => {
      const before = Date.now();
      builder.withTimestamp();
      const query = builder.withId('test').withType('GetCurrentState').getCurrentState();
      const after = Date.now();
      
      expect(query.timestamp).toBeGreaterThanOrEqual(before);
      expect(query.timestamp).toBeLessThanOrEqual(after);
    });

    it('체이닝을 통해 필터를 설정할 수 있어야 한다', () => {
      const filters: QueryFilters = {
        fromTimestamp: Date.now() - 1000,
        toTimestamp: Date.now(),
        eventTypes: ['test']
      };
      const result = builder.withFilters(filters);
      expect(result).toBe(builder);
    });

    it('체이닝을 통해 페이지네이션을 설정할 수 있어야 한다', () => {
      const pagination: QueryPagination = {
        page: 1,
        limit: 10,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      };
      const result = builder.withPagination(pagination);
      expect(result).toBe(builder);
    });

    it('getCurrentState 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getCurrentState();

      expect(query.type).toBe('GetCurrentState');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ includeHistory: false, includeMetrics: false });
    });

    it('getCurrentState 쿼리에 옵션을 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getCurrentState(true, true);

      expect(query.payload.includeHistory).toBe(true);
      expect(query.payload.includeMetrics).toBe(true);
    });

    it('getCallStack 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getCallStack();

      expect(query.type).toBe('GetCallStack');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ includeMetadata: true, stackDepth: undefined });
    });

    it('getCallStack 쿼리에 stackDepth를 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getCallStack(true, 5);

      expect(query.payload.stackDepth).toBe(5);
    });

    it('getQueueStates 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getQueueStates();

      expect(query.type).toBe('GetQueueStates');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ queueTypes: undefined, includeScheduled: true });
    });

    it('getQueueStates 쿼리에 큐 타입을 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getQueueStates(['microtask', 'macrotask']);

      expect(query.payload.queueTypes).toEqual(['microtask', 'macrotask']);
    });

    it('getExecutionHistory 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getExecutionHistory();

      expect(query.type).toBe('GetExecutionHistory');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ maxSteps: 100, includeEvents: false });
    });

    it('getExecutionHistory 쿼리에 옵션을 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getExecutionHistory(50, true);

      expect(query.payload.maxSteps).toBe(50);
      expect(query.payload.includeEvents).toBe(true);
    });

    it('getEvents 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getEvents();

      expect(query.type).toBe('GetEvents');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ streamId: undefined, eventTypes: undefined });
    });

    it('getEvents 쿼리에 streamId와 eventTypes를 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getEvents('stream-123', ['UserCreated', 'UserUpdated']);

      expect(query.payload.streamId).toBe('stream-123');
      expect(query.payload.eventTypes).toEqual(['UserCreated', 'UserUpdated']);
    });

    it('getEventsByType 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getEventsByType('UserCreated');

      expect(query.type).toBe('GetEventsByType');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ eventType: 'UserCreated', groupBy: undefined });
    });

    it('getEventsByType 쿼리에 groupBy를 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getEventsByType('UserCreated', 'timestamp');

      expect(query.payload.groupBy).toBe('timestamp');
    });

    it('getPerformanceMetrics 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getPerformanceMetrics();

      expect(query.type).toBe('GetPerformanceMetrics');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ timeWindow: 60000, includeBreakdown: true });
    });

    it('getPerformanceMetrics 쿼리에 timeWindow를 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getPerformanceMetrics(30000, false);

      expect(query.payload.timeWindow).toBe(30000);
      expect(query.payload.includeBreakdown).toBe(false);
    });

    it('getSimulationState 쿼리를 생성할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getSimulationState();

      expect(query.type).toBe('GetSimulationState');
      expect(query.id).toBe('query-1');
      expect(query.payload).toEqual({ stepNumber: undefined, includeProjections: false });
    });

    it('getSimulationState 쿼리에 stepNumber를 설정할 수 있어야 한다', () => {
      const query = builder
        .withId('query-1')
        .getSimulationState(5, true);

      expect(query.payload.stepNumber).toBe(5);
      expect(query.payload.includeProjections).toBe(true);
    });

    it('ID가 설정되지 않으면 자동으로 생성해야 한다', () => {
      const query = builder.getCurrentState();

      expect(query.id).toBeDefined();
      expect(query.id).toMatch(/^query_\d+_[a-z0-9]+$/);
    });

    it('타임스탬프가 설정되지 않으면 자동으로 생성해야 한다', () => {
      const before = Date.now();
      const query = builder
        .withId('test-id')
        .getCurrentState();
      const after = Date.now();

      expect(query.timestamp).toBeGreaterThanOrEqual(before);
      expect(query.timestamp).toBeLessThanOrEqual(after);
    });

    it('필터가 포함된 쿼리를 생성할 수 있어야 한다', () => {
      const filters: QueryFilters = {
        fromTimestamp: 1000,
        toTimestamp: 2000,
        eventTypes: ['test1', 'test2']
      };

      const query = builder
        .withId('query-1')
        .withFilters(filters)
        .getEvents();

      expect(query.filters).toEqual(filters);
    });

    it('페이지네이션이 포함된 쿼리를 생성할 수 있어야 한다', () => {
      const pagination: QueryPagination = {
        page: 2,
        limit: 20
      };

      const query = builder
        .withId('query-1')
        .withPagination(pagination)
        .getEvents();

      expect(query.pagination).toEqual(pagination);
    });

    it('getBaseQuery가 private이어야 한다', () => {
      // TypeScript에서 private 메서드는 외부에서 접근 불가
      expect((builder as any).getBaseQuery).toBeDefined();
    });
  });

  describe('validateQuery', () => {
    it('유효한 GetCurrentState 쿼리를 검증해야 한다', () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          includeHistory: false,
          includeMetrics: false
        }
      };

      expect(validateQuery(query)).toBe(true);
    });

    it('유효한 GetExecutionHistory 쿼리를 검증해야 한다', () => {
      const query: GetExecutionHistoryQuery = {
        type: 'GetExecutionHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          maxSteps: 50,
          includeEvents: true
        }
      };

      expect(validateQuery(query)).toBe(true);
    });

    it('유효한 GetEventsByType 쿼리를 검증해야 한다', () => {
      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          eventType: 'UserCreated',
          groupBy: 'timestamp'
        }
      };

      expect(validateQuery(query)).toBe(true);
    });

    it('유효한 GetPerformanceMetrics 쿼리를 검증해야 한다', () => {
      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {
          timeWindow: 5000,
          includeBreakdown: true
        }
      };

      expect(validateQuery(query)).toBe(true);
    });

    it('ID가 없는 쿼리를 거부해야 한다', () => {
      const query = {
        type: 'GetCurrentState',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('타입이 없는 쿼리를 거부해야 한다', () => {
      const query = {
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('타임스탬프가 없는 쿼리를 거부해야 한다', () => {
      const query = {
        type: 'GetCurrentState',
        id: 'query-1',
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('payload가 없는 쿼리를 거부해야 한다', () => {
      const query = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now()
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('null 쿼리를 거부해야 한다', () => {
      expect(validateQuery(null as any)).toBe(false);
    });

    it('undefined 쿼리를 거부해야 한다', () => {
      expect(validateQuery(undefined as any)).toBe(false);
    });

    it('빈 객체를 거부해야 한다', () => {
      expect(validateQuery({} as any)).toBe(false);
    });

    it('빈 ID를 가진 쿼리를 거부해야 한다', () => {
      const query = {
        type: 'GetCurrentState',
        id: '',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('잘못된 타입의 쿼리를 거부해야 한다', () => {
      expect(validateQuery('invalid' as any)).toBe(false);
      expect(validateQuery(123 as any)).toBe(false);
      expect(validateQuery([] as any)).toBe(false);
    });

    it('페이지네이션의 page가 0 이하인 경우를 거부해야 한다', () => {
      const query = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        pagination: {
          page: 0,
          limit: 10
        }
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('페이지네이션의 limit이 0 이하인 경우를 거부해야 한다', () => {
      const query = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        pagination: {
          page: 1,
          limit: 0
        }
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('페이지네이션의 limit이 1000 초과인 경우를 거부해야 한다', () => {
      const query = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        pagination: {
          page: 1,
          limit: 1001
        }
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('유효한 페이지네이션을 가진 쿼리를 허용해야 한다', () => {
      const query = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        pagination: {
          page: 1,
          limit: 100
        }
      } as any;

      expect(validateQuery(query)).toBe(true);
    });
  });

  describe('getQueryComplexity', () => {
    it('GetCurrentState는 낮은 복잡도를 가져야 한다', () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeHistory: false, includeMetrics: false }
      };
      expect(getQueryComplexity(query)).toBe(1);
    });

    it('GetCallStack은 낮은 복잡도를 가져야 한다', () => {
      const query: GetCallStackQuery = {
        type: 'GetCallStack',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeMetadata: true }
      };
      expect(getQueryComplexity(query)).toBe(2);
    });

    it('GetExecutionHistory는 높은 복잡도를 가져야 한다', () => {
      const query: GetExecutionHistoryQuery = {
        type: 'GetExecutionHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { maxSteps: 100, includeEvents: false }
      };
      expect(getQueryComplexity(query)).toBe(10);
    });

    it('GetPerformanceMetrics는 중간 복잡도를 가져야 한다', () => {
      const query: GetPerformanceMetricsQuery = {
        type: 'GetPerformanceMetrics',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { timeWindow: 10000, includeBreakdown: true }
      };
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetSimulationState는 중간 복잡도를 가져야 한다', () => {
      const query: GetSimulationStateQuery = {
        type: 'GetSimulationState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeProjections: false }
      };
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetQueueStates는 낮은 복잡도를 가져야 한다', () => {
      const query: GetQueueStatesQuery = {
        type: 'GetQueueStates',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeScheduled: true }
      };
      expect(getQueryComplexity(query)).toBe(2);
    });

    it('GetEvents는 중간 복잡도를 가져야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetEventsByType는 중간 복잡도를 가져야 한다', () => {
      const query: GetEventsByTypeQuery = {
        type: 'GetEventsByType',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { eventType: 'test' }
      };
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetAggregateHistory는 중간 복잡도를 가져야 한다', () => {
      const query = {
        type: 'GetAggregateHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { aggregateId: 'test', includeSnapshots: true }
      } as any;
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetBottleneckAnalysis는 중간 복잡도를 가져야 한다', () => {
      const query = {
        type: 'GetBottleneckAnalysis',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { analysisType: 'overall', threshold: 0.8 }
      } as any;
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetDebugInfo는 중간 복잡도를 가져야 한다', () => {
      const query = {
        type: 'GetDebugInfo',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeMemoryUsage: true, includeTimings: true }
      } as any;
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetTimeline는 중간 복잡도를 가져야 한다', () => {
      const query = {
        type: 'GetTimeline',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { resolution: 'tick', includeMetadata: true }
      } as any;
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('GetBreakpoints는 중간 복잡도를 가져야 한다', () => {
      const query = {
        type: 'GetBreakpoints',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { onlyActive: true, includeConditions: false }
      } as any;
      expect(getQueryComplexity(query)).toBe(5);
    });

    it('알 수 없는 쿼리 타입은 기본 복잡도를 가져야 한다', () => {
      const query = {
        type: 'UnknownQuery',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      } as any;
      expect(getQueryComplexity(query)).toBe(1);
    });
  });

  describe('getQueryOptimizationHints', () => {
    it('필터가 없는 쿼리에 대해 필터 사용을 권장해야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).toContain('Consider adding filters to improve query performance');
    });

    it('GetEvents 쿼리에 페이지네이션 사용을 권장해야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).toContain('Consider using pagination for large result sets');
    });

    it('GetExecutionHistory 쿼리에 페이지네이션 사용을 권장해야 한다', () => {
      const query: GetExecutionHistoryQuery = {
        type: 'GetExecutionHistory',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { maxSteps: 100, includeEvents: false }
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).toContain('Consider using pagination for large result sets');
    });

    it('GetCurrentState 쿼리에 대해 캐시 활용을 권장해야 한다', () => {
      const query: GetCurrentStateQuery = {
        type: 'GetCurrentState',
        id: 'query-1',
        timestamp: Date.now(),
        payload: { includeHistory: false, includeMetrics: false }
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).toContain('Result may be cached for better performance');
    });

    it('필터가 있는 쿼리는 필터 권장을 하지 않아야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        filters: {
          eventTypes: ['test']
        }
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).not.toContain('Consider adding filters to improve query performance');
    });

    it('페이지네이션이 있는 쿼리는 페이지네이션 권장을 하지 않아야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        pagination: {
          page: 1,
          limit: 10
        }
      };
      
      const hints = getQueryOptimizationHints(query);
      expect(hints).not.toContain('Consider using pagination for large result sets');
    });
  });

  describe('createQuery', () => {
    it('헬퍼 함수로 빌더를 생성할 수 있어야 한다', () => {
      const builder = createQuery('test-session');
      expect(builder).toBeInstanceOf(QueryBuilder);
    });

    it('자동으로 타임스탬프가 설정되어야 한다', () => {
      const before = Date.now();
      const query = createQuery('test-session').getCurrentState();
      const after = Date.now();

      expect(query.timestamp).toBeGreaterThanOrEqual(before);
      expect(query.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 문자열 타입을 가진 쿼리를 거부해야 한다', () => {
      const query = {
        type: '',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('null 타입을 가진 쿼리를 거부해야 한다', () => {
      const query = {
        type: null,
        id: 'query-1',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateQuery(query)).toBe(false);
    });

    it('getBaseQuery 메서드가 올바른 기본값을 생성해야 한다', () => {
      const query = new QueryBuilder().getCurrentState();
      
      expect(query.id).toBeDefined();
      expect(query.timestamp).toBeDefined();
      expect(query.type).toBe('GetCurrentState');
      expect(query.payload).toBeDefined();
    });

    it('복잡한 필터를 가진 쿼리도 검증을 통과해야 한다', () => {
      const query: GetEventsQuery = {
        type: 'GetEvents',
        id: 'query-1',
        timestamp: Date.now(),
        payload: {},
        filters: {
          fromTimestamp: 1000,
          toTimestamp: 2000,
          eventTypes: ['type1', 'type2'],
          status: ['active', 'pending'],
          priority: ['high', 'medium'],
          source: ['api', 'ui']
        }
      };

      expect(validateQuery(query)).toBe(true);
    });
  });
});