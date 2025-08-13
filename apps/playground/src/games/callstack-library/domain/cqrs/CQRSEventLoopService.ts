/**
 * CQRSEventLoopService - CQRS 패턴 기반 이벤트 루프 서비스
 * 
 * Command와 Query를 완전히 분리하여 확장성과 성능을 극대화
 * Event Sourcing과 결합하여 완벽한 상태 추적과 시간 여행 디버깅 제공
 */

import { 
  GameCommand, 
  CommandResult, 
  createCommand,
  CommandBuilder
} from './Commands';

import {
  GameQuery,
  QueryResult,
  createQuery,
  QueryBuilder
} from './Queries';

import {
  CommandDispatcher,
  EventLoopCommandHandler,
  CommandContext,
  CommandHandlerResult,
  LoggingMiddleware,
  MetricsMiddleware
} from './CommandHandler';

import {
  QueryDispatcher,
  EventLoopQueryHandler,
  QueryContext,
  QueryLoggingMiddleware
} from './QueryHandler';

import { EventSourcedEventLoopEngine } from '@/games/callstack-library/domain/event-sourcing/EventSourcedEventLoopEngine';
import { EventLoopConfig } from '@/games/callstack-library/domain/event-loop/types';
import { IEventStore, InMemoryEventStore } from '@/games/callstack-library/domain/event-sourcing/EventStore';

// 서비스 설정
export interface CQRSServiceConfig {
  readonly eventLoopConfig: EventLoopConfig;
  readonly enableCaching: boolean;
  readonly enableLogging: boolean;
  readonly enableMetrics: boolean;
  readonly commandTimeout: number;
  readonly queryTimeout: number;
  readonly sessionId: string;
}

// 서비스 상태
export interface CQRSServiceState {
  readonly isInitialized: boolean;
  readonly sessionId: string;
  readonly commandsProcessed: number;
  readonly queriesProcessed: number;
  readonly lastActivity: number;
  readonly eventLoopVersion: number;
}

// CQRS 기반 이벤트 루프 서비스
export class CQRSEventLoopService {
  private config: CQRSServiceConfig;
  private engine: EventSourcedEventLoopEngine;
  private commandDispatcher: CommandDispatcher;
  private queryDispatcher: QueryDispatcher;
  private eventStore: IEventStore;
  
  private state: CQRSServiceState;
  private isDestroyed = false;

  constructor(config: Partial<CQRSServiceConfig> = {}) {
    this.config = {
      eventLoopConfig: {
        maxCallStackSize: 100,
        maxMicrotaskQueueSize: 1000,
        maxMacrotaskQueueSize: 1000,
        executionTimeout: 30000,
        enableLogging: false
      },
      enableCaching: true,
      enableLogging: true,
      enableMetrics: true,
      commandTimeout: 10000,
      queryTimeout: 5000,
      sessionId: `session_${Date.now()}`,
      ...config
    };

    this.initializeService();
  }

