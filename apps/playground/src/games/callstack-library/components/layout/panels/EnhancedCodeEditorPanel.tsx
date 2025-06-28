// 도서관 코드 열람 패널 컴포넌트 (타입 E 전용)

import React, { useMemo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { Dot, AlertTriangle, CheckCircle, Play } from 'lucide-react'

interface EnhancedCodeEditorPanelProps {
  code: string
  currentLine?: number
  breakpoints?: number[]
  executionPath?: number[]
  className?: string
}

/**
 * 도서관 코드 열람 패널
 * 체크포인트와 실행 경로를 시각적으로 표시
 */
export const EnhancedCodeEditorPanel: React.FC<EnhancedCodeEditorPanelProps> = ({
  code,
  currentLine,
  breakpoints = [],
  executionPath = [],
  className
}) => {
  // 코드를 라인별로 분할
  const codeLines = useMemo(() => {
    return code.split('\n').map((line, index) => ({
      number: index + 1,
      content: line,
      isBreakpoint: breakpoints.includes(index + 1),
      isCurrentLine: currentLine === index + 1,
      isExecuted: executionPath.includes(index + 1)
    }))
  }, [code, breakpoints, currentLine, executionPath])

  return (
    <GamePanel 
      title="📜 도서관 코드 열람" 
      className={cn("flex flex-col", className)}
    >
      {/* 정보 헤더 */}
      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
        <div className="text-center">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
            코드 열람 모드
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            현재 읽고 있는 코드와 체크포인트를 확인하세요
          </p>
        </div>
        
        {/* 실행 정보 */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">체크포인트 ({breakpoints.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 dark:text-gray-400">현재 위치: 라인 {currentLine || '-'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">실행 완료: {executionPath.length}줄</span>
          </div>
        </div>
      </div>
      
      {/* 코드 에디터 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-white dark:bg-gray-900">
          <div className="flex">
            {/* 거터 영역 (라인 번호 + 브레이크포인트) */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              {codeLines.map((line) => (
                <div 
                  key={line.number}
                  className={cn(
                    "flex items-center h-6 px-2 text-xs",
                    line.isCurrentLine && "bg-blue-100 dark:bg-blue-900/30"
                  )}
                >
                  {/* 브레이크포인트 표시 */}
                  <div className="w-4 flex justify-center">
                    {line.isBreakpoint && (
                      <Dot className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  {/* 라인 번호 */}
                  <div className={cn(
                    "w-8 text-right font-mono",
                    line.isCurrentLine 
                      ? "text-blue-700 dark:text-blue-300 font-bold" 
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {line.number}
                  </div>
                  
                  {/* 현재 실행 라인 표시 */}
                  <div className="w-4 flex justify-center">
                    {line.isCurrentLine && (
                      <Play className="h-3 w-3 text-blue-500 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 코드 내용 */}
            <div className="flex-1 overflow-x-auto">
              {codeLines.map((line) => (
                <div 
                  key={line.number}
                  className={cn(
                    "h-6 px-3 py-0.5 text-xs font-mono leading-tight flex items-center",
                    line.isCurrentLine && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500",
                    line.isBreakpoint && !line.isCurrentLine && "bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500",
                    line.isExecuted && !line.isCurrentLine && !line.isBreakpoint && "bg-green-50 dark:bg-green-900/10"
                  )}
                >
                  <span className={cn(
                    "whitespace-pre",
                    line.isCurrentLine 
                      ? "text-blue-900 dark:text-blue-100 font-medium" 
                      : "text-gray-800 dark:text-gray-200"
                  )}>
                    {line.content || " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 범례 */}
      <div className="px-4 py-2 bg-surface-secondary border-t border-editor-border">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Dot className="h-3 w-3 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">브레이크포인트</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">현재 실행중</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">실행 완료</span>
            </div>
          </div>
          <span className="text-gray-500">JavaScript</span>
        </div>
      </div>
    </GamePanel>
  )
}