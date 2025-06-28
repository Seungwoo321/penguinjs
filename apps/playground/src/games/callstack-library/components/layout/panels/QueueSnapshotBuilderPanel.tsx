// 큐 스냅샷 빌더 패널 (Layout B용)
// 이벤트 루프의 각 단계에서 3개 큐의 상태를 구성

import React, { useState } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Check, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { QueueSnapshotBuilderPanelProps } from '../../../types/layout'
import { QueueType, QueueItem } from '../../../types'

/**
 * 큐 스냅샷 빌더 패널 (Layout B 전용)
 * 실행 단계별로 콜스택, 마이크로태스크, 매크로태스크 큐의 상태를 구성
 */
export const QueueSnapshotBuilderPanel: React.FC<QueueSnapshotBuilderPanelProps> = ({
  executionSteps,
  currentStep,
  queueStates,
  onQueueStateChange,
  onValidateQueueStep,
  validationResults,
  availableFunctions,
  className
}) => {
  const [selectedQueue, setSelectedQueue] = useState<QueueType>('callstack')
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set())
  
  const currentStepData = executionSteps[currentStep]
  const currentQueueStates = queueStates[currentStep]
  const isValidated = validationResults[currentStep]?.isValid

  // 현재 선택된 큐의 아이템들
  const getCurrentQueueItems = (): QueueItem[] => {
    if (!currentQueueStates) return []
    
    switch (selectedQueue) {
      case 'callstack':
        return currentQueueStates.callstack
      case 'microtask':
        return currentQueueStates.microtask
      case 'macrotask':
        return currentQueueStates.macrotask
      default:
        return []
    }
  }

  // 큐에 함수 추가
  const handleAddFunction = (funcName: string) => {
    if (!currentQueueStates) {
      // currentQueueStates가 없으면 기본 상태 생성
      const defaultQueueStates = {
        callstack: [],
        microtask: [],
        macrotask: [],
        step: currentStep,
        timestamp: Date.now()
      }
      
      const newItem: QueueItem = {
        id: `${selectedQueue}-${funcName}-${currentStep}-${Date.now()}`,
        functionName: funcName,
        color: getFunctionColor(funcName),
        height: 40,
        queueType: selectedQueue,
        timestamp: Date.now(),
        position: 0
      }

      const newQueueStates = {
        ...defaultQueueStates,
        [selectedQueue]: [newItem]
      }

      onQueueStateChange(currentStep, newQueueStates)
      return
    }
    
    const newItem: QueueItem = {
      id: `${selectedQueue}-${funcName}-${currentStep}-${Date.now()}`,
      functionName: funcName,
      color: getFunctionColor(funcName),
      height: 40,
      queueType: selectedQueue,
      timestamp: Date.now(),
      position: getCurrentQueueItems().length
    }

    const newQueueStates = {
      ...currentQueueStates,
      [selectedQueue]: [...getCurrentQueueItems(), newItem]
    }

    onQueueStateChange(currentStep, newQueueStates)
  }

  // 큐에서 함수 제거
  const handleRemoveFunction = (index: number) => {
    if (!currentQueueStates) return
    
    const currentItems = getCurrentQueueItems()
    const newItems = currentItems.filter((_, i) => i !== index)
    
    const newQueueStates = {
      ...currentQueueStates,
      [selectedQueue]: newItems
    }

    onQueueStateChange(currentStep, newQueueStates)
  }

  // 큐 아이템 순서 변경
  const handleReorderQueue = (newOrder: QueueItem[]) => {
    if (!currentQueueStates) return
    
    const newQueueStates = {
      ...currentQueueStates,
      [selectedQueue]: newOrder
    }

    onQueueStateChange(currentStep, newQueueStates)
  }

  // 현재 단계 검증
  const handleValidateStep = () => {
    onValidateQueueStep(currentStep)
  }

  return (
    <GamePanel 
      title="📋 반납 처리 계획서" 
      className={cn("flex flex-col overflow-hidden", className)}
    >
      {/* 실행 단계 선택기 */}
      <ExecutionStepSelector
        executionSteps={executionSteps}
        currentStep={currentStep}
        validationResults={validationResults}
        onStepChange={(step) => {
          // 부모 컴포넌트에서 처리하도록 이벤트 전파 필요
          // onStepChange?.(step)
        }}
      />

      {/* 큐 선택 탭 */}
      <QueueSelector
        selectedQueue={selectedQueue}
        onQueueSelect={setSelectedQueue}
        queueStates={currentQueueStates}
      />

      {/* 현재 단계 정보 */}
      {currentStepData && (
        <div className="px-4 py-2 border-b border-editor-border bg-surface-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-game-text">
                단계 {currentStep + 1}: {currentStepData.description}
              </p>
              <p className="text-xs text-game-text-secondary">
                라인 {currentStepData.currentLine}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isValidated !== undefined && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded",
                  isValidated 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                )}>
                  {isValidated ? "✓ 정답" : "✗ 오답"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 큐 상태 빌더 */}
      <div className="flex-1 overflow-hidden">
        <QueueStateBuilder
          queueType={selectedQueue}
          items={getCurrentQueueItems()}
          availableFunctions={availableFunctions}
          onAddFunction={handleAddFunction}
          onRemoveFunction={handleRemoveFunction}
          onReorderItems={handleReorderQueue}
        />
      </div>

      {/* 검증 버튼 */}
      <div className="p-4 border-t border-editor-border bg-surface-secondary">
        <button
          onClick={handleValidateStep}
          disabled={!currentQueueStates}
          className={cn(
            "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all",
            currentQueueStates
              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400"
          )}
        >
          단계 {currentStep + 1} 검증하기
        </button>
      </div>
    </GamePanel>
  )
}

/**
 * 실행 단계 선택기
 */
