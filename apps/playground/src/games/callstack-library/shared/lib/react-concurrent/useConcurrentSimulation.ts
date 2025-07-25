'use client';

/**
 * Concurrent Simulation Hook
 * 
 * Phase 3: React Concurrent Features 적용
 * Concurrent Mode, Suspense, useTransition을 활용한 성능 최적화
 */

import { 
  useTransition, 
  useDeferredValue, 
  startTransition,
  useCallback,
  useEffect,
  useState,
  useMemo
} from 'react';

import { WorkerManager } from '../../workers/WorkerManager';
import { EventLoopConfig } from '../../../entities/event-loop';

// Concurrent 시뮬레이션 상태
export interface ConcurrentSimulationState {
  // 기본 상태
  isInitialized: boolean;
  isRunning: boolean;
  isPaused: boolean;
  currentTick: number;
  
  // Concurrent 관련 상태
  isPending: boolean;           // useTransition pending
  isDeferredUpdate: boolean;    // useDeferredValue로 지연된 업데이트
  isHighPriority: boolean;      // 현재 업데이트가 고우선순위인지
  
  // 성능 관련
  lastUpdateTime: number;
  updateLatency: number;
  frameDropCount: number;
  
  // 에러 상태
  error: Error | null;
  retryCount: number;
}

// Concurrent 시뮬레이션 액션
export interface ConcurrentSimulationActions {
  // 기본 제어
  initialize: (config?: EventLoopConfig) => Promise<void>;
  start: (priority?: 'high' | 'normal' | 'low') => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => Promise<void>;
  
  // 이벤트 루프 조작 (우선순위 기반)
  pushFunction: (name: string, priority?: 'high' | 'normal') => Promise<void>;
  popFunction: (priority?: 'high' | 'normal') => Promise<void>;
  enqueueMicrotask: (name: string, priority?: 'high' | 'normal') => Promise<void>;
  enqueueMacrotask: (name: string, delay?: number, priority?: 'high' | 'normal') => Promise<void>;
  executeTick: (priority?: 'high' | 'normal') => Promise<void>;
  
  // 시간 여행 (항상 고우선순위)
  rewindToTick: (tick: number) => Promise<void>;
  
  // 에러 복구
  retry: () => Promise<void>;
  clearError: () => void;
}

// 우선순위별 지연 값 계산
const getPriorityDelay = (priority: 'high' | 'normal' | 'low'): number => {
  switch (priority) {
    case 'high': return 0;      // 즉시 처리
    case 'normal': return 16;   // 1 프레임 지연
    case 'low': return 100;     // 100ms 지연
    default: return 16;
  }
};

