// 향상된 다중 큐 시각화 패널 (Layout C, D용)
// 5-6개의 큐를 아름답게 표시하며 Layout B의 스타일을 계승

import React, { useRef, useMemo, useCallback, memo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Zap, BookOpen, Book, ArrowRight, Calendar, Users,
  Film, RefreshCw, HardDrive, Cpu
} from 'lucide-react'
import { useContainerResponsive } from '../../../hooks/useResponsiveLayout'
import { useOptimizedAnimations } from '../../../hooks/useOptimizedAnimations'
import { typography, createTextOverflowStyles } from '../../../utils/textUtils'
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization'
import { useMemoryManagement, useLeakDetection } from '../../../hooks/useMemoryManagement'
import { useCallStackLibraryContext } from '../../../contexts/CallStackLibraryContext'
import { gameEvents } from '../../../utils/eventSystem'

interface EnhancedMultiQueueVisualizationPanelProps {
  queueTypes: ReadonlyArray<string>;
  queueStates: any;
  isExecuting?: boolean;
  highlightedQueue?: string | null;
  onQueueItemClick?: (queueType: string, item: any) => void;
  maxSize?: number;
  className?: string;
}

// 큐 타입별 스타일 정의
const queueStyles = {
  callstack: {
    background: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    highlight: 'bg-gray-100 dark:bg-gray-700',
    icon: BookOpen,
    iconColor: 'text-gray-600 dark:text-gray-400',
    title: '콜스택',
    emptyMessage: '콜스택이 비어있습니다'
  },
  microtask: {
    background: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    highlight: 'bg-blue-100 dark:bg-blue-800/40',
    icon: Zap,
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: '마이크로태스크',
    emptyMessage: '마이크로태스크가 없습니다'
  },
  macrotask: {
    background: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    highlight: 'bg-orange-100 dark:bg-orange-800/40',
    icon: Calendar,
    iconColor: 'text-orange-600 dark:text-orange-400',
    title: '매크로태스크',
    emptyMessage: '매크로태스크가 없습니다'
  },
  animation: {
    background: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    highlight: 'bg-purple-100 dark:bg-purple-800/40',
    icon: Film,
    iconColor: 'text-purple-600 dark:text-purple-400',
    title: '애니메이션',
    emptyMessage: '애니메이션 프레임이 없습니다'
  },
  generator: {
    background: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    highlight: 'bg-teal-100 dark:bg-teal-800/40',
    icon: RefreshCw,
    iconColor: 'text-teal-600 dark:text-teal-400',
    title: '제너레이터',
    emptyMessage: '제너레이터가 없습니다'
  },
  io: {
    background: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    highlight: 'bg-indigo-100 dark:bg-indigo-800/40',
    icon: HardDrive,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    title: 'I/O 작업',
    emptyMessage: 'I/O 작업이 없습니다'
  },
  worker: {
    background: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    highlight: 'bg-amber-100 dark:bg-amber-800/40',
    icon: Cpu,
    iconColor: 'text-amber-600 dark:text-amber-400',
    title: '웹 워커',
    emptyMessage: '워커 작업이 없습니다'
  }
};

/**
 * 향상된 다중 큐 시각화 패널
 * Layout C, D에서 5-6개의 큐를 아름답게 표시
 */
