// 큐 스냅샷 빌더 패널 (Layout B용)
// 이벤트 루프의 각 단계에서 3개 큐의 상태를 구성

import React, { useState } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Check, AlertCircle, Plus, ChevronLeft, ChevronRight, BookOpen, Users, Sparkles, Calendar } from 'lucide-react'
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
      title="📋 사서 업무 일지" 
      className={cn("flex flex-col overflow-hidden", className)}
    >
      {/* 나무 질감 배경 */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(139, 69, 19, 0.1) 60px, rgba(139, 69, 19, 0.1) 61px)`,
        }}
      />

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
        <div className="px-4 py-2 border-b border-editor-border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                단계 {currentStep + 1}: {currentStepData.description}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                라인 {currentStepData.currentLine}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isValidated !== undefined && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded flex items-center gap-1",
                  isValidated 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                )}>
                  {isValidated ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
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
      <div className="p-4 border-t border-editor-border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <button
          onClick={handleValidateStep}
          disabled={!currentQueueStates}
          className={cn(
            "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
            currentQueueStates
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400"
          )}
        >
          <BookOpen className="w-4 h-4" />
          단계 {currentStep + 1} 업무 확인
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
    <div className="px-4 py-3 border-b border-editor-border bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-800/20 dark:to-orange-800/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Users className="w-4 h-4" />
          사서 업무 단계
        </h3>
        <div className="text-xs text-amber-700 dark:text-amber-300">
          {currentStep + 1}/{executionSteps.length}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 overflow-x-auto">
        {executionSteps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full border-2 text-xs font-medium transition-all transform hover:scale-110",
              index === currentStep
                ? "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-600 text-white shadow-lg"
                : validationResults[index]?.isValid
                  ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-600"
                  : validationResults[index]?.isValid === false
                    ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-600"
                    : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-600 dark:hover:bg-amber-900/50"
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
    { type: 'callstack' as QueueType, label: '📚 메인 서가', color: 'amber', icon: BookOpen },
    { type: 'microtask' as QueueType, label: '⚡ 긴급 처리대', color: 'blue', icon: Sparkles },
    { type: 'macrotask' as QueueType, label: '📅 예약 처리대', color: 'orange', icon: Calendar }
  ]

  return (
    <div className="flex border-b border-editor-border">
      {queueTabs.map(({ type, label, color, icon: Icon }) => {
        const count = queueStates?.[type]?.length || 0
        const isSelected = selectedQueue === type
        
        return (
          <button
            key={type}
            onClick={() => onQueueSelect(type)}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2 relative overflow-hidden",
              isSelected
                ? `border-${color}-500 text-${color}-800 dark:text-${color}-200`
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            )}
            style={{
              background: isSelected 
                ? `linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to))`
                : undefined,
              '--tw-gradient-from': isSelected && type === 'callstack' ? 'rgb(254, 243, 199)' : 
                                   isSelected && type === 'microtask' ? 'rgb(219, 234, 254)' :
                                   isSelected && type === 'macrotask' ? 'rgb(254, 235, 200)' : '',
              '--tw-gradient-to': isSelected && type === 'callstack' ? 'rgb(253, 230, 138)' :
                                 isSelected && type === 'microtask' ? 'rgb(191, 219, 254)' :
                                 isSelected && type === 'macrotask' ? 'rgb(253, 224, 171)' : ''
            } as React.CSSProperties}
          >
            {/* 나무 질감 오버레이 */}
            {isSelected && (
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.05) 20px, rgba(0,0,0,0.05) 21px)`
                }}
              />
            )}
            
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isSelected 
                  ? type === 'callstack' ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200" :
                    type === 'microtask' ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200" :
                    "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
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
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
      {/* 상단: 사용 가능한 함수들 */}
      <div className="h-1/2 border-b border-editor-border p-4">
        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          처리 대기 도서
        </h4>
        <div className="space-y-2 max-h-full overflow-y-auto">
          {remainingFunctions.map(funcName => (
            <motion.button
              key={funcName}
              onClick={() => onAddFunction(funcName)}
              className="w-full p-3 text-left border rounded-lg transition-all text-sm relative overflow-hidden group"
              style={{
                background: 'linear-gradient(to right, rgb(254, 243, 199), rgb(254, 235, 200))',
                borderColor: 'rgb(251, 191, 36)'
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(to right, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))'
                }}
              />
              <div className="flex items-center justify-between relative z-10">
                <span className="font-mono font-medium text-amber-900 dark:text-amber-100">{funcName}</span>
                <Plus className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              </div>
            </motion.button>
          ))}
          {remainingFunctions.length === 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300 text-center py-4">
              모든 도서가 처리 중입니다
            </p>
          )}
        </div>
      </div>

      {/* 하단: 현재 큐 상태 */}
      <div className="h-1/2 p-4">
        <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
          {queueType === 'callstack' ? <BookOpen className="w-4 h-4" /> :
           queueType === 'microtask' ? <Sparkles className="w-4 h-4" /> :
           <Calendar className="w-4 h-4" />}
          {getQueueDisplayName(queueType)} 현황
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
                  className="flex items-center justify-between p-3 border rounded-lg transition-all cursor-move relative overflow-hidden group"
                  style={{
                    background: queueType === 'callstack' 
                      ? 'linear-gradient(to right, rgb(254, 243, 199), rgb(253, 230, 138))'
                      : queueType === 'microtask'
                      ? 'linear-gradient(to right, rgb(219, 234, 254), rgb(191, 219, 254))'
                      : 'linear-gradient(to right, rgb(254, 235, 200), rgb(253, 224, 171))',
                    borderColor: queueType === 'callstack' ? 'rgb(217, 119, 6)' :
                                queueType === 'microtask' ? 'rgb(59, 130, 246)' :
                                'rgb(234, 88, 12)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0.1))'
                    }}
                  />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-60">
                        {queueType === 'callstack' ? items.length - index : index + 1}
                      </span>
                      <span className={cn(
                        "font-mono text-sm font-medium",
                        queueType === 'callstack' ? "text-amber-900" :
                        queueType === 'microtask' ? "text-blue-900" :
                        "text-orange-900"
                      )}>
                        {item.functionName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFunction(index)}
                    className="text-red-500 hover:text-red-700 p-1 relative z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="text-center py-8 text-amber-700 dark:text-amber-300">
            <div className="text-2xl mb-2">
              {queueType === 'callstack' ? '📚' : 
               queueType === 'microtask' ? '⚡' : '📅'}
            </div>
            <p className="text-sm">
              {queueType === 'callstack' ? '메인 서가가' : 
               queueType === 'microtask' ? '긴급 처리대가' : '예약 처리대가'} 비어있습니다
            </p>
            <p className="text-xs mt-1 opacity-75">
              위에서 도서를 선택해 배치하세요
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
    case 'callstack': return '메인 서가'
    case 'microtask': return '긴급 처리대'
    case 'macrotask': return '예약 처리대'
    default: return '처리대'
  }
}