// Concurrent 시뮬레이션 Hook
export const useConcurrentSimulation = (
  initialConfig?: EventLoopConfig
) => {
  // Worker Manager
  const [workerManager, setWorkerManager] = useState<WorkerManager | null>(null);
  
  // Concurrent Features
  const [isPending, startTransition] = useTransition();
  
  // 기본 상태
  const [state, setState] = useState<ConcurrentSimulationState>({
    isInitialized: false,
    isRunning: false,
    isPaused: false,
    currentTick: 0,
    isPending: false,
    isDeferredUpdate: false,
    isHighPriority: false,
    lastUpdateTime: Date.now(),
    updateLatency: 0,
    frameDropCount: 0,
    error: null,
    retryCount: 0
  });
  
  // 지연된 상태 값 (낮은 우선순위 업데이트용)
  const deferredState = useDeferredValue(state);
  
  // 현재 상태가 지연된 상태와 다른지 확인
  const isDeferredUpdate = state !== deferredState;
  
  // 성능 모니터링
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageLatency: 0,
    maxLatency: 0,
    frameRate: 60,
    memoryUsage: 0
  });
  
  // Worker 이벤트 리스너 설정
  useEffect(() => {
    if (!workerManager) return;
    
    const unsubscribers: (() => void)[] = [];
    
    // 상태 변경 이벤트
    unsubscribers.push(
      workerManager.addEventListener('STATE_CHANGED', (eventType, data) => {
        const updateTime = Date.now();
        
        startTransition(() => {
          setState(prev => ({
            ...prev,
            currentTick: data.eventLoopState?.currentTick || prev.currentTick,
            isRunning: data.eventLoopState?.isRunning || false,
            lastUpdateTime: updateTime,
            updateLatency: updateTime - prev.lastUpdateTime,
            isDeferredUpdate: false,
            isHighPriority: false
          }));
        });
      })
    );
    
    // 시뮬레이션 스텝 이벤트
    unsubscribers.push(
      workerManager.addEventListener('SIMULATION_STEP', (eventType, data) => {
        const updateTime = Date.now();
        
        // 시뮬레이션 스텝은 낮은 우선순위로 처리
        startTransition(() => {
          setState(prev => ({
            ...prev,
            currentTick: data.state?.eventLoopState?.currentTick || prev.currentTick,
            lastUpdateTime: updateTime,
            updateLatency: updateTime - prev.lastUpdateTime,
            isDeferredUpdate: true,
            isHighPriority: false
          }));
        });
      })
    );
    
    // 에러 이벤트
    unsubscribers.push(
      workerManager.addEventListener('SIMULATION_ERROR', (eventType, data) => {
        // 에러는 즉시 처리 (고우선순위)
        setState(prev => ({
          ...prev,
          error: new Error(data.error),
          isRunning: false,
          isHighPriority: true,
          isDeferredUpdate: false
        }));
      })
    );
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [workerManager]);
  
  // 성능 메트릭 업데이트
  useEffect(() => {
    if (state.updateLatency > 0) {
      setPerformanceMetrics(prev => ({
        ...prev,
        averageLatency: (prev.averageLatency * 0.9) + (state.updateLatency * 0.1),
        maxLatency: Math.max(prev.maxLatency, state.updateLatency),
        frameRate: Math.min(60, 1000 / state.updateLatency)
      }));
    }
  }, [state.updateLatency]);
  
  // 프레임 드롭 감지
  useEffect(() => {
    if (state.updateLatency > 32) { // 2프레임 이상 지연
      setState(prev => ({
        ...prev,
        frameDropCount: prev.frameDropCount + 1
      }));
    }
  }, [state.updateLatency]);
  
  // 액션 생성 함수
  const createAction = useCallback(
    (actionFn: () => Promise<any>, priority: 'high' | 'normal' | 'low' = 'normal') => {
      return async () => {
        const delay = getPriorityDelay(priority);
        const isHighPriority = priority === 'high';
        
        try {
          // 상태 업데이트 (시작)
          if (isHighPriority) {
            setState(prev => ({ 
              ...prev, 
              isHighPriority: true,
              isDeferredUpdate: false 
            }));
          } else {
            startTransition(() => {
              setState(prev => ({ 
                ...prev, 
                isHighPriority: false,
                isDeferredUpdate: true 
              }));
            });
          }
          
          // 지연 처리
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // 실제 액션 실행
          const result = await actionFn();
          
          return result;
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: error as Error,
            retryCount: prev.retryCount + 1,
            isHighPriority: true
          }));
          throw error;
        }
      };
    },
    []
  );
  
  // 액션들
  const actions: ConcurrentSimulationActions = useMemo(() => ({
    initialize: createAction(async (config = initialConfig) => {
      if (!WorkerManager.isSupported()) {
        throw new Error('Web Workers not supported');
      }
      
      const manager = new WorkerManager();
      await manager.initialize(config);
      setWorkerManager(manager);
      
      setState(prev => ({ ...prev, isInitialized: true, error: null }));
    }, 'high'),
    
    start: createAction(async (priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      await workerManager.startSimulation();
      setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    }),
    
    pause: createAction(async () => {
      if (!workerManager) throw new Error('Not initialized');
      
      await workerManager.stopSimulation();
      setState(prev => ({ ...prev, isPaused: true }));
    }, 'high'),
    
    resume: createAction(async () => {
      if (!workerManager) throw new Error('Not initialized');
      
      await workerManager.startSimulation();
      setState(prev => ({ ...prev, isPaused: false }));
    }, 'high'),
    
    stop: createAction(async () => {
      if (!workerManager) throw new Error('Not initialized');
      
      await workerManager.stopSimulation();
      setState(prev => ({ ...prev, isRunning: false, isPaused: false }));
    }, 'high'),
    
    reset: createAction(async () => {
      if (!workerManager) throw new Error('Not initialized');
      
      await workerManager.resetEngine();
      setState(prev => ({ 
        ...prev, 
        currentTick: 0, 
        isRunning: false, 
        isPaused: false,
        error: null 
      }));
    }, 'high'),
    
    pushFunction: createAction(async (name: string, priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.pushFunction(name, priority);
    }),
    
    popFunction: createAction(async (priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.popFunction();
    }),
    
    enqueueMicrotask: createAction(async (name: string, priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.enqueueMicrotask(name, 'promise');
    }),
    
    enqueueMacrotask: createAction(async (name: string, delay = 0, priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.enqueueMacrotask(name, 'setTimeout', delay);
    }),
    
    executeTick: createAction(async (priority = 'normal') => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.executeTick();
    }),
    
    rewindToTick: createAction(async (tick: number) => {
      if (!workerManager) throw new Error('Not initialized');
      
      return await workerManager.rewindToTick(tick);
    }, 'high'),
    
    retry: createAction(async () => {
      if (!workerManager || !state.error) return;
      
      // 에러 클리어 후 재시도
      setState(prev => ({ ...prev, error: null }));
      
      // 현재 상태를 다시 가져와서 동기화
      const currentState = await workerManager.getCurrentState();
      setState(prev => ({
        ...prev,
        currentTick: currentState.eventLoopState?.currentTick || 0,
        isRunning: currentState.eventLoopState?.isRunning || false
      }));
    }, 'high'),
    
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    }
  }), [workerManager, state.error, createAction, initialConfig]);
  
  // 정리
  useEffect(() => {
    return () => {
      if (workerManager) {
        workerManager.terminate();
      }
    };
  }, [workerManager]);
  
  // 현재 상태에 Concurrent 정보 추가
  const enhancedState = useMemo(() => ({
    ...state,
    isPending,
    isDeferredUpdate,
    performanceMetrics,
    isWorkerSupported: WorkerManager.isSupported()
  }), [state, isPending, isDeferredUpdate, performanceMetrics]);
  
  return {
    state: enhancedState,
    deferredState: {
      ...deferredState,
      isDeferredUpdate: true,
      performanceMetrics
    },
    actions,
    workerManager
  };
};