'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CallStackGameState, QueueType, QueueItem } from './types'
import { CallStackBoard } from './CallStackBoard'
import { UniversalQueueBoard } from './UniversalQueueBoard'
import { queueVisualConfigs, getExecutionOrder } from './queue-configs'
import { 
  Layers, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface EnhancedCallStackBoardProps {
  gameState: CallStackGameState
  activeQueueTypes?: QueueType[]
  isExecuting: boolean
  onQueueItemClick?: (queueType: QueueType, item: QueueItem) => void
  onExecuteStep?: () => void
  onReset?: () => void
  showExecutionFlow?: boolean
  className?: string
}

export function EnhancedCallStackBoard({
  gameState,
  activeQueueTypes = ['callstack'],
  isExecuting,
  onQueueItemClick,
  onExecuteStep,
  onReset,
  showExecutionFlow = true,
  className = ''
}: EnhancedCallStackBoardProps) {
  const [visibleQueues, setVisibleQueues] = useState<Set<QueueType>>(new Set(activeQueueTypes))
  const [executionFlowVisible, setExecutionFlowVisible] = useState(showExecutionFlow)
  const [currentExecutingQueue, setCurrentExecutingQueue] = useState<QueueType | null>(null)

  // 활성 큐 타입이 변경될 때 visibleQueues 업데이트
  useEffect(() => {
    setVisibleQueues(new Set(activeQueueTypes))
  }, [activeQueueTypes])

  // 실행 중인 큐 하이라이트
  useEffect(() => {
    if (gameState.currentlyExecutingQueue) {
      setCurrentExecutingQueue(gameState.currentlyExecutingQueue)
      const timer = setTimeout(() => setCurrentExecutingQueue(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState.currentlyExecutingQueue])

  const toggleQueueVisibility = (queueType: QueueType) => {
    const newVisibleQueues = new Set(visibleQueues)
    if (newVisibleQueues.has(queueType)) {
      newVisibleQueues.delete(queueType)
    } else {
      newVisibleQueues.add(queueType)
    }
    setVisibleQueues(newVisibleQueues)
  }

  const getExecutionPriority = () => {
    const queueTypes = Array.from(visibleQueues)
    return getExecutionOrder(queueTypes)
  }

  const hasItemsInQueue = (queueType: QueueType): boolean => {
    return (gameState.queues[queueType]?.length || 0) > 0
  }

  const getTotalQueueItems = (): number => {
    return Array.from(visibleQueues).reduce((total, queueType) => {
      return total + (gameState.queues[queueType]?.length || 0)
    }, 0)
  }

  const getQueueGridClass = (): string => {
    const queueCount = Array.from(visibleQueues).filter(queueType => queueType !== 'callstack').length
    
    switch (queueCount) {
      case 1:
        return 'grid-cols-1 max-w-lg mx-auto'
      case 2:
        return 'grid-cols-2 gap-6'  // 고급2: 마이크로태스크 + 매크로태스크
      case 3:
        return 'grid-cols-3 gap-4'
      case 4:
        return 'grid-cols-2 lg:grid-cols-4 gap-3'
      case 5:
        return 'grid-cols-2 lg:grid-cols-3 gap-3'
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
    }
  }

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* 컨트롤 패널 */}
      <div className="bg-[rgb(var(--surface-elevated))] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100">
              큐 시스템 제어
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExecutionFlowVisible(!executionFlowVisible)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title={executionFlowVisible ? "실행 흐름 숨기기" : "실행 흐름 보기"}
            >
              {executionFlowVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
            
            {onExecuteStep && (
              <button
                onClick={onExecuteStep}
                disabled={isExecuting}
                className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-xs transition-colors flex items-center gap-1"
              >
                {isExecuting ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isExecuting ? '실행중' : '실행'}
              </button>
            )}
            
            {onReset && (
              <button
                onClick={onReset}
                className="p-1.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="리셋"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* 큐 토글 버튼들 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeQueueTypes.map(queueType => {
            const config = queueVisualConfigs[queueType]
            const isVisible = visibleQueues.has(queueType)
            const hasItems = hasItemsInQueue(queueType)
            const isExecuting = currentExecutingQueue === queueType
            
            return (
              <button
                key={queueType}
                onClick={() => toggleQueueVisibility(queueType)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  isVisible 
                    ? 'text-white shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                } ${isExecuting ? 'ring-1 ring-yellow-400' : ''}`}
                style={isVisible ? { backgroundColor: config.color } : {}}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs">{config.icon}</span>
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="sm:hidden">{queueType}</span>
                  {hasItems && (
                    <span className="bg-white bg-opacity-20 px-1 py-0.5 rounded text-xs">
                      {gameState.queues[queueType]?.length || 0}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 실행 우선순위 표시 */}
        {executionFlowVisible && (
          <div className="bg-[rgb(var(--surface-secondary))] rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Settings className="h-3 w-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                실행 순서
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {getExecutionPriority().map((queueType, index) => {
                const config = queueVisualConfigs[queueType]
                return (
                  <React.Fragment key={queueType}>
                    <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                         style={{ backgroundColor: config.color + '20', color: config.color }}>
                      <span className="text-xs">{config.icon}</span>
                      <span className="hidden sm:inline">{config.name}</span>
                      <span className="sm:hidden">{queueType}</span>
                    </div>
                    {index < getExecutionPriority().length - 1 && (
                      <ArrowRight className="h-2 w-2 text-slate-400" />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}

        {/* 통계 정보 */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span>총 아이템: {getTotalQueueItems()}</span>
          <span>활성: {visibleQueues.size}/{activeQueueTypes.length}</span>
        </div>
      </div>

      {/* 메인 레이아웃: 스테이지별 특별 레이아웃 */}
      {activeQueueTypes.includes('microtask') && activeQueueTypes.includes('macrotask') && activeQueueTypes.length === 3 ? (
        // 고급2 스테이지: 다른 스테이지와 일관된 레이아웃
        <div className="space-y-4">
          {/* 상단: 콜스택 책장 - 전체 너비 */}
          <CallStackBoard
            stack={gameState.currentStack}
            maxStackSize={100}
            isExecuting={isExecuting}
            stackOverflow={gameState.stackOverflow}
            currentFunction={gameState.currentFunction}
          />
          
          {/* 중단: 긴급 반납대(마이크로태스크)와 일반 반납대(매크로태스크) */}
          <div className="grid grid-cols-2 gap-4">
            <UniversalQueueBoard
              queueType="microtask"
              items={gameState.queues.microtask || []}
              isExecuting={isExecuting && currentExecutingQueue === 'microtask'}
              onItemClick={(item) => onQueueItemClick?.('microtask', item)}
              showHeader={true}
              className="h-48"
            />
            <UniversalQueueBoard
              queueType="macrotask"
              items={gameState.queues.macrotask || []}
              isExecuting={isExecuting && currentExecutingQueue === 'macrotask'}
              onItemClick={(item) => onQueueItemClick?.('macrotask', item)}
              showHeader={true}
              className="h-48"
            />
          </div>
        </div>
      ) : activeQueueTypes.length === 5 && activeQueueTypes.includes('animation') ? (
        // 고급9 스테이지: 5개 큐 특별 레이아웃
        <div className="grid grid-cols-3 gap-3">
          {/* 첫 번째 행: 콜스택 (전체 너비) */}
          <div className="col-span-3">
            <CallStackBoard
              stack={gameState.currentStack}
              maxStackSize={100}
              isExecuting={isExecuting}
              stackOverflow={gameState.stackOverflow}
              currentFunction={gameState.currentFunction}
            />
          </div>
          
          {/* 두 번째 행: 3개 큐 */}
          <UniversalQueueBoard
            queueType="microtask"
            items={gameState.queues.microtask || []}
            isExecuting={isExecuting && currentExecutingQueue === 'microtask'}
            onItemClick={(item) => onQueueItemClick?.('microtask', item)}
            showHeader={true}
            className="h-48"
          />
          <UniversalQueueBoard
            queueType="macrotask"
            items={gameState.queues.macrotask || []}
            isExecuting={isExecuting && currentExecutingQueue === 'macrotask'}
            onItemClick={(item) => onQueueItemClick?.('macrotask', item)}
            showHeader={true}
            className="h-48"
          />
          <UniversalQueueBoard
            queueType="animation"
            items={gameState.queues.animation || []}
            isExecuting={isExecuting && currentExecutingQueue === 'animation'}
            onItemClick={(item) => onQueueItemClick?.('animation', item)}
            showHeader={true}
            className="h-48"
          />
          
          {/* 세 번째 행: 1개 큐 (중앙 정렬) */}
          <div className="col-start-2">
            <UniversalQueueBoard
              queueType="priority"
              items={gameState.queues.priority || []}
              isExecuting={isExecuting && currentExecutingQueue === 'priority'}
              onItemClick={(item) => onQueueItemClick?.('priority', item)}
              showHeader={true}
              className="h-48"
            />
          </div>
        </div>
      ) : (
        // 다른 스테이지들: 기본 레이아웃
        <div className="space-y-4">
          {/* 상단: 콜스택 책장 - 전체 너비 (항상 표시) */}
          <CallStackBoard
            stack={gameState.currentStack}
            maxStackSize={100}
            isExecuting={isExecuting}
            stackOverflow={gameState.stackOverflow}
            currentFunction={gameState.currentFunction}
          />

          {/* 하단: 다른 큐들 (콜스택 제외) */}
          {Array.from(visibleQueues).filter(q => q !== 'callstack').length > 0 && (
            <div className={`grid ${getQueueGridClass()}`}>
              {Array.from(visibleQueues)
                .filter(queueType => queueType !== 'callstack')
                .map(queueType => (
                  <UniversalQueueBoard
                    key={queueType}
                    queueType={queueType}
                    items={gameState.queues[queueType] || []}
                    isExecuting={isExecuting && currentExecutingQueue === queueType}
                    onItemClick={(item) => onQueueItemClick?.(queueType, item)}
                    showHeader={true}
                    className="h-48"
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* 디버그 정보 (개발 중에만 표시) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-[rgb(var(--surface-secondary))] rounded p-2">
          <summary className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            디버그 정보
          </summary>
          <pre className="mt-1 text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-32">
            {JSON.stringify({
              visible: Array.from(visibleQueues),
              executing: currentExecutingQueue,
              sizes: Object.fromEntries(
                Object.entries(gameState.queues).map(([key, value]) => [key, value.length])
              ),
              order: gameState.executionOrder.slice(-5) // 최근 5개만
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}