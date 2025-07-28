/**
 * Worker Manager
 * 
 * Phase 3: 성능 최적화 - Web Worker 관리 시스템
 * Worker와 메인 스레드 간의 통신을 관리하고 추상화
 */

import { EventLoopConfig } from '../../entities/event-loop';

// Worker 메시지와 응답 타입들 (Worker와 동일)
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

// 대기 중인 요청 정보
interface PendingRequest {
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Worker 상태
export interface WorkerManagerState {
  isInitialized: boolean;
  isSimulationRunning: boolean;
  lastError: string | null;
  messageCount: number;
  responseTime: number[];
}

// Worker 이벤트 리스너 타입
export type WorkerEventListener = (eventType: string, data: any) => void;

// Worker Manager 클래스
export class WorkerManager {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private eventListeners = new Map<string, WorkerEventListener[]>();
  private messageIdCounter = 0;
  private state: WorkerManagerState = {
    isInitialized: false,
    isSimulationRunning: false,
    lastError: null,
    messageCount: 0,
    responseTime: []
  };

  // Worker 초기화
  async initialize(config?: EventLoopConfig): Promise<void> {
    if (this.worker) {
      throw new Error('Worker already initialized');
    }

    // Worker 생성 (번들러에 따라 다를 수 있음)
    try {
      // Vite/Webpack 환경에서 Worker 생성
      this.worker = new Worker(
        new URL('./EventLoopWorker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (error) {
      // 폴백: 인라인 Worker 생성
      console.warn('Failed to create Worker from URL, using fallback', error);
      throw new Error('Worker creation failed');
    }

    // Worker 메시지 리스너 설정
    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
    this.worker.addEventListener('error', this.handleWorkerError.bind(this));

    // Worker 초기화 요청
    const response = await this.sendMessage('INITIALIZE', { config });
    if (!response.success) {
      throw new Error(`Worker initialization failed: ${response.error}`);
    }

    this.state.isInitialized = true;
  }

  // Worker 메시지 처리
  private handleWorkerMessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    
    // 이벤트 메시지 처리
    if (response.id === 'event') {
      this.handleWorkerEvent(response.type, response.data);
      return;
    }

    // 요청 응답 처리
    const pendingRequest = this.pendingRequests.get(response.id);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      this.pendingRequests.delete(response.id);
      
      // 응답 시간 기록
      const responseTime = Date.now() - parseInt(response.id.split('_')[1]);
      this.state.responseTime.push(responseTime);
      if (this.state.responseTime.length > 100) {
        this.state.responseTime = this.state.responseTime.slice(-100);
      }

      if (response.success) {
        pendingRequest.resolve(response);
      } else {
        pendingRequest.reject(new Error(response.error || 'Unknown worker error'));
      }
    }
  };

