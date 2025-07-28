// 큐 스냅샷 빌더 패널 (Layout B용)
// 이벤트 루프의 각 단계에서 3개 큐의 상태를 구성

import React, { useState, useCallback, useMemo, memo } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Check, AlertCircle, Plus, ChevronLeft, ChevronRight, BookOpen, Users, Sparkles, Calendar } from 'lucide-react'
import { QueueSnapshotBuilderPanelProps, QueueStatesSnapshot } from '../../../types/layout'
import { QueueType, QueueItem } from '../../../types'
import { useCallStackLibraryTheme, useCallStackLibraryCSSVariables } from '../../../hooks/useCallStackLibraryTheme'
import { useOptimizedAnimations } from '../../../hooks/useOptimizedAnimations'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'
import type { CallStackQueueType } from '../../../theme/callstackLibraryTheme'
import { useFunctionNameOverflow } from '../../../hooks/useTextOverflow'
import { FunctionNameTooltip } from '../../ui/AdaptiveTooltip'
import { typography, createTextOverflowStyles } from '../../../utils/textUtils'
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization'
import { useMemoryManagement, useLeakDetection } from '../../../hooks/useMemoryManagement'
import { QueueItemComponent } from '../../common/QueueItemComponent'
import { ExecutionController } from '../../common/ExecutionController'
import { ProgressIndicator } from '../../common/ProgressIndicator'
import { useCallStackLibraryContext, ActionType } from '../../../contexts/CallStackLibraryContext'
import { gameEvents } from '../../../utils/eventSystem'

/**
 * 큐 스냅샷 빌더 패널 (Layout B 전용)
 * 실행 단계별로 콜스택, 마이크로태스크, 매크로태스크 큐의 상태를 구성
 */
