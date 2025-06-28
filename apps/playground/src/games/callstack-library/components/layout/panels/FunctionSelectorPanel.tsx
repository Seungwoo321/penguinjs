// 함수 선택기 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { FunctionSelectorPanelProps } from '../../../types/layout'
import { Reorder } from 'framer-motion'

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
    <GamePanel title="🎯 함수 선택" className={cn("flex flex-col", className)}>
      {/* 설명 텍스트 */}
      <div className="px-4 py-2 border-b border-editor-border">
        <p className="text-xs text-game-text-secondary">
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
      <div className="px-4 py-2 border-t border-editor-border bg-surface-secondary">
        <div className="text-xs text-game-text-secondary">
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
        <div className="text-sm font-medium text-game-text mb-3">
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
                  "hover:shadow-sm",
                  isSelected 
                    ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700" 
                    : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 dark:hover:text-blue-400"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{functionName}</span>
                  {isSelected && (
                    <span className="text-xs text-gray-500">✓ 추가됨</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* 선택된 함수 순서 (드래그 가능) */}
      <div>
        <div className="text-sm font-medium text-game-text mb-3">
          예상 실행 순서 (드래그하여 정렬)
        </div>
        {selectedFunctions.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center text-gray-400 dark:text-gray-500">
            위의 함수를 클릭하여 추가하세요
          </div>
        ) : onReorder ? (
          <Reorder.Group
            axis="y"
            values={selectedFunctions}
            onReorder={onReorder}
            className="space-y-2"
          >
            {selectedFunctions.map((funcName, index) => (
              <Reorder.Item
                key={funcName}
                value={funcName}
                className="relative"
              >
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-lg cursor-move">
                  {/* 드래그 핸들 */}
                  <div className="text-gray-400">
                    <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                      <circle cx="3" cy="5" r="1.5" />
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="3" cy="10" r="1.5" />
                      <circle cx="9" cy="10" r="1.5" />
                      <circle cx="3" cy="15" r="1.5" />
                      <circle cx="9" cy="15" r="1.5" />
                    </svg>
                  </div>
                  
                  {/* 순서 번호 */}
                  <span className="bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  
                  {/* 함수명 */}
                  <span className="font-mono text-sm text-blue-800 dark:text-blue-200 flex-1">
                    {funcName}
                  </span>
                  
                  {/* 제거 버튼 */}
                  {onRemove && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(index)
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-2">
            {selectedFunctions.map((funcName, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 rounded-lg">
                <span className="bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="font-mono text-sm text-blue-800 dark:text-blue-200">
                  {funcName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
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
  
  // 함수를 시작/종료로 그룹화
  const startFunctions = functions.filter(fn => !fn.endsWith(' 종료'))
  const endFunctions = functions.filter(fn => fn.endsWith(' 종료'))
  
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-game-text mb-4">
        함수의 시작과 종료를 구분하여 LIFO 순서로 선택하세요
      </div>
      
      {/* 함수 시작 그룹 */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span>📥</span> 함수 시작 (Push)
        </h4>
        <div className="space-y-1">
          {startFunctions.map((functionName, index) => (
            <FunctionButton
              key={`start-${index}`}
              functionName={functionName}
              type="start"
              isSelected={selectedFunctions.includes(functionName)}
              selectionIndex={selectedFunctions.indexOf(functionName)}
              onSelect={onFunctionSelect}
            />
          ))}
        </div>
      </div>
      
      {/* 함수 종료 그룹 */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <span>📤</span> 함수 종료 (Pop)
        </h4>
        <div className="space-y-1">
          {endFunctions.map((functionName, index) => (
            <FunctionButton
              key={`end-${index}`}
              functionName={functionName}
              type="end"
              isSelected={selectedFunctions.includes(functionName)}
              selectionIndex={selectedFunctions.indexOf(functionName)}
              onSelect={onFunctionSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 함수 버튼 컴포넌트
 */
const FunctionButton: React.FC<{
  functionName: string
  type: 'start' | 'end'
  isSelected: boolean
  selectionIndex: number
  onSelect: (functionName: string) => void
}> = ({ functionName, type, isSelected, selectionIndex, onSelect }) => {
  
  const typeStyles = {
    start: {
      selected: "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600",
      default: "border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/10"
    },
    end: {
      selected: "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-600",
      default: "border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/10"
    }
  }
  
  return (
    <button
      onClick={() => onSelect(functionName)}
      className={cn(
        "w-full p-2 text-left rounded border transition-all text-sm",
        "bg-white dark:bg-slate-800",
        isSelected ? typeStyles[type].selected : typeStyles[type].default,
        !isSelected && "text-gray-700 dark:text-slate-200"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs">
            {type === 'start' ? '📥' : '📤'}
          </span>
          <span className="font-mono">{functionName}</span>
        </div>
        {isSelected && (
          <span className={cn(
            "text-white text-xs px-2 py-0.5 rounded-full",
            type === 'start' ? 'bg-blue-500' : 'bg-red-500'
          )}>
            {selectionIndex + 1}
          </span>
        )}
      </div>
    </button>
  )
}

// 유틸리티 함수
function getPlayModeDescription(playMode: string): string {
  switch (playMode) {
    case 'order-prediction': 
      return '함수들을 실행될 순서대로 선택하세요'
    case 'start-end-tracking': 
      return '함수의 시작과 종료를 LIFO 순서로 선택하세요'
    case 'queue-states': 
      return '각 큐의 상태 변화를 예측하세요'
    case 'snapshot-building': 
      return '실행 시점별 스택 상태를 구성하세요'
    default: 
      return '게임 방식을 확인하세요'
  }
}