// 도서관 업무 일지 패널 컴포넌트

import React, { useState, useEffect, useRef } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react'
import { StackItem } from '../../../types'

interface TimelineCallStackPanelProps {
  currentStep: number
  totalSteps: number
  callstackHistory: StackItem[][]  // 각 스텝별 콜스택 상태
  currentDisplayStack?: StackItem[] // 현재 표시할 스택 (이중 스택 시스템용)
  onStepChange: (step: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  className?: string
}

/**
 * 도서관 업무 일지 시각화
 * 시간대별 책장 상태를 기록하고 확인하는 패널
 */
export const TimelineCallStackPanel: React.FC<TimelineCallStackPanelProps> = ({
  currentStep,
  totalSteps,
  callstackHistory,
  currentDisplayStack,
  onStepChange,
  isPlaying,
  onPlayPause,
  className
}) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 자동 재생 기능
  useEffect(() => {
    console.log('Timeline Effect:', { isPlaying, currentStep, totalSteps })
    
    if (!isPlaying) {
      console.log('Timeline: Not playing, skipping timer setup')
      return
    }
    
    if (currentStep >= totalSteps - 1) {
      console.log('Timeline: Reached end, stopping playback and resetting to start')
      onPlayPause()
      // 재생이 끝나면 처음으로 돌아가기
      setTimeout(() => {
        onStepChange(0)
      }, 500) // 0.5초 후에 처음으로 돌아가기
      return
    }
    
    console.log(`Timeline: Setting timer for Step ${currentStep} -> ${currentStep + 1}`)
    const timer = setTimeout(() => {
      console.log(`Timeline: Timer fired! Moving from ${currentStep} to ${currentStep + 1}`)
      onStepChange(currentStep + 1)
    }, 1500) // 1.5초마다 다음 스텝
    
    return () => {
      console.log(`Timeline: Cleanup - clearing timer for step ${currentStep}`)
      clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalSteps, onStepChange, onPlayPause])
  
  // 현재 스텝의 콜스택 (이중 스택 시스템 적용)
  const currentStack = currentDisplayStack || callstackHistory[currentStep] || []
  
  return (
    <GamePanel 
      title="📖 도서관 업무 일지" 
      className={cn("flex flex-col", className)}
    >
      {/* 업무 일지 헤더 */}
      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
        <div className="text-center">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
            시간대별 기록 탐색
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            각 시점의 책장 상태를 확인하고 변화를 관찰하세요
          </p>
        </div>
      </div>
      
      {/* 타임라인 컨트롤 */}
      <div className="px-4 py-3 bg-surface-secondary border-b border-editor-border">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onStepChange(0)}
            disabled={currentStep === 0}
            className={cn(
              "p-2 rounded-lg transition-all",
              "border border-gray-300 dark:border-gray-600",
              currentStep === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            )}
            title="업무 시작"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "p-2 rounded-lg transition-all",
              "border border-gray-300 dark:border-gray-600",
              currentStep === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            )}
            title="이전 기록"
          >
            <Rewind className="h-4 w-4" />
          </button>
          
          <button
            onClick={onPlayPause}
            className={cn(
              "p-3 rounded-lg transition-all",
              "border-2",
              isPlaying
                ? "bg-blue-500 border-blue-600 text-white hover:bg-blue-600"
                : "bg-white dark:bg-gray-700 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600"
            )}
            title={isPlaying ? "일시정지" : "자동 기록 보기"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
            disabled={currentStep >= totalSteps - 1}
            className={cn(
              "p-2 rounded-lg transition-all",
              "border border-gray-300 dark:border-gray-600",
              currentStep >= totalSteps - 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            )}
            title="다음 기록"
          >
            <FastForward className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onStepChange(totalSteps - 1)}
            disabled={currentStep >= totalSteps - 1}
            className={cn(
              "p-2 rounded-lg transition-all",
              "border border-gray-300 dark:border-gray-600",
              currentStep >= totalSteps - 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
            )}
            title="업무 완료"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        
        {/* 진행률 표시 */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-game-text-secondary mb-1">
            <span>기록 {currentStep + 1} / {totalSteps}</span>
            <span>{Math.round((currentStep + 1) / totalSteps * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 책장 시각화 영역 */}
      <div className="flex-1 p-4 bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="h-full relative">
          {/* 빈 스택 메시지 */}
          {currentStack.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-3 opacity-20">📚</div>
                <p className="text-gray-500 dark:text-gray-400">
                  책장이 비어있습니다
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 h-full overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {currentStack.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }}
                  >
                    <StackFrame 
                      item={item} 
                      index={index}
                      isTop={index === currentStack.length - 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* 스택 정보 */}
      <div className="px-4 py-3 bg-surface-secondary border-t border-editor-border">
        <div className="flex items-center justify-between text-xs text-game-text-secondary">
          <span>현재 스택 깊이: {currentStack.length}</span>
          <span>최대 스택 깊이: {Math.max(...callstackHistory.map(s => s.length))}</span>
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 개별 스택 프레임 컴포넌트
 */
const StackFrame: React.FC<{
  item: StackItem
  index: number
  isTop: boolean
}> = ({ item, index, isTop }) => {
  const isGlobalContext = item.isGlobalContext || item.functionName === '<global>'
  
  return (
    <div 
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-lg",
        "border-2 transition-all duration-300",
        "bg-white dark:bg-gray-800",
        isTop 
          ? "border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/30"
          : "border-gray-300 dark:border-gray-600",
        isGlobalContext && "border-dashed"
      )}
    >
      {/* 스택 아이콘 */}
      <div className={cn(
        "flex-shrink-0 text-2xl",
        isTop ? "animate-pulse" : ""
      )}>
        {isGlobalContext ? "📍" : "📥"}
      </div>
      
      {/* 함수 정보 */}
      <div className="flex-1">
        <div className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
          {item.functionName}
        </div>
        {item.returnValue !== undefined && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            returns: {JSON.stringify(item.returnValue)}
          </div>
        )}
      </div>
      
      {/* 스택 위치 표시 */}
      <div className={cn(
        "flex-shrink-0 px-2 py-1 rounded text-xs font-medium",
        isTop
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
      )}>
        #{index + 1}
      </div>
    </div>
  )
}