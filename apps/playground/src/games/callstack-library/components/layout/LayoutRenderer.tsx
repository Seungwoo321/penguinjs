// 확장성 있는 레이아웃 렌더링 시스템

import React from 'react'
import { cn, CodeEditor, GamePanel } from '@penguinjs/ui'
import { getLayoutConfig } from '../../utils/layoutClassifier'
import { LayoutRendererProps, RightPanelProps } from '../../types/layout'
import { CallStackVisualizationPanel } from './panels/CallStackVisualizationPanel'
import { FunctionSelectorPanel } from './panels/FunctionSelectorPanel'
import { SnapshotBuilderPanel } from './panels/SnapshotBuilderPanel'
import { EvaluationPanel } from './panels/EvaluationPanel'
import { HintPanel } from './panels/HintPanel'
import { TimelineCallStackPanel } from './panels/TimelineCallStackPanel'
import { StackSnapshotBuilderPanel } from './panels/StackSnapshotBuilderPanel'
import { EnhancedCodeEditorPanel } from './panels/EnhancedCodeEditorPanel'
import { MultiQueueVisualizationPanel } from './panels/MultiQueueVisualizationPanel'
import { QueueSnapshotBuilderPanel } from './panels/QueueSnapshotBuilderPanel'

/**
 * 레이아웃 타입에 따라 동적으로 컴포넌트를 렌더링하는 시스템
 * Strategy Pattern을 사용하여 확장성을 보장
 */
export const LayoutRenderer: React.FC<LayoutRendererProps> = ({
  layoutType,
  gameData,
  gameHandlers,
  className
}) => {
  const config = getLayoutConfig(layoutType)
  
  // Layout B는 1열 3영역 구조 사용 (책장 컨셉)
  if (layoutType === 'B') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* 상단 3개 패널 (1:1:1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 📜 코드 열람 패널 */}
          <GamePanel title="📜 도서관 코드 열람" className="min-h-[600px] lg:min-h-[700px]">
            <CodeEditor
              value={gameData.currentCode}
              onChange={() => {}} // 읽기 전용
              readOnly={true}
              className="h-full"
            />
          </GamePanel>
          
          {/* 📚 3층 책장 시스템 */}
          <MultiQueueVisualizationPanel
            queueStates={gameData.currentQueueStates || {
              callstack: [],
              microtask: [],
              macrotask: [],
              step: 0,
              timestamp: 0
            }}
            isExecuting={gameData.isExecuting || false}
            highlightedQueue={gameData.highlightedQueue}
            onQueueItemClick={gameHandlers.onQueueItemClick}
            className="min-h-[600px] lg:min-h-[700px]"
          />
          
          {/* 📋 반납 처리 계획서 */}
          <QueueSnapshotBuilderPanel
            executionSteps={gameData.eventLoopSteps || []}
            currentStep={gameData.currentStep || 0}
            queueStates={gameData.queueStates || {}}
            onQueueStateChange={gameHandlers.onQueueStateChange || (() => {})}
            onValidateQueueStep={gameHandlers.onValidateQueueStep || (() => {})}
            validationResults={gameData.queueValidationResults || {}}
            availableFunctions={gameData.availableFunctions}
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
        
        {/* 하단 - 도서관 업무 평가 */}
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
  }
  
  // 기존 레이아웃들 (A, A+, C, D, E)
  const getGridClass = () => {
    switch (layoutType) {
      case 'A':
      case 'A+':
        return 'grid-cols-1 lg:grid-cols-3' // 3개 패널
      case 'C':
        return 'grid-cols-1 lg:grid-cols-3' // 세 패널 동일한 크기
      case 'D':
        return 'grid-cols-1 lg:grid-cols-[350px_1fr_350px]' // 고정 너비
      case 'E':
        return 'grid-cols-1 lg:grid-cols-3' // 세 패널 동일한 크기
      default:
        return 'grid-cols-1 lg:grid-cols-3'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 상단 3개 패널 영역 */}
      <div className={cn(
        "grid gap-4",
        getGridClass()
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
}

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
      return (
        <StackSnapshotBuilderPanel
          currentStep={gameData.currentStep || 0}
          totalSteps={gameData.executionSteps?.length || 1}
          availableFunctions={gameData.availableFunctions}
          userSnapshot={gameData.userSnapshots?.[gameData.currentStep || 0] || []}
          onAddFunction={gameHandlers.onAddToSnapshot || (() => {})}
          onRemoveFunction={gameHandlers.onRemoveFromSnapshot || (() => {})}
          onReorderSnapshot={(newOrder) => {
            // 타입 E의 경우 gameHandlers에 onReorderSnapshot이 있어야 함
            if (gameHandlers.onReorderSnapshot) {
              gameHandlers.onReorderSnapshot(gameData.currentStep || 0, newOrder)
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
    
    // 기본: 기존 스냅샷 빌더 (C, D)
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