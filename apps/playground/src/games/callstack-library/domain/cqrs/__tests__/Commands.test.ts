/**
 * Commands 단위 테스트
 * 
 * CQRS 명령 시스템의 핵심 기능을 검증합니다.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CommandBuilder,
  GameCommand,
  PushFunctionCommand,
  PopFunctionCommand,
  EnqueueMicrotaskCommand,
  EnqueueMacrotaskCommand,
  ExecuteTickCommand,
  PauseExecutionCommand,
  ResumeExecutionCommand,
  ResetEngineCommand,
  RewindToTickCommand,
  SetBreakpointCommand,
  validateCommand,
  getCommandPriority,
  createCommand,
  CommandMetadata
} from '@/games/callstack-library/Commands';

describe('Commands', () => {
  describe('CommandBuilder', () => {
    let builder: CommandBuilder;

    beforeEach(() => {
      builder = new CommandBuilder();
    });

    it('기본 빌더를 생성할 수 있어야 한다', () => {
      expect(builder).toBeInstanceOf(CommandBuilder);
    });

    it('정적 메서드로 빌더를 생성할 수 있어야 한다', () => {
      const staticBuilder = CommandBuilder.create();
      expect(staticBuilder).toBeInstanceOf(CommandBuilder);
    });

    it('체이닝을 통해 ID를 설정할 수 있어야 한다', () => {
      const result = builder.withId('test-id');
      expect(result).toBe(builder); // 체이닝 확인
    });

    it('체이닝을 통해 타입을 설정할 수 있어야 한다', () => {
      const result = builder.withType('PushFunction');
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
      // 빌더 내부 상태는 private이므로 실제 명령 생성을 통해 확인
      const command = builder.withId('test').withType('ExecuteTick').executeTick();
      const after = Date.now();
      
      expect(command.timestamp).toBeGreaterThanOrEqual(before);
      expect(command.timestamp).toBeLessThanOrEqual(after);
    });

    it('체이닝을 통해 메타데이터를 설정할 수 있어야 한다', () => {
      const metadata: CommandMetadata = {
        sessionId: 'session-1',
        source: 'ui',
        correlationId: 'corr-1'
      };
      const result = builder.withMetadata(metadata);
      expect(result).toBe(builder);
    });

    it('pushFunction 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('push-1')
        .pushFunction('testFunction', {}, 'normal');

      expect(command.type).toBe('PushFunction');
      expect(command.id).toBe('push-1');
      expect(command.payload.functionName).toBe('testFunction');
      expect(command.payload.priority).toBe('normal');
      expect(command.timestamp).toBeDefined();
    });

    it('popFunction 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('pop-1')
        .popFunction();

      expect(command.type).toBe('PopFunction');
      expect(command.id).toBe('pop-1');
      expect(command.payload).toEqual({});
    });

    it('enqueueMicrotask 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('micro-1')
        .enqueueMicrotask('promiseCallback', 'promise', 'high');

      expect(command.type).toBe('EnqueueMicrotask');
      expect(command.id).toBe('micro-1');
      expect(command.payload.taskName).toBe('promiseCallback');
      expect(command.payload.source).toBe('promise');
      expect(command.payload.priority).toBe('high');
    });

    it('enqueueMacrotask 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('macro-1')
        .enqueueMacrotask('timeoutCallback', 'setTimeout', 1000);

      expect(command.type).toBe('EnqueueMacrotask');
      expect(command.id).toBe('macro-1');
      expect(command.payload.taskName).toBe('timeoutCallback');
      expect(command.payload.source).toBe('setTimeout');
      expect(command.payload.delay).toBe(1000);
    });

    it('executeTick 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('tick-1')
        .executeTick();

      expect(command.type).toBe('ExecuteTick');
      expect(command.id).toBe('tick-1');
      expect(command.payload).toEqual({ mode: 'step', maxTicks: undefined });
    });

    it('pauseExecution 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('pause-1')
        .pauseExecution();

      expect(command.type).toBe('PauseExecution');
      expect(command.id).toBe('pause-1');
      expect(command.payload).toEqual({});
    });

    it('resumeExecution 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('resume-1')
        .resumeExecution();

      expect(command.type).toBe('ResumeExecution');
      expect(command.id).toBe('resume-1');
      expect(command.payload).toEqual({});
    });

    it('resetEngine 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('reset-1')
        .resetEngine();

      expect(command.type).toBe('ResetEngine');
      expect(command.id).toBe('reset-1');
      expect(command.payload).toEqual({});
    });

    it('rewindToTick 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('rewind-1')
        .rewindToTick(5);

      expect(command.type).toBe('RewindToTick');
      expect(command.id).toBe('rewind-1');
      expect(command.payload.targetTick).toBe(5);
    });

    it('setBreakpoint 명령을 생성할 수 있어야 한다', () => {
      const command = builder
        .withId('breakpoint-1')
        .setBreakpoint('function', 'testFunction');

      expect(command.type).toBe('SetBreakpoint');
      expect(command.id).toBe('breakpoint-1');
      expect(command.payload.condition).toBe('function');
      expect(command.payload.value).toBe('testFunction');
    });

    it('메타데이터가 포함된 명령을 생성할 수 있어야 한다', () => {
      const metadata: CommandMetadata = {
        sessionId: 'session-123',
        source: 'test',
        correlationId: 'corr-456'
      };

      const command = builder
        .withId('meta-1')
        .withMetadata(metadata)
        .executeTick();

      expect(command.metadata).toEqual(metadata);
    });

    it('커스텀 타임스탬프를 설정할 수 있어야 한다', () => {
      const customTimestamp = 1234567890;

      const command = builder
        .withId('time-1')
        .withTimestamp(customTimestamp)
        .executeTick();

      expect(command.timestamp).toBe(customTimestamp);
    });

    it('ID가 설정되지 않으면 자동으로 생성해야 한다', () => {
      const command = builder
        .executeTick();

      expect(command.id).toBeDefined();
      expect(command.id).toMatch(/^cmd_\d+_[a-z0-9]+$/);
    });

    it('타임스탬프가 설정되지 않으면 자동으로 생성해야 한다', () => {
      const before = Date.now();
      const command = builder
        .withId('test-id')
        .executeTick();
      const after = Date.now();

      expect(command.timestamp).toBeGreaterThanOrEqual(before);
      expect(command.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('validateCommand', () => {
    it('유효한 PushFunction 명령을 검증해야 한다', () => {
      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'testFunction',
          context: {},
          priority: 'normal'
        }
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('유효한 PopFunction 명령을 검증해야 한다', () => {
      const command: PopFunctionCommand = {
        type: 'PopFunction',
        id: 'cmd-2',
        timestamp: Date.now(),
        payload: {}
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('유효한 EnqueueMicrotask 명령을 검증해야 한다', () => {
      const command: EnqueueMicrotaskCommand = {
        type: 'EnqueueMicrotask',
        id: 'cmd-3',
        timestamp: Date.now(),
        payload: {
          taskName: 'promiseCallback',
          source: 'promise',
          priority: 'high'
        }
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('유효한 EnqueueMacrotask 명령을 검증해야 한다', () => {
      const command: EnqueueMacrotaskCommand = {
        type: 'EnqueueMacrotask',
        id: 'cmd-4',
        timestamp: Date.now(),
        payload: {
          taskName: 'timeoutCallback',
          source: 'setTimeout',
          priority: 'normal',
          delay: 1000
        }
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('유효한 ExecuteTick 명령을 검증해야 한다', () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'cmd-5',
        timestamp: Date.now(),
        payload: {}
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('유효한 RewindToTick 명령을 검증해야 한다', () => {
      const command: RewindToTickCommand = {
        type: 'RewindToTick',
        id: 'cmd-6',
        timestamp: Date.now(),
        payload: {
          targetTick: 10
        }
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('ID가 없는 명령을 거부해야 한다', () => {
      const command = {
        type: 'ExecuteTick',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('타입이 없는 명령을 거부해야 한다', () => {
      const command = {
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('타임스탬프가 없는 명령을 거부해야 한다', () => {
      const command = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        payload: {}
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('payload가 없는 명령을 거부해야 한다', () => {
      const command = {
        type: 'ExecuteTick',
        id: 'cmd-1',
        timestamp: Date.now()
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('PushFunction에서 functionName이 없는 경우를 거부해야 한다', () => {
      const command = {
        type: 'PushFunction',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          context: {},
          priority: 'normal'
        }
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('EnqueueMicrotask에서 taskName이 없는 경우를 거부해야 한다', () => {
      const command = {
        type: 'EnqueueMicrotask',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          source: 'promise',
          priority: 'high'
        }
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('EnqueueMicrotask에서 source가 없는 경우를 거부해야 한다', () => {
      const command = {
        type: 'EnqueueMicrotask',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          taskName: 'test',
          priority: 'high'
        }
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('RewindToTick에서 targetTick이 없는 경우를 거부해야 한다', () => {
      const command = {
        type: 'RewindToTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('RewindToTick에서 음수 targetTick을 거부해야 한다', () => {
      const command = {
        type: 'RewindToTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          targetTick: -1
        }
      } as any;

      expect(validateCommand(command)).toBe(false);
    });
  });

  describe('getCommandPriority', () => {
    it('PauseExecution 명령이 가장 높은 우선순위를 가져야 한다', () => {
      const command: PauseExecutionCommand = {
        type: 'PauseExecution',
        id: 'pause-1',
        timestamp: Date.now(),
        payload: {}
      };
      expect(getCommandPriority(command)).toBe(0);
    });

    it('ResetEngine 명령이 가장 높은 우선순위를 가져야 한다', () => {
      const command: ResetEngineCommand = {
        type: 'ResetEngine',
        id: 'reset-1',
        timestamp: Date.now(),
        payload: {}
      };
      expect(getCommandPriority(command)).toBe(0);
    });

    it('PushFunction 명령이 높은 우선순위를 가져야 한다', () => {
      const command: PushFunctionCommand = {
        type: 'PushFunction',
        id: 'push-1',
        timestamp: Date.now(),
        payload: {
          functionName: 'test',
          context: {},
          priority: 'normal'
        }
      };
      expect(getCommandPriority(command)).toBe(1);
    });

    it('PopFunction 명령이 높은 우선순위를 가져야 한다', () => {
      const command: PopFunctionCommand = {
        type: 'PopFunction',
        id: 'pop-1',
        timestamp: Date.now(),
        payload: {}
      };
      expect(getCommandPriority(command)).toBe(1);
    });

    it('ExecuteTick 명령이 보통 우선순위를 가져야 한다', () => {
      const command: ExecuteTickCommand = {
        type: 'ExecuteTick',
        id: 'tick-1',
        timestamp: Date.now(),
        payload: {}
      };
      expect(getCommandPriority(command)).toBe(2);
    });

    it('EnqueueMicrotask 명령이 낮은 우선순위를 가져야 한다', () => {
      const command: EnqueueMicrotaskCommand = {
        type: 'EnqueueMicrotask',
        id: 'micro-1',
        timestamp: Date.now(),
        payload: {
          taskName: 'test',
          source: 'promise',
          priority: 'high'
        }
      };
      expect(getCommandPriority(command)).toBe(3);
    });

    it('EnqueueMacrotask 명령이 가장 낮은 우선순위를 가져야 한다', () => {
      const command: EnqueueMacrotaskCommand = {
        type: 'EnqueueMacrotask',
        id: 'macro-1',
        timestamp: Date.now(),
        payload: {
          taskName: 'test',
          source: 'setTimeout',
          priority: 'normal'
        }
      };
      expect(getCommandPriority(command)).toBe(4);
    });
  });

  describe('createCommand', () => {
    it('헬퍼 함수로 빌더를 생성할 수 있어야 한다', () => {
      const builder = createCommand('test-session', 'ui');

      expect(builder).toBeInstanceOf(CommandBuilder);
    });

    it('기본 source 값을 사용할 수 있어야 한다', () => {
      const builder = createCommand('test-session');
      const command = builder.withId('test').executeTick();

      expect(command.metadata?.source).toBe('user');
      expect(command.metadata?.sessionId).toBe('test-session');
    });

    it('커스텀 source 값을 설정할 수 있어야 한다', () => {
      const builder = createCommand('test-session', 'api');
      const command = builder.withId('test').executeTick();

      expect(command.metadata?.source).toBe('api');
      expect(command.metadata?.sessionId).toBe('test-session');
    });

    it('자동으로 correlationId를 생성해야 한다', () => {
      const builder = createCommand('test-session');
      const command = builder.withId('test').executeTick();

      expect(command.metadata?.correlationId).toBeDefined();
      expect(command.metadata?.correlationId).toMatch(/^corr_\d+$/);
    });

    it('타임스탬프가 자동으로 설정되어야 한다', () => {
      const before = Date.now();
      const builder = createCommand('test-session');
      const command = builder.withId('test').executeTick();
      const after = Date.now();

      expect(command.timestamp).toBeGreaterThanOrEqual(before);
      expect(command.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('엣지 케이스', () => {
    it('null 명령을 거부해야 한다', () => {
      expect(validateCommand(null as any)).toBe(false);
    });

    it('undefined 명령을 거부해야 한다', () => {
      expect(validateCommand(undefined as any)).toBe(false);
    });

    it('빈 객체를 거부해야 한다', () => {
      expect(validateCommand({} as any)).toBe(false);
    });

    it('문자열을 거부해야 한다', () => {
      expect(validateCommand('invalid' as any)).toBe(false);
    });

    it('숫자를 거부해야 한다', () => {
      expect(validateCommand(123 as any)).toBe(false);
    });

    it('배열을 거부해야 한다', () => {
      expect(validateCommand([] as any)).toBe(false);
    });

    it('빈 ID를 가진 명령을 거부해야 한다', () => {
      const command = {
        type: 'ExecuteTick',
        id: '',
        timestamp: Date.now(),
        payload: {}
      } as any;

      expect(validateCommand(command)).toBe(false);
    });

    it('RewindToTick에서 0 targetTick을 허용해야 한다', () => {
      const command: RewindToTickCommand = {
        type: 'RewindToTick',
        id: 'cmd-1',
        timestamp: Date.now(),
        payload: {
          targetTick: 0
        }
      };

      expect(validateCommand(command)).toBe(true);
    });

    it('알 수 없는 명령 타입에 대해 default case로 true를 반환해야 한다 (line 356 커버)', () => {
      const unknownCommand = {
        commandId: 'test-unknown',
        timestamp: Date.now(),
        type: 'UnknownCommandType' as any,
        payload: { someData: 'test' }
      };
      
      expect(validateCommand(unknownCommand)).toBe(true);
    });
  });
});