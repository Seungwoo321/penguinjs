/**
 * CQRS Queries - 상태를 조회하는 쿼리들
 * 
 * Query 패턴과 CQRS를 적용하여 읽기 전용 작업을 최적화
 * 각 쿼리는 특정 목적에 맞게 최적화된 읽기 모델을 제공
 */

import { CallStackFrame, MicrotaskItem, MacrotaskItem, EventLoopState } from '../event-loop/types';

// 기본 쿼리 인터페이스
export interface Query {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly filters?: QueryFilters;
  readonly pagination?: QueryPagination;
}

// 쿼리 필터
export interface QueryFilters {
  readonly fromTimestamp?: number;
  readonly toTimestamp?: number;
  readonly eventTypes?: string[];
  readonly status?: string[];
  readonly priority?: string[];
  readonly source?: string[];
}

// 쿼리 페이징
export interface QueryPagination {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// 쿼리 결과
export interface QueryResult<T> {
  readonly success: boolean;
  readonly data: T;
  readonly metadata: QueryResultMetadata;
  readonly error?: Error;
}

// 쿼리 결과 메타데이터
export interface QueryResultMetadata {
  readonly executionTime: number;
  readonly resultCount: number;
  readonly totalCount: number;
  readonly fromCache: boolean;
  readonly cacheHit?: boolean;
}

// === 상태 조회 쿼리들 ===

export interface GetCurrentStateQuery extends Query {
  type: 'GetCurrentState';
  payload: {
    includeHistory?: boolean;
    includeMetrics?: boolean;
  };
}

export interface GetCallStackQuery extends Query {
  type: 'GetCallStack';
  payload: {
    includeMetadata?: boolean;
    stackDepth?: number;
  };
}

export interface GetQueueStatesQuery extends Query {
  type: 'GetQueueStates';
  payload: {
    queueTypes?: ('microtask' | 'macrotask')[];
    includeScheduled?: boolean;
  };
}

export interface GetExecutionHistoryQuery extends Query {
  type: 'GetExecutionHistory';
  payload: {
    maxSteps?: number;
    includeEvents?: boolean;
    stepRange?: {
      from: number;
      to: number;
    };
  };
}

// === 이벤트 조회 쿼리들 ===

export interface GetEventsQuery extends Query {
  type: 'GetEvents';
  payload: {
    streamId?: string;
    eventTypes?: string[];
    fromVersion?: number;
    toVersion?: number;
  };
}

export interface GetEventsByTypeQuery extends Query {
  type: 'GetEventsByType';
  payload: {
    eventType: string;
    groupBy?: 'timestamp' | 'aggregateId' | 'source';
  };
}

export interface GetAggregateHistoryQuery extends Query {
  type: 'GetAggregateHistory';
  payload: {
    aggregateId: string;
    includeSnapshots?: boolean;
  };
}

// === 분석 및 메트릭 쿼리들 ===

export interface GetPerformanceMetricsQuery extends Query {
  type: 'GetPerformanceMetrics';
  payload: {
    timeWindow?: number; // 밀리초
    includeBreakdown?: boolean;
  };
}

export interface GetBottleneckAnalysisQuery extends Query {
  type: 'GetBottleneckAnalysis';
  payload: {
    analysisType: 'callstack' | 'microtask' | 'macrotask' | 'overall';
    threshold?: number;
  };
}

export interface GetDebugInfoQuery extends Query {
  type: 'GetDebugInfo';
  payload: {
    includeMemoryUsage?: boolean;
    includeTimings?: boolean;
    verboseMode?: boolean;
  };
}

// === 시뮬레이션 관련 쿼리들 ===

export interface GetSimulationStateQuery extends Query {
  type: 'GetSimulationState';
  payload: {
    stepNumber?: number;
    includeProjections?: boolean;
  };
}

export interface GetTimelineQuery extends Query {
  type: 'GetTimeline';
  payload: {
    resolution: 'tick' | 'event' | 'phase';
    includeMetadata?: boolean;
  };
}

export interface GetBreakpointsQuery extends Query {
  type: 'GetBreakpoints';
  payload: {
    onlyActive?: boolean;
    includeConditions?: boolean;
  };
}

// 모든 쿼리 타입의 유니온
export type GameQuery = 
  | GetCurrentStateQuery
  | GetCallStackQuery
  | GetQueueStatesQuery
  | GetExecutionHistoryQuery
  | GetEventsQuery
  | GetEventsByTypeQuery
  | GetAggregateHistoryQuery
  | GetPerformanceMetricsQuery
  | GetBottleneckAnalysisQuery
  | GetDebugInfoQuery
  | GetSimulationStateQuery
  | GetTimelineQuery
  | GetBreakpointsQuery;

// === 읽기 모델 (Read Models) ===

// 현재 상태 읽기 모델
export interface CurrentStateReadModel {
  readonly eventLoopState: EventLoopState;
  readonly metrics: {
    readonly totalTicks: number;
    readonly averageTickTime: number;
    readonly queueUtilization: {
      callstack: number;
      microtask: number;
      macrotask: number;
    };
  };
  readonly lastUpdated: number;
}

// 콜스택 읽기 모델
export interface CallStackReadModel {
  readonly frames: ReadonlyArray<CallStackFrame>;
  readonly depth: number;
  readonly maxDepthReached: number;
  readonly averageDepth: number;
  readonly topFrame?: CallStackFrame;
}

// 큐 상태 읽기 모델
export interface QueueStatesReadModel {
  readonly microtaskQueue: {
    readonly items: ReadonlyArray<MicrotaskItem>;
    readonly count: number;
    readonly pendingCount: number;
    readonly priorityDistribution: Record<string, number>;
  };
  readonly macrotaskQueue: {
    readonly items: ReadonlyArray<MacrotaskItem>;
    readonly count: number;
    readonly scheduledCount: number;
    readonly averageDelay: number;
  };
}

// 실행 히스토리 읽기 모델
export interface ExecutionHistoryReadModel {
  readonly steps: ReadonlyArray<{
    readonly stepNumber: number;
    readonly timestamp: number;
    readonly phase: string;
    readonly action: string;
    readonly context: Record<string, any>;
  }>;
  readonly totalSteps: number;
  readonly executionTime: number;
  readonly phaseDistribution: Record<string, number>;
}

// 성능 메트릭 읽기 모델
export interface PerformanceMetricsReadModel {
  readonly throughput: {
    readonly ticksPerSecond: number;
    readonly tasksProcessedPerSecond: number;
    readonly eventsPerSecond: number;
  };
  readonly latency: {
    readonly averageTickTime: number;
    readonly p50TickTime: number;
    readonly p95TickTime: number;
    readonly p99TickTime: number;
  };
  readonly utilization: {
    readonly cpuUsage: number;
    readonly memoryUsage: number;
    readonly queueUtilization: Record<string, number>;
  };
  readonly errors: {
    readonly totalErrors: number;
    readonly errorRate: number;
    readonly errorTypes: Record<string, number>;
  };
}

// Mutable 버전의 Query 타입 (빌더 패턴용)
type MutableQuery = {
  -readonly [K in keyof Query]: Query[K];
};

// 쿼리 빌더
export class QueryBuilder {
  private query: Partial<MutableQuery> = {};

