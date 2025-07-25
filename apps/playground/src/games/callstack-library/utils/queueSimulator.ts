// 이벤트 루프 시뮬레이션 엔진
// Layout B (고급 21-22단계)를 위한 큐 상태 시뮬레이션

import { QueueType, QueueItem, CallStackLevel } from '../types'
import { QueueStatesSnapshot, EventLoopStep } from '../types/layout'
import { getFunctionColor } from './executionSimulator'

export interface QueueSimulatorConfig {
  includeConsoleLog?: boolean  // console.log를 큐에 포함할지 여부
  maxQueueSize?: number        // 큐 최대 크기
  timestampIncrement?: number  // 타임스탬프 증가값
}

/**
 * 이벤트 루프 시뮬레이터 클래스
 * JavaScript 이벤트 루프의 동작을 정확히 시뮬레이션
 */
export class EventLoopSimulator {
  private callStack: QueueItem[] = []
  private microtaskQueue: QueueItem[] = []
  private macrotaskQueue: QueueItem[] = []
  private currentTimestamp = 0
  private config: QueueSimulatorConfig

  constructor(config: QueueSimulatorConfig = {}) {
    this.config = {
      includeConsoleLog: false,
      maxQueueSize: 10,
      timestampIncrement: 100,
      ...config
    }
  }

  /**
   * 레벨 데이터를 기반으로 이벤트 루프 단계들을 시뮬레이션
   */
  simulateEventLoop(level: CallStackLevel): EventLoopStep[] {
    const steps: EventLoopStep[] = []
    
    if (!level.simulationSteps || !level.executionSteps) {
      return steps
    }

    this.reset()
    
    // 실행 단계별로 이벤트 루프 시뮬레이션
    level.executionSteps.forEach((execStep, stepIndex) => {
      const beforeState = this.getCurrentSnapshot(stepIndex)
      
      // 해당 실행 단계에서 실행될 시뮬레이션 단계들 찾기
      const simulationIndices = this.getSimulationIndicesForStep(
        stepIndex, 
        level.simulationSteps.length, 
        level.executionSteps.length
      )
      
      const executedItems: QueueItem[] = []
      
      // 시뮬레이션 단계들 실행
      for (const simIndex of simulationIndices) {
        if (simIndex >= level.simulationSteps.length) continue
        
        const simStep = level.simulationSteps[simIndex]
        const executed = this.executeSimulationStep(simStep, stepIndex)
        if (executed) {
          executedItems.push(executed)
        }
      }
      
      const afterState = this.getCurrentSnapshot(stepIndex)
      
      steps.push({
        id: `step-${stepIndex}`,
        step: stepIndex,
        description: execStep.description || `실행 단계 ${stepIndex + 1}`,
        beforeState,
        afterState,
        executedItems,
        currentLine: execStep.currentLine || 1
      })
    })

    return steps
  }

  /**
   * 개별 시뮬레이션 단계 실행
   */
  private executeSimulationStep(simStep: string, stepIndex: number): QueueItem | null {
    this.currentTimestamp += this.config.timestampIncrement!

    if (simStep.endsWith('-return')) {
      // 함수 반환 처리
      return this.handleReturn(simStep, stepIndex)
    } else if (simStep === 'console.log') {
      // console.log 처리 (설정에 따라)
      if (this.config.includeConsoleLog) {
        return this.addToCallStack('console.log', stepIndex)
      }
      return null
    } else if (this.isAsyncFunction(simStep)) {
      // 비동기 함수 처리
      return this.handleAsyncFunction(simStep, stepIndex)
    } else {
      // 일반 함수 호출
      return this.addToCallStack(simStep, stepIndex)
    }
  }

  /**
   * 함수 반환 처리
   */
  private handleReturn(returnStep: string, stepIndex: number): QueueItem | null {
    const funcName = returnStep.replace('-return', '')
    
    // 콜스택에서 해당 함수 제거
    const removedIndex = this.findAndRemoveFromCallStack(funcName)
    if (removedIndex !== -1) {
      // 제거된 아이템 반환 (로그용)
      return this.createQueueItem(funcName, 'callstack', stepIndex, { returned: true })
    }
    
    return null
  }

  /**
   * 비동기 함수인지 확인
   */
  private isAsyncFunction(funcName: string): boolean {
    const asyncFunctions = [
      'setTimeout', 'setInterval', 'setImmediate',
      'queueMicrotask', 'Promise', 'requestAnimationFrame'
    ]
    
    return asyncFunctions.some(asyncFunc => funcName.includes(asyncFunc))
  }

  /**
   * 비동기 함수 처리
   */
  private handleAsyncFunction(funcName: string, stepIndex: number): QueueItem | null {
    if (funcName.includes('queueMicrotask') || funcName.includes('Promise')) {
      // 마이크로태스크 큐에 추가
      return this.addToMicrotaskQueue(funcName, stepIndex)
    } else if (funcName.includes('setTimeout') || funcName.includes('setInterval') || funcName.includes('setImmediate')) {
      // 매크로태스크 큐에 추가
      return this.addToMacrotaskQueue(funcName, stepIndex)
    } else if (funcName.includes('requestAnimationFrame')) {
      // 애니메이션 프레임 큐 (매크로태스크로 처리)
      return this.addToMacrotaskQueue(funcName, stepIndex)
    }
    
    // isAsyncFunction이 true를 반환했지만 여기서 처리되지 않은 경우
    // 이는 버그이므로 에러를 던짐
    throw new Error(`Unknown async function type: ${funcName}`)
  }

