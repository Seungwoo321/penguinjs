/**
 * CQRS Commands - 상태를 변경하는 명령들
 * 
 * Command 패턴과 CQRS를 적용하여 상태 변경 요청을 명령 객체로 캡슐화
 * 각 명령은 검증, 실행, 결과 반환의 책임을 가짐
 */

import { CallStackFrame, MicrotaskItem, MacrotaskItem } from '../event-loop/types';

// 기본 명령 인터페이스
export interface Command {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly metadata?: CommandMetadata;
}

// 명령 메타데이터
export interface CommandMetadata {
  readonly userId?: string;
  readonly sessionId: string;
  readonly correlationId?: string;
  readonly source: string;
  readonly userAgent?: string;
}

// 명령 실행 결과
export interface CommandResult {
  readonly success: boolean;
  readonly commandId: string;
  readonly events: string[]; // 생성된 이벤트 ID 목록
  readonly error?: Error;
  readonly executionTime: number;
}

// === 콜스택 관련 명령들 ===

export interface PushFunctionCommand extends Command {
  type: 'PushFunction';
  payload: {
    functionName: string;
    context?: {
      scope: Record<string, any>;
      parameters?: any[];
    };
    priority?: 'immediate' | 'high' | 'normal' | 'low';
  };
}

export interface PopFunctionCommand extends Command {
  type: 'PopFunction';
  payload: {
    returnValue?: any;
    forceUnwind?: boolean; // 강제로 여러 프레임 해제
    unwindCount?: number;
  };
}

// === 마이크로태스크 관련 명령들 ===

export interface EnqueueMicrotaskCommand extends Command {
  type: 'EnqueueMicrotask';
  payload: {
    taskName: string;
    source: 'promise' | 'queueMicrotask' | 'mutationObserver';
    priority?: 'immediate' | 'high' | 'normal' | 'low';
    callback?: () => any;
  };
}

export interface DequeueMicrotaskCommand extends Command {
  type: 'DequeueMicrotask';
  payload: {
    taskId?: string; // 특정 태스크 제거, 없으면 FIFO
  };
}

// === 매크로태스크 관련 명령들 ===

export interface EnqueueMacrotaskCommand extends Command {
  type: 'EnqueueMacrotask';
  payload: {
    taskName: string;
    source: 'setTimeout' | 'setInterval' | 'setImmediate' | 'io' | 'ui';
    delay?: number;
    interval?: number; // setInterval용
    callback?: () => any;
  };
}

export interface CancelMacrotaskCommand extends Command {
  type: 'CancelMacrotask';
  payload: {
    taskId: string;
  };
}

// === 실행 제어 명령들 ===

export interface ExecuteTickCommand extends Command {
  type: 'ExecuteTick';
  payload: {
    mode?: 'step' | 'continuous' | 'until-idle';
    maxTicks?: number;
    speedMs?: number;
  };
}

export interface PauseExecutionCommand extends Command {
  type: 'PauseExecution';
  payload: {
    reason?: string;
  };
}

export interface ResumeExecutionCommand extends Command {
  type: 'ResumeExecution';
  payload: {
    fromTick?: number; // 특정 틱부터 재개
  };
}

export interface ResetEngineCommand extends Command {
  type: 'ResetEngine';
  payload: {
    preserveHistory?: boolean;
    newConfig?: any;
  };
}

// === 디버깅 관련 명령들 ===

export interface SetBreakpointCommand extends Command {
  type: 'SetBreakpoint';
  payload: {
    condition: 'tick' | 'function' | 'queue-size';
    value: any;
    enabled?: boolean;
  };
}

export interface RewindToTickCommand extends Command {
  type: 'RewindToTick';
  payload: {
    targetTick: number;
    preserveForwardHistory?: boolean;
  };
}

// 모든 명령 타입의 유니온
export type GameCommand = 
  | PushFunctionCommand
  | PopFunctionCommand
  | EnqueueMicrotaskCommand
  | DequeueMicrotaskCommand
  | EnqueueMacrotaskCommand
  | CancelMacrotaskCommand
  | ExecuteTickCommand
  | PauseExecutionCommand
  | ResumeExecutionCommand
  | ResetEngineCommand
  | SetBreakpointCommand
  | RewindToTickCommand;

// Mutable 버전의 Command 타입 (빌더 패턴용)
type MutableCommand = {
  -readonly [K in keyof Command]: Command[K];
};

// 명령 빌더
export class CommandBuilder {
  private command: Partial<MutableCommand> = {};

  static create(): CommandBuilder {
    return new CommandBuilder();
  }

  withId(id: string): CommandBuilder {
    this.command.id = id;
    return this;
  }

  withType(type: string): CommandBuilder {
    this.command.type = type;
    return this;
  }

  withTimestamp(timestamp?: number): CommandBuilder {
    this.command.timestamp = timestamp ?? Date.now();
    return this;
  }

  withMetadata(metadata: CommandMetadata): CommandBuilder {
    this.command.metadata = metadata;
    return this;
  }