  static create(): QueryBuilder {
    return new QueryBuilder();
  }

  withId(id: string): QueryBuilder {
    this.query.id = id;
    return this;
  }

  withType(type: string): QueryBuilder {
    this.query.type = type;
    return this;
  }

  withTimestamp(timestamp?: number): QueryBuilder {
    this.query.timestamp = timestamp ?? Date.now();
    return this;
  }

  withFilters(filters: QueryFilters): QueryBuilder {
    this.query.filters = filters;
    return this;
  }

  withPagination(pagination: QueryPagination): QueryBuilder {
    this.query.pagination = pagination;
    return this;
  }

  // 특정 쿼리 타입별 빌더 메서드들
  getCurrentState(includeHistory = false, includeMetrics = false): GetCurrentStateQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetCurrentState',
      payload: { includeHistory, includeMetrics }
    } as GetCurrentStateQuery;
  }

  getCallStack(includeMetadata = true, stackDepth?: number): GetCallStackQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetCallStack',
      payload: { includeMetadata, stackDepth }
    } as GetCallStackQuery;
  }

  getQueueStates(queueTypes?: ('microtask' | 'macrotask')[], includeScheduled = true): GetQueueStatesQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetQueueStates',
      payload: { queueTypes, includeScheduled }
    } as GetQueueStatesQuery;
  }

  getExecutionHistory(maxSteps = 100, includeEvents = false): GetExecutionHistoryQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetExecutionHistory',
      payload: { maxSteps, includeEvents }
    } as GetExecutionHistoryQuery;
  }

  getEvents(streamId?: string, eventTypes?: string[]): GetEventsQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetEvents',
      payload: { streamId, eventTypes }
    } as GetEventsQuery;
  }

  getEventsByType(eventType: string, groupBy?: 'timestamp' | 'aggregateId' | 'source'): GetEventsByTypeQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetEventsByType',
      payload: { eventType, groupBy }
    } as GetEventsByTypeQuery;
  }

  getPerformanceMetrics(timeWindow = 60000, includeBreakdown = true): GetPerformanceMetricsQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetPerformanceMetrics',
      payload: { timeWindow, includeBreakdown }
    } as GetPerformanceMetricsQuery;
  }

  getSimulationState(stepNumber?: number, includeProjections = false): GetSimulationStateQuery {
    return {
      ...this.getBaseQuery(),
      type: 'GetSimulationState',
      payload: { stepNumber, includeProjections }
    } as GetSimulationStateQuery;
  }

  private getBaseQuery(): Query {
    if (!this.query.id) {
      this.query.id = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!this.query.timestamp) {
      this.query.timestamp = Date.now();
    }

    return this.query as Query;
  }
}

