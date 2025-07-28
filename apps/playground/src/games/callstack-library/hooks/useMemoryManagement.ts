/**
 * 메모리 관리 훅
 * 메모리 누수 방지 및 효율적인 리소스 관리
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
  stats: MemoryStats;
  registerCleanup: (cleanup: () => void) => void;
  forceCleanup: () => void;
  isMemoryPressure: boolean;
  optimizeMemory: () => void;
}

/**
 * 메모리 관리 훅
 */
export const useMemoryManagement = (
  options: UseMemoryManagementOptions = {}
): UseMemoryManagementResult => {
  const {
    enableMonitoring = process.env.NODE_ENV === 'development',
    leakThreshold = 100, // 100MB (더 관대하게)
    cleanupInterval = 60000, // 60초 (주기 늘림)
    maxComponentAge = 300000 // 5분
  } = options;

  const [stats, setStats] = useState<MemoryStats>({
    componentCount: 0
  });

  const cleanupFunctionsRef = useRef<Set<() => void>>(new Set());
  const componentTimestampRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observersRef = useRef<{
    mutation?: MutationObserver;
    intersection?: IntersectionObserver;
    resize?: ResizeObserver;
  }>({});

  // 메모리 통계 수집
  const collectMemoryStats = useCallback(() => {
    if (!enableMonitoring) return;

    let memoryInfo: MemoryStats = {
      componentCount: cleanupFunctionsRef.current.size
    };

    // Chrome의 memory API 사용 (사용 가능한 경우)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryInfo = {
        ...memoryInfo,
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };

      // 메모리 누수 감지
      const usedMB = memory.usedJSHeapSize / (1024 * 1024);
      memoryInfo.leakDetected = usedMB > leakThreshold;

      if (memoryInfo.leakDetected) {
        console.warn(`🚨 Memory leak detected: ${usedMB.toFixed(2)}MB used`);
      }
    }

    setStats(memoryInfo);
  }, [enableMonitoring, leakThreshold]);

  // 정리 함수 등록
  const registerCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctionsRef.current.add(cleanup);
    
    return () => {
      cleanupFunctionsRef.current.delete(cleanup);
    };
  }, []);

  // 강제 정리 실행
  const forceCleanup = useCallback(() => {
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
    
    // 가비지 컬렉션 제안 (사용 가능한 경우)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    collectMemoryStats();
  }, [collectMemoryStats]);

  // 메모리 압박 상황 감지
  const isMemoryPressure = stats.usedJSHeapSize 
    ? stats.usedJSHeapSize / (1024 * 1024) > leakThreshold * 0.8
    : false;

  // 메모리 최적화
  const optimizeMemory = useCallback(() => {
    // 오래된 컴포넌트 정리
    const now = Date.now();
    if (now - componentTimestampRef.current > maxComponentAge) {
      forceCleanup();
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

    // 이미지 캐시 정리
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete || img.naturalWidth === 0) {
        img.src = '';
      }
    });

    collectMemoryStats();
  }, [forceCleanup, maxComponentAge, collectMemoryStats]);

  // 주기적인 메모리 모니터링
  useEffect(() => {
    if (!enableMonitoring) return;

    collectMemoryStats();
    
    intervalRef.current = setInterval(() => {
      collectMemoryStats();
      
      // 메모리 압박 시 자동 최적화
      if (isMemoryPressure) {
        console.log('🧹 Auto-optimizing memory due to pressure');
        optimizeMemory();
      }
    }, cleanupInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableMonitoring, cleanupInterval, collectMemoryStats, isMemoryPressure, optimizeMemory]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      forceCleanup();
    };
  }, [forceCleanup]);

  return {
    stats,
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
      console.log(`📈 ${componentName} instance count: ${instanceCountRef.current}`);
      
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