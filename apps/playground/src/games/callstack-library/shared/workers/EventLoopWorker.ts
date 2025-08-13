/**
 * Event Loop Web Worker
 * 
 * Phase 3: 성능 최적화 - Web Worker 활용한 연산 분리
 * 메인 스레드를 차단하지 않고 이벤트 루프 시뮬레이션을 수행
 */

import { CQRSEventLoopService, createCQRSEventLoopService } from '@/games/callstack-library/shared/lib/cqrs';
import { EventLoopConfig } from '@/games/callstack-library/entities/event-loop';

// Worker 메시지 타입 정의
export interface WorkerMessage {
  id: string;
  type: string;
  payload: any;
}

export interface WorkerResponse {
  id: string;
  type: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Worker 명령 타입들
export type WorkerCommandType = 
  | 'INITIALIZE'
  | 'EXECUTE_COMMAND' 
  | 'EXECUTE_QUERY'
  | 'START_SIMULATION'
  | 'STOP_SIMULATION'
  | 'RESET'
  | 'GET_STATE'
  | 'CLEANUP';

// Worker 상태
interface WorkerState {
  cqrsService: CQRSEventLoopService | null;
  simulationRunning: boolean;
  simulationInterval: number | null;
  config: EventLoopConfig | null;
}

// Worker 글로벌 상태
const workerState: WorkerState = {
  cqrsService: null,
  simulationRunning: false,
  simulationInterval: null,
  config: null
};

// 응답 전송 헬퍼
const sendResponse = (id: string, type: string, success: boolean, data?: any, error?: string) => {
  const response: WorkerResponse = { id, type, success, data, error };
  self.postMessage(response);
};

// 이벤트 전송 헬퍼
const sendEvent = (type: string, data: any) => {
  self.postMessage({
    id: 'event',
    type,
    success: true,
    data
  });
};

// 명령 처리기들
const commandHandlers: Record<string, (message: WorkerMessage) => Promise<void>> = {
  
  // 초기화
  async INITIALIZE(message: WorkerMessage) {
    try {
      const config = message.payload.config || {
        maxCallStackSize: 100,
        maxMicrotaskQueueSize: 1000,
        maxMacrotaskQueueSize: 1000,
        executionTimeout: 30000,
        enableLogging: false
      };

      workerState.config = config;
      workerState.cqrsService = createCQRSEventLoopService({
        eventLoopConfig: config,
        sessionId: `worker_${Date.now()}`,
        enableCaching: true,
        enableLogging: false, // Worker에서는 로깅 비활성화
        enableMetrics: true
      });

      // await workerState.cqrsService.initialize?.(); // CQRSEventLoopService에 initialize 메서드가 없음
      
      sendResponse(message.id, 'INITIALIZE', true, { initialized: true });
    } catch (error) {
      sendResponse(message.id, 'INITIALIZE', false, null, (error as Error).message);
    }
  },

  // 명령 실행
  async EXECUTE_COMMAND(message: WorkerMessage) {
    try {
      if (!workerState.cqrsService) {
        throw new Error('Service not initialized');
      }

      const { commandType, args = [] } = message.payload;
      let result;

      switch (commandType) {
        case 'pushFunction':
          result = await workerState.cqrsService.pushFunction(args[0], args[1]);
          break;
        case 'popFunction':
          result = await workerState.cqrsService.popFunction();
          break;
        case 'enqueueMicrotask':
          result = await workerState.cqrsService.enqueueMicrotask(args[0]);
          break;
        case 'enqueueMacrotask':
          result = await workerState.cqrsService.enqueueMacrotask(args[0], args[1]);
          break;
        case 'executeTick':
          result = await workerState.cqrsService.executeTick();
          break;
        case 'resetEngine':
          result = await workerState.cqrsService.resetEngine();
          break;
        case 'rewindToTick':
          result = await workerState.cqrsService.rewindToTick(args[0]);
          break;
        default:
          throw new Error(`Unknown command type: ${commandType}`);
      }

      sendResponse(message.id, 'EXECUTE_COMMAND', true, result);
      
      // 상태 변경 이벤트 전송
      if (result.success) {
        const currentState = await workerState.cqrsService.getCurrentState();
        sendEvent('STATE_CHANGED', currentState.data);
      }
    } catch (error) {
      sendResponse(message.id, 'EXECUTE_COMMAND', false, null, (error as Error).message);
    }
  },

  // 쿼리 실행
  async EXECUTE_QUERY(message: WorkerMessage) {
    try {
      if (!workerState.cqrsService) {
        throw new Error('Service not initialized');
      }

      const { queryType, args } = message.payload;
      let result;

      switch (queryType) {
        case 'getCurrentState':
          result = await workerState.cqrsService.getCurrentState(...(args || []));
          break;
        case 'getCallStack':
          result = await workerState.cqrsService.getCallStack(...(args || []));
          break;
        case 'getQueueStates':
          result = await workerState.cqrsService.getQueueStates(...(args || []));
          break;
        case 'getExecutionHistory':
          result = await workerState.cqrsService.getExecutionHistory(...(args || []));
          break;
        case 'getEvents':
          result = await workerState.cqrsService.getEvents(...(args || []));
          break;
        case 'getPerformanceMetrics':
          result = await workerState.cqrsService.getPerformanceMetrics(...(args || []));
          break;
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }

      sendResponse(message.id, 'EXECUTE_QUERY', true, result);
    } catch (error) {
      sendResponse(message.id, 'EXECUTE_QUERY', false, null, (error as Error).message);
    }
  },

  // 시뮬레이션 시작
  async START_SIMULATION(message: WorkerMessage) {
    try {
      if (!workerState.cqrsService) {
        throw new Error('Service not initialized');
      }

      if (workerState.simulationRunning) {
        sendResponse(message.id, 'START_SIMULATION', false, null, 'Simulation already running');
        return;
      }

      const { speed = 1000, mode = 'continuous' } = message.payload;
      
      workerState.simulationRunning = true;
      
      const runSimulation = async () => {
        if (!workerState.simulationRunning || !workerState.cqrsService) {
          return;
        }

        try {
          const result = await workerState.cqrsService.executeTick('step', 1);
          
          if (result.success) {
            // 상태 변경 이벤트 전송
            const currentState = await workerState.cqrsService.getCurrentState();
            sendEvent('SIMULATION_STEP', {
              state: currentState.data,
              stepResult: result
            });
            
            // 다음 스텝 스케줄링
            workerState.simulationInterval = self.setTimeout(runSimulation, speed) as any;
          } else {
            // 오류 발생 시 시뮬레이션 중지
            workerState.simulationRunning = false;
            sendEvent('SIMULATION_ERROR', { error: result.error?.message });
          }
        } catch (error) {
          workerState.simulationRunning = false;
          sendEvent('SIMULATION_ERROR', { error: (error as Error).message });
        }
      };

      // 첫 번째 스텝 시작
      runSimulation();
      
      sendResponse(message.id, 'START_SIMULATION', true, { started: true });
    } catch (error) {
      sendResponse(message.id, 'START_SIMULATION', false, null, (error as Error).message);
    }
  },

  // 시뮬레이션 중지
  async STOP_SIMULATION(message: WorkerMessage) {
    try {
      workerState.simulationRunning = false;
      
      if (workerState.simulationInterval) {
        self.clearTimeout(workerState.simulationInterval);
        workerState.simulationInterval = null;
      }
      
      sendResponse(message.id, 'STOP_SIMULATION', true, { stopped: true });
      sendEvent('SIMULATION_STOPPED', {});
    } catch (error) {
      sendResponse(message.id, 'STOP_SIMULATION', false, null, (error as Error).message);
    }
  },

  // 리셋
  async RESET(message: WorkerMessage) {
    try {
      if (!workerState.cqrsService) {
        throw new Error('Service not initialized');
      }

      // 시뮬레이션 중지
      await commandHandlers.STOP_SIMULATION(message);
      
      // 엔진 리셋
      const result = await workerState.cqrsService.resetEngine();
      
      if (result.success) {
        const currentState = await workerState.cqrsService.getCurrentState();
        sendEvent('STATE_CHANGED', currentState.data);
      }
      
      sendResponse(message.id, 'RESET', true, result);
    } catch (error) {
      sendResponse(message.id, 'RESET', false, null, (error as Error).message);
    }
  },

  // 현재 상태 조회
  async GET_STATE(message: WorkerMessage) {
    try {
      if (!workerState.cqrsService) {
        throw new Error('Service not initialized');
      }

      const currentState = await workerState.cqrsService.getCurrentState();
      const healthCheck = await workerState.cqrsService.healthCheck();
      
      sendResponse(message.id, 'GET_STATE', true, {
        engineState: currentState.data,
        workerState: {
          simulationRunning: workerState.simulationRunning,
          hasService: !!workerState.cqrsService
        },
        health: healthCheck
      });
    } catch (error) {
      sendResponse(message.id, 'GET_STATE', false, null, (error as Error).message);
    }
  },

  // 정리
  async CLEANUP(message: WorkerMessage) {
    try {
      // 시뮬레이션 중지
      workerState.simulationRunning = false;
      if (workerState.simulationInterval) {
        self.clearTimeout(workerState.simulationInterval);
        workerState.simulationInterval = null;
      }

      // 서비스 정리
      if (workerState.cqrsService) {
        await workerState.cqrsService.destroy();
        workerState.cqrsService = null;
      }

      workerState.config = null;
      
      sendResponse(message.id, 'CLEANUP', true, { cleaned: true });
    } catch (error) {
      sendResponse(message.id, 'CLEANUP', false, null, (error as Error).message);
    }
  }
};

// 메시지 리스너
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;
  
  try {
    const handler = commandHandlers[message.type];
    if (handler) {
      await handler(message);
    } else {
      sendResponse(message.id, message.type, false, null, `Unknown message type: ${message.type}`);
    }
  } catch (error) {
    sendResponse(message.id, message.type, false, null, (error as Error).message);
  }
});

// Worker 초기화 완료 신호
sendEvent('WORKER_READY', { timestamp: Date.now() });

// 에러 핸들링
self.addEventListener('error', (event) => {
  sendEvent('WORKER_ERROR', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

self.addEventListener('unhandledrejection', (event) => {
  sendEvent('WORKER_UNHANDLED_REJECTION', {
    reason: event.reason,
    timestamp: Date.now()
  });
});

export {}; // 모듈로 처리