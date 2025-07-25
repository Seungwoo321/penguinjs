// 다중 큐 시각화 패널 (Layout B용)
// 콜스택, 마이크로태스크, 매크로태스크 큐를 동시에 표시

import React, { useRef, useMemo, useCallback, memo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { MultiQueueVisualizationPanelProps } from '../../../types/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, BookOpen, Book, ArrowRight, Calendar, Users } from 'lucide-react'
import { useContainerResponsive } from '../../../hooks/useResponsiveLayout'
import { useOptimizedAnimations } from '../../../hooks/useOptimizedAnimations'
import { typography, createTextOverflowStyles } from '../../../utils/textUtils'
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization'
import { useMemoryManagement, useLeakDetection } from '../../../hooks/useMemoryManagement'
import { useCallStackLibraryContext } from '../../../contexts/CallStackLibraryContext'
import { gameEvents } from '../../../utils/eventSystem'

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
  
  // 성능 최적화 및 메모리 관리
  const { metrics } = usePerformanceOptimization({
    enableMetrics: process.env.NODE_ENV === 'development',
    maxRenderCount: 50
  })
  const { registerCleanup, isMemoryPressure } = useMemoryManagement({
    enableMonitoring: process.env.NODE_ENV === 'development'
  })
  useLeakDetection('MultiQueueVisualizationPanel')
  
  // 반응형, 애니메이션 시스템
  const responsiveLayout = useContainerResponsive(containerRef)
  const optimizedAnimations = useOptimizedAnimations()
  
  // Context API 사용으로 중앙 상태 관리
  const { state, dispatch } = useCallStackLibraryContext();
  
  // 최적화된 이벤트 핸들러
  const handleQueueItemClick = useCallback(
    (queueType: 'callstack' | 'microtask' | 'macrotask', item: any) => {
      // Context API를 통한 상태 업데이트
      dispatch({ type: 'ui/selectQueueItem', payload: { queueType, item } });
      // 이벤트 시스템을 통한 알림
      gameEvents.queueItemAdded(queueType, item, 0);
      // 기존 핸들러 호출
      onQueueItemClick?.(queueType, item);
    },
    [dispatch, onQueueItemClick]
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
          <div className="flex items-center justify-center py-8 text-gray-400">
            <p className="text-sm">{emptyMessages[queueType]}</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-2 p-4">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className={cn(
                "px-3 py-2 rounded-md border transition-all cursor-pointer",
                "hover:shadow-sm hover:scale-[1.02]",
                queueType === 'callstack' && "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                queueType === 'microtask' && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                queueType === 'macrotask' && "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
                highlightedQueue === queueType && "ring-2 ring-offset-1 ring-blue-400"
              )}
              onClick={() => handleQueueItemClick(queueType, item)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{item.functionName || item.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [highlightedQueue, handleQueueItemClick]
  );
  
  // 큐 상태 메모이제이션 (Context 우선)
  const memoizedQueueStates = useMemo(
    () => {
      const currentStates = state.queueStates || queueStates;
      return {
        callstack: currentStates.callstack || [],
        microtask: currentStates.microtask || [],
        macrotask: currentStates.macrotask || []
      };
    },
    [state.queueStates, queueStates.callstack, queueStates.microtask, queueStates.macrotask]
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
        className="flex-shrink-0 shadow-sm bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        style={{
          padding: responsiveLayout.getResponsiveSpacing(16)
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200"
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
                className="mt-1 flex items-center gap-2 min-w-0 text-gray-600 dark:text-gray-400"
                style={{ 
                  fontSize: typography.caption.large,
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
        className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-900"
        style={{
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
              "relative border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
              highlightedQueue === 'callstack' && "ring-2 ring-blue-400 ring-opacity-50 shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'callstack' ? 1.02 : 1,
            }}
            transition={optimizedAnimations.getOptimizedTransition({ duration: 0.2 })}
          >
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">콜스택</h3>
            </div>
            {renderQueue('callstack', memoizedQueueStates.callstack)}
          </motion.div>

          {/* 마이크로태스크 큐 */}
          <motion.div
            className={cn(
              "relative border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
              highlightedQueue === 'microtask' && "ring-2 ring-blue-400 ring-opacity-50 shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'microtask' ? 1.02 : 1,
            }}
            transition={optimizedAnimations.getOptimizedTransition({ duration: 0.2 })}
          >
            <div className="flex items-center gap-2 p-3 border-b border-blue-200 dark:border-blue-800">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">마이크로태스크</h3>
            </div>
            {renderQueue('microtask', memoizedQueueStates.microtask)}
          </motion.div>

          {/* 매크로태스크 큐 */}
          <motion.div
            className={cn(
              "relative border rounded-lg bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
              highlightedQueue === 'macrotask' && "ring-2 ring-orange-400 ring-opacity-50 shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'macrotask' ? 1.02 : 1,
            }}
            transition={optimizedAnimations.getOptimizedTransition({ duration: 0.2 })}
          >
            <div className="flex items-center gap-2 p-3 border-b border-orange-200 dark:border-orange-800">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200">매크로태스크</h3>
            </div>
            {renderQueue('macrotask', memoizedQueueStates.macrotask)}
          </motion.div>

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

      {/* 성능 디버그 정보 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs bg-black/20 text-white p-2 rounded max-w-xs">
          <div>Performance Mode: {optimizedAnimations.useReducedMotion ? 'Reduced Motion' : 'Normal'}</div>
          <div>Queue Items: CS:{memoizedQueueStates.callstack.length} MT:{memoizedQueueStates.microtask.length} MaT:{memoizedQueueStates.macrotask.length}</div>
          <div>Layout: {responsiveLayout.breakpoint} ({responsiveLayout.screenWidth}x{responsiveLayout.screenHeight})</div>
          <div>Renders: {metrics.renderCount} | Avg: {metrics.averageRenderTime.toFixed(1)}ms</div>
          <div>Memory: {isMemoryPressure ? '⚠️ High' : '✅ Normal'} | Items: {totalItems}</div>
        </div>
      )}
    </GamePanel>
  )
})

MultiQueueVisualizationPanel.displayName = 'MultiQueueVisualizationPanel'