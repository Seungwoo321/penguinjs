// 고급 코드 에디터 패널 컴포넌트 (타입 E 전용)

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
 * 고급 코드 에디터 패널
 * 브레이크포인트와 실행 경로를 시각적으로 표시
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
      title="📝 코드" 
      className={cn("flex flex-col", className)}
    >
      {/* 정보 헤더 */}
      <div className="px-4 py-3 border-b" style={{
        borderColor: 'rgb(var(--border))',
        background: 'linear-gradient(to right, rgba(var(--game-callstack-code-keyword), 0.1), rgba(var(--game-callstack-code-keyword), 0.1))'
      }}>
        <div className="text-center">
          <h3 className="text-sm font-bold" style={{ color: 'rgb(var(--game-callstack-code-keyword))' }}>
            고급 코드 에디터
          </h3>
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            브레이크포인트와 실행 경로를 확인하세요
          </p>
        </div>
        
        {/* 실행 정보 */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(var(--destructive))' }}></div>
            <span style={{ color: 'rgb(var(--text-secondary))' }}>브레이크포인트 ({breakpoints.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgb(var(--primary))' }}></div>
            <span style={{ color: 'rgb(var(--text-secondary))' }}>현재 위치: 라인 {currentLine || '-'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(var(--game-callstack-success))' }}></div>
            <span style={{ color: 'rgb(var(--text-secondary))' }}>실행 완료: {executionPath.length}줄</span>
          </div>
        </div>
      </div>
      
      {/* 코드 에디터 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto" style={{ backgroundColor: 'rgb(var(--background))' }}>
          <div className="flex">
            {/* 거터 영역 (라인 번호 + 브레이크포인트) */}
            <div className="flex-shrink-0 border-r" style={{ 
              borderColor: 'rgb(var(--border))',
              backgroundColor: 'rgb(var(--muted))'
            }}>
              {codeLines.map((line) => (
                <div 
                  key={line.number}
                  className="flex items-center h-6 px-2 text-xs"
                  style={{
                    backgroundColor: line.isCurrentLine 
                      ? 'rgba(var(--primary), 0.15)'
                      : 'transparent'
                  }}
                >
                  {/* 브레이크포인트 표시 */}
                  <div className="w-4 flex justify-center">
                    {line.isBreakpoint && (
                      <Dot className="h-4 w-4" style={{ color: 'rgb(var(--destructive))' }} />
                    )}
                  </div>
                  
                  {/* 라인 번호 */}
                  <div className="w-8 text-right font-mono"
                    style={{
                      color: line.isCurrentLine 
                        ? 'rgb(var(--primary))'
                        : 'rgb(var(--text-secondary))',
                      fontWeight: line.isCurrentLine ? 'bold' : 'normal'
                    }}>
                    {line.number}
                  </div>
                  
                  {/* 현재 실행 라인 표시 */}
                  <div className="w-4 flex justify-center">
                    {line.isCurrentLine && (
                      <Play className="h-3 w-3 animate-pulse" style={{ color: 'rgb(var(--primary))' }} />
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
                  className="h-6 px-3 py-0.5 text-xs font-mono leading-tight flex items-center"
                  style={{
                    backgroundColor: line.isCurrentLine 
                      ? 'rgba(var(--primary), 0.15)'
                      : line.isBreakpoint 
                        ? 'rgba(var(--destructive), 0.1)'
                        : line.isExecuted 
                          ? 'rgba(var(--game-callstack-success), 0.1)'
                          : 'transparent',
                    borderLeft: line.isCurrentLine 
                      ? '4px solid rgb(var(--primary))'
                      : line.isBreakpoint 
                        ? '2px solid rgb(var(--destructive))'
                        : 'none',
                    paddingLeft: line.isCurrentLine || line.isBreakpoint ? '8px' : '12px'
                  }}
                >
                  <span className="whitespace-pre"
                    style={{
                      color: line.isCurrentLine 
                        ? 'rgb(var(--primary))'
                        : 'rgb(var(--text-primary))',
                      fontWeight: line.isCurrentLine ? '500' : 'normal'
                    }}>
                    {line.content || " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 범례 */}
      <div className="px-4 py-2 border-t" style={{
        backgroundColor: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))'
      }}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Dot className="h-3 w-3 text-red-500" />
              <span style={{ color: 'rgb(var(--text-tertiary))' }}>브레이크포인트</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 text-blue-500" />
              <span style={{ color: 'rgb(var(--text-tertiary))' }}>현재 실행중</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span style={{ color: 'rgb(var(--text-tertiary))' }}>실행 완료</span>
            </div>
          </div>
          <span style={{ color: 'rgb(var(--text-tertiary))' }}>JavaScript</span>
        </div>
      </div>
    </GamePanel>
  )
}