  // Worker 이벤트 처리
  private handleWorkerEvent = (eventType: string, data: any) => {
    // 내부 상태 업데이트
    switch (eventType) {
      case 'STATE_CHANGED':
        // 상태 변경 이벤트
        break;
      case 'SIMULATION_STEP':
        // 시뮬레이션 스텝 이벤트
        break;
      case 'SIMULATION_STOPPED':
        this.state.isSimulationRunning = false;
        break;
      case 'SIMULATION_ERROR':
      case 'WORKER_ERROR':
      case 'WORKER_UNHANDLED_REJECTION':
        this.state.lastError = data.message || data.reason || 'Unknown error';
        break;
    }

    // 등록된 리스너들에게 이벤트 전파
    const listeners = this.eventListeners.get(eventType) || [];
    const allListeners = this.eventListeners.get('*') || [];
    
    [...listeners, ...allListeners].forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in worker event listener:', error);
      }
    });
  };

  // Worker 에러 처리
  private handleWorkerError = (event: ErrorEvent) => {
    console.error('Worker error:', event);
    this.state.lastError = event.message;
    this.handleWorkerEvent('WORKER_ERROR', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
  };

  // Worker에 메시지 전송
  private async sendMessage(type: string, payload: any = {}, timeout = 10000): Promise<WorkerResponse> {
    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const id = `${type}_${Date.now()}_${++this.messageIdCounter}`;
    const message: WorkerMessage = { id, type, payload };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Worker request timeout: ${type}`));
      }, timeout);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout: timeoutId
      });

      this.worker!.postMessage(message);
      this.state.messageCount++;
    });
  }

  // === Public API 메서드들 ===

  // 명령 실행
  async executeCommand(commandType: string, ...args: any[]): Promise<any> {
    const response = await this.sendMessage('EXECUTE_COMMAND', { commandType, args });
    return response.data;
  }

  // 쿼리 실행
  async executeQuery(queryType: string, ...args: any[]): Promise<any> {
    const response = await this.sendMessage('EXECUTE_QUERY', { queryType, args });
    return response.data;
  }

  // 이벤트 루프 조작 메서드들
  async pushFunction(functionName: string, priority = 'normal'): Promise<any> {
    return this.executeCommand('pushFunction', functionName, priority);
  }

  async popFunction(): Promise<any> {
    return this.executeCommand('popFunction');
  }

  async enqueueMicrotask(taskName: string, source = 'promise'): Promise<any> {
    return this.executeCommand('enqueueMicrotask', taskName, source);
  }

  async enqueueMacrotask(taskName: string, source = 'setTimeout', delay = 0): Promise<any> {
    return this.executeCommand('enqueueMacrotask', taskName, source, delay);
  }

  async executeTick(mode = 'step', maxTicks = 1): Promise<any> {
    return this.executeCommand('executeTick', mode, maxTicks);
  }

  async resetEngine(): Promise<any> {
    return this.executeCommand('resetEngine');
  }

  async rewindToTick(tick: number): Promise<any> {
    return this.executeCommand('rewindToTick', tick);
  }

  // 상태 조회 메서드들
  async getCurrentState(): Promise<any> {
    return this.executeQuery('getCurrentState');
  }

  async getCallStack(): Promise<any> {
    return this.executeQuery('getCallStack');
  }

  async getQueueStates(): Promise<any> {
    return this.executeQuery('getQueueStates');
  }

  async getExecutionHistory(): Promise<any> {
    return this.executeQuery('getExecutionHistory');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.executeQuery('getPerformanceMetrics');
  }

  // 시뮬레이션 제어
  async startSimulation(speed = 1000, mode = 'continuous'): Promise<void> {
    const response = await this.sendMessage('START_SIMULATION', { speed, mode });
    if (response.success) {
      this.state.isSimulationRunning = true;
    }
  }

  async stopSimulation(): Promise<void> {
    const response = await this.sendMessage('STOP_SIMULATION');
    if (response.success) {
      this.state.isSimulationRunning = false;
    }
  }

  // 상태 조회
  getState(): Readonly<WorkerManagerState> {
    return { ...this.state };
  }

  // Worker 상태 조회
  async getWorkerState(): Promise<any> {
    const response = await this.sendMessage('GET_STATE');
    return response.data;
  }

  // 이벤트 리스너 등록
  addEventListener(eventType: string, listener: WorkerEventListener): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(listener);
    
    // 제거 함수 반환
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // 모든 이벤트 리스너 등록
  addAllEventListener(listener: WorkerEventListener): () => void {
    return this.addEventListener('*', listener);
  }

  // 성능 메트릭
  getLocalPerformanceMetrics(): {
    messageCount: number;
    averageResponseTime: number;
    isHealthy: boolean;
  } {
    const avgResponseTime = this.state.responseTime.length > 0
      ? this.state.responseTime.reduce((sum, time) => sum + time, 0) / this.state.responseTime.length
      : 0;

    return {
      messageCount: this.state.messageCount,
      averageResponseTime: avgResponseTime,
      isHealthy: this.state.isInitialized && !this.state.lastError
    };
  }

  // Worker 종료
  async terminate(): Promise<void> {
    if (!this.worker) {
      return;
    }

    try {
      // 정리 요청
      await this.sendMessage('CLEANUP', {}, 5000);
    } catch (error) {
      console.warn('Worker cleanup failed:', error);
    }

    // 대기 중인 요청들 정리
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Worker terminated'));
    });
    this.pendingRequests.clear();

    // Worker 종료
    this.worker.terminate();
    this.worker = null;
    
    // 상태 초기화
    this.state = {
      isInitialized: false,
      isSimulationRunning: false,
      lastError: null,
      messageCount: 0,
      responseTime: []
    };
    
    this.eventListeners.clear();
  }

  // Worker 지원 여부 확인
  static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }
}

// 싱글톤 인스턴스
let defaultWorkerManager: WorkerManager | null = null;

// 기본 Worker Manager 인스턴스 생성
export const createWorkerManager = async (config?: EventLoopConfig): Promise<WorkerManager> => {
  const manager = new WorkerManager();
  await manager.initialize(config);
  return manager;
};

// 기본 싱글톤 인스턴스 접근
export const getDefaultWorkerManager = async (config?: EventLoopConfig): Promise<WorkerManager> => {
  if (!defaultWorkerManager) {
    defaultWorkerManager = await createWorkerManager(config);
  }
  return defaultWorkerManager;
};

// 기본 인스턴스 정리
export const destroyDefaultWorkerManager = async (): Promise<void> => {
  if (defaultWorkerManager) {
    await defaultWorkerManager.terminate();
    defaultWorkerManager = null;
  }
};