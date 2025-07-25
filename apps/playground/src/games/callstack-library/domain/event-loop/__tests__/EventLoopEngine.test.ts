/**
 * EventLoopEngine 단위 테스트
 * 
 * JavaScript 이벤트 루프의 핵심 동작을 검증합니다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventLoopEngine } from '../EventLoopEngine';
import { EventLoopConfig, CallStackFrame, MicrotaskItem, MacrotaskItem } from '../types';

describe('EventLoopEngine', () => {
  let engine: EventLoopEngine;
  let defaultConfig: EventLoopConfig;

  beforeEach(() => {
    defaultConfig = {
      maxCallStackSize: 10,
      maxMicrotaskQueueSize: 100,
      maxMacrotaskQueueSize: 100,
      executionTimeout: 5000,
      enableLogging: false
    };
    engine = new EventLoopEngine(defaultConfig);
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      const state = engine.getState();
      
      expect(state.phase).toBe('idle');
      expect(state.isRunning).toBe(false);
      expect(state.currentTick).toBe(0);
      expect(state.callStack).toHaveLength(0);
      expect(state.microtaskQueue).toHaveLength(0);
      expect(state.macrotaskQueue).toHaveLength(0);
    });

    it('실행 이력이 비어있어야 한다', () => {
      expect(engine.getExecutionHistory()).toHaveLength(0);
    });
  });

  describe('콜스택 관리', () => {
    it('콜스택에 함수를 추가할 수 있어야 한다', () => {
      const frame: Omit<CallStackFrame, 'id' | 'createdAt' | 'status'> = {
        type: 'callstack',
        name: 'testFunction',
        priority: 'normal',
        context: {
          id: 'ctx1',
          functionName: 'testFunction',
          scope: {},
          timestamp: Date.now()
        }
      };

      const result = engine.pushToCallStack(frame);
      
      expect(result.success).toBe(true);
      expect(engine.getState().callStack).toHaveLength(1);
      expect(engine.getState().callStack[0].name).toBe('testFunction');
    });

    it('콜스택에서 함수를 제거할 수 있어야 한다', () => {
      // Given: 콜스택에 함수 추가
      engine.pushToCallStack({
        type: 'callstack',
        name: 'function1',
        priority: 'normal'
      });
      engine.pushToCallStack({
        type: 'callstack',
        name: 'function2',
        priority: 'normal'
      });

      // When: 함수 제거
      const result = engine.popFromCallStack();

      // Then
      expect(result.success).toBe(true);
      expect(result.executedTask?.name).toBe('function2');
      expect(engine.getState().callStack).toHaveLength(1);
      expect(engine.getState().callStack[0].name).toBe('function1');
    });

    it('최대 콜스택 크기를 초과하면 스택 오버플로우 에러가 발생해야 한다', () => {
      // Given: 최대 크기만큼 함수 추가
      for (let i = 0; i < defaultConfig.maxCallStackSize; i++) {
        engine.pushToCallStack({
          type: 'callstack',
          name: `function${i}`,
          priority: 'normal'
        });
      }

      // When & Then: 하나 더 추가하면 에러
      expect(() => {
        engine.pushToCallStack({
          type: 'callstack',
          name: 'overflow',
          priority: 'normal'
        });
      }).toThrow('Maximum call stack size exceeded');
    });

    it('빈 콜스택에서 pop하면 에러를 반환해야 한다', () => {
      const result = engine.popFromCallStack();
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Call stack is empty');
    });
  });

  describe('마이크로태스크 큐 관리', () => {
    it('마이크로태스크를 큐에 추가할 수 있어야 한다', () => {
      const task: Omit<MicrotaskItem, 'id' | 'createdAt' | 'status'> = {
        type: 'microtask',
        name: 'promiseCallback',
        priority: 'high',
        source: 'promise'
      };

      const result = engine.enqueueMicrotask(task);
      
      expect(result.success).toBe(true);
      expect(engine.getState().microtaskQueue).toHaveLength(1);
      expect(engine.getState().microtaskQueue[0].name).toBe('promiseCallback');
    });

    it('큐가 가득 차면 에러를 반환해야 한다', () => {
      // Given: 큐를 가득 채움
      const smallConfig = { ...defaultConfig, maxMicrotaskQueueSize: 2 };
      const smallEngine = new EventLoopEngine(smallConfig);

      smallEngine.enqueueMicrotask({
        type: 'microtask',
        name: 'task1',
        priority: 'normal',
        source: 'promise'
      });
      smallEngine.enqueueMicrotask({
        type: 'microtask',
        name: 'task2',
        priority: 'normal',
        source: 'promise'
      });

      // When & Then
      const result = smallEngine.enqueueMicrotask({
        type: 'microtask',
        name: 'task3',
        priority: 'normal',
        source: 'promise'
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Microtask queue is full');
    });
  });

  describe('매크로태스크 큐 관리', () => {
    it('매크로태스크를 큐에 추가할 수 있어야 한다', () => {
      const task: Omit<MacrotaskItem, 'id' | 'createdAt' | 'status'> = {
        type: 'macrotask',
        name: 'setTimeout',
        priority: 'normal',
        source: 'setTimeout',
        delay: 100
      };

      const result = engine.enqueueMacrotask(task);
      
      expect(result.success).toBe(true);
      expect(engine.getState().macrotaskQueue).toHaveLength(1);
      expect(engine.getState().macrotaskQueue[0].name).toBe('setTimeout');
    });

    it('큐가 가득 차면 에러를 반환해야 한다', () => {
      // Given: 큐를 가득 채움
      const smallConfig = { ...defaultConfig, maxMacrotaskQueueSize: 2 };
      const smallEngine = new EventLoopEngine(smallConfig);

      smallEngine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      smallEngine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task2',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });

      // When & Then
      const result = smallEngine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task3',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Macrotask queue is full');
    });

    it('지연 시간에 따라 정렬되어야 한다', () => {
      // Given: 다른 지연 시간을 가진 태스크들
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task3',
        priority: 'normal',
        source: 'setTimeout',
        delay: 300
      });
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 100
      });
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task2',
        priority: 'normal',
        source: 'setTimeout',
        delay: 200
      });

      // Then: 지연 시간 순으로 정렬
      const queue = engine.getState().macrotaskQueue;
      expect(queue[0].name).toBe('task1');
      expect(queue[1].name).toBe('task2');
      expect(queue[2].name).toBe('task3');
    });
  });

  describe('이벤트 루프 실행', () => {
    it('빈 상태에서 틱을 실행하면 idle 상태가 되어야 한다', () => {
      const result = engine.tick();
      
      expect(result.success).toBe(true);
      expect(engine.getState().phase).toBe('idle');
      expect(engine.getState().isRunning).toBe(false);
      expect(engine.getState().currentTick).toBe(1);
    });

    it('마이크로태스크가 매크로태스크보다 먼저 실행되어야 한다', () => {
      // Given: 매크로태스크와 마이크로태스크 모두 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'macro1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      engine.enqueueMicrotask({
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        source: 'promise'
      });

      // When: 틱 실행
      const result = engine.tick();

      // Then: 마이크로태스크가 실행되고 매크로태스크는 남아있음
      expect(result.success).toBe(true);
      expect(engine.getState().microtaskQueue).toHaveLength(0);
      expect(engine.getState().macrotaskQueue).toHaveLength(1);
    });

    it('한 틱에 모든 마이크로태스크가 처리되어야 한다', () => {
      // Given: 여러 마이크로태스크 추가
      for (let i = 0; i < 5; i++) {
        engine.enqueueMicrotask({
          type: 'microtask',
          name: `micro${i}`,
          priority: 'normal',
          source: 'promise'
        });
      }

      // When: 한 번의 틱 실행
      engine.tick();

      // Then: 모든 마이크로태스크 처리됨
      expect(engine.getState().microtaskQueue).toHaveLength(0);
    });

    it('한 틱에 하나의 매크로태스크만 처리되어야 한다', () => {
      // Given: 여러 매크로태스크 추가
      for (let i = 0; i < 3; i++) {
        engine.enqueueMacrotask({
          type: 'macrotask',
          name: `macro${i}`,
          priority: 'normal',
          source: 'setTimeout',
          delay: 0
        });
      }

      // When: 한 번의 틱 실행
      engine.tick();

      // Then: 하나의 매크로태스크만 처리됨
      expect(engine.getState().macrotaskQueue).toHaveLength(2);
    });

    it('콜스택이 비어있지 않으면 큐 처리를 하지 않아야 한다', () => {
      // Given: 콜스택에 함수 추가
      engine.pushToCallStack({
        type: 'callstack',
        name: 'activeFunction',
        priority: 'normal'
      });
      
      // 마이크로태스크와 매크로태스크 추가
      engine.enqueueMicrotask({
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        source: 'promise'
      });
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'macro1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });

      // When: 틱 실행
      engine.tick();

      // Then: 큐들이 처리되지 않음
      expect(engine.getState().microtaskQueue).toHaveLength(1);
      expect(engine.getState().macrotaskQueue).toHaveLength(1);
    });
  });

  describe('상태 관리', () => {
    it('상태를 리셋할 수 있어야 한다', () => {
      // Given: 상태 변경
      engine.pushToCallStack({
        type: 'callstack',
        name: 'test',
        priority: 'normal'
      });
      engine.tick();

      // When: 리셋
      engine.reset();

      // Then: 초기 상태로 복원
      const state = engine.getState();
      expect(state.currentTick).toBe(0);
      expect(state.callStack).toHaveLength(0);
      expect(engine.getExecutionHistory()).toHaveLength(0);
    });

    it('특정 틱으로 되돌릴 수 있어야 한다 (Time Travel)', () => {
      // Given: 여러 틱 실행
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      
      engine.tick(); // tick 1
      
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task2',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      
      engine.tick(); // tick 2
      engine.tick(); // tick 3

      // When: 틱 1로 되돌리기
      const previousState = engine.rewindToTick(1);

      // Then: 틱 1의 상태 확인
      expect(previousState.currentTick).toBe(1);
      expect(previousState.macrotaskQueue).toHaveLength(0);
    });

    it('잘못된 틱 번호로 되돌리려고 하면 에러가 발생해야 한다', () => {
      expect(() => engine.rewindToTick(-1)).toThrow('Invalid tick number');
      expect(() => engine.rewindToTick(10)).toThrow('Invalid tick number');
    });
  });

  describe('이벤트 및 콜백', () => {
    it('틱 콜백을 등록하고 호출되어야 한다', () => {
      const callback = vi.fn();
      
      // Given: 콜백 등록
      const unsubscribe = engine.onTick(callback);

      // When: 틱 실행
      engine.tick();

      // Then: 콜백 호출됨
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        currentTick: 1
      }));
    });

    it('콜백을 구독 해제할 수 있어야 한다', () => {
      const callback = vi.fn();
      
      // Given: 콜백 등록 후 해제
      const unsubscribe = engine.onTick(callback);
      unsubscribe();

      // When: 틱 실행
      engine.tick();

      // Then: 콜백 호출되지 않음
      expect(callback).not.toHaveBeenCalled();
    });

    it('실행 결과에 부수 효과가 포함되어야 한다', () => {
      // When: 마이크로태스크 추가
      const result = engine.enqueueMicrotask({
        type: 'microtask',
        name: 'testTask',
        priority: 'normal',
        source: 'promise'
      });

      // Then: 부수 효과 확인
      expect(result.sideEffects).toHaveLength(1);
      expect(result.sideEffects[0].type).toBe('console');
      expect(result.sideEffects[0].description).toContain('testTask');
    });
  });

  describe('커스텀 실행 정책', () => {
    it('커스텀 정책을 사용할 수 있어야 한다', () => {
      const customPolicy = {
        shouldProcessMicrotasks: vi.fn().mockReturnValue(false),
        shouldProcessMacrotask: vi.fn().mockReturnValue(false),
        getNextMacrotask: vi.fn(),
        handleStackOverflow: vi.fn(),
        handleTimeout: vi.fn()
      };

      const customEngine = new EventLoopEngine(defaultConfig, customPolicy);
      
      // Given: 마이크로태스크 추가
      customEngine.enqueueMicrotask({
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        source: 'promise'
      });

      // When: 틱 실행
      customEngine.tick();

      // Then: 커스텀 정책이 호출되고 마이크로태스크가 처리되지 않음
      expect(customPolicy.shouldProcessMicrotasks).toHaveBeenCalled();
      expect(customEngine.getState().microtaskQueue).toHaveLength(1);
    });

    it('커스텀 스택 오버플로우 핸들러가 호출되어야 한다', () => {
      const customPolicy = {
        shouldProcessMicrotasks: () => true,
        shouldProcessMacrotask: () => true,
        getNextMacrotask: () => null,
        handleStackOverflow: vi.fn(),
        handleTimeout: vi.fn()
      };

      const smallConfig = { ...defaultConfig, maxCallStackSize: 1 };
      const customEngine = new EventLoopEngine(smallConfig, customPolicy);
      
      // Given: 스택 가득 채움
      customEngine.pushToCallStack({
        type: 'callstack',
        name: 'func1',
        priority: 'normal'
      });

      // When: 추가 시도
      customEngine.pushToCallStack({
        type: 'callstack',
        name: 'func2',
        priority: 'normal'
      });

      // Then: 커스텀 핸들러 호출됨
      expect(customPolicy.handleStackOverflow).toHaveBeenCalled();
    });
  });

  describe('실행 이력', () => {
    it('모든 작업이 실행 이력에 기록되어야 한다', () => {
      // Given & When: 여러 작업 수행
      engine.pushToCallStack({
        type: 'callstack',
        name: 'func1',
        priority: 'normal'
      });
      
      engine.enqueueMicrotask({
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        source: 'promise'
      });
      
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'macro1',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });

      // Then: 실행 이력 확인
      const history = engine.getExecutionHistory();
      expect(history).toHaveLength(3);
      expect(history[0].success).toBe(true);
      expect(history[1].success).toBe(true);
      expect(history[2].success).toBe(true);
    });
  });

  describe('지연된 매크로태스크 처리', () => {
    it('지연 시간이 지나지 않은 태스크는 실행되지 않아야 한다', () => {
      // Given: 현재 시간 고정
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      // 미래에 실행될 태스크 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'delayedTask',
        priority: 'normal',
        source: 'setTimeout',
        delay: 1000
      });

      // When: 틱 실행 (아직 시간이 안 지남)
      engine.tick();

      // Then: 태스크가 실행되지 않음
      expect(engine.getState().macrotaskQueue).toHaveLength(1);
      
      // When: 시간이 지난 후
      vi.spyOn(Date, 'now').mockReturnValue(now + 1001);
      engine.tick();

      // Then: 태스크가 실행됨
      expect(engine.getState().macrotaskQueue).toHaveLength(0);
    });
  });

  describe('로깅 설정', () => {
    it('로깅이 활성화되면 콘솔에 로그가 출력되어야 한다', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const loggingConfig = { ...defaultConfig, enableLogging: true };
      const loggingEngine = new EventLoopEngine(loggingConfig);
      
      // When: 작업 수행
      loggingEngine.pushToCallStack({
        type: 'callstack',
        name: 'testFunc',
        priority: 'normal'
      });

      // Then: 로그 출력됨
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[EventLoopEngine]',
        expect.objectContaining({ success: true })
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('엣지 케이스 - 누락된 커버리지', () => {
    it('tick 실행 중 예외가 발생하면 isRunning이 false로 설정되어야 한다', () => {
      // Given: shouldProcessMicrotasks에서 예외를 던지도록 정책 모킹
      const errorPolicy = {
        shouldProcessMicrotasks: () => {
          throw new Error('Policy error');
        },
        shouldProcessMacrotask: () => true,
        getNextMacrotask: () => null,
        handleStackOverflow: vi.fn(),
        handleTimeout: vi.fn()
      };

      const errorEngine = new EventLoopEngine(defaultConfig, errorPolicy);
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 에러 결과와 isRunning이 false
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Policy error');
      expect(errorEngine.getState().isRunning).toBe(false);
    });

    it('processAllMicrotasks가 실패를 반환하는 경우를 처리해야 한다', () => {
      // Given: 잘못된 마이크로태스크를 큐에 주입
      const errorEngine = new EventLoopEngine(defaultConfig);
      
      // 마이크로태스크 큐에 직접 접근하여 잘못된 데이터 주입
      const state = errorEngine.getState();
      // @ts-ignore - 테스트를 위해 의도적으로 잘못된 데이터 주입
      state.microtaskQueue.push({ id: 'bad', type: 'microtask', priority: 'normal', status: 'pending', createdAt: Date.now() } as any);
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid microtask: missing required properties');
    });

    it('processOneMacrotask가 실패를 반환하는 경우를 처리해야 한다', () => {
      // Given: 잘못된 매크로태스크를 큐에 주입
      const errorEngine = new EventLoopEngine(defaultConfig);
      
      // 매크로태스크 큐에 직접 접근하여 잘못된 데이터 주입
      const state = errorEngine.getState();
      // @ts-ignore - 테스트를 위해 의도적으로 잘못된 데이터 주입
      state.macrotaskQueue.push({ id: 'bad', type: 'macrotask', priority: 'normal', status: 'pending', createdAt: Date.now(), source: 'test' } as any);
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid macrotask: missing required properties');
    });

    it('processAllMicrotasks에서 예외가 발생하는 경우를 처리해야 한다', () => {
      // Given: shift 메서드를 예외를 던지도록 모킹
      const errorEngine = new EventLoopEngine(defaultConfig);
      errorEngine.enqueueMicrotask({
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        source: 'promise'
      });
      
      // shift 메서드를 오버라이드하여 예외 발생
      const state = errorEngine.getState();
      const originalShift = state.microtaskQueue.shift;
      state.microtaskQueue.shift = function() {
        throw new Error('Queue manipulation error');
      };
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Queue manipulation error');
      
      // 원래 메서드 복원
      state.microtaskQueue.shift = originalShift;
    });

    it('processOneMacrotask에서 예외가 발생하는 경우를 처리해야 한다', () => {
      // Given: find 메서드를 예외를 던지도록 모킹
      const errorEngine = new EventLoopEngine(defaultConfig);
      errorEngine.enqueueMacrotask({
        type: 'macrotask',
        name: 'test',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      
      // find 메서드를 오버라이드하여 예외 발생
      const state = errorEngine.getState();
      const originalFind = state.macrotaskQueue.find;
      state.macrotaskQueue.find = function() {
        throw new Error('Queue search error');
      };
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Queue search error');
      
      // 원래 메서드 복원
      state.macrotaskQueue.find = originalFind;
    });

    it('processOneMacrotask에서 태스크가 큐에서 찾을 수 없는 경우를 처리해야 한다', () => {
      // Given: 태스크를 추가하고 find는 해당 태스크를 반환하지만 indexOf는 -1을 반환하도록 설정
      const errorEngine = new EventLoopEngine(defaultConfig);
      errorEngine.enqueueMacrotask({
        type: 'macrotask',
        name: 'test',
        priority: 'normal',
        source: 'setTimeout',
        delay: 0
      });
      
      // indexOf 메서드를 오버라이드하여 -1 반환
      const state = errorEngine.getState();
      const originalIndexOf = state.macrotaskQueue.indexOf;
      state.macrotaskQueue.indexOf = function() {
        return -1;
      };
      
      // When: tick 실행
      const result = errorEngine.tick();

      // Then: 실패 결과 반환
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Macrotask not found in queue');
      
      // 원래 메서드 복원
      state.macrotaskQueue.indexOf = originalIndexOf;
    });
  });

  describe('타임아웃 핸들링', () => {
    it('기본 정책의 handleTimeout이 호출되면 에러를 던져야 한다', () => {
      // Given: 기본 정책 사용
      const engine = new EventLoopEngine(defaultConfig);
      
      // 기본 정책에 직접 접근 (private이지만 테스트를 위해)
      const policy = (engine as any).policy;
      
      // When & Then: handleTimeout 호출 시 에러 발생
      expect(() => policy.handleTimeout()).toThrow('Execution timeout');
    });

    it('커스텀 타임아웃 핸들러가 호출되어야 한다', () => {
      // Given: 커스텀 타임아웃 핸들러를 가진 정책
      const customPolicy = {
        shouldProcessMicrotasks: () => true,
        shouldProcessMacrotask: () => true,
        getNextMacrotask: () => null,
        handleStackOverflow: vi.fn(),
        handleTimeout: vi.fn()
      };

      const customEngine = new EventLoopEngine(defaultConfig, customPolicy);
      
      // When: 정책의 handleTimeout 호출
      customPolicy.handleTimeout();

      // Then: 커스텀 핸들러가 호출됨
      expect(customPolicy.handleTimeout).toHaveBeenCalled();
    });
  });

  describe('매크로태스크 정렬', () => {
    it('scheduledAt이 없는 매크로태스크를 올바르게 정렬해야 한다', () => {
      const engine = new EventLoopEngine(defaultConfig);
      
      // delay가 있는 태스크 먼저 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'delayed-task',
        priority: 'normal',
        source: 'setTimeout',
        delay: 100
      });
      
      // scheduledAt이 없는 태스크 추가 (즉시 실행)
      const result = engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'immediate-task',
        priority: 'normal',
        source: 'setImmediate'
      });
      
      expect(result.success).toBe(true);
      
      const state = engine.getState();
      // scheduledAt이 없는 태스크가 먼저 와야 함
      expect(state.macrotaskQueue[0].name).toBe('immediate-task');
      expect(state.macrotaskQueue[1].name).toBe('delayed-task');
    });

    it('모든 태스크의 scheduledAt이 없을 때 올바르게 처리해야 한다', () => {
      const engine = new EventLoopEngine(defaultConfig);
      
      // scheduledAt이 없는 태스크들만 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        source: 'setImmediate'
      });
      
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'task2',
        priority: 'normal',
        source: 'setImmediate'
      });
      
      const state = engine.getState();
      // 추가된 순서대로 유지되어야 함
      expect(state.macrotaskQueue[0].name).toBe('task1');
      expect(state.macrotaskQueue[1].name).toBe('task2');
      expect(state.macrotaskQueue[0].scheduledAt).toBeDefined();
      expect(state.macrotaskQueue[1].scheduledAt).toBeDefined();
      // 추가된 순서대로 scheduledAt도 증가해야 함
      expect(state.macrotaskQueue[0].scheduledAt).toBeLessThanOrEqual(state.macrotaskQueue[1].scheduledAt!);
    });

    it('혼합된 scheduledAt 값들을 올바르게 정렬해야 한다', () => {
      const engine = new EventLoopEngine(defaultConfig);
      const now = Date.now();
      
      // 먼저 delay가 있는 태스크 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'delayed-200',
        priority: 'normal',
        source: 'setTimeout',
        delay: 200
      });
      
      // scheduledAt이 없는 태스크 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'no-scheduled',
        priority: 'normal',
        source: 'setImmediate'
      });
      
      // delay가 짧은 태스크 추가
      engine.enqueueMacrotask({
        type: 'macrotask',
        name: 'delayed-50',
        priority: 'normal',
        source: 'setTimeout',
        delay: 50
      });
      
      const state = engine.getState();
      // scheduledAt이 없는 것이 가장 먼저, 그 다음 delay 순서대로
      expect(state.macrotaskQueue[0].name).toBe('no-scheduled');
      expect(state.macrotaskQueue[1].name).toBe('delayed-50');
      expect(state.macrotaskQueue[2].name).toBe('delayed-200');
    });
  });
});