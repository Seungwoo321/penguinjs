import React, { memo, useMemo } from 'react'
import { cn, CodeEditor, GamePanel } from '@penguinjs/ui'
import { getLayoutConfig } from '@/games/callstack-library/utils/layoutClassifier'
import { HintPanel } from './panels/HintPanel'
import { EvaluationPanel } from './panels/EvaluationPanel'
import { EnhancedMultiQueueVisualizationPanel } from './panels/EnhancedMultiQueueVisualizationPanel'
import { QueueSnapshotBuilderPanel } from './panels/QueueSnapshotBuilderPanel'
import { useDynamicLayout, usePanelMetrics, createGridStyles, createPanelStyles } from '@/games/callstack-library/hooks/useDynamicLayout'
import { useMemoryManagement, useLeakDetection } from '@/games/callstack-library/hooks/useMemoryManagement'
import { useCallStackLibraryContext, ActionType } from '@/games/callstack-library/contexts/CallStackLibraryContext'
import { gameEvents } from '@/games/callstack-library/utils/eventSystem'
import { QueueType } from '@/games/callstack-library/types'

/**
 * Layout C, D 전용 동적 레이아웃 렌더러
 * Layout B의 UI 스타일을 참고하여 5-6개 큐를 지원
 */
interface LayoutCDRendererProps {
  layoutType: 'C' | 'D';
  gameData: any;
  gameHandlers: any;
  className?: string;
}

export const LayoutCDRenderer: React.FC<LayoutCDRendererProps> = memo(({ layoutType, gameData, gameHandlers, className }) => {
  // Context API 사용으로 prop drilling 해결
  const { state, dispatch } = useCallStackLibraryContext();
  
  // 성능 최적화 및 메모리 관리
  const { isMemoryPressure } = useMemoryManagement({
    enableMonitoring: process.env.NODE_ENV === 'development'
  })
  useLeakDetection('LayoutCDRenderer')
  
  // 동적 레이아웃 설정
  const dynamicLayout = useDynamicLayout({
    breakpoints: { mobile: 640, tablet: 1024, desktop: 1280 },
    minPanelHeight: 300,
    maxPanelHeight: 1000,
    contentBasedHeight: true,
    responsiveGaps: true,
    mobileFirst: true // Mobile-first 방식 사용
  });

  const codeEditorMetrics = usePanelMetrics('code-editor', dynamicLayout.updatePanelMetrics);
  const queueVisualizationMetrics = usePanelMetrics('queue-visualization', dynamicLayout.updatePanelMetrics);
  const snapshotBuilderMetrics = usePanelMetrics('snapshot-builder', dynamicLayout.updatePanelMetrics);

  // 메모이제이션된 스타일 및 설정
  const gridStyles = useMemo(
    () => createGridStyles(dynamicLayout.layoutConfig),
    [dynamicLayout.layoutConfig]
  )
  const config = useMemo(
    () => getLayoutConfig(layoutType),
    [layoutType]
  )
  
  // 레이아웃별 큐 타입
  const queueTypes = useMemo(
    () => layoutType === 'C' 
      ? ['callstack', 'microtask', 'macrotask', 'animation', 'generator'] as const
      : ['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker'] as const,
    [layoutType]
  )
  
  // 대시보드 데이터 메모이제이션
  const dashboardData = useMemo(
    () => {
      const states = gameData?.currentQueueStates || {};
      const totalItems = queueTypes.reduce((sum, queueType) => 
        sum + (states[queueType]?.length || 0), 0
      );
      
      return {
        totalItems,
        currentStep: gameData?.currentStep || 0,
        totalSteps: gameData?.eventLoopSteps?.length || gameData?.executionSteps?.length || 0,
        isExecuting: gameData?.isExecuting || false,
        memoryPressure: isMemoryPressure
      }
    },
    [gameData?.currentQueueStates, gameData?.currentStep, gameData?.eventLoopSteps, gameData?.executionSteps, gameData?.isExecuting, isMemoryPressure, queueTypes]
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* 동적 그리드 컨테이너 */}
      <div style={gridStyles}>
        {/* 📝 코드 에디터 패널 */}
        <div
          ref={codeEditorMetrics.ref as any}
          data-panel-id="code-editor"
          style={createPanelStyles(dynamicLayout.layoutConfig, codeEditorMetrics.metrics.overflowing)}
        >
          <GamePanel title="📝 코드" className="h-full">
            <CodeEditor
              value={gameData.currentCode}
              onChange={() => {}} // 읽기 전용
              readOnly={true}
              className="h-full"
            />
          </GamePanel>
        </div>
        
        {/* 📚 다중 큐 시각화 패널 */}
        <div
          ref={queueVisualizationMetrics.ref as any}
          data-panel-id="queue-visualization"
          style={createPanelStyles(dynamicLayout.layoutConfig, queueVisualizationMetrics.metrics.overflowing)}
        >
          <EnhancedMultiQueueVisualizationPanel
            queueTypes={queueTypes}
            queueStates={state.currentQueueStates || gameData.currentQueueStates || 
              queueTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {
                step: 0,
                timestamp: 0
              } as any)
            }
            isExecuting={state.gameState === 'playing' || gameData.isExecuting || false}
            highlightedQueue={state.highlightedQueue || gameData.highlightedQueue}
            onQueueItemClick={(queueType, item) => {
              // 이벤트 시스템을 통한 알림
              gameEvents.queueItemAdded(queueType as QueueType, item, 0);
              // 기존 핸들러 호출
              gameHandlers.onQueueItemClick?.(queueType, item);
            }}
            className="h-full"
          />
        </div>
        
        {/* 🎯 스냅샷 빌더 패널 */}
        <div
          ref={snapshotBuilderMetrics.ref as any}
          data-panel-id="snapshot-builder"
          style={createPanelStyles(dynamicLayout.layoutConfig, snapshotBuilderMetrics.metrics.overflowing)}
        >
          <QueueSnapshotBuilderPanel
            executionSteps={state.eventLoopSteps || gameData.eventLoopSteps || []}
            currentStep={state.currentStep || gameData.currentStep || 0}
            queueStates={state.queueStatesHistory || gameData.queueStates || {}}
            onQueueStateChange={(step, newState) => {
              // 이벤트 시스템을 통한 알림
              gameEvents.executionStepForward(step, state?.executionSteps?.length || 0);
              // 기존 핸들러 호출
              gameHandlers.onQueueStateChange?.(step, newState);
            }}
            onValidateQueueStep={(step) => {
              const result = gameHandlers.onValidateQueueStep?.(step);
              if (result) {
                gameEvents.evaluationValidate(step, result.isValid);
              }
              return result;
            }}
            validationResults={state.queueValidationResults || gameData.queueValidationResults || {}}
            availableFunctions={gameData.availableFunctions}
            queueTypes={queueTypes as any}
            className="h-full"
          />
        </div>
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
      
      {/* 📊 하단 평가 패널 */}
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
  );
});

LayoutCDRenderer.displayName = 'LayoutCDRenderer'