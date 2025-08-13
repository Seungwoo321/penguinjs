/**
 * QueryHandler - CQRS 쿼리 처리기
 * 
 * 모든 읽기 전용 작업을 처리하고 최적화된 읽기 모델을 제공
 * 캐싱, 인덱싱, 프로젝션을 통한 성능 최적화
 */

import {
  GameQuery,
  QueryResult,
  QueryResultMetadata,
  GetCurrentStateQuery,
  GetCallStackQuery,
  GetQueueStatesQuery,
  GetExecutionHistoryQuery,
  GetEventsQuery,
  GetEventsByTypeQuery,
  GetAggregateHistoryQuery,
  GetPerformanceMetricsQuery,
  GetBottleneckAnalysisQuery,
  GetDebugInfoQuery,
  GetSimulationStateQuery,
  GetTimelineQuery,
  GetBreakpointsQuery,
  CurrentStateReadModel,
  CallStackReadModel,
  QueueStatesReadModel,
  ExecutionHistoryReadModel,
  PerformanceMetricsReadModel,
  validateQuery
} from './Queries';

import { EventSourcedEventLoopEngine } from '@/games/callstack-library/domain/event-sourcing/EventSourcedEventLoopEngine';
import { DomainEvent } from '@/games/callstack-library/domain/event-sourcing/EventStore';

// 쿼리 처리 컨텍스트
export interface QueryContext {
  readonly sessionId: string;
  readonly userId?: string;
  readonly source: string;
  readonly cacheEnabled?: boolean;
  readonly timeout?: number;
}

// 쿼리 처리기 인터페이스
export interface IQueryHandler<T = any> {
  handle(query: GameQuery, context: QueryContext): Promise<QueryResult<T>>;
  canHandle(queryType: string): boolean;
  getCacheKey?(query: GameQuery): string;
  getCacheTTL?(query: GameQuery): number; // 캐시 TTL (밀리초)
}

// 쿼리 디스패처
export class QueryDispatcher {
  private handlers = new Map<string, IQueryHandler>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private middleware: QueryMiddleware[] = [];

  registerHandler(queryType: string, handler: IQueryHandler): void {
    this.handlers.set(queryType, handler);
  }

  addMiddleware(middleware: QueryMiddleware): void {
    this.middleware.push(middleware);
  }

