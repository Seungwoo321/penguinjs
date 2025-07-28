'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { StackItem, QueueType } from './types'
import { GripVertical, X, BookOpen, ArrowRight, Clock, Zap } from 'lucide-react'
import { getBookDimensions, BOOK_CONFIG } from './constants/bookConfig'
import { getBookAnimationConfig, AnimationSpeed, ANIMATION_CONFIG } from './constants/animationConfig'

interface IntegratedCallStackBoardProps {
  stack: StackItem[]
  maxStackSize: number
  isExecuting: boolean
  stackOverflow: boolean
  currentFunction: string | null
  availableFunctions: (string | {name: string, queueType?: QueueType})[]
  userOrder: string[]
  onOrderChange: (newOrder: string[]) => void
  mode: 'simulation' | 'prediction'
  microtaskQueue?: StackItem[]
  macrotaskQueue?: StackItem[]
  showEventLoop?: boolean
  expandOrderSection?: boolean
  animationSpeed?: AnimationSpeed
}

// 스택 레이아웃 설정
const STACK_CONFIG = {
  SHELF_SPACING: 60,      // 선반 간격 조정
  BOOK_OFFSET: 12,        // 책을 선반 바로 위에 배치
  SHELF_OFFSET: 40,       // 선반 시작 위치
  SHELF_HEIGHT: 36,       // 선반 전체 높이
}


