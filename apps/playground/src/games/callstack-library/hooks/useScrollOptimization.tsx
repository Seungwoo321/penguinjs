/**
 * 스크롤 최적화 훅
 * 스크롤 컨테이너 중첩 문제 해결 및 성능 최적화
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface ScrollConfig {
  enableVirtualization?: boolean;
  itemHeight?: number;
  overscan?: number;
  threshold?: number;
  smoothScrolling?: boolean;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  isScrolling: boolean;
  atTop: boolean;
  atBottom: boolean;
  scrollDirection: 'up' | 'down' | null;
}

interface UseScrollOptimizationResult {
  scrollRef: React.RefObject<HTMLElement>;
  scrollState: ScrollState;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToIndex: (index: number) => void;
  visibleRange: { start: number; end: number };
}

/**
 * 스크롤 최적화 훅
 */
export const useScrollOptimization = (
  itemCount: number,
  config: ScrollConfig = {}
): UseScrollOptimizationResult => {
  const {
    enableVirtualization = false,
    itemHeight = 50,
    overscan = 5,
    threshold = 10,
    smoothScrolling = true
  } = config;

  const scrollRef = useRef<HTMLElement>(null);
  const isScrollingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastScrollTopRef = useRef(0);

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    isScrolling: false,
    atTop: true,
    atBottom: false,
    scrollDirection: null
  });

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  // 가상화 범위 계산
  const calculateVisibleRange = useCallback((scrollTop: number, clientHeight: number) => {
    if (!enableVirtualization || itemHeight <= 0) {
      return { start: 0, end: itemCount };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(clientHeight / itemHeight);
    const end = Math.min(itemCount, start + visibleCount + overscan * 2);

    return { start, end };
  }, [enableVirtualization, itemHeight, overscan, itemCount]);

  // 스크롤 상태 업데이트
  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    const direction = scrollTop > lastScrollTopRef.current ? 'down' : 
                     scrollTop < lastScrollTopRef.current ? 'up' : null;

    const newState: ScrollState = {
      scrollTop,
      scrollHeight,
      clientHeight,
      isScrolling: true,
      atTop: scrollTop <= threshold,
      atBottom: scrollTop >= scrollHeight - clientHeight - threshold,
      scrollDirection: direction
    };

    setScrollState(newState);
    setVisibleRange(calculateVisibleRange(scrollTop, clientHeight));
    
    lastScrollTopRef.current = scrollTop;

    // 스크롤 종료 감지
    clearTimeout(isScrollingTimeoutRef.current);
    isScrollingTimeoutRef.current = setTimeout(() => {
      setScrollState(prev => ({ ...prev, isScrolling: false }));
    }, 100);
  }, [threshold, calculateVisibleRange]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // 초기 상태 설정
    updateScrollState();

    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(isScrollingTimeoutRef.current);
    };
  }, [updateScrollState]);

  // 리사이즈 감지
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [updateScrollState]);

  // 스크롤 유틸리티 함수들
  const scrollToTop = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    if (smoothScrolling) {
      element.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      element.scrollTop = 0;
    }
  }, [smoothScrolling]);

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollTop = element.scrollHeight - element.clientHeight;
    
    if (smoothScrolling) {
      element.scrollTo({ top: scrollTop, behavior: 'smooth' });
    } else {
      element.scrollTop = scrollTop;
    }
  }, [smoothScrolling]);

  const scrollToIndex = useCallback((index: number) => {
    const element = scrollRef.current;
    if (!element || !enableVirtualization) return;

    const scrollTop = Math.max(0, index * itemHeight);
    
    if (smoothScrolling) {
      element.scrollTo({ top: scrollTop, behavior: 'smooth' });
    } else {
      element.scrollTop = scrollTop;
    }
  }, [enableVirtualization, itemHeight, smoothScrolling]);

  return {
    scrollRef,
    scrollState,
    scrollToTop,
    scrollToBottom,
    scrollToIndex,
    visibleRange
  };
};

/**
 * 스크롤 인디케이터 컴포넌트
 */
interface ScrollIndicatorProps {
  scrollState: ScrollState;
  className?: string;
}

export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  scrollState, 
  className = '' 
}) => {
  const { scrollTop, scrollHeight, clientHeight } = scrollState;
  const progress = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0;
  
  if (scrollHeight <= clientHeight) return null;

  return (
    <div className={`absolute right-2 top-2 bottom-2 w-1 bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}>
      <div 
        className="w-full bg-blue-500 rounded-full transition-all duration-150"
        style={{ 
          height: `${Math.max(10, (clientHeight / scrollHeight) * 100)}%`,
          transform: `translateY(${progress * (100 - Math.max(10, (clientHeight / scrollHeight) * 100))}%)`
        }}
      />
    </div>
  );
};

/**
 * 가상화된 리스트 컴포넌트
 */
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollState: ScrollState) => void;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedListProps<T>) => {
  const scrollOptimization = useScrollOptimization(items.length, {
    enableVirtualization: true,
    itemHeight,
    overscan,
    smoothScrolling: true
  });

  const { scrollRef, scrollState, visibleRange } = scrollOptimization;

  useEffect(() => {
    onScroll?.(scrollState);
  }, [scrollState, onScroll]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={scrollRef as any}
      className={`relative overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div 
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
      
      <ScrollIndicator scrollState={scrollState} />
    </div>
  );
};

/**
 * 스크롤 동기화 훅 (여러 스크롤 컨테이너 동기화)
 */
export const useScrollSync = (refs: React.RefObject<HTMLElement>[]) => {
  const syncScrolling = useRef(false);

  const handleScroll = useCallback((sourceIndex: number) => {
    return () => {
      if (syncScrolling.current) return;
      
      syncScrolling.current = true;
      const sourceElement = refs[sourceIndex].current;
      
      if (sourceElement) {
        const scrollRatio = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
        
        refs.forEach((ref, index) => {
          if (index !== sourceIndex && ref.current) {
            const targetElement = ref.current;
            const targetScrollTop = scrollRatio * (targetElement.scrollHeight - targetElement.clientHeight);
            targetElement.scrollTop = targetScrollTop;
          }
        });
      }
      
      // 다음 프레임에서 동기화 플래그 해제
      requestAnimationFrame(() => {
        syncScrolling.current = false;
      });
    };
  }, [refs]);

  useEffect(() => {
    const listeners: Array<() => void> = [];
    
    refs.forEach((ref, index) => {
      if (ref.current) {
        const listener = handleScroll(index);
        ref.current.addEventListener('scroll', listener, { passive: true });
        listeners.push(() => ref.current?.removeEventListener('scroll', listener));
      }
    });

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, [refs, handleScroll]);
};