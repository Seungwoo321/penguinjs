/**
 * 게임 이벤트 시스템
 * 컴포넌트 간 느슨한 결합을 위한 중앙화된 이벤트 관리
 */

import * as React from 'react';
import { QueueType, QueueItem } from '../types';

// 게임 이벤트 타입 정의
export interface GameEvent {
  type: string;
  timestamp: number;
  data?: any;
}

export interface QueueEvent extends GameEvent {
  queueType: QueueType;
  item?: QueueItem;
}

// 이벤트 타입 매핑
export interface EventMap {
  // 게임 생명주기 이벤트
  'game:start': { stage: number };
  'game:pause': { step: number };
  'game:resume': { step: number };
  'game:reset': { stage: number };
  'game:complete': { stage: number; score: number; hintsUsed: number };
  
  // 스테이지 관련 이벤트
  'stage:change': { from: number; to: number };
  'stage:complete': { stage: number; score: number };
  'stage:unlock': { stage: number };
  
  // 큐 관련 이벤트
  'queue:item_added': { queueType: QueueType; item: QueueItem; index: number };
  'queue:item_removed': { queueType: QueueType; item: QueueItem; index: number };
  'queue:item_moved': { queueType: QueueType; from: number; to: number };
  'queue:cleared': { queueType: QueueType };
  'queue:executed': { queueType: QueueType; item: QueueItem };
  'queue:highlighted': { queueType: QueueType | null };
  
  // 실행 관련 이벤트
  'execution:step_forward': { step: number; totalSteps: number };
  'execution:step_backward': { step: number; totalSteps: number };
  'execution:speed_change': { speed: number };
  
  // UI 상호작용 이벤트
  'ui:function_selected': { functionName: string };
  'ui:function_deselected': { functionName: string };
  'ui:hint_requested': { hintId: string };
  'ui:hint_shown': { hintId: string; cost: number };
  'ui:solution_shown': { stage: number };
  
  // 평가 관련 이벤트
  'evaluation:submit': { userAnswer: any };
  'evaluation:result': { isCorrect: boolean; score: number; errors?: string[] };
  'evaluation:validate': { step: number; result: boolean };
  
  // 접근성 이벤트
  'accessibility:announce': { message: string; priority: 'polite' | 'assertive' };
  'accessibility:focus_change': { element: HTMLElement; context: string };
  
  // 성능 관련 이벤트
  'performance:render': { component: string; time: number };
  'performance:memory_pressure': { component: string; usage: number };
  
  // 디버그 이벤트
  'debug:log': { level: 'info' | 'warn' | 'error'; message: string; data?: any };
}

// 이벤트 리스너 타입
export type EventListener<T extends keyof EventMap> = (data: EventMap[T]) => void;

// 이벤트 구독 해제 함수 타입
export type UnsubscribeFunction = () => void;

/**
 * 게임 이벤트 관리자 클래스
 */
export class GameEventManager {
  private listeners: Map<keyof EventMap, Set<EventListener<any>>> = new Map();
  private eventHistory: Array<{ type: keyof EventMap; data: any; timestamp: Date }> = [];
  private maxHistorySize = 1000;
  
  /**
   * 이벤트 구독
   */
  subscribe<T extends keyof EventMap>(
    eventType: T,
    listener: EventListener<T>
  ): UnsubscribeFunction {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    // 구독 해제 함수 반환
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }
  
  /**
   * 이벤트 발생
   */
  emit<T extends keyof EventMap>(eventType: T, data: EventMap[T]): void {
    // 히스토리 저장
    this.addToHistory(eventType, data);
    
    // 리스너들에게 이벤트 전달
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
          // 디버그 이벤트 발생
          this.emit('debug:log', {
            level: 'error',
            message: `Event listener error for ${eventType}`,
            data: { error, eventData: data }
          });
        }
      });
    }
    
    // 개발 모드에서 이벤트 로깅 제거 (메모리 최적화)
  }
  
  /**
   * 모든 리스너 제거
   */
  removeAllListeners(eventType?: keyof EventMap): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
  
  /**
   * 이벤트 히스토리에 추가
   */
  private addToHistory<T extends keyof EventMap>(eventType: T, data: EventMap[T]): void {
    this.eventHistory.push({
      type: eventType,
      data,
      timestamp: new Date()
    });
    
    // 히스토리 크기 제한
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
  
  /**
   * 이벤트 히스토리 조회
   */
  getEventHistory(
    eventType?: keyof EventMap,
    limit?: number
  ): Array<{ type: keyof EventMap; data: any; timestamp: Date }> {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }
  
  /**
   * 이벤트 통계
   */
  getEventStats(): Record<keyof EventMap, number> {
    const stats: Partial<Record<keyof EventMap, number>> = {};
    
    this.eventHistory.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    
    return stats as Record<keyof EventMap, number>;
  }
  
  /**
   * 리스너 수 조회
   */
  getListenerCount(eventType?: keyof EventMap): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    
    return Array.from(this.listeners.values())
      .reduce((total, listeners) => total + listeners.size, 0);
  }
  
  /**
   * 이벤트 히스토리 초기화
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// 전역 이벤트 관리자 인스턴스
export const gameEventManager = new GameEventManager();

/**
 * React Hook for event subscription
 */
export function useGameEvent<T extends keyof EventMap>(
  eventType: T,
  listener: EventListener<T>,
  dependencies: React.DependencyList = []
): void {
  React.useEffect(() => {
    const unsubscribe = gameEventManager.subscribe(eventType, listener);
    return unsubscribe;
  }, [eventType, ...dependencies]);
}

