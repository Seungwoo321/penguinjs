// 함수 선택기 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { FunctionSelectorPanelProps } from '../../../types/layout'
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
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
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
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-xs text-gray-600 dark:text-gray-400">
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
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                    : "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 dark:hover:text-blue-400"
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
      
      {/* 선택된 함수 목록 (순서 재정렬 가능) */}
      {selectedFunctions.length > 0 && onReorder && (
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                      {index + 1}. {functionName}
                    </span>
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20"
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
        <div className="font-bold text-sm mb-2 p-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
          📥 함수 시작 (Push)
        </div>
        <div className="space-y-2">
          {functions.map((functionName) => (
            <button
              key={`${functionName}_start`}
              onClick={() => onFunctionSelect(`${functionName}_start`)}
              className="w-full p-3 text-left rounded-lg border transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📥</span>
                  <span className="font-mono text-sm">{functionName}()</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded">
                  시작
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* 함수 종료 그룹 (Pop) */}
      <div>
        <div className="font-bold text-sm mb-2 p-2 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
          📤 함수 종료 (Pop)
        </div>
        <div className="space-y-2">
          {functions.map((functionName) => (
            <button
              key={`${functionName}_end`}
              onClick={() => onFunctionSelect(`${functionName}_end`)}
              className="w-full p-3 text-left rounded-lg border transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 dark:text-red-400">📤</span>
                  <span className="font-mono text-sm">{functionName}()</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded">
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