/**
 * CommandHandler 단위 테스트
 * 
 * CQRS 명령 처리기의 핵심 기능을 검증합니다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CommandDispatcher,
  EventLoopCommandHandler,
  LoggingMiddleware,
  MetricsMiddleware,
  ICommandHandler,
  CommandContext,
  CommandHandlerResult,
  CommandMiddleware
} from '../CommandHandler';
import { 
  PushFunctionCommand,
  PopFunctionCommand,
  EnqueueMicrotaskCommand,
  ExecuteTickCommand,
  ResetEngineCommand,
  GameCommand
} from '../Commands';
import { EventSourcedEventLoopEngine } from '../../event-sourcing/EventSourcedEventLoopEngine';
import { InMemoryEventStore } from '../../event-sourcing/EventStore';
import { EventLoopConfig } from '../../event-loop/types';

describe('CommandHandler', () => {
  let dispatcher: CommandDispatcher;
  let eventStore: InMemoryEventStore;
  let engine: EventSourcedEventLoopEngine;
  let commandHandler: EventLoopCommandHandler;
  let context: CommandContext;
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
    commandHandler = new EventLoopCommandHandler(engine, config);
    dispatcher = new CommandDispatcher();

    context = {
      sessionId: 'test-session',
      userId: 'test-user',
      source: 'test',
      correlationId: 'test-correlation'
    };

    // 핸들러 등록
    dispatcher.registerHandler('PushFunction', commandHandler);
    dispatcher.registerHandler('PopFunction', commandHandler);
    dispatcher.registerHandler('EnqueueMicrotask', commandHandler);
    dispatcher.registerHandler('ExecuteTick', commandHandler);
    dispatcher.registerHandler('ResetEngine', commandHandler);
  });

  describe('CommandDispatcher', () => {
    it('핸들러를 등록할 수 있어야 한다', () => {
      const mockHandler: ICommandHandler = {
        handle: vi.fn(),
        canHandle: vi.fn().mockReturnValue(true),
        getPriority: vi.fn().mockReturnValue(1)
      };

      dispatcher.registerHandler('TestCommand', mockHandler);
      expect(mockHandler.canHandle).toBeDefined();
    });

    it('유효한 명령을 디스패치할 수 있어야 한다', async () => {
      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      const result = await dispatcher.dispatch(command, context);
      
      expect(result.success).toBe(true);
      expect(result.context).toEqual(context);
      expect(result.processedAt).toBeDefined();
    });

    it('잘못된 명령에 대해 에러를 던져야 한다', async () => {
      const invalidCommand = {
        type: 'InvalidCommand',
        id: 'invalid-1',
        timestamp: Date.now()
      } as any;

      await expect(dispatcher.dispatch(invalidCommand, context))
        .rejects.toThrow('Invalid command: InvalidCommand');
    });

    it('등록되지 않은 핸들러에 대해 에러를 던져야 한다', async () => {
      const command: GameCommand = {
        type: 'UnregisteredCommand' as any,
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      await expect(dispatcher.dispatch(command, context))
        .rejects.toThrow('No handler found for command type: UnregisteredCommand');
    });

    it('미들웨어를 추가하고 실행할 수 있어야 한다', async () => {
      const middleware: CommandMiddleware = {
        beforeHandle: vi.fn().mockResolvedValue({
          command: expect.any(Object),
          context: expect.any(Object)
        }),
        afterHandle: vi.fn().mockImplementation((cmd, ctx, result) => Promise.resolve(result)),
        onError: vi.fn()
      };

      dispatcher.addMiddleware(middleware);

      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      await dispatcher.dispatch(command, context);

      expect(middleware.beforeHandle).toHaveBeenCalledWith(command, context);
      expect(middleware.afterHandle).toHaveBeenCalled();
    });

    it('명령 처리 중 에러 발생 시 미들웨어의 onError를 호출해야 한다', async () => {
      const errorMiddleware: CommandMiddleware = {
        beforeHandle: vi.fn().mockResolvedValue({
          command: expect.any(Object),
          context: expect.any(Object)
        }),
        afterHandle: vi.fn().mockResolvedValue(expect.any(Object)),
        onError: vi.fn()
      };

      dispatcher.addMiddleware(errorMiddleware);

      // 에러를 발생시키는 핸들러
      const errorHandler: ICommandHandler = {
        handle: vi.fn().mockRejectedValue(new Error('Test error')),
        canHandle: vi.fn().mockReturnValue(true),
        getPriority: vi.fn().mockReturnValue(1)
      };

      dispatcher.registerHandler('ErrorCommand', errorHandler);

      const command: GameCommand = {
        type: 'ErrorCommand' as any,
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      await expect(dispatcher.dispatch(command, context)).rejects.toThrow('Test error');
      expect(errorMiddleware.onError).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.any(Error)
      );
    });
  });

  describe('EventLoopCommandHandler', () => {
    it('지원하는 명령 타입을 확인할 수 있어야 한다', () => {
      expect(commandHandler.canHandle('PushFunction')).toBe(true);
      expect(commandHandler.canHandle('PopFunction')).toBe(true);
      expect(commandHandler.canHandle('EnqueueMicrotask')).toBe(true);
      expect(commandHandler.canHandle('ExecuteTick')).toBe(true);
      expect(commandHandler.canHandle('ResetEngine')).toBe(true);
      expect(commandHandler.canHandle('UnsupportedCommand')).toBe(false);
    });

    it('우선순위를 반환해야 한다', () => {
      const priority = commandHandler.getPriority();
      expect(typeof priority).toBe('number');
      expect(priority).toBeGreaterThanOrEqual(0);
    });

    it('PushFunction 명령을 처리할 수 있어야 한다', async () => {
      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(result.commandId).toBe(command.id);
      expect(result.context).toEqual(context);
    });

    it('PopFunction 명령을 처리할 수 있어야 한다', async () => {
      // 먼저 함수를 푸시
      const pushCommand: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      await commandHandler.handle(pushCommand, context);

      // 팝 명령 실행
      const popCommand: PopFunctionCommand = {
        type: 'PopFunction',
        id: 'cmd-2',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await commandHandler.handle(popCommand, context);
      
      expect(result.success).toBe(true);
      expect(result.commandId).toBe(popCommand.id);
    });

    it('EnqueueMicrotask 명령을 처리할 수 있어야 한다', async () => {
      const command: EnqueueMicrotaskCommand = {
        type: 'EnqueueMicrotask',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          taskName: 'testMicrotask',
          source: 'promise',
          priority: 'high'
        }
      };

      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(result.commandId).toBe(command.id);
    });

    it('ExecuteTick 명령을 처리할 수 있어야 한다', async () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(result.commandId).toBe(command.id);
    });

    it('ResetEngine 명령을 처리할 수 있어야 한다', async () => {
      const command: ResetEngineCommand = {
        type: 'ResetEngine',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(result.commandId).toBe(command.id);
    });

    it('지원하지 않는 명령에 대해 에러를 반환해야 한다', async () => {
      const command: GameCommand = {
        type: 'UnsupportedCommand' as any,
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Unsupported command type: UnsupportedCommand');
    });

    it('타임아웃이 설정된 컨텍스트를 처리해야 한다', async () => {
      const timeoutContext: CommandContext = {
        ...context,
        timeout: 1000
      };

      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      const result = await commandHandler.handle(command, timeoutContext);
      
      expect(result.success).toBe(true);
      expect(result.context.timeout).toBe(1000);
    });
  });

  describe('LoggingMiddleware', () => {
    it('로깅 미들웨어를 생성할 수 있어야 한다', () => {
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      };

      const middleware = new LoggingMiddleware(logger);
      expect(middleware).toBeInstanceOf(LoggingMiddleware);
    });

    it('명령 처리 전후에 로그를 기록해야 한다', async () => {
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      };

      const middleware = new LoggingMiddleware(logger);
      
      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      const beforeResult = await middleware.beforeHandle(command, context);
      expect(logger.info).toHaveBeenCalledWith(
        `[CommandHandler] Executing command: ${command.type}`,
        expect.any(Object)
      );

      const mockResult: CommandHandlerResult = {
        success: true,
        commandId: command.id,
        events: [],
        executionTime: 100,
        processedAt: Date.now(),
        context,
        sideEffects: []
      };

      await middleware.afterHandle(command, context, mockResult);
      expect(logger.info).toHaveBeenCalledWith(
        `[CommandHandler] Command completed: ${command.type}`,
        expect.any(Object)
      );
    });

    it('에러 발생 시 에러 로그를 기록해야 한다', async () => {
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      };

      const middleware = new LoggingMiddleware(logger);
      const error = new Error('Test error');

      const command: GameCommand = {
        type: 'TestCommand' as any,
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      await middleware.onError!(command, context, error);
      
      expect(logger.error).toHaveBeenCalledWith(
        `[CommandHandler] Command failed: ${command.type}`,
        expect.any(Object)
      );
    });
  });

  describe('MetricsMiddleware', () => {
    it('메트릭 미들웨어를 생성할 수 있어야 한다', () => {
      const metricsCollector = {
        increment: vi.fn(),
        timing: vi.fn(),
        gauge: vi.fn()
      };

      const middleware = new MetricsMiddleware(metricsCollector);
      expect(middleware).toBeInstanceOf(MetricsMiddleware);
    });

    it('명령 처리 메트릭을 수집해야 한다', async () => {
      const metricsCollector = {
        increment: vi.fn(),
        timing: vi.fn(),
        gauge: vi.fn()
      };

      const middleware = new MetricsMiddleware(metricsCollector);
      
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      await middleware.beforeHandle(command, context);

      const mockResult: CommandHandlerResult = {
        success: true,
        commandId: command.id,
        events: [],
        executionTime: 100,
        processedAt: Date.now(),
        context,
        sideEffects: []
      };

      await middleware.afterHandle(command, context, mockResult);

      expect(metricsCollector.increment).toHaveBeenCalledWith(
        'command.executed',
        expect.any(Object)
      );
      expect(metricsCollector.timing).toHaveBeenCalledWith(
        'command.duration',
        expect.any(Number),
        expect.any(Object)
      );
    });

    it('에러 메트릭을 수집해야 한다', async () => {
      const metricsCollector = {
        increment: vi.fn(),
        timing: vi.fn(),
        gauge: vi.fn()
      };

      const middleware = new MetricsMiddleware(metricsCollector);
      const error = new Error('Test error');

      const command: GameCommand = {
        type: 'TestCommand' as any,
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      };

      await middleware.onError!(command, context, error);
      
      expect(metricsCollector.increment).toHaveBeenCalledWith(
        'command.error',
        expect.any(Object)
      );
    });
  });

  describe('추가 브랜치 커버리지', () => {
    let mockEngine2: any;
    let handler2: EventLoopCommandHandler;

    beforeEach(() => {
      mockEngine2 = {
        tick: vi.fn().mockResolvedValue({ success: true }),
        getState: vi.fn().mockReturnValue({ 
          currentTick: 1,
          phase: 'executing'
        }),
        getEventHistory: vi.fn().mockResolvedValue([])
      };
      handler2 = new EventLoopCommandHandler(mockEngine2, {});
    });

    it('CancelMacrotask 명령을 처리할 수 있어야 한다', async () => {
      const command: CancelMacrotaskCommand = {
        type: 'CancelMacrotask',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          taskId: 'task-123'
        }
      };

      const result = await handler2.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(result.sideEffects[0].type).toBe('console');
      expect(result.sideEffects[0].description).toContain('Macrotask task-123 cancelled');
    });

    it('ExecuteTick 명령에서 연속 실행 모드를 처리할 수 있어야 한다', async () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          mode: 'continuous',
          maxTicks: 3
        }
      };

      const result = await handler2.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(mockEngine2.tick).toHaveBeenCalledTimes(3);
      expect(result.sideEffects[0].description).toBe('Executed 3 ticks');
    });

    it('ExecuteTick 명령에서 until-idle 모드를 처리할 수 있어야 한다', async () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          mode: 'until-idle',
          maxTicks: 10
        }
      };

      // 첫 번째 tick은 성공, 두 번째부터 idle 상태
      mockEngine2.tick.mockResolvedValueOnce({ success: true });
      mockEngine2.getState.mockReturnValueOnce({ phase: 'idle' });

      const result = await handler2.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(mockEngine2.tick).toHaveBeenCalledTimes(1);
      expect(result.sideEffects[0].description).toBe('Executed 1 ticks');
    });

    it('ExecuteTick 명령에서 실패한 경우 중단해야 한다', async () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          mode: 'continuous',
          maxTicks: 5
        }
      };

      // 첫 번째는 성공, 두 번째는 실패
      mockEngine2.tick.mockResolvedValueOnce({ success: true });
      mockEngine2.tick.mockResolvedValueOnce({ success: false });

      const result = await handler2.handle(command, context);
      
      expect(result.success).toBe(true);
      expect(mockEngine2.tick).toHaveBeenCalledTimes(2);
      expect(result.sideEffects[0].description).toBe('Executed 2 ticks');
    });
  });

  describe('통합 테스트', () => {
    it('전체 명령 처리 플로우가 정상 작동해야 한다', async () => {
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn()
      };

      const metricsCollector = {
        increment: vi.fn(),
        timing: vi.fn(),
        gauge: vi.fn()
      };

      dispatcher.addMiddleware(new LoggingMiddleware(logger));
      dispatcher.addMiddleware(new MetricsMiddleware(metricsCollector));

      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'integrationTest',
          context: { scope: {} },
          priority: 'normal'
        }
      };

      const result = await dispatcher.dispatch(command, context);

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalled();
      expect(metricsCollector.increment).toHaveBeenCalled();
    });
  });

  describe('명령 핸들러 엣지 케이스', () => {
    let handler: EventLoopCommandHandler;
    let mockEngine: any;
    let context: CommandContext;

    beforeEach(() => {
      context = {
        userId: 'test-user',
        sessionId: 'test-session'
      };
      mockEngine = {
        pushToCallStack: vi.fn().mockResolvedValue({ currentTick: 1 }),
        popFromCallStack: vi.fn().mockResolvedValue({ currentTick: 2 }),
        enqueueMicrotask: vi.fn().mockResolvedValue({ currentTick: 3 }),
        enqueueMacrotask: vi.fn().mockResolvedValue({ currentTick: 4 }),
        tick: vi.fn().mockResolvedValue({ currentTick: 5 }),
        reset: vi.fn().mockResolvedValue({ currentTick: 0 }),
        rewindToTick: vi.fn().mockResolvedValue({ currentTick: 1 }),
        getState: vi.fn().mockReturnValue({}),
        replayToVersion: vi.fn().mockResolvedValue({ currentTick: 1 }),
        getDiff: vi.fn().mockReturnValue({ added: [], removed: [], modified: [] }),
        getEventHistory: vi.fn().mockResolvedValue([])
      };
      
      handler = new EventLoopCommandHandler(mockEngine, {});
    });

    it('브레이크포인트 설정 명령을 처리해야 한다', async () => {
      const command = {
        id: 'cmd1',
        type: 'SET_BREAKPOINT' as const,
        timestamp: Date.now(),
        payload: {
          condition: 'tick',
          value: 10,
          enabled: true
        }
      };

      const result = await handler.handle(command, context);

      expect(result.success).toBe(true);
      expect(result.sideEffects).toHaveLength(2);
      expect(result.sideEffects[0].type).toBe('console');
      expect(result.sideEffects[0].description).toBe('Breakpoint set: tick = 10');
      expect(result.sideEffects[1].type).toBe('metric');
    });

    it('브레이크포인트 설정 명령에서 enabled가 없어도 처리해야 한다', async () => {
      const command = {
        id: 'cmd1',
        type: 'SET_BREAKPOINT' as const,
        timestamp: Date.now(),
        payload: {
          condition: 'callstack',
          value: 5
        }
      };

      const result = await handler.handle(command, context);

      expect(result.success).toBe(true);
      expect(result.sideEffects).toHaveLength(2);
      expect(result.sideEffects[0].type).toBe('console');
      expect(result.sideEffects[0].description).toBe('Breakpoint set: callstack = 5');
    });

    it('REWIND_TO_TICK 명령 실행 중 오류 발생 시 에러를 반환해야 한다', async () => {
      const mockError = new Error('Version not found');
      vi.mocked(mockEngine.replayToVersion).mockRejectedValueOnce(mockError);

      const command = {
        id: 'cmd1',
        type: 'REWIND_TO_TICK' as const,
        timestamp: Date.now(),
        payload: {
          targetTick: 999,
          preserveForwardHistory: false
        }
      };

      const result = await handler.handle(command, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0].type).toBe('metric');
    });

    it('지원하지 않는 명령 타입은 에러를 반환해야 한다', async () => {
      const invalidCommand = {
        id: 'cmd1',
        type: 'INVALID_COMMAND' as any,
        timestamp: Date.now(),
        payload: {}
      };

      const result = await handler.handle(invalidCommand, context);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Unsupported command type');
    });
  });
});