export function IntegratedCallStackBoard({
  stack,
  maxStackSize,
  isExecuting,
  stackOverflow,
  currentFunction,
  availableFunctions,
  userOrder,
  onOrderChange,
  mode,
  microtaskQueue = [],
  macrotaskQueue = [],
  showEventLoop = false,
  expandOrderSection = false,
  animationSpeed = 'normal'
}: IntegratedCallStackBoardProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  
  // 애니메이션 설정 가져오기
  const animationConfig = getBookAnimationConfig(animationSpeed)
  const getAnimationDuration = () => animationConfig
  
  // 사용 가능한 함수 (아직 추가하지 않은 것들)
  const normalizedFunctions = availableFunctions.map(f => 
    typeof f === 'string' ? { name: f } : f
  )
  const functionMap = new Map(normalizedFunctions.map(f => [f.name, f]))
  const remainingFunctions = normalizedFunctions.filter(f => !userOrder.includes(f.name))
  
  // 함수를 예상 순서에 추가
  const addToOrder = (func: string) => {
    if (!userOrder.includes(func) && !isExecuting) {
      onOrderChange([...userOrder, func])
    }
  }
  
  // 예상 순서에서 제거
  const removeFromOrder = (func: string) => {
    if (!isExecuting) {
      onOrderChange(userOrder.filter(f => f !== func))
    }
  }
  
  // 순서 변경
  const handleReorder = (newOrder: string[]) => {
    if (!isExecuting) {
      onOrderChange(newOrder)
    }
  }

  if (showEventLoop) {
    return (
      <div className="space-y-6">
        {/* 이벤트 루프 전체 구조 */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600">
          <h2 className="text-xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">
            🔄 JavaScript 이벤트 루프
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. 콜스택 (왼쪽) - 기존 디자인 유지 */}
            <div className="lg:col-span-1">
              <div className="bg-amber-100 dark:bg-amber-900/20 rounded-xl p-3 mb-3">
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 text-center">
                  📚 콜스택 (LIFO)
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                  현재 실행 중인 함수들
                </p>
              </div>
              
              {/* 콜스택 책장 - 검은색 배경, 선반 없음 */}
              <div className="relative bg-black rounded-xl p-6 shadow-xl" style={{ height: `${Math.max(250, (maxStackSize * STACK_CONFIG.SHELF_SPACING) + 100)}px` }}>
                <div className="relative h-full flex flex-col justify-end">
                    
                  {/* 스택 오버플로우 경고 */}
                  {stackOverflow && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-lg backdrop-blur-sm z-20">
                      <div className="text-center p-4 bg-red-100 dark:bg-red-900/70 rounded-lg shadow-lg">
                        <p className="text-red-800 dark:text-red-200 font-bold text-lg">
                          📚💥 Stack Overflow!
                        </p>
                        <p className="text-red-700 dark:text-red-300 text-sm">
                          책장이 넘쳐났습니다!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 책들 (스택 아이템) - 검은 배경에 쌓이는 형태 */}
                  <AnimatePresence>
                        {stack.map((item, index) => (
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
                              stiffness: getAnimationDuration().stiffness * 2,
                              damping: getAnimationDuration().damping,
                              delay: index * getAnimationDuration().delay
                            }}
                            className="absolute left-4 right-4"
                            style={{
                              // 첫 번째 선반 위치 + 선반 두께 + 이전 책들의 높이
                              bottom: `${(1 * STACK_CONFIG.SHELF_SPACING + 5) + 16 + stack.slice(0, index).reduce((sum, prevItem) => sum + (prevItem.height || 60), 0)}px`,
                              height: `${item.height}px`,
                              zIndex: stack.length - index + 10,
                              perspective: '1000px'
                            }}
                          >
                            <div 
                              className={`h-full rounded-lg shadow-xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 ${
                                currentFunction === item.functionName
                                  ? 'ring-4 ring-yellow-400 animate-pulse scale-105 shadow-yellow-400/50'
                                  : 'hover:scale-102'
                              } ${
                                item.isGlobalContext ? 'border-2 border-dashed border-gray-400' : ''
                              }`}
                              style={{ 
                                backgroundColor: item.isGlobalContext ? 'rgb(107, 114, 128)' : item.color,
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
                              
                              <span 
                                className="font-mono text-xs font-bold ml-3 mr-2 relative z-10 break-all flex items-center gap-1"
                                style={{
                                  color: '#1a1a1a',
                                  textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)'
                                }}
                              >
                                {item.isGlobalContext && <span className="text-xs">📍</span>}
                                {item.functionName}
                              </span>
                              
                              {/* 책 페이지 효과 */}
                              <div className="absolute right-1 top-1 bottom-1 w-1 bg-white/80 rounded-r-sm shadow-sm" />
                            </div>
                          </motion.div>
                        ))}
                  </AnimatePresence>
                  
                  {/* 빈 스택 메시지 */}
                  {stack.length === 0 && !isExecuting && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 100 }}>
                      <div className="text-center p-6 bg-white/10 dark:bg-white/5 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-gray-200 text-sm font-medium">
                          코드를 실행하면 여기에<br/>함수가 책처럼 쌓입니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 책장 아래 상태 표시 영역 */}
              <div className="mt-4 flex items-center justify-between">
                {/* 스택 크기 표시 */}
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium">
                  스택 크기: {stack.length} / {maxStackSize}
                </div>
                
                {/* 실행 상태 표시 */}
                {isExecuting && (
                  <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    실행 중
                  </div>
                )}
              </div>
            </div>
            
            {/* 2. 마이크로태스크 큐 (중간) */}
            <div className="lg:col-span-1">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-3 mb-3">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 text-center">
                  ⚡ 마이크로태스크 큐
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  Promise.then(), queueMicrotask() - FIFO
                </p>
              </div>
              
              {/* 마이크로태스크 큐 - 깔끔한 디자인 */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700 overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-b border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">마이크로태스크 반납대</h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{microtaskQueue.length} / 10</span>
                  </div>
                </div>
                <div className="p-4 min-h-[200px]">
                  {microtaskQueue.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">비어있음</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {microtaskQueue.map((item, index) => (
                          <motion.div
                            key={`micro-${item.id}`}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ duration: animationConfig.delay * ANIMATION_CONFIG.queueAnimation[animationSpeed] }}
                          >
                            <div className="bg-blue-500 text-white rounded-md p-2 shadow-sm hover:shadow-md transition-shadow">
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
            </div>
            
            {/* 3. 매크로태스크 큐 (오른쪽) */}
            <div className="lg:col-span-1">
              <div className="bg-gray-100 dark:bg-gray-800/20 rounded-xl p-3 mb-3">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 text-center">
                  🕐 매크로태스크 큐
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  setTimeout(), setInterval() - FIFO
                </p>
              </div>
              
              {/* 매크로태스크 큐 - 깔끔한 디자인 */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">매크로태스크 반납대</h4>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{macrotaskQueue.length} / 10</span>
                  </div>
                </div>
                <div className="p-4 min-h-[200px]">
                  {macrotaskQueue.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">비어있음</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {macrotaskQueue.map((item, index) => (
                          <motion.div
                            key={`macro-${item.id}`}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ duration: animationConfig.delay * ANIMATION_CONFIG.queueAnimation[animationSpeed] }}
                          >
                            <div className="bg-gray-500 text-white rounded-md p-2 shadow-sm hover:shadow-md transition-shadow">
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
            </div>
          </div>
          
          {/* 실행 순서 설명 */}
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              🔄 이벤트 루프 실행 순서:
            </h4>
            <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>1️⃣ <strong>콜스택</strong>의 모든 동기 코드 실행</li>
              <li>2️⃣ 콜스택이 비면 <strong>마이크로태스크 큐</strong>에서 모든 작업 처리</li>
              <li>3️⃣ 마이크로태스크 큐가 비면 <strong>매크로태스크 큐</strong>에서 하나만 처리</li>
              <li>4️⃣ 1번부터 반복</li>
            </ol>
          </div>
        </div>
        
        {/* 예상 순서 입력 패널 - prediction 모드에서만 표시 */}
        {mode === 'prediction' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-300 dark:border-slate-600 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span>🎯 예상 실행 순서</span>
            <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 font-medium">
              ✨ 함수를 클릭하여 추가하세요:
            </p>
            <div className="flex flex-wrap gap-2">
              {remainingFunctions.map((func) => {
                const queueColors = {
                  microtask: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/40 border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-200',
                  macrotask: 'from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/40 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200',
                  callstack: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/40 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-200'
                }
                const colorClass = queueColors[func.queueType || 'callstack'] || queueColors.callstack
                
                return (
                  <motion.button
                    key={func.name}
                    onClick={() => addToOrder(func.name)}
                    disabled={isExecuting}
                    className={`px-3 py-2 bg-gradient-to-r ${colorClass} border-2 rounded-lg text-sm font-mono font-semibold
                      ${isExecuting 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl'
                      } transition-all duration-200`}
                    whileHover={!isExecuting ? { scale: 1.05 } : {}}
                    whileTap={!isExecuting ? { scale: 0.95 } : {}}
                  >
                    <div className="flex items-center gap-1">
                      {func.queueType === 'microtask' && <span className="text-xs">⚡</span>}
                      {func.queueType === 'macrotask' && <span className="text-xs">🕐</span>}
                      {func.name}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
          
          {/* 예상 순서 리스트 */}
          <div className="h-32 overflow-y-auto">
            {userOrder.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={userOrder}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {userOrder.map((funcName, index) => {
                  const func = functionMap.get(funcName)
                  const queueType = func?.queueType
                  const queueInfo = {
                    microtask: { label: '긴급 반납대', icon: '⚡', color: 'text-purple-600 dark:text-purple-400' },
                    macrotask: { label: '일반 반납대', icon: '🕐', color: 'text-gray-600 dark:text-gray-400' },
                    callstack: { label: '콜스택', icon: '', color: 'text-blue-600 dark:text-blue-400' }
                  }
                  const info = queueInfo[queueType || 'callstack'] || queueInfo.callstack
                  
                  return (
                    <Reorder.Item key={funcName} value={funcName}>
                      <motion.div
                        className={`flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all ${
                          isExecuting ? 'opacity-50' : 'cursor-move hover:scale-102'
                        }`}
                        whileHover={!isExecuting ? { scale: 1.02 } : {}}
                        whileTap={!isExecuting ? { scale: 0.98 } : {}}
                      >
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {index + 1}. {funcName}
                          </span>
                          {queueType && queueType !== 'callstack' && (
                            <span className={`text-xs ${info.color} flex items-center gap-1`}>
                              <span>{info.icon}</span>
                              <span>{info.label}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromOrder(funcName)
                          }}
                          disabled={isExecuting}
                          className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    🎮 위의 함수들을 클릭하거나<br/>
                    드래그해서 순서를 만들어보세요!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    )
  }

  // 기본 모드 (이벤트 루프가 아닌 경우)
  if (expandOrderSection) {
    // 고급2 스테이지 특별 레이아웃
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽 50%: 콜스택 + 반납대들 */}
        <div className="space-y-4">
          {/* 콜스택 책장 영역 */}
          <div>
            {/* 외부 책장 프레임 - 더 깊이 있는 나무 질감 */}
            <div className="relative p-2 rounded-3xl shadow-2xl" style={{
              background: 'linear-gradient(145deg, rgb(139, 69, 19), rgb(101, 50, 13))',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {/* 내부 책장 공간 - 실제 나무 내부 색상 */}
              <div className="relative rounded-2xl p-6" style={{
                background: 'linear-gradient(180deg, rgb(245, 222, 179) 0%, rgb(222, 184, 135) 50%, rgb(210, 180, 140) 100%)',
                boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.2)'
              }}>
                {/* 나무 결 텍스처 */}
                <div 
                  className="absolute inset-0 opacity-20 rounded-2xl"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 8px,
                        rgba(139, 69, 19, 0.3) 8px,
                        rgba(139, 69, 19, 0.3) 9px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 40px,
                        rgba(160, 82, 45, 0.2) 40px,
                        rgba(160, 82, 45, 0.2) 42px
                      )
                    `
                  }}
                />
                
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                  <div className="p-2 bg-orange-200 dark:bg-orange-900/50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-slate-700 dark:text-orange-300" />
                  </div>
                  <span className="font-bold drop-shadow-md text-orange-950 dark:text-yellow-100">
                    콜스택 책장
                  </span>
                </h3>
                
                {/* 책장 내부 공간 */}
                <div className="relative rounded-xl overflow-hidden" style={{
                  height: `${Math.max(250, (maxStackSize * STACK_CONFIG.SHELF_SPACING) + 100)}px`,
                  background: 'linear-gradient(180deg, rgb(222, 184, 135) 0%, rgb(205, 175, 130) 100%)',
                  boxShadow: 'inset 0 6px 12px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(255, 255, 255, 0.1)'
                }}>
                  {/* 책장 깊이 효과 */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/40 via-black/20 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/30 via-black/15 to-transparent" />
                  
                  {/* 책장 선반들 - 더 현실적인 나무 선반 */}
                  {Array.from({ length: maxStackSize }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-2 right-2"
                      style={{ 
                        bottom: `${STACK_CONFIG.SHELF_OFFSET + i * STACK_CONFIG.SHELF_SPACING}px`,
                        zIndex: 1
                      }}
                    >
                      {/* 선반 상판 - 나무 질감 */}
                      <div 
                        className="h-4 relative rounded-sm shadow-lg"
                        style={{
                          background: 'linear-gradient(180deg, rgb(160, 82, 45) 0%, rgb(139, 69, 19) 50%, rgb(120, 60, 15) 100%)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {/* 선반 반사광 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-sm" />
                        {/* 나무 결 */}
                        <div 
                          className="absolute inset-0 opacity-30 rounded-sm"
                          style={{
                            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px)`
                          }}
                        />
                      </div>
                      {/* 선반 전면 */}
                      <div 
                        className="h-2 shadow-sm"
                        style={{ backgroundColor: 'rgb(101, 50, 13)' }}
                      />
                      {/* 선반 아래 그림자 */}
                      <div className="h-3 bg-gradient-to-b from-black/40 to-transparent" />
                    </div>
                  ))}
                  
                  {/* 책들 (스택 아이템) */}
                  <AnimatePresence>
                    {stack.map((item, index) => (
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
                          stiffness: 200,
                          damping: 20,
                          delay: index * 0.1
                        }}
                        className="absolute left-4 right-4"
                        style={{
                          bottom: `${STACK_CONFIG.SHELF_OFFSET + STACK_CONFIG.BOOK_OFFSET + (index * STACK_CONFIG.SHELF_SPACING)}px`,
                          height: '50px',
                          zIndex: stack.length - index + 20,
                          perspective: '1000px'
                        }}
                      >
                        <div 
                          className={`h-full rounded-lg shadow-xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 ${
                            currentFunction === item.functionName
                              ? 'ring-4 ring-yellow-400 animate-pulse scale-105 shadow-yellow-400/50'
                              : 'hover:scale-102'
                          }`}
                          style={{ 
                            backgroundColor: item.color,
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
                          
                          <span 
                            className="font-mono text-xs font-bold ml-3 mr-2 relative z-10 break-all"
                            style={{
                              color: '#1a1a1a',
                              textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)'
                            }}
                          >
                            {item.functionName}
                          </span>
                          
                          {/* 책 페이지 효과 */}
                          <div className="absolute right-1 top-1 bottom-1 w-1 bg-white/80 rounded-r-sm shadow-sm" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* 빈 스택 메시지 */}
                  {stack.length === 0 && !isExecuting && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                      <div className="text-center p-6 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                          코드를 실행하면 여기에<br/>함수가 책처럼 쌓입니다
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                
                {/* 스택 오버플로우 경고 */}
                {stackOverflow && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-lg backdrop-blur-sm">
                    <div className="text-center p-4 bg-red-100 dark:bg-red-900/70 rounded-lg shadow-lg">
                      <p className="text-red-800 dark:text-red-200 font-bold text-lg">
                        📚💥 Stack Overflow!
                      </p>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        책장이 넘쳐났습니다!
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
            
            {/* 책장 아래 상태 표시 영역 */}
            <div className="mt-4 flex items-center justify-between">
              {/* 스택 크기 표시 */}
              <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 px-4 py-2 rounded-lg text-sm font-medium">
                스택 크기: {stack.length} / {maxStackSize}
              </div>
              
              {/* 실행 상태 표시 */}
              {isExecuting && (
                <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  실행 중
                </div>
              )}
            </div>
          </div>
          
          {/* 반납대들 */}
          <div className="space-y-3">
            {microtaskQueue && microtaskQueue.length >= 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  ⚡ 긴급 반납대 (Microtask)
                </h4>
                <div className="space-y-2">
                  {microtaskQueue.length === 0 ? (
                    <p className="text-xs text-purple-600 dark:text-purple-400">비어있음</p>
                  ) : (
                    microtaskQueue.map((item, index) => (
                      <div key={item.id} className="bg-purple-500 text-white rounded p-2 text-xs">
                        {item.functionName}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {macrotaskQueue && macrotaskQueue.length >= 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  🕐 일반 반납대 (Macrotask)
                </h4>
                <div className="space-y-2">
                  {macrotaskQueue.length === 0 ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400">비어있음</p>
                  ) : (
                    macrotaskQueue.map((item, index) => (
                      <div key={item.id} className="bg-gray-500 text-white rounded p-2 text-xs">
                        {item.functionName}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
          
        {/* 오른쪽 50%: 예상 실행 순서 (전체 높이) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-300 dark:border-slate-700 shadow-lg h-full">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span>🎯 예상 실행 순서</span>
            <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              함수를 클릭하여 추가하세요:
            </p>
            <div className="flex flex-wrap gap-2">
              {remainingFunctions.map((func) => {
                const queueColors = {
                  microtask: 'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/40 border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-200',
                  macrotask: 'from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/40 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200',
                  callstack: 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/40 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-200'
                }
                const colorClass = queueColors[func.queueType || 'callstack'] || queueColors.callstack
                
                return (
                  <motion.button
                    key={func.name}
                    onClick={() => addToOrder(func.name)}
                    disabled={isExecuting}
                    className={`px-3 py-2 bg-gradient-to-r ${colorClass} border-2 rounded-lg text-sm font-mono font-semibold
                      ${isExecuting 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl'
                      } transition-all duration-200`}
                    whileHover={!isExecuting ? { scale: 1.05 } : {}}
                    whileTap={!isExecuting ? { scale: 0.95 } : {}}
                  >
                    <div className="flex items-center gap-1">
                      {func.queueType === 'microtask' && <span className="text-xs">⚡</span>}
                      {func.queueType === 'macrotask' && <span className="text-xs">🕐</span>}
                      {func.name}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
          
          <div className="h-[400px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2">
            {userOrder.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={userOrder}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {userOrder.map((funcName, index) => {
                  const func = functionMap.get(funcName)
                  const queueType = func?.queueType
                  const queueInfo = {
                    microtask: { label: '긴급 반납대', icon: '⚡', color: 'text-purple-600 dark:text-purple-400' },
                    macrotask: { label: '일반 반납대', icon: '🕐', color: 'text-gray-600 dark:text-gray-400' },
                    callstack: { label: '콜스택', icon: '', color: 'text-blue-600 dark:text-blue-400' }
                  }
                  const info = queueInfo[queueType || 'callstack'] || queueInfo.callstack
                  
                  return (
                    <Reorder.Item key={funcName} value={funcName}>
                      <motion.div
                        className={`flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all ${
                          isExecuting ? 'opacity-50' : 'cursor-move hover:scale-102'
                        }`}
                        whileHover={!isExecuting ? { scale: 1.02 } : {}}
                        whileTap={!isExecuting ? { scale: 0.98 } : {}}
                      >
                        <GripVertical className="h-4 w-4 text-slate-400" />
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {index + 1}. {funcName}
                          </span>
                          {queueType && queueType !== 'callstack' && (
                            <span className={`text-xs ${info.color} flex items-center gap-1`}>
                              <span>{info.icon}</span>
                              <span>{info.label}</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromOrder(funcName)
                          }}
                          disabled={isExecuting}
                          className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    🎮 위의 함수들을 클릭하거나<br/>
                    드래그해서 순서를 만들어보세요!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 기본 레이아웃 (expandOrderSection이 false일 때)
  return (
    <div className="w-full">
      {/* 콜스택 시각화 - 향상된 책장 디자인 */}
      <div className="relative w-full">
        {/* 외부 책장 프레임 - 더 깊이 있는 나무 질감 */}
        <div className="relative p-2 rounded-3xl shadow-2xl" style={{
          background: 'linear-gradient(145deg, rgb(139, 69, 19), rgb(101, 50, 13))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          {/* 내부 책장 공간 - 실제 나무 내부 색상 */}
          <div className="relative rounded-2xl p-6" style={{
            background: 'linear-gradient(180deg, rgb(245, 222, 179) 0%, rgb(222, 184, 135) 50%, rgb(210, 180, 140) 100%)',
            boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.2)'
          }}>
            {/* 나무 결 텍스처 */}
            <div 
              className="absolute inset-0 opacity-20 rounded-2xl"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 8px,
                    rgba(139, 69, 19, 0.3) 8px,
                    rgba(139, 69, 19, 0.3) 9px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 40px,
                    rgba(160, 82, 45, 0.2) 40px,
                    rgba(160, 82, 45, 0.2) 42px
                  )
                `
              }}
            />
            
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <div className="p-2 bg-orange-200 dark:bg-orange-900/50 rounded-lg">
                <BookOpen className="h-5 w-5 text-slate-700 dark:text-orange-300" />
              </div>
              <span className="font-bold drop-shadow-md text-orange-950 dark:text-yellow-100">
                콜스택 책장
              </span>
            </h3>
            
            {/* 책상 위 공간 */}
            <div className="relative rounded-lg" style={{
              height: '400px',
              background: 'transparent',
              perspective: '1000px'
            }}>
              
              {/* 책들 (스택 아이템) */}
              <AnimatePresence>
                {stack.map((item, index) => {
                  const dimensions = getBookDimensions(item.functionName)
                  const previousHeight = stack.slice(0, index).reduce((acc, prevItem) => 
                    acc + getBookDimensions(prevItem.functionName).height, 0
                  )
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ 
                        y: -300,
                        opacity: 0,
                        rotate: Math.random() * BOOK_CONFIG.animation.initialRotation - BOOK_CONFIG.animation.initialRotation / 2
                      }}
                      animate={{ 
                        y: 0,
                        opacity: 1,
                        rotate: dimensions.rotation,
                        transition: {
                          type: "spring",
                          stiffness: getAnimationDuration().stiffness,
                          damping: getAnimationDuration().damping,
                          delay: index * getAnimationDuration().delay
                        }
                      }}
                      exit={{ 
                        x: BOOK_CONFIG.animation.exitX,
                        opacity: 0,
                        rotate: BOOK_CONFIG.animation.exitRotation,
                        transition: { duration: getAnimationDuration().delay * 2 }
                      }}
                      className="absolute"
                      style={{
                        bottom: `${previousHeight}px`,
                        left: '50%',
                        transform: `translateX(-50%) rotate(${dimensions.rotation}deg)`,
                        marginLeft: `-${dimensions.width / 2}px`,
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        zIndex: stack.length - index + 10,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div 
                        className={`h-full rounded shadow-2xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 ${
                          currentFunction === item.functionName
                            ? 'ring-4 ring-yellow-400 animate-pulse scale-105'
                            : 'hover:scale-102'
                        }`}
                        style={{ 
                          backgroundColor: item.color,
                          backgroundImage: `
                            linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
                            linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 3px, transparent 3px)
                          `,
                          boxShadow: `
                            0 ${BOOK_CONFIG.shadow.baseOffsetY + index * BOOK_CONFIG.shadow.indexMultiplier}px ${BOOK_CONFIG.shadow.baseBlur + index * BOOK_CONFIG.shadow.indexMultiplier * 1.5}px rgba(0, 0, 0, 0.3),
                            inset 0 1px 2px rgba(255, 255, 255, 0.3),
                            inset 0 -1px 2px rgba(0, 0, 0, 0.2)
                          `
                        }}
                      >
                        {/* 책 측면 (두께) 효과 */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/50 to-black/20"
                          style={{ width: `${dimensions.thickness}px` }}
                        />
                        
                        {/* 책 제본 라인 */}
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-black/30" />
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/20" />
                        
                        {/* 책 표지 텍스처 */}
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: `
                              repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 10px,
                                rgba(255,255,255,0.1) 10px,
                                rgba(255,255,255,0.1) 11px
                              )
                            `
                          }}
                        />
                        
                        <span 
                          className="font-mono text-xs font-bold ml-4 mr-2 relative z-10"
                          style={{
                            color: '#1a1a1a',
                            textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)'
                          }}
                        >
                          {item.functionName}
                        </span>
                        
                        {/* 책 페이지 효과 (오른쪽) */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-gray-100 to-white rounded-r" />
                        <div className="absolute right-2 top-0 bottom-0 w-px bg-gray-300" />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {/* 빈 스택 메시지 */}
              {stack.length === 0 && !isExecuting && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                  <div className="text-center p-6 bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-lg backdrop-blur-sm">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                      코드를 실행하면 여기에<br/>함수가 책처럼 쌓입니다
                    </p>
                  </div>
                </div>
              )}
              
              {/* 책상 그림자 효과 */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                  filter: 'blur(8px)'
                }}
              />
            </div>

            
            {/* 스택 오버플로우 경고 */}
            {stackOverflow && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-lg backdrop-blur-sm">
                <div className="text-center p-4 bg-red-100 dark:bg-red-900/70 rounded-lg shadow-lg">
                  <p className="text-red-800 dark:text-red-200 font-bold text-lg">
                    📚💥 Stack Overflow!
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    책장이 넘쳐났습니다!
                  </p>
                </div>
              </div>
            )}
            
          </div>
        </div>
        
        {/* 책상 아래 상태 표시 영역 */}
        <div className="mt-4 flex items-center justify-between">
          {/* 스택 크기 표시 */}
          <div className="bg-white/90 dark:bg-slate-800/90 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-lg text-sm font-medium shadow-md">
            스택 크기: {stack.length} / {maxStackSize}
          </div>
          
          {/* 실행 상태 표시 */}
          {isExecuting && (
            <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              실행 중
            </div>
          )}
        </div>
      </div>
    </div>
  )
}