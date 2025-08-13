/**
 * 가상화된 콜스택 컴포넌트
 * 대량의 아이템을 효율적으로 렌더링하고 오버플로우를 처리
 */

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, MoreHorizontal, Book, AlertTriangle } from 'lucide-react'
import { cn } from '@penguinjs/ui'
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync'
import { useResponsiveLayout } from '@/games/callstack-library/hooks/useResponsiveLayout'
import { useOptimizedAnimations, getGPUAcceleratedStyles } from '@/games/callstack-library/hooks/useOptimizedAnimations'
import { usePerformanceOptimization, useListVirtualization } from '@/games/callstack-library/hooks/usePerformanceOptimization'
import { useLeakDetection } from '@/games/callstack-library/hooks/useMemoryManagement'

export interface CallStackItem {
  id: string
  functionName: string
  color?: string
  timestamp: number
  position: number
  metadata?: Record<string, any>
}

export interface VirtualizedCallStackProps {
  items: CallStackItem[]
  maxVisible?: number
  enableVirtualization?: boolean
  showOverflowIndicator?: boolean
  showScrollIndicator?: boolean
  enableStackEffects?: boolean
  onItemClick?: (item: CallStackItem, index: number) => void
  onStackOverflow?: (overflowCount: number) => void
  className?: string
}

interface ScrollIndicatorProps {
  total: number
  visible: number
  current: number
  onScrollToIndex: (index: number) => void
}

/**
 * 메모이제이션된 스크롤 인디케이터 컴포넌트
 */
const ScrollIndicator: React.FC<ScrollIndicatorProps> = memo(({
  total,
  visible,
  current,
  onScrollToIndex
}) => {
  const isDarkMode = useDarkModeDetection()
  const responsiveLayout = useResponsiveLayout()
  
  // 성능 최적화
  // Removed optimizedMemo - using standard React hooks directly
  useLeakDetection('ScrollIndicator')
  
  const scrollState = useMemo(
    () => ({
      canScrollUp: current > 0,
      canScrollDown: current + visible < total,
      hiddenCount: total - visible
    }),
    [current, visible, total]
  )

  // Hook 규칙 준수를 위해 early return 대신 조건부 렌더링
  if (total <= visible) {
    return null;
  }

  return (
    <div 
      className="absolute top-2 right-2 z-20 flex flex-col gap-1"
      role="navigation"
      aria-label="콜스택 스크롤 네비게이션"
      style={{
        fontSize: '10px',
        color: 'rgb(var(--game-callstack-queue-contrast))'
      }}
    >
      {/* 상단 스크롤 버튼 */}
      <button
        onClick={() => onScrollToIndex(Math.max(0, current - 1))}
        disabled={!scrollState.canScrollUp}
        className="rounded transition-all"
        aria-label={`이전 페이지로 스크롤 ${scrollState.canScrollUp ? '' : '(첫 번째 페이지)'}`}
        style={{
          backgroundColor: scrollState.canScrollUp ? 'rgb(var(--game-callstack-queue-light))' : 'rgba(0,0,0,0.2)',
          opacity: scrollState.canScrollUp ? 1 : 0.5,
          minWidth: responsiveLayout.config.buttonSize.minWidth,
          minHeight: responsiveLayout.config.buttonSize.minHeight,
          padding: responsiveLayout.config.buttonSize.padding
        }}
      >
        <ChevronUp className="w-3 h-3" aria-hidden="true" />
      </button>

      {/* 위치 표시 */}
      <div 
        className="px-2 py-1 rounded text-center min-w-[40px]"
        aria-label={`전체 ${total}개 중 ${current + 1}번째부터 ${Math.min(current + visible, total)}번째까지 표시`}
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          fontSize: '9px'
        }}
      >
        {current + 1}-{Math.min(current + visible, total)}/{total}
      </div>

      {/* 숨겨진 아이템 수 */}
      {scrollState.hiddenCount > 0 && (
        <div 
          className="px-1 py-0.5 rounded text-center"
          aria-label={`${scrollState.hiddenCount}개의 추가 아이템이 숨겨져 있습니다`}
          style={{
            backgroundColor: 'rgba(255, 165, 0, 0.8)',
            color: 'white',
            fontSize: '8px'
          }}
        >
          +{scrollState.hiddenCount}
        </div>
      )}

      {/* 하단 스크롤 버튼 */}
      <button
        onClick={() => onScrollToIndex(Math.min(total - visible, current + 1))}
        disabled={!scrollState.canScrollDown}
        className="rounded transition-all"
        aria-label={`다음 페이지로 스크롤 ${scrollState.canScrollDown ? '' : '(마지막 페이지)'}`}
        style={{
          backgroundColor: scrollState.canScrollDown ? 'rgb(var(--game-callstack-queue-light))' : 'rgba(0,0,0,0.2)',
          opacity: scrollState.canScrollDown ? 1 : 0.5,
          minWidth: responsiveLayout.config.buttonSize.minWidth,
          minHeight: responsiveLayout.config.buttonSize.minHeight,
          padding: responsiveLayout.config.buttonSize.padding
        }}
      >
        <ChevronDown className="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  )
}, (prev, next) => {
  // 메모이제이션 최적화: 실제 변경된 값만 체크
  return prev.total === next.total && 
         prev.visible === next.visible && 
         prev.current === next.current
})

