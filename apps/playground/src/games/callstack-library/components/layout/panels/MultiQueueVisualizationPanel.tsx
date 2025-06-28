// 다중 큐 시각화 패널 (Layout B용)
// 콜스택, 마이크로태스크, 매크로태스크 큐를 동시에 표시

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { MultiQueueVisualizationPanelProps } from '../../../types/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

/**
 * 다중 큐 시각화 패널
 * Layout B에서 이벤트 루프의 3개 큐를 동시에 표시하는 Stage 7 스타일
 */
export const MultiQueueVisualizationPanel: React.FC<MultiQueueVisualizationPanelProps> = ({
  queueStates,
  isExecuting,
  highlightedQueue,
  onQueueItemClick,
  maxSize = 8,
  className
}) => {
  
  const handleQueueItemClick = (queueType: 'callstack' | 'microtask' | 'macrotask') => {
    return (item: any) => {
      onQueueItemClick?.(queueType, item)
    }
  }

  return (
    <GamePanel 
      title="🔄 JavaScript 이벤트 루프" 
      className={cn("flex flex-col overflow-hidden", className)}
    >
      {/* 이벤트 루프 헤더 - Stage 7 스타일 */}
      <div className="px-4 py-3 border-b border-editor-border flex-shrink-0 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              🔄 JavaScript 이벤트 루프
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              처리 순서: 콜스택 → 마이크로태스크 → 매크로태스크
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isExecuting && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                실행 중
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 메인 이벤트 루프 시각화 영역 - Stage 7 스타일 */}
      <div className="flex-1 p-4 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div className="grid grid-rows-3 gap-4 h-full">
          
          {/* 콜스택 영역 - 가장 상단 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'callstack' && "ring-2 ring-blue-400 ring-opacity-50 rounded-lg"
            )}
            animate={{
              scale: highlightedQueue === 'callstack' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="📚 콜스택 (LIFO)"
              subtitle="현재 실행 중인 함수들"
              queueType="callstack"
              items={queueStates.callstack}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'callstack'}
              onItemClick={handleQueueItemClick('callstack')}
              maxSize={maxSize}
              emptyMessage="콜스택이 비어있습니다"
            />
          </motion.div>

          {/* 마이크로태스크 큐 - 중간 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'microtask' && "ring-2 ring-green-400 ring-opacity-50 rounded-lg"
            )}
            animate={{
              scale: highlightedQueue === 'microtask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="⚡ 마이크로태스크 큐"
              subtitle="Promise.then(), queueMicrotask()"
              queueType="microtask"
              items={queueStates.microtask}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'microtask'}
              onItemClick={handleQueueItemClick('microtask')}
              maxSize={maxSize}
              emptyMessage="마이크로태스크 큐가 비어있습니다"
            />
          </motion.div>

          {/* 매크로태스크 큐 - 하단 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'macrotask' && "ring-2 ring-yellow-400 ring-opacity-50 rounded-lg"
            )}
            animate={{
              scale: highlightedQueue === 'macrotask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="🕐 매크로태스크 큐"
              subtitle="setTimeout(), setInterval()"
              queueType="macrotask"
              items={queueStates.macrotask}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'macrotask'}
              onItemClick={handleQueueItemClick('macrotask')}
              maxSize={maxSize}
              emptyMessage="매크로태스크 큐가 비어있습니다"
            />
          </motion.div>

        </div>
      </div>

      {/* 도서관 처리 순서 가이드 */}
      <LibraryProcessingGuide 
        queueStates={queueStates}
        isExecuting={isExecuting}
      />
    </GamePanel>
  )
}

// 함수별 색상 매핑
function getFunctionColor(functionName: string): string {
  const colors: Record<string, string> = {
    '<global>': 'rgb(107, 114, 128)',
    'main': 'rgb(59, 130, 246)',
    'setTimeout': 'rgb(239, 68, 68)',
    'queueMicrotask': 'rgb(34, 197, 94)',
    'Promise': 'rgb(168, 85, 247)',
    'console.log': 'rgb(251, 146, 60)',
  }
  return colors[functionName] || 'rgb(59, 130, 246)'
}

/**
 * 개별 큐 섹션 컴포넌트 - Stage 7 스타일
 */
interface QueueSectionProps {
  title: string
  subtitle: string
  queueType: 'callstack' | 'microtask' | 'macrotask'
  items: any[]
  isExecuting: boolean
  isHighlighted: boolean
  onItemClick: (item: any) => void
  maxSize: number
  emptyMessage: string
}

