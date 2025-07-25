'use client';

/**
 * ReactEventLoopAdapter - React 컴포넌트와 도메인 모델을 연결하는 어댑터
 * 
 * 이 어댑터는 React의 상태 관리와 도메인 모델을 연결하며,
 * UI 이벤트를 도메인 명령으로 변환하고 도메인 상태를 React 상태로 변환합니다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { EventLoopEngine } from '../event-loop/EventLoopEngine';
import { QueueSystem } from '../queue-system/QueueSystem';
import {
  EventLoopConfig,
  EventLoopState,
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  ExecutionResult,
  Task
} from '../event-loop/types';

// React에서 사용할 UI 상태 타입
export interface ReactEventLoopState {
  // 기본 상태
  isRunning: boolean;
  isPaused: boolean;
  currentTick: number;
  phase: EventLoopState['phase'];
  
  // 큐 상태
  callStack: CallStackFrame[];
  microtaskQueue: MicrotaskItem[];
  macrotaskQueue: MacrotaskItem[];
  
  // UI 전용 상태
  selectedTask: Task | null;
  highlightedQueue: 'callstack' | 'microtask' | 'macrotask' | null;
  executionSpeed: number;
  
  // 실행 결과
  lastResult: ExecutionResult | null;
  executionHistory: ExecutionResult[];
  
  // 통계
  stats: {
    totalExecuted: number;
    errors: number;
    callStackMaxDepth: number;
    avgExecutionTime: number;
  };
}

// 어댑터 설정
export interface ReactEventLoopAdapterConfig extends EventLoopConfig {
  onStateChange?: (state: ReactEventLoopState) => void;
  onError?: (error: Error) => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
}

// Custom Hook: useEventLoopEngine
export function useEventLoopEngine(config: ReactEventLoopAdapterConfig) {
  // 도메인 모델 인스턴스
  const engineRef = useRef<EventLoopEngine | null>(null);
  const queueSystemRef = useRef<QueueSystem | null>(null);
  
  // React 상태
  const [uiState, setUiState] = useState<ReactEventLoopState>(() => ({
    isRunning: false,
    isPaused: false,
    currentTick: 0,
    phase: 'idle',
    callStack: [],
    microtaskQueue: [],
    macrotaskQueue: [],
    selectedTask: null,
    highlightedQueue: null,
    executionSpeed: 1000,
    lastResult: null,
    executionHistory: [],
    stats: {
      totalExecuted: 0,
      errors: 0,
      callStackMaxDepth: 0,
      avgExecutionTime: 0
    }
  }));

  // 도메인 모델 초기화
  useEffect(() => {
    const engine = new EventLoopEngine(config);
    const queueSystem = new QueueSystem({
      maxCallStackSize: config.maxCallStackSize,
      maxMicrotaskQueueSize: config.maxMicrotaskQueueSize,
      maxMacrotaskQueueSize: config.maxMacrotaskQueueSize
    });

    engineRef.current = engine;
    queueSystemRef.current = queueSystem;

    // 엔진 상태 변경 구독
    const unsubscribe = engine.onTick((engineState) => {
      updateUIState(engineState);
    });

    return () => {
      unsubscribe();
    };
  }, [config]);

  // 도메인 상태를 UI 상태로 변환
  const updateUIState = useCallback((engineState: EventLoopState) => {
    setUiState(prev => ({
      ...prev,
      isRunning: engineState.isRunning,
      currentTick: engineState.currentTick,
      phase: engineState.phase,
      callStack: [...engineState.callStack],
      microtaskQueue: [...engineState.microtaskQueue],
      macrotaskQueue: [...engineState.macrotaskQueue],
      stats: {
        ...prev.stats,
        callStackMaxDepth: Math.max(prev.stats.callStackMaxDepth, engineState.callStack.length)
      }
    }));

    config.onStateChange?.(uiState);
  }, [config, uiState]);

  // 명령 인터페이스
  const commands = {
    // 함수 호출
    pushFunction: useCallback((functionName: string, context?: any) => {
      if (!engineRef.current) return;

      try {
        const result = engineRef.current.pushToCallStack({
          type: 'callstack',
          name: functionName,
          priority: 'normal',
          context: context ? {
            id: `ctx_${Date.now()}`,
            functionName,
            scope: context,
            timestamp: Date.now()
          } : undefined
        });

        handleExecutionResult(result);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config]),

    // 함수 반환
    popFunction: useCallback(() => {
      if (!engineRef.current) return;

      try {
        const result = engineRef.current.popFromCallStack();
        handleExecutionResult(result);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config]),

    // Promise 콜백 추가
    addPromiseCallback: useCallback((name: string) => {
      if (!engineRef.current) return;

      try {
        const result = engineRef.current.enqueueMicrotask({
          type: 'microtask',
          name,
          priority: 'high',
          source: 'promise'
        });

        handleExecutionResult(result);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config]),

    // setTimeout 추가
    addTimeout: useCallback((name: string, delay: number) => {
      if (!engineRef.current) return;

      try {
        const result = engineRef.current.enqueueMacrotask({
          type: 'macrotask',
          name,
          priority: 'normal',
          source: 'setTimeout',
          delay
        });

        handleExecutionResult(result);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config]),

    // 실행 제어
    start: useCallback(() => {
      setUiState(prev => ({ ...prev, isRunning: true, isPaused: false }));
      executeLoop();
    }, []),

    pause: useCallback(() => {
      setUiState(prev => ({ ...prev, isPaused: true }));
    }, []),

    resume: useCallback(() => {
      setUiState(prev => ({ ...prev, isPaused: false }));
      executeLoop();
    }, []),

    step: useCallback(() => {
      if (!engineRef.current) return;

      try {
        const result = engineRef.current.tick();
        handleExecutionResult(result);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config]),

    reset: useCallback(() => {
      if (!engineRef.current) return;

      engineRef.current.reset();
      setUiState({
        isRunning: false,
        isPaused: false,
        currentTick: 0,
        phase: 'idle',
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        selectedTask: null,
        highlightedQueue: null,
        executionSpeed: uiState.executionSpeed,
        lastResult: null,
        executionHistory: [],
        stats: {
          totalExecuted: 0,
          errors: 0,
          callStackMaxDepth: 0,
          avgExecutionTime: 0
        }
      });
    }, [uiState.executionSpeed]),

    // UI 상태 제어
    selectTask: useCallback((task: Task | null) => {
      setUiState(prev => ({ ...prev, selectedTask: task }));
    }, []),

    highlightQueue: useCallback((queue: ReactEventLoopState['highlightedQueue']) => {
      setUiState(prev => ({ ...prev, highlightedQueue: queue }));
    }, []),

    setExecutionSpeed: useCallback((speed: number) => {
      setUiState(prev => ({ ...prev, executionSpeed: speed }));
    }, []),

    // 시간 여행
    rewindToTick: useCallback((targetTick: number) => {
      if (!engineRef.current) return;

      try {
        const previousState = engineRef.current.rewindToTick(targetTick);
        updateUIState(previousState);
      } catch (error) {
        config.onError?.(error as Error);
      }
    }, [config, updateUIState])
  };

  // 실행 루프 상태 체크 (테스트 가능하게 분리)
  const shouldContinueExecution = useCallback(() => {
    if (!engineRef.current) return false;
    const state = engineRef.current.getState();
    return !(state.callStack.length === 0 && 
             state.microtaskQueue.length === 0 && 
             state.macrotaskQueue.length === 0);
  }, []);

  // 실행 결과 처리
  const handleExecutionResult = useCallback((result: ExecutionResult) => {
    setUiState(prev => ({
      ...prev,
      lastResult: result,
      executionHistory: [...prev.executionHistory, result],
      stats: {
        ...prev.stats,
        totalExecuted: prev.stats.totalExecuted + (result.success ? 1 : 0),
        errors: prev.stats.errors + (result.success ? 0 : 1)
      }
    }));

    config.onExecutionComplete?.(result);
  }, [config]);

  // 실행 루프  
  const executeLoop = useCallback(() => {
    if (!engineRef.current || !uiState.isRunning || uiState.isPaused) return;

    const intervalId = setInterval(() => {
      // 상태 재검사 (React Hook에서 클로저 이슈 회피)
      if (!uiState.isRunning || uiState.isPaused) {
        clearInterval(intervalId);
        return;
      }

      // 한 스텝 실행
      try {
        if (engineRef.current) {
          const result = engineRef.current.tick();
          handleExecutionResult(result);
        }
      } catch (error) {
        config.onError?.(error as Error);
        clearInterval(intervalId);
        return;
      }

      // 모든 큐가 비어있으면 정지
      if (!shouldContinueExecution()) {
        setUiState(prev => ({ ...prev, isRunning: false }));
        clearInterval(intervalId);
      }
    }, uiState.executionSpeed);

    return () => clearInterval(intervalId);
  }, [uiState.isRunning, uiState.isPaused, uiState.executionSpeed, config, shouldContinueExecution, handleExecutionResult]);

  // 쿼리 인터페이스
  const queries = {
    // 현재 상태
    getState: () => uiState,
    
    // 실행 가능 여부
    canPushToCallStack: () => {
      if (!engineRef.current) return false;
      const state = engineRef.current.getState();
      return state ? state.callStack.length < config.maxCallStackSize : false;
    },
    
    canEnqueueMicrotask: () => {
      if (!engineRef.current) return false;
      const state = engineRef.current.getState();
      return state ? state.microtaskQueue.length < config.maxMicrotaskQueueSize : false;
    },
    
    canEnqueueMacrotask: () => {
      if (!engineRef.current) return false;
      const state = engineRef.current.getState();
      return state ? state.macrotaskQueue.length < config.maxMacrotaskQueueSize : false;
    },
    
    // 스택 추적
    getStackTrace: () =>
      queueSystemRef.current?.callStack.getStackTrace() || [],
    
    // 디버그 정보
    getDebugInfo: () =>
      queueSystemRef.current?.getDebugInfo() || '',
    
    // 실행 이력
    getExecutionHistory: () =>
      engineRef.current?.getExecutionHistory() || []
  };

  return {
    state: uiState,
    commands,
    queries
  };
}

// 타입 내보내기
export type EventLoopCommands = ReturnType<typeof useEventLoopEngine>['commands'];
export type EventLoopQueries = ReturnType<typeof useEventLoopEngine>['queries'];