  async dispatch<T>(query: GameQuery, context: QueryContext): Promise<QueryResult<T>> {
    // 쿼리 검증
    if (!validateQuery(query)) {
      throw new Error(`Invalid query: ${query.type}`);
    }

    // 핸들러 찾기
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler found for query type: ${query.type}`);
    }

    // 캐시 확인
    const cacheKey = handler.getCacheKey?.(query);
    if (context.cacheEnabled && cacheKey) {
      const cached = this.getCachedResult<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 미들웨어 실행 (전처리)
    let processedQuery = query;
    let processedContext = context;
    
    for (const middleware of this.middleware) {
      const result = await middleware.beforeHandle(processedQuery, processedContext);
      processedQuery = result.query;
      processedContext = result.context;
    }

    try {
      const startTime = performance.now();
      
      // 쿼리 처리
      const result = await handler.handle(processedQuery, processedContext);
      
      const executionTime = performance.now() - startTime;
      
      // 메타데이터 보강
      const enhancedResult: QueryResult<T> = {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime,
          fromCache: false
        }
      };

      // 캐시 저장
      if (context.cacheEnabled && cacheKey && result.success) {
        const ttl = handler.getCacheTTL?.(processedQuery) || 30000; // 기본 30초
        this.setCachedResult(cacheKey, enhancedResult, ttl);
      }

      // 미들웨어 실행 (후처리)
      let processedResult = enhancedResult;
      for (const middleware of this.middleware) {
        processedResult = await middleware.afterHandle(processedQuery, processedContext, processedResult);
      }

      return processedResult;

    } catch (error) {
      // 에러 처리 미들웨어
      for (const middleware of this.middleware) {
        await middleware.onError?.(processedQuery, processedContext, error as Error);
      }
      throw error;
    }
  }

  private getCachedResult<T>(cacheKey: string): QueryResult<T> | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return {
      ...cached.data,
      metadata: {
        ...cached.data.metadata,
        fromCache: true,
        cacheHit: true
      }
    };
  }

  private setCachedResult<T>(cacheKey: string, result: QueryResult<T>, ttl: number): void {
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl
    });
  }

  // 캐시 관리
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 쿼리 미들웨어 인터페이스
export interface QueryMiddleware {
  beforeHandle(query: GameQuery, context: QueryContext): Promise<{
    query: GameQuery;
    context: QueryContext;
  }>;
  
  afterHandle<T>(
    query: GameQuery, 
    context: QueryContext, 
    result: QueryResult<T>
  ): Promise<QueryResult<T>>;
  
  onError?(query: GameQuery, context: QueryContext, error: Error): Promise<void>;
}

// 이벤트 루프 쿼리 처리기
export class EventLoopQueryHandler implements IQueryHandler {
  private engine: EventSourcedEventLoopEngine;

  constructor(engine: EventSourcedEventLoopEngine) {
    this.engine = engine;
  }

  canHandle(queryType: string): boolean {
    const supportedQueries = [
      'GetCurrentState',
      'GetCallStack',
      'GetQueueStates',
      'GetExecutionHistory',
      'GetEvents',
      'GetEventsByType',
      'GetAggregateHistory',
      'GetPerformanceMetrics',
      'GetBottleneckAnalysis',
      'GetDebugInfo',
      'GetSimulationState',
      'GetTimeline',
      'GetBreakpoints'
    ];
    return supportedQueries.includes(queryType);
  }

  getCacheKey(query: GameQuery): string {
    return `${query.type}_${this.engine.getAggregateId()}_${this.engine.getVersion()}`;
  }

  getCacheTTL(query: GameQuery): number {
    // 쿼리 타입별 TTL 설정
    const ttlMap: Record<string, number> = {
      'GetCurrentState': 1000,      // 1초
      'GetCallStack': 5000,         // 5초
      'GetQueueStates': 5000,       // 5초
      'GetExecutionHistory': 30000, // 30초
      'GetEvents': 60000,           // 1분
      'GetPerformanceMetrics': 10000, // 10초
      'GetDebugInfo': 5000          // 5초
    };
    
    return ttlMap[query.type] || 30000; // 기본 30초
  }

  async handle(query: GameQuery, context: QueryContext): Promise<QueryResult<any>> {
    const startTime = performance.now();
    
    try {
      let data: any;
      let resultCount = 0;
      let totalCount = 0;

      switch (query.type) {
        case 'GetCurrentState':
          data = await this.handleGetCurrentState(query as GetCurrentStateQuery);
          resultCount = 1;
          totalCount = 1;
          break;
          
        case 'GetCallStack':
          data = await this.handleGetCallStack(query as GetCallStackQuery);
          resultCount = data.frames.length;
          totalCount = data.frames.length;
          break;
          
        case 'GetQueueStates':
          data = await this.handleGetQueueStates(query as GetQueueStatesQuery);
          resultCount = data.microtaskQueue.count + data.macrotaskQueue.count;
          totalCount = resultCount;
          break;
          
        case 'GetExecutionHistory':
          data = await this.handleGetExecutionHistory(query as GetExecutionHistoryQuery);
          resultCount = data.steps.length;
          totalCount = data.totalSteps;
          break;
          
        case 'GetEvents':
          data = await this.handleGetEvents(query as GetEventsQuery);
          resultCount = data.length;
          totalCount = data.length;
          break;
          
        case 'GetEventsByType':
          data = await this.handleGetEventsByType(query as GetEventsByTypeQuery);
          resultCount = data.length;
          totalCount = data.length;
          break;
          
        case 'GetAggregateHistory':
          data = await this.handleGetAggregateHistory(query as GetAggregateHistoryQuery);
          resultCount = data.events.length;
          totalCount = data.events.length;
          break;
          
        case 'GetPerformanceMetrics':
          data = await this.handleGetPerformanceMetrics(query as GetPerformanceMetricsQuery);
          resultCount = 1;
          totalCount = 1;
          break;
          
        case 'GetDebugInfo':
          data = await this.handleGetDebugInfo(query as GetDebugInfoQuery);
          resultCount = 1;
          totalCount = 1;
          break;
          
        case 'GetSimulationState':
          data = await this.handleGetSimulationState(query as GetSimulationStateQuery);
          resultCount = 1;
          totalCount = 1;
          break;
          
        default:
          throw new Error(`Unsupported query type: ${query.type}`);
      }

      const executionTime = performance.now() - startTime;

      const metadata: QueryResultMetadata = {
        executionTime,
        resultCount,
        totalCount,
        fromCache: false
      };

      return {
        success: true,
        data,
        metadata
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        data: null,
        metadata: {
          executionTime,
          resultCount: 0,
          totalCount: 0,
          fromCache: false
        },
        error: error as Error
      };
    }
  }

  // 개별 쿼리 처리 메서드들
  private async handleGetCurrentState(query: GetCurrentStateQuery): Promise<CurrentStateReadModel> {
    const state = this.engine.getState();
    const { includeHistory, includeMetrics } = query.payload;
    
    let metrics: any = {};
    
    if (includeMetrics) {
      const events = await this.engine.getEventHistory();
      const tickEvents = events.filter(e => e.type.includes('tick'));
      
      metrics = {
        totalTicks: state.currentTick,
        averageTickTime: tickEvents.length > 0 ? 
          tickEvents.reduce((sum, e, i, arr) => {
            if (i === 0) return 0;
            return sum + (e.timestamp - arr[i-1].timestamp);
          }, 0) / (tickEvents.length - 1) : 0,
        queueUtilization: {
          callstack: state.callStack.length,
          microtask: state.microtaskQueue.length,
          macrotask: state.macrotaskQueue.length
        }
      };
    }

    return {
      eventLoopState: state,
      metrics,
      lastUpdated: Date.now()
    };
  }

  private async handleGetCallStack(query: GetCallStackQuery): Promise<CallStackReadModel> {
    const state = this.engine.getState();
    const { includeMetadata, stackDepth } = query.payload;
    
    let frames = state.callStack;
    if (stackDepth && stackDepth > 0) {
      frames = frames.slice(-stackDepth);
    }

    // 통계 계산
    const events = await this.engine.getEventHistory();
    const pushEvents = events.filter(e => e.type.includes('function.pushed'));
    const maxDepthReached = Math.max(...pushEvents.map(e => e.payload.stackSize || 0), 0);
    const averageDepth = pushEvents.length > 0 ? 
      pushEvents.reduce((sum, e) => sum + (e.payload.stackSize || 0), 0) / pushEvents.length : 0;

    return {
      frames,
      depth: frames.length,
      maxDepthReached,
      averageDepth,
      topFrame: frames.length > 0 ? frames[frames.length - 1] : undefined
    };
  }

  private async handleGetQueueStates(query: GetQueueStatesQuery): Promise<QueueStatesReadModel> {
    const state = this.engine.getState();
    const { queueTypes, includeScheduled } = query.payload;
    
    const microtasks = state.microtaskQueue;
    const macrotasks = state.macrotaskQueue;
    
    // 우선순위 분포 계산
    const priorityDistribution: Record<string, number> = {};
    microtasks.forEach(task => {
      priorityDistribution[task.priority] = (priorityDistribution[task.priority] || 0) + 1;
    });

    // 평균 지연 시간 계산
    const now = Date.now();
    const averageDelay = macrotasks.length > 0 ? 
      macrotasks.reduce((sum, task) => {
        const delay = (task.scheduledAt || now) - task.createdAt;
        return sum + delay;
      }, 0) / macrotasks.length : 0;

    return {
      microtaskQueue: {
        items: microtasks,
        count: microtasks.length,
        pendingCount: microtasks.filter(t => t.status === 'pending').length,
        priorityDistribution
      },
      macrotaskQueue: {
        items: macrotasks,
        count: macrotasks.length,
        scheduledCount: macrotasks.filter(t => t.scheduledAt && t.scheduledAt > now).length,
        averageDelay
      }
    };
  }

  private async handleGetExecutionHistory(query: GetExecutionHistoryQuery): Promise<ExecutionHistoryReadModel> {
    const { maxSteps, includeEvents, stepRange } = query.payload;
    const events = await this.engine.getEventHistory();
    
    let filteredEvents = events;
    
    // 스텝 범위 필터링
    if (stepRange) {
      filteredEvents = events.filter(e => {
        const step = e.payload.tickNumber || e.payload.stepNumber || 0;
        return step >= stepRange.from && step <= stepRange.to;
      });
    }
    
    // 최대 스텝 제한
    if (maxSteps && maxSteps > 0) {
      filteredEvents = filteredEvents.slice(-maxSteps);
    }

    // 실행 단계로 변환
    const steps = filteredEvents.map((event, index) => ({
      stepNumber: index + 1,
      timestamp: event.timestamp,
      phase: event.payload.phase || event.payload.toPhase || 'unknown',
      action: event.type,
      context: event.payload
    }));

    // 페이즈 분포 계산
    const phaseDistribution: Record<string, number> = {};
    steps.forEach(step => {
      phaseDistribution[step.phase] = (phaseDistribution[step.phase] || 0) + 1;
    });

    const executionTime = steps.length > 0 ? 
      steps[steps.length - 1].timestamp - steps[0].timestamp : 0;

    return {
      steps,
      totalSteps: events.length,
      executionTime,
      phaseDistribution
    };
  }

  private async handleGetEvents(query: GetEventsQuery): Promise<DomainEvent[]> {
    const { streamId, eventTypes, fromVersion, toVersion } = query.payload;
    
    let events: DomainEvent[];
    
    if (streamId) {
      events = await this.engine.getEventStore().getEvents(streamId, fromVersion, toVersion);
    } else {
      events = await this.engine.getEventHistory();
    }
    
    // 이벤트 타입 필터링
    if (eventTypes && eventTypes.length > 0) {
      events = events.filter(e => eventTypes.includes(e.type));
    }
    
    return events;
  }

  private async handleGetEventsByType(query: GetEventsByTypeQuery): Promise<DomainEvent[]> {
    const { eventType, groupBy } = query.payload;
    
    const events = await this.engine.getEventsByType(eventType);
    
    // 그룹별 정렬
    if (groupBy) {
      events.sort((a, b) => {
        switch (groupBy) {
          case 'timestamp':
            return a.timestamp - b.timestamp;
          case 'aggregateId':
            return a.aggregateId.localeCompare(b.aggregateId);
          case 'source':
            return (a.metadata?.source || '').localeCompare(b.metadata?.source || '');
          default:
            return 0;
        }
      });
    }
    
    return events;
  }

  private async handleGetAggregateHistory(query: GetAggregateHistoryQuery): Promise<{ events: DomainEvent[] }> {
    const { aggregateId, includeSnapshots } = query.payload;
    
    const events = await this.engine.getEventStore().getEvents(aggregateId);
    
    return { events };
  }

  private async handleGetPerformanceMetrics(query: GetPerformanceMetricsQuery): Promise<PerformanceMetricsReadModel> {
    const { timeWindow, includeBreakdown } = query.payload;
    const events = await this.engine.getEventHistory();
    
    const now = Date.now();
    const recentEvents = events.filter(e => now - e.timestamp <= timeWindow);
    
    // 기본 메트릭 계산
    const tickEvents = recentEvents.filter(e => e.type.includes('tick'));
    const errorEvents = recentEvents.filter(e => e.type.includes('error'));
    
    const throughput = {
      ticksPerSecond: tickEvents.length / (timeWindow / 1000),
      tasksProcessedPerSecond: recentEvents.filter(e => e.type.includes('executed')).length / (timeWindow / 1000),
      eventsPerSecond: recentEvents.length / (timeWindow / 1000)
    };

    // 레이턴시 계산
    const tickTimes = tickEvents.map((e, i, arr) => {
      if (i === 0) return 0;
      return e.timestamp - arr[i-1].timestamp;
    }).filter(t => t > 0);
    
    tickTimes.sort((a, b) => a - b);
    
    const latency = {
      averageTickTime: tickTimes.reduce((sum, t) => sum + t, 0) / tickTimes.length || 0,
      p50TickTime: tickTimes[Math.floor(tickTimes.length * 0.5)] || 0,
      p95TickTime: tickTimes[Math.floor(tickTimes.length * 0.95)] || 0,
      p99TickTime: tickTimes[Math.floor(tickTimes.length * 0.99)] || 0
    };

    const state = this.engine.getState();
    const utilization = {
      cpuUsage: 0, // 실제 구현에서는 performance API 사용
      memoryUsage: 0, // 실제 구현에서는 memory API 사용
      queueUtilization: {
        callstack: state.callStack.length,
        microtask: state.microtaskQueue.length,
        macrotask: state.macrotaskQueue.length
      }
    };

    // 에러 통계
    const errorTypes: Record<string, number> = {};
    errorEvents.forEach(e => {
      const errorType = e.payload.operation || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    const errors = {
      totalErrors: errorEvents.length,
      errorRate: errorEvents.length / recentEvents.length,
      errorTypes
    };

    return {
      throughput,
      latency,
      utilization,
      errors
    };
  }

  private async handleGetDebugInfo(query: GetDebugInfoQuery): Promise<any> {
    const { includeMemoryUsage, includeTimings, verboseMode } = query.payload;
    
    const state = this.engine.getState();
    const events = await this.engine.getEventHistory();
    
    return {
      engineState: state,
      eventCount: events.length,
      version: this.engine.getVersion(),
      aggregateId: this.engine.getAggregateId(),
      memoryUsage: includeMemoryUsage ? this.getMemoryUsage() : null,
      timings: includeTimings ? this.getTimingInfo(events) : null,
      verbose: verboseMode ? { events: events.slice(-10) } : null
    };
  }

  private async handleGetSimulationState(query: GetSimulationStateQuery): Promise<any> {
    const { stepNumber, includeProjections } = query.payload;
    
    if (stepNumber !== undefined) {
      const replayedState = await this.engine.replayToVersion(stepNumber);
      return { state: replayedState, stepNumber };
    }
    
    return { state: this.engine.getState(), stepNumber: this.engine.getVersion() };
  }

  private getMemoryUsage(): any {
    // 실제 구현에서는 performance.memory API 사용
    return {
      used: 0,
      total: 0,
      percentage: 0
    };
  }

  private getTimingInfo(events: DomainEvent[]): any {
    const timings = events.map((e, i, arr) => ({
      eventType: e.type,
      timestamp: e.timestamp,
      deltaTime: i > 0 ? e.timestamp - arr[i-1].timestamp : 0
    }));
    
    return {
      totalEvents: events.length,
      averageDelta: timings.reduce((sum, t) => sum + t.deltaTime, 0) / timings.length,
      timings: timings.slice(-20) // 최근 20개 이벤트
    };
  }
}

// 로깅 미들웨어
export class QueryLoggingMiddleware implements QueryMiddleware {
  async beforeHandle(query: GameQuery, context: QueryContext) {
    console.log(`[QueryHandler] Processing query: ${query.type}`, {
      queryId: query.id,
      timestamp: query.timestamp,
      context
    });
    
    return { query, context };
  }

  async afterHandle<T>(query: GameQuery, context: QueryContext, result: QueryResult<T>) {
    console.log(`[QueryHandler] Query ${query.type} completed`, {
      queryId: query.id,
      success: result.success,
      executionTime: result.metadata.executionTime,
      resultCount: result.metadata.resultCount,
      fromCache: result.metadata.fromCache
    });
    
    return result;
  }

  async onError(query: GameQuery, context: QueryContext, error: Error) {
    console.error(`[QueryHandler] Query ${query.type} failed:`, {
      queryId: query.id,
      error: error.message,
      context
    });
  }
}