/**
 * 접근성이 강화된 큐 시각화 컴포넌트
 * WCAG 2.1 AA 준수, 키보드 네비게이션 및 스크린 리더 최적화
 */

import React, { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Zap, Calendar, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useCallStackLibraryTheme } from '../../hooks/useCallStackLibraryTheme';
import { useKeyboardNavigation, useLiveRegion } from '../../hooks/useKeyboardNavigation';
import { 
  CALLSTACK_LIBRARY_ARIA_LABELS,
  createListAttributes,
  createListItemAttributes,
  createProgressAttributes,
  srOnlyStyles
} from '../../utils/ariaUtils';
import { AccessibleButton } from './AccessibleButton';
import type { CallStackQueueType } from '../../theme/callstackLibraryTheme';

interface QueueItem {
  id: string;
  functionName: string;
  color?: string;
  delay?: number;
  metadata?: any;
}

interface AccessibleQueueVisualizationProps {
  queueType: 'callstack' | 'microtask' | 'macrotask';
  items: QueueItem[];
  maxSize: number;
  isExecuting?: boolean;
  isHighlighted?: boolean;
  onItemClick?: (item: QueueItem, index: number) => void;
  onItemRemove?: (item: QueueItem, index: number) => void;
  className?: string;
}

/**
 * 접근성 큐 시각화 컴포넌트
 */
