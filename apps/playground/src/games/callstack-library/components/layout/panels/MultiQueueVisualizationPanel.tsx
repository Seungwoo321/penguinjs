// 다중 큐 시각화 패널 (Layout B용)
// 콜스택, 마이크로태스크, 매크로태스크 큐를 동시에 표시

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { MultiQueueVisualizationPanelProps } from '../../../types/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, BookOpen, Book, ArrowRight, Calendar, Users } from 'lucide-react'

/**
 * 다중 큐 시각화 패널
 * Layout B에서 이벤트 루프의 3개 큐를 동시에 표시하는 도서관 스타일
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
      title="📚 콜스택 도서관" 
      className={cn("flex flex-col overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20", className)}
    >
      {/* 도서관 헤더 - 나무 텍스처 스타일 */}
      <div className="px-4 py-3 border-b border-amber-300/50 dark:border-amber-700/50 flex-shrink-0 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              콜스택 도서관 시스템
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-2">
              <Users className="w-3 h-3" />
              처리 순서: 메인 서가 → 긴급 처리대 → 예약 처리대
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            {isExecuting && (
              <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                사서 처리 중
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 메인 도서관 시각화 영역 - 나무 텍스처 배경 */}
      <div className="flex-1 p-4 overflow-hidden relative">
        {/* 나무 바닥 패턴 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(139, 69, 19, 0.1) 40px,
              rgba(139, 69, 19, 0.1) 41px
            ), repeating-linear-gradient(
              0deg,
              transparent,
              transparent 80px,
              rgba(139, 69, 19, 0.05) 80px,
              rgba(139, 69, 19, 0.05) 81px
            )`
          }}
        />
        
        <div className="grid grid-rows-3 gap-4 h-full relative z-10">
          
          {/* 콜스택 영역 - 메인 서가 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'callstack' && "ring-2 ring-amber-400 ring-opacity-50 rounded-xl shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'callstack' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="📚 메인 서가"
              subtitle="현재 처리 중인 도서들 (LIFO)"
              queueType="callstack"
              items={queueStates.callstack}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'callstack'}
              onItemClick={handleQueueItemClick('callstack')}
              maxSize={maxSize}
              emptyMessage="메인 서가가 비어있습니다"
            />
          </motion.div>

          {/* 마이크로태스크 큐 - 긴급 처리대 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'microtask' && "ring-2 ring-blue-400 ring-opacity-50 rounded-xl shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'microtask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="⚡ 긴급 처리대"
              subtitle="Promise 반납, 즉시 처리 요청"
              queueType="microtask"
              items={queueStates.microtask}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'microtask'}
              onItemClick={handleQueueItemClick('microtask')}
              maxSize={maxSize}
              emptyMessage="긴급 처리 대기 도서가 없습니다"
            />
          </motion.div>

          {/* 매크로태스크 큐 - 예약 처리대 */}
          <motion.div
            className={cn(
              "relative",
              highlightedQueue === 'macrotask' && "ring-2 ring-orange-400 ring-opacity-50 rounded-xl shadow-lg"
            )}
            animate={{
              scale: highlightedQueue === 'macrotask' ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <QueueSection
              title="📅 예약 처리대"
              subtitle="시간 예약, 정기 대출 도서"
              queueType="macrotask"
              items={queueStates.macrotask}
              isExecuting={isExecuting}
              isHighlighted={highlightedQueue === 'macrotask'}
              onItemClick={handleQueueItemClick('macrotask')}
              maxSize={maxSize}
              emptyMessage="예약된 도서가 없습니다"
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
      {/* 큐 헤더 - 도서관 섹션 스타일 */}
      <div className={cn(
        "mb-3 p-3 rounded-xl shadow-md relative overflow-hidden",
        queueType === 'callstack' ? "bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800/40 dark:to-orange-800/40" :
        queueType === 'microtask' ? "bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800/40 dark:to-cyan-800/40" :
        "bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-800/40 dark:to-red-800/40"
      )}>
        {/* 나무 텍스처 오버레이 */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 69, 19, 0.1) 10px,
              rgba(139, 69, 19, 0.1) 11px
            )`
          }}
        />
        <h3 className={cn(
          "text-lg font-bold text-center relative z-10 flex items-center justify-center gap-2",
          queueType === 'callstack' ? "text-amber-900 dark:text-amber-100" :
          queueType === 'microtask' ? "text-blue-900 dark:text-blue-100" :
          "text-orange-900 dark:text-orange-100"
        )}>
          {queueType === 'callstack' && <Book className="w-5 h-5" />}
          {queueType === 'microtask' && <Zap className="w-5 h-5" />}
          {queueType === 'macrotask' && <Calendar className="w-5 h-5" />}
          {title}
        </h3>
        <p className={cn(
          "text-xs text-center relative z-10",
          queueType === 'callstack' ? "text-amber-700 dark:text-amber-300" :
          queueType === 'microtask' ? "text-blue-700 dark:text-blue-300" :
          "text-orange-700 dark:text-orange-300"
        )}>
          {subtitle}
        </p>
      </div>

      {/* 큐 내용 - 도서관 스타일 */}
      {queueType === 'callstack' ? (
        /* 콜스택: 나무 책장 */
        <div className="relative bg-gradient-to-b from-amber-900 to-amber-950 rounded-xl p-6 shadow-xl h-full border-2 border-amber-800/50">
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
                <div className="text-center p-6 bg-amber-100/20 dark:bg-amber-900/20 rounded-xl shadow-lg backdrop-blur-sm border border-amber-300/30">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-amber-100 text-sm font-medium">
                    {emptyMessage}
                  </p>
                  <p className="text-amber-200/70 text-xs mt-1">
                    사서가 대기 중입니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 마이크로태스크/매크로태스크: 도서관 반납대 스타일 */
        <div className={cn(
          "rounded-xl shadow-lg overflow-hidden h-full relative",
          queueType === 'microtask' 
            ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-300/50 dark:border-blue-700/50"
            : "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-300/50 dark:border-orange-700/50"
        )}>
          {/* 나무 패널 헤더 */}
          <div className={cn(
            "p-3 border-b relative overflow-hidden",
            queueType === 'microtask' 
              ? "bg-gradient-to-r from-blue-300/50 to-cyan-300/50 dark:from-blue-800/50 dark:to-cyan-800/50 border-blue-400/50 dark:border-blue-600/50" 
              : "bg-gradient-to-r from-orange-300/50 to-red-300/50 dark:from-orange-800/50 dark:to-red-800/50 border-orange-400/50 dark:border-orange-600/50"
          )}>
            {/* 나무 텍스처 */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 20px,
                  rgba(139, 69, 19, 0.1) 20px,
                  rgba(139, 69, 19, 0.1) 21px
                )`
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <h4 className={cn(
                "font-medium text-sm flex items-center gap-2",
                queueType === 'microtask' 
                  ? "text-blue-900 dark:text-blue-100" 
                  : "text-orange-900 dark:text-orange-100"
              )}>
                {queueType === 'microtask' ? (
                  <><Zap className="w-4 h-4" /> 긴급 처리함</>
                ) : (
                  <><Clock className="w-4 h-4" /> 예약 도서함</>
                )}
              </h4>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                queueType === 'microtask' 
                  ? "bg-blue-200 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                  : "bg-orange-200 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
              )}>
                {items.length} / {maxSize}
              </span>
            </div>
          </div>
          <div className="p-4 min-h-[200px] relative">
            {/* 반납대 나무 질감 */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)`
              }}
            />
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className={cn(
                  "text-center p-4 rounded-lg",
                  queueType === 'microtask' 
                    ? "bg-blue-100/50 dark:bg-blue-900/20" 
                    : "bg-orange-100/50 dark:bg-orange-900/20"
                )}>
                  {queueType === 'microtask' ? (
                    <Zap className="h-8 w-8 mx-auto mb-2 text-blue-400 dark:text-blue-500" />
                  ) : (
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-400 dark:text-orange-500" />
                  )}
                  <p className={cn(
                    "text-sm font-medium",
                    queueType === 'microtask' 
                      ? "text-blue-700 dark:text-blue-300" 
                      : "text-orange-700 dark:text-orange-300"
                  )}>{emptyMessage}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    queueType === 'microtask' 
                      ? "text-blue-600/70 dark:text-blue-400/70" 
                      : "text-orange-600/70 dark:text-orange-400/70"
                  )}>
                    {queueType === 'microtask' ? '긴급 처리 대기 중' : '예약 시간 대기 중'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: -50, opacity: 0, scale: 0.9 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: 50, opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      onClick={() => onItemClick(item)}
                    >
                      <div className={cn(
                        "rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden transform hover:scale-105",
                        queueType === 'microtask' 
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      )}>
                        {/* 도서 카드 텍스처 */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)`
                          }}
                        />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            <span className="font-mono text-sm font-medium">{item.functionName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {queueType === 'microtask' && <Zap className="w-3 h-3" />}
                            {queueType === 'macrotask' && <Clock className="w-3 h-3" />}
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        
                        {/* 도서 분류 태그 */}
                        <div className="mt-2 flex gap-1">
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                            {queueType === 'microtask' ? '긴급' : '예약'}
                          </span>
                          {item.delay && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                              {item.delay}ms
                            </span>
                          )}
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
    <div className="px-4 py-3 border-t border-amber-300/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 flex-shrink-0">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1">
            <Users className="w-4 h-4" />
            사서 업무 순서:
          </span>
          <div className="flex items-center gap-2">
            <StepIndicator 
              label="1. 메인 서가" 
              icon={<Book className="w-3 h-3" />}
              isActive={nextQueue === 'callstack'}
              isCompleted={false}
              isEmpty={queueStates.callstack.length === 0}
            />
            <ArrowRight className="text-amber-600 dark:text-amber-400 w-4 h-4" />
            <StepIndicator 
              label="2. 긴급 처리대" 
              icon={<Zap className="w-3 h-3" />}
              isActive={nextQueue === 'microtask'}
              isCompleted={false}
              isEmpty={queueStates.microtask.length === 0}
            />
            <ArrowRight className="text-amber-600 dark:text-amber-400 w-4 h-4" />
            <StepIndicator 
              label="3. 예약 처리대" 
              icon={<Calendar className="w-3 h-3" />}
              isActive={nextQueue === 'macrotask'}
              isCompleted={false}
              isEmpty={queueStates.macrotask.length === 0}
            />
          </div>
        </div>
        <div className="text-amber-700 dark:text-amber-300">
          {isExecuting ? (
            <span className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="font-medium">사서 처리 중</span>
            </span>
          ) : (
            <span className="bg-amber-200 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              다음 처리: <span className="font-medium">
                {nextQueue ? 
                  nextQueue === 'callstack' ? '메인 서가' :
                  nextQueue === 'microtask' ? '긴급 처리대' : '예약 처리대'
                  : '모든 업무 완료'
                }
              </span>
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
  icon?: React.ReactNode
  isActive: boolean
  isCompleted: boolean
  isEmpty?: boolean
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ label, icon, isActive, isCompleted, isEmpty = false }) => {
  return (
    <span className={cn(
      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm",
      isActive && "bg-gradient-to-r from-amber-300 to-orange-300 text-amber-900 dark:from-amber-700 dark:to-orange-700 dark:text-amber-100 shadow-amber-300/50 scale-105",
      isEmpty && !isActive && "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 opacity-60",
      !isActive && !isEmpty && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
    )}>
      {icon}
      {label}
      {isEmpty && !isActive && (
        <span className="ml-1 text-xs opacity-60">(비어있음)</span>
      )}
    </span>
  )
}