// 확장성 있는 레이아웃 렌더링 시스템

import React, { memo, useMemo } from 'react'
import { cn, CodeEditor, GamePanel } from '@penguinjs/ui'
import { getLayoutConfig } from '@/games/callstack-library/utils/layoutClassifier'
import { LayoutRendererProps, RightPanelProps } from '@/games/callstack-library/types/layout'
import { CallStackVisualizationPanel } from '@/games/callstack-library/components/layout/panels/CallStackVisualizationPanel'
import { FunctionSelectorPanel } from '@/games/callstack-library/components/layout/panels/FunctionSelectorPanel'
import { SnapshotBuilderPanel } from '@/games/callstack-library/components/layout/panels/SnapshotBuilderPanel'
import { EvaluationPanel } from '@/games/callstack-library/components/layout/panels/EvaluationPanel'
import { HintPanel } from '@/games/callstack-library/components/layout/panels/HintPanel'
import { TimelineCallStackPanel } from '@/games/callstack-library/components/layout/panels/TimelineCallStackPanel'
import { StackSnapshotBuilderPanel } from '@/games/callstack-library/components/layout/panels/StackSnapshotBuilderPanel'
import { EnhancedCodeEditorPanel } from '@/games/callstack-library/components/layout/panels/EnhancedCodeEditorPanel'
import { QueueSnapshotBuilderPanel } from '@/games/callstack-library/components/layout/panels/QueueSnapshotBuilderPanel'
import { usePerformanceOptimization } from '@/games/callstack-library/hooks/usePerformanceOptimization'
import { useMemoryManagement, useLeakDetection } from '@/games/callstack-library/hooks/useMemoryManagement'
import { LayoutBRenderer } from '@/games/callstack-library/components/layout/LayoutBRenderer'
import { LayoutCDRenderer } from '@/games/callstack-library/components/layout/LayoutCDRenderer'

/**
 * 레이아웃 타입에 따라 동적으로 컴포넌트를 렌더링하는 시스템
 * Strategy Pattern을 사용하여 확장성을 보장
 */
export const LayoutRenderer: React.FC<LayoutRendererProps> = memo(({
  layoutType,
  gameData,
  gameHandlers,
  className
}) => {
  // 성능 최적화 및 메모리 관리 - 모든 Hook을 조건문 전에 실행
  const { isMemoryPressure } = useMemoryManagement()
  useLeakDetection('LayoutRenderer')
  
  const config = useMemo(
    () => getLayoutConfig(layoutType),
    [layoutType]
  )
  
  // 기존 레이아웃들의 gridClass 계산도 항상 실행
  const gridClass = useMemo(
    () => {
      switch (layoutType) {
        case 'A':
        case 'A+':
          return 'grid-cols-1 lg:grid-cols-3' // 3개 패널 가로 배치
        case 'C':
          return 'grid-cols-1 lg:grid-cols-3' // 3개 패널 가로 배치
        case 'D':
          return 'grid-cols-1 lg:grid-cols-[350px_1fr_350px]' // 고정 너비
        case 'E':
          return 'grid-cols-1 lg:grid-cols-3' // 3개 패널 가로 배치
        default:
          return 'grid-cols-1 lg:grid-cols-3'
      }
    },
    [layoutType]
  )
  
  // Layout B는 동적 그리드 구조 사용 (책장 컨셉) - Hook 호출 후 조건부 렌더링
  if (layoutType === 'B') {
    return <LayoutBRenderer gameData={gameData} gameHandlers={gameHandlers} className={className} />;
  }
  
  // Layout C, D는 향상된 다중 큐 시각화 사용 (5-6개 큐 지원)
  if (layoutType === 'C' || layoutType === 'D') {
    return <LayoutCDRenderer layoutType={layoutType} gameData={gameData} gameHandlers={gameHandlers} className={className} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 상단 3개 패널 영역 */}
      <div className={cn(
        "grid gap-4",
        gridClass
      )}>
        {/* 📝 코드 에디터 패널 */}
        {config.components.codeEditor && (
          layoutType === 'E' ? (
            <EnhancedCodeEditorPanel
              code={gameData.currentCode}
              currentLine={gameData.executionSteps?.[gameData.currentStep]?.currentLine || gameData.currentLine}
              breakpoints={gameData.breakpoints || []}
              executionPath={gameData.executionPath || []}
              className="min-h-[600px] lg:min-h-[700px]"
            />
          ) : (
            <GamePanel title="📝 코드" className="min-h-[600px] lg:min-h-[700px]">
              <CodeEditor
                value={gameData.currentCode}
                onChange={() => {}} // 읽기 전용
                readOnly={true}
                className="h-full"
              />
            </GamePanel>
          )
        )}
        
        {/* 📚 콜스택/큐 시각화 패널 */}
        {config.components.callstack && (
          layoutType === 'E' ? (
            <TimelineCallStackPanel
              currentStep={gameData.currentStep || 0}
              totalSteps={gameData.executionSteps?.length || 1}
              callstackHistory={gameData.callstackHistory || []}
              currentDisplayStack={gameData.currentDisplayStack}
              onStepChange={gameHandlers.onStepChange || (() => {})}
              isPlaying={gameData.isTimelinePlaying || false}
              onPlayPause={gameHandlers.onPlayPause || (() => {})}
              className="min-h-[600px] lg:min-h-[700px]"
            />
          ) : (
            <CallStackVisualizationPanel
              callstack={gameData.callstack}
              queues={config.components.queueVisualizer}
              layoutType={layoutType}
              className="min-h-[600px] lg:min-h-[700px]"
            />
          )
        )}
        
        {/* 🎯 오른쪽 패널 (함수 선택기 또는 스냅샷 빌더) */}
        <RightPanel
          layoutType={layoutType}
          config={config}
          gameData={gameData}
          gameHandlers={gameHandlers}
          className="min-h-[600px] lg:min-h-[700px]"
        />
      </div>
      
      {/* 힌트 표시 영역 */}
      {gameData.hints && gameData.hints.length > 0 && (
        <HintPanel
          hints={gameData.hints}
          showHints={gameData.showHints || false}
          hintsUsed={gameData.hintsUsed || 0}
          className="mb-4"
        />
      )}
      
      {/* 📊 하단 평가 영역 */}
      <EvaluationPanel
        layoutType={layoutType}
        evaluation={config.evaluation}
        userAnswer={gameData.userAnswer}
        onSubmit={gameHandlers.onSubmit}
        onHint={gameHandlers.onHint}
        onSimulate={gameHandlers.onSimulate}
        onReset={gameHandlers.onReset}
        expectedCount={gameData.expectedCount}
        snapshotCheckpoints={gameData.snapshotCheckpoints}
        validationResults={gameData.validationResults}
        className="w-full"
      />
    </div>
  )
})

