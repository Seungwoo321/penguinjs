// 향상된 다중 큐 시각화 패널 (Layout C, D용)
// 5-6개의 큐를 아름답게 표시하며 Layout B의 스타일을 계승

import React, { useRef, useMemo, useCallback, memo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Zap, BookOpen, Book, ArrowRight, Calendar, Users,
  Film, RefreshCw, HardDrive, Cpu
} from 'lucide-react'
import { useContainerResponsive } from '@/games/callstack-library/hooks/useResponsiveLayout'
import { useOptimizedAnimations } from '@/games/callstack-library/hooks/useOptimizedAnimations'
import { typography, createTextOverflowStyles } from '@/games/callstack-library/utils/textUtils'
import { usePerformanceOptimization } from '@/games/callstack-library/hooks/usePerformanceOptimization'
import { useMemoryMonitor } from '@/games/callstack-library/hooks/useMemoryMonitor'
import { useLeakDetection } from '@/games/callstack-library/hooks/useMemoryManagement'
import { useCallStackLibraryContext } from '@/games/callstack-library/contexts/CallStackLibraryContext'
import { gameEvents } from '@/games/callstack-library/utils/eventSystem'

interface EnhancedMultiQueueVisualizationPanelProps {
  queueTypes: ReadonlyArray<string>;
  queueStates: any;
  isExecuting?: boolean;
  highlightedQueue?: string | null;
  onQueueItemClick?: (queueType: string, item: any) => void;
  maxSize?: number;
  className?: string;
}

