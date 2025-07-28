/**
 * Event Loop Simulation Store
 * 
 * Feature-Sliced Design features 레이어
 * 이벤트 루프 시뮬레이션 기능의 상태 관리
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { CQRSEventLoopService, createCQRSEventLoopService } from '../../../shared/lib/cqrs';
import { EventLoopState } from '../../../entities/event-loop';

// 시뮬레이션 상태
export interface SimulationState {
  // CQRS 서비스
  cqrsService: CQRSEventLoopService | null;
  
  // 현재 이벤트 루프 상태
  eventLoopState: EventLoopState | null;
  
  // 시뮬레이션 제어
  isRunning: boolean;
  isPaused: boolean;
  autoPlay: boolean;
  playbackSpeed: number;
  
  // 실행 제어
  currentTick: number;
  maxTicks: number;
  
  // 디버깅
  breakpoints: Array<{
    condition: 'tick' | 'function' | 'queue-size';
    value: any;
    enabled: boolean;
  }>;
  
  // 에러 상태
  error: string | null;
  loading: boolean;
}

// 시뮬레이션 액션
export interface SimulationActions {
  // 초기화
  initialize: (config?: any) => Promise<void>;
  cleanup: () => Promise<void>;
  
  // 실행 제어
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  step: () => Promise<void>;
  reset: () => Promise<void>;
  
  // 이벤트 루프 조작
  pushFunction: (functionName: string, priority?: string) => Promise<void>;
  popFunction: () => Promise<void>;
  enqueueMicrotask: (taskName: string, source?: string) => Promise<void>;
  enqueueMacrotask: (taskName: string, source?: string, delay?: number) => Promise<void>;
  
  // 시간 여행
  rewindToTick: (tick: number) => Promise<void>;
  
  // 설정
  setPlaybackSpeed: (speed: number) => void;
  setAutoPlay: (enabled: boolean) => void;
  
  // 브레이크포인트
  addBreakpoint: (condition: string, value: any) => void;
  removeBreakpoint: (index: number) => void;
  toggleBreakpoint: (index: number) => void;
  checkBreakpoints: () => boolean;
  
  // 상태 새로고침
  refreshState: () => Promise<void>;
}

// Zustand 스토어 생성
export const useEventLoopSimulationStore = create<SimulationState & SimulationActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // 초기 상태
      cqrsService: null,
      eventLoopState: null,
      isRunning: false,
      isPaused: false,
      autoPlay: false,
      playbackSpeed: 1000, // 1초 간격
      currentTick: 0,
      maxTicks: 1000,
      breakpoints: [],
      error: null,
      loading: false,

      // 초기화
      initialize: async (config = {}) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const service = createCQRSEventLoopService({
            sessionId: `simulation_${Date.now()}`,
            enableCaching: true,
            enableLogging: false,
            enableMetrics: true,
            ...config
          });

          set((state) => {
            state.cqrsService = service;
            state.loading = false;
          });

          // 초기 상태 로드
          await get().refreshState();
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.loading = false;
          });
        }
      },

      // 정리
      cleanup: async () => {
        const { cqrsService } = get();
        if (cqrsService) {
          await cqrsService.destroy();
        }
        
        set((state) => {
          state.cqrsService = null;
          state.eventLoopState = null;
          state.isRunning = false;
          state.isPaused = false;
        });
      },

      // 시뮬레이션 시작
      start: async () => {
        const { cqrsService, autoPlay, playbackSpeed } = get();
        if (!cqrsService) return;

        set((state) => {
          state.isRunning = true;
          state.isPaused = false;
          state.error = null;
        });

        if (autoPlay) {
          // 자동 재생 모드
          const runLoop = async () => {
            const { isRunning, isPaused } = get();
            if (!isRunning || isPaused) return;

            try {
              await get().step();
              
              // 브레이크포인트 체크
              const shouldBreak = get().checkBreakpoints();
              if (shouldBreak) {
                await get().pause();
                return;
              }

              // 다음 틱 스케줄링
              setTimeout(runLoop, playbackSpeed);
            } catch (error) {
              set((state) => {
                state.error = (error as Error).message;
                state.isRunning = false;
              });
            }
          };

          runLoop();
        }
      },

      // 일시정지
      pause: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        await cqrsService.pauseExecution('User requested pause');
        
        set((state) => {
          state.isPaused = true;
        });
      },

      // 재개
      resume: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        await cqrsService.resumeExecution();
        
        set((state) => {
          state.isPaused = false;
        });

        // 자동 재생이면 다시 시작
        if (get().autoPlay) {
          await get().start();
        }
      },

      // 중지
      stop: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        await cqrsService.pauseExecution('Simulation stopped');
        
        set((state) => {
          state.isRunning = false;
          state.isPaused = false;
        });
      },

      // 한 스텝 실행
      step: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.executeTick('step', 1);
          
          if (result.success) {
            await get().refreshState();
            
            set((state) => {
              state.currentTick += 1;
            });
          } else {
            set((state) => {
              state.error = result.error?.message || 'Tick execution failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 리셋
      reset: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          await cqrsService.resetEngine();
          await get().refreshState();
          
          set((state) => {
            state.currentTick = 0;
            state.isRunning = false;
            state.isPaused = false;
            state.error = null;
          });
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 함수 푸시
      pushFunction: async (functionName: string, priority = 'normal') => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.pushFunction(functionName, priority as any);
          
          if (result.success) {
            await get().refreshState();
          } else {
            set((state) => {
              state.error = result.error?.message || 'Function push failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 함수 팝
      popFunction: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.popFunction();
          
          if (result.success) {
            await get().refreshState();
          } else {
            set((state) => {
              state.error = result.error?.message || 'Function pop failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 마이크로태스크 추가
      enqueueMicrotask: async (taskName: string, source = 'promise') => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.enqueueMicrotask(taskName, source as any);
          
          if (result.success) {
            await get().refreshState();
          } else {
            set((state) => {
              state.error = result.error?.message || 'Microtask enqueue failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 매크로태스크 추가
      enqueueMacrotask: async (taskName: string, source = 'setTimeout', delay = 0) => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.enqueueMacrotask(taskName, source as any, delay);
          
          if (result.success) {
            await get().refreshState();
          } else {
            set((state) => {
              state.error = result.error?.message || 'Macrotask enqueue failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 시간 되돌리기
      rewindToTick: async (tick: number) => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.rewindToTick(tick);
          
          if (result.success) {
            await get().refreshState();
            
            set((state) => {
              state.currentTick = tick;
            });
          } else {
            set((state) => {
              state.error = result.error?.message || 'Rewind failed';
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 재생 속도 설정
      setPlaybackSpeed: (speed: number) => {
        set((state) => {
          state.playbackSpeed = Math.max(100, Math.min(5000, speed));
        });
      },

      // 자동 재생 설정
      setAutoPlay: (enabled: boolean) => {
        set((state) => {
          state.autoPlay = enabled;
        });
      },

      // 브레이크포인트 추가
      addBreakpoint: (condition: string, value: any) => {
        set((state) => {
          state.breakpoints.push({
            condition: condition as any,
            value,
            enabled: true
          });
        });
      },

      // 브레이크포인트 제거
      removeBreakpoint: (index: number) => {
        set((state) => {
          state.breakpoints.splice(index, 1);
        });
      },

      // 브레이크포인트 토글
      toggleBreakpoint: (index: number) => {
        set((state) => {
          if (state.breakpoints[index]) {
            state.breakpoints[index].enabled = !state.breakpoints[index].enabled;
          }
        });
      },

      // 상태 새로고침
      refreshState: async () => {
        const { cqrsService } = get();
        if (!cqrsService) return;

        try {
          const result = await cqrsService.getCurrentState(false, false);
          
          if (result.success) {
            set((state) => {
              state.eventLoopState = (result.data as any).eventLoopState;
              state.error = null;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
          });
        }
      },

      // 브레이크포인트 체크 (헬퍼 메서드)
      checkBreakpoints: () => {
        const { breakpoints, eventLoopState, currentTick } = get();
        
        return breakpoints.some(bp => {
          if (!bp.enabled) return false;
          
          switch (bp.condition) {
            case 'tick':
              return currentTick >= bp.value;
            case 'function':
              return eventLoopState?.callStack.some(frame => frame.name === bp.value);
            case 'queue-size':
              const totalQueueSize = (eventLoopState?.microtaskQueue.length || 0) + 
                                   (eventLoopState?.macrotaskQueue.length || 0);
              return totalQueueSize >= bp.value;
            default:
              return false;
          }
        });
      }
    }))
  )
);

// 선택자들
export const useSimulationState = () => useEventLoopSimulationStore(state => state.eventLoopState);
export const useSimulationControls = () => useEventLoopSimulationStore(state => ({
  isRunning: state.isRunning,
  isPaused: state.isPaused,
  start: state.start,
  pause: state.pause,
  resume: state.resume,
  stop: state.stop,
  step: state.step,
  reset: state.reset
}));
export const useSimulationActions = () => useEventLoopSimulationStore(state => ({
  pushFunction: state.pushFunction,
  popFunction: state.popFunction,
  enqueueMicrotask: state.enqueueMicrotask,
  enqueueMacrotask: state.enqueueMacrotask,
  rewindToTick: state.rewindToTick
}));
export const useSimulationBreakpoints = () => useEventLoopSimulationStore(state => ({
  breakpoints: state.breakpoints,
  addBreakpoint: state.addBreakpoint,
  removeBreakpoint: state.removeBreakpoint,
  toggleBreakpoint: state.toggleBreakpoint
}));