// 쿼리 생성 헬퍼 함수들
export const createQuery = (sessionId: string) => {
  return QueryBuilder.create().withTimestamp();
};

// 쿼리 검증 함수
export const validateQuery = (query: GameQuery): boolean => {
  // null/undefined 체크
  if (!query || typeof query !== 'object') {
    return false;
  }

  // 기본 필드 검증
  if (!query.id || !query.type || !query.timestamp) {
    return false;
  }

  // 페이로드 검증
  if (!query.payload) {
    return false;
  }

  // 페이징 검증
  if (query.pagination) {
    const { page, limit } = query.pagination;
    if (page < 1 || limit < 1 || limit > 1000) {
      return false;
    }
  }

  return true;
};

// 쿼리 복잡도 계산
export const getQueryComplexity = (query: GameQuery): number => {
  switch (query.type) {
    case 'GetCurrentState':
      return 1;
    case 'GetCallStack':
    case 'GetQueueStates':
      return 2;
    case 'GetEvents':
    case 'GetEventsByType':
    case 'GetPerformanceMetrics':
    case 'GetSimulationState':
      return 5;
    case 'GetExecutionHistory':
      return 10;
    case 'GetAggregateHistory':
    case 'GetBottleneckAnalysis':
    case 'GetDebugInfo':
    case 'GetTimeline':
    case 'GetBreakpoints':
      return 5;
    default:
      return 1;
  }
};

// 쿼리 최적화 힌트
export const getQueryOptimizationHints = (query: GameQuery): string[] => {
  const hints: string[] = [];

  // 필터 사용 권장
  if (!query.filters && query.type.includes('Get')) {
    hints.push('Consider adding filters to improve query performance');
  }

  // 페이징 권장
  if (!query.pagination && ['GetEvents', 'GetExecutionHistory'].includes(query.type)) {
    hints.push('Consider using pagination for large result sets');
  }

  // 캐시 활용 권장
  if (query.type === 'GetCurrentState') {
    hints.push('Result may be cached for better performance');
  }

  return hints;
};