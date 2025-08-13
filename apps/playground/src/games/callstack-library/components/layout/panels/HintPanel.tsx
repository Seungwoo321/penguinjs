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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  // Hook 규칙 준수: early return 대신 조건부 렌더링
  if (!hints || hints.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
          💡 힌트
        </span>
        <span className="text-xs" style={{ color: 'rgb(var(--muted-foreground))' }}>
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
                className="rounded-lg p-3 border"
                style={{
                  backgroundColor: 'rgb(var(--game-callstack-hint-bg))',
                  borderColor: `rgb(var(--game-callstack-hint-border))`
                }}
              >
                <p className="text-sm" style={{ 
                  color: 'rgb(var(--game-callstack-hint-text))'
                }}>
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