  private initializeService(): void {
    // 이벤트 스토어 초기화
    this.eventStore = new InMemoryEventStore();
    
    // 이벤트 루프 엔진 초기화
    this.engine = new EventSourcedEventLoopEngine(
      this.config.eventLoopConfig,
      this.eventStore,
      `engine_${this.config.sessionId}`
    );

    // 명령 디스패처 초기화
    this.commandDispatcher = new CommandDispatcher();
    this.commandDispatcher.registerHandler('PushFunction', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('PopFunction', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('EnqueueMicrotask', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('DequeueMicrotask', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('EnqueueMacrotask', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('CancelMacrotask', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('ExecuteTick', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('PauseExecution', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('ResumeExecution', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('ResetEngine', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('SetBreakpoint', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));
    this.commandDispatcher.registerHandler('RewindToTick', new EventLoopCommandHandler(this.engine, this.config.eventLoopConfig));

    // 쿼리 디스패처 초기화
    this.queryDispatcher = new QueryDispatcher();
    const queryHandler = new EventLoopQueryHandler(this.engine);
    this.queryDispatcher.registerHandler('GetCurrentState', queryHandler);
    this.queryDispatcher.registerHandler('GetCallStack', queryHandler);
    this.queryDispatcher.registerHandler('GetQueueStates', queryHandler);
    this.queryDispatcher.registerHandler('GetExecutionHistory', queryHandler);
    this.queryDispatcher.registerHandler('GetEvents', queryHandler);
    this.queryDispatcher.registerHandler('GetEventsByType', queryHandler);
    this.queryDispatcher.registerHandler('GetAggregateHistory', queryHandler);
    this.queryDispatcher.registerHandler('GetPerformanceMetrics', queryHandler);
    this.queryDispatcher.registerHandler('GetBottleneckAnalysis', queryHandler);
    this.queryDispatcher.registerHandler('GetDebugInfo', queryHandler);
    this.queryDispatcher.registerHandler('GetSimulationState', queryHandler);
    this.queryDispatcher.registerHandler('GetTimeline', queryHandler);
    this.queryDispatcher.registerHandler('GetBreakpoints', queryHandler);

    // 미들웨어 설정
    if (this.config.enableLogging) {
      this.commandDispatcher.addMiddleware(new LoggingMiddleware());
      this.queryDispatcher.addMiddleware(new QueryLoggingMiddleware());
    }

    if (this.config.enableMetrics) {
      this.commandDispatcher.addMiddleware(new MetricsMiddleware());
    }

    // 초기 상태 설정
    this.state = {
      isInitialized: true,
      sessionId: this.config.sessionId,
      commandsProcessed: 0,
      queriesProcessed: 0,
      lastActivity: Date.now(),
      eventLoopVersion: this.engine.getVersion()
    };
  }

  // === 명령 처리 메서드들 ===

  async executeCommand(command: GameCommand, options: Partial<CommandContext> = {}): Promise<CommandHandlerResult> {
    this.ensureNotDestroyed();
    
    const context: CommandContext = {
      sessionId: this.config.sessionId,
      source: 'CQRSEventLoopService',
      timeout: this.config.commandTimeout,
      ...options
    };

    try {
      const result = await this.commandDispatcher.dispatch(command, context);
      
      this.updateState({
        commandsProcessed: this.state.commandsProcessed + 1,
        lastActivity: Date.now(),
        eventLoopVersion: this.engine.getVersion()
      });

      return result;
    } catch (error) {
      throw new Error(`Command execution failed: ${(error as Error).message}`);
    }
  }

  // 편의 메서드들 - 자주 사용되는 명령들
  async pushFunction(functionName: string, priority: 'immediate' | 'high' | 'normal' | 'low' = 'normal') {
    const command = createCommand(this.config.sessionId, 'user')
      .pushFunction(functionName, undefined, priority);
    
    return this.executeCommand(command);
  }

  async popFunction() {
    const command = createCommand(this.config.sessionId, 'user')
      .popFunction();
    
    return this.executeCommand(command);
  }

  async enqueueMicrotask(taskName: string, source: 'promise' | 'queueMicrotask' | 'mutationObserver' = 'promise') {
    const command = createCommand(this.config.sessionId, 'user')
      .enqueueMicrotask(taskName, source);
    
    return this.executeCommand(command);
  }

  async enqueueMacrotask(taskName: string, source: 'setTimeout' | 'setInterval' | 'setImmediate' | 'io' | 'ui', delay = 0) {
    const command = createCommand(this.config.sessionId, 'user')
      .enqueueMacrotask(taskName, source, delay);
    
    return this.executeCommand(command);
  }

  async executeTick(mode: 'step' | 'continuous' | 'until-idle' = 'step', maxTicks = 1) {
    const command = createCommand(this.config.sessionId, 'user')
      .executeTick(mode, maxTicks);
    
    return this.executeCommand(command);
  }

  async pauseExecution(reason?: string) {
    const command = createCommand(this.config.sessionId, 'user')
      .pauseExecution(reason);
    
    return this.executeCommand(command);
  }

  async resumeExecution(fromTick?: number) {
    const command = createCommand(this.config.sessionId, 'user')
      .resumeExecution(fromTick);
    
    return this.executeCommand(command);
  }

  async resetEngine(preserveHistory = false) {
    const command = createCommand(this.config.sessionId, 'user')
      .resetEngine(preserveHistory);
    
    return this.executeCommand(command);
  }

  async rewindToTick(targetTick: number) {
    const command = createCommand(this.config.sessionId, 'user')
      .rewindToTick(targetTick);
    
    return this.executeCommand(command);
  }

  // === 쿼리 처리 메서드들 ===

  async executeQuery<T>(query: GameQuery, options: Partial<QueryContext> = {}): Promise<QueryResult<T>> {
    this.ensureNotDestroyed();
    
    const context: QueryContext = {
      sessionId: this.config.sessionId,
      source: 'CQRSEventLoopService',
      cacheEnabled: this.config.enableCaching,
      timeout: this.config.queryTimeout,
      ...options
    };

    try {
      const result = await this.queryDispatcher.dispatch<T>(query, context);
      
      this.updateState({
        queriesProcessed: this.state.queriesProcessed + 1,
        lastActivity: Date.now()
      });

      return result;
    } catch (error) {
      throw new Error(`Query execution failed: ${(error as Error).message}`);
    }
  }

  // 편의 메서드들 - 자주 사용되는 쿼리들
  async getCurrentState(includeHistory = false, includeMetrics = false) {
    const query = createQuery(this.config.sessionId)
      .getCurrentState(includeHistory, includeMetrics);
    
    return this.executeQuery(query);
  }

  async getCallStack(includeMetadata = true, stackDepth?: number) {
    const query = createQuery(this.config.sessionId)
      .getCallStack(includeMetadata, stackDepth);
    
    return this.executeQuery(query);
  }

  async getQueueStates(queueTypes?: ('microtask' | 'macrotask')[], includeScheduled = true) {
    const query = createQuery(this.config.sessionId)
      .getQueueStates(queueTypes, includeScheduled);
    
    return this.executeQuery(query);
  }

  async getExecutionHistory(maxSteps = 100, includeEvents = false) {
    const query = createQuery(this.config.sessionId)
      .getExecutionHistory(maxSteps, includeEvents);
    
    return this.executeQuery(query);
  }

  async getEvents(streamId?: string, eventTypes?: string[]) {
    const query = createQuery(this.config.sessionId)
      .getEvents(streamId, eventTypes);
    
    return this.executeQuery(query);
  }

  async getEventsByType(eventType: string, groupBy?: 'timestamp' | 'aggregateId' | 'source') {
    const query = createQuery(this.config.sessionId)
      .getEventsByType(eventType, groupBy);
    
    return this.executeQuery(query);
  }

  async getPerformanceMetrics(timeWindow = 60000, includeBreakdown = true) {
    const query = createQuery(this.config.sessionId)
      .getPerformanceMetrics(timeWindow, includeBreakdown);
    
    return this.executeQuery(query);
  }

  async getSimulationState(stepNumber?: number, includeProjections = false) {
    const query = createQuery(this.config.sessionId)
      .getSimulationState(stepNumber, includeProjections);
    
    return this.executeQuery(query);
  }

  // === 서비스 관리 메서드들 ===

  getState(): Readonly<CQRSServiceState> {
    return { ...this.state };
  }

  getConfig(): Readonly<CQRSServiceConfig> {
    return { ...this.config };
  }

  // 캐시 관리
  clearQueryCache(): void {
    this.queryDispatcher.clearCache();
  }

  getQueryCacheStats() {
    return this.queryDispatcher.getCacheStats();
  }

  // 이벤트 스토어 직접 접근 (고급 사용자용)
  getEventStore(): IEventStore {
    return this.eventStore;
  }

  getEngine(): EventSourcedEventLoopEngine {
    return this.engine;
  }

  // 서비스 생명주기 관리
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.clearQueryCache();
    this.isDestroyed = true;
    
    // 정리 작업
    console.log(`[CQRSEventLoopService] Service destroyed. Session: ${this.config.sessionId}`);
  }

  // === 헬퍼 메서드들 ===

  private ensureNotDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('Service has been destroyed');
    }
  }

  private updateState(updates: Partial<CQRSServiceState>): void {
    this.state = {
      ...this.state,
      ...updates
    };
  }

  // 상태 스냅샷 생성
  async createSnapshot() {
    const currentState = await this.getCurrentState(true, true);
    const eventHistory = await this.getEvents();
    
    return {
      serviceState: this.getState(),
      engineState: currentState.data,
      eventHistory: eventHistory.data,
      timestamp: Date.now()
    };
  }

  // 헬스 체크
  async healthCheck() {
    try {
      const state = await this.getCurrentState();
      const metrics = await this.getPerformanceMetrics(5000); // 최근 5초
      
      return {
        healthy: true,
        serviceState: this.getState(),
        engineVersion: this.engine.getVersion(),
        lastActivity: this.state.lastActivity,
        metrics: metrics.data
      };
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
        timestamp: Date.now()
      };
    }
  }
}

// 팩토리 함수
export function createCQRSEventLoopService(config?: Partial<CQRSServiceConfig>): CQRSEventLoopService {
  return new CQRSEventLoopService(config);
}

// 기본 서비스 인스턴스 (싱글톤)
let defaultService: CQRSEventLoopService | null = null;

export function getDefaultCQRSService(): CQRSEventLoopService {
  if (!defaultService) {
    defaultService = createCQRSEventLoopService();
  }
  return defaultService;
}

export function destroyDefaultCQRSService(): void {
  if (defaultService) {
    defaultService.destroy();
    defaultService = null;
  }
}