/**
 * LayoutBAdapter - 레이아웃 B를 도메인 모델 기반으로 리팩토링
 * 
 * 기존 LayoutBRenderer의 비즈니스 로직을 도메인 모델로 분리한 버전
 */

import React, { useEffect, useMemo } from 'react';
import { useEventLoopEngine } from './ReactEventLoopAdapter';
import { GamePanel } from '@penguinjs/ui';
import { 
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  Task 
} from '@/games/callstack-library/domain/event-loop/types';

// Props 타입 정의
interface LayoutBAdapterProps {
  // 게임 설정
  maxCallStackSize?: number;
  maxMicrotaskQueueSize?: number;
  maxMacrotaskQueueSize?: number;
  executionTimeout?: number;
  
  // 이벤트 핸들러
  onScoreUpdate?: (score: number) => void;
  onStageComplete?: () => void;
  
  // UI 설정
  className?: string;
}

export const LayoutBAdapter: React.FC<LayoutBAdapterProps> = ({
  maxCallStackSize = 10,
  maxMicrotaskQueueSize = 100,
  maxMacrotaskQueueSize = 100,
  executionTimeout = 5000,
  onScoreUpdate,
  onStageComplete,
  className
}) => {
  // 도메인 모델 사용
  const { state, commands, queries } = useEventLoopEngine({
    maxCallStackSize,
    maxMicrotaskQueueSize,
    maxMacrotaskQueueSize,
    executionTimeout,
    enableLogging: process.env.NODE_ENV === 'development',
    
    onStateChange: (newState) => {
      // 상태 변경 시 점수 계산
      if (onScoreUpdate) {
        const score = calculateScore(newState);
        onScoreUpdate(score);
      }
    },
    
    onError: (error) => {
      console.error('[LayoutBAdapter] Error:', error);
    },
    
    onExecutionComplete: (result) => {
      // 실행 완료 로깅
      console.log('[LayoutBAdapter] Execution:', result);
    }
  });

  // 점수 계산 로직 (도메인 로직)
  const calculateScore = (gameState: any) => {
    const baseScore = 100;
    const errorPenalty = gameState.stats.errors * 10;
    const depthBonus = Math.min(gameState.stats.callStackMaxDepth * 5, 50);
    
    return Math.max(baseScore - errorPenalty + depthBonus, 0);
  };

  // 샘플 함수들 (실제로는 레벨 데이터에서 가져옴)
  const availableFunctions = useMemo(() => [
    { name: 'main', type: 'sync' },
    { name: 'setTimeout', type: 'timeout' },
    { name: 'Promise.then', type: 'promise' },
    { name: 'helper', type: 'sync' },
    { name: 'async task', type: 'async' }
  ], []);

  // 함수 실행 핸들러
  const handleFunctionClick = (func: typeof availableFunctions[0]) => {
    switch (func.type) {
      case 'sync':
        commands.pushFunction(func.name);
        break;
      case 'promise':
        commands.addPromiseCallback(func.name);
        break;
      case 'timeout':
        commands.addTimeout(func.name, 1000);
        break;
      case 'async':
        // 비동기 함수는 Promise 생성 후 콜백 추가
        commands.pushFunction(func.name);
        setTimeout(() => {
          commands.popFunction();
          commands.addPromiseCallback(`${func.name} callback`);
        }, 100);
        break;
    }
  };

  // 큐 아이템 렌더링
  const renderQueueItem = (item: Task, index: number) => (
    <div
      key={item.id}
      className="p-2 m-1 bg-white rounded shadow cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => commands.selectTask(item)}
      style={{
        backgroundColor: state.selectedTask?.id === item.id ? '#e3f2fd' : 'white'
      }}
    >
      <div className="font-semibold">{item.name}</div>
      <div className="text-xs text-gray-500">
        {item.status} • {item.priority}
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* 제어 패널 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={state.isRunning ? commands.pause : commands.start}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={state.isPaused}
        >
          {state.isRunning ? '일시정지' : '시작'}
        </button>
        
        {state.isPaused && (
          <button
            onClick={commands.resume}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            재개
          </button>
        )}
        
        <button
          onClick={commands.step}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          disabled={state.isRunning && !state.isPaused}
        >
          한 단계 실행
        </button>
        
        <button
          onClick={commands.reset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          초기화
        </button>
        
        <div className="ml-auto flex items-center gap-2">
          <label>실행 속도:</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={state.executionSpeed}
            onChange={(e) => commands.setExecutionSpeed(Number(e.target.value))}
            className="w-32"
          />
          <span>{state.executionSpeed}ms</span>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="p-2 bg-gray-100 rounded">
          <strong>Phase:</strong> {state.phase}
        </div>
        <div className="p-2 bg-gray-100 rounded">
          <strong>Tick:</strong> {state.currentTick}
        </div>
        <div className="p-2 bg-gray-100 rounded">
          <strong>실행됨:</strong> {state.stats.totalExecuted}
        </div>
        <div className="p-2 bg-gray-100 rounded">
          <strong>에러:</strong> {state.stats.errors}
        </div>
      </div>

      {/* 메인 레이아웃: 3개 패널 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 왼쪽: 사용 가능한 함수들 */}
        <GamePanel title="📚 함수 목록" className="h-[600px]">
          <div className="p-4">
            <h3 className="font-semibold mb-2">클릭하여 실행:</h3>
            {availableFunctions.map((func, index) => (
              <button
                key={index}
                onClick={() => handleFunctionClick(func)}
                className="block w-full p-2 mb-2 text-left bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                disabled={
                  state.isRunning ||
                  (func.type === 'sync' && !queries.canPushToCallStack()) ||
                  (func.type === 'promise' && !queries.canEnqueueMicrotask()) ||
                  (func.type === 'timeout' && !queries.canEnqueueMacrotask())
                }
              >
                {func.name}
                <span className="text-xs text-gray-600 ml-2">({func.type})</span>
              </button>
            ))}
            
            {/* 특수 동작 */}
            <hr className="my-4" />
            <button
              onClick={commands.popFunction}
              className="block w-full p-2 mb-2 text-left bg-red-100 hover:bg-red-200 rounded transition-colors"
              disabled={state.isRunning || state.callStack.length === 0}
            >
              함수 반환 (Pop)
            </button>
          </div>
        </GamePanel>

        {/* 중앙: 3개 큐 시각화 */}
        <GamePanel title="🏗️ 실행 큐" className="h-[600px]">
          {/* 콜스택 */}
          <div 
            className="mb-4 p-4 border-2 rounded"
            style={{
              borderColor: state.highlightedQueue === 'callstack' ? '#2196f3' : '#ddd',
              backgroundColor: state.highlightedQueue === 'callstack' ? '#e3f2fd' : 'white'
            }}
            onMouseEnter={() => commands.highlightQueue('callstack')}
            onMouseLeave={() => commands.highlightQueue(null)}
          >
            <h4 className="font-semibold mb-2">
              📚 Call Stack ({state.callStack.length}/{maxCallStackSize})
            </h4>
            <div className="min-h-[120px] bg-gray-50 rounded p-2">
              {state.callStack.length === 0 ? (
                <div className="text-gray-400 text-center">비어있음</div>
              ) : (
                [...state.callStack].reverse().map((frame, index) => 
                  renderQueueItem(frame, index)
                )
              )}
            </div>
          </div>

          {/* 마이크로태스크 큐 */}
          <div 
            className="mb-4 p-4 border-2 rounded"
            style={{
              borderColor: state.highlightedQueue === 'microtask' ? '#4caf50' : '#ddd',
              backgroundColor: state.highlightedQueue === 'microtask' ? '#e8f5e9' : 'white'
            }}
            onMouseEnter={() => commands.highlightQueue('microtask')}
            onMouseLeave={() => commands.highlightQueue(null)}
          >
            <h4 className="font-semibold mb-2">
              ⚡ Microtask Queue ({state.microtaskQueue.length}/{maxMicrotaskQueueSize})
            </h4>
            <div className="min-h-[120px] bg-gray-50 rounded p-2">
              {state.microtaskQueue.length === 0 ? (
                <div className="text-gray-400 text-center">비어있음</div>
              ) : (
                state.microtaskQueue.map((task, index) => 
                  renderQueueItem(task, index)
                )
              )}
            </div>
          </div>

          {/* 매크로태스크 큐 */}
          <div 
            className="mb-4 p-4 border-2 rounded"
            style={{
              borderColor: state.highlightedQueue === 'macrotask' ? '#ff9800' : '#ddd',
              backgroundColor: state.highlightedQueue === 'macrotask' ? '#fff3e0' : 'white'
            }}
            onMouseEnter={() => commands.highlightQueue('macrotask')}
            onMouseLeave={() => commands.highlightQueue(null)}
          >
            <h4 className="font-semibold mb-2">
              ⏰ Macrotask Queue ({state.macrotaskQueue.length}/{maxMacrotaskQueueSize})
            </h4>
            <div className="min-h-[120px] bg-gray-50 rounded p-2">
              {state.macrotaskQueue.length === 0 ? (
                <div className="text-gray-400 text-center">비어있음</div>
              ) : (
                state.macrotaskQueue.map((task, index) => 
                  renderQueueItem(task, index)
                )
              )}
            </div>
          </div>
        </GamePanel>

        {/* 오른쪽: 실행 이력 및 디버그 정보 */}
        <GamePanel title="📊 실행 정보" className="h-[600px]">
          <div className="p-4">
            {/* 선택된 태스크 정보 */}
            {state.selectedTask && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">선택된 태스크:</h4>
                <pre className="text-xs">
                  {JSON.stringify(state.selectedTask, null, 2)}
                </pre>
              </div>
            )}

            {/* 스택 추적 */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">스택 추적:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {queries.getStackTrace().join('\n') || '(empty)'}
              </pre>
            </div>

            {/* 최근 실행 결과 */}
            {state.lastResult && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">최근 실행:</h4>
                <div className={`p-2 rounded text-sm ${
                  state.lastResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {state.lastResult.success ? '✅ 성공' : '❌ 실패'}
                  {state.lastResult.error && (
                    <div className="mt-1 text-xs">{state.lastResult.error.message}</div>
                  )}
                </div>
              </div>
            )}

            {/* 통계 */}
            <div>
              <h4 className="font-semibold mb-2">통계:</h4>
              <div className="text-sm space-y-1">
                <div>최대 스택 깊이: {state.stats.callStackMaxDepth}</div>
                <div>평균 실행 시간: {state.stats.avgExecutionTime.toFixed(2)}ms</div>
              </div>
            </div>
          </div>
        </GamePanel>
      </div>

      {/* 디버그 정보 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">디버그 정보</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {queries.getDebugInfo()}
          </pre>
        </details>
      )}
    </div>
  );
};