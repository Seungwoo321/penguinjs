/**
 * PureQueueVisualizer - 순수한 프레젠테이션 컴포넌트
 * 
 * 비즈니스 로직이 없고 props를 통해 데이터를 받아 렌더링만 담당
 * 모든 상태 변경은 콜백을 통해 상위 컴포넌트로 위임
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem,
  Task
} from '../event-loop/types';

// Props 타입 정의
export interface QueueVisualizerProps {
  // 데이터
  callStack: ReadonlyArray<CallStackFrame>;
  microtaskQueue: ReadonlyArray<MicrotaskItem>;
  macrotaskQueue: ReadonlyArray<MacrotaskItem>;
  
  // 상태
  selectedTaskId?: string;
  highlightedQueue?: 'callstack' | 'microtask' | 'macrotask';
  isExecuting?: boolean;
  
  // 설정
  maxCallStackSize: number;
  maxMicrotaskQueueSize: number;
  maxMacrotaskQueueSize: number;
  
  // 이벤트 핸들러
  onTaskClick?: (task: Task) => void;
  onQueueHover?: (queue: 'callstack' | 'microtask' | 'macrotask' | null) => void;
  
  // 스타일
  className?: string;
  theme?: QueueTheme;
}

// 테마 타입
export interface QueueTheme {
  callstack: {
    border: string;
    background: string;
    highlight: string;
  };
  microtask: {
    border: string;
    background: string;
    highlight: string;
  };
  macrotask: {
    border: string;
    background: string;
    highlight: string;
  };
}

// 기본 테마
const defaultTheme: QueueTheme = {
  callstack: {
    border: '#2196f3',
    background: '#e3f2fd',
    highlight: '#1976d2'
  },
  microtask: {
    border: '#4caf50',
    background: '#e8f5e9',
    highlight: '#388e3c'
  },
  macrotask: {
    border: '#ff9800',
    background: '#fff3e0',
    highlight: '#f57c00'
  }
};

// 큐 아이템 컴포넌트
const QueueItem = memo<{
  task: Task;
  isSelected: boolean;
  onClick?: () => void;
  theme: string;
}>(({ task, isSelected, onClick, theme }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.2 }}
    className="relative p-3 m-1 rounded-lg shadow-sm cursor-pointer transition-all"
    style={{
      backgroundColor: isSelected ? theme : 'white',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
    }}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="font-semibold text-sm">{task.name}</div>
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-gray-600">{task.status}</span>
      <span className={`text-xs px-2 py-0.5 rounded ${
        task.priority === 'high' ? 'bg-red-100 text-red-700' :
        task.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {task.priority}
      </span>
    </div>
  </motion.div>
));

QueueItem.displayName = 'QueueItem';

// 큐 컨테이너 컴포넌트
const QueueContainer = memo<{
  title: string;
  icon: string;
  items: ReadonlyArray<Task>;
  maxSize: number;
  isHighlighted: boolean;
  theme: QueueTheme['callstack'];
  selectedTaskId?: string;
  onTaskClick?: (task: Task) => void;
  onHover?: () => void;
  onLeave?: () => void;
  minHeight?: string;
}>(({ 
  title, 
  icon, 
  items, 
  maxSize, 
  isHighlighted, 
  theme,
  selectedTaskId,
  onTaskClick,
  onHover,
  onLeave,
  minHeight = '150px'
}) => (
  <motion.div
    className="p-4 rounded-xl border-2 transition-all"
    style={{
      borderColor: isHighlighted ? theme.highlight : theme.border,
      backgroundColor: isHighlighted ? theme.background : 'white'
    }}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    animate={{
      scale: isHighlighted ? 1.02 : 1,
      borderWidth: isHighlighted ? 3 : 2
    }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex justify-between items-center mb-3">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      <span className="text-sm text-gray-600">
        {items.length} / {maxSize}
      </span>
    </div>
    
    <div 
      className="bg-gray-50 rounded-lg p-2 overflow-y-auto"
      style={{ minHeight }}
    >
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-gray-400 text-center py-8"
          >
            비어있음
          </motion.div>
        ) : (
          items.map((item) => (
            <QueueItem
              key={item.id}
              task={item}
              isSelected={item.id === selectedTaskId}
              onClick={() => onTaskClick?.(item)}
              theme={theme.background}
            />
          ))
        )}
      </AnimatePresence>
    </div>
    
    {/* 용량 표시 바 */}
    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full"
        style={{ backgroundColor: theme.border }}
        animate={{ width: `${(items.length / maxSize) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  </motion.div>
));

QueueContainer.displayName = 'QueueContainer';

// 메인 컴포넌트
export const PureQueueVisualizer = memo<QueueVisualizerProps>(({
  callStack,
  microtaskQueue,
  macrotaskQueue,
  selectedTaskId,
  highlightedQueue,
  isExecuting,
  maxCallStackSize,
  maxMicrotaskQueueSize,
  maxMacrotaskQueueSize,
  onTaskClick,
  onQueueHover,
  className = '',
  theme = defaultTheme
}) => {
  // 콜스택은 역순으로 표시 (LIFO)
  const reversedCallStack = [...callStack].reverse();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 실행 상태 표시 */}
      {isExecuting && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center"
        >
          <span className="text-blue-800 font-semibold flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.span>
            실행 중...
          </span>
        </motion.div>
      )}

      {/* 콜스택 */}
      <QueueContainer
        title="Call Stack"
        icon="📚"
        items={reversedCallStack}
        maxSize={maxCallStackSize}
        isHighlighted={highlightedQueue === 'callstack'}
        theme={theme.callstack}
        selectedTaskId={selectedTaskId}
        onTaskClick={onTaskClick}
        onHover={() => onQueueHover?.('callstack')}
        onLeave={() => onQueueHover?.(null)}
        minHeight="200px"
      />

      {/* 큐 컨테이너 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 마이크로태스크 큐 */}
        <QueueContainer
          title="Microtask Queue"
          icon="⚡"
          items={microtaskQueue}
          maxSize={maxMicrotaskQueueSize}
          isHighlighted={highlightedQueue === 'microtask'}
          theme={theme.microtask}
          selectedTaskId={selectedTaskId}
          onTaskClick={onTaskClick}
          onHover={() => onQueueHover?.('microtask')}
          onLeave={() => onQueueHover?.(null)}
        />

        {/* 매크로태스크 큐 */}
        <QueueContainer
          title="Macrotask Queue"
          icon="⏰"
          items={macrotaskQueue}
          maxSize={maxMacrotaskQueueSize}
          isHighlighted={highlightedQueue === 'macrotask'}
          theme={theme.macrotask}
          selectedTaskId={selectedTaskId}
          onTaskClick={onTaskClick}
          onHover={() => onQueueHover?.('macrotask')}
          onLeave={() => onQueueHover?.(null)}
        />
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.callstack.border }} />
          <span>동기 실행 (Call Stack)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.microtask.border }} />
          <span>마이크로태스크 (Promise, queueMicrotask)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.macrotask.border }} />
          <span>매크로태스크 (setTimeout, setInterval)</span>
        </div>
      </div>
    </div>
  );
});

PureQueueVisualizer.displayName = 'PureQueueVisualizer';

// 스토리북 미리보기를 위한 샘플 데이터 생성 함수
export const createSampleData = () => ({
  callStack: [
    {
      id: '1',
      type: 'callstack' as const,
      name: 'main',
      priority: 'normal' as const,
      status: 'executing' as const,
      createdAt: Date.now()
    },
    {
      id: '2',
      type: 'callstack' as const,
      name: 'handleClick',
      priority: 'normal' as const,
      status: 'pending' as const,
      createdAt: Date.now()
    }
  ],
  microtaskQueue: [
    {
      id: '3',
      type: 'microtask' as const,
      name: 'Promise.then',
      priority: 'high' as const,
      status: 'pending' as const,
      createdAt: Date.now(),
      source: 'promise' as const
    }
  ],
  macrotaskQueue: [
    {
      id: '4',
      type: 'macrotask' as const,
      name: 'setTimeout callback',
      priority: 'normal' as const,
      status: 'pending' as const,
      createdAt: Date.now(),
      source: 'setTimeout' as const,
      delay: 1000
    }
  ]
});