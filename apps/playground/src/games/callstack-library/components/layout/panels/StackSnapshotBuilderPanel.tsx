// 특정 시점 책장 구성 패널 컴포넌트 (타입 E 전용)

import React, { useState } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Check, AlertCircle, Plus } from 'lucide-react'
import { StackItem } from '../../../types'

interface StackSnapshotBuilderPanelProps {
  currentStep: number
  totalSteps: number
  availableFunctions: string[]
  userSnapshot: StackItem[]
  onAddFunction: (funcName: string) => void
  onRemoveFunction: (index: number) => void
  onReorderSnapshot: (newOrder: StackItem[]) => void
  onValidateSnapshot: () => void
  onStepChange?: (step: number) => void  // 스텝 변경 핸들러 추가
  snapshotCheckpoints?: number[]  // 스냅샷을 구성해야 하는 스텝들
  validationResults?: Record<number, boolean>  // 스텝별 검증 결과
  className?: string
}

/**
 * 특정 시점 책장 구성 패널 (타입 E 전용)
 * 체크포인트에서 책장에 있을 책들을 드래그 앤 드롭으로 배치
 */
export const StackSnapshotBuilderPanel: React.FC<StackSnapshotBuilderPanelProps> = ({
  currentStep,
  totalSteps,
  availableFunctions,
  userSnapshot,
  onAddFunction,
  onRemoveFunction,
  onReorderSnapshot,
  onValidateSnapshot,
  onStepChange,
  snapshotCheckpoints = [],
  validationResults = {},
  className
}) => {
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set())
  
  // 현재 스텝이 스냅샷 체크포인트인지 확인
  const isCheckpoint = snapshotCheckpoints.includes(currentStep)
  const isValidated = validationResults[currentStep]
  
  // 사용 가능한 함수 중 아직 추가하지 않은 것들
  const remainingFunctions = availableFunctions.filter(func => 
    !userSnapshot.some(item => item.functionName === func)
  )
  
  const handleAddFunction = (funcName: string) => {
    if (!selectedFunctions.has(funcName)) {
      onAddFunction(funcName)
    }
  }
  
  const handleRemoveFunction = (index: number) => {
    onRemoveFunction(index)
  }
  
  return (
    <GamePanel 
      title="📸 스택 스냅샷" 
      className={cn("flex flex-col", className)}
    >
      {/* 헤더 */}
      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700">
        <div className="text-center">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
            책장 상태 구성
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            단계 {currentStep + 1}의 책장 상태를 {isCheckpoint ? '구성하세요' : '확인하세요'}
          </p>
          {isCheckpoint ? (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">체크포인트</span>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs">
              <Check className="h-3 w-3" />
              <span className="font-medium">자동 기록</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 실행 단계 그리드 */}
      <div className="px-4 py-3 border-b border-editor-border">
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            기록 시점 선택:
          </h4>
        </div>
        <StepGrid
          currentStep={currentStep}
          totalSteps={totalSteps}
          checkpoints={snapshotCheckpoints}
          validationResults={validationResults}
          onStepChange={onStepChange}
        />
      </div>
      
      {/* 함수 선택 영역 */}
      <div className="px-4 py-3 border-b border-editor-border">
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {isCheckpoint ? '사용 가능한 함수들:' : '참고용 함수 목록:'}
          </h4>
        </div>
        {isCheckpoint ? (
          <div className="grid grid-cols-2 gap-2">
            {remainingFunctions.map((func, index) => (
              <FunctionChip
                key={func}
                functionName={func}
                onClick={() => handleAddFunction(func)}
                disabled={false}
              />
            ))}
            {remainingFunctions.length === 0 && (
              <div className="col-span-2 text-xs text-gray-400 italic text-center py-2">
                모든 함수가 사용되었습니다
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableFunctions.map((func, index) => (
              <div
                key={func}
                className="p-2 text-xs rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 text-center"
              >
                <span className="font-mono">{func}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 스택 구성 영역 */}
      <div className="flex-1 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-pink-600 dark:text-pink-400">
            구성된 스택 (위에서부터):
          </h4>
          <span className="text-xs text-gray-500">
            {userSnapshot.length}개 함수
          </span>
        </div>
        
        <StackConstructor
          snapshot={userSnapshot}
          onRemove={isCheckpoint ? handleRemoveFunction : undefined}
          onReorder={isCheckpoint ? onReorderSnapshot : undefined}
          disabled={!isCheckpoint}
        />
      </div>
      
      {/* 검증 버튼 - 모든 단계에서 표시 */}
      <div className="px-4 py-3 border-t border-editor-border bg-surface-secondary">
        <button
          onClick={onValidateSnapshot}
          disabled={userSnapshot.length === 0}
          className={cn(
            "w-full py-2 px-4 rounded-lg text-sm font-medium transition-all",
            "flex items-center justify-center gap-2",
            userSnapshot.length === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : isValidated === true
                ? "bg-green-500 text-white"
                : isValidated === false
                  ? "bg-red-500 text-white"
                  : isCheckpoint
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          {isValidated === true ? (
            <>
              <Check className="h-4 w-4" />
              검증 완료
            </>
          ) : isValidated === false ? (
            <>
              <X className="h-4 w-4" />
              다시 시도
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              {isCheckpoint ? '스냅샷 검증 (체크포인트)' : '스냅샷 확인'}
            </>
          )}
        </button>
      </div>
      
      {/* 기존 체크포인트 전용 검증 버튼은 제거하고 위로 통합 */}
      {false && isCheckpoint && (
        <div className="px-4 py-3 border-t border-editor-border bg-surface-secondary">
          <button
            onClick={onValidateSnapshot}
            disabled={userSnapshot.length === 0}
            className={cn(
              "w-full py-2 px-4 rounded-lg text-sm font-medium transition-all",
              "flex items-center justify-center gap-2",
              userSnapshot.length === 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : isValidated === true
                  ? "bg-green-500 text-white"
                  : isValidated === false
                    ? "bg-red-500 text-white"
                    : "bg-pink-500 text-white hover:bg-pink-600"
            )}
          >
            {isValidated === true ? (
              <>
                <Check className="h-4 w-4" />
                검증 완료
              </>
            ) : isValidated === false ? (
              <>
                <X className="h-4 w-4" />
                다시 시도
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                스냅샷 검증
              </>
            )}
          </button>
        </div>
      )}
      
      {/* 진행률 표시 */}
      <div className="px-4 py-2 bg-surface-secondary border-t border-editor-border">
        <div className="flex items-center justify-between text-xs text-game-text-secondary">
          <span>완성도: {Object.values(validationResults).filter(v => v === true).length} / {snapshotCheckpoints.length}</span>
          <span>{Math.round((Object.values(validationResults).filter(v => v === true).length / snapshotCheckpoints.length) * 100)}%</span>
        </div>
        <div className="mt-1 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300"
            style={{ width: `${(Object.values(validationResults).filter(v => v === true).length / snapshotCheckpoints.length) * 100}%` }}
          />
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 실행 단계 그리드
 */
const StepGrid: React.FC<{
  currentStep: number
  totalSteps: number
  checkpoints: number[]
  validationResults: Record<number, boolean>
  onStepChange?: (step: number) => void
}> = ({ currentStep, totalSteps, checkpoints, validationResults, onStepChange }) => {
  return (
    <div className="grid grid-cols-4 gap-1">
      {Array.from({ length: totalSteps }, (_, index) => (
        <StepButton
          key={index}
          step={index}
          isActive={index === currentStep}
          isCheckpoint={checkpoints.includes(index)}
          isCompleted={validationResults[index] === true}
          isFailed={validationResults[index] === false}
          onClick={() => onStepChange?.(index)}
        />
      ))}
    </div>
  )
}

/**
 * 개별 단계 버튼
 */
const StepButton: React.FC<{
  step: number
  isActive: boolean
  isCheckpoint: boolean
  isCompleted: boolean
  isFailed: boolean
  onClick?: () => void
}> = ({ step, isActive, isCheckpoint, isCompleted, isFailed, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-7 text-xs rounded flex items-center justify-center font-mono transition-all",
        "border cursor-pointer hover:opacity-90",
        isActive && "ring-2 ring-pink-400",
        isCompleted && "bg-green-500 text-white border-green-600",
        isFailed && "bg-red-500 text-white border-red-600",
        !isCompleted && !isFailed && isCheckpoint && "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/40",
        !isCompleted && !isFailed && !isCheckpoint && "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
      )}
    >
      {step + 1}
    </button>
  )
}

/**
 * 함수 칩 컴포넌트
 */
const FunctionChip: React.FC<{
  functionName: string
  onClick: () => void
  disabled?: boolean
}> = ({ functionName, onClick, disabled = false }) => {
  const isGlobal = functionName === '<global>'
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "p-2 text-xs rounded-lg border transition-all",
        "flex items-center justify-center gap-1",
        disabled
          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer",
        isGlobal && "border-dashed"
      )}
    >
      {isGlobal && <span className="text-xs">📍</span>}
      <span className="font-mono">{functionName}</span>
      {!disabled && <Plus className="h-3 w-3" />}
    </motion.button>
  )
}

/**
 * 스택 구성기
 */
const StackConstructor: React.FC<{
  snapshot: StackItem[]
  onRemove: (index: number) => void
  onReorder: (newOrder: StackItem[]) => void
  disabled?: boolean
}> = ({ snapshot, onRemove, onReorder, disabled = false }) => {
  if (snapshot.length === 0) {
    return (
      <div className="border-2 border-dashed border-pink-300 dark:border-pink-600 rounded-lg p-4 bg-pink-50 dark:bg-pink-900/10">
        <div className="text-center text-pink-400 dark:text-pink-500">
          <div className="text-2xl mb-2">📚</div>
          <p className="text-xs">
            함수를 선택하여 스택을 구성하세요
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="border-2 border-pink-500 rounded-lg p-3 bg-pink-50 dark:bg-pink-900/10 min-h-[200px]">
      <Reorder.Group 
        axis="y" 
        values={snapshot} 
        onReorder={onReorder}
        className="space-y-2"
      >
        <AnimatePresence>
          {snapshot.map((item, index) => (
            <Reorder.Item 
              key={item.id} 
              value={item}
              className="cursor-grab active:cursor-grabbing"
            >
              <SnapshotItem
                item={item}
                index={index}
                onRemove={() => onRemove(index)}
                disabled={disabled}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  )
}

/**
 * 스냅샷 아이템
 */
const SnapshotItem: React.FC<{
  item: StackItem
  index: number
  onRemove: () => void
  disabled?: boolean
}> = ({ item, index, onRemove, disabled = false }) => {
  const isGlobal = item.isGlobalContext || item.functionName === '<global>'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-2 p-2 rounded border",
        "bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700",
        isGlobal && "border-dashed"
      )}
    >
      <div className="flex-shrink-0 text-sm">
        {isGlobal ? "📍" : "📥"}
      </div>
      
      <div className="flex-1">
        <span className="font-mono text-xs text-gray-800 dark:text-gray-200">
          {item.functionName}
        </span>
      </div>
      
      <div className="flex-shrink-0 px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium">
        #{index + 1}
      </div>
      
      {!disabled && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  )
}