interface ExecutionStepSelectorProps {
  executionSteps: any[]
  currentStep: number
  validationResults: Record<number, any>
  onStepChange: (step: number) => void
}

const ExecutionStepSelector: React.FC<ExecutionStepSelectorProps> = ({
  executionSteps,
  currentStep,
  validationResults,
  onStepChange
}) => {
  return (
    <div className="px-4 py-3 border-b border-editor-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-game-text">처리 단계</h3>
        <div className="text-xs text-game-text-secondary">
          {currentStep + 1}/{executionSteps.length}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 overflow-x-auto">
        {executionSteps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full border-2 text-xs font-medium transition-all",
              index === currentStep
                ? "bg-blue-500 border-blue-500 text-white"
                : validationResults[index]?.isValid
                  ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-600"
                  : validationResults[index]?.isValid === false
                    ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-600"
                    : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * 큐 선택 탭
 */
interface QueueSelectorProps {
  selectedQueue: QueueType
  onQueueSelect: (queue: QueueType) => void
  queueStates?: any
}

const QueueSelector: React.FC<QueueSelectorProps> = ({
  selectedQueue,
  onQueueSelect,
  queueStates
}) => {
  const queueTabs = [
    { type: 'callstack' as QueueType, label: '📚 대출함', color: 'amber' },
    { type: 'microtask' as QueueType, label: '⚡ 긴급반납대', color: 'emerald' },
    { type: 'macrotask' as QueueType, label: '⏰ 일반반납대', color: 'orange' }
  ]

  return (
    <div className="flex border-b border-editor-border">
      {queueTabs.map(({ type, label, color }) => {
        const count = queueStates?.[type]?.length || 0
        const isSelected = selectedQueue === type
        
        return (
          <button
            key={type}
            onClick={() => onQueueSelect(type)}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2",
              isSelected
                ? `border-${color}-500 bg-${color}-50 text-${color}-800 dark:bg-${color}-900/20 dark:text-${color}-400`
                : "border-transparent text-game-text-secondary hover:text-game-text hover:bg-surface-secondary"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{label}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                isSelected 
                  ? `bg-${color}-100 text-${color}-800 dark:bg-${color}-800 dark:text-${color}-300`
                  : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
              )}>
                {count}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * 큐 상태 빌더 메인 컴포넌트
 */
interface QueueStateBuilderProps {
  queueType: QueueType
  items: QueueItem[]
  availableFunctions: string[]
  onAddFunction: (funcName: string) => void
  onRemoveFunction: (index: number) => void
  onReorderItems: (newOrder: QueueItem[]) => void
}

const QueueStateBuilder: React.FC<QueueStateBuilderProps> = ({
  queueType,
  items,
  availableFunctions,
  onAddFunction,
  onRemoveFunction,
  onReorderItems
}) => {
  // 이미 추가된 함수 제외한 사용 가능한 함수들
  const remainingFunctions = availableFunctions.filter(func => 
    !items.some(item => item.functionName === func)
  )

  return (
    <div className="h-full flex flex-col">
      {/* 상단: 사용 가능한 함수들 */}
      <div className="h-1/2 border-b border-editor-border p-4">
        <h4 className="text-sm font-medium text-game-text mb-3">
          반납할 책들
        </h4>
        <div className="space-y-2 max-h-full overflow-y-auto">
          {remainingFunctions.map(funcName => (
            <motion.button
              key={funcName}
              onClick={() => onAddFunction(funcName)}
              className="w-full p-3 text-left border rounded-lg transition-all text-sm bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 dark:hover:text-blue-400"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium">{funcName}</span>
                <Plus className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
          {remainingFunctions.length === 0 && (
            <p className="text-sm text-game-text-secondary text-center py-4">
              모든 책이 반납대에 배치되었습니다
            </p>
          )}
        </div>
      </div>

      {/* 하단: 현재 큐 상태 */}
      <div className="h-1/2 p-4">
        <h4 className="text-sm font-medium text-game-text mb-3">
          {getQueueDisplayName(queueType)} 상태
        </h4>
        
        {items.length > 0 ? (
          <Reorder.Group 
            axis="y" 
            values={items} 
            onReorder={onReorderItems}
            className="space-y-2"
          >
            {items.map((item, index) => (
              <Reorder.Item 
                key={item.id} 
                value={item}
                className="cursor-move"
              >
                <motion.div
                  className="flex items-center justify-between p-3 border rounded-lg transition-all cursor-move bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-game-text-secondary font-medium">
                        {queueType === 'callstack' ? items.length - index : index + 1}
                      </span>
                      <span className="font-mono text-sm font-medium text-amber-800 dark:text-amber-200">
                        {item.functionName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFunction(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="text-center py-8 text-game-text-secondary">
            <div className="text-2xl mb-2">📭</div>
            <p className="text-sm">
              {queueType === 'callstack' ? '대출함이' : '반납대가'} 비어있습니다
            </p>
            <p className="text-xs mt-1">
              왼쪽에서 책을 선택해 배치하세요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// 유틸리티 함수들
function getFunctionColor(functionName: string): string {
  const colors: Record<string, string> = {
    '<global>': 'rgb(107, 114, 128)',
    'setTimeout': 'rgb(239, 68, 68)',
    'queueMicrotask': 'rgb(34, 197, 94)',
    'Promise': 'rgb(168, 85, 247)',
    'console.log': 'rgb(251, 146, 60)',
  }
  return colors[functionName] || 'rgb(59, 130, 246)'
}

function getQueueDisplayName(queueType: QueueType): string {
  switch (queueType) {
    case 'callstack': return '현재 대출함'
    case 'microtask': return '긴급 반납대'
    case 'macrotask': return '일반 반납대'
    default: return '반납대'
  }
}