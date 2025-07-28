// 평가 패널 컴포넌트

import React from 'react'
import { cn } from '@penguinjs/ui'
import { EvaluationPanelProps } from '../../../types/layout'
import { useCallStackLibraryTheme, useCallStackLibraryCSSVariables } from '../../../hooks/useCallStackLibraryTheme'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'

/**
 * 평가 패널
 * 모든 레이아웃 타입 하단에 공통으로 표시되는 예상 순서 및 제출 영역
 */
export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  layoutType,
  evaluation,
  userAnswer,
  onSubmit,
  onHint,
  onSimulate,
  onReset,
  expectedCount,
  snapshotCheckpoints,
  validationResults,
  className
}) => {
  // 도서관 테마 적용
  const libraryTheme = useCallStackLibraryTheme()
  const cssVariables = useCallStackLibraryCSSVariables()
  const responsiveLayout = useResponsiveLayout()
  
  // Layout E의 경우 스냅샷 검증 결과로 제출 가능 여부 판단
  const isLayoutE = layoutType === 'E'
  const hasValidationResults = validationResults && Object.keys(validationResults).length > 0
  const canSubmit = isLayoutE ? hasValidationResults : userAnswer.length > 0
  
  return (
    <div 
      className={cn("rounded-lg border p-4", className)}
      style={{
        ...cssVariables,
        background: libraryTheme.getQueueColor('callstack', 'light'),
        backgroundImage: libraryTheme.theme.library.textures.wood,
        backgroundBlendMode: 'overlay',
        borderColor: libraryTheme.getQueueBorder('callstack', 'light')
      }}
    >
      
      {/* 도서관 평가 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-semibold flex items-center gap-2"
          style={{
            fontSize: responsiveLayout.config.fontSize.subtitle,
            color: libraryTheme.getQueueText('callstack', 'primary')
          }}
        >
          📋 도서관 기록 평가
        </h3>
        <div 
          style={{
            fontSize: responsiveLayout.config.fontSize.caption,
            color: libraryTheme.getQueueText('callstack', 'secondary')
          }}
        >
          {getEvaluationTypeDescription(evaluation)}
        </div>
      </div>
      
      {/* 예상 순서 표시 영역 */}
      <div className="space-y-3">
        
        {/* 순서 예측 결과 */}
        {evaluation.checkOrder && (
          <OrderPredictionDisplay userAnswer={userAnswer} />
        )}
        
        {/* LIFO 원칙 검증 */}
        {evaluation.checkLifoPrinciple && (
          <LifoPrincipleDisplay userAnswer={userAnswer} />
        )}
        
        {/* 스냅샷 결과 */}
        {evaluation.checkSnapshots && (
          <SnapshotDisplay 
            snapshotCheckpoints={snapshotCheckpoints}
            validationResults={validationResults}
          />
        )}
        
        {/* 큐 상태 결과 */}
        {evaluation.checkQueueStates && (
          <QueueStatesDisplay 
            validationResults={validationResults}
            layoutType={layoutType}
          />
        )}
        
      </div>
      
      {/* 하단 컨트롤 */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-editor-border">
        <div className="flex items-center gap-4">
          <div className="text-sm text-game-text-secondary">
            완성도: <span className="font-medium">{getCompletionRate(userAnswer, expectedCount)}%</span>
          </div>
          {userAnswer.length > 0 && onReset && (
            <button 
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              초기화
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onHint && (
            <button
              onClick={onHint}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
                "dark:border-slate-600 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              )}
            >
              힌트
            </button>
          )}
          {layoutType !== 'E' && layoutType !== 'B' && onSimulate && (
            <button
              onClick={onSimulate}
              disabled={userAnswer.length === 0}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center",
                userAnswer.length > 0
                  ? "border border-green-500 text-green-700 bg-white hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-slate-800 dark:hover:bg-slate-700"
                  : "border border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed dark:border-slate-600 dark:text-slate-400 dark:bg-slate-700"
              )}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              코드 실행 보기
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              canSubmit
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-600 dark:text-slate-400"
            )}
          >
            {layoutType === 'E' ? '전체 검증' : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 순서 예측 표시 (타입 A)
 */
const OrderPredictionDisplay: React.FC<{
  userAnswer: string[]
}> = ({ userAnswer }) => {
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">예상 실행 순서</h4>
      
      <div className={cn(
        "min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg",
        "bg-gray-50 dark:bg-slate-800 dark:border-slate-600",
        "p-4 flex flex-wrap gap-2 items-start"
      )}>
        {userAnswer.length === 0 ? (
          <div className="text-sm text-gray-400 italic w-full text-center py-4">
            함수를 선택하여 실행 순서를 예측하세요
          </div>
        ) : (
          userAnswer.map((func, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "bg-white border border-gray-200 shadow-sm",
                "dark:bg-slate-700 dark:border-slate-600"
              )}
            >
              <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <span className="font-mono text-sm">{func}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * LIFO 원칙 표시 (타입 A+)
 */
const LifoPrincipleDisplay: React.FC<{
  userAnswer: string[]
}> = ({ userAnswer }) => {
  
  const isLifoValid = validateLifoPrinciple(userAnswer)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-game-text">LIFO 원칙 검증</h4>
        <div className={cn(
          "px-2 py-1 text-xs rounded",
          isLifoValid
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
        )}>
          {isLifoValid ? '✓ 유효' : '⚠ 확인 필요'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Push 순서 */}
        <div>
          <h5 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
            📥 Push (시작)
          </h5>
          <div className="space-y-1">
            {userAnswer
              .filter(item => !item.includes('종료'))
              .map((item, index) => (
                <div key={index} className="text-xs p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-700">
                  {index + 1}. {item}
                </div>
              ))
            }
          </div>
        </div>
        
        {/* Pop 순서 */}
        <div>
          <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
            📤 Pop (종료)
          </h5>
          <div className="space-y-1">
            {userAnswer
              .filter(item => item.includes('종료'))
              .map((item, index) => (
                <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-700">
                  {index + 1}. {item}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 스냅샷 표시 (고급 레이아웃)
 */
const SnapshotDisplay: React.FC<{
  snapshotCheckpoints?: number[]
  validationResults?: Record<number, boolean>
}> = ({ snapshotCheckpoints = [], validationResults = {} }) => {
  const completedCount = Object.values(validationResults).filter(v => v === true).length
  const totalCount = snapshotCheckpoints.length
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">스냅샷 완성도</h4>
      
      <div className="grid grid-cols-6 gap-2">
        {snapshotCheckpoints.map((checkpoint, index) => (
          <div
            key={checkpoint}
            className={cn(
              "h-8 rounded border flex items-center justify-center text-xs font-mono",
              validationResults[checkpoint] === true
                ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-600"
                : validationResults[checkpoint] === false
                  ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-600"
                  : "bg-gray-100 border-gray-300 text-gray-500 dark:bg-slate-700 dark:border-slate-600"
            )}
          >
            {validationResults[checkpoint] === true ? '✓' : validationResults[checkpoint] === false ? '✗' : checkpoint}
          </div>
        ))}
      </div>
      
      <div className="text-xs text-game-text-secondary">
        {completedCount}/{totalCount} 단계 완료
      </div>
    </div>
  )
}

/**
 * 큐 상태 표시 (Layout B - 이벤트 루프)
 */
const QueueStatesDisplay: React.FC<{
  validationResults?: Record<number, any>
  layoutType?: string
}> = ({ validationResults = {}, layoutType }) => {
  
  // Layout B의 경우 큐 검증 결과 표시
  if (layoutType === 'B') {
    const allResults = Object.values(validationResults) as any[]
    const queueResults = allResults.filter(result => result && typeof result === 'object' && 'callstack' in result)
    
    const totalSteps = queueResults.length
    const validSteps = queueResults.filter(result => result.isValid === true).length
    
    // 각 큐별 정확도 계산
    const callstackAccuracy = queueResults.filter(result => result.callstack === true).length
    const microtaskAccuracy = queueResults.filter(result => result.microtask === true).length  
    const macrotaskAccuracy = queueResults.filter(result => result.macrotask === true).length

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-game-text">큐 상태 검증 결과</h4>
          <span className={cn(
            "text-xs px-2 py-1 rounded",
            validSteps === totalSteps && totalSteps > 0
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
          )}>
            {validSteps}/{totalSteps} 단계 완료
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-600">
            <div className="font-semibold text-blue-800 dark:text-blue-400">📥 Call Stack</div>
            <div className="text-blue-600 dark:text-blue-300">
              {totalSteps > 0 ? `${callstackAccuracy}/${totalSteps} 정답` : '미완료'}
            </div>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-600">
            <div className="font-semibold text-green-800 dark:text-green-400">⚡ Microtask</div>
            <div className="text-green-600 dark:text-green-300">
              {totalSteps > 0 ? `${microtaskAccuracy}/${totalSteps} 정답` : '미완료'}
            </div>
          </div>
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-600">
            <div className="font-semibold text-yellow-800 dark:text-yellow-400">⏰ Macrotask</div>
            <div className="text-yellow-600 dark:text-yellow-300">
              {totalSteps > 0 ? `${macrotaskAccuracy}/${totalSteps} 정답` : '미완료'}
            </div>
          </div>
        </div>
        
        {totalSteps > 0 && (
          <div className="text-xs text-game-text-secondary text-center">
            전체 정확도: {Math.round((validSteps / totalSteps) * 100)}%
          </div>
        )}
      </div>
    )
  }

  // 다른 레이아웃의 경우 기본 표시
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">큐 상태 예측</h4>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-blue-50 border border-blue-200 rounded dark:bg-blue-900/20 dark:border-blue-600">
          <div className="font-semibold text-blue-800 dark:text-blue-400">콜스택</div>
          <div className="text-blue-600 dark:text-blue-300">예측 대기</div>
        </div>
        <div className="p-2 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-600">
          <div className="font-semibold text-green-800 dark:text-green-400">마이크로태스크</div>
          <div className="text-green-600 dark:text-green-300">예측 대기</div>
        </div>
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-600">
          <div className="font-semibold text-yellow-800 dark:text-yellow-400">매크로태스크</div>
          <div className="text-yellow-600 dark:text-yellow-300">예측 대기</div>
        </div>
      </div>
    </div>
  )
}

// 유틸리티 함수들
function getEvaluationTypeDescription(evaluation: any): string {
  const types = []
  if (evaluation.checkOrder) types.push('순서')
  if (evaluation.checkLifoPrinciple) types.push('LIFO')
  if (evaluation.checkSnapshots) types.push('스냅샷')
  if (evaluation.checkQueueStates) types.push('큐 상태')
  
  return types.length > 0 ? `${types.join(' + ')} 평가` : '평가 대기'
}

function getCompletionRate(userAnswer: any[], expectedCount?: number): number {
  if (!expectedCount || expectedCount === 0) return 0
  const rate = (userAnswer.length / expectedCount) * 100
  return Math.min(100, Math.round(rate))
}

function validateLifoPrinciple(userAnswer: string[]): boolean {
  // 임시 검증 로직
  const pushItems = userAnswer.filter(item => !item.includes('종료'))
  const popItems = userAnswer.filter(item => item.includes('종료'))
  
  // 간단한 LIFO 검증: Pop이 Push의 역순인지 확인
  if (pushItems.length !== popItems.length) return false
  
  // 더 복잡한 검증 로직은 추후 구현
  return true
}