'use client';

/**
 * Advanced Memoization Utilities
 * 
 * Phase 3: 가상화 및 메모이제이션 최적화
 * 고급 메모이제이션 기법과 성능 최적화 도구들
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect,
  useState,
  ReactNode
} from 'react';

// === Deep Memoization Hook ===

/**
 * 깊은 비교를 통한 메모이제이션
 * 객체나 배열의 깊은 변경사항만 감지
 */
export const useDeepMemo = <T,>(factory: () => T, deps: React.DependencyList): T => {
  const depsRef = useRef<React.DependencyList>();
  const valueRef = useRef<T>();

  // 깊은 비교 함수
  const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  };

  const areDepsEqual = (prevDeps: React.DependencyList, currentDeps: React.DependencyList): boolean => {
    if (prevDeps.length !== currentDeps.length) return false;
    return prevDeps.every((dep, index) => deepEqual(dep, currentDeps[index]));
  };

  if (!depsRef.current || !areDepsEqual(depsRef.current, deps)) {
    depsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current!;
};

// === Stable Reference Hook ===

/**
 * 안정적인 참조를 유지하는 Hook
 * 함수나 객체의 참조가 불필요하게 변경되는 것을 방지
 */
export const useStableReference = <T extends (...args: any[]) => any,>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // 의존성이 변경된 경우에만 콜백 업데이트
  useEffect(() => {
    const hasChanged = deps.length !== depsRef.current.length ||
      deps.some((dep, index) => dep !== depsRef.current[index]);
    
    if (hasChanged) {
      callbackRef.current = callback;
      depsRef.current = deps;
    }
  });

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// === Memoized Component with Shallow Compare ===

/**
 * 얕은 비교를 사용하는 메모이제이션 컴포넌트
 */
export const shallowMemo = <P extends Record<string, any>,>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return memo(Component, (prevProps, nextProps) => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prevProps[key] === nextProps[key]);
  });
};

// === Memoized Component with Deep Compare ===

/**
 * 깊은 비교를 사용하는 메모이제이션 컴포넌트
 */
export const deepMemo = <P extends Record<string, any>,>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return memo(Component, (prevProps, nextProps) => {
    const deepEqual = (a: any, b: any): boolean => {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (typeof a !== typeof b) return false;
      
      if (typeof a === 'object') {
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        
        if (keysA.length !== keysB.length) return false;
        
        for (const key of keysA) {
          if (!keysB.includes(key)) return false;
          if (!deepEqual(a[key], b[key])) return false;
        }
        
        return true;
      }
      
      return false;
    };

    return deepEqual(prevProps, nextProps);
  });
};

// === Selective Memoization Hook ===

/**
 * 선택적 메모이제이션 - 특정 키만 비교
 */
export const useSelectiveMemo = <T extends Record<string, any>,>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> => {
  return useMemo(() => {
    const result: Partial<T> = {};
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }, keys.map(key => obj[key]));
};

// === Performance Monitor Component ===

interface PerformanceMonitorProps {
  name: string;
  children: ReactNode;
  threshold?: number; // ms
  onSlowRender?: (name: string, duration: number) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({
  name,
  children,
  threshold = 16, // 1 frame
  onSlowRender
}) => {
  const renderStartRef = useRef<number>();
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const duration = performance.now() - renderStartRef.current;
      if (duration > threshold) {
        console.warn(`Slow render detected in ${name}: ${duration.toFixed(2)}ms`);
        onSlowRender?.(name, duration);
      }
    }
  });

  return <>{children}</>;
});

// === Memoized Event Handler Hook ===

/**
 * 이벤트 핸들러 메모이제이션
 * 자주 변경되는 props로 인한 불필요한 리렌더링 방지
 */
export const useMemoizedHandlers = <T extends Record<string, (...args: any[]) => any>,>(
  handlers: T,
  deps: React.DependencyList
): T => {
  return useMemo(() => {
    const memoizedHandlers = {} as T;
    
    Object.keys(handlers).forEach(key => {
      memoizedHandlers[key as keyof T] = handlers[key];
    });
    
    return memoizedHandlers;
  }, deps);
};

