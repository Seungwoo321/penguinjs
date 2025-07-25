import React, { memo, useMemo } from 'react'
import { cn, CodeEditor, GamePanel } from '@penguinjs/ui'
import { getLayoutConfig } from '../../utils/layoutClassifier'
import { HintPanel } from './panels/HintPanel'
import { EvaluationPanel } from './panels/EvaluationPanel'
import { MultiQueueVisualizationPanel } from './panels/MultiQueueVisualizationPanel'
import { QueueSnapshotBuilderPanel } from './panels/QueueSnapshotBuilderPanel'
import { useDynamicLayout, usePanelMetrics, createGridStyles, createPanelStyles } from '../../hooks/useDynamicLayout'
import { useMemoryManagement, useLeakDetection } from '../../hooks/useMemoryManagement'
import { useCallStackLibraryContext, ActionType } from '../../contexts/CallStackLibraryContext'
import { gameEvents } from '../../utils/eventSystem'

/**
 * Layout B 전용 동적 레이아웃 렌더러
 */
interface LayoutBRendererProps {
  gameData: any;
  gameHandlers: any;
  className?: string;
}

export const LayoutBRenderer: React.FC<LayoutBRendererProps> = memo(({ gameData, gameHandlers, className }) => {
  // Context API 사용으로 prop drilling 해결
  const { state, dispatch } = useCallStackLibraryContext();
  
  // 성능 최적화 및 메모리 관리
  const { isMemoryPressure } = useMemoryManagement({
    enableMonitoring: process.env.NODE_ENV === 'development'
  })
  useLeakDetection('LayoutBRenderer')
  
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
    () => getLayoutConfig('B'),
    []
  )
  
  // 대시보드 데이터 메모이제이션
  const dashboardData = useMemo(
    () => ({
      totalItems: (gameData?.currentQueueStates?.callstack?.length || 0) +
                  (gameData?.currentQueueStates?.microtask?.length || 0) +
                  (gameData?.currentQueueStates?.macrotask?.length || 0),
      currentStep: gameData?.currentStep || 0,
      totalSteps: gameData?.eventLoopSteps?.length || gameData?.executionSteps?.length || 0,
      isExecuting: gameData?.isExecuting || false,
      memoryPressure: isMemoryPressure
    }),
    [gameData?.currentQueueStates, gameData?.currentStep, gameData?.eventLoopSteps, gameData?.executionSteps, gameData?.isExecuting, isMemoryPressure]
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
        
        {/* 📚 큐 시각화 패널 */}
        <div
          ref={queueVisualizationMetrics.ref as any}
          data-panel-id="queue-visualization"
          style={createPanelStyles(dynamicLayout.layoutConfig, queueVisualizationMetrics.metrics.overflowing)}
        >
          <MultiQueueVisualizationPanel
            queueStates={state.currentQueueStates || gameData.currentQueueStates || {
              callstack: [],
              microtask: [],
              macrotask: [],
              step: 0,
              timestamp: 0
            }}
            isExecuting={state.gameState === 'playing' || gameData.isExecuting || false}
            highlightedQueue={state.highlightedQueue || gameData.highlightedQueue}
            onQueueItemClick={(queueType, item) => {
              // Context API를 통한 상태 업데이트
              dispatch({ type: 'ui/selectQueueItem', payload: { queueType, item } });
              // 이벤트 시스템을 통한 알림
              gameEvents.queueItemAdded(queueType, item, 0);
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
              // Context API를 통한 상태 업데이트
              dispatch({ type: 'execution/updateQueueState', payload: { step, state: newState } });
              // 이벤트 시스템을 통한 알림
              gameEvents.executionStepForward(step, state?.executionSteps?.length || 0);
              // 기존 핸들러 호출
              gameHandlers.onQueueStateChange?.(step, newState);
            }}
            onValidateQueueStep={(step) => {
              const result = gameHandlers.onValidateQueueStep?.(step);
              if (result) {
                dispatch({ type: 'validation/setResult', payload: { step, result } });
                gameEvents.evaluationValidate(step, result.isValid);
              }
              return result;
            }}
            validationResults={state.queueValidationResults || gameData.queueValidationResults || {}}
            availableFunctions={gameData.availableFunctions}
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
      
      {/* 성능 대시보드 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-3 rounded-lg text-xs font-mono bg-gray-100 dark:bg-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400">레이아웃:</span>
              <span className="ml-2 font-bold">{dynamicLayout.currentBreakpoint}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">아이템:</span>
              <span className="ml-2 font-bold">{dashboardData.totalItems}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">단계:</span>
              <span className="ml-2 font-bold">{dashboardData.currentStep}/{dashboardData.totalSteps}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">메모리:</span>
              <span className={cn("ml-2 font-bold", dashboardData.memoryPressure ? 'text-red-500' : 'text-green-500')}>
                {dashboardData.memoryPressure ? 'HIGH' : 'OK'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 📊 하단 평가 패널 */}
      <EvaluationPanel
        layoutType="B"
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

LayoutBRenderer.displayName = 'LayoutBRenderer'