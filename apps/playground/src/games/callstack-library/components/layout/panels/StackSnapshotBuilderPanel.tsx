// 특정 시점 책장 구성 패널 컴포넌트 (타입 E 전용)

import React, { useState } from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Check, AlertCircle, Plus } from 'lucide-react'
import { StackItem } from '@/games/callstack-library/types'

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
      <div 
        className="px-4 py-3 border-b" 
        style={{
          backgroundColor: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))'
        }}
      >
        <div className="text-center">
          <h3 
            className="text-sm font-bold"
            style={{ color: 'rgb(var(--foreground))' }}
          >
            책장 상태 구성
          </h3>
          <p 
            className="text-xs mt-1"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
            단계 {currentStep + 1}의 책장 상태를 {isCheckpoint ? '구성하세요' : '확인하세요'}
          </p>
          {isCheckpoint ? (
            <div 
              className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: 'rgb(var(--card))',
                color: 'rgb(var(--warning))'
              }}
            >
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">체크포인트</span>
            </div>
          ) : (
            <div 
              className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: 'rgb(var(--card))',
                color: 'rgb(var(--success))'
              }}
            >
              <Check className="h-3 w-3" />
              <span className="font-medium">자동 기록</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 실행 단계 그리드 */}
      <div className="px-4 py-3 border-b border-editor-border">
        <div className="mb-2">
          <h4 
            className="text-xs font-semibold"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
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
          <h4 
            className="text-xs font-semibold"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
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
              <div 
                className="col-span-2 text-xs italic text-center py-2"
                style={{ color: 'rgb(var(--muted-foreground))' }}
              >
                모든 함수가 사용되었습니다
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableFunctions.map((func, index) => (
              <div
                key={func}
                className="p-2 text-xs rounded-lg border text-center"
                style={{
                  backgroundColor: 'rgb(var(--muted))',
                  color: 'rgb(var(--muted-foreground))',
                  borderColor: 'rgb(var(--border))'
                }}
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
          <h4 
            className="text-xs font-semibold"
            style={{ color: 'rgb(var(--primary))' }}
          >
            구성된 스택 (위에서부터):
          </h4>
          <span 
            className="text-xs"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
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
          className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: userSnapshot.length === 0
              ? 'rgb(var(--muted))'
              : isValidated === true
                ? 'rgb(var(--success))'
                : isValidated === false
                  ? 'rgb(var(--destructive))'
                  : isCheckpoint
                    ? 'rgb(var(--primary))'
                    : 'rgb(var(--accent))',
            color: userSnapshot.length === 0
              ? 'rgb(var(--muted-foreground))'
              : 'rgb(var(--primary-foreground))',
            cursor: userSnapshot.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: userSnapshot.length > 0 ? 'var(--shadow)' : 'none'
          }}
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
      
      
      {/* 진행률 표시 */}
      <div className="px-4 py-2 bg-surface-secondary border-t border-editor-border">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: 'rgb(var(--muted-foreground))' }}>완성도: {Object.values(validationResults).filter(v => v === true).length} / {snapshotCheckpoints.length}</span>
          <span style={{ color: 'rgb(var(--muted-foreground))' }}>{Math.round((Object.values(validationResults).filter(v => v === true).length / snapshotCheckpoints.length) * 100)}%</span>
        </div>
        <div 
          className="mt-1 w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--border))' }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              background: 'rgb(var(--primary))',
              width: `${(Object.values(validationResults).filter(v => v === true).length / snapshotCheckpoints.length) * 100}%`
            }}
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
  const getButtonStyle = () => {
    if (isCompleted) {
      return {
        backgroundColor: 'rgb(var(--success))',
        color: 'rgb(var(--success-foreground))',
        borderColor: 'rgb(var(--success))'
      }
    }
    
    if (isFailed) {
      return {
        backgroundColor: 'rgb(var(--destructive))',
        color: 'rgb(var(--destructive-foreground))',
        borderColor: 'rgb(var(--destructive))'
      }
    }
    
    if (isCheckpoint) {
      return {
        backgroundColor: 'rgb(var(--warning))',
        color: 'rgb(var(--warning-foreground))',
        borderColor: 'rgb(var(--warning))'
      }
    }
    
    return {
      backgroundColor: 'rgb(var(--muted))',
      color: 'rgb(var(--muted-foreground))',
      borderColor: 'rgb(var(--border))'
    }
  }
  
  const buttonStyle = getButtonStyle()
  
  return (
    <button
      onClick={onClick}
      className="h-7 text-xs rounded flex items-center justify-center font-mono transition-all border cursor-pointer hover:opacity-90"
      style={{
        ...buttonStyle,
        ...(isActive && {
          boxShadow: '0 0 0 2px rgb(var(--primary) / 0.25)',
          outline: 'none',
          transform: 'scale(1.1)'
        })
      }}
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
  
  const getChipStyle = () => {
    if (disabled) {
      return {
        backgroundColor: 'rgb(var(--muted))',
        color: 'rgb(var(--muted-foreground))',
        borderColor: 'rgb(var(--border))',
        cursor: 'not-allowed'
      }
    }
    
    return {
      backgroundColor: 'rgb(var(--primary))',
      color: 'rgb(var(--primary-foreground))',
      borderColor: 'rgb(var(--primary))',
      cursor: 'pointer'
    }
  }
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "p-2 text-xs rounded-lg border transition-all",
        "flex items-center justify-center gap-1",
        isGlobal && "border-dashed"
      )}
      style={getChipStyle()}
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
      <div 
        className="border-2 border-dashed rounded-lg p-4"
        style={{
          borderColor: 'rgb(var(--primary))',
          backgroundColor: 'rgb(var(--card))'
        }}
      >
        <div className="text-center" style={{ color: 'rgb(var(--primary))' }}>
          <div className="text-2xl mb-2">📚</div>
          <p className="text-xs">
            함수를 선택하여 스택을 구성하세요
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="border-2 rounded-lg p-3 min-h-[200px]"
      style={{
        borderColor: 'rgb(var(--primary))',
        backgroundColor: 'rgb(var(--card))'
      }}
    >
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
        isGlobal && "border-dashed"
      )}
      style={{
        backgroundColor: 'rgb(var(--card))',
        borderColor: 'rgb(var(--primary))'
      }}
    >
      <div className="flex-shrink-0 text-sm">
        {isGlobal ? "📍" : "📥"}
      </div>
      
      <div className="flex-1">
        <span 
          className="font-mono text-xs"
          style={{ color: 'rgb(var(--foreground))' }}
        >
          {item.functionName}
        </span>
      </div>
      
      <div 
        className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium"
        style={{
          backgroundColor: 'rgb(var(--muted))',
          color: 'rgb(var(--primary))'
        }}
      >
        #{index + 1}
      </div>
      
      {!disabled && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded transition-colors"
          style={{
            color: 'rgb(var(--destructive))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(var(--muted))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  )
}