// 스냅샷 빌더 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { SnapshotBuilderPanelProps } from '../../../types/layout'

/**
 * 스냅샷 빌더 패널
 * 고급 레이아웃 (B, C, D)에서 사용되는 실행 시점별 상태 구성 도구
 */
export const SnapshotBuilderPanel: React.FC<SnapshotBuilderPanelProps> = ({
  executionSteps,
  currentStep,
  onSnapshotChange,
  className
}) => {
  
  return (
    <GamePanel title="📸 스냅샷 빌더" className={cn("flex flex-col", className)}>
      {/* 설명 텍스트 */}
      <div className="px-4 py-2 border-b border-editor-border">
        <p className="text-xs text-game-text-secondary">
          각 실행 시점의 큐 상태를 구성하세요
        </p>
      </div>
      
      {/* 스냅샷 빌더 영역 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          
          {/* 실행 단계 선택기 */}
          <StepSelector
            executionSteps={executionSteps}
            currentStep={currentStep}
            onStepChange={(step) => onSnapshotChange(step, {})}
          />
          
          {/* 현재 단계의 스냅샷 구성기 */}
          <SnapshotBuilder
            step={currentStep}
            onSnapshotChange={onSnapshotChange}
          />
          
        </div>
      </div>
      
      {/* 하단 정보 */}
      <div className="px-4 py-2 border-t border-editor-border bg-surface-secondary">
        <div className="flex justify-between items-center text-xs text-game-text-secondary">
          <span>단계: {currentStep + 1} / {executionSteps.length}</span>
          <span>완성도: 75%</span>
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 실행 단계 선택기
 */
const StepSelector: React.FC<{
  executionSteps: any[]
  currentStep: number
  onStepChange: (step: number) => void
}> = ({ executionSteps, currentStep, onStepChange }) => {
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">실행 단계 선택</h4>
      
      <div className="grid grid-cols-4 gap-2">
        {executionSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className={cn(
              "h-8 text-xs rounded border transition-all",
              "flex items-center justify-center",
              currentStep === index
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
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
 * 스냅샷 구성기
 */
const SnapshotBuilder: React.FC<{
  step: number
  onSnapshotChange: (step: number, snapshot: any) => void
}> = ({ step, onSnapshotChange }) => {
  
  // 임시 큐 상태 (실제로는 props로 받아올 예정)
  const queues = ['callstack', 'microtask', 'macrotask']
  const availableFunctions = ['main()', 'outer()', 'inner()', 'Promise.then', 'setTimeout']
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-game-text">
        단계 {step + 1}의 큐 상태 구성
      </h4>
      
      {/* 사용 가능한 함수들 */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          사용 가능한 함수들
        </h5>
        <div className="grid grid-cols-2 gap-1">
          {availableFunctions.map((func, index) => (
            <div
              key={index}
              className="p-1 text-xs bg-gray-100 border border-gray-200 rounded cursor-pointer hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600"
              draggable
            >
              {func}
            </div>
          ))}
        </div>
      </div>
      
      {/* 큐별 구성 영역 */}
      <div className="space-y-3">
        {queues.map((queueType) => (
          <QueueBuilder
            key={queueType}
            queueType={queueType}
            step={step}
            onQueueChange={(queueState) => {
              onSnapshotChange(step, { [queueType]: queueState })
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * 개별 큐 구성기
 */
const QueueBuilder: React.FC<{
  queueType: string
  step: number
  onQueueChange: (queueState: any[]) => void
}> = ({ queueType, step, onQueueChange }) => {
  
  const queueConfig = getQueueConfig(queueType)
  const [items, setItems] = React.useState<string[]>([])
  
  const addItem = (item: string) => {
    const newItems = [...items, item]
    setItems(newItems)
    onQueueChange(newItems)
  }
  
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    onQueueChange(newItems)
  }
  
  return (
    <div className={cn(
      "border-2 rounded-lg p-3",
      queueConfig.borderColor
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{queueConfig.icon}</span>
          <span className="text-sm font-semibold">{queueConfig.name}</span>
        </div>
        <span className="text-xs text-gray-500">({items.length}개)</span>
      </div>
      
      {/* 드롭 영역 */}
      <div className={cn(
        "min-h-[60px] border-2 border-dashed rounded p-2",
        "flex flex-wrap gap-1 items-start",
        queueConfig.dropZoneBorder
      )}>
        {items.length === 0 ? (
          <div className="text-xs text-gray-400 italic w-full text-center py-2">
            함수를 드래그해서 추가하세요
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "px-2 py-1 text-xs rounded border",
                "flex items-center gap-1",
                queueConfig.itemStyle
              )}
            >
              <span>{item}</span>
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// 유틸리티 함수
function getQueueConfig(queueType: string) {
  const configs = {
    callstack: {
      name: '콜스택',
      icon: '📥',
      borderColor: 'border-blue-500',
      dropZoneBorder: 'border-blue-300',
      itemStyle: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    microtask: {
      name: '마이크로태스크',
      icon: '⚡',
      borderColor: 'border-green-500',
      dropZoneBorder: 'border-green-300',
      itemStyle: 'bg-green-100 border-green-300 text-green-800'
    },
    macrotask: {
      name: '매크로태스크',
      icon: '⏰',
      borderColor: 'border-yellow-500',
      dropZoneBorder: 'border-yellow-300',
      itemStyle: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    animation: {
      name: '애니메이션',
      icon: '🎬',
      borderColor: 'border-purple-500',
      dropZoneBorder: 'border-purple-300',
      itemStyle: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    io: {
      name: 'I/O',
      icon: '💾',
      borderColor: 'border-red-500',
      dropZoneBorder: 'border-red-300',
      itemStyle: 'bg-red-100 border-red-300 text-red-800'
    },
    worker: {
      name: 'Worker',
      icon: '👷',
      borderColor: 'border-gray-500',
      dropZoneBorder: 'border-gray-300',
      itemStyle: 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }
  
  return configs[queueType as keyof typeof configs] || configs.callstack
}