// === Smart Memo Component ===

interface SmartMemoProps<T> {
  data: T;
  render: (data: T) => ReactNode;
  compareKeys?: (keyof T)[];
  compareFunction?: (prev: T, next: T) => boolean;
}

/**
 * 스마트 메모이제이션 컴포넌트
 * 다양한 비교 전략을 지원
 */
export const SmartMemo = <T extends Record<string, any>,>({
  data,
  render,
  compareKeys,
  compareFunction
}: SmartMemoProps<T>) => {
  const MemoizedRenderer = useMemo(() => {
    return memo(({ data }: { data: T }) => {
      return <>{render(data)}</>;
    }, (prevProps, nextProps) => {
      if (compareFunction) {
        return compareFunction(prevProps.data, nextProps.data);
      }
      
      if (compareKeys) {
        return compareKeys.every(key => 
          prevProps.data[key] === nextProps.data[key]
        );
      }
      
      // 기본: 얕은 비교
      return Object.keys(prevProps.data).every(key =>
        prevProps.data[key] === nextProps.data[key]
      );
    });
  }, [render, compareKeys, compareFunction]);

  return <MemoizedRenderer data={data} />;
};

// === Computed Value Hook ===

/**
 * 계산된 값 메모이제이션
 * Vue의 computed와 유사한 기능
 */
export const useComputed = <T,>(
  computeFn: () => T,
  deps: React.DependencyList,
  options?: {
    lazy?: boolean; // 지연 계산
    debounce?: number; // 디바운스 시간 (ms)
  }
): T => {
  const { lazy = false, debounce = 0 } = options || {};
  const [value, setValue] = useState<T>(() => lazy ? null as any : computeFn());
  const timeoutRef = useRef<number>();

  const compute = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounce > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setValue(computeFn());
      }, debounce);
    } else {
      setValue(computeFn());
    }
  }, [computeFn, debounce]);

  useEffect(() => {
    if (!lazy || value === null) {
      compute();
    }
  }, deps);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return value;
};

// === Batch Update Hook ===

/**
 * 배치 업데이트 훅
 * 여러 상태 변경을 하나의 렌더링으로 묶음
 */
export const useBatchUpdate = () => {
  const [, forceUpdate] = useState({});
  const batchRef = useRef<(() => void)[]>([]);
  const timeoutRef = useRef<number>();

  const batchUpdate = useCallback((updateFn: () => void) => {
    batchRef.current.push(updateFn);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const updates = batchRef.current.splice(0);
      updates.forEach(update => update());
      forceUpdate({});
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// === Export Types ===

export interface MemoizationOptions {
  deep?: boolean;
  keys?: string[];
  debounce?: number;
  threshold?: number;
}

// === Utility Functions ===

/**
 * 메모이제이션 통계 수집
 */
export class MemoizationStats {
  private static instance: MemoizationStats;
  private stats = new Map<string, {
    hits: number;
    misses: number;
    lastAccess: number;
  }>();

  static getInstance(): MemoizationStats {
    if (!MemoizationStats.instance) {
      MemoizationStats.instance = new MemoizationStats();
    }
    return MemoizationStats.instance;
  }

  recordHit(key: string): void {
    const stat = this.stats.get(key) || { hits: 0, misses: 0, lastAccess: 0 };
    stat.hits += 1;
    stat.lastAccess = Date.now();
    this.stats.set(key, stat);
  }

  recordMiss(key: string): void {
    const stat = this.stats.get(key) || { hits: 0, misses: 0, lastAccess: 0 };
    stat.misses += 1;
    stat.lastAccess = Date.now();
    this.stats.set(key, stat);
  }

  getStats(): Record<string, { hits: number; misses: number; hitRate: number }> {
    const result: Record<string, { hits: number; misses: number; hitRate: number }> = {};
    
    this.stats.forEach((stat, key) => {
      const total = stat.hits + stat.misses;
      result[key] = {
        hits: stat.hits,
        misses: stat.misses,
        hitRate: total > 0 ? stat.hits / total : 0
      };
    });

    return result;
  }

  clear(): void {
    this.stats.clear();
  }
}