LayoutRenderer.displayName = 'LayoutRenderer'

/**
 * 레이아웃별로 오른쪽 패널의 내용을 동적으로 결정
 */
const RightPanel: React.FC<RightPanelProps> = ({ 
  layoutType, 
  config, 
  gameData, 
  gameHandlers, 
  className 
}) => {
  
  // 스냅샷 빌더가 필요한 레이아웃 (B, C, D, E)
  if (config.components.snapshotBuilder) {
    // 타입 E: 스택 스냅샷 빌더
    if (layoutType === 'E') {
      const currentStep = gameData.currentStep || 0
      const isCheckpoint = gameData.snapshotCheckpoints?.includes(currentStep) || false
      
      // 체크포인트일 때는 userSnapshot, 아닐 때는 currentDisplayStack 사용
      const displaySnapshot = isCheckpoint 
        ? (gameData.userSnapshots?.[currentStep] || [])
        : (gameData.currentDisplayStack || gameData.callstackHistory?.[currentStep] || [])
      
      return (
        <StackSnapshotBuilderPanel
          currentStep={currentStep}
          totalSteps={gameData.executionSteps?.length || 1}
          availableFunctions={gameData.availableFunctions}
          userSnapshot={displaySnapshot}
          onAddFunction={gameHandlers.onAddToSnapshot || (() => {})}
          onRemoveFunction={gameHandlers.onRemoveFromSnapshot || (() => {})}
          onReorderSnapshot={(newOrder) => {
            // 타입 E의 경우 gameHandlers에 onReorderSnapshot이 있어야 함
            if (gameHandlers.onReorderSnapshot) {
              gameHandlers.onReorderSnapshot(currentStep, newOrder)
            }
          }}
          onValidateSnapshot={gameHandlers.onValidateSnapshot || (() => {})}
          onStepChange={gameHandlers.onStepChange || (() => {})}
          snapshotCheckpoints={gameData.snapshotCheckpoints}
          validationResults={gameData.validationResults}
          className={className}
        />
      )
    }
    
    // 타입 B: 큐 스냅샷 빌더
    if (layoutType === 'B') {
      return (
        <QueueSnapshotBuilderPanel
          executionSteps={gameData.eventLoopSteps || []}
          currentStep={gameData.currentStep || 0}
          queueStates={gameData.queueStates || {}}
          onQueueStateChange={gameHandlers.onQueueStateChange || (() => {})}
          onValidateQueueStep={gameHandlers.onValidateQueueStep || (() => {})}
          validationResults={gameData.queueValidationResults || {}}
          availableFunctions={gameData.availableFunctions}
          className={className}
        />
      )
    }
    
    // 타입 C, D: 다중 큐 스냅샷 빌더
    if (layoutType === 'C' || layoutType === 'D') {
      const queueTypes = layoutType === 'C' 
        ? ['callstack', 'microtask', 'macrotask', 'animation', 'generator']
        : ['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker']
      
      return (
        <QueueSnapshotBuilderPanel
          executionSteps={gameData.eventLoopSteps || []}
          currentStep={gameData.currentStep || 0}
          queueStates={gameData.queueStates || {}}
          onQueueStateChange={gameHandlers.onQueueStateChange || (() => {})}
          onValidateQueueStep={gameHandlers.onValidateQueueStep || (() => {})}
          validationResults={gameData.queueValidationResults || {}}
          availableFunctions={gameData.availableFunctions}
          queueTypes={queueTypes}
          className={className}
        />
      )
    }
    
    // 기본: 기존 스냅샷 빌더
    return (
      <SnapshotBuilderPanel
        executionSteps={gameData.executionSteps || []}
        currentStep={gameData.currentStep || 0}
        onSnapshotChange={gameHandlers.onSnapshotChange || (() => {})}
        className={className}
      />
    )
  }
  
  // 기본: 함수 선택기 (A, A+)
  if (config.components.functionSelector) {
    return (
      <FunctionSelectorPanel
        functions={gameData.availableFunctions}
        playMode={config.playMode}
        selectedFunctions={gameData.userAnswer}
        onFunctionSelect={gameHandlers.onFunctionSelect}
        onReorder={gameHandlers.onReorderFunctions}
        onRemove={gameHandlers.onRemoveFunction}
        className={className}
      />
    )
  }
  
  return null
}

