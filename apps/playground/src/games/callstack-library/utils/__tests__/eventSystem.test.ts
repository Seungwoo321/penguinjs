/**
 * eventSystem 단위 테스트
 * 
 * 게임 이벤트 시스템의 중앙화된 이벤트 관리를 검증합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import {
  GameEventManager,
  MiddlewareEventManager,
  gameEventManager,
  gameEvents,
  useGameEvent,
  loggingMiddleware,
  analyticsMiddleware,
  performanceMiddleware,
  type EventMap,
  type EventListener,
  type EventMiddleware
} from '../eventSystem';

// Mock React
vi.mock('react', () => ({
  useEffect: vi.fn(),
  DependencyList: [] as any
}));

// Mock document
const mockDocument = {
  createElement: vi.fn((tagName: string) => ({
    tagName: tagName.toUpperCase(),
    nodeName: tagName.toUpperCase(),
    nodeType: 1
  }))
};

vi.stubGlobal('document', mockDocument);

describe('eventSystem', () => {
  let eventManager: GameEventManager;
  
  beforeEach(() => {
    eventManager = new GameEventManager();
    vi.clearAllMocks();
  });

  describe('GameEventManager', () => {
    describe('subscribe', () => {
      it('이벤트 구독이 올바르게 동작해야 한다', () => {
        const listener = vi.fn();
        const unsubscribe = eventManager.subscribe('game:start', listener);
        
        expect(typeof unsubscribe).toBe('function');
        expect(eventManager.getListenerCount('game:start')).toBe(1);
      });

      it('여러 리스너를 구독할 수 있어야 한다', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();
        
        eventManager.subscribe('game:start', listener1);
        eventManager.subscribe('game:start', listener2);
        
        expect(eventManager.getListenerCount('game:start')).toBe(2);
      });

      it('구독 해제가 올바르게 동작해야 한다', () => {
        const listener = vi.fn();
        const unsubscribe = eventManager.subscribe('game:start', listener);
        
        expect(eventManager.getListenerCount('game:start')).toBe(1);
        
        unsubscribe();
        
        expect(eventManager.getListenerCount('game:start')).toBe(0);
      });

      it('마지막 리스너 제거 시 이벤트 타입도 제거되어야 한다', () => {
        const listener = vi.fn();
        const unsubscribe = eventManager.subscribe('game:start', listener);
        
        unsubscribe();
        
        expect(eventManager.getListenerCount('game:start')).toBe(0);
      });
    });

    describe('emit', () => {
      it('이벤트 발생 시 모든 리스너가 호출되어야 한다', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();
        
        eventManager.subscribe('game:start', listener1);
        eventManager.subscribe('game:start', listener2);
        
        const eventData = { stage: 1 };
        eventManager.emit('game:start', eventData);
        
        expect(listener1).toHaveBeenCalledWith(eventData);
        expect(listener2).toHaveBeenCalledWith(eventData);
      });

      it('리스너가 없는 이벤트도 정상 처리되어야 한다', () => {
        expect(() => {
          eventManager.emit('game:start', { stage: 1 });
        }).not.toThrow();
      });

      it('리스너에서 오류 발생 시 다른 리스너에 영향주지 않아야 한다', () => {
        const errorListener = vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        });
        const normalListener = vi.fn();
        
        eventManager.subscribe('game:start', errorListener);
        eventManager.subscribe('game:start', normalListener);
        
        const eventData = { stage: 1 };
        eventManager.emit('game:start', eventData);
        
        expect(errorListener).toHaveBeenCalledWith(eventData);
        expect(normalListener).toHaveBeenCalledWith(eventData);
      });

      it('이벤트가 히스토리에 저장되어야 한다', () => {
        const eventData = { stage: 1 };
        eventManager.emit('game:start', eventData);
        
        const history = eventManager.getEventHistory();
        expect(history).toHaveLength(1);
        expect(history[0].type).toBe('game:start');
        expect(history[0].data).toEqual(eventData);
        expect(history[0].timestamp).toBeInstanceOf(Date);
      });

      it('개발 모드에서 콘솔 로그가 출력되어야 한다', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        
        eventManager.emit('game:start', { stage: 1 });
        
        expect(consoleSpy).toHaveBeenCalledWith('🎮 Game Event: game:start', { stage: 1 });
        
        consoleSpy.mockRestore();
        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('removeAllListeners', () => {
      it('특정 이벤트 타입의 모든 리스너를 제거해야 한다', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();
        
        eventManager.subscribe('game:start', listener1);
        eventManager.subscribe('game:start', listener2);
        eventManager.subscribe('game:pause', listener1);
        
        expect(eventManager.getListenerCount('game:start')).toBe(2);
        expect(eventManager.getListenerCount('game:pause')).toBe(1);
        
        eventManager.removeAllListeners('game:start');
        
        expect(eventManager.getListenerCount('game:start')).toBe(0);
        expect(eventManager.getListenerCount('game:pause')).toBe(1);
      });

      it('모든 이벤트 타입의 리스너를 제거해야 한다', () => {
        const listener = vi.fn();
        
        eventManager.subscribe('game:start', listener);
        eventManager.subscribe('game:pause', listener);
        
        expect(eventManager.getListenerCount()).toBe(2);
        
        eventManager.removeAllListeners();
        
        expect(eventManager.getListenerCount()).toBe(0);
      });
    });

    describe('getEventHistory', () => {
      beforeEach(() => {
        eventManager.emit('game:start', { stage: 1 });
        eventManager.emit('game:pause', { step: 5 });
        eventManager.emit('game:start', { stage: 2 });
      });

      it('전체 이벤트 히스토리를 반환해야 한다', () => {
        const history = eventManager.getEventHistory();
        expect(history).toHaveLength(3);
        expect(history[0].type).toBe('game:start');
        expect(history[1].type).toBe('game:pause');
        expect(history[2].type).toBe('game:start');
      });

      it('특정 이벤트 타입만 필터링해야 한다', () => {
        const history = eventManager.getEventHistory('game:start');
        expect(history).toHaveLength(2);
        expect(history.every(event => event.type === 'game:start')).toBe(true);
      });

      it('제한된 개수만 반환해야 한다', () => {
        const history = eventManager.getEventHistory(undefined, 2);
        expect(history).toHaveLength(2);
        expect(history[0].type).toBe('game:pause');
        expect(history[1].type).toBe('game:start');
      });

      it('이벤트 타입과 제한을 동시에 적용해야 한다', () => {
        const history = eventManager.getEventHistory('game:start', 1);
        expect(history).toHaveLength(1);
        expect(history[0].type).toBe('game:start');
        expect(history[0].data.stage).toBe(2);
      });
    });

    describe('getEventStats', () => {
      it('이벤트 통계를 올바르게 계산해야 한다', () => {
        eventManager.emit('game:start', { stage: 1 });
        eventManager.emit('game:start', { stage: 2 });
        eventManager.emit('game:pause', { step: 5 });
        
        const stats = eventManager.getEventStats();
        expect(stats['game:start']).toBe(2);
        expect(stats['game:pause']).toBe(1);
      });

      it('빈 히스토리에 대해 빈 통계를 반환해야 한다', () => {
        const stats = eventManager.getEventStats();
        expect(Object.keys(stats)).toHaveLength(0);
      });
    });

    describe('getListenerCount', () => {
      it('특정 이벤트 타입의 리스너 수를 반환해야 한다', () => {
        eventManager.subscribe('game:start', vi.fn());
        eventManager.subscribe('game:start', vi.fn());
        eventManager.subscribe('game:pause', vi.fn());
        
        expect(eventManager.getListenerCount('game:start')).toBe(2);
        expect(eventManager.getListenerCount('game:pause')).toBe(1);
        expect(eventManager.getListenerCount('game:reset')).toBe(0);
      });

      it('전체 리스너 수를 반환해야 한다', () => {
        eventManager.subscribe('game:start', vi.fn());
        eventManager.subscribe('game:start', vi.fn());
        eventManager.subscribe('game:pause', vi.fn());
        
        expect(eventManager.getListenerCount()).toBe(3);
      });
    });

    describe('clearHistory', () => {
      it('이벤트 히스토리를 초기화해야 한다', () => {
        eventManager.emit('game:start', { stage: 1 });
        eventManager.emit('game:pause', { step: 5 });
        
        expect(eventManager.getEventHistory()).toHaveLength(2);
        
        eventManager.clearHistory();
        
        expect(eventManager.getEventHistory()).toHaveLength(0);
      });
    });

    describe('히스토리 크기 제한', () => {
      it('최대 히스토리 크기를 초과하지 않아야 한다', () => {
        // 1000개 초과로 이벤트 발생
        for (let i = 0; i < 1050; i++) {
          eventManager.emit('game:start', { stage: i });
        }
        
        const history = eventManager.getEventHistory();
        expect(history).toHaveLength(1000);
        expect(history[0].data.stage).toBe(50); // 처음 50개는 제거됨
        expect(history[999].data.stage).toBe(1049);
      });
    });
  });

  describe('MiddlewareEventManager', () => {
    let middlewareManager: MiddlewareEventManager;
    
    beforeEach(() => {
      middlewareManager = new MiddlewareEventManager();
    });

    it('미들웨어를 추가할 수 있어야 한다', () => {
      const middleware = vi.fn((eventType, data, next) => next());
      middlewareManager.use(middleware);
      
      middlewareManager.emit('game:start', { stage: 1 });
      
      expect(middleware).toHaveBeenCalledWith('game:start', { stage: 1 }, expect.any(Function));
    });

    it('여러 미들웨어가 순서대로 실행되어야 한다', () => {
      const callOrder: string[] = [];
      
      const middleware1 = vi.fn((eventType, data, next) => {
        callOrder.push('middleware1');
        next();
      });
      
      const middleware2 = vi.fn((eventType, data, next) => {
        callOrder.push('middleware2');
        next();
      });
      
      middlewareManager.use(middleware1);
      middlewareManager.use(middleware2);
      
      middlewareManager.emit('game:start', { stage: 1 });
      
      expect(callOrder).toEqual(['middleware1', 'middleware2']);
    });

    it('미들웨어에서 next를 호출하지 않으면 이벤트가 전달되지 않아야 한다', () => {
      const blockingMiddleware = vi.fn((eventType, data, next) => {
        // next()를 호출하지 않음
      });
      
      const listener = vi.fn();
      middlewareManager.subscribe('game:start', listener);
      middlewareManager.use(blockingMiddleware);
      
      middlewareManager.emit('game:start', { stage: 1 });
      
      expect(blockingMiddleware).toHaveBeenCalled();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('gameEvents 헬퍼 함수들', () => {
    beforeEach(() => {
      // gameEventManager를 모킹
      vi.spyOn(gameEventManager, 'emit');
    });

    it('게임 생명주기 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.gameStart(1);
      expect(gameEventManager.emit).toHaveBeenCalledWith('game:start', { stage: 1 });

      gameEvents.gamePause(5);
      expect(gameEventManager.emit).toHaveBeenCalledWith('game:pause', { step: 5 });

      gameEvents.gameResume(6);
      expect(gameEventManager.emit).toHaveBeenCalledWith('game:resume', { step: 6 });

      gameEvents.gameReset(2);
      expect(gameEventManager.emit).toHaveBeenCalledWith('game:reset', { stage: 2 });

      gameEvents.gameComplete(3, 100, 2);
      expect(gameEventManager.emit).toHaveBeenCalledWith('game:complete', { stage: 3, score: 100, hintsUsed: 2 });
    });

    it('스테이지 관련 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.stageChange(1, 2);
      expect(gameEventManager.emit).toHaveBeenCalledWith('stage:change', { from: 1, to: 2 });

      gameEvents.stageComplete(2, 150);
      expect(gameEventManager.emit).toHaveBeenCalledWith('stage:complete', { stage: 2, score: 150 });

      gameEvents.stageUnlock(3);
      expect(gameEventManager.emit).toHaveBeenCalledWith('stage:unlock', { stage: 3 });
    });

    it('큐 관련 이벤트들이 올바르게 발생해야 한다', () => {
      const mockItem = { id: 'test', name: 'testFunction' };

      gameEvents.queueItemAdded('callstack', mockItem, 0);
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:item_added', { queueType: 'callstack', item: mockItem, index: 0 });

      gameEvents.queueItemRemoved('callstack', mockItem, 0);
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:item_removed', { queueType: 'callstack', item: mockItem, index: 0 });

      gameEvents.queueItemMoved('callstack', 0, 1);
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:item_moved', { queueType: 'callstack', from: 0, to: 1 });

      gameEvents.queueCleared('callstack');
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:cleared', { queueType: 'callstack' });

      gameEvents.queueExecuted('callstack', mockItem);
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:executed', { queueType: 'callstack', item: mockItem });

      gameEvents.queueHighlighted('callstack');
      expect(gameEventManager.emit).toHaveBeenCalledWith('queue:highlighted', { queueType: 'callstack' });
    });

    it('실행 관련 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.executionStepForward(5, 10);
      expect(gameEventManager.emit).toHaveBeenCalledWith('execution:step_forward', { step: 5, totalSteps: 10 });

      gameEvents.executionStepBackward(4, 10);
      expect(gameEventManager.emit).toHaveBeenCalledWith('execution:step_backward', { step: 4, totalSteps: 10 });

      gameEvents.executionSpeedChange(2);
      expect(gameEventManager.emit).toHaveBeenCalledWith('execution:speed_change', { speed: 2 });
    });

    it('UI 상호작용 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.functionSelected('myFunction');
      expect(gameEventManager.emit).toHaveBeenCalledWith('ui:function_selected', { functionName: 'myFunction' });

      gameEvents.functionDeselected('myFunction');
      expect(gameEventManager.emit).toHaveBeenCalledWith('ui:function_deselected', { functionName: 'myFunction' });

      gameEvents.hintRequested('hint1');
      expect(gameEventManager.emit).toHaveBeenCalledWith('ui:hint_requested', { hintId: 'hint1' });

      gameEvents.hintShown('hint1', 10);
      expect(gameEventManager.emit).toHaveBeenCalledWith('ui:hint_shown', { hintId: 'hint1', cost: 10 });

      gameEvents.solutionShown(1);
      expect(gameEventManager.emit).toHaveBeenCalledWith('ui:solution_shown', { stage: 1 });
    });

    it('평가 관련 이벤트들이 올바르게 발생해야 한다', () => {
      const userAnswer = { answer: 'test' };
      gameEvents.evaluationSubmit(userAnswer);
      expect(gameEventManager.emit).toHaveBeenCalledWith('evaluation:submit', { userAnswer });

      gameEvents.evaluationResult(true, 100);
      expect(gameEventManager.emit).toHaveBeenCalledWith('evaluation:result', { isCorrect: true, score: 100 });

      gameEvents.evaluationResult(false, 0, ['error1', 'error2']);
      expect(gameEventManager.emit).toHaveBeenCalledWith('evaluation:result', { isCorrect: false, score: 0, errors: ['error1', 'error2'] });

      gameEvents.evaluationValidate(3, true);
      expect(gameEventManager.emit).toHaveBeenCalledWith('evaluation:validate', { step: 3, result: true });
    });

    it('접근성 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.accessibilityAnnounce('Test message');
      expect(gameEventManager.emit).toHaveBeenCalledWith('accessibility:announce', { message: 'Test message', priority: 'polite' });

      gameEvents.accessibilityAnnounce('Urgent message', 'assertive');
      expect(gameEventManager.emit).toHaveBeenCalledWith('accessibility:announce', { message: 'Urgent message', priority: 'assertive' });

      const mockElement = document.createElement('button');
      gameEvents.accessibilityFocusChange(mockElement, 'test context');
      expect(gameEventManager.emit).toHaveBeenCalledWith('accessibility:focus_change', { element: mockElement, context: 'test context' });
    });

    it('성능 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.performanceRender('TestComponent', 16.5);
      expect(gameEventManager.emit).toHaveBeenCalledWith('performance:render', { component: 'TestComponent', time: 16.5 });

      gameEvents.performanceMemoryPressure('TestComponent', 85);
      expect(gameEventManager.emit).toHaveBeenCalledWith('performance:memory_pressure', { component: 'TestComponent', usage: 85 });
    });

    it('디버그 이벤트들이 올바르게 발생해야 한다', () => {
      gameEvents.debugLog('info', 'Info message');
      expect(gameEventManager.emit).toHaveBeenCalledWith('debug:log', { level: 'info', message: 'Info message' });

      gameEvents.debugLog('error', 'Error message', { error: 'details' });
      expect(gameEventManager.emit).toHaveBeenCalledWith('debug:log', { level: 'error', message: 'Error message', data: { error: 'details' } });
    });
  });

  describe('useGameEvent', () => {
    it('정상적으로 동작해야 한다', () => {
      const listener = vi.fn();
      
      expect(() => {
        useGameEvent('game:start', listener, []);
      }).not.toThrow();
    });

    it('의존성 배열과 함께 정상적으로 동작해야 한다', () => {
      const listener = vi.fn();
      const deps = ['dep1', 'dep2'];
      
      expect(() => {
        useGameEvent('game:start', listener, deps);
      }).not.toThrow();
    });

    it('useEffect가 unsubscribe 함수를 반환해야 한다', () => {
      const listener = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      // gameEventManager.subscribe가 unsubscribe를 반환하도록 모킹
      vi.spyOn(gameEventManager, 'subscribe').mockReturnValue(mockUnsubscribe);
      
      // React.useEffect가 cleanup 함수를 받는지 확인
      const mockUseEffect = vi.mocked(React.useEffect);
      
      useGameEvent('game:start', listener, []);
      
      expect(mockUseEffect).toHaveBeenCalled();
      // useEffect의 첫 번째 인자 (effect 함수)를 실행하고 cleanup 함수 확인
      const effectCallback = mockUseEffect.mock.calls[0][0];
      const cleanup = effectCallback();
      
      expect(cleanup).toBe(mockUnsubscribe);
    });

    it('의존성 배열이 useEffect에 올바르게 전달되어야 한다', () => {
      const listener = vi.fn();
      const deps = ['test'];
      const mockUseEffect = vi.mocked(React.useEffect);
      
      useGameEvent('game:start', listener, deps);
      
      expect(mockUseEffect).toHaveBeenCalledWith(
        expect.any(Function),
        ['game:start', ...deps]
      );
    });
  });

  describe('미들웨어들', () => {
    describe('loggingMiddleware', () => {
      it('이벤트를 로깅하고 next를 호출해야 한다', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const next = vi.fn();
        
        loggingMiddleware('game:start', { stage: 1 }, next);
        
        expect(consoleSpy).toHaveBeenCalledWith('[Event] game:start', { stage: 1 });
        expect(next).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });
    });

    describe('analyticsMiddleware', () => {
      it('gtag가 있을 때 분석 데이터를 전송해야 한다', () => {
        const mockGtag = vi.fn();
        const originalWindow = global.window;
        
        global.window = {
          gtag: mockGtag
        } as any;
        
        const next = vi.fn();
        
        analyticsMiddleware('game:start', { stage: 1 }, next);
        
        expect(mockGtag).toHaveBeenCalledWith('event', 'game:start', {
          custom_parameter: { stage: 1 }
        });
        expect(next).toHaveBeenCalled();
        
        global.window = originalWindow;
      });

      it('gtag가 없을 때도 정상 동작해야 한다', () => {
        const originalWindow = global.window;
        global.window = {} as any;
        
        const next = vi.fn();
        
        expect(() => {
          analyticsMiddleware('game:start', { stage: 1 }, next);
        }).not.toThrow();
        
        expect(next).toHaveBeenCalled();
        
        global.window = originalWindow;
      });

      it('window가 undefined일 때도 정상 동작해야 한다', () => {
        const originalWindow = global.window;
        delete (global as any).window;
        
        const next = vi.fn();
        
        expect(() => {
          analyticsMiddleware('game:start', { stage: 1 }, next);
        }).not.toThrow();
        
        expect(next).toHaveBeenCalled();
        
        global.window = originalWindow;
      });
    });

    describe('performanceMiddleware', () => {
      it('느린 이벤트 처리에 대해 경고해야 한다', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // performance.now을 모킹하여 느린 처리 시뮬레이션
        const originalNow = performance.now;
        let callCount = 0;
        performance.now = vi.fn(() => {
          callCount++;
          return callCount === 1 ? 0 : 20; // 20ms 소요 시뮬레이션
        });
        
        const next = vi.fn();
        
        performanceMiddleware('game:start', { stage: 1 }, next);
        
        expect(consoleSpy).toHaveBeenCalledWith('Slow event processing: game:start took 20ms');
        expect(next).toHaveBeenCalled();
        
        performance.now = originalNow;
        consoleSpy.mockRestore();
      });

      it('빠른 이벤트 처리에는 경고하지 않아야 한다', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const originalNow = performance.now;
        let callCount = 0;
        performance.now = vi.fn(() => {
          callCount++;
          return callCount === 1 ? 0 : 10; // 10ms 소요 시뮬레이션
        });
        
        const next = vi.fn();
        
        performanceMiddleware('game:start', { stage: 1 }, next);
        
        expect(consoleSpy).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        
        performance.now = originalNow;
        consoleSpy.mockRestore();
      });
    });
  });

  describe('엣지 케이스', () => {
    it('빈 이벤트 데이터를 처리해야 한다', () => {
      const listener = vi.fn();
      eventManager.subscribe('game:start', listener);
      
      eventManager.emit('game:start', { stage: 0 });
      
      expect(listener).toHaveBeenCalledWith({ stage: 0 });
    });

    it('동일한 리스너를 여러 번 구독해도 한 번만 등록되어야 한다', () => {
      const listener = vi.fn();
      eventManager.subscribe('game:start', listener);
      eventManager.subscribe('game:start', listener);
      
      expect(eventManager.getListenerCount('game:start')).toBe(1);
    });

    it('존재하지 않는 이벤트 타입의 리스너 제거도 안전해야 한다', () => {
      expect(() => {
        eventManager.removeAllListeners('nonexistent' as any);
      }).not.toThrow();
    });

    it('매우 큰 이벤트 데이터도 처리해야 한다', () => {
      const largeData = {
        stage: 1,
        bigArray: new Array(10000).fill('data'),
        bigObject: {}
      };
      
      for (let i = 0; i < 1000; i++) {
        (largeData.bigObject as any)[`key${i}`] = `value${i}`;
      }
      
      expect(() => {
        eventManager.emit('game:start', largeData);
      }).not.toThrow();
    });
  });
});