const QueueSection: React.FC<QueueSectionProps> = ({
  title,
  subtitle,
  queueType,
  items,
  isExecuting,
  isHighlighted,
  onItemClick,
  maxSize,
  emptyMessage
}) => {
  
  return (
    <div className="h-full relative group">
      {/* 큐 헤더 - Stage 7 스타일 */}
      <div className={cn(
        "mb-3 p-3 rounded-xl",
        queueType === 'callstack' ? "bg-amber-100 dark:bg-amber-900/20" :
        queueType === 'microtask' ? "bg-blue-100 dark:bg-blue-900/20" :
        "bg-gray-100 dark:bg-gray-800/20"
      )}>
        <h3 className={cn(
          "text-lg font-bold text-center",
          queueType === 'callstack' ? "text-amber-800 dark:text-amber-200" :
          queueType === 'microtask' ? "text-blue-800 dark:text-blue-200" :
          "text-gray-700 dark:text-gray-300"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-xs text-center",
          queueType === 'callstack' ? "text-amber-700 dark:text-amber-300" :
          queueType === 'microtask' ? "text-blue-700 dark:text-blue-300" :
          "text-gray-600 dark:text-gray-400"
        )}>
          {subtitle}
        </p>
      </div>

      {/* 큐 내용 - Stage 7 스타일 */}
      {queueType === 'callstack' ? (
        /* 콜스택: 검은 배경 */
        <div className="relative bg-black rounded-xl p-6 shadow-xl h-full">
          <div className="relative h-full flex flex-col justify-end">
            
            {/* 책들 (스택 아이템) - Stage 7 스타일 */}
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ x: -100, opacity: 0, rotateY: -15 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    rotateY: 0,
                    y: 0
                  }}
                  exit={{ x: 100, opacity: 0, rotateY: 15 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.03
                  }}
                  className="absolute left-4 right-4"
                  style={{
                    bottom: `${16 + index * 60}px`,
                    height: `60px`,
                    zIndex: items.length - index + 10,
                    perspective: '1000px'
                  }}
                >
                  <div 
                    className="h-full rounded-lg shadow-xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 cursor-pointer"
                    onClick={() => onItemClick(item)}
                    style={{ 
                      backgroundColor: getFunctionColor(item.functionName),
                      backgroundImage: `
                        linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
                        linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)
                      `,
                      boxShadow: `
                        0 8px 16px rgba(0, 0, 0, 0.2),
                        inset 2px 0 4px rgba(255, 255, 255, 0.3),
                        inset -2px 0 4px rgba(0, 0, 0, 0.2)
                      `
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
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
                      }}
                    />
                    
                    <span className="text-white font-mono text-xs font-bold ml-3 mr-2 drop-shadow-lg relative z-10 break-all flex items-center gap-1">
                      {item.functionName}
                    </span>
                    
                    {/* 책 페이지 효과 */}
                    <div className="absolute right-1 top-1 bottom-1 w-1 bg-white/80 rounded-r-sm shadow-sm" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* 빈 스택 메시지 */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 100 }}>
                <div className="text-center p-6 bg-white/10 dark:bg-white/5 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-200 text-sm font-medium">
                    {emptyMessage}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 마이크로태스크/매크로태스크: Stage 7 스타일 카드 */
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
          <div className={cn(
            "p-3 border-b",
            queueType === 'microtask' 
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700" 
              : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
          )}>
            <div className="flex items-center justify-between">
              <h4 className={cn(
                "font-medium text-sm",
                queueType === 'microtask' 
                  ? "text-blue-900 dark:text-blue-100" 
                  : "text-gray-900 dark:text-gray-100"
              )}>
                {queueType === 'microtask' ? '마이크로태스크 큐' : '매크로태스크 큐'}
              </h4>
              <span className={cn(
                "text-xs",
                queueType === 'microtask' 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400"
              )}>
                {items.length} / 10
              </span>
            </div>
          </div>
          <div className="p-4 min-h-[200px]">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  {queueType === 'microtask' ? (
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  ) : (
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  )}
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 50, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onItemClick(item)}
                    >
                      <div className={cn(
                        "rounded-md p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                        queueType === 'microtask' 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-500 text-white"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">{item.functionName}</span>
                          <span className="text-xs opacity-75">#{index + 1}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 도서관 처리 순서 가이드
 */
interface LibraryProcessingGuideProps {
  queueStates: any
  isExecuting: boolean
}

const LibraryProcessingGuide: React.FC<LibraryProcessingGuideProps> = ({
  queueStates,
  isExecuting
}) => {
  const getNextExecutionQueue = () => {
    if (queueStates.callstack.length > 0) return 'callstack'
    if (queueStates.microtask.length > 0) return 'microtask'
    if (queueStates.macrotask.length > 0) return 'macrotask'
    return null
  }

  const nextQueue = getNextExecutionQueue()

  return (
    <div className="px-4 py-3 border-t border-editor-border bg-surface-secondary flex-shrink-0">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-medium text-game-text">처리 순서:</span>
          <div className="flex items-center gap-2">
            <StepIndicator 
              label="1. 콜스택" 
              isActive={nextQueue === 'callstack'}
              isCompleted={false}
              isEmpty={queueStates.callstack.length === 0}
            />
            <span className="text-game-text-secondary">→</span>
            <StepIndicator 
              label="2. 마이크로태스크" 
              isActive={nextQueue === 'microtask'}
              isCompleted={false}
              isEmpty={queueStates.microtask.length === 0}
            />
            <span className="text-game-text-secondary">→</span>
            <StepIndicator 
              label="3. 매크로태스크" 
              isActive={nextQueue === 'macrotask'}
              isCompleted={false}
              isEmpty={queueStates.macrotask.length === 0}
            />
          </div>
        </div>
        <div className="text-game-text-secondary">
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              처리 중
            </span>
          ) : (
            <span>
              다음: {nextQueue ? 
                nextQueue === 'callstack' ? '콜스택' :
                nextQueue === 'microtask' ? '마이크로태스크' : '매크로태스크'
                : '완료'
              }
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 실행 단계 표시기
 */
interface StepIndicatorProps {
  label: string
  isActive: boolean
  isCompleted: boolean
  isEmpty?: boolean
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ label, isActive, isCompleted, isEmpty = false }) => {
  return (
    <span className={cn(
      "px-2 py-1 rounded text-xs font-medium transition-all",
      isActive && "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      isEmpty && !isActive && "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 opacity-75",
      !isActive && !isEmpty && "text-game-text-secondary"
    )}>
      {label}
      {isEmpty && !isActive && (
        <span className="ml-1 text-xs opacity-60">(빈 큐)</span>
      )}
    </span>
  )
}