/**
 * 메모리 관리 훅 - 새로운 접근법
 * 상태 기반에서 이벤트 기반으로 전환, 의존성 체인 완전 제거
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface MemoryStats {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  leakDetected?: boolean;
  componentCount: number;
}

interface UseMemoryManagementOptions {
  enableMonitoring?: boolean;
  leakThreshold?: number; // MB
  cleanupInterval?: number; // ms
  maxComponentAge?: number; // ms
}

interface UseMemoryManagementResult {
  getCurrentMetrics: () => MemoryStats;
  registerCleanup: (cleanup: () => void) => () => void;
  forceCleanup: () => void;
  isMemoryPressure: () => boolean;
  optimizeMemory: () => void;
}

/**
 * 메모리 관리 훅 - 새로운 접근법
 * 🔑 핵심 변경사항:
 * 1. 상태 대신 ref 사용하여 리렌더링 방지
 * 2. 의존성 체인 완전 제거 
 * 3. 이벤트 기반 알림 시스템
 * 4. Stale closure 방지
 */
export const useMemoryManagement = (
  options: UseMemoryManagementOptions = {}
): UseMemoryManagementResult => {
  const {
    enableMonitoring = process.env.NODE_ENV === 'development',
    leakThreshold = 80,
    cleanupInterval = 30000,
    maxComponentAge = 300000
  } = options;

  // 🔑 핵심 변경: 상태 대신 ref 사용하여 리렌더링 방지
  const metricsRef = useRef<MemoryStats>({
    componentCount: 0,
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    leakDetected: false
  });

  const cleanupFunctionsRef = useRef<Set<() => void>>(new Set());
  const componentTimestampRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observersRef = useRef<{
    mutation?: MutationObserver;
    intersection?: IntersectionObserver;
    resize?: ResizeObserver;
  }>({});

  // 🔑 핵심 변경: 안정적인 함수 참조 (의존성 없음)
  const checkMemoryAndNotify = useRef<() => void>(() => {});
  const performCleanup = useRef<() => void>(() => {});

  // 메모리 체크 및 이벤트 발생 (상태 업데이트 없음)
  checkMemoryAndNotify.current = () => {
    if (!enableMonitoring) return;

    const componentCount = cleanupFunctionsRef.current.size;
    let memoryData: MemoryStats = { componentCount };

    // Chrome memory API 사용
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedJSHeapSize = memory.usedJSHeapSize;
      const usedMB = usedJSHeapSize / (1024 * 1024);
      const leakDetected = usedMB > leakThreshold;

      memoryData = {
        ...memoryData,
        usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        leakDetected
      };

      // ref 업데이트 (리렌더링 없음)
      metricsRef.current = memoryData;

      // 임계값 초과시에만 경고 및 이벤트 발생
      if (leakDetected) {
        console.warn(`🚨 Memory leak detected: ${usedMB.toFixed(2)}MB used`);
        
        // 이벤트 시스템으로 알림 (리렌더링 없음)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('memory-pressure', {
            detail: { component: 'useMemoryManagement', usage: usedMB }
          }));
        }
        
        // 자동 최적화 - 5분마다 한 번만 실행
        const now = Date.now();
        const timeSinceLastCleanup = now - componentTimestampRef.current;
        
        if (usedMB > leakThreshold * 0.8 && timeSinceLastCleanup > maxComponentAge) {
          console.log(`🧹 Auto-optimizing memory due to pressure (last cleanup: ${Math.round(timeSinceLastCleanup / 1000)}s ago)`);
          if (performCleanup.current) {
            performCleanup.current();
          }
          componentTimestampRef.current = now;
        }
      }
    }
  };

  // 🔑 핵심 변경: 메모리 정리 실행 (상태 업데이트 없음)
  performCleanup.current = () => {
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup function failed:', error);
      }
    });
    
    cleanupFunctionsRef.current.clear();
    
    // 옵저버들 정리
    Object.values(observersRef.current).forEach(observer => {
      if (observer) {
        observer.disconnect();
      }
    });
    
    // 가비지 컬렉션 제안
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // 🔑 핵심 수정: 순환 호출 방지 - cleanup 후 즉시 메모리 체크하지 않음
    // 메모리 체크는 다음 interval에서 자연스럽게 실행됨
  };

  // 🔑 핵심 변경: 정리 함수 등록 (의존성 없음)
  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctionsRef.current.add(cleanup);
    
    return () => {
      cleanupFunctionsRef.current.delete(cleanup);
    };
  }, []); // 빈 의존성 배열

  // 🔑 핵심 변경: 현재 메트릭스 조회 (상태 대신 ref)
  const getCurrentMetrics = useCallback((): MemoryStats => {
    return { ...metricsRef.current };
  }, []);

  // 🔑 핵심 변경: 메모리 압박 체크 (상태 의존 없이 ref 사용)
  const isMemoryPressure = useCallback((): boolean => {
    const current = metricsRef.current;
    return current.usedJSHeapSize 
      ? current.usedJSHeapSize / (1024 * 1024) > leakThreshold * 0.8
      : false;
  }, [leakThreshold]);

  // 🔑 핵심 변경: 강제 정리 (상태 업데이트 없음)
  const forceCleanup = useCallback(() => {
    if (performCleanup.current) {
      performCleanup.current();
    }
  }, []);

  // 🔑 핵심 변경: 메모리 최적화 (상태 업데이트 없음)
  const optimizeMemory = useCallback(() => {
    // 오래된 컴포넌트 정리
    const now = Date.now();
    if (now - componentTimestampRef.current > maxComponentAge) {
      if (performCleanup.current) {
        performCleanup.current();
      }
      componentTimestampRef.current = now;
    }

    // 캐시 정리
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('temp') || cacheName.includes('old')) {
            caches.delete(cacheName);
          }
        });
      });
    }

    // 🔑 핵심 수정: 순환 호출 방지 - 수동 최적화 후 즉시 메모리 체크하지 않음
    // 메모리 체크는 다음 interval에서 자연스럽게 실행됨
  }, [maxComponentAge]); // 의존성 최소화

  // 🔑 핵심 변경: 단순한 interval 관리 (의존성 체인 없음)
  useEffect(() => {
    if (!enableMonitoring) return;

    // 초기 메모리 체크
    if (checkMemoryAndNotify.current) {
      checkMemoryAndNotify.current();
    }
    
    // 단순한 interval 설정 - 중복 실행 방지
    intervalRef.current = setInterval(() => {
      // 메모리 체크만 수행 (자동 최적화는 체크 함수 내부로 이동)
      if (checkMemoryAndNotify.current) {
        checkMemoryAndNotify.current();
      }
    }, cleanupInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableMonitoring, cleanupInterval, leakThreshold, maxComponentAge]); // 안정적인 의존성만

  // 🔑 핵심 변경: 컴포넌트 언마운트 시 정리 (의존성 없음)
  useEffect(() => {
    return () => {
      if (performCleanup.current) {
        performCleanup.current();
      }
    };
  }, []); // 빈 의존성 배열

  return {
    getCurrentMetrics,
    registerCleanup,
    forceCleanup,
    isMemoryPressure,
    optimizeMemory
  };
};

