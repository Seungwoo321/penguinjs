/**
 * 성능 최적화 훅
 * 리렌더링 최적화, 메모리 누수 방지, 번들 크기 최적화
 */

import { 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect, 
  useState,
  DependencyList,
  EffectCallback
} from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  componentMountTime: number;
}

interface UsePerformanceOptimizationOptions {
  enableMetrics?: boolean;
  maxRenderCount?: number;
  debounceMs?: number;
  throttleMs?: number;
}

interface UsePerformanceOptimizationResult {
  metrics: PerformanceMetrics;
  isOptimized: boolean;
  optimizedCallback: <T extends (...args: any[]) => any>(fn: T, deps: DependencyList) => T;
  optimizedMemo: <T>(factory: () => T, deps: DependencyList) => T;
  debouncedEffect: (effect: EffectCallback, deps: DependencyList, delay: number) => void;
  throttledEffect: (effect: EffectCallback, deps: DependencyList, delay: number) => void;
  cleanup: () => void;
}

/**
 * 성능 최적화 메인 훅
 */
export const usePerformanceOptimization = (
  options: UsePerformanceOptimizationOptions = {}
): UsePerformanceOptimizationResult => {
  const {
    enableMetrics = false, // 임시로 비활성화하여 무한 루프 방지
    maxRenderCount = 100,
    debounceMs = 100,
    throttleMs = 16
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    componentMountTime: Date.now()
  });

  const renderTimesRef = useRef<number[]>([]);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const mountTimeRef = useRef(Date.now());

  // 메트릭스 기능 비활성화 (안정성을 위해)
  // 추후 안정화 후 다시 활성화 예정
  useEffect(() => {
    // 빈 useEffect로 경고 제거
  }, []);

  // 과도한 리렌더링 경고
  useEffect(() => {
    if (enableMetrics && metrics.renderCount > maxRenderCount) {
      console.warn(`🚨 Performance Warning: Component rendered ${metrics.renderCount} times. Consider optimization.`);
    }
  }, [metrics.renderCount, maxRenderCount, enableMetrics]);

  // Hook 규칙 준수: Hook을 직접 반환하는 대신 팩토리 함수 제공
  const optimizedCallback = useCallback(<T extends (...args: any[]) => any>(
    fn: T, 
    deps: DependencyList
  ): T => {
    // Hook 규칙 위반을 피하기 위해 단순히 함수를 반환
    // 실제 메모이제이션은 호출하는 컴포넌트에서 직접 useCallback 사용
    console.warn('optimizedCallback is deprecated. Use useCallback directly in components.');
    return fn;
  }, []);

  // Hook 규칙 준수: Hook을 직접 반환하는 대신 팩토리 함수 제공
  const optimizedMemo = useCallback(<T>(
    factory: () => T, 
    deps: DependencyList
  ): T => {
    // Hook 규칙 위반을 피하기 위해 단순히 팩토리 실행 결과 반환
    // 실제 메모이제이션은 호출하는 컴포넌트에서 직접 useMemo 사용
    console.warn('optimizedMemo is deprecated. Use useMemo directly in components.');
    return factory();
  }, []);

  // Hook 규칙 준수: 이펙트 함수를 저장하고 관리만 수행
  const debouncedEffectRef = useRef<{
    effect: EffectCallback;
    deps: DependencyList;
    delay: number;
  } | null>(null);

  const debouncedEffect = useCallback((
    effect: EffectCallback,
    deps: DependencyList,
    delay: number = debounceMs
  ) => {
    // Hook 규칙 위반을 피하기 위해 단순히 설정만 저장
    // 실제 이펙트는 호출하는 컴포넌트에서 직접 useEffect 사용
    debouncedEffectRef.current = { effect, deps, delay };
    console.warn('debouncedEffect is deprecated. Use useEffect with setTimeout directly in components.');
  }, [debounceMs]);

  // Hook 규칙 준수: 이펙트 함수를 저장하고 관리만 수행
  const throttledEffectRef = useRef<{
    effect: EffectCallback;
    deps: DependencyList;
    delay: number;
  } | null>(null);

  const throttledEffect = useCallback((
    effect: EffectCallback,
    deps: DependencyList,
    delay: number = throttleMs
  ) => {
    // Hook 규칙 위반을 피하기 위해 단순히 설정만 저장
    // 실제 이펙트는 호출하는 컴포넌트에서 직접 useEffect 사용
    throttledEffectRef.current = { effect, deps, delay };
    console.warn('throttledEffect is deprecated. Use useEffect with throttling directly in components.');
  }, [throttleMs]);

  // 메트릭스 업데이트 기능 비활성화

  // 정리 함수
  const cleanup = useCallback(() => {
    cleanupFunctionsRef.current.forEach(fn => fn());
    cleanupFunctionsRef.current = [];
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const isOptimized = metrics.renderCount <= maxRenderCount && metrics.averageRenderTime < 16;

  return {
    metrics,
    isOptimized,
    optimizedCallback,
    optimizedMemo,
    debouncedEffect,
    throttledEffect,
    cleanup
  };
};

/**
 * 메모이제이션 최적화 훅
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: DependencyList,
  isEqual?: (a: T, b: T) => boolean
): T => {
  const previousValueRef = useRef<T | undefined>(undefined);
  const previousDepsRef = useRef<DependencyList | undefined>(undefined);

  return useMemo(() => {
    // 의존성 배열이 변경되었는지 확인
    const depsChanged = !previousDepsRef.current || 
      deps.length !== previousDepsRef.current.length ||
      deps.some((dep, index) => dep !== previousDepsRef.current![index]);

    if (!depsChanged && previousValueRef.current !== undefined) {
      return previousValueRef.current;
    }

    const newValue = factory();
    
    // 커스텀 비교 함수가 있으면 사용
    if (isEqual && previousValueRef.current !== undefined) {
      if (isEqual(newValue, previousValueRef.current)) {
        return previousValueRef.current;
      }
    }

    previousValueRef.current = newValue;
    previousDepsRef.current = deps;
    
    return newValue;
  }, deps);
};

/**
 * 리스트 가상화 최적화 훅
 */
export const useListVirtualization = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      offset: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  };
};

/**
 * 이미지 지연 로딩 훅
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            observer.disconnect();
          };
          img.onerror = () => {
            setIsError(true);
            observer.disconnect();
          };
          img.src = src;
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return {
    ref: imgRef,
    src: imageSrc,
    isLoaded,
    isError
  };
};

/**
 * AbortController를 사용한 안전한 비동기 작업 훅
 */
export const useSafeAsync = () => {
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const execute = useCallback(async <T>(
    asyncFunction: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    try {
      const result = await asyncFunction(abortControllerRef.current.signal);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted
        return null;
      }
      throw error;
    }
  }, []);

  // 컴포넌트 언마운트 시 모든 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { execute };
};

/**
 * 성능 모니터링 훅
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} rendered ${renderCountRef.current} times`);
      
      if (renderCountRef.current > 10) {
        console.warn(`⚠️ ${componentName} has rendered ${renderCountRef.current} times. Consider optimization.`);
      }
    }
  });

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${componentName} mounted in ${mountTime}ms`);
    }
  }, [componentName]);

  return {
    renderCount: renderCountRef.current
  };
};