/**
 * 메모이제이션된 스택 오버플로우 경고 컴포넌트
 */
const StackOverflowWarning: React.FC<{ count: number }> = memo(({ count }) => {
  const isDarkMode = useDarkModeDetection()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
    >
      <div 
        className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border-2"
        style={{
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          color: '#92400e'
        }}
      >
        <AlertTriangle className="w-4 h-4 text-orange-600" />
        <span className="text-xs font-medium">
          스택 오버플로우 위험: {count}개 초과
        </span>
      </div>
    </motion.div>
  )
}, (prev, next) => prev.count === next.count)

/**
 * 개별 스택 북 컴포넌트
 */
interface StackBookProps {
  item: CallStackItem
  index: number
  total: number
  isVisible: boolean
  isFocused?: boolean
  position: { bottom: number; zIndex: number }
  bookDimensions: { width: string; height: string }
  onClick?: (item: CallStackItem, index: number) => void
}

const StackBook: React.FC<StackBookProps> = memo(({
  item,
  index,
  total,
  isVisible,
  isFocused = false,
  position,
  bookDimensions,
  onClick
}) => {
  const isDarkMode = useDarkModeDetection()
  const responsiveLayout = useResponsiveLayout()
  const optimizedAnimations = useOptimizedAnimations()

  // 책 색상 결정 (메모이제이션)
  const bookColor = useMemo(() => 
    item.color || 'rgb(var(--game-callstack-queue-button))',
    [item.color]
  )

  // GPU 가속 스타일
  const gpuStyles = useMemo(() => getGPUAcceleratedStyles(), [])
  
  // 최적화된 애니메이션 생성
  const bookAnimation = useMemo(() => 
    optimizedAnimations.createStackAnimation(total, index),
    [optimizedAnimations, total, index]
  )
  
  // Hook 규칙 준수: early return 대신 조건부 렌더링
  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      layout
      {...bookAnimation}
      id={`stack-item-${item.id}`}
      className={cn(
        "absolute left-4 right-4 cursor-pointer transition-all",
        isFocused && "ring-2 ring-amber-400 ring-offset-2"
      )}
      style={{
        bottom: `${position.bottom}px`,
        height: bookDimensions.height,
        zIndex: position.zIndex,
        perspective: '1000px',
        ...gpuStyles
      }}
      role="option"
      aria-selected={isFocused}
      aria-label={`${item.functionName} 함수, 스택 위치 ${total - index}번째, ${isFocused ? '현재 선택됨' : '선택 가능'}`}
      tabIndex={-1}
      onClick={() => onClick?.(item, index)}
      whileHover={optimizedAnimations.shouldAnimate('bookHover') ? optimizedAnimations.variants.bookHover as any : undefined}
    >
      <div 
        className="h-full rounded-lg shadow-xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 hover:scale-105"
        style={{ 
          backgroundColor: bookColor,
          boxShadow: 'var(--game-callstack-library-shadow-card)',
          borderRadius: 'var(--game-callstack-library-radius-card)'
        }}
      >
        {/* 책 제본 효과 */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-black/10" />
        <div className="absolute left-1 top-0 bottom-0 w-1 bg-white/50" />
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/30" />
        
        {/* 책 표지 텍스처 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundColor: 'rgb(var(--game-callstack-library-paper))'
          }}
        />
        
        <span 
          className="text-white font-mono font-bold ml-3 mr-2 drop-shadow-lg relative z-10 break-all flex items-center gap-1"
          style={{
            fontSize: responsiveLayout.config.fontSize.body,
            writingMode: responsiveLayout.isMobile ? 'horizontal-tb' : 'vertical-rl',
            textOrientation: responsiveLayout.isMobile ? 'mixed' : 'mixed'
          }}
        >
          <Book className="w-3 h-3 flex-shrink-0" />
          {item.functionName}
        </span>
        
        {/* 책 페이지 효과 */}
        <div className="absolute right-1 top-1 bottom-1 w-1 bg-white/80 rounded-r-sm shadow-sm" />
        
        {/* 스택 위치 표시 */}
        <div 
          className="absolute top-1 right-2 text-xs font-bold opacity-60"
          style={{ color: 'white' }}
        >
          {total - index}
        </div>
      </div>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // 성능 최적화: 실제로 변경된 props만 체크
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.functionName === nextProps.item.functionName &&
    prevProps.isVisible === nextProps.isVisible &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.position.bottom === nextProps.position.bottom &&
    prevProps.position.zIndex === nextProps.position.zIndex
  )
})

