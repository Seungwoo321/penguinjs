// 힌트 패널 컴포넌트

import React from 'react'
import { cn } from '@penguinjs/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface HintPanelProps {
  hints: string[]
  showHints: boolean
  hintsUsed: number
  className?: string
}

export const HintPanel: React.FC<HintPanelProps> = ({
  hints,
  showHints,
  hintsUsed,
  className
}) => {
  // Hook 규칙 준수: early return 대신 조건부 렌더링
  if (!hints || hints.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-game-text">
          💡 힌트
        </span>
        <span className="text-xs text-game-text-secondary">
          {hintsUsed}개 사용됨
        </span>
      </div>
      
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {hints.map((hint, index) => (
              <div
                key={`hint-${index}-${hint.substring(0, 10)}`}
                className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 힌트 {index + 1}: {hint}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}