/**
 * 이벤트 발생 헬퍼 함수들
 */
export const gameEvents = {
  // 게임 생명주기
  gameStart: (stage: number) => 
    gameEventManager.emit('game:start', { stage }),
  
  gamePause: (step: number) =>
    gameEventManager.emit('game:pause', { step }),
  
  gameResume: (step: number) =>
    gameEventManager.emit('game:resume', { step }),
  
  gameReset: (stage: number) =>
    gameEventManager.emit('game:reset', { stage }),
  
  gameComplete: (stage: number, score: number, hintsUsed: number) =>
    gameEventManager.emit('game:complete', { stage, score, hintsUsed }),
  
  // 스테이지 관련
  stageChange: (from: number, to: number) =>
    gameEventManager.emit('stage:change', { from, to }),
  
  stageComplete: (stage: number, score: number) =>
    gameEventManager.emit('stage:complete', { stage, score }),
  
  stageUnlock: (stage: number) =>
    gameEventManager.emit('stage:unlock', { stage }),
  
  // 큐 관련
  queueItemAdded: (queueType: QueueType, item: QueueItem, index: number) =>
    gameEventManager.emit('queue:item_added', { queueType, item, index }),
  
  queueItemRemoved: (queueType: QueueType, item: QueueItem, index: number) =>
    gameEventManager.emit('queue:item_removed', { queueType, item, index }),
  
  queueItemMoved: (queueType: QueueType, from: number, to: number) =>
    gameEventManager.emit('queue:item_moved', { queueType, from, to }),
  
  queueCleared: (queueType: QueueType) =>
    gameEventManager.emit('queue:cleared', { queueType }),
  
  queueExecuted: (queueType: QueueType, item: QueueItem) =>
    gameEventManager.emit('queue:executed', { queueType, item }),
  
  queueHighlighted: (queueType: QueueType | null) =>
    gameEventManager.emit('queue:highlighted', { queueType }),
  
  // 실행 관련
  executionStepForward: (step: number, totalSteps: number) =>
    gameEventManager.emit('execution:step_forward', { step, totalSteps }),
  
  executionStepBackward: (step: number, totalSteps: number) =>
    gameEventManager.emit('execution:step_backward', { step, totalSteps }),
  
  executionSpeedChange: (speed: number) =>
    gameEventManager.emit('execution:speed_change', { speed }),
  
  // UI 상호작용
  functionSelected: (functionName: string) =>
    gameEventManager.emit('ui:function_selected', { functionName }),
  
  functionDeselected: (functionName: string) =>
    gameEventManager.emit('ui:function_deselected', { functionName }),
  
  hintRequested: (hintId: string) =>
    gameEventManager.emit('ui:hint_requested', { hintId }),
  
  hintShown: (hintId: string, cost: number) =>
    gameEventManager.emit('ui:hint_shown', { hintId, cost }),
  
  solutionShown: (stage: number) =>
    gameEventManager.emit('ui:solution_shown', { stage }),
  
  // 평가 관련
  evaluationSubmit: (userAnswer: any) =>
    gameEventManager.emit('evaluation:submit', { userAnswer }),
  
  evaluationResult: (isCorrect: boolean, score: number, errors?: string[]) =>
    gameEventManager.emit('evaluation:result', { isCorrect, score, errors }),
  
  evaluationValidate: (step: number, result: boolean) =>
    gameEventManager.emit('evaluation:validate', { step, result }),
  
  // 접근성
  accessibilityAnnounce: (message: string, priority: 'polite' | 'assertive' = 'polite') =>
    gameEventManager.emit('accessibility:announce', { message, priority }),
  
  accessibilityFocusChange: (element: HTMLElement, context: string) =>
    gameEventManager.emit('accessibility:focus_change', { element, context }),
  
  // 성능
  performanceRender: (component: string, time: number) =>
    gameEventManager.emit('performance:render', { component, time }),
  
  performanceMemoryPressure: (component: string, usage: number) =>
    gameEventManager.emit('performance:memory_pressure', { component, usage }),
  
  // 디버그
  debugLog: (level: 'info' | 'warn' | 'error', message: string, data?: any) =>
    gameEventManager.emit('debug:log', { level, message, data })
};

/**
 * 이벤트 미들웨어 타입
 */
export type EventMiddleware = <T extends keyof EventMap>(
  eventType: T,
  data: EventMap[T],
  next: () => void
) => void;

/**
 * 미들웨어 지원 이벤트 관리자
 */
export class MiddlewareEventManager extends GameEventManager {
  private middlewares: EventMiddleware[] = [];
  
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }
  
  emit<T extends keyof EventMap>(eventType: T, data: EventMap[T]): void {
    let index = 0;
    
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(eventType, data, next);
      } else {
        super.emit(eventType, data);
      }
    };
    
    next();
  }
}

// 미들웨어 예시들
export const loggingMiddleware: EventMiddleware = (eventType, data, next) => {
  // 개발 환경에서만 로깅 (메모리 최적화)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Event] ${eventType}`, data);
  }
  next();
};

export const analyticsMiddleware: EventMiddleware = (eventType, data, next) => {
  // 분석 데이터 전송 로직
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventType, {
      custom_parameter: data
    });
  }
  next();
};

export const performanceMiddleware: EventMiddleware = (eventType, data, next) => {
  const start = performance.now();
  next();
  const end = performance.now();
  
  if (end - start > 16) { // 16ms = 60fps threshold
    console.warn(`Slow event processing: ${eventType} took ${end - start}ms`);
  }
};