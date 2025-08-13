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
                    ? 'rgb(var(--game-callstack-queue-callstack-light))'
                    : 'rgb(var(--card))',
                  borderColor: isSelected 
                    ? 'rgb(var(--game-callstack-queue-callstack-light))'
                    : 'rgb(var(--border))',
                  color: isSelected 
                    ? 'rgb(var(--muted-foreground))'
                    : 'rgb(var(--foreground))',
                  cursor: isSelected ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--game-callstack-queue-callstack-hover))'
                    e.currentTarget.style.borderColor = 'rgb(var(--primary))'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgb(var(--card))'
                    e.currentTarget.style.borderColor = 'rgb(var(--border))'
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
                  backgroundColor: 'rgb(var(--game-callstack-queue-callstack-light))',
                  borderColor: 'rgb(var(--game-callstack-queue-callstack-light))',
                  border: '1px solid'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--game-callstack-queue-callstack-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--game-callstack-queue-callstack-light))'
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
}> = ({ functions, selectedFunctions, onFunctionSelect }) => {
  
  return (
    <div className="space-y-4">
      {/* 함수 시작 그룹 (Push) */}
      <div>
        <div className="font-bold text-sm mb-2 p-2 bg-muted border border-border rounded">
          📥 함수 시작 (Push)
        </div>
        <div className="space-y-2">
          {functions.map((functionName) => (
            <button
              key={`${functionName}_start`}
              onClick={() => onFunctionSelect(`${functionName}_start`)}
              className="w-full p-3 text-left rounded-lg border transition-all bg-card border-border hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-accent-foreground">📥</span>
                  <span className="font-mono text-sm">{functionName}()</span>
                </div>
                <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded">
                  시작
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 함수 종료 그룹 (Pop) */}
      <div>
        <div className="font-bold text-sm mb-2 p-2 bg-muted border border-border rounded">
          📤 함수 종료 (Pop)
        </div>
        <div className="space-y-2">
          {functions.map((functionName) => (
            <button
              key={`${functionName}_end`}
              onClick={() => onFunctionSelect(`${functionName}_end`)}
              className="w-full p-3 text-left rounded-lg border transition-all bg-card border-border hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-accent-foreground">📤</span>
                  <span className="font-mono text-sm">{functionName}()</span>
                </div>
                <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded">
                  종료
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
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