// 스냅샷 빌더 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { SnapshotBuilderPanelProps } from '@/games/callstack-library/types/layout'
import { useResponsiveLayout } from '@/games/callstack-library/hooks/useResponsiveLayout'

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
  const responsiveLayout = useResponsiveLayout()
  return (
    <GamePanel 
      title="📸 스냅샷 빌더" 
      className={cn("flex flex-col", className)}
    >
      {/* 도서관 헤더 */}
      <div 
        className="px-4 py-2 border-b"
        style={{
          background: 'rgb(var(--game-callstack-queue-callstack-light))',
          borderColor: 'rgb(var(--game-callstack-queue-callstack-light))'
        }}
      >
        <p 
          className="flex items-center gap-2"
          style={{
            fontSize: responsiveLayout.config.fontSize.caption,
            color: 'rgb(var(--game-callstack-queue-callstack-text-secondary))'
          }}
        >
          📋 각 단계별 도서관 상태를 기록하세요
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
      <div 
        className="px-4 py-2 border-t"
        style={{
          backgroundColor: 'rgb(var(--game-callstack-background-elevated))',
          borderColor: 'rgb(var(--game-callstack-border))'
        }}
      >
        <div 
          className="flex justify-between items-center text-xs"
          style={{
            color: 'rgb(var(--game-callstack-text-secondary))'
          }}
        >
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
      <h4 
        className="text-sm font-medium"
        style={{
          color: 'rgb(var(--game-callstack-text-primary))'
        }}
      >
        실행 단계 선택
      </h4>
      
      <div className="grid grid-cols-4 gap-2">
        {executionSteps.map((_, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className="h-8 text-xs rounded border transition-all flex items-center justify-center"
            style={{
              backgroundColor: currentStep === index 
                ? 'rgb(var(--game-callstack-primary))'
                : 'rgb(var(--game-callstack-background-elevated))',
              color: currentStep === index
                ? 'white'
                : 'rgb(var(--game-callstack-text-secondary))',
              borderColor: currentStep === index
                ? 'rgb(var(--game-callstack-primary))'
                : 'rgb(var(--game-callstack-border))'
            }}
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
      <h4 
        className="text-sm font-medium"
        style={{
          color: 'rgb(var(--game-callstack-text-primary))'
        }}
      >
        단계 {step + 1}의 큐 상태 구성
      </h4>
      
      {/* 사용 가능한 함수들 */}
      <div className="space-y-2">
        <h5 
          className="text-xs font-semibold" 
          style={{ color: 'rgb(var(--game-callstack-text-muted))' }}
        >
          사용 가능한 함수들
        </h5>
        <div className="grid grid-cols-2 gap-1">
          {availableFunctions.map((func, index) => (
            <div
              key={index}
              className="p-1 text-xs rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: 'rgb(var(--game-callstack-background-secondary))',
                borderColor: 'rgb(var(--game-callstack-border))',
                color: 'rgb(var(--game-callstack-text-secondary))'
              }}
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
    <div 
      className="border-2 rounded-lg p-3"
      style={{
        borderColor: queueConfig.borderColor
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{queueConfig.icon}</span>
          <span className="text-sm font-semibold">{queueConfig.name}</span>
        </div>
        <span 
          className="text-xs"
          style={{
            color: 'rgb(var(--game-callstack-text-muted))'
          }}
        >
          ({items.length}개)
        </span>
      </div>
      
      {/* 드롭 영역 */}
      <div 
        className="min-h-[60px] border-2 border-dashed rounded p-2 flex flex-wrap gap-1 items-start"
        style={{
          borderColor: queueConfig.dropZoneBorderColor
        }}
      >
        {items.length === 0 ? (
          <div 
            className="text-xs italic w-full text-center py-2"
            style={{
              color: 'rgb(var(--game-callstack-text-muted))'
            }}
          >
            함수를 드래그해서 추가하세요
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="px-2 py-1 text-xs rounded border flex items-center gap-1"
              style={{
                backgroundColor: queueConfig.itemBackgroundColor,
                borderColor: queueConfig.itemBorderColor,
                color: queueConfig.itemTextColor
              }}
            >
              <span>{item}</span>
              <button
                onClick={() => removeItem(index)}
                className="hover:opacity-80 transition-opacity"
                style={{
                  color: 'rgb(var(--game-callstack-error))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(var(--game-callstack-error))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgb(var(--game-callstack-error))'
                }}
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
      borderColor: 'rgb(var(--game-callstack-queue-callstack-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-callstack-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-callstack-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-callstack-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-callstack-text))'
    },
    microtask: {
      name: '마이크로태스크',
      icon: '⚡',
      borderColor: 'rgb(var(--game-callstack-queue-microtask-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-microtask-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-microtask-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-microtask-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-microtask-text))'
    },
    macrotask: {
      name: '매크로태스크',
      icon: '⏰',
      borderColor: 'rgb(var(--game-callstack-queue-macrotask-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-macrotask-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-macrotask-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-macrotask-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-macrotask-text))'
    },
    animation: {
      name: '애니메이션',
      icon: '🎬',
      borderColor: 'rgb(var(--game-callstack-queue-animation-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-animation-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-animation-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-animation-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-animation-text))'
    },
    io: {
      name: 'I/O',
      icon: '💾',
      borderColor: 'rgb(var(--game-callstack-queue-io-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-io-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-io-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-io-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-io-text))'
    },
    worker: {
      name: 'Worker',
      icon: '👷',
      borderColor: 'rgb(var(--game-callstack-queue-worker-primary))',
      dropZoneBorderColor: 'rgb(var(--game-callstack-queue-worker-light))',
      itemBackgroundColor: 'rgb(var(--game-callstack-queue-worker-background))',
      itemBorderColor: 'rgb(var(--game-callstack-queue-worker-light))',
      itemTextColor: 'rgb(var(--game-callstack-queue-worker-text))'
    }
  }
  
  return configs[queueType as keyof typeof configs] || configs.callstack
}