/**
 * 이벤트 리스너 안전 관리 훅
 */
export const useSafeEventListener = () => {
  const listenersRef = useRef<Map<string, { element: EventTarget; listener: EventListener; options?: AddEventListenerOptions }>>(new Map());

  const addEventListener = useCallback((
    element: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    const key = `${type}-${Math.random()}`;
    
    element.addEventListener(type, listener, options);
    listenersRef.current.set(key, { element, listener, options });
    
    return () => {
      element.removeEventListener(type, listener, options);
      listenersRef.current.delete(key);
    };
  }, []);

  const removeAllListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, listener, options }, key) => {
      element.removeEventListener(key.split('-')[0], listener, options);
    });
    listenersRef.current.clear();
  }, []);

  useEffect(() => {
    return removeAllListeners;
  }, [removeAllListeners]);

  return {
    addEventListener,
    removeAllListeners,
    activeListeners: listenersRef.current.size
  };
};

/**
 * 타이머 안전 관리 훅
 */
export const useSafeTimers = () => {
  const timersRef = useRef<Set<NodeJS.Timeout | number>>(new Set());

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = globalThis.setTimeout(() => {
      callback();
      timersRef.current.delete(timer);
    }, delay);
    
    timersRef.current.add(timer);
    return timer;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timer = globalThis.setInterval(callback, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const clearTimer = useCallback((timer: NodeJS.Timeout | number) => {
    globalThis.clearTimeout(timer);
    globalThis.clearInterval(timer);
    timersRef.current.delete(timer);
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => {
      globalThis.clearTimeout(timer);
      globalThis.clearInterval(timer);
    });
    timersRef.current.clear();
  }, []);

  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  return {
    setTimeout,
    setInterval,
    clearTimer,
    clearAllTimers,
    activeTimers: timersRef.current.size
  };
};

