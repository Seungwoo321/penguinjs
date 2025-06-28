'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QueueItem, QueueType, QueueVisualConfig } from './types'
import { queueVisualConfigs, queueAnimationVariants, getQueueColorPalette } from './queue-configs'
import { 
  Clock, 
  Zap, 
  Target, 
  RotateCcw, 
  ArrowLeftRight, 
  Film, 
  Rocket, 
  Moon,
  BookOpen
} from 'lucide-react'

interface UniversalQueueBoardProps {
  queueType: QueueType
  items: QueueItem[]
  isExecuting: boolean
  maxSize?: number
  onItemClick?: (item: QueueItem) => void
  showHeader?: boolean
  className?: string
}

// 큐 타입별 아이콘 매핑
const queueIcons: Record<QueueType, React.ComponentType<any>> = {
  callstack: BookOpen,
  microtask: Zap,
  macrotask: Clock,
  priority: Target,
  circular: RotateCcw,
  deque: ArrowLeftRight,
  animation: Film,
  immediate: Rocket,
  idle: Moon
}

export function UniversalQueueBoard({
  queueType,
  items,
  isExecuting,
  maxSize,
  onItemClick,
  showHeader = true,
  className = ''
}: UniversalQueueBoardProps) {
  const config = queueVisualConfigs[queueType]
  const IconComponent = queueIcons[queueType]
  const colorPalette = getQueueColorPalette(queueType)
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)
  
  const effectiveMaxSize = maxSize || config.maxSize
  const sortedItems = queueType === 'priority' 
    ? [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0))
    : items

  useEffect(() => {
    if (items.length > 0) {
      const latestItem = items[items.length - 1]
      setHighlightedItem(latestItem.id)
      const timer = setTimeout(() => setHighlightedItem(null), 600)
      return () => clearTimeout(timer)
    }
  }, [items])

  const renderQueueItems = () => {
    switch (queueType) {
      case 'circular':
        return renderCircularQueue()
      case 'deque':
        return renderDequeQueue()
      case 'priority':
        return renderPriorityQueue()
      default:
        return renderLinearQueue()
    }
  }

  const renderLinearQueue = () => (
    <div className="flex flex-col gap-2 p-4">
      <AnimatePresence mode="wait">
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={queueAnimationVariants.enter}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ 
              duration: config.animationDuration / 1000,
              delay: index * 0.05 
            }}
            className="relative"
            onClick={() => onItemClick?.(item)}
          >
            <QueueItemCard 
              item={item} 
              config={config}
              isHighlighted={highlightedItem === item.id}
              colorPalette={colorPalette}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  const renderCircularQueue = () => {
    const radius = 60
    const centerX = 80
    const centerY = 80
    
    return (
      <div className="relative w-40 h-40 mx-auto p-2">
        {/* 원형 가이드 라인 */}
        <div 
          className="absolute border-2 border-dashed opacity-30 rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: centerX - radius,
            top: centerY - radius,
            borderColor: config.color
          }}
        />
        
        <AnimatePresence>
          {sortedItems.map((item, index) => {
            const angle = (index * 360) / effectiveMaxSize
            const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180)
            const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180)
            
            return (
              <motion.div
                key={item.id}
                variants={queueAnimationVariants.circular}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute w-8 h-8"
                style={{ left: x - 16, top: y - 16 }}
                onClick={() => onItemClick?.(item)}
              >
                <QueueItemCard 
                  item={item} 
                  config={config}
                  isHighlighted={highlightedItem === item.id}
                  colorPalette={colorPalette}
                  compact
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    )
  }

  const renderDequeQueue = () => (
    <div className="flex flex-row gap-2 p-4 overflow-x-auto">
      <AnimatePresence>
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={queueAnimationVariants.deque}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-shrink-0"
            onClick={() => onItemClick?.(item)}
          >
            <QueueItemCard 
              item={item} 
              config={config}
              isHighlighted={highlightedItem === item.id}
              colorPalette={colorPalette}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  const renderPriorityQueue = () => (
    <div className="flex flex-col gap-1 p-4">
      <AnimatePresence>
        {sortedItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={queueAnimationVariants.priority}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
            style={{ marginLeft: `${(item.priority || 0) * 8}px` }}
            onClick={() => onItemClick?.(item)}
          >
            <QueueItemCard 
              item={item} 
              config={config}
              isHighlighted={highlightedItem === item.id}
              colorPalette={colorPalette}
              showPriority
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border overflow-hidden ${className}`}
         style={{ borderColor: colorPalette.light }}>
      {/* 헤더 */}
      {showHeader && (
        <div className="p-2 border-b border-slate-200 dark:border-slate-700"
             style={{ backgroundColor: colorPalette.light }}>
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4 flex-shrink-0" style={{ color: config.color }} />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
                {queueType === 'callstack' ? '현재 대출함' : queueType === 'microtask' ? '긴급 반납대' : queueType === 'macrotask' ? '일반 반납대' : config.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {items.length}/{effectiveMaxSize}
              </p>
            </div>
            {isExecuting && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full animate-pulse"
                     style={{ backgroundColor: config.color }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 큐 내용 */}
      <div className="h-48 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <div className="text-center">
              <IconComponent className="h-6 w-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">비어있음</p>
            </div>
          </div>
        ) : (
          renderQueueItems()
        )}
      </div>

      {/* 푸터 정보 */}
      <div className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <span>{config.fifo ? 'FIFO' : 'LIFO'}</span>
          <span>{items.length}</span>
        </div>
      </div>
    </div>
  )
}

// 큐 아이템 카드 컴포넌트
interface QueueItemCardProps {
  item: QueueItem
  config: QueueVisualConfig
  isHighlighted: boolean
  colorPalette: { primary: string; secondary: string; light: string; dark: string }
  compact?: boolean
  showPriority?: boolean
}

function QueueItemCard({ 
  item, 
  config, 
  isHighlighted, 
  colorPalette, 
  compact = false,
  showPriority = false 
}: QueueItemCardProps) {
  return (
    <div 
      className={`relative rounded shadow-sm border cursor-pointer transition-transform hover:scale-105 ${
        compact ? 'w-8 h-8 p-1' : 'w-full min-h-[40px] p-2'
      }`}
      style={{ 
        backgroundColor: colorPalette.primary,
        borderColor: isHighlighted ? '#fbbf24' : colorPalette.secondary
      }}
    >
      {/* 하이라이트 효과 */}
      {isHighlighted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded border-2 border-yellow-400"
        />
      )}

      {/* 내용 */}
      <div className="relative h-full flex items-center justify-center text-white">
        {compact ? (
          <span className="text-xs font-medium">
            {item.functionName.charAt(0)}
          </span>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs truncate">
                {item.functionName}
              </span>
              {showPriority && item.priority !== undefined && (
                <span className="text-xs bg-white bg-opacity-20 px-1 rounded ml-1">
                  P{item.priority}
                </span>
              )}
            </div>
            {item.returnValue !== undefined && (
              <div className="text-xs opacity-80 mt-0.5 truncate">
                → {String(item.returnValue)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}