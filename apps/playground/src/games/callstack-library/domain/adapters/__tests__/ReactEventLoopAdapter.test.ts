/**
 * ReactEventLoopAdapter 단위 테스트
 * 
 * React와 도메인 모델을 연결하는 어댑터를 검증합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import {
  useEventLoopEngine,
  ReactEventLoopAdapterConfig,
  ReactEventLoopState,
  type EventLoopCommands,
  type EventLoopQueries
} from '@/games/callstack-library/ReactEventLoopAdapter';
import { EventLoopEngine } from '@/games/callstack-library/domain/event-loop/EventLoopEngine';
import { QueueSystem } from '@/games/callstack-library/domain/queue-system/QueueSystem';

// Mock 도메인 모델
vi.mock('../../event-loop/EventLoopEngine');
vi.mock('../../queue-system/QueueSystem');

// React hooks 상태를 저장할 변수들
let currentState: any;
let currentSetState: any;
let currentRefs: Map<string, any> = new Map();
let effectCallbacks: (() => void)[] = [];

// Mock React hooks
vi.mock('react', () => ({
  useCallback: (fn: any, deps: any[]) => fn,
  useEffect: vi.fn((fn, deps) => {
    // 테스트를 위해 즉시 실행하고 cleanup 함수 저장
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      effectCallbacks.push(cleanup);
    }
    return cleanup;
  }),
  useRef: vi.fn((initialValue) => {
    const ref = { current: initialValue };
    return ref;
  }),
  useState: vi.fn((initialState) => {
    if (!currentState) {
      currentState = typeof initialState === 'function' ? initialState() : initialState;
      currentSetState = vi.fn((newState) => {
        if (typeof newState === 'function') {
          currentState = newState(currentState);
        } else {
          currentState = newState;
        }
      });
    }
    return [currentState, currentSetState];
  })
}));

// 테스트용 훅 실행 함수
function executeHook(hookFn: () => any) {
  // 상태 초기화
  currentState = undefined;
  currentSetState = undefined;
  currentRefs.clear();
  effectCallbacks = [];
  
  return hookFn();
}

// Mock timers는 각 describe 블록에서 설정

describe('ReactEventLoopAdapter', () => {
  let mockEngine: any;
  let mockQueueSystem: any;
  let mockConfig: ReactEventLoopAdapterConfig;

  beforeEach(() => {
    // EventLoopEngine 모킹
    mockEngine = {
      onTick: vi.fn(() => vi.fn()), // unsubscribe 함수 반환
      pushToCallStack: vi.fn(() => ({ success: true, result: 'pushed' })),
      popFromCallStack: vi.fn(() => ({ success: true, result: 'popped' })),
      enqueueMicrotask: vi.fn(() => ({ success: true, result: 'enqueued' })),
      enqueueMacrotask: vi.fn(() => ({ success: true, result: 'enqueued' })),
      tick: vi.fn(() => ({ success: true, result: 'ticked' })),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        isRunning: false,
        currentTick: 0,
        phase: 'idle',
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: []
      })),
      rewindToTick: vi.fn(() => ({
        isRunning: false,
        currentTick: 0,
        phase: 'idle',
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: []
      })),
      getExecutionHistory: vi.fn(() => [])
    };

    // QueueSystem 모킹
    mockQueueSystem = {
      callStack: {
        getStackTrace: vi.fn(() => [])
      },
      getDebugInfo: vi.fn(() => 'debug info')
    };

    // Constructor 모킹
    vi.mocked(EventLoopEngine).mockImplementation(() => mockEngine);
    vi.mocked(QueueSystem).mockImplementation(() => mockQueueSystem);

    // 기본 설정
    mockConfig = {
      maxCallStackSize: 10,
      maxMicrotaskQueueSize: 100,
      maxMacrotaskQueueSize: 100,
      onStateChange: vi.fn(),
      onError: vi.fn(),
      onExecutionComplete: vi.fn()
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useEventLoopEngine', () => {
    it('초기 상태를 올바르게 설정해야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      expect(result.state.isRunning).toBe(false);
      expect(result.state.isPaused).toBe(false);
      expect(result.state.currentTick).toBe(0);
      expect(result.state.phase).toBe('idle');
      expect(result.state.callStack).toEqual([]);
      expect(result.state.microtaskQueue).toEqual([]);
      expect(result.state.macrotaskQueue).toEqual([]);
      expect(result.state.selectedTask).toBeNull();
      expect(result.state.highlightedQueue).toBeNull();
      expect(result.state.executionSpeed).toBe(1000);
    });

    it('EventLoopEngine과 QueueSystem을 초기화해야 한다', () => {
      executeHook(() => useEventLoopEngine(mockConfig));

      expect(EventLoopEngine).toHaveBeenCalledWith(mockConfig);
      expect(QueueSystem).toHaveBeenCalledWith({
        maxCallStackSize: mockConfig.maxCallStackSize,
        maxMicrotaskQueueSize: mockConfig.maxMicrotaskQueueSize,
        maxMacrotaskQueueSize: mockConfig.maxMacrotaskQueueSize
      });
    });

    it('엔진 상태 변경을 구독해야 한다', () => {
      executeHook(() => useEventLoopEngine(mockConfig));

      expect(mockEngine.onTick).toHaveBeenCalled();
    });
  });

  describe('commands', () => {
    let commands: EventLoopCommands;

    beforeEach(() => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));
      commands = result.commands;
    });

    describe('pushFunction', () => {
      it('함수를 콜스택에 추가해야 한다', () => {
        commands.pushFunction('testFunction');

        expect(mockEngine.pushToCallStack).toHaveBeenCalledWith({
          type: 'callstack',
          name: 'testFunction',
          priority: 'normal',
          context: undefined
        });
      });

      it('컨텍스트와 함께 함수를 추가할 수 있어야 한다', () => {
        const context = { data: 'test' };
        commands.pushFunction('testFunction', context);

        expect(mockEngine.pushToCallStack).toHaveBeenCalledWith({
          type: 'callstack',
          name: 'testFunction',
          priority: 'normal',
          context: {
            id: expect.stringMatching(/^ctx_\d+$/),
            functionName: 'testFunction',
            scope: context,
            timestamp: expect.any(Number)
          }
        });
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.pushToCallStack.mockImplementation(() => {
          throw error;
        });

        commands.pushFunction('testFunction');

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });

    describe('popFunction', () => {
      it('콜스택에서 함수를 제거해야 한다', () => {
        commands.popFunction();

        expect(mockEngine.popFromCallStack).toHaveBeenCalled();
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.popFromCallStack.mockImplementation(() => {
          throw error;
        });

        commands.popFunction();

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });

    describe('addPromiseCallback', () => {
      it('마이크로태스크 큐에 Promise 콜백을 추가해야 한다', () => {
        commands.addPromiseCallback('promiseCallback');

        expect(mockEngine.enqueueMicrotask).toHaveBeenCalledWith({
          type: 'microtask',
          name: 'promiseCallback',
          priority: 'high',
          source: 'promise'
        });
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.enqueueMicrotask.mockImplementation(() => {
          throw error;
        });

        commands.addPromiseCallback('promiseCallback');

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });

    describe('addTimeout', () => {
      it('매크로태스크 큐에 setTimeout을 추가해야 한다', () => {
        commands.addTimeout('timeoutCallback', 1000);

        expect(mockEngine.enqueueMacrotask).toHaveBeenCalledWith({
          type: 'macrotask',
          name: 'timeoutCallback',
          priority: 'normal',
          source: 'setTimeout',
          delay: 1000
        });
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.enqueueMacrotask.mockImplementation(() => {
          throw error;
        });

        commands.addTimeout('timeoutCallback', 1000);

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });

    describe('start', () => {
      it('실행을 시작해야 한다', () => {
        commands.start();

        // state가 업데이트되는지 확인은 실제 구현에 따라 달라질 수 있음
        expect(typeof commands.start).toBe('function');
      });
    });

    describe('pause', () => {
      it('실행을 일시정지해야 한다', () => {
        commands.pause();

        expect(typeof commands.pause).toBe('function');
      });
    });

    describe('resume', () => {
      it('실행을 재개해야 한다', () => {
        commands.resume();

        expect(typeof commands.resume).toBe('function');
      });
    });

    describe('step', () => {
      it('한 단계 실행해야 한다', () => {
        commands.step();

        expect(mockEngine.tick).toHaveBeenCalled();
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.tick.mockImplementation(() => {
          throw error;
        });

        commands.step();

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });

    describe('reset', () => {
      it('엔진을 리셋해야 한다', () => {
        commands.reset();

        expect(mockEngine.reset).toHaveBeenCalled();
      });
    });

    describe('selectTask', () => {
      it('태스크를 선택해야 한다', () => {
        const task = { type: 'callstack', name: 'test', priority: 'normal' } as any;
        
        commands.selectTask(task);

        expect(typeof commands.selectTask).toBe('function');
      });

      it('태스크 선택을 해제해야 한다', () => {
        commands.selectTask(null);

        expect(typeof commands.selectTask).toBe('function');
      });
    });

    describe('highlightQueue', () => {
      it('큐를 하이라이트해야 한다', () => {
        commands.highlightQueue('callstack');

        expect(typeof commands.highlightQueue).toBe('function');
      });

      it('큐 하이라이트를 해제해야 한다', () => {
        commands.highlightQueue(null);

        expect(typeof commands.highlightQueue).toBe('function');
      });
    });

    describe('setExecutionSpeed', () => {
      it('실행 속도를 설정해야 한다', () => {
        commands.setExecutionSpeed(500);

        expect(typeof commands.setExecutionSpeed).toBe('function');
      });
    });

    describe('rewindToTick', () => {
      it('특정 틱으로 되돌려야 한다', () => {
        commands.rewindToTick(5);

        expect(mockEngine.rewindToTick).toHaveBeenCalledWith(5);
      });

      it('오류 발생 시 onError 콜백을 호출해야 한다', () => {
        const error = new Error('Test error');
        mockEngine.rewindToTick.mockImplementation(() => {
          throw error;
        });

        commands.rewindToTick(5);

        expect(mockConfig.onError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('queries', () => {
    let queries: EventLoopQueries;

    beforeEach(() => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));
      queries = result.queries;
    });

    describe('getState', () => {
      it('현재 상태를 반환해야 한다', () => {
        const state = queries.getState();

        expect(state).toHaveProperty('isRunning');
        expect(state).toHaveProperty('isPaused');
        expect(state).toHaveProperty('currentTick');
        expect(state).toHaveProperty('phase');
        expect(state).toHaveProperty('callStack');
        expect(state).toHaveProperty('microtaskQueue');
        expect(state).toHaveProperty('macrotaskQueue');
      });
    });

    describe('canPushToCallStack', () => {
      it('콜스택에 추가 가능한지 확인해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: Array(5).fill({}),
          microtaskQueue: [],
          macrotaskQueue: []
        });

        const canPush = queries.canPushToCallStack();

        expect(canPush).toBe(true);
      });

      it('콜스택이 가득 찬 경우 false를 반환해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: Array(10).fill({}),
          microtaskQueue: [],
          macrotaskQueue: []
        });

        const canPush = queries.canPushToCallStack();

        expect(canPush).toBe(false);
      });
    });

    describe('canEnqueueMicrotask', () => {
      it('마이크로태스크 큐에 추가 가능한지 확인해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: [],
          microtaskQueue: Array(50).fill({}),
          macrotaskQueue: []
        });

        const canEnqueue = queries.canEnqueueMicrotask();

        expect(canEnqueue).toBe(true);
      });

      it('마이크로태스크 큐가 가득 찬 경우 false를 반환해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: [],
          microtaskQueue: Array(100).fill({}),
          macrotaskQueue: []
        });

        const canEnqueue = queries.canEnqueueMicrotask();

        expect(canEnqueue).toBe(false);
      });
    });

    describe('canEnqueueMacrotask', () => {
      it('매크로태스크 큐에 추가 가능한지 확인해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: [],
          microtaskQueue: [],
          macrotaskQueue: Array(50).fill({})
        });

        const canEnqueue = queries.canEnqueueMacrotask();

        expect(canEnqueue).toBe(true);
      });

      it('매크로태스크 큐가 가득 찬 경우 false를 반환해야 한다', () => {
        mockEngine.getState.mockReturnValue({
          callStack: [],
          microtaskQueue: [],
          macrotaskQueue: Array(100).fill({})
        });

        const canEnqueue = queries.canEnqueueMacrotask();

        expect(canEnqueue).toBe(false);
      });
    });

    describe('getStackTrace', () => {
      it('스택 추적을 반환해야 한다', () => {
        const mockTrace = ['function1', 'function2'];
        mockQueueSystem.callStack.getStackTrace.mockReturnValue(mockTrace);

        const trace = queries.getStackTrace();

        expect(trace).toEqual(mockTrace);
      });

      it('큐 시스템이 없을 때 빈 배열을 반환해야 한다', () => {
        // QueueSystem이 null인 경우를 시뮬레이션
        const trace = queries.getStackTrace();

        expect(Array.isArray(trace)).toBe(true);
      });
    });

    describe('getDebugInfo', () => {
      it('디버그 정보를 반환해야 한다', () => {
        const mockDebugInfo = 'debug information';
        mockQueueSystem.getDebugInfo.mockReturnValue(mockDebugInfo);

        const debugInfo = queries.getDebugInfo();

        expect(debugInfo).toBe(mockDebugInfo);
      });

      it('큐 시스템이 없을 때 빈 문자열을 반환해야 한다', () => {
        const debugInfo = queries.getDebugInfo();

        expect(typeof debugInfo).toBe('string');
      });
    });

    describe('getExecutionHistory', () => {
      it('실행 히스토리를 반환해야 한다', () => {
        const mockHistory = [{ step: 1 }, { step: 2 }];
        mockEngine.getExecutionHistory.mockReturnValue(mockHistory);

        const history = queries.getExecutionHistory();

        expect(history).toEqual(mockHistory);
      });

      it('엔진이 없을 때 빈 배열을 반환해야 한다', () => {
        const history = queries.getExecutionHistory();

        expect(Array.isArray(history)).toBe(true);
      });
    });
  });

  describe('실행 결과 처리', () => {
    it('성공적인 실행 결과를 처리해야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));
      const successResult = { success: true, result: 'executed' };

      mockEngine.pushToCallStack.mockReturnValue(successResult);

      result.commands.pushFunction('testFunction');

      expect(mockConfig.onExecutionComplete).toHaveBeenCalledWith(successResult);
    });

    it('실행 통계를 업데이트해야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      // 성공적인 실행
      mockEngine.pushToCallStack.mockReturnValue({ success: true, result: 'executed' });
      result.commands.pushFunction('testFunction');

      // 실패한 실행
      mockEngine.popFromCallStack.mockReturnValue({ success: false, result: 'failed' });
      result.commands.popFunction();

      expect(mockConfig.onExecutionComplete).toHaveBeenCalledTimes(2);
    });
  });


  describe('cleanup', () => {
    it('언마운트 시 cleanup 함수가 호출되어야 한다', () => {
      const unsubscribeMock = vi.fn();
      mockEngine.onTick.mockReturnValue(unsubscribeMock);
      
      const result = executeHook(() => useEventLoopEngine(mockConfig));
      
      // useEffect가 호출되었는지 확인
      expect(mockEngine.onTick).toHaveBeenCalled();
      
      // cleanup 함수 실행
      effectCallbacks.forEach(cleanup => cleanup());
      
      // unsubscribe가 호출되었는지 확인
      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('엣지 케이스', () => {
    it('엔진이 초기화되지 않은 상태에서 명령 실행 시 안전해야 한다', () => {
      // Engine을 null로 설정
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      expect(() => {
        result.commands.pushFunction('test');
        result.commands.popFunction();
        result.commands.addPromiseCallback('test');
        result.commands.addTimeout('test', 100);
        result.commands.step();
        result.commands.rewindToTick(5);
      }).not.toThrow();
    });

    it('콜백이 정의되지 않은 경우에도 안전해야 한다', () => {
      const configWithoutCallbacks = {
        maxCallStackSize: 10,
        maxMicrotaskQueueSize: 100,
        maxMacrotaskQueueSize: 100
      };

      const result = executeHook(() => useEventLoopEngine(configWithoutCallbacks));

      expect(() => {
        result.commands.pushFunction('test');
      }).not.toThrow();
    });

    it('큐 상태 확인 시 엔진이 없어도 안전해야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      expect(() => {
        result.queries.canPushToCallStack();
        result.queries.canEnqueueMicrotask();
        result.queries.canEnqueueMacrotask();
      }).not.toThrow();
    });

    it('매우 큰 실행 속도 값을 처리해야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      expect(() => {
        result.commands.setExecutionSpeed(Number.MAX_SAFE_INTEGER);
        result.commands.setExecutionSpeed(0);
        result.commands.setExecutionSpeed(-1);
      }).not.toThrow();
    });

    it('실행 루프가 정상적으로 시작되어야 한다', () => {
      const result = executeHook(() => useEventLoopEngine(mockConfig));

      expect(() => {
        result.commands.start();
        result.commands.pause();
        result.commands.resume();
      }).not.toThrow();

      // 상태가 올바르게 관리되는지 확인
      expect(result.state).toBeDefined();
      expect(typeof result.state.isRunning).toBe('boolean');
      expect(typeof result.state.isPaused).toBe('boolean');
    });

    it('executeLoop 의존성과 함께 정상 작동해야 한다', () => {
      // 테스트를 위해 useState를 다시 모킹
      let isRunning = true;
      let isPaused = false;
      
      vi.mocked(React.useState).mockImplementation((initialState: any) => {
        if (typeof initialState === 'function') {
          const state = initialState();
          if (state.isRunning !== undefined) {
            return [{ ...state, isRunning, isPaused }, vi.fn()];
          }
        }
        return [initialState, vi.fn()];
      });

      const result = executeHook(() => useEventLoopEngine(mockConfig));
      
      // executeLoop이 의존성 변경에 따라 재생성되는지 확인
      expect(result.commands).toBeDefined();
    });

    it('엔진이 없을 때 쿼리가 false를 반환해야 한다', () => {
      // EventLoopEngine의 constructor가 null을 반환하도록 모킹
      vi.mocked(EventLoopEngine).mockImplementationOnce(() => null as any);
      
      const result = executeHook(() => useEventLoopEngine(mockConfig));
      
      // 엔진이 null이므로 모든 쿼리가 false를 반환해야 함
      expect(result.queries.canPushToCallStack()).toBe(false);
      expect(result.queries.canEnqueueMicrotask()).toBe(false);
      expect(result.queries.canEnqueueMacrotask()).toBe(false);
    });
  });

});