export const AccessibleQueueVisualization: React.FC<AccessibleQueueVisualizationProps> = memo(({
  queueType,
  items,
  maxSize,
  isExecuting = false,
  isHighlighted = false,
  onItemClick,
  onItemRemove,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const libraryTheme = useCallStackLibraryTheme();
  const announce = useLiveRegion('polite');
  
  // 키보드 네비게이션
  const {
    currentFocusIndex,
    focusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  } = useKeyboardNavigation({
    containerRef,
    focusableSelector: '[role="listitem"] button',
    orientation: 'vertical',
    wrapAround: true,
    onActivate: (index) => {
      const item = items[index];
      if (item && onItemClick) {
        onItemClick(item, index);
      }
    },
    onEscape: () => {
      // ESC 키로 포커스 해제
      containerRef.current?.blur();
    }
  });

  // 가상 스크롤링 상태
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const itemHeight = 60; // 각 아이템의 높이
  const containerHeight = 400; // 컨테이너 최대 높이

  // 큐별 정보
  const queueInfo = {
    callstack: {
      icon: Book,
      ariaLabels: CALLSTACK_LIBRARY_ARIA_LABELS.callstack,
      emptyMessage: '메인 서가가 비어있습니다',
      title: '📚 메인 서가',
      subtitle: '현재 처리 중인 도서들 (LIFO)'
    },
    microtask: {
      icon: Zap,
      ariaLabels: CALLSTACK_LIBRARY_ARIA_LABELS.microtask,
      emptyMessage: '긴급 처리 대기 도서가 없습니다',
      title: '⚡ 긴급 처리대',
      subtitle: 'Promise 반납, 즉시 처리 요청'
    },
    macrotask: {
      icon: Calendar,
      ariaLabels: CALLSTACK_LIBRARY_ARIA_LABELS.macrotask,
      emptyMessage: '예약된 도서가 없습니다',
      title: '📅 예약 처리대',
      subtitle: '시간 예약, 정기 대출 도서'
    }
  };

  const currentQueueInfo = queueInfo[queueType];
  const Icon = currentQueueInfo.icon;

  // 아이템 추가/제거 시 알림
  useEffect(() => {
    const lastItem = items[items.length - 1];
    if (lastItem) {
      if (queueType === 'callstack') {
        announce(currentQueueInfo.ariaLabels.push(lastItem.functionName));
      } else {
        announce(currentQueueInfo.ariaLabels.add(lastItem.functionName, lastItem.delay));
      }
    }
  }, [items.length]);

  // 스크롤 핸들러
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    setVisibleRange({
      start: Math.max(0, start - 2), // 버퍼
      end: Math.min(items.length, start + visibleCount + 2)
    });
  };

  // 키보드 단축키 안내
  const keyboardShortcuts = [
    { key: '↑/↓', action: '항목 탐색' },
    { key: 'Home/End', action: '처음/끝으로' },
    { key: 'Enter', action: '항목 선택' },
    { key: 'Delete', action: '항목 제거' },
    { key: 'Escape', action: '포커스 해제' }
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-xl overflow-hidden',
        isHighlighted && 'ring-2 ring-amber-400',
        className
      )}
      style={{
        backgroundColor: libraryTheme.getQueueColor(queueType as CallStackQueueType, 'light'),
        border: `2px solid ${libraryTheme.getQueueBorder(queueType as CallStackQueueType)}`
      }}
    >
      {/* 헤더 */}
      <div 
        className="p-4 border-b"
        style={{
          backgroundColor: libraryTheme.getQueueColor(queueType as CallStackQueueType, 'main'),
          borderColor: libraryTheme.getQueueBorder(queueType as CallStackQueueType)
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon 
              className="w-5 h-5"
              aria-hidden="true"
            />
            <h3 
              className="font-bold text-lg"
              style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'primary') }}
            >
              {currentQueueInfo.title}
            </h3>
          </div>
          
          {/* 진행률 표시 */}
          <div 
            {...createProgressAttributes(
              items.length,
              maxSize,
              `${items.length}/${maxSize} 아이템`
            )}
            className="flex items-center gap-2"
          >
            <span 
              className="text-sm font-medium"
              style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'secondary') }}
            >
              {items.length} / {maxSize}
            </span>
            {items.length >= maxSize * 0.8 && (
              <span className="text-xs text-red-600" role="alert">
                거의 가득 참
              </span>
            )}
          </div>
        </div>
        
        <p 
          className="text-sm mt-1"
          style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'secondary') }}
        >
          {currentQueueInfo.subtitle}
        </p>
      </div>

      {/* 실행 상태 표시 */}
      {isExecuting && (
        <div 
          className="px-4 py-2 flex items-center gap-2"
          style={{
            backgroundColor: libraryTheme.getQueueColor(queueType as CallStackQueueType, 'hover'),
            color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'primary')
          }}
          role="status"
          aria-live="polite"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">처리 중...</span>
        </div>
      )}

      {/* 큐 아이템 목록 */}
      <div 
        className="relative"
        style={{ 
          minHeight: '200px',
          maxHeight: `${containerHeight}px`
        }}
      >
        {items.length === 0 ? (
          // 빈 상태
          <div 
            className="flex flex-col items-center justify-center h-full p-8"
            role="status"
          >
            <Icon className="w-12 h-12 mb-3 opacity-30" aria-hidden="true" />
            <p 
              className="text-center"
              style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'secondary') }}
            >
              {currentQueueInfo.emptyMessage}
            </p>
          </div>
        ) : (
          // 아이템 목록
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${containerHeight}px` }}
            onScroll={handleScroll}
            {...createListAttributes(currentQueueInfo.ariaLabels.main, items.length)}
          >
            <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
              <AnimatePresence>
                {items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
                  const actualIndex = visibleRange.start + index;
                  const isFocused = currentFocusIndex === actualIndex;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{
                        position: 'absolute',
                        top: `${actualIndex * itemHeight}px`,
                        left: 0,
                        right: 0,
                        height: `${itemHeight}px`,
                        padding: '8px'
                      }}
                      {...createListItemAttributes(
                        actualIndex + 1,
                        items.length,
                        currentQueueInfo.ariaLabels.item(item.functionName, actualIndex)
                      )}
                    >
                      <QueueItemCard
                        item={item}
                        index={actualIndex}
                        queueType={queueType}
                        isFocused={isFocused}
                        onSelect={() => onItemClick?.(item, actualIndex)}
                        onRemove={() => onItemRemove?.(item, actualIndex)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* 스크롤 인디케이터 */}
      {items.length > Math.floor(containerHeight / itemHeight) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <AccessibleButton
            size="sm"
            variant="ghost"
            label="위로 스크롤"
            onClick={() => focusPrevious()}
            disabled={visibleRange.start === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </AccessibleButton>
          
          <div 
            className="text-xs text-center py-1"
            style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'secondary') }}
          >
            {visibleRange.start + 1}-{Math.min(visibleRange.end, items.length)}
          </div>
          
          <AccessibleButton
            size="sm"
            variant="ghost"
            label="아래로 스크롤"
            onClick={() => focusNext()}
            disabled={visibleRange.end >= items.length}
          >
            <ChevronDown className="w-4 h-4" />
          </AccessibleButton>
        </div>
      )}

      {/* 키보드 단축키 도움말 (스크린 리더 전용) */}
      <div style={srOnlyStyles} role="region" aria-label="키보드 단축키">
        <h4>키보드 단축키:</h4>
        <ul>
          {keyboardShortcuts.map(({ key, action }) => (
            <li key={key}>{key}: {action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

AccessibleQueueVisualization.displayName = 'AccessibleQueueVisualization';

/**
 * 큐 아이템 카드 컴포넌트
 */
interface QueueItemCardProps {
  item: QueueItem;
  index: number;
  queueType: string;
  isFocused: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

const QueueItemCard: React.FC<QueueItemCardProps> = memo(({
  item,
  index,
  queueType,
  isFocused,
  onSelect,
  onRemove
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  
  return (
    <button
      className={cn(
        'w-full p-3 rounded-lg transition-all',
        'hover:shadow-md focus:outline-none',
        isFocused && 'ring-2 ring-offset-2'
      )}
      style={{
        backgroundColor: item.color || libraryTheme.getQueueColor(queueType as CallStackQueueType, 'secondary'),
        borderColor: libraryTheme.getQueueBorder(queueType as CallStackQueueType),
        ringColor: isFocused ? libraryTheme.getQueueColor(queueType as CallStackQueueType, 'button') : undefined
      }}
      onClick={onSelect}
      tabIndex={isFocused ? 0 : -1}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4" aria-hidden="true" />
          <span className="font-mono font-medium">{item.functionName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {item.delay && (
            <span className="text-xs opacity-75">
              {item.delay}ms
            </span>
          )}
          
          <span className="text-xs bg-black/10 px-2 py-1 rounded">
            #{index + 1}
          </span>
        </div>
      </div>
    </button>
  );
});

QueueItemCard.displayName = 'QueueItemCard';