/**
 * WeakMap 기반 캐시 훅
 */
export const useWeakMapCache = <K extends object, V>() => {
  const cacheRef = useRef(new WeakMap<K, V>());

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.set(key, value);
  }, []);

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const remove = useCallback((key: K): boolean => {
    return cacheRef.current.delete(key);
  }, []);

  const getOrSet = useCallback((key: K, factory: () => V): V => {
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    
    const value = factory();
    cacheRef.current.set(key, value);
    return value;
  }, []);

  return {
    get,
    set,
    has,
    remove,
    getOrSet
  };
};

/**
 * 리소스 풀 관리 훅
 */
export const useResourcePool = <T>(
  factory: () => T,
  cleanup: (resource: T) => void,
  maxSize: number = 10
) => {
  const poolRef = useRef<T[]>([]);
  const activeResourcesRef = useRef<Set<T>>(new Set());

  const acquire = useCallback((): T => {
    if (poolRef.current.length > 0) {
      const resource = poolRef.current.pop()!;
      activeResourcesRef.current.add(resource);
      return resource;
    }
    
    const resource = factory();
    activeResourcesRef.current.add(resource);
    return resource;
  }, [factory]);

  const release = useCallback((resource: T): void => {
    activeResourcesRef.current.delete(resource);
    
    if (poolRef.current.length < maxSize) {
      poolRef.current.push(resource);
    } else {
      cleanup(resource);
    }
  }, [cleanup, maxSize]);

  const clear = useCallback((): void => {
    // 활성 리소스 정리
    activeResourcesRef.current.forEach(resource => {
      cleanup(resource);
    });
    activeResourcesRef.current.clear();
    
    // 풀의 리소스 정리
    poolRef.current.forEach(resource => {
      cleanup(resource);
    });
    poolRef.current = [];
  }, [cleanup]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return {
    acquire,
    release,
    clear,
    poolSize: poolRef.current.length,
    activeCount: activeResourcesRef.current.size
  };
};

/**
 * 메모리 누수 감지 훅
 */
export const useLeakDetection = (componentName: string) => {
  const instanceCountRef = useRef(0);
  const mountTimeRef = useRef<number[]>([]);

  useEffect(() => {
    instanceCountRef.current += 1;
    mountTimeRef.current.push(Date.now());
    
    // 최근 10개 인스턴스만 추적
    if (mountTimeRef.current.length > 10) {
      mountTimeRef.current = mountTimeRef.current.slice(-10);
    }

    if (process.env.NODE_ENV === 'development') {
      // 빠른 시간 내에 많은 인스턴스가 생성되면 경고
      const recentMounts = mountTimeRef.current.filter(time => Date.now() - time < 5000);
      if (recentMounts.length > 5) {
        console.warn(`🚨 Potential memory leak: ${componentName} created ${recentMounts.length} instances in 5 seconds`);
      }
    }

    return () => {
      instanceCountRef.current -= 1;
    };
  }, [componentName]);

  return {
    instanceCount: instanceCountRef.current
  };
};