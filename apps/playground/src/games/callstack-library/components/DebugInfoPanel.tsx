'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Cpu, Layers, Activity, Zap, X, ChevronUp } from 'lucide-react'
import { cn } from '@penguinjs/ui'

interface DebugInfoPanelProps {
  layoutType: string
  breakpoint: string
  queueItems: number
  currentStep: number
  totalSteps: number
  memoryPressure: boolean
  className?: string
}

export const DebugInfoPanel: React.FC<DebugInfoPanelProps> = ({
  layoutType,
  breakpoint,
  queueItems,
  currentStep,
  totalSteps,
  memoryPressure,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 개발 모드에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* 축소된 상태 - 플로팅 버튼 */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)}
            className={cn(
              "fixed top-1/3 right-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-200 dark:border-slate-700",
              "flex items-center justify-center hover:scale-110 transition-transform z-40",
              className
            )}
          >
            <Info className="h-5 w-5 text-blue-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 확장된 상태 - 전체 패널 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "fixed top-1/3 right-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700",
              "p-4 max-w-xs z-40",
              className
            )}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">디버그 정보</h4>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* 정보 그리드 */}
            <div className="space-y-2">
        {/* 레이아웃 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3 text-purple-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">레이아웃</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
            {layoutType} ({breakpoint})
          </span>
        </div>

        {/* 큐 아이템 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-green-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">큐 아이템</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
            {queueItems}
          </span>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">진행도</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* 메모리 상태 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3 text-red-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">메모리</span>
          </div>
          <span className={cn(
            "text-xs font-mono font-medium",
            memoryPressure ? "text-red-500" : "text-green-500"
          )}>
            {memoryPressure ? '⚠️ HIGH' : '✅ OK'}
          </span>
        </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600 dark:text-slate-400">진행률</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : '0%' 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

DebugInfoPanel.displayName = 'DebugInfoPanel'