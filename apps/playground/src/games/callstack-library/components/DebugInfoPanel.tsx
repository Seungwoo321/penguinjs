'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Cpu, Layers, Activity, Zap, X, ChevronUp } from 'lucide-react'
import { cn } from '@penguinjs/ui'
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync'

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
  const isDarkMode = useDarkModeDetection()
  
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
              "fixed top-1/3 right-4 w-12 h-12 rounded-full shadow-lg border",
              "flex items-center justify-center hover:scale-110 transition-transform z-40",
              className
            )}
            style={{
              backgroundColor: 'rgb(var(--game-callstack-library-bg-elevated))',
              borderColor: 'rgb(var(--game-callstack-library-border-default))'
            }}
          >
            <Info className="h-5 w-5" style={{ color: 'rgb(var(--game-callstack-library-primary))' }} />
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
              "fixed top-1/3 right-4 rounded-lg shadow-lg border",
              "p-4 max-w-xs z-40",
              className
            )}
            style={{
              backgroundColor: 'rgb(var(--game-callstack-library-bg-elevated))',
              borderColor: 'rgb(var(--game-callstack-library-border-default))'
            }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b" style={{ borderBottomColor: 'rgb(var(--game-callstack-library-border-default))' }}>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" style={{ color: 'rgb(var(--game-callstack-library-primary))' }} />
                <h4 className="text-sm font-semibold" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>디버그 정보</h4>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded transition-colors hover:opacity-80"
              >
                <X className="h-4 w-4" style={{ color: 'rgb(var(--game-callstack-library-text-muted))' }} />
              </button>
            </div>

            {/* 정보 그리드 */}
            <div className="space-y-2">
        {/* 레이아웃 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3" style={{ color: 'rgb(var(--game-callstack-library-stage-advanced))' }} />
            <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>레이아웃</span>
          </div>
          <span className="text-xs font-mono font-medium" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
            {layoutType} ({breakpoint})
          </span>
        </div>

        {/* 큐 아이템 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" style={{ color: 'rgb(var(--game-callstack-library-success))' }} />
            <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>큐 아이템</span>
          </div>
          <span className="text-xs font-mono font-medium" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
            {queueItems}
          </span>
        </div>

        {/* 진행 단계 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" style={{ color: 'rgb(var(--game-callstack-library-warning))' }} />
            <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>진행도</span>
          </div>
          <span className="text-xs font-mono font-medium" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
            {currentStep}/{totalSteps}
          </span>
        </div>

        {/* 메모리 상태 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3" style={{ color: 'rgb(var(--game-callstack-library-error))' }} />
            <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>메모리</span>
          </div>
          <span className="text-xs font-mono font-medium"
            style={{ color: memoryPressure ? 'rgb(var(--game-callstack-library-error))' : 'rgb(var(--game-callstack-library-success))' }}
          >
            {memoryPressure ? '⚠️ HIGH' : '✅ OK'}
          </span>
        </div>
            </div>

            {/* 프로그레스 바 */}
            <div className="mt-3 pt-3 border-t" style={{ borderTopColor: 'rgb(var(--game-callstack-library-border-default))' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>진행률</span>
                <span className="text-xs font-medium" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
                  {totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0}%
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(var(--game-callstack-library-border-default))' }}>
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(to right, rgb(var(--game-callstack-library-primary)), rgb(var(--game-callstack-library-stage-advanced)))' }}
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