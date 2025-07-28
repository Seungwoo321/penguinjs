'use client';

/**
 * Event Loop Visualizer Widget
 * 
 * Feature-Sliced Design widgets 레이어
 * 이벤트 루프 상태를 시각화하는 독립적인 위젯
 */

import React, { memo, useEffect } from 'react';
import { cn, GamePanel } from '@penguinjs/ui';

import { 
  useEventLoopSimulationStore, 
  useSimulationState, 
  useSimulationControls 
} from '../../../features/event-loop-simulation';

// 위젯 Props
export interface EventLoopVisualizerWidgetProps {
  className?: string;
  showControls?: boolean;
  autoInitialize?: boolean;
  onStateChange?: (state: any) => void;
}

// 콜스택 시각화 컴포넌트
const CallStackVisualization: React.FC<{ callStack: any[] }> = memo(({ callStack }) => (
  <div className="space-y-2">
    <h4 className="font-semibold text-sm">Call Stack</h4>
    <div className="border rounded-lg p-3 min-h-[200px] bg-gray-50">
      {callStack.length === 0 ? (
        <div className="text-gray-500 text-center py-8">Call stack is empty</div>
      ) : (
        <div className="space-y-1">
          {callStack.map((frame, index) => (
            <div
              key={frame.id || index}
              className={cn(
                "px-3 py-2 rounded border",
                index === callStack.length - 1 
                  ? "bg-blue-100 border-blue-300" 
                  : "bg-white border-gray-200"
              )}
            >
              <div className="font-mono text-sm">{frame.name}</div>
              <div className="text-xs text-gray-500">
                Priority: {frame.priority || 'normal'} | 
                Status: {frame.status || 'pending'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

// 마이크로태스크 큐 시각화 컴포넌트
const MicrotaskQueueVisualization: React.FC<{ microtaskQueue: any[] }> = memo(({ microtaskQueue }) => (
  <div className="space-y-2">
    <h4 className="font-semibold text-sm">Microtask Queue</h4>
    <div className="border rounded-lg p-3 min-h-[120px] bg-green-50">
      {microtaskQueue.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No microtasks</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {microtaskQueue.map((task, index) => (
            <div
              key={task.id || index}
              className={cn(
                "px-2 py-1 rounded text-xs border",
                task.priority === 'high' 
                  ? "bg-red-100 border-red-300" 
                  : "bg-green-100 border-green-300"
              )}
            >
              <div className="font-mono">{task.name}</div>
              <div className="text-gray-600">{task.source}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

// 매크로태스크 큐 시각화 컴포넌트
const MacrotaskQueueVisualization: React.FC<{ macrotaskQueue: any[] }> = memo(({ macrotaskQueue }) => (
  <div className="space-y-2">
    <h4 className="font-semibold text-sm">Macrotask Queue</h4>
    <div className="border rounded-lg p-3 min-h-[120px] bg-yellow-50">
      {macrotaskQueue.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No macrotasks</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {macrotaskQueue.map((task, index) => (
            <div
              key={task.id || index}
              className="px-2 py-1 rounded text-xs bg-yellow-100 border border-yellow-300"
            >
              <div className="font-mono">{task.name}</div>
              <div className="text-gray-600">{task.source}</div>
              {task.delay && (
                <div className="text-gray-500">Delay: {task.delay}ms</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

// 실행 상태 표시 컴포넌트
const ExecutionStatusVisualization: React.FC<{ 
  phase: string;
  currentTick: number;
  isRunning: boolean;
}> = memo(({ phase, currentTick, isRunning }) => (
  <div className="space-y-2">
    <h4 className="font-semibold text-sm">Execution Status</h4>
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Phase</div>
          <div className={cn(
            "font-semibold px-2 py-1 rounded text-xs",
            phase === 'idle' ? "bg-gray-200" :
            phase === 'check' ? "bg-green-200" :
            phase === 'timers' ? "bg-yellow-200" :
            "bg-blue-200"
          )}>
            {phase}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Tick</div>
          <div className="font-mono">{currentTick}</div>
        </div>
        <div>
          <div className="text-gray-600">Status</div>
          <div className={cn(
            "px-2 py-1 rounded text-xs font-semibold",
            isRunning ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          )}>
            {isRunning ? 'Running' : 'Stopped'}
          </div>
        </div>
      </div>
    </div>
  </div>
));

// 제어 패널 컴포넌트
const ControlPanel: React.FC = memo(() => {
  const { isRunning, isPaused, start, pause, resume, stop, step, reset } = useSimulationControls();
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Controls</h4>
      <div className="flex flex-wrap gap-2">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Start
          </button>
        ) : isPaused ? (
          <button
            onClick={resume}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
          >
            Pause
          </button>
        )}
        
        <button
          onClick={step}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Step
        </button>
        
        <button
          onClick={stop}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Stop
        </button>
        
        <button
          onClick={reset}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
});

// 메인 위젯 컴포넌트
export const EventLoopVisualizerWidget: React.FC<EventLoopVisualizerWidgetProps> = memo(({
  className,
  showControls = true,
  autoInitialize = true,
  onStateChange
}) => {
  const eventLoopState = useSimulationState();
  const initialize = useEventLoopSimulationStore(state => state.initialize);
  const currentTick = useEventLoopSimulationStore(state => state.currentTick);
  
  // 자동 초기화
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);
  
  // 상태 변경 콜백
  useEffect(() => {
    if (onStateChange && eventLoopState) {
      onStateChange(eventLoopState);
    }
  }, [eventLoopState, onStateChange]);
  
  if (!eventLoopState) {
    return (
      <GamePanel title="🔄 Event Loop Visualizer" className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Initializing...</div>
        </div>
      </GamePanel>
    );
  }
  
  return (
    <GamePanel title="🔄 Event Loop Visualizer" className={className}>
      <div className="space-y-4">
        {/* 실행 상태 */}
        <ExecutionStatusVisualization
          phase={eventLoopState.phase}
          currentTick={currentTick}
          isRunning={eventLoopState.isRunning}
        />
        
        {/* 제어 패널 */}
        {showControls && <ControlPanel />}
        
        {/* 콜스택 */}
        <CallStackVisualization callStack={eventLoopState.callStack} />
        
        {/* 큐들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MicrotaskQueueVisualization microtaskQueue={eventLoopState.microtaskQueue} />
          <MacrotaskQueueVisualization macrotaskQueue={eventLoopState.macrotaskQueue} />
        </div>
      </div>
    </GamePanel>
  );
});

EventLoopVisualizerWidget.displayName = 'EventLoopVisualizerWidget';