export const QueueSnapshotBuilderPanel: React.FC<QueueSnapshotBuilderPanelProps> = memo(({
  executionSteps,
  currentStep,
  queueStates,
  onQueueStateChange,
  onValidateQueueStep,
  validationResults,
  availableFunctions,
  queueTypes = ['callstack', 'microtask', 'macrotask'], // 기본값은 타입 B
  className
}) => {
  // Context API 사용으로 중앙 상태 관리
  const { state, dispatch } = useCallStackLibraryContext();
  
  const [selectedQueue, setSelectedQueue] = useState<QueueType>('callstack')
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set())
  
  // 성능 최적화 및 메모리 관리
  const { metrics } = usePerformanceOptimization({
    enableMetrics: process.env.NODE_ENV === 'development',
    maxRenderCount: 30
  })
  const { registerCleanup, isMemoryPressure } = useMemoryManagement({
    enableMonitoring: process.env.NODE_ENV === 'development'
  })
  useLeakDetection('QueueSnapshotBuilderPanel')
  
  // 공통 컴포넌트를 위한 이벤트 핸들러
  const handleStepChange = useCallback(
    (step: number) => {
      dispatch({ type: ActionType.SET_EXECUTION_STEP, payload: step });
      gameEvents.executionStepForward(step, state?.executionSteps?.length || 0);
    },
    [dispatch, state?.executionSteps?.length]
  );
  
  const handleQueueStateUpdate = useCallback(
    (step: number, newState: any) => {
      gameEvents.evaluationSubmit(newState);
      onQueueStateChange?.(step, newState);
    },
    [onQueueStateChange]
  );
  
  // 콜스택 도서관 테마 및 성능 최적화 사용
  const libraryTheme = useCallStackLibraryTheme()
  const cssVariables = useCallStackLibraryCSSVariables()
  const optimizedAnimations = useOptimizedAnimations()
  
  // 상태 계산 (Context 우선)
  const currentExecutionSteps = useMemo(
    () => state.executionSteps || executionSteps,
    [state.executionSteps, executionSteps]
  );
  
  const currentStepValue = useMemo(
    () => state.currentStep ?? currentStep,
    [state.currentStep, currentStep]
  );
  
  const contextQueueStates = useMemo(
    () => state.queueStates || queueStates,
    [state.queueStates, queueStates]
  );
  
  const currentValidationResults = useMemo(
    () => state.validationResults || validationResults,
    [state.validationResults, validationResults]
  );
  const responsiveLayout = useResponsiveLayout()
  
  // 메모이제이션된 데이터
  const currentStepData = useMemo(
    () => executionSteps[currentStep],
    [executionSteps, currentStep]
  )
  const currentQueueStates = useMemo(
    () => contextQueueStates[currentStep] || queueStates[currentStep],
    [contextQueueStates, queueStates, currentStep]
  )
  const isValidated = useMemo(
    () => validationResults[currentStep]?.isValid,
    [validationResults, currentStep]
  )

  // 현재 선택된 큐의 아이템들 (메모이제이션)
  const currentQueueItems = useMemo(
    (): QueueItem[] => {
      if (!currentQueueStates) return []
      
      // 동적으로 큐 타입 지원
      return currentQueueStates[selectedQueue] || []
    },
    [currentQueueStates, selectedQueue]
  )

  // 큐에 함수 추가 (최적화)
  const handleAddFunction = useCallback(
    (funcName: string) => {
    if (!currentQueueStates) {
      // currentQueueStates가 없으면 기본 상태 생성
      const defaultQueueStates = {
        callstack: [],
        microtask: [],
        macrotask: [],
        step: currentStep,
        timestamp: Date.now()
      } as QueueStatesSnapshot
      
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
        [selectedQueue]: [newItem],
        step: currentStep,
        timestamp: Date.now()
      } as QueueStatesSnapshot

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
      position: currentQueueItems.length
    }

    const newQueueStates = {
      ...currentQueueStates,
      [selectedQueue]: [...currentQueueItems, newItem]
    }

    onQueueStateChange(currentStep, newQueueStates)
  },
  [currentStep, selectedQueue, currentQueueStates, currentQueueItems, onQueueStateChange]
)

  // 큐에서 함수 제거
  const handleRemoveFunction = (index: number) => {
    if (!currentQueueStates) return
    
    const currentItems = currentQueueItems
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
    <div 
      className={cn("rounded-lg border bg-white dark:bg-gray-800", className)}
      style={{
        ...cssVariables,
        background: libraryTheme.getLibraryBackground()
      }}
    >
      <GamePanel 
        title="📸 큐 스냅샷 빌더" 
        className="flex flex-col overflow-hidden"
      >
      {/* 도서관 나무 질감 배경 */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: libraryTheme.theme.library.textures.wood,
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
        queueTypes={queueTypes}
      />

      {/* 현재 단계 정보 */}
      {currentStepData && (
        <div 
          className="px-4 py-2 border-b border-editor-border"
          style={{
            background: libraryTheme.getQueueColor('callstack', 'light'),
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="font-medium"
                style={{ 
                  color: libraryTheme.getQueueText('callstack', 'primary'),
                  fontSize: typography.body.medium,
                  ...createTextOverflowStyles({ maxLines: 2, breakWord: true })
                }}
              >
                단계 {currentStep + 1}: {currentStepData.description}
              </p>
              <p 
                className="mt-1"
                style={{ 
                  color: libraryTheme.getQueueText('callstack', 'secondary'),
                  fontSize: typography.caption.large
                }}
              >
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
          items={currentQueueItems}
          availableFunctions={availableFunctions}
          onAddFunction={handleAddFunction}
          onRemoveFunction={handleRemoveFunction}
          onReorderItems={handleReorderQueue}
        />
      </div>

      {/* 검증 버튼 */}
      <div 
        className="p-4 border-t border-editor-border"
        style={{
          background: libraryTheme.getQueueColor('callstack', 'light'),
        }}
      >
        <button
          onClick={handleValidateStep}
          disabled={!currentQueueStates}
          className="w-full rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          style={{
            minHeight: responsiveLayout.config.buttonSize.minHeight,
            padding: responsiveLayout.config.buttonSize.padding,
            fontSize: responsiveLayout.config.fontSize.body,
            ...(currentQueueStates
              ? {
                  background: libraryTheme.getQueueColor('callstack', 'button'),
                  color: libraryTheme.getQueueText('callstack', 'contrast'),
                  boxShadow: libraryTheme.theme.shadows.button,
                  border: `1px solid ${libraryTheme.getQueueBorder('callstack')}`,
                }
              : {
                  background: '#e5e7eb',
                  color: '#6b7280',
                  cursor: 'not-allowed'
                })
          }}
          onMouseEnter={(e) => {
            if (currentQueueStates) {
              e.currentTarget.style.background = libraryTheme.getQueueColor('callstack', 'hover')
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentQueueStates) {
              e.currentTarget.style.background = libraryTheme.getQueueColor('callstack', 'button')
              e.currentTarget.style.transform = 'translateY(0)'
            }
          }}
        >
          <BookOpen className="w-4 h-4" />
          단계 {currentStep + 1} 업무 확인
        </button>
      </div>
      </GamePanel>
    </div>
  )
})

QueueSnapshotBuilderPanel.displayName = 'QueueSnapshotBuilderPanel'

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
  const libraryTheme = useCallStackLibraryTheme()
  
  return (
    <div 
      className="px-4 py-3 border-b border-editor-border"
      style={{
        background: libraryTheme.getQueueColor('callstack', 'light'),
        backgroundImage: libraryTheme.theme.library.textures.wood,
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="flex items-center justify-between">
        <h3 
          className="font-semibold flex items-center gap-2"
          style={{ 
            color: libraryTheme.getQueueText('callstack', 'primary'),
            fontSize: typography.body.medium
          }}
        >
          <Users className="w-4 h-4" />
          사서 업무 단계
        </h3>
        <div 
          className="text-xs"
          style={{ color: libraryTheme.getQueueText('callstack', 'secondary') }}
        >
          {currentStep + 1}/{executionSteps.length}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2 overflow-x-auto">
        {executionSteps.map((step, index) => {
          const isValidated = validationResults[index]?.isValid
          const stepLabel = `단계 ${index + 1}${index === currentStep ? ' (현재 단계)' : ''}${isValidated === true ? ' (정답)' : isValidated === false ? ' (오답)' : ' (미검증)'}`
          
          return (
            <button
              key={index}
              onClick={() => onStepChange(index)}
              className="flex-shrink-0 min-w-11 min-h-11 rounded-full border-2 text-xs font-medium transition-all transform hover:scale-110 flex items-center justify-center"
              aria-label={stepLabel}
              aria-current={index === currentStep ? 'step' : undefined}
            style={
              index === currentStep
                ? {
                    background: libraryTheme.getQueueColor('callstack', 'button'),
                    borderColor: libraryTheme.getQueueBorder('callstack'),
                    color: libraryTheme.getQueueText('callstack', 'contrast'),
                    boxShadow: libraryTheme.theme.shadows.button
                  }
                : validationResults[index]?.isValid
                  ? {
                      background: '#dcfce7',
                      borderColor: '#86efac',
                      color: '#166534'
                    }
                  : validationResults[index]?.isValid === false
                    ? {
                        background: '#fecaca',
                        borderColor: '#fca5a5',
                        color: '#dc2626'
                      }
                    : {
                        background: libraryTheme.getQueueColor('callstack', 'light'),
                        borderColor: libraryTheme.getQueueBorder('callstack', 'light'),
                        color: libraryTheme.getQueueText('callstack', 'primary')
                      }
            }
            >
              {index + 1}
            </button>
          )
        })}
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
  queueTypes?: string[]
}

const QueueSelector: React.FC<QueueSelectorProps> = ({
  selectedQueue,
  onQueueSelect,
  queueStates,
  queueTypes = ['callstack', 'microtask', 'macrotask']
}) => {
  const libraryTheme = useCallStackLibraryTheme()
  
  // queueTypes에 따라 동적으로 탭 생성
  const queueTabsMap = {
    callstack: { type: 'callstack' as QueueType, label: '📚 메인 서가', icon: BookOpen },
    microtask: { type: 'microtask' as QueueType, label: '⚡ 긴급 처리대', icon: Sparkles },
    macrotask: { type: 'macrotask' as QueueType, label: '📅 예약 처리대', icon: Calendar },
    animation: { type: 'animation' as QueueType, label: '🎬 애니메이션', icon: Users },
    generator: { type: 'generator' as QueueType, label: '🔄 제너레이터', icon: Calendar },
    io: { type: 'io' as QueueType, label: '💾 I/O 처리', icon: BookOpen },
    worker: { type: 'worker' as QueueType, label: '👷 워커', icon: Users }
  }
  
  const queueTabs = queueTypes.map(type => queueTabsMap[type]).filter(Boolean)

  return (
    <div className="flex border-b border-editor-border">
      {queueTabs.map(({ type, label, icon: Icon }) => {
        const count = queueStates?.[type]?.length || 0
        const isSelected = selectedQueue === type
        const queueTheme = libraryTheme.getQueueTheme(type as CallStackQueueType)
        
        return (
          <button
            key={type}
            onClick={() => onQueueSelect(type)}
            className="flex-1 px-4 py-3 text-sm font-medium transition-all border-b-2 relative overflow-hidden"
            style={{
              background: isSelected ? queueTheme.gradients.light : undefined,
              borderBottomColor: isSelected ? queueTheme.border.main : 'transparent',
              color: isSelected ? queueTheme.text.primary : '#6b7280'
            }}
          >
            {/* 도서관 나무 질감 오버레이 */}
            {isSelected && (
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: libraryTheme.theme.library.textures.wood
                }}
              />
            )}
            
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={
                  isSelected 
                    ? {
                        backgroundColor: queueTheme.background.main,
                        color: queueTheme.text.primary
                      }
                    : {
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }
                }
              >
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
  const libraryTheme = useCallStackLibraryTheme()
  const optimizedAnimations = useOptimizedAnimations()
  
  // 이미 추가된 함수 제외한 사용 가능한 함수들
  const remainingFunctions = availableFunctions.filter(func => 
    !items.some(item => item.functionName === func)
  )

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        background: libraryTheme.getQueueColor('callstack', 'light'),
        backgroundImage: libraryTheme.theme.library.textures.wood,
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* 상단: 사용 가능한 함수들 */}
      <div className="h-1/2 border-b border-editor-border p-4">
        <h4 
          className="font-medium mb-3 flex items-center gap-2"
          style={{ 
            color: libraryTheme.getQueueText('callstack', 'primary'),
            fontSize: typography.body.medium
          }}
        >
          <BookOpen className="w-4 h-4" />
          처리 대기 도서
        </h4>
        <div className="space-y-2 max-h-full overflow-y-auto">
          {remainingFunctions.map(funcName => {
            return (
              <FunctionButton
                key={funcName}
                functionName={funcName}
                onClick={() => onAddFunction(funcName)}
                libraryTheme={libraryTheme}
                optimizedAnimations={optimizedAnimations}
              />
            );
          })}
          {remainingFunctions.length === 0 && (
            <p 
              className="text-sm text-center py-4"
              style={{ color: libraryTheme.getQueueText('callstack', 'secondary') }}
            >
              모든 도서가 처리 중입니다
            </p>
          )}
        </div>
      </div>

      {/* 하단: 현재 큐 상태 */}
      <div className="h-1/2 p-4">
        <h4 
          className="font-medium mb-3 flex items-center gap-2"
          style={{ 
            color: libraryTheme.getQueueText('callstack', 'primary'),
            fontSize: typography.body.medium
          }}
        >
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
                    background: libraryTheme.getQueueColor(queueType as CallStackQueueType, 'light'),
                    borderColor: libraryTheme.getQueueBorder(queueType as CallStackQueueType),
                    borderRadius: libraryTheme.theme.borderRadius.book,
                    boxShadow: libraryTheme.theme.shadows.button
                  }}
                  {...(optimizedAnimations.shouldAnimate('queueTransition') ? optimizedAnimations.variants.queueTransition : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                  })}
                  whileHover={optimizedAnimations.shouldAnimate('bookHover') ? { scale: 1.02 } : undefined}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: libraryTheme.getQueueColor(queueType as CallStackQueueType, 'hover')
                    }}
                  />
                  <div className="flex items-center gap-3 relative z-10 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span 
                        className="text-xs font-medium opacity-60 flex-shrink-0"
                        style={{ color: libraryTheme.getQueueText(queueType as CallStackQueueType, 'secondary') }}
                      >
                        {queueType === 'callstack' ? items.length - index : index + 1}
                      </span>
                      <QueueItemLabel
                        functionName={item.functionName}
                        queueType={queueType as CallStackQueueType}
                        libraryTheme={libraryTheme}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFunction(index)}
                    className="text-red-500 hover:text-red-700 p-1 relative z-10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div 
            className="text-center py-8"
            style={{ color: libraryTheme.getQueueText('callstack', 'secondary') }}
          >
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

