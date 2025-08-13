/**
 * 큐 아이템 공통 컴포넌트
 * 모든 큐 타입에서 재사용 가능한 아이템 표시 컴포넌트
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Zap, Calendar, X, Info, Clock } from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { AccessibleButton } from '@/games/callstack-library/components/ui/AccessibleButton';
import { FunctionNameTooltip } from '@/games/callstack-library/components/ui/AdaptiveTooltip';
import { createListItemAttributes } from '@/games/callstack-library/utils/ariaUtils';
import type { QueueItem, QueueType } from '@/games/callstack-library/types';
import type { CallStackQueueType } from '@/games/callstack-library/theme/callstackLibraryTheme';

interface QueueItemComponentProps {
  item: QueueItem;
  index: number;
  queueType: QueueType;
  isActive?: boolean;
  isHighlighted?: boolean;
  isInteractive?: boolean;
  showRemoveButton?: boolean;
  showDetails?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onSelect?: (item: QueueItem) => void;
  onRemove?: (item: QueueItem) => void;
  onHover?: (item: QueueItem | null) => void;
  className?: string;
}

/**
 * 큐 아이템 컴포넌트
 */
export const QueueItemComponent = memo<QueueItemComponentProps>(({
  item,
  index,
  queueType,
  isActive = false,
  isHighlighted = false,
  isInteractive = true,
  showRemoveButton = false,
  showDetails = false,
  variant = 'default',
  onSelect,
  onRemove,
  onHover,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 큐별 아이콘 및 색상 (CSS 변수 사용)
  const queueConfig = {
    callstack: {
      icon: Book,
      label: '메인 서가',
      color: 'rgb(var(--game-callstack-queue-callstack))'
    },
    microtask: {
      icon: Zap,
      label: '긴급 처리',
      color: 'rgb(var(--game-callstack-queue-microtask))'
    },
    macrotask: {
      icon: Calendar,
      label: '예약 처리',
      color: 'rgb(var(--game-callstack-queue-macrotask))'
    }
  };

  const config = queueConfig[queueType];
  const Icon = config.icon;
  
  // 다크모드 감지 (CSS 클래스 기반)
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;

  // 스타일 계산
  const itemStyles = {
    default: {
      padding: '12px 16px',
      minHeight: '56px'
    },
    compact: {
      padding: '8px 12px',
      minHeight: '40px'
    },
    detailed: {
      padding: '16px',
      minHeight: '80px'
    }
  };

  const currentStyle = itemStyles[variant];

  // 배경색 계산 (CSS 변수 사용)
  const getQueueBgColor = (type: QueueType, variant: 'active' | 'hover' | 'default') => {
    const queuePrefix = `--game-callstack-queue-${type}`;
    switch (variant) {
      case 'active':
        return `rgb(var(${queuePrefix}))`; // 버튼 색상
      case 'hover':
        return `rgba(var(${queuePrefix}), 0.8)`; // 호버 색상
      default:
        return `rgb(var(${queuePrefix}-light))`; // 기본 밝은 색상
    }
  };
  
  const backgroundColor = isActive
    ? getQueueBgColor(queueType, 'active')
    : isHighlighted
    ? getQueueBgColor(queueType, 'hover')
    : item.color || getQueueBgColor(queueType, 'default');

  // 텍스트 색상 계산 (CSS 변수 사용)
  const textColor = isActive
    ? 'rgb(var(--primary-foreground))' // 대비 색상 (흰색)
    : 'rgb(var(--text-primary))'; // 기본 텍스트 색상

  // 핸들러
  const handleClick = () => {
    if (isInteractive && onSelect) {
      onSelect(item);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(item);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(item);
  };

  // ARIA 속성
  const ariaProps = createListItemAttributes(
    index + 1,
    0, // setSize는 부모에서 관리
    `${item.functionName} - ${config.label}`
  );

  return (
    <motion.div
      className={cn(
        'relative rounded-lg transition-all',
        isInteractive && 'cursor-pointer hover:shadow-md',
        isActive && 'ring-2 ring-offset-2',
        className
      )}
      style={{
        ...currentStyle,
        backgroundColor,
        color: textColor,
        borderColor: `rgb(var(--game-callstack-queue-${queueType}))`,
        borderWidth: '1px',
        borderStyle: 'solid',
        ['--tw-ring-color' as any]: isActive ? config.color : undefined
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      {...ariaProps}
    >
      <div className="flex items-center justify-between gap-3">
        {/* 왼쪽: 아이콘과 함수명 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Icon 
            className={cn(
              'flex-shrink-0',
              variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
            )}
            aria-hidden="true"
          />
          
          <div className="min-w-0 flex-1">
            <FunctionNameTooltip text={item.functionName} isOverflowing={true}>
              <span 
                className={cn(
                  'font-mono block truncate',
                  variant === 'compact' ? 'text-sm' : 'text-base',
                  variant === 'detailed' && 'font-bold'
                )}
              >
                {item.functionName}
              </span>
            </FunctionNameTooltip>
            
            {/* 상세 정보 */}
            {showDetails && variant === 'detailed' && (
              <div className="mt-1 space-y-1">
                {(item as any).delay && (
                  <div className="flex items-center gap-1 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>지연 시간: {(item as any).delay}ms</span>
                  </div>
                )}
                {(item as any).metadata?.description && (
                  <p className="text-xs opacity-75">
                    {(item as any).metadata.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 인덱스와 액션 버튼 */}
        <div className="flex items-center gap-2">
          {/* 지연 시간 표시 (compact) */}
          {(item as any).delay && variant !== 'detailed' && (
            <span className="text-xs opacity-75">
              {(item as any).delay}ms
            </span>
          )}
          
          {/* 인덱스 표시 */}
          <span 
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              ...(isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.1)' })
            }}
          >
            #{index + 1}
          </span>
          
          {/* 제거 버튼 */}
          {showRemoveButton && isInteractive && (
            <AccessibleButton
              size="sm"
              variant="ghost"
              label={`${item.functionName} 제거`}
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </AccessibleButton>
          )}
        </div>
      </div>

      {/* 호버 효과 */}
      <AnimatePresence>
        {isHovered && isInteractive && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundColor: 'currentColor',
              borderRadius: 'inherit'
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

QueueItemComponent.displayName = 'QueueItemComponent';

/**
 * 큐 아이템 그룹 컴포넌트
 */
interface QueueItemGroupProps {
  items: QueueItem[];
  queueType: QueueType;
  activeIndex?: number;
  highlightedIndex?: number;
  variant?: 'default' | 'compact' | 'detailed';
  showRemoveButtons?: boolean;
  onItemSelect?: (item: QueueItem, index: number) => void;
  onItemRemove?: (item: QueueItem, index: number) => void;
  className?: string;
}

export const QueueItemGroup: React.FC<QueueItemGroupProps> = ({
  items,
  queueType,
  activeIndex,
  highlightedIndex,
  variant = 'default',
  showRemoveButtons = false,
  onItemSelect,
  onItemRemove,
  className
}) => {
  return (
    <div 
      className={cn('space-y-2', className)}
      role="list"
      aria-label={`${queueType} 큐 아이템 목록`}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <QueueItemComponent
            key={item.id}
            item={item}
            index={index}
            queueType={queueType}
            isActive={activeIndex === index}
            isHighlighted={highlightedIndex === index}
            variant={variant}
            showRemoveButton={showRemoveButtons}
            onSelect={() => onItemSelect?.(item, index)}
            onRemove={() => onItemRemove?.(item, index)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * 빈 큐 상태 컴포넌트
 */
interface EmptyQueueStateProps {
  queueType: QueueType;
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export const EmptyQueueState: React.FC<EmptyQueueStateProps> = ({
  queueType,
  message,
  showIcon = true,
  className
}) => {
  
  const queueConfig = {
    callstack: {
      icon: Book,
      defaultMessage: '메인 서가가 비어있습니다'
    },
    microtask: {
      icon: Zap,
      defaultMessage: '긴급 처리 대기 도서가 없습니다'
    },
    macrotask: {
      icon: Calendar,
      defaultMessage: '예약된 도서가 없습니다'
    }
  };

  const config = queueConfig[queueType];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-8 text-center',
        className
      )}
      role="status"
    >
      {showIcon && (
        <Icon 
          className="w-12 h-12 mb-3 opacity-30"
          style={{ color: 'rgb(var(--text-secondary))' }}
          aria-hidden="true"
        />
      )}
      <p 
        className="text-sm"
        style={{ color: 'rgb(var(--text-secondary))' }}
      >
        {displayMessage}
      </p>
    </div>
  );
};