  // 특정 명령 타입별 빌더 메서드들
  pushFunction(
    functionName: string, 
    context?: any, 
    priority: 'immediate' | 'high' | 'normal' | 'low' = 'normal'
  ): PushFunctionCommand {
    return {
      ...this.getBaseCommand(),
      type: 'PushFunction',
      payload: { functionName, context, priority }
    } as PushFunctionCommand;
  }

  popFunction(returnValue?: any, forceUnwind?: boolean): PopFunctionCommand {
    return {
      ...this.getBaseCommand(),
      type: 'PopFunction',
      payload: { returnValue, forceUnwind }
    } as PopFunctionCommand;
  }

  enqueueMicrotask(
    taskName: string,
    source: MicrotaskItem['source'],
    priority: 'immediate' | 'high' | 'normal' | 'low' = 'normal'
  ): EnqueueMicrotaskCommand {
    return {
      ...this.getBaseCommand(),
      type: 'EnqueueMicrotask',
      payload: { taskName, source, priority }
    } as EnqueueMicrotaskCommand;
  }

  enqueueMacrotask(
    taskName: string,
    source: MacrotaskItem['source'],
    delay?: number
  ): EnqueueMacrotaskCommand {
    return {
      ...this.getBaseCommand(),
      type: 'EnqueueMacrotask',
      payload: { taskName, source, delay }
    } as EnqueueMacrotaskCommand;
  }

  executeTick(
    mode: 'step' | 'continuous' | 'until-idle' = 'step',
    maxTicks?: number
  ): ExecuteTickCommand {
    return {
      ...this.getBaseCommand(),
      type: 'ExecuteTick',
      payload: { mode, maxTicks }
    } as ExecuteTickCommand;
  }

  pauseExecution(reason?: string): PauseExecutionCommand {
    return {
      ...this.getBaseCommand(),
      type: 'PauseExecution',
      payload: { reason }
    } as PauseExecutionCommand;
  }

  resumeExecution(fromTick?: number): ResumeExecutionCommand {
    return {
      ...this.getBaseCommand(),
      type: 'ResumeExecution',
      payload: { fromTick }
    } as ResumeExecutionCommand;
  }

  resetEngine(preserveHistory?: boolean): ResetEngineCommand {
    return {
      ...this.getBaseCommand(),
      type: 'ResetEngine',
      payload: { preserveHistory }
    } as ResetEngineCommand;
  }

  rewindToTick(targetTick: number): RewindToTickCommand {
    return {
      ...this.getBaseCommand(),
      type: 'RewindToTick',
      payload: { targetTick }
    } as RewindToTickCommand;
  }

  setBreakpoint(
    condition: 'tick' | 'function' | 'queue-size',
    value: any,
    enabled: boolean = true
  ): SetBreakpointCommand {
    return {
      ...this.getBaseCommand(),
      type: 'SetBreakpoint',
      payload: { condition, value, enabled }
    } as SetBreakpointCommand;
  }

  getBaseCommand(): Command {
    if (!this.command.id) {
      this.command.id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!this.command.timestamp) {
      this.command.timestamp = Date.now();
    }

    return this.command as Command;
  }
}

// 명령 생성 헬퍼 함수들
export const createCommand = (sessionId: string, source: string = 'user') => {
  const metadata: CommandMetadata = {
    sessionId,
    source,
    correlationId: `corr_${Date.now()}`
  };

  return CommandBuilder.create()
    .withTimestamp()
    .withMetadata(metadata);
};

// 검증 함수들
export const validateCommand = (command: GameCommand): boolean => {
  // null/undefined 체크
  if (!command || typeof command !== 'object') {
    return false;
  }

  // 기본 필드 검증
  if (!command.id || !command.type || !command.timestamp) {
    return false;
  }

  // 페이로드 검증
  if (!command.payload) {
    return false;
  }

  // 타입별 특수 검증
  switch (command.type) {
    case 'PushFunction':
      const pushCmd = command as PushFunctionCommand;
      return !!pushCmd.payload.functionName;

    case 'EnqueueMicrotask':
      const microCmd = command as EnqueueMicrotaskCommand;
      return !!(microCmd.payload.taskName && microCmd.payload.source);

    case 'EnqueueMacrotask':
      const macroCmd = command as EnqueueMacrotaskCommand;
      return !!(macroCmd.payload.taskName && macroCmd.payload.source);

    case 'RewindToTick':
      const rewindCmd = command as RewindToTickCommand;
      return typeof rewindCmd.payload.targetTick === 'number' && rewindCmd.payload.targetTick >= 0;

    default:
      return true;
  }
};

// 명령 우선순위 계산
export const getCommandPriority = (command: GameCommand): number => {
  const priorities: Record<string, number> = {
    'PauseExecution': 0,     // 즉시 실행
    'ResetEngine': 0,        // 즉시 실행
    'PushFunction': 1,       // 높은 우선순위
    'PopFunction': 1,        // 높은 우선순위
    'ExecuteTick': 2,        // 보통 우선순위
    'EnqueueMicrotask': 3,   // 낮은 우선순위
    'EnqueueMacrotask': 4,   // 가장 낮은 우선순위
    'RewindToTick': 5        // 디버깅용 (가장 낮음)
  };

  return priorities[command.type] ?? 99;
};