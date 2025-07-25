// 타임라인 콜스택 패널 컴포넌트

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
 * 타임라인 콜스택 패널
 * 시간대별 콜스택 상태를 기록하고 확인하는 패널
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
    if (!isPlaying) {
      return
    }
    
    if (currentStep >= totalSteps - 1) {
      onPlayPause() // 마지막 스텝에서 자동 정지
      return
    }
    
    const timer = setTimeout(() => {
      onStepChange(currentStep + 1)
    }, 1500) // 1.5초마다 다음 스텝
    
    return () => {
      clearTimeout(timer)
    }
  }, [isPlaying, currentStep, totalSteps, onStepChange, onPlayPause])
  
  // 현재 스텝의 콜스택 (이중 스택 시스템 적용)
  const currentStack = currentDisplayStack || callstackHistory[currentStep] || []
  
  return (
    <GamePanel 
      title="📊 타임라인" 
      className={cn("flex flex-col", className)}
    >
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            실행 타임라인
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            각 시점의 콜스택 상태를 확인하세요
          </p>
        </div>
      </div>
      
      {/* 타임라인 컨트롤 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onStepChange(0)}
            disabled={currentStep === 0}
            className={cn(
              "p-2 rounded-lg transition-all",
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            title="처음으로"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={cn(
              "p-2 rounded-lg transition-all",
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            title="이전 단계"
          >
            <Rewind className="h-4 w-4" />
          </button>
          
          <button
            onClick={onPlayPause}
            className="p-3 rounded-lg transition-all bg-blue-500 text-white hover:bg-blue-600"
            title={isPlaying ? "일시정지" : "재생"}
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
              currentStep >= totalSteps - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            title="다음 단계"
          >
            <FastForward className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onStepChange(totalSteps - 1)}
            disabled={currentStep >= totalSteps - 1}
            className={cn(
              "p-2 rounded-lg transition-all",
              currentStep >= totalSteps - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            title="마지막으로"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        
        {/* 진행 표시 */}
        <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          단계: {currentStep + 1} / {totalSteps}
        </div>
      </div>
      
      {/* 타임라인 진행바 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-blue-500"
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* 스텝 마커 */}
        <div className="relative mt-2">
          <div className="flex justify-between">
            {Array.from({ length: Math.min(10, totalSteps) }).map((_, index) => {
              const stepIndex = Math.floor((index / 9) * (totalSteps - 1))
              const isActive = stepIndex <= currentStep
              
              return (
                <button
                  key={index}
                  onClick={() => onStepChange(stepIndex)}
                  onMouseEnter={() => setHoveredStep(stepIndex)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    isActive
                      ? "bg-blue-500 scale-110"
                      : "bg-gray-300 dark:bg-gray-600 hover:scale-110"
                  )}
                  title={`단계 ${stepIndex + 1}`}
                />
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 현재 콜스택 상태 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {currentStack.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>콜스택이 비어있습니다</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {currentStack.map((item, index) => (
                <motion.div
                  key={`${item.name || item.functionName}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{item.name || item.functionName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">#{currentStack.length - index}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* 호버된 스텝 정보 */}
      {hoveredStep !== null && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs">
          단계 {hoveredStep + 1}: {callstackHistory[hoveredStep]?.length || 0}개 항목
        </div>
      )}
    </GamePanel>
  )
}