// 큐 타입별 스타일 정의 - CSS 변수 사용
const getQueueStyles = () => {
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;

  return {
  callstack: {
    icon: BookOpen,
    title: '콜스택',
    emptyMessage: '콜스택이 비어있습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-callstack-light))',
      border: '2px solid rgb(var(--game-callstack-queue-callstack-light))',
      highlight: 'rgba(var(--game-callstack-queue-callstack), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-callstack))',
      text: 'rgb(var(--text-primary))'
    })
  },
  microtask: {
    icon: Zap,
    title: '마이크로태스크',
    emptyMessage: '마이크로태스크가 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-microtask-light))',
      border: '2px solid rgb(var(--game-callstack-queue-microtask-light))',
      highlight: 'rgba(var(--game-callstack-queue-microtask), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-microtask))',
      text: 'rgb(var(--text-primary))'
    })
  },
  macrotask: {
    icon: Calendar,
    title: '매크로태스크',
    emptyMessage: '매크로태스크가 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-macrotask-light))',
      border: '2px solid rgb(var(--game-callstack-queue-macrotask-light))',
      highlight: 'rgba(var(--game-callstack-queue-macrotask), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-macrotask))',
      text: 'rgb(var(--text-primary))'
    })
  },
  priority: {
    icon: Zap,
    title: '우선순위',
    emptyMessage: '우선순위 작업이 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-priority-light))',
      border: '2px solid rgb(var(--game-callstack-queue-priority-light))',
      highlight: 'rgba(var(--game-callstack-queue-priority), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-priority))',
      text: 'rgb(var(--text-primary))'
    })
  },
  animation: {
    icon: Film,
    title: '애니메이션',
    emptyMessage: '애니메이션 프레임이 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-animation-light))',
      border: '2px solid rgb(var(--game-callstack-queue-animation-light))',
      highlight: 'rgba(var(--game-callstack-queue-animation), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-animation))',
      text: 'rgb(var(--text-primary))'
    })
  },
  generator: {
    icon: RefreshCw,
    title: '제너레이터',
    emptyMessage: '제너레이터가 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-generator-light))',
      border: '2px solid rgb(var(--game-callstack-queue-generator-light))',
      highlight: 'rgba(var(--game-callstack-queue-generator), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-generator))',
      text: 'rgb(var(--text-primary))'
    })
  },
  io: {
    icon: HardDrive,
    title: 'I/O 작업',
    emptyMessage: 'I/O 작업이 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-io-light))',
      border: '2px solid rgb(var(--game-callstack-queue-io-light))',
      highlight: 'rgba(var(--game-callstack-queue-io), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-io))',
      text: 'rgb(var(--text-primary))'
    })
  },
  worker: {
    icon: Cpu,
    title: '웹 워커',
    emptyMessage: '워커 작업이 없습니다',
    getColors: () => ({
      background: 'rgb(var(--game-callstack-queue-worker-light))',
      border: '2px solid rgb(var(--game-callstack-queue-worker-light))',
      highlight: 'rgba(var(--game-callstack-queue-worker), 0.8)',
      icon: 'rgb(var(--game-callstack-queue-worker))',
      text: 'rgb(var(--text-primary))'
    })
  }
  };
}

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
  
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  // 경량화된 메모리 관리 (개발 환경에서만)
  const { registerCleanup, isMemoryPressure } = useMemoryMonitor()
  
  // 개발 환경에서만 메모리 누수 감지
  if (process.env.NODE_ENV === 'development') {
    useLeakDetection('EnhancedMultiQueueVisualizationPanel')
  }
  
  // 반응형 레이아웃
  const responsiveLayout = useContainerResponsive(containerRef)
  const optimizedAnimations = useOptimizedAnimations()
  
  // Context API 사용
  const { state, dispatch } = useCallStackLibraryContext();
  
  // CSS 변수 기반 큐 스타일 가져오기
  const queueStyles = useMemo(() => getQueueStyles(), [])
  
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
    (queueType: string, item: any, index: number, style: ReturnType<typeof getQueueStyles>[keyof ReturnType<typeof getQueueStyles>]) => {
      const colors = style.getColors();
      return (
        <motion.div
          key={item.id || index}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="bg-card rounded-lg shadow-sm p-3 border border-border cursor-pointer"
          onClick={() => handleQueueItemClick(queueType, item)}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{item.functionName || item.name}</span>
            <span className="text-xs opacity-70">#{index + 1}</span>
          </div>
        </motion.div>
      );
    },
    [highlightedQueue, handleQueueItemClick]
  );
  
  // 큐 렌더링
  const renderQueue = useCallback(
    (queueType: string, items: any[], style: ReturnType<typeof getQueueStyles>[keyof ReturnType<typeof getQueueStyles>]) => {
      const colors = style.getColors();
      
      if (!items || items.length === 0) {
        return (
          <div className="flex items-center justify-center py-8" style={{ color: 'rgb(var(--muted-foreground))' }}>
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
            <div className="text-center text-xs pt-2" style={{ color: 'rgb(var(--muted-foreground))' }}>
              +{items.length - maxSize} more items...
            </div>
          )}
        </div>
      );
    },
    [renderQueueItem, maxSize, responsiveLayout]
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
        className="flex-shrink-0 shadow-sm border-b"
        style={{
          backgroundColor: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))',
          padding: responsiveLayout.getResponsiveSpacing(16)
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="font-bold flex items-center gap-2"
              style={{ 
                fontSize: typography.heading.h3,
                color: 'rgb(var(--foreground))',
                ...createTextOverflowStyles({ maxLines: 1, breakWord: false })
              }}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="min-w-0">고급 이벤트 루프 시스템</span>
            </h3>
            {!responsiveLayout.isCompact && (
              <p 
                className="mt-1 flex items-center gap-2 min-w-0"
                style={{ 
                  fontSize: typography.caption.large,
                  color: 'rgb(var(--muted-foreground))',
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
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{
                  fontSize: responsiveLayout.config.fontSize.caption,
                  backgroundColor: 'rgb(var(--success))',
                  color: 'rgb(var(--success-foreground))'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgb(var(--success))' }}></div>
                {responsiveLayout.isMobile ? '실행중' : '실행 중'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 메인 큐 시각화 영역 */}
      <div 
        className="flex-1 overflow-auto relative"
        style={{
          backgroundColor: 'rgb(var(--card))',
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
            const colors = style.getColors();
            
            // Layout C에서 마지막 아이템(5번째)은 전체 너비 사용
            const isLastInLayoutC = gridLayout.specialLayout === 'layout-c' && index === 4;
            
            return (
              <motion.div
                key={queueType}
                className={cn(
                  "relative rounded-lg shadow-md flex flex-col",
                  highlightedQueue === queueType && "ring-2 ring-opacity-50 shadow-lg",
                  gridLayout.itemHeight,
                  isLastInLayoutC && "col-span-2"
                )}
                style={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  ...(highlightedQueue === queueType && {
                    ringColor: 'rgb(var(--ring))'
                  })
                }}
                animate={{
                  scale: highlightedQueue === queueType ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className="flex items-center gap-2 p-3 border-b"
                  style={{
                    borderColor: 'rgb(var(--border))',
                    ...(highlightedQueue === queueType && {
                      backgroundColor: 'rgb(var(--muted))'
                    })
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'rgb(var(--foreground))' }} />
                  <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--foreground))' }}>
                    {style.title}
                  </h3>
                  {items.length > 0 && (
                    <span 
                      className="ml-auto text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 'rgb(var(--muted))',
                        color: 'rgb(var(--muted-foreground))'
                      }}
                    >
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
          className="absolute top-2 right-2 px-3 py-1 text-sm rounded-full"
          style={{ 
            background: 'rgb(var(--game-callstack-button-primary))',
            color: 'white'
          }}
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