export const EnhancedMultiQueueVisualizationPanel: React.FC<EnhancedMultiQueueVisualizationPanelProps> = memo(({
  queueTypes,
  queueStates,
  isExecuting,
  highlightedQueue,
  onQueueItemClick,
  maxSize = 8,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 경량화된 메모리 관리 (개발 환경에서만)
  const { registerCleanup, isMemoryPressure } = useMemoryManagement({
    enableMonitoring: process.env.NODE_ENV === 'development',
    leakThreshold: 150,
    cleanupInterval: 120000
  })
  
  // 개발 환경에서만 메모리 누수 감지
  if (process.env.NODE_ENV === 'development') {
    useLeakDetection('EnhancedMultiQueueVisualizationPanel')
  }
  
  // 반응형 레이아웃
  const responsiveLayout = useContainerResponsive(containerRef)
  const optimizedAnimations = useOptimizedAnimations()
  
  // Context API 사용
  const { state, dispatch } = useCallStackLibraryContext();
  
  // 최적화된 이벤트 핸들러
  const handleQueueItemClick = useCallback(
    (queueType: string, item: any) => {
      gameEvents.queueItemAdded(queueType as any, item, 0);
      onQueueItemClick?.(queueType, item);
    },
    [onQueueItemClick]
  );
  
  // 큐 아이템 렌더링
  const renderQueueItem = useCallback(
    (queueType: string, item: any, index: number, style: typeof queueStyles[keyof typeof queueStyles]) => (
      <motion.div
        key={item.id || index}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={cn(
          "px-3 py-2 rounded-md border transition-all cursor-pointer",
          "hover:shadow-md hover:scale-[1.02]",
          style.background,
          style.border,
          queueType === 'callstack' && "text-gray-900 dark:text-gray-100",
          queueType === 'microtask' && "text-blue-900 dark:text-blue-100",
          queueType === 'macrotask' && "text-orange-900 dark:text-orange-100",
          queueType === 'animation' && "text-purple-900 dark:text-purple-100",
          queueType === 'generator' && "text-teal-900 dark:text-teal-100",
          queueType === 'io' && "text-indigo-900 dark:text-indigo-100",
          queueType === 'worker' && "text-amber-900 dark:text-amber-100",
          highlightedQueue === queueType && "ring-2 ring-offset-1 ring-blue-400"
        )}
        onClick={() => handleQueueItemClick(queueType, item)}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm">{item.functionName || item.name}</span>
          <span className="text-xs opacity-70">#{index + 1}</span>
        </div>
      </motion.div>
    ),
    [highlightedQueue, handleQueueItemClick]
  );
  
  // 큐 렌더링
  const renderQueue = useCallback(
    (queueType: string, items: any[], style: typeof queueStyles[keyof typeof queueStyles]) => {
      if (!items || items.length === 0) {
        return (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <p className="text-sm">{style.emptyMessage}</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-2 p-4 overflow-y-auto" style={{ maxHeight: responsiveLayout.isDesktop ? '200px' : '160px' }}>
          <AnimatePresence mode="popLayout">
            {items.slice(0, maxSize).map((item, index) => 
              renderQueueItem(queueType, item, index, style)
            )}
          </AnimatePresence>
          {items.length > maxSize && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
              +{items.length - maxSize} more items...
            </div>
          )}
        </div>
      );
    },
    [renderQueueItem, maxSize]
  );
  
  // 그리드 레이아웃 계산 - 세로 공간 활용을 위한 개선
  const gridLayout = useMemo(() => {
    const count = queueTypes.length;
    
    // 모바일: 세로 1열
    if (responsiveLayout.isMobile) {
      return {
        cols: 'grid-cols-1',
        rows: '',
        itemHeight: 'h-auto'
      };
    }
    
    // 태블릿/데스크톱: 큐 개수에 따른 최적 배치
    if (count === 5) {
      // Layout C: 2-2-1 구조 (상단 2개, 중단 2개, 하단 1개)
      return {
        cols: 'grid-cols-2',
        rows: 'grid-rows-3',
        itemHeight: 'h-full',
        specialLayout: 'layout-c'
      };
    } else if (count === 6) {
      // Layout D: 2-2-2 구조 또는 3-3 구조
      return {
        cols: responsiveLayout.isDesktop ? 'grid-cols-3' : 'grid-cols-2',
        rows: responsiveLayout.isDesktop ? 'grid-rows-2' : 'grid-rows-3',
        itemHeight: 'h-full',
        specialLayout: 'layout-d'
      };
    }
    
    // 기본값
    return {
      cols: 'grid-cols-2',
      rows: '',
      itemHeight: 'h-auto'
    };
  }, [queueTypes.length, responsiveLayout]);

  // 총 아이템 수 계산
  const totalItems = useMemo(
    () => queueTypes.reduce((sum, type) => sum + (queueStates[type]?.length || 0), 0),
    [queueTypes, queueStates]
  );

  return (
    <GamePanel 
      ref={containerRef}
      title="📚 고급 이벤트 루프 시스템" 
      className={cn("flex flex-col overflow-hidden", className)}
    >
      {/* 큐 헤더 */}
      <div 
        className="flex-shrink-0 shadow-sm bg-gradient-to-r from-amber-900 to-amber-800 border-b border-amber-700"
        style={{
          padding: responsiveLayout.getResponsiveSpacing(16)
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="font-bold flex items-center gap-2 text-white"
              style={{ 
                fontSize: typography.heading.h3,
                ...createTextOverflowStyles({ maxLines: 1, breakWord: false })
              }}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="min-w-0">고급 이벤트 루프 시스템</span>
            </h3>
            {!responsiveLayout.isCompact && (
              <p 
                className="mt-1 flex items-center gap-2 min-w-0 text-amber-100"
                style={{ 
                  fontSize: typography.caption.large,
                  ...createTextOverflowStyles({ maxLines: 2, breakWord: true })
                }}
              >
                <Users className="w-3 h-3 flex-shrink-0" />
                <span className="min-w-0">
                  {queueTypes.length === 5 
                    ? '5개 큐 관리: 콜스택, 마이크로태스크, 매크로태스크, 애니메이션, 제너레이터'
                    : '6개 큐 관리: 콜스택, 마이크로태스크, 매크로태스크, 애니메이션, I/O, 웹워커'
                  }
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExecuting && (
              <span 
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                style={{
                  fontSize: responsiveLayout.config.fontSize.caption
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                {responsiveLayout.isMobile ? '실행중' : '실행 중'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 메인 큐 시각화 영역 */}
      <div 
        className="flex-1 overflow-auto relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800"
        style={{
          padding: responsiveLayout.getResponsiveSpacing(16)
        }}
      >
        {/* 반응형 그리드 시스템 - 세로 공간 최적 활용 */}
        <div 
          className={cn(
            "h-full grid gap-4",
            gridLayout.cols,
            gridLayout.rows,
            gridLayout.specialLayout === 'layout-c' && 'layout-c-special',
            gridLayout.specialLayout === 'layout-d' && 'layout-d-special'
          )}
          style={{
            minHeight: responsiveLayout.isDesktop ? '600px' : '500px'
          }}
        >
          {queueTypes.map((queueType, index) => {
            const style = queueStyles[queueType as keyof typeof queueStyles] || queueStyles.callstack;
            const Icon = style.icon;
            const items = queueStates[queueType] || [];
            
            // Layout C에서 마지막 아이템(5번째)은 전체 너비 사용
            const isLastInLayoutC = gridLayout.specialLayout === 'layout-c' && index === 4;
            
            return (
              <motion.div
                key={queueType}
                className={cn(
                  "relative border rounded-lg shadow-md flex flex-col",
                  style.background,
                  style.border,
                  highlightedQueue === queueType && "ring-2 ring-blue-400 ring-opacity-50 shadow-lg",
                  gridLayout.itemHeight,
                  isLastInLayoutC && "col-span-2"
                )}
                animate={{
                  scale: highlightedQueue === queueType ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  minHeight: responsiveLayout.isDesktop ? '180px' : '150px'
                }}
              >
                <div className={cn(
                  "flex items-center gap-2 p-3 border-b",
                  style.border,
                  highlightedQueue === queueType && style.highlight
                )}>
                  <Icon className={cn("w-5 h-5", style.iconColor)} />
                  <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">
                    {style.title}
                  </h3>
                  {items.length > 0 && (
                    <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                      {items.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  {renderQueue(queueType, items, style)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 실행 상태 표시 */}
      {(state.gameState === 'playing' || isExecuting) && (
        <motion.div
          className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          실행 중...
        </motion.div>
      )}
    </GamePanel>
  )
})

EnhancedMultiQueueVisualizationPanel.displayName = 'EnhancedMultiQueueVisualizationPanel'