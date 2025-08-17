// 함수 선택기 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { FunctionSelectorPanelProps } from '@/games/callstack-library/types/layout'
import { Reorder } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * 함수 선택기 패널
 * 레이아웃 타입과 플레이 모드에 따라 다른 UI를 제공
 */
export const FunctionSelectorPanel: React.FC<FunctionSelectorPanelProps> = ({
  functions,
  playMode,
  selectedFunctions,
  onFunctionSelect,
  onReorder,
  onRemove,
  className
}) => {
  return (
    <GamePanel 
      title="🎯 함수 선택" 
      className={cn("flex flex-col", className)}
    >
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-border bg-muted">
        <p className="text-sm font-medium text-muted-foreground">
          {getPlayModeDescription(playMode)}
        </p>
      </div>
      
      {/* 함수 선택 영역 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {playMode === 'start-end-tracking' ? (
          <StartEndTrackingSelector
            functions={functions}
            selectedFunctions={selectedFunctions}
            onFunctionSelect={onFunctionSelect}
            onRemove={onRemove}
          />
        ) : (
          <OrderPredictionSelector
            functions={functions}
            selectedFunctions={selectedFunctions}
            onFunctionSelect={onFunctionSelect}
            onReorder={onReorder}
            onRemove={onRemove}
          />
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className="px-4 py-2 border-t border-border bg-muted">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>선택됨: {selectedFunctions.length}</span>
            <span>전체: {functions.length}</span>
          </div>
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 순서 예측 선택기 (타입 A)
 */
const OrderPredictionSelector: React.FC<{
  functions: string[]
  selectedFunctions: string[]
  onFunctionSelect: (functionName: string) => void
  onReorder?: (newOrder: string[]) => void
  onRemove?: (index: number) => void
}> = ({ functions, selectedFunctions, onFunctionSelect, onReorder, onRemove }) => {
  
  return (
    <div className="space-y-4">
      {/* 사용 가능한 함수 목록 */}
      <div>
        <div className="text-sm font-medium text-foreground mb-3">
          사용 가능한 함수 (클릭하여 추가)
        </div>
        <div className="space-y-2">
          {functions.map((functionName, index) => {
            const isSelected = selectedFunctions.includes(functionName)
            
            return (
              <button
                key={index}
                onClick={() => !isSelected && onFunctionSelect(functionName)}
                disabled={isSelected}
                className={cn(
                  "w-full p-3 text-left rounded-lg border transition-all",
                  "hover:shadow-md"
                )}
                style={{
                  backgroundColor: isSelected 
                    ? 'rgb(var(--muted))'
                    : 'rgb(var(--card))',
                  borderColor: isSelected 
                    ? 'rgb(var(--muted-foreground))'
                    : 'rgb(var(--border))',
                  color: isSelected 
                    ? 'rgb(var(--muted-foreground))'
                    : 'rgb(var(--foreground))',
                  cursor: isSelected ? 'not-allowed' : 'pointer',
                  opacity: isSelected ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--accent))'
                    e.currentTarget.style.borderColor = 'rgb(var(--primary))'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--card))'
                    e.currentTarget.style.borderColor = 'rgb(var(--border))'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{functionName}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">✓ 추가됨</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 선택된 함수 목록 (순서 재정렬 가능) */}
      {selectedFunctions.length > 0 && onReorder && (
        <div>
          <div className="text-sm font-medium text-foreground mb-3">
            선택된 함수 (드래그하여 순서 변경)
          </div>
          <Reorder.Group
            axis="y"
            values={selectedFunctions}
            onReorder={onReorder}
            className="space-y-2"
          >
            {selectedFunctions.map((functionName, index) => (
              <Reorder.Item
                key={functionName}
                value={functionName}
                className="rounded-lg p-3 cursor-grab active:cursor-grabbing transition-colors"
                style={{
                  backgroundColor: 'rgb(var(--muted))',
                  borderColor: 'rgb(var(--border))',
                  border: '1px solid'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--primary))'
                  e.currentTarget.style.borderColor = 'rgb(var(--primary))'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--muted))'
                  e.currentTarget.style.borderColor = 'rgb(var(--border))'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                      {index + 1}. {functionName}
                    </span>
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(index)}
                      className="text-destructive hover:text-destructive/80 p-1 rounded hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  )
}

/**
 * 시작/종료 추적 선택기 (타입 A+)
 */
const StartEndTrackingSelector: React.FC<{
  functions: string[]
  selectedFunctions: string[]
  onFunctionSelect: (functionName: string) => void
  onRemove?: (index: number) => void
}> = ({ functions, selectedFunctions, onFunctionSelect, onRemove }) => {
  
  // Layout A+에서 functions 배열을 start와 end로 필터링
  // 모든 함수는 start와 end 모두 가능하다고 가정
  const availableStartFunctions = functions
  const availableEndFunctions = functions
  
  return (
    <div className="space-y-4">
      {/* 함수 시작 그룹 (Push) */}
      <div>
        <div className="font-bold text-sm mb-2 p-2 bg-muted border border-border rounded">
          📥 함수 시작 (Push)
        </div>
        <div className="space-y-2">
          {availableStartFunctions.map((functionName) => {
            const startKey = `${functionName}_start`
            // Layout A+에서는 같은 함수를 여러 번 선택할 수 있으므로 비활성화하지 않음
            const isSelected = false
            
            return (
              <button
                key={startKey}
                onClick={() => onFunctionSelect(`${functionName} → 시작`)}
                className="w-full p-3 text-left rounded-lg border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected 
                    ? 'rgb(var(--primary))' 
                    : 'rgb(var(--card))',
                  borderColor: isSelected 
                    ? 'rgb(var(--primary))' 
                    : 'rgb(var(--border))',
                  color: isSelected 
                    ? 'rgb(var(--primary-foreground))' 
                    : 'rgb(var(--foreground))',
                  boxShadow: isSelected 
                    ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--accent))'
                    e.currentTarget.style.borderColor = 'rgb(var(--primary))'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--card))'
                    e.currentTarget.style.borderColor = 'rgb(var(--border))'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? "opacity-100" : "opacity-70"}>📥</span>
                    <span className="font-mono text-sm font-medium">{functionName}()</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: isSelected 
                          ? 'rgba(var(--primary-foreground-rgb), 0.2)' 
                          : 'rgb(var(--muted))',
                        color: isSelected 
                          ? 'rgb(var(--primary-foreground))' 
                          : 'rgb(var(--muted-foreground))',
                        border: '1px solid',
                        borderColor: isSelected 
                          ? 'rgba(var(--primary-foreground-rgb), 0.3)' 
                          : 'rgb(var(--border))'
                      }}
                    >
                      시작
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold" style={{ color: 'rgb(var(--primary-foreground))' }}>
                        ✓ 선택됨
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 함수 종료 그룹 (Pop) */}
      <div>
        <div className="font-bold text-sm mb-2 p-2 bg-muted border border-border rounded">
          📤 함수 종료 (Pop)
        </div>
        <div className="space-y-2">
          {availableEndFunctions.map((functionName) => {
            const endKey = `${functionName}_end`
            // Layout A+에서는 같은 함수를 여러 번 선택할 수 있으므로 비활성화하지 않음
            const isSelected = false
            
            return (
              <button
                key={endKey}
                onClick={() => onFunctionSelect(`${functionName} ← 종료`)}
                className="w-full p-3 text-left rounded-lg border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected 
                    ? 'rgb(var(--secondary))' 
                    : 'rgb(var(--card))',
                  borderColor: isSelected 
                    ? 'rgb(var(--secondary))' 
                    : 'rgb(var(--border))',
                  color: isSelected 
                    ? 'rgb(var(--secondary-foreground))' 
                    : 'rgb(var(--foreground))',
                  boxShadow: isSelected 
                    ? '0 4px 12px rgba(var(--secondary-rgb), 0.3)' 
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--accent))'
                    e.currentTarget.style.borderColor = 'rgb(var(--secondary))'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--card))'
                    e.currentTarget.style.borderColor = 'rgb(var(--border))'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? "opacity-100" : "opacity-70"}>📤</span>
                    <span className="font-mono text-sm font-medium">{functionName}()</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: isSelected 
                          ? 'rgba(var(--secondary-foreground-rgb), 0.2)' 
                          : 'rgb(var(--muted))',
                        color: isSelected 
                          ? 'rgb(var(--secondary-foreground))' 
                          : 'rgb(var(--muted-foreground))',
                        border: '1px solid',
                        borderColor: isSelected 
                          ? 'rgba(var(--secondary-foreground-rgb), 0.3)' 
                          : 'rgb(var(--border))'
                      }}
                    >
                      종료
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold" style={{ color: 'rgb(var(--secondary-foreground))' }}>
                        ✓ 선택됨
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 선택된 함수들 표시 및 제거 */}
      {selectedFunctions.length > 0 && onRemove && (
        <div>
          <div className="font-bold text-sm mb-2 p-2 bg-muted border border-border rounded">
            📋 선택된 함수들 (클릭하여 제거)
          </div>
          <div className="space-y-2">
            {selectedFunctions.map((selectedFunction, index) => {
              // Determine if it's a start or end function based on the format
              const isStart = !selectedFunction.includes('종료') && !selectedFunction.endsWith('-return')
              const funcName = selectedFunction
                .replace(' → 시작', '')
                .replace(' ← 종료', '')
                .replace('-return', '')
              
              return (
                <button
                  key={`${selectedFunction}-${index}`}
                  onClick={() => onRemove(index)}
                  className="w-full p-2 text-left rounded-lg border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    backgroundColor: isStart ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(var(--secondary-rgb), 0.1)',
                    borderColor: isStart ? 'rgb(var(--primary))' : 'rgb(var(--secondary))',
                    color: 'rgb(var(--foreground))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--destructive-rgb), 0.1)'
                    e.currentTarget.style.borderColor = 'rgb(var(--destructive))'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isStart ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(var(--secondary-rgb), 0.1)'
                    e.currentTarget.style.borderColor = isStart ? 'rgb(var(--primary))' : 'rgb(var(--secondary))'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{isStart ? '📥' : '📤'}</span>
                      <span className="font-mono text-sm">{funcName}()</span>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: isStart ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(var(--secondary-rgb), 0.2)',
                          color: isStart ? 'rgb(var(--primary))' : 'rgb(var(--secondary))'
                        }}
                      >
                        {isStart ? '시작' : '종료'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">순서: {index + 1}</span>
                      <X 
                        className="w-4 h-4 group-hover:text-destructive transition-colors" 
                        style={{ color: 'rgb(var(--muted-foreground))' }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// 유틸리티 함수
function getPlayModeDescription(playMode: string): string {
  switch (playMode) {
    case 'order-prediction':
      return '함수 호출 순서를 예측하세요'
    case 'start-end-tracking':
      return '각 함수의 시작과 종료를 추적하세요'
    default:
      return '함수를 선택하세요'
  }
}