/**
 * 메인 가상화된 콜스택 컴포넌트 (메모이제이션 적용)
 */
export const VirtualizedCallStack: React.FC<VirtualizedCallStackProps> = memo(({
  items,
  maxVisible = 6,
  enableVirtualization = true,
  showOverflowIndicator = true,
  showScrollIndicator = true,
  enableStackEffects = true,
  onItemClick,
  onStackOverflow,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  
  const isDarkMode = useDarkModeDetection()
  const responsiveLayout = useResponsiveLayout()

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // 반응형 설정 계산
  const stackConfig = useMemo(() => {
    const bookHeight = parseInt(responsiveLayout.config.bookHeight)
    const bookWidth = parseInt(responsiveLayout.config.bookWidth)
    const stackOffset = bookHeight * 0.7 // 겹침 효과
    
    // 컨테이너 높이에 따른 최대 표시 수 조정
    let adaptiveMaxVisible = maxVisible
    if (containerHeight > 0) {
      const calculatedMax = Math.floor((containerHeight - 32) / stackOffset)
      adaptiveMaxVisible = Math.min(maxVisible, Math.max(3, calculatedMax))
    }

    return {
      bookHeight,
      bookWidth,
      stackOffset,
      maxVisible: adaptiveMaxVisible,
      shouldVirtualize: enableVirtualization && items.length > adaptiveMaxVisible
    }
  }, [responsiveLayout.config, maxVisible, containerHeight, enableVirtualization, items.length])

  // 가시 아이템 계산
  const visibleItems = useMemo(() => {
    if (!stackConfig.shouldVirtualize) {
      return items.map((item, index) => ({ item, index, isVisible: true }))
    }

    return items.map((item, index) => ({
      item,
      index,
      isVisible: index >= startIndex && index < startIndex + stackConfig.maxVisible
    }))
  }, [items, startIndex, stackConfig])

  // 스택 오버플로우 감지
  const overflowCount = items.length - stackConfig.maxVisible
  const hasOverflow = overflowCount > 0

  useEffect(() => {
    if (hasOverflow && onStackOverflow) {
      onStackOverflow(overflowCount)
    }
  }, [hasOverflow, overflowCount, onStackOverflow])

  // 스크롤 처리
  const handleScrollToIndex = useCallback((index: number) => {
    const newStartIndex = Math.max(0, Math.min(items.length - stackConfig.maxVisible, index))
    setStartIndex(newStartIndex)
  }, [items.length, stackConfig.maxVisible])

  // 키보드 네비게이션 및 접근성
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1)
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 포커스가 컨테이너에 있을 때만 처리
      if (document.activeElement !== containerRef.current) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          if (stackConfig.shouldVirtualize) {
            handleScrollToIndex(startIndex - 1)
          } else {
            const newIndex = Math.max(0, focusedItemIndex - 1)
            setFocusedItemIndex(newIndex)
            // 스크린리더 알림
            const item = items[newIndex]
            if (item) {
              containerRef.current?.setAttribute('aria-activedescendant', `stack-item-${item.id}`)
            }
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          if (stackConfig.shouldVirtualize) {
            handleScrollToIndex(startIndex + 1)
          } else {
            const newIndex = Math.min(items.length - 1, focusedItemIndex + 1)
            setFocusedItemIndex(newIndex)
            // 스크린리더 알림
            const item = items[newIndex]
            if (item) {
              containerRef.current?.setAttribute('aria-activedescendant', `stack-item-${item.id}`)
            }
          }
          break
        case 'Home':
          event.preventDefault()
          if (stackConfig.shouldVirtualize) {
            handleScrollToIndex(0)
          }
          setFocusedItemIndex(0)
          const firstItem = items[0]
          if (firstItem) {
            containerRef.current?.setAttribute('aria-activedescendant', `stack-item-${firstItem.id}`)
          }
          break
        case 'End':
          event.preventDefault()
          if (stackConfig.shouldVirtualize) {
            handleScrollToIndex(items.length - stackConfig.maxVisible)
          }
          const lastIndex = items.length - 1
          setFocusedItemIndex(lastIndex)
          const lastItem = items[lastIndex]
          if (lastItem) {
            containerRef.current?.setAttribute('aria-activedescendant', `stack-item-${lastItem.id}`)
          }
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedItemIndex >= 0 && items[focusedItemIndex]) {
            onItemClick?.(items[focusedItemIndex], focusedItemIndex)
          }
          break
        case 'Escape':
          event.preventDefault()
          setFocusedItemIndex(-1)
          containerRef.current?.removeAttribute('aria-activedescendant')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stackConfig.shouldVirtualize, startIndex, handleScrollToIndex, items.length, stackConfig.maxVisible, focusedItemIndex, items, onItemClick])

  // GPU 가속 스타일
  const containerStyles = useMemo(() => ({
    background: 'rgb(var(--game-callstack-queue-main))',
    borderRadius: 'var(--game-callstack-library-radius-panel)',
    border: '2px solid rgb(var(--game-callstack-queue-border))',
    boxShadow: 'var(--game-callstack-library-shadow-elevated)',
    ...getGPUAcceleratedStyles()
  }), [])

  return (
    <div 
      ref={containerRef}
      className={cn("relative h-full overflow-hidden", className)}
      style={containerStyles}
      role="listbox"
      aria-label={`콜스택 메인 서가 - ${items.length}개의 도서가 있습니다. 화살표 키로 네비게이션, Enter로 선택할 수 있습니다.`}
      aria-live="polite"
      aria-multiselectable="false"
      aria-orientation="vertical"
      tabIndex={0}
    >
      {/* 스크롤 인디케이터 */}
      {showScrollIndicator && stackConfig.shouldVirtualize && (
        <ScrollIndicator
          total={items.length}
          visible={stackConfig.maxVisible}
          current={startIndex}
          onScrollToIndex={handleScrollToIndex}
        />
      )}

      {/* 스택 오버플로우 경고 */}
      <AnimatePresence>
        {showOverflowIndicator && hasOverflow && overflowCount > 5 && (
          <StackOverflowWarning count={overflowCount} />
        )}
      </AnimatePresence>

      {/* 스택 아이템들 */}
      <div className="relative h-full">
        <AnimatePresence>
          {visibleItems.map(({ item, index, isVisible }) => {
            const stackPosition = index - startIndex
            const bottomPosition = 16 + stackPosition * stackConfig.stackOffset
            const zIndex = items.length - index + 10

            return (
              <StackBook
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                isVisible={isVisible}
                isFocused={focusedItemIndex === index}
                position={{ bottom: bottomPosition, zIndex }}
                bookDimensions={{
                  width: `${stackConfig.bookWidth}px`,
                  height: `${stackConfig.bookHeight}px`
                }}
                onClick={onItemClick}
              />
            )
          })}
        </AnimatePresence>

        {/* 빈 스택 메시지 */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 100 }}>
            <div 
              className="text-center p-6 rounded-xl shadow-lg backdrop-blur-sm border"
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.2)',
                borderColor: 'rgba(217, 119, 6, 0.3)',
                color: 'rgb(var(--game-callstack-queue-contrast))'
              }}
            >
              <div className="text-4xl mb-2">📚</div>
              <p className="font-medium" style={{ fontSize: responsiveLayout.config.fontSize.body }}>
                메인 서가가 비어있습니다
              </p>
              <p className="opacity-70 mt-1" style={{ fontSize: responsiveLayout.config.fontSize.caption }}>
                사서가 대기 중입니다
              </p>
            </div>
          </div>
        )}

        {/* 성능 디버그 정보 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 left-2 text-xs opacity-50 bg-black/20 text-white p-1 rounded">
            Rendered: {visibleItems.filter(v => v.isVisible).length} / {items.length}
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 성능 최적화를 위한 얕은 비교
  return (
    prevProps.items === nextProps.items &&
    prevProps.maxVisible === nextProps.maxVisible &&
    prevProps.enableVirtualization === nextProps.enableVirtualization &&
    prevProps.showOverflowIndicator === nextProps.showOverflowIndicator &&
    prevProps.showScrollIndicator === nextProps.showScrollIndicator &&
    prevProps.enableStackEffects === nextProps.enableStackEffects &&
    prevProps.className === nextProps.className
  )
})

// displayName 설정 (디버깅용)
VirtualizedCallStack.displayName = 'VirtualizedCallStack'

export default VirtualizedCallStack