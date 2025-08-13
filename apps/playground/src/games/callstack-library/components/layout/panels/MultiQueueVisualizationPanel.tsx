// 다중 큐 시각화 패널 (Layout B용)
// 콜스택, 마이크로태스크, 매크로태스크 큐를 동시에 표시

import React, { useRef, useMemo, useCallback, memo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { MultiQueueVisualizationPanelProps } from '@/games/callstack-library/types/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, BookOpen, Book, ArrowRight, Calendar, Users } from 'lucide-react'
import { useContainerResponsive } from '@/games/callstack-library/hooks/useResponsiveLayout'
import { useOptimizedAnimations } from '@/games/callstack-library/hooks/useOptimizedAnimations'
import { typography, createTextOverflowStyles } from '@/games/callstack-library/utils/textUtils'
import { usePerformanceOptimization } from '@/games/callstack-library/hooks/usePerformanceOptimization'
import { useMemoryMonitor } from '@/games/callstack-library/hooks/useMemoryMonitor'
import { useLeakDetection } from '@/games/callstack-library/hooks/useMemoryManagement'
import { useCallStackLibraryContext } from '@/games/callstack-library/contexts/CallStackLibraryContext'
import { gameEvents } from '@/games/callstack-library/utils/eventSystem'

/**
 * 다중 큐 시각화 패널
 * Layout B에서 이벤트 루프의 3개 큐를 동시에 표시
 */
export const MultiQueueVisualizationPanel: React.FC<MultiQueueVisualizationPanelProps> = memo(({
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
    useLeakDetection('MultiQueueVisualizationPanel')
  }
  
  // 반응형 레이아웃 (메모이제이션 강화)
  const responsiveLayout = useContainerResponsive(containerRef)
  const optimizedAnimations = useOptimizedAnimations()
  
  // Context API 사용으로 중앙 상태 관리
  const { state, dispatch } = useCallStackLibraryContext();
  
  // 최적화된 이벤트 핸들러
  const handleQueueItemClick = useCallback(
    (queueType: 'callstack' | 'microtask' | 'macrotask', item: any) => {
      // 이벤트 시스템을 통한 알림
      gameEvents.queueItemAdded(queueType, item, 0);
      // 기존 핸들러 호출
      onQueueItemClick?.(queueType, item);
    },
    [onQueueItemClick]
  );
  
  // 간단한 큐 아이템 렌더링
  const renderQueue = useCallback(
    (queueType: 'callstack' | 'microtask' | 'macrotask', items: any[]) => {
      if (!items || items.length === 0) {
        const emptyMessages = {
          callstack: '콜스택이 비어있습니다',
          microtask: '마이크로태스크가 없습니다',
          macrotask: '매크로태스크가 없습니다'
        };
        
        return (
          <div className="flex items-center justify-center py-8" style={{ color: 'rgb(var(--muted-foreground))' }}>
            <p className="text-sm">{emptyMessages[queueType]}</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-2 p-4">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-card rounded-lg shadow-sm p-3 border border-border cursor-pointer"
              onClick={() => handleQueueItemClick(queueType, item)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{item.functionName || item.name}</span>
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [highlightedQueue, handleQueueItemClick]
  );
  
  // 큐 상태 메모이제이션 (얕은 비교로 최적화)
  const memoizedQueueStates = useMemo(
    () => {
      const currentStates = state.queueStates || queueStates;
      return {
        callstack: currentStates.callstack || [],
        microtask: currentStates.microtask || [],
        macrotask: currentStates.macrotask || []
      };
    },
    [state.queueStates?.callstack?.length, state.queueStates?.microtask?.length, state.queueStates?.macrotask?.length,
     queueStates.callstack?.length, queueStates.microtask?.length, queueStates.macrotask?.length]
  )
  
  // 총 아이템 수 계산 (메모이제이션)
  const totalItems = useMemo(
    () => {
      return memoizedQueueStates.callstack.length + 
             memoizedQueueStates.microtask.length + 
             memoizedQueueStates.macrotask.length
    },
    [memoizedQueueStates]
  )

  return (
    <GamePanel 
      ref={containerRef}
      title="📚 큐 시각화" 
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
              className="font-bold flex items-center gap-2 text-[rgb(var(--foreground))]"
              style={{ 
                fontSize: typography.heading.h3,
                ...createTextOverflowStyles({ maxLines: 1, breakWord: false })
              }}
            >
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className="min-w-0">이벤트 루프 큐 시스템</span>
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
                <span className="min-w-0">처리 순서: 콜스택 → 마이크로태스크 → 매크로태스크</span>
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
        className="flex-1 overflow-hidden relative"
        style={{
          backgroundColor: 'rgb(var(--card))',
          padding: responsiveLayout.getResponsiveSpacing(16)
        }}
      >
        
        {/* 반응형 그리드 시스템 */}
        <div 
          className={cn(
            "h-full relative z-10",
            responsiveLayout.config.layoutDirection === 'vertical' ? "flex flex-col" : "grid"
          )}
          style={{
            gap: responsiveLayout.config.queueGap,
            ...(responsiveLayout.config.layoutDirection === 'horizontal' && {
              gridTemplateRows: 'repeat(3, minmax(0, 1fr))'
            })
          }}
        >
          
          {/* 콜스택 영역 */}
          <motion.div
            className={cn(
              "relative border rounded-lg bg-[rgb(var(--card))] border-[rgb(var(--border))]",
              highlightedQueue === 'callstack' && "ring-2 ring-blue-400 ring-opacity-50 shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'callstack' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="flex items-center gap-2 p-3 border-b"
              style={{ borderColor: 'rgb(var(--border))' }}
            >
              <BookOpen className="w-5 h-5" style={{ color: 'rgb(var(--game-callstack-queue-callstack))' }} />
              <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--text-primary))' }}>콜스택</h3>
            </div>
            {renderQueue('callstack', memoizedQueueStates.callstack)}
          </motion.div>

          {/* 마이크로태스크 큐 */}
          <motion.div
            className={cn(
              "relative rounded-lg",
              highlightedQueue === 'microtask' && "ring-2 ring-opacity-50 shadow-lg"
            )}
            style={{
              backgroundColor: 'rgb(var(--card))',
              border: '1px solid rgb(var(--border))',
              ...(highlightedQueue === 'microtask' && {
                ringColor: 'rgb(var(--ring))'
              })
            }}
            animate={{
              scale: highlightedQueue === 'microtask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="flex items-center gap-2 p-3 border-b"
              style={{ 
                borderColor: 'rgb(var(--border))',
                ...(highlightedQueue === 'microtask' && {
                  backgroundColor: 'rgb(var(--muted))'
                })
              }}
            >
              <Zap className="w-5 h-5" style={{ color: 'rgb(var(--foreground))' }} />
              <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--text-primary))' }}>마이크로태스크</h3>
            </div>
            {renderQueue('microtask', memoizedQueueStates.microtask)}
          </motion.div>

          {/* 매크로태스크 큐 */}
          <motion.div
            className={cn(
              "relative rounded-lg",
              highlightedQueue === 'macrotask' && "ring-2 ring-opacity-50 shadow-lg"
            )}
            style={{
              backgroundColor: 'rgb(var(--card))',
              border: '1px solid rgb(var(--border))',
              ...(highlightedQueue === 'macrotask' && {
                ringColor: 'rgb(var(--ring))'
              })
            }}
            animate={{
              scale: highlightedQueue === 'macrotask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="flex items-center gap-2 p-3 border-b"
              style={{ 
                borderColor: 'rgb(var(--border))',
                ...(highlightedQueue === 'macrotask' && {
                  backgroundColor: 'rgb(var(--muted))'
                })
              }}
            >
              <Calendar className="w-5 h-5" style={{ color: 'rgb(var(--foreground))' }} />
              <h3 className="font-semibold text-base" style={{ color: 'rgb(var(--text-primary))' }}>매크로태스크</h3>
            </div>
            {renderQueue('macrotask', memoizedQueueStates.macrotask)}
          </motion.div>

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

MultiQueueVisualizationPanel.displayName = 'MultiQueueVisualizationPanel'