  /**
   * 콜스택에 함수 추가
   */
  private addToCallStack(funcName: string, stepIndex: number): QueueItem {
    const item = this.createQueueItem(funcName, 'callstack', stepIndex)
    this.callStack.push(item)
    return item
  }

  /**
   * 마이크로태스크 큐에 함수 추가
   */
  private addToMicrotaskQueue(funcName: string, stepIndex: number): QueueItem {
    const item = this.createQueueItem(funcName, 'microtask', stepIndex)
    this.microtaskQueue.push(item)
    return item
  }

  /**
   * 매크로태스크 큐에 함수 추가
   */
  private addToMacrotaskQueue(funcName: string, stepIndex: number): QueueItem {
    const item = this.createQueueItem(funcName, 'macrotask', stepIndex)
    this.macrotaskQueue.push(item)
    return item
  }

  /**
   * 콜스택에서 함수 찾아서 제거
   */
  private findAndRemoveFromCallStack(funcName: string): number {
    // 뒤에서부터 검색 (LIFO)
    for (let i = this.callStack.length - 1; i >= 0; i--) {
      const item = this.callStack[i]
      
      if (item.functionName === funcName || 
          (funcName === 'main' && item.functionName === '<global>')) {
        this.callStack.splice(i, 1)
        return i
      }
    }
    return -1
  }

  /**
   * QueueItem 생성
   */
  private createQueueItem(
    funcName: string, 
    queueType: QueueType, 
    stepIndex: number,
    extraData?: any
  ): QueueItem {
    const displayName = funcName === 'main' ? '<global>' : funcName
    
    return {
      id: `${queueType}-${funcName}-${stepIndex}-${this.currentTimestamp}`,
      functionName: displayName,
      color: getFunctionColor(displayName),
      height: 40,
      queueType,
      timestamp: this.currentTimestamp,
      data: extraData,
      position: stepIndex
    }
  }

  /**
   * 현재 큐 상태 스냅샷 생성
   */
  private getCurrentSnapshot(stepIndex: number): QueueStatesSnapshot {
    return {
      callstack: [...this.callStack],
      microtask: [...this.microtaskQueue],
      macrotask: [...this.macrotaskQueue],
      step: stepIndex,
      timestamp: this.currentTimestamp
    }
  }

  /**
   * 특정 실행 단계에서 실행될 시뮬레이션 인덱스들 계산
   */
  private getSimulationIndicesForStep(
    execStep: number, 
    totalSimSteps: number, 
    totalExecSteps: number
  ): number[] {
    // 균등 분배 방식
    const stepRatio = totalSimSteps / totalExecSteps
    const startIndex = Math.floor(execStep * stepRatio)
    const endIndex = Math.floor((execStep + 1) * stepRatio) - 1
    
    const indices: number[] = []
    for (let i = startIndex; i <= endIndex && i < totalSimSteps; i++) {
      indices.push(i)
    }
    
    return indices.length > 0 ? indices : [Math.min(execStep, totalSimSteps - 1)]
  }

  /**
   * 시뮬레이터 상태 초기화
   */
  private reset(): void {
    this.callStack = []
    this.microtaskQueue = []
    this.macrotaskQueue = []
    this.currentTimestamp = 0
  }
}

/**
 * 레벨 데이터를 기반으로 이벤트 루프 시뮬레이션 실행
 * (외부 인터페이스)
 */
export function simulateEventLoop(
  level: CallStackLevel, 
  config?: QueueSimulatorConfig
): EventLoopStep[] {
  const simulator = new EventLoopSimulator(config)
  return simulator.simulateEventLoop(level)
}

/**
 * 빈 큐 상태 스냅샷 생성
 */
export function createEmptyQueueSnapshot(step: number = 0): QueueStatesSnapshot {
  return {
    callstack: [],
    microtask: [],
    macrotask: [],
    step,
    timestamp: 0
  }
}

/**
 * 큐 상태 스냅샷 비교 (검증용)
 */
export function compareQueueSnapshots(
  snapshot1: QueueStatesSnapshot,
  snapshot2: QueueStatesSnapshot
): boolean {
  return (
    JSON.stringify(snapshot1.callstack.map(item => item.functionName)) === 
    JSON.stringify(snapshot2.callstack.map(item => item.functionName)) &&
    JSON.stringify(snapshot1.microtask.map(item => item.functionName)) === 
    JSON.stringify(snapshot2.microtask.map(item => item.functionName)) &&
    JSON.stringify(snapshot1.macrotask.map(item => item.functionName)) === 
    JSON.stringify(snapshot2.macrotask.map(item => item.functionName))
  )
}