/**
 * 함수명 버튼 컴포넌트 - 텍스트 오버플로우 처리
 */
interface FunctionButtonProps {
  functionName: string;
  onClick: () => void;
  libraryTheme: any;
  optimizedAnimations: any;
}

const FunctionButton: React.FC<FunctionButtonProps> = ({ 
  functionName, 
  onClick, 
  libraryTheme, 
  optimizedAnimations 
}) => {
  const textOverflow = useFunctionNameOverflow(functionName);
  
  return (
    <FunctionNameTooltip
      text={functionName}
      isOverflowing={textOverflow.isOverflowing}
    >
      <motion.button
        ref={textOverflow.ref as any}
        onClick={onClick}
        className="w-full p-3 text-left border rounded-lg transition-all relative overflow-hidden group"
        style={{
          background: libraryTheme.getQueueColor('callstack', 'light'),
          borderColor: libraryTheme.getQueueBorder('callstack', 'light'),
          borderRadius: libraryTheme.theme.borderRadius.book,
          minHeight: '44px', // 접근성 터치 타겟
          fontSize: typography.body.medium
        }}
        whileHover={optimizedAnimations.shouldAnimate('bookHover') ? { scale: 1.02, y: -2 } : undefined}
        whileTap={optimizedAnimations.shouldAnimate('bookHover') ? { scale: 0.98 } : undefined}
        transition={optimizedAnimations.getOptimizedTransition({ duration: 0.15 })}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: libraryTheme.getQueueColor('callstack', 'hover')
          }}
        />
        <div className="flex items-center justify-between relative z-10 min-w-0">
          <span 
            className="font-mono font-medium flex-1 min-w-0"
            style={{ 
              color: libraryTheme.getQueueText('callstack', 'primary'),
              ...textOverflow.styles
            }}
          >
            {textOverflow.displayText}
          </span>
          <Plus 
            className="w-4 h-4 ml-2 flex-shrink-0"
            style={{ color: libraryTheme.getQueueText('callstack', 'secondary') }}
          />
        </div>
      </motion.button>
    </FunctionNameTooltip>
  );
};

/**
 * 큐 아이템 라벨 컴포넌트 - 텍스트 오버플로우 처리
 */
interface QueueItemLabelProps {
  functionName: string;
  queueType: CallStackQueueType;
  libraryTheme: any;
}

const QueueItemLabel: React.FC<QueueItemLabelProps> = ({
  functionName,
  queueType,
  libraryTheme
}) => {
  const textOverflow = useFunctionNameOverflow(functionName);
  
  return (
    <FunctionNameTooltip
      text={functionName}
      isOverflowing={textOverflow.isOverflowing}
    >
      <span 
        ref={textOverflow.ref as any}
        className="font-mono font-medium min-w-0 flex-1"
        style={{ 
          color: libraryTheme.getQueueText(queueType, 'primary'),
          fontSize: typography.body.medium,
          ...textOverflow.styles
        }}
      >
        {textOverflow.displayText}
      </span>
    </FunctionNameTooltip>
  );
};