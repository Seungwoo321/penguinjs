// 콜스택 시각화 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { CallStackVisualizationPanelProps } from '../../../types/layout'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 콜스택 시각화 패널
 * 레이아웃 타입에 따라 다른 시각화 방식을 제공
 */
export const CallStackVisualizationPanel: React.FC<CallStackVisualizationPanelProps> = ({
  callstack,
  queues,
  layoutType,
  className
}) => {
  const title = queues && queues.length > 1 ? '📚 콜스택 & 큐 시각화' : '📚 콜스택'
  
  return (
    <GamePanel 
      title={title} 
      className={cn("flex flex-col overflow-hidden", className)}
    >
      {/* 헤더 */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
        <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          📚 {getVisualizationDescription(layoutType)}
        </p>
      </div>
      
      {/* 시각화 영역 */}
      <div className="flex-1 p-4 overflow-hidden">
        {queues && queues.length > 1 ? (
          <MultiQueueVisualization queues={queues} callstack={callstack} />
        ) : (
          <SingleCallStackVisualization callstack={callstack} layoutType={layoutType} />
        )}
      </div>
      
      {/* 정보 푸터 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
          <span>현재 항목: {callstack.length}개</span>
          <span>최대 크기: 5개</span>
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 단일 콜스택 시각화 (타입 A, A+)
 */
const SingleCallStackVisualization: React.FC<{
  callstack: StackItem[]
  layoutType: string
}> = ({ callstack, layoutType }) => {
  return (
    <div className="w-full h-full relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="h-full flex flex-col gap-2">
        {callstack.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg font-semibold mb-2">스택이 비어있습니다</p>
            <p className="text-sm text-center">함수가 호출되면 이곳에 표시됩니다</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col-reverse gap-2 overflow-y-auto">
            <AnimatePresence>
              {callstack.map((item, index) => (
                <motion.div
                  key={`${item.name || item.functionName || item}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{
                      typeof item === 'string' ? item : (item.name || item.functionName || 'Unknown')
                    }</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">#{callstack.length - index}</span>
                  </div>
                  {layoutType === 'A+' && item.startEnd && (
                    <div className="mt-1 text-xs text-gray-500">
                      {item.startEnd === 'start' ? '시작' : '종료'}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 다중 큐 시각화 (타입 B, C, D)
 */
const MultiQueueVisualization: React.FC<{
  queues: string[]
  callstack: any[]
}> = ({ queues, callstack }) => {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {queues.map((queueType) => (
        <div key={queueType} className="flex flex-col">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {getQueueTitle(queueType)}
          </h3>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 overflow-y-auto">
            {queueType === 'callstack' && callstack.length > 0 ? (
              <div className="space-y-2">
                {callstack.map((item, index) => (
                  <div
                    key={`${item.name || item.functionName || item}-${index}`}
                    className="bg-gray-50 dark:bg-gray-700 rounded p-2"
                  >
                    <span className="font-mono text-xs">{item.name || item.functionName || item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                비어있음
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// 유틸리티 함수들
function getVisualizationDescription(layoutType: string): string {
  switch (layoutType) {
    case 'A':
      return '함수 호출 순서를 스택으로 표시합니다'
    case 'A+':
      return '함수의 시작과 종료를 추적합니다'
    case 'E':
      return '실행 단계별 스택 상태를 표시합니다'
    default:
      return '콜스택과 이벤트 큐를 표시합니다'
  }
}

function getQueueTitle(queueType: string): string {
  switch (queueType) {
    case 'callstack':
      return '콜스택'
    case 'microtask':
      return '마이크로태스크'
    case 'macrotask':
      return '매크로태스크'
    default:
      return queueType
  }
}

// 타입 정의
interface StackItem {
  name?: string
  functionName?: string
  startEnd?: 'start' | 'end'
}