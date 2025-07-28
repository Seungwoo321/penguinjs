'use client';

/**
 * Virtualized List Component
 * 
 * Phase 3: 가상화 및 메모이제이션 최적화
 * 대용량 데이터 렌더링 성능 최적화를 위한 가상화 구현
 */

import React, { 
  memo, 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef, 
  useState,
  ReactNode,
  UIEvent
} from 'react';
import { cn } from '@penguinjs/ui';

// 가상화 아이템 타입
export interface VirtualizedItem {
  id: string | number;
  height: number;
  data: any;
}

// 가상화 리스트 Props
export interface VirtualizedListProps<T = any> {
  items: VirtualizedItem[];
  itemHeight: number | ((item: VirtualizedItem, index: number) => number);
  containerHeight: number;
  overscan?: number; // 보이는 영역 밖에 렌더링할 아이템 수
  className?: string;
  renderItem: (item: VirtualizedItem, index: number, style: React.CSSProperties) => ReactNode;
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void;
  scrollToIndex?: number;
  enableSmoothScrolling?: boolean;
}

// 가상화 계산 결과
interface VirtualizationState {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  visibleItems: VirtualizedItem[];
}

// 높이 캐시
class HeightCache {
  private cache = new Map<string | number, number>();
  private defaultHeight: number;

  constructor(defaultHeight: number) {
    this.defaultHeight = defaultHeight;
  }

  set(id: string | number, height: number): void {
    this.cache.set(id, height);
  }

  get(id: string | number): number {
    return this.cache.get(id) || this.defaultHeight;
  }

  clear(): void {
    this.cache.clear();
  }

  has(id: string | number): boolean {
    return this.cache.has(id);
  }
}

// 스크롤 방향 추적
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollTopRef = useRef(0);

  const updateScrollDirection = useCallback((scrollTop: number) => {
    const direction = scrollTop > lastScrollTopRef.current ? 'down' : 'up';
    if (direction !== scrollDirection) {
      setScrollDirection(direction);
    }
    lastScrollTopRef.current = scrollTop;
  }, [scrollDirection]);

  return { scrollDirection, updateScrollDirection };
};

// 메모이제이션된 가상화 계산
const useVirtualization = (
  items: VirtualizedItem[],
  itemHeight: number | ((item: VirtualizedItem, index: number) => number),
  containerHeight: number,
  scrollTop: number,
  overscan: number
): VirtualizationState => {
  const heightCache = useRef(new HeightCache(
    typeof itemHeight === 'number' ? itemHeight : 50
  ));

  return useMemo(() => {
    if (items.length === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        totalHeight: 0,
        offsetY: 0,
        visibleItems: []
      };
    }

    let totalHeight = 0;
    let startIndex = 0;
    let endIndex = 0;
    let offsetY = 0;
    let accumulatedHeight = 0;

    // 시작 인덱스 찾기
    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function' 
        ? itemHeight(items[i], i)
        : itemHeight;
      
      heightCache.current.set(items[i].id, height);

      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        offsetY = accumulatedHeight - (scrollTop - accumulatedHeight);
        break;
      }

      accumulatedHeight += height;
    }

    // 끝 인덱스 찾기
    let visibleHeight = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height = heightCache.current.get(items[i].id);
      visibleHeight += height;

      if (visibleHeight >= containerHeight + (overscan * 2 * height)) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }

      endIndex = i;
    }

    // 전체 높이 계산
    totalHeight = items.reduce((total, item, index) => {
      const height = typeof itemHeight === 'function' 
        ? itemHeight(item, index)
        : itemHeight;
      return total + height;
    }, 0);

    // 보이는 아이템들
    const visibleItems = items.slice(startIndex, endIndex + 1);

    return {
      startIndex,
      endIndex,
      totalHeight,
      offsetY,
      visibleItems
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
};

// 메인 가상화 리스트 컴포넌트
export const VirtualizedList = memo(<T extends any>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
  renderItem,
  onScroll,
  scrollToIndex,
  enableSmoothScrolling = true
}: VirtualizedListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const { scrollDirection, updateScrollDirection } = useScrollDirection();

  // 가상화 계산
  const virtualizationState = useVirtualization(
    items,
    itemHeight,
    containerHeight,
    scrollTop,
    overscan
  );

  const { startIndex, endIndex, totalHeight, offsetY, visibleItems } = virtualizationState;

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    updateScrollDirection(scrollTop);
    onScroll?.(scrollTop, scrollDirection);
  }, [updateScrollDirection, onScroll, scrollDirection]);

  // 특정 인덱스로 스크롤
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      let targetOffset = 0;
      
      for (let i = 0; i < scrollToIndex && i < items.length; i++) {
        const height = typeof itemHeight === 'function' 
          ? itemHeight(items[i], i)
          : itemHeight;
        targetOffset += height;
      }

      containerRef.current.scrollTo({
        top: targetOffset,
        behavior: enableSmoothScrolling ? 'smooth' : 'auto'
      });
    }
  }, [scrollToIndex, items, itemHeight, enableSmoothScrolling]);

  // 렌더링할 아이템들 메모이제이션
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, virtualIndex) => {
      const actualIndex = startIndex + virtualIndex;
      const height = typeof itemHeight === 'function' 
        ? itemHeight(item, actualIndex)
        : itemHeight;

      const style: React.CSSProperties = {
        position: 'absolute',
        top: offsetY + (virtualIndex * height),
        left: 0,
        right: 0,
        height: height,
        zIndex: 1
      };

      return (
        <VirtualizedItem
          key={item.id}
          item={item}
          index={actualIndex}
          style={style}
          renderItem={renderItem}
        />
      );
    });
  }, [visibleItems, startIndex, offsetY, itemHeight, renderItem]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-auto",
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* 전체 높이를 위한 스페이서 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {renderedItems}
      </div>
      
      {/* 스크롤 인디케이터 */}
      {items.length > 0 && (
        <ScrollIndicator
          totalItems={items.length}
          visibleStart={startIndex}
          visibleEnd={endIndex}
          scrollDirection={scrollDirection}
        />
      )}
    </div>
  );
});

// 개별 가상화 아이템 컴포넌트
const VirtualizedItem = memo<{
  item: VirtualizedItem;
  index: number;
  style: React.CSSProperties;
  renderItem: (item: VirtualizedItem, index: number, style: React.CSSProperties) => ReactNode;
}>(({ item, index, style, renderItem }) => {
  return (
    <div style={style}>
      {renderItem(item, index, style)}
    </div>
  );
});

// 스크롤 인디케이터 컴포넌트
const ScrollIndicator = memo<{
  totalItems: number;
  visibleStart: number;
  visibleEnd: number;
  scrollDirection: 'up' | 'down';
}>(({ totalItems, visibleStart, visibleEnd, scrollDirection }) => {
  const progress = ((visibleEnd + 1) / totalItems) * 100;
  
  return (
    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
      <div className="flex items-center space-x-2">
        <span>{visibleStart + 1}-{visibleEnd + 1} of {totalItems}</span>
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          scrollDirection === 'down' ? "bg-green-400" : "bg-yellow-400"
        )} />
      </div>
      <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
        <div 
          className="bg-white h-1 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
});

// 특화된 가상화 리스트들

// 이벤트 히스토리용 가상화 리스트
export const VirtualizedEventList = memo<{
  events: Array<{ id: string; type: string; timestamp: number; payload: any }>;
  containerHeight: number;
  onEventSelect?: (event: any) => void;
  className?: string;
}>(({ events, containerHeight, onEventSelect, className }) => {
  const virtualizedItems: VirtualizedItem[] = useMemo(
    () => events.map(event => ({
      id: event.id,
      height: 60, // 고정 높이
      data: event
    })),
    [events]
  );

  const renderEvent = useCallback((item: VirtualizedItem, index: number, style: React.CSSProperties) => {
    const event = item.data;
    return (
      <div 
        style={style}
        className="border-b border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => onEventSelect?.(event)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-mono text-sm text-blue-600">{event.type}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-xs text-gray-400">#{index + 1}</div>
        </div>
      </div>
    );
  }, [onEventSelect]);

  return (
    <VirtualizedList
      items={virtualizedItems}
      itemHeight={60}
      containerHeight={containerHeight}
      renderItem={renderEvent}
      className={className}
      overscan={10}
    />
  );
});

// 콜스택용 가상화 리스트
export const VirtualizedCallStack = memo<{
  callStack: Array<{ id: string; name: string; status: string; createdAt: number }>;
  containerHeight: number;
  onFrameSelect?: (frame: any) => void;
  className?: string;
}>(({ callStack, containerHeight, onFrameSelect, className }) => {
  const virtualizedItems: VirtualizedItem[] = useMemo(
    () => callStack.map((frame, index) => ({
      id: frame.id,
      height: 80,
      data: { ...frame, stackIndex: callStack.length - 1 - index }
    })),
    [callStack]
  );

  const renderFrame = useCallback((item: VirtualizedItem, index: number, style: React.CSSProperties) => {
    const frame = item.data;
    const isTop = frame.stackIndex === callStack.length - 1;
    
    return (
      <div 
        style={style}
        className={cn(
          "border border-gray-200 p-3 m-1 rounded cursor-pointer transition-colors",
          isTop ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
        )}
        onClick={() => onFrameSelect?.(frame)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-mono font-semibold">{frame.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              Status: {frame.status} | Stack Index: {frame.stackIndex}
            </div>
          </div>
          {isTop && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              TOP
            </div>
          )}
        </div>
      </div>
    );
  }, [callStack.length, onFrameSelect]);

  return (
    <VirtualizedList
      items={virtualizedItems}
      itemHeight={80}
      containerHeight={containerHeight}
      renderItem={renderFrame}
      className={className}
      overscan={3}
    />
  );
});

VirtualizedList.displayName = 'VirtualizedList';
VirtualizedItem.displayName = 'VirtualizedItem';
VirtualizedEventList.displayName = 'VirtualizedEventList';
VirtualizedCallStack.displayName = 'VirtualizedCallStack';