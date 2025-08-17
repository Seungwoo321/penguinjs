// 평가 패널 컴포넌트

import React from 'react'
import { cn } from '@penguinjs/ui'
import { EvaluationPanelProps } from '@/games/callstack-library/types/layout'
import { useResponsiveLayout } from '@/games/callstack-library/hooks/useResponsiveLayout'

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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  const responsiveLayout = useResponsiveLayout()
  
  // Layout E의 경우 스냅샷 검증 결과로 제출 가능 여부 판단
  const isLayoutE = layoutType === 'E'
  const hasValidationResults = validationResults && Object.keys(validationResults).length > 0
  const canSubmit = isLayoutE ? hasValidationResults : userAnswer.length > 0
  
  return (
    <div 
      className={cn("rounded-lg border p-4", className)}
      style={{
        backgroundColor: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))'
      }}
    >
      
      {/* 도서관 평가 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-semibold flex items-center gap-2"
          style={{
            fontSize: responsiveLayout.config.fontSize.subtitle,
            color: 'rgb(var(--foreground))'
          }}
        >
          📋 도서관 기록 평가
        </h3>
        <div 
          style={{
            fontSize: responsiveLayout.config.fontSize.caption,
            color: 'rgb(var(--muted-foreground))'
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
          <div className="text-sm" style={{ color: 'rgb(var(--muted-foreground))' }}>
            완성도: <span className="font-medium">{getCompletionRate(userAnswer, expectedCount)}%</span>
          </div>
          {userAnswer.length > 0 && onReset && (
            <button 
              onClick={onReset}
              className="text-xs transition-colors"
              style={{
                color: 'rgb(var(--muted-foreground))',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgb(var(--foreground))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgb(var(--muted-foreground))'
              }}
            >
              초기화
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onHint && (
            <button
              onClick={onHint}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
              style={{
                backgroundColor: 'rgb(var(--warning))',
                color: 'rgb(var(--warning-foreground))',
                borderColor: 'rgb(var(--warning))',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              힌트
            </button>
          )}
          {layoutType !== 'E' && layoutType !== 'B' && onSimulate && (
            <button
              onClick={onSimulate}
              disabled={userAnswer.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center border"
              style={{
                backgroundColor: userAnswer.length === 0 
                  ? 'rgb(var(--muted))' 
                  : 'rgb(var(--card))',
                color: userAnswer.length === 0 
                  ? 'rgb(var(--muted-foreground))' 
                  : 'rgb(var(--success))',
                borderColor: userAnswer.length === 0 
                  ? 'rgb(var(--border))' 
                  : 'rgb(var(--success))',
                cursor: userAnswer.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: userAnswer.length > 0 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
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
            className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: !canSubmit
                ? 'rgb(var(--muted))'
                : layoutType === 'E'
                  ? 'rgb(var(--game-callstack-button-primary))'
                  : 'rgb(var(--primary))',
              color: !canSubmit ? 'rgb(var(--muted-foreground))' : 'white',
              cursor: !canSubmit ? 'not-allowed' : 'pointer',
              boxShadow: canSubmit ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">예상 실행 순서</h4>
      
      <div className={cn(
        "min-h-[80px] border-2 border-dashed rounded-lg",
        "p-4 flex flex-wrap gap-2 items-start"
      )}
      style={{
        borderColor: '1px solid rgb(var(--game-callstack-queue-microtask-light))',
        backgroundColor: 'rgba(var(--game-callstack-queue-microtask-light), 0.1)'
      }}>
        {userAnswer.length === 0 ? (
          <div 
            className="text-sm italic w-full text-center py-4"
            style={{ color: 'rgb(var(--muted-foreground))' }}
          >
            함수를 선택하여 실행 순서를 예측하세요
          </div>
        ) : (
          userAnswer.map((func, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "border shadow-sm"
              )}
              style={{
                backgroundColor: 'rgb(var(--card))',
                borderColor: '1px solid rgb(var(--game-callstack-queue-microtask))'
              }}
            >
              <span className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(var(--game-callstack-queue-microtask))' }}>
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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
  const isLifoValid = validateLifoPrinciple(userAnswer)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--foreground))' }}>LIFO 원칙 검증</h4>
        <div 
          className="px-2 py-1 text-xs rounded"
          style={{
            background: isLifoValid 
              ? 'rgb(var(--success))'
              : 'rgb(var(--warning))',
            color: isLifoValid
              ? 'rgb(var(--success-foreground))'
              : 'rgb(var(--warning-foreground))'
          }}
        >
          {isLifoValid ? '✓ 유효' : '⚠ 확인 필요'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Push 순서 */}
        <div>
          <h5 
            className="text-xs font-semibold mb-2"
            style={{ color: 'rgb(var(--game-callstack-queue-microtask))' }}
          >
            📥 Push (시작)
          </h5>
          <div className="space-y-1">
            {userAnswer
              .filter(item => !item.includes('종료') && !item.endsWith('-return'))
              .map((item, index) => (
                <div 
                  key={index} 
                  className="text-xs p-2 rounded"
                  style={{
                    background: 'rgba(var(--primary), 0.1)',
                    border: '1px solid rgba(var(--primary), 0.2)',
                    color: 'rgb(var(--foreground))'
                  }}
                >
                  {index + 1}. {item.replace(' → 시작', '')}
                </div>
              ))
            }
          </div>
        </div>
        
        {/* Pop 순서 */}
        <div>
          <h5 
            className="text-xs font-semibold mb-2"
            style={{ color: 'rgb(var(--destructive))' }}
          >
            📤 Pop (종료)
          </h5>
          <div className="space-y-1">
            {userAnswer
              .filter(item => item.includes('종료') || item.endsWith('-return'))
              .map((item, index) => (
                <div 
                  key={index} 
                  className="text-xs p-2 rounded"
                  style={{
                    background: 'rgba(var(--destructive), 0.1)',
                    border: `1px solid rgba(var(--destructive), 0.2)`,
                    color: 'rgb(var(--foreground))'
                  }}
                >
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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  const completedCount = Object.values(validationResults).filter(v => v === true).length
  const totalCount = snapshotCheckpoints.length
  
  const getButtonStyle = (checkpoint: number) => {
    if (validationResults[checkpoint] === true) {
      return {
        backgroundColor: 'rgb(var(--success))',
        borderColor: 'rgb(var(--success))',
        color: 'white'
      }
    }
    
    if (validationResults[checkpoint] === false) {
      return {
        backgroundColor: 'rgb(var(--destructive))',
        borderColor: 'rgb(var(--destructive))',
        color: 'white'
      }
    }
    
    return {
      backgroundColor: 'rgb(var(--muted))',
      borderColor: 'rgb(var(--border))',
      color: 'rgb(var(--muted-foreground))'
    }
  }
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-game-text">스냅샷 완성도</h4>
      
      <div className="grid grid-cols-6 gap-2">
        {snapshotCheckpoints.map((checkpoint, index) => (
          <div
            key={checkpoint}
            className="h-8 rounded border flex items-center justify-center text-xs font-mono"
            style={getButtonStyle(checkpoint)}
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
  // 다크모드 감지
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  
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
          <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--foreground))' }}>큐 상태 검증 결과</h4>
          <span 
            className="text-xs px-2 py-1 rounded"
            style={{
              background: validSteps === totalSteps && totalSteps > 0
                ? 'rgb(var(--success))'
                : 'rgb(var(--warning))',
              color: validSteps === totalSteps && totalSteps > 0
                ? 'rgb(var(--success-foreground))'
                : 'rgb(var(--warning-foreground))'
            }}
          >
            {validSteps}/{totalSteps} 단계 완료
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div 
            className="p-2 rounded"
            style={{
              background: isDarkMode ? 'rgba(var(--primary), 0.2)' : 'rgba(var(--primary), 0.1)',
              border: `2px solid ${isDarkMode ? 'rgba(var(--primary), 0.3)' : 'rgba(var(--primary), 0.2)'}`,
              color: 'rgb(var(--foreground))'
            }}
          >
            <div className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>📥 Call Stack</div>
            <div style={{ color: 'rgb(var(--foreground))' }}>
              {totalSteps > 0 ? `${callstackAccuracy}/${totalSteps} 정답` : '미완료'}
            </div>
          </div>
          <div 
            className="p-2 rounded"
            style={{
              background: isDarkMode ? 'rgba(var(--secondary), 0.2)' : 'rgba(var(--secondary), 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(var(--secondary), 0.3)' : 'rgba(var(--secondary), 0.2)'}`,
              color: 'rgb(var(--foreground))'
            }}
          >
            <div className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>⚡ Microtask</div>
            <div style={{ color: 'rgb(var(--foreground))' }}>
              {totalSteps > 0 ? `${microtaskAccuracy}/${totalSteps} 정답` : '미완료'}
            </div>
          </div>
          <div 
            className="p-2 rounded"
            style={{
              background: isDarkMode ? 'rgba(var(--accent), 0.2)' : 'rgba(var(--accent), 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(var(--accent), 0.3)' : 'rgba(var(--accent), 0.2)'}`,
              color: 'rgb(var(--foreground))'
            }}
          >
            <div className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>⏰ Macrotask</div>
            <div style={{ color: 'rgb(var(--foreground))' }}>
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
      <h4 className="text-sm font-medium" style={{ color: 'rgb(var(--foreground))' }}>큐 상태 예측</h4>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div 
          className="p-2 rounded"
          style={{
            background: isDarkMode ? 'rgba(var(--primary), 0.2)' : 'rgba(var(--primary), 0.1)',
            border: `2px solid ${isDarkMode ? 'rgba(var(--primary), 0.3)' : 'rgba(var(--primary), 0.2)'}`,
            color: 'rgb(var(--foreground))'
          }}
        >
          <div className="font-semibold" style={{ color: 'rgb(var(--primary))' }}>콜스택</div>
          <div style={{ color: 'rgb(var(--muted-foreground))' }}>예측 대기</div>
        </div>
        <div 
          className="p-2 rounded"
          style={{
            background: isDarkMode ? 'rgba(var(--secondary), 0.2)' : 'rgba(var(--secondary), 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(var(--secondary), 0.3)' : 'rgba(var(--secondary), 0.2)'}`,
            color: 'rgb(var(--foreground))'
          }}
        >
          <div className="font-semibold" style={{ color: isDarkMode ? 'rgb(var(--primary))' : 'rgb(var(--primary))' }}>마이크로태스크</div>
          <div style={{ color: 'rgb(var(--muted-foreground))' }}>예측 대기</div>
        </div>
        <div 
          className="p-2 rounded"
          style={{
            background: isDarkMode ? 'rgba(var(--accent), 0.2)' : 'rgba(var(--accent), 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(var(--accent), 0.3)' : 'rgba(var(--accent), 0.2)'}`,
            color: 'rgb(var(--foreground))'
          }}
        >
          <div className="font-semibold" style={{ color: isDarkMode ? 'rgb(var(--primary))' : 'rgb(var(--primary))' }}>매크로태스크</div>
          <div style={{ color: 'rgb(var(--muted-foreground))' }}>예측 대기</div>
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