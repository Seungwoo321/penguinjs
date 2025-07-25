/**
 * CQRSEventLoopService 테스트
 * 
 * CQRS 패턴의 핵심 기능들과 서비스 통합을 검증합니다.
 */

import { 
  CQRSEventLoopService, 
  createCQRSEventLoopService,
  getDefaultCQRSService,
  destroyDefaultCQRSService
} from '../CQRSEventLoopService';
import { createCommand } from '../Commands';
import { createQuery } from '../Queries';

describe('CQRSEventLoopService', () => {
  let service: CQRSEventLoopService;

  beforeEach(() => {
    service = createCQRSEventLoopService({
      sessionId: 'test-session',
      enableLogging: false,
      enableMetrics: true,
      enableCaching: true
    });
  });

  afterEach(async () => {
    await service.destroy();
  });

  describe('서비스 초기화', () => {
    it('서비스가 올바르게 초기화되어야 한다', () => {
      const state = service.getState();
      
      expect(state.isInitialized).toBe(true);
      expect(state.sessionId).toBe('test-session');
      expect(state.commandsProcessed).toBe(0);
      expect(state.queriesProcessed).toBe(0);
    });

    it('설정이 올바르게 적용되어야 한다', () => {
      const config = service.getConfig();
      
      expect(config.sessionId).toBe('test-session');
      expect(config.enableCaching).toBe(true);
      expect(config.enableMetrics).toBe(true);
      expect(config.enableLogging).toBe(false);
    });
  });

  describe('명령 처리', () => {
    it('함수 푸시 명령이 정상 처리되어야 한다', async () => {
      const result = await service.pushFunction('testFunction', 'normal');
      
      expect(result.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
      
      const state = service.getState();
      expect(state.commandsProcessed).toBe(1);
    });

    it('함수 팝 명령이 정상 처리되어야 한다', async () => {
      // Given: 함수가 스택에 있음
      await service.pushFunction('testFunction');
      
      // When: 함수 팝
      const result = await service.popFunction();
      
      // Then
      expect(result.success).toBe(true);
      
      const state = service.getState();
      expect(state.commandsProcessed).toBe(2);
    });

    it('마이크로태스크 추가 명령이 정상 처리되어야 한다', async () => {
      const result = await service.enqueueMicrotask('promiseCallback', 'promise');
      
      expect(result.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('매크로태스크 추가 명령이 정상 처리되어야 한다', async () => {
      const result = await service.enqueueMacrotask('timeoutCallback', 'setTimeout', 100);
      
      expect(result.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('틱 실행 명령이 정상 처리되어야 한다', async () => {
      const result = await service.executeTick('step', 1);
      
      expect(result.success).toBe(true);
    });

    it('엔진 리셋 명령이 정상 처리되어야 한다', async () => {
      // Given: 일부 상태 변경
      await service.pushFunction('testFunction');
      
      // When: 리셋
      const result = await service.resetEngine();
      
      // Then
      expect(result.success).toBe(true);
    });

    it('시간 되돌리기 명령이 정상 처리되어야 한다', async () => {
      // Given: 여러 작업 수행
      await service.pushFunction('func1');
      await service.pushFunction('func2');
      const initialVersion = service.getEngine().getVersion();
      
      await service.pushFunction('func3');
      
      // When: 이전 버전으로 되돌리기
      const result = await service.rewindToTick(initialVersion);
      
      // Then
      expect(result.success).toBe(true);
    });
  });

  describe('쿼리 처리', () => {
    it('현재 상태 조회가 정상 처리되어야 한다', async () => {
      const result = await service.getCurrentState(true, true);
      
      expect(result.success).toBe(true);
      expect(result.data.eventLoopState).toBeDefined();
      expect(result.data.metrics).toBeDefined();
      
      const state = service.getState();
      expect(state.queriesProcessed).toBe(1);
    });

    it('콜스택 조회가 정상 처리되어야 한다', async () => {
      // Given: 스택에 함수 추가
      await service.pushFunction('testFunction');
      
      // When: 콜스택 조회
      const result = await service.getCallStack(true);
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.frames).toHaveLength(1);
      expect(result.data.depth).toBe(1);
      expect(result.data.topFrame?.name).toBe('testFunction');
    });

    it('큐 상태 조회가 정상 처리되어야 한다', async () => {
      // Given: 큐에 태스크 추가
      await service.enqueueMicrotask('microTask', 'promise');
      await service.enqueueMacrotask('macroTask', 'setTimeout', 100);
      
      // When: 큐 상태 조회
      const result = await service.getQueueStates();
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.microtaskQueue.count).toBe(1);
      expect(result.data.macrotaskQueue.count).toBe(1);
    });

    it('실행 히스토리 조회가 정상 처리되어야 한다', async () => {
      // Given: 여러 작업 수행
      await service.pushFunction('func1');
      await service.executeTick();
      
      // When: 히스토리 조회
      const result = await service.getExecutionHistory(10, true);
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.steps.length).toBeGreaterThan(0);
    });

    it('이벤트 조회가 정상 처리되어야 한다', async () => {
      // Given: 이벤트 생성
      await service.pushFunction('testFunction');
      
      // When: 이벤트 조회
      const result = await service.getEvents();
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('특정 타입 이벤트 조회가 정상 처리되어야 한다', async () => {
      // Given: 함수 푸시 이벤트 생성
      await service.pushFunction('testFunction');
      
      // When: 특정 타입 이벤트 조회
      const result = await service.getEventsByType('eventloop.function.pushed');
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].type).toBe('eventloop.function.pushed');
    });

    it('성능 메트릭 조회가 정상 처리되어야 한다', async () => {
      // Given: 일부 작업 수행
      await service.pushFunction('func1');
      await service.executeTick();
      
      // When: 성능 메트릭 조회
      const result = await service.getPerformanceMetrics(10000, true);
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.throughput).toBeDefined();
      expect(result.data.latency).toBeDefined();
      expect(result.data.utilization).toBeDefined();
      expect(result.data.errors).toBeDefined();
    });

    it('시뮬레이션 상태 조회가 정상 처리되어야 한다', async () => {
      const result = await service.getSimulationState();
      
      expect(result.success).toBe(true);
      expect(result.data.state).toBeDefined();
      expect(typeof result.data.stepNumber).toBe('number');
    });
  });

  describe('캐싱', () => {
    it('쿼리 결과가 캐시되어야 한다', async () => {
      // Given: 캐싱 활성화된 서비스
      const result1 = await service.getCurrentState();
      const result2 = await service.getCurrentState();
      
      // Then: 두 번째 요청은 캐시에서 반환
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.metadata.fromCache).toBe(true);
    });

    it('캐시 클리어가 정상 작동해야 한다', async () => {
      // Given: 캐시된 결과
      await service.getCurrentState();
      
      // When: 캐시 클리어
      service.clearQueryCache();
      
      // Then: 캐시 통계 확인
      const stats = service.getQueryCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('일시정지 및 재개', () => {
    it('실행을 일시정지하고 재개할 수 있어야 한다', async () => {
      // Given: 서비스 생성 및 초기 설정
      const service = createCQRSEventLoopService({ sessionId: 'test-session' });
      
      // When: 일시정지
      const pauseResult = await service.pauseExecution('테스트 일시정지');
      
      // Then: 일시정지 성공
      expect(pauseResult.success).toBe(true);
      
      // When: 재개 (특정 틱부터)
      const resumeResult = await service.resumeExecution(10);
      
      // Then: 재개 성공
      expect(resumeResult.success).toBe(true);
      
      service.destroy();
    });
  });

  describe('내부 접근자', () => {
    it('getEventStore를 통해 이벤트스토어에 접근할 수 있어야 한다', () => {
      // Given: 서비스 생성
      const service = createCQRSEventLoopService({ sessionId: 'test-session' });
      
      // When: 이벤트스토어 접근
      const eventStore = service.getEventStore();
      
      // Then: 이벤트스토어가 존재
      expect(eventStore).toBeDefined();
      
      service.destroy();
    });
  });

  describe('고급 기능', () => {
    it('복합 시나리오가 올바르게 처리되어야 한다', async () => {
      // Given: 복합 시나리오
      
      // 1. 콜스택에 함수 추가
      await service.pushFunction('main');
      await service.pushFunction('helper');
      
      // 2. 마이크로태스크와 매크로태스크 추가
      await service.enqueueMicrotask('promise.then', 'promise');
      await service.enqueueMacrotask('setTimeout', 'setTimeout', 0);
      
      // 3. 틱 실행
      await service.executeTick('step');
      
      // When: 전체 상태 조회
      const state = await service.getCurrentState(true, true);
      const callStack = await service.getCallStack();
      const queues = await service.getQueueStates();
      const history = await service.getExecutionHistory();
      
      // Then: 모든 상태가 일관성 있게 조회됨
      expect(state.success).toBe(true);
      expect(callStack.success).toBe(true);
      expect(queues.success).toBe(true);
      expect(history.success).toBe(true);
      
      // 상태 일관성 검증
      expect(callStack.data.frames).toHaveLength(state.data.eventLoopState.callStack.length);
    });

    it('스냅샷 생성이 정상 작동해야 한다', async () => {
      // Given: 일부 상태 변경
      await service.pushFunction('testFunction');
      await service.enqueueMicrotask('microTask', 'promise');
      
      // When: 스냅샷 생성
      const snapshot = await service.createSnapshot();
      
      // Then
      expect(snapshot.serviceState).toBeDefined();
      expect(snapshot.engineState).toBeDefined();
      expect(snapshot.eventHistory).toBeDefined();
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    it('헬스 체크가 정상 작동해야 한다', async () => {
      const health = await service.healthCheck();
      
      expect(health.healthy).toBe(true);
      expect(health.serviceState).toBeDefined();
      expect(health.engineVersion).toBeGreaterThan(0);
      expect(health.metrics).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('잘못된 명령에 대해 에러를 발생시켜야 한다', async () => {
      const invalidCommand = {
        id: 'invalid',
        type: 'InvalidCommand',
        timestamp: Date.now(),
        payload: {}
      } as any;

      await expect(service.executeCommand(invalidCommand)).rejects.toThrow();
    });

    it('잘못된 쿼리에 대해 에러를 발생시켜야 한다', async () => {
      const invalidQuery = {
        id: 'invalid',
        type: 'InvalidQuery',
        timestamp: Date.now(),
        payload: {}
      } as any;

      await expect(service.executeQuery(invalidQuery)).rejects.toThrow();
    });

    it('빈 스택에서 팝 시도 시 실패를 반환해야 한다', async () => {
      const result = await service.popFunction();
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Call stack is empty');
    });

    it('파괴된 서비스 사용 시 에러를 발생시켜야 한다', async () => {
      await service.destroy();
      
      await expect(service.pushFunction('test')).rejects.toThrow('Service has been destroyed');
      await expect(service.getCurrentState()).rejects.toThrow('Service has been destroyed');
    });
  });

  describe('메트릭 수집', () => {
    it('명령과 쿼리 실행 횟수가 올바르게 추적되어야 한다', async () => {
      // Given: 여러 명령과 쿼리 실행
      await service.pushFunction('func1');
      await service.pushFunction('func2');
      await service.getCurrentState();
      await service.getCallStack();
      
      // When: 상태 확인
      const state = service.getState();
      
      // Then
      expect(state.commandsProcessed).toBe(2);
      expect(state.queriesProcessed).toBe(2);
      expect(state.lastActivity).toBeGreaterThan(0);
    });
  });

  describe('동시성', () => {
    it('동시 명령 처리가 순서대로 처리되어야 한다', async () => {
      // Given: 동시에 여러 명령 실행
      const promises = [
        service.pushFunction('func1'),
        service.pushFunction('func2'),
        service.pushFunction('func3')
      ];
      
      // When: 모든 명령 완료 대기
      const results = await Promise.all(promises);
      
      // Then: 모든 명령이 성공
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // 최종 스택 상태 확인
      const callStack = await service.getCallStack();
      expect(callStack.data.frames).toHaveLength(3);
    });

    it('동시 쿼리 처리가 정상 작동해야 한다', async () => {
      // Given: 일부 상태 설정
      await service.pushFunction('testFunction');
      
      // When: 동시에 여러 쿼리 실행
      const promises = [
        service.getCurrentState(),
        service.getCallStack(),
        service.getQueueStates(),
        service.getEvents()
      ];
      
      const results = await Promise.all(promises);
      
      // Then: 모든 쿼리가 성공
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('고급 기능 - 헬스체크 에러', () => {
    it('헬스체크 중 에러 발생 시 false를 반환해야 한다', async () => {
      // Given: 서비스 생성
      const service = createCQRSEventLoopService({ sessionId: 'test-session' });

      // 내부 엔진의 getVersion 메서드를 모킹하여 에러 발생시킴
      const originalGetVersion = service['engine'].getVersion;
      service['engine'].getVersion = () => {
        throw new Error('Version fetch error');
      };

      // When: 헬스체크 실행
      const health = await service.healthCheck();

      // Then: healthy가 false이고 에러 메시지 포함
      expect(health.healthy).toBe(false);
      expect(health.error).toContain('Version fetch error');

      // Cleanup
      service['engine'].getVersion = originalGetVersion;
      service.destroy();
    });
  });

  describe('싱글톤 서비스', () => {
    afterEach(() => {
      // 각 테스트 후 싱글톤 초기화
      destroyDefaultCQRSService();
    });

    it('getDefaultCQRSService는 같은 인스턴스를 반환해야 한다', () => {
      // When: 여러 번 호출
      const service1 = getDefaultCQRSService();
      const service2 = getDefaultCQRSService();
      
      // Then: 같은 인스턴스
      expect(service1).toBe(service2);
      
      // Cleanup
      destroyDefaultCQRSService();
    });

    it('destroyDefaultCQRSService는 서비스를 정리해야 한다', () => {
      // Given: 서비스 생성
      const service = getDefaultCQRSService();
      expect(service).toBeDefined();
      
      // When: destroy 호출
      destroyDefaultCQRSService();
      
      // Then: 새로운 서비스 생성 시 다른 인스턴스
      const newService = getDefaultCQRSService();
      expect(newService).not.toBe(service);
      
      // Cleanup
      destroyDefaultCQRSService();
    });

    it('destroyDefaultCQRSService는 서비스가 없을 때도 에러없이 실행되어야 한다', () => {
      // When & Then: 에러 없이 실행
      expect(() => destroyDefaultCQRSService()).not.toThrow();
    });
  });
});