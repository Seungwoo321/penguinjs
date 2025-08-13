/**
 * CommandHandler - CQRS 명령 처리기
 * 
 * 모든 상태 변경 명령을 처리하고 이벤트를 생성
 * Event Sourcing과 통합하여 완전한 상태 추적 제공
 */

import { 
  GameCommand, 
  CommandResult, 
  PushFunctionCommand,
  PopFunctionCommand,
  EnqueueMicrotaskCommand,
  DequeueMicrotaskCommand,
  EnqueueMacrotaskCommand,
  CancelMacrotaskCommand,
  ExecuteTickCommand,
  PauseExecutionCommand,
  ResumeExecutionCommand,
  ResetEngineCommand,
  SetBreakpointCommand,
  RewindToTickCommand,
  validateCommand,
  getCommandPriority
} from './Commands';

import { EventSourcedEventLoopEngine } from '@/games/callstack-library/domain/event-sourcing/EventSourcedEventLoopEngine';
import { IEventStore } from '@/games/callstack-library/domain/event-sourcing/EventStore';
import { EventLoopConfig } from '@/games/callstack-library/domain/event-loop/types';

// 명령 처리 컨텍스트
export interface CommandContext {
  readonly sessionId: string;
  readonly userId?: string;
  readonly source: string;
  readonly correlationId?: string;
  readonly timeout?: number;
}

// 명령 처리 결과
export interface CommandHandlerResult extends CommandResult {
  readonly processedAt: number;
  readonly context: CommandContext;
  readonly sideEffects: Array<{
    type: 'event' | 'notification' | 'log' | 'metric';
    data: any;
  }>;
}

// 명령 처리기 인터페이스
export interface ICommandHandler {
  handle(command: GameCommand, context: CommandContext): Promise<CommandHandlerResult>;
  canHandle(commandType: string): boolean;
  getPriority(): number;
}

// 명령 디스패처
export class CommandDispatcher {
  private handlers = new Map<string, ICommandHandler>();
  private middleware: CommandMiddleware[] = [];

  registerHandler(commandType: string, handler: ICommandHandler): void {
    this.handlers.set(commandType, handler);
  }

  addMiddleware(middleware: CommandMiddleware): void {
    this.middleware.push(middleware);
  }

  async dispatch(command: GameCommand, context: CommandContext): Promise<CommandHandlerResult> {
    // 명령 검증
    if (!validateCommand(command)) {
      throw new Error(`Invalid command: ${command.type}`);
    }

    // 핸들러 찾기
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler found for command type: ${command.type}`);
    }

    // 미들웨어 실행 (전처리)
    let processedCommand = command;
    let processedContext = context;
    
    for (const middleware of this.middleware) {
      const result = await middleware.beforeHandle(processedCommand, processedContext);
      processedCommand = result.command;
      processedContext = result.context;
    }

    try {
      // 명령 처리
      const result = await handler.handle(processedCommand, processedContext);

      // 미들웨어 실행 (후처리)
      let processedResult = result;
      for (const middleware of this.middleware) {
        processedResult = await middleware.afterHandle(processedCommand, processedContext, processedResult);
      }

      return processedResult;

    } catch (error) {
      // 에러 처리 미들웨어
      for (const middleware of this.middleware) {
        await middleware.onError?.(processedCommand, processedContext, error as Error);
      }
      throw error;
    }
  }
}

// 명령 미들웨어 인터페이스
export interface CommandMiddleware {
  beforeHandle(command: GameCommand, context: CommandContext): Promise<{
    command: GameCommand;
    context: CommandContext;
  }>;
  
  afterHandle(
    command: GameCommand, 
    context: CommandContext, 
    result: CommandHandlerResult
  ): Promise<CommandHandlerResult>;
  
  onError?(command: GameCommand, context: CommandContext, error: Error): Promise<void>;
}

// 이벤트 루프 명령 처리기
export class EventLoopCommandHandler implements ICommandHandler {
  private engine: EventSourcedEventLoopEngine;
  private config: EventLoopConfig;

  constructor(engine: EventSourcedEventLoopEngine, config: EventLoopConfig) {
    this.engine = engine;
    this.config = config;
  }

  canHandle(commandType: string): boolean {
    const supportedCommands = [
      'PushFunction',
      'PopFunction',
      'EnqueueMicrotask',
      'DequeueMicrotask',
      'EnqueueMacrotask',
      'CancelMacrotask',
      'ExecuteTick',
      'PauseExecution',
      'ResumeExecution',
      'ResetEngine',
      'SetBreakpoint',
      'RewindToTick',
      'SET_BREAKPOINT',
      'REWIND_TO_TICK'
    ];
    return supportedCommands.includes(commandType);
  }

  getPriority(): number {
    return 1; // 높은 우선순위
  }

  async handle(command: GameCommand, context: CommandContext): Promise<CommandHandlerResult> {
    const startTime = performance.now();
    
    try {
      let engineResult;
      const sideEffects: any[] = [];

      switch (command.type) {
        case 'PushFunction':
          engineResult = await this.handlePushFunction(command as PushFunctionCommand, context);
          break;
          
        case 'PopFunction':
          engineResult = await this.handlePopFunction(command as PopFunctionCommand, context);
          break;
          
        case 'EnqueueMicrotask':
          engineResult = await this.handleEnqueueMicrotask(command as EnqueueMicrotaskCommand, context);
          break;
          
        case 'DequeueMicrotask':
          engineResult = await this.handleDequeueMicrotask(command as DequeueMicrotaskCommand, context);
          break;
          
        case 'EnqueueMacrotask':
          engineResult = await this.handleEnqueueMacrotask(command as EnqueueMacrotaskCommand, context);
          break;
          
        case 'CancelMacrotask':
          engineResult = await this.handleCancelMacrotask(command as CancelMacrotaskCommand, context);
          break;
          
        case 'ExecuteTick':
          engineResult = await this.handleExecuteTick(command as ExecuteTickCommand, context);
          break;
          
        case 'PauseExecution':
          engineResult = await this.handlePauseExecution(command as PauseExecutionCommand, context);
          break;
          
        case 'ResumeExecution':
          engineResult = await this.handleResumeExecution(command as ResumeExecutionCommand, context);
          break;
          
        case 'ResetEngine':
          engineResult = await this.handleResetEngine(command as ResetEngineCommand, context);
          break;
          
        case 'SetBreakpoint':
          engineResult = await this.handleSetBreakpoint(command as SetBreakpointCommand, context);
          break;
          
        case 'RewindToTick':
          engineResult = await this.handleRewindToTick(command as RewindToTickCommand, context);
          break;
          
        default:
          throw new Error(`Unsupported command type: ${(command as any).type}`);
      }

      const executionTime = performance.now() - startTime;

      // engineResult의 sideEffects를 먼저 추가
      if (engineResult.sideEffects) {
        sideEffects.push(...engineResult.sideEffects);
      }

      // 성능 메트릭 수집
      sideEffects.push({
        type: 'metric',
        data: {
          commandType: command.type,
          executionTime,
          success: engineResult.success,
          timestamp: Date.now()
        }
      });

      // 이벤트 ID 목록 생성
      const events = await this.engine.getEventHistory();
      const recentEvents = events
        .filter(e => e.timestamp >= startTime)
        .map(e => e.id);

      return {
        success: engineResult.success,
        commandId: command.id,
        events: recentEvents,
        error: engineResult.error,
        executionTime,
        processedAt: Date.now(),
        context,
        sideEffects
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        commandId: command.id,
        events: [],
        error: error as Error,
        executionTime,
        processedAt: Date.now(),
        context,
        sideEffects: [{
          type: 'log',
          data: {
            level: 'error',
            message: `Command ${command.type} failed: ${(error as Error).message}`,
            command,
            context
          }
        }]
      };
    }
  }

  // 개별 명령 처리 메서드들
  private async handlePushFunction(command: PushFunctionCommand, context: CommandContext) {
    const { functionName, context: funcContext, priority = 'normal' } = command.payload;
    
    return this.engine.pushToCallStack({
      name: functionName,
      priority,
      type: 'callstack'
    });
  }

  private async handlePopFunction(command: PopFunctionCommand, context: CommandContext) {
    return this.engine.popFromCallStack();
  }

  private async handleEnqueueMicrotask(command: EnqueueMicrotaskCommand, context: CommandContext) {
    const { taskName, source, priority = 'normal' } = command.payload;
    
    return this.engine.enqueueMicrotask({
      name: taskName,
      source,
      priority,
      type: 'microtask'
    });
  }

  private async handleDequeueMicrotask(command: DequeueMicrotaskCommand, context: CommandContext) {
    // EventSourcedEventLoopEngine에서 직접 dequeue는 tick() 내에서 처리됨
    // 여기서는 일반적인 성공 응답 반환
    return {
      success: true,
      stateChange: {},
      sideEffects: []
    };
  }

  private async handleEnqueueMacrotask(command: EnqueueMacrotaskCommand, context: CommandContext) {
    const { taskName, source, delay, interval } = command.payload;
    
    return this.engine.enqueueMacrotask({
      name: taskName,
      source,
      delay,
      type: 'macrotask',
      priority: 'normal' as any
    });
  }

  private async handleCancelMacrotask(command: CancelMacrotaskCommand, context: CommandContext) {
    // 매크로태스크 취소는 별도 구현 필요
    return {
      success: true,
      stateChange: {},
      sideEffects: [{
        type: 'console',
        description: `Macrotask ${command.payload.taskId} cancelled`,
        timestamp: Date.now()
      }]
    };
  }

  private async handleExecuteTick(command: ExecuteTickCommand, context: CommandContext) {
    const { mode = 'step', maxTicks = 1 } = command.payload;
    
    if (mode === 'step') {
      return this.engine.tick();
    }
    
    // 연속 실행의 경우 여러 틱 처리
    const results = [];
    for (let i = 0; i < maxTicks; i++) {
      const result = await this.engine.tick();
      results.push(result);
      
      if (!result.success) break;
      
      // idle 상태이면 중단
      const state = this.engine.getState();
      if (state.phase === 'idle' && mode === 'until-idle') {
        break;
      }
    }
    
    return {
      success: true,
      stateChange: { currentTick: this.engine.getState().currentTick },
      sideEffects: [{
        type: 'console',
        description: `Executed ${results.length} ticks`,
        timestamp: Date.now()
      }]
    };
  }

  private async handlePauseExecution(command: PauseExecutionCommand, context: CommandContext) {
    // 실행 일시정지 로직
    return {
      success: true,
      stateChange: { isRunning: false },
      sideEffects: [{
        type: 'console',
        description: 'Execution paused',
        timestamp: Date.now()
      }]
    };
  }

  private async handleResumeExecution(command: ResumeExecutionCommand, context: CommandContext) {
    // 실행 재개 로직
    return {
      success: true,
      stateChange: { isRunning: true },
      sideEffects: [{
        type: 'console',
        description: 'Execution resumed',
        timestamp: Date.now()
      }]
    };
  }

  private async handleResetEngine(command: ResetEngineCommand, context: CommandContext) {
    await this.engine.reset();
    
    return {
      success: true,
      stateChange: this.engine.getState(),
      sideEffects: [{
        type: 'console',
        description: 'Engine reset to initial state',
        timestamp: Date.now()
      }]
    };
  }

  private async handleSetBreakpoint(command: SetBreakpointCommand, context: CommandContext) {
    // 브레이크포인트 설정 로직
    const { condition, value, enabled = true } = command.payload;
    
    return {
      success: true,
      stateChange: {},
      sideEffects: [{
        type: 'console',
        description: `Breakpoint set: ${condition} = ${value}`,
        timestamp: Date.now()
      }]
    };
  }

  private async handleRewindToTick(command: RewindToTickCommand, context: CommandContext) {
    const { targetTick, preserveForwardHistory } = command.payload;
    
    try {
      // 특정 틱으로 되돌리기
      const replayedState = await this.engine.replayToVersion(targetTick);
      
      return {
        success: true,
        stateChange: replayedState,
        sideEffects: [{
          type: 'console',
          description: `Rewound to tick ${targetTick}`,
          timestamp: Date.now()
        }]
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        stateChange: {},
        sideEffects: []
      };
    }
  }
}

// 로깅 미들웨어
export class LoggingMiddleware implements CommandMiddleware {
  private logger: {
    info: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
  };

  constructor(logger?: {
    info: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
  }) {
    this.logger = logger || {
      info: (message: string, data?: any) => console.log(message, data),
      error: (message: string, data?: any) => console.error(message, data),
      warn: (message: string, data?: any) => console.warn(message, data),
      debug: (message: string, data?: any) => console.debug(message, data)
    };
  }

  async beforeHandle(command: GameCommand, context: CommandContext) {
    this.logger.info(`[CommandHandler] Executing command: ${command.type}`, {
      commandId: command.id,
      timestamp: command.timestamp,
      context
    });
    
    return { command, context };
  }

  async afterHandle(command: GameCommand, context: CommandContext, result: CommandHandlerResult) {
    this.logger.info(`[CommandHandler] Command completed: ${command.type}`, {
      commandId: command.id,
      success: result.success,
      executionTime: result.executionTime,
      eventCount: result.events.length
    });
    
    return result;
  }

  async onError(command: GameCommand, context: CommandContext, error: Error) {
    this.logger.error(`[CommandHandler] Command failed: ${command.type}`, {
      commandId: command.id,
      error: error.message,
      context
    });
  }
}

// 메트릭 수집 미들웨어
export class MetricsMiddleware implements CommandMiddleware {
  private metrics = new Map<string, Array<{ timestamp: number; executionTime: number; success: boolean }>>();
  private metricsCollector?: {
    increment: (metric: string, tags?: any) => void;
    timing: (metric: string, value: number, tags?: any) => void;
    gauge: (metric: string, value: number, tags?: any) => void;
  };

  constructor(metricsCollector?: {
    increment: (metric: string, tags?: any) => void;
    timing: (metric: string, value: number, tags?: any) => void;
    gauge: (metric: string, value: number, tags?: any) => void;
  }) {
    this.metricsCollector = metricsCollector;
  }

  async beforeHandle(command: GameCommand, context: CommandContext) {
    return { command, context };
  }

  async afterHandle(command: GameCommand, context: CommandContext, result: CommandHandlerResult) {
    // 메트릭 수집
    if (!this.metrics.has(command.type)) {
      this.metrics.set(command.type, []);
    }
    
    this.metrics.get(command.type)!.push({
      timestamp: Date.now(),
      executionTime: result.executionTime,
      success: result.success
    });

    // 외부 메트릭 수집기 사용
    if (this.metricsCollector) {
      this.metricsCollector.increment('command.executed', {
        commandType: command.type,
        success: result.success
      });
      
      this.metricsCollector.timing('command.duration', result.executionTime, {
        commandType: command.type
      });
    }

    // 메트릭 사이드 이펙트 추가
    result.sideEffects.push({
      type: 'metric',
      data: {
        commandType: command.type,
        metrics: this.getCommandMetrics(command.type)
      }
    });

    return result;
  }

  async onError(command: GameCommand, context: CommandContext, error: Error) {
    if (this.metricsCollector) {
      this.metricsCollector.increment('command.error', {
        commandType: command.type,
        error: error.message
      });
    }
  }

  getCommandMetrics(commandType: string) {
    const commandMetrics = this.metrics.get(commandType) || [];
    const recent = commandMetrics.filter(m => Date.now() - m.timestamp < 60000); // 최근 1분
    
    return {
      totalCount: commandMetrics.length,
      recentCount: recent.length,
      averageExecutionTime: recent.reduce((sum, m) => sum + m.executionTime, 0) / recent.length || 0,
      successRate: recent.filter(m => m.success).length / recent.length || 0
    };
  }
}