import { BaseGameEngine } from '../shared/BaseGameEngine'
import { CallStackLevel, StackItem, FunctionCall, CallStackGameState, QueueItem, QueueType } from './types'
import { GameValidationResult, GameDifficulty } from '../shared/types'
import { callstackLibraryConfig } from './game-config'
import { beginnerLevels } from './levels/beginner-levels'
import { intermediateLevels } from './levels/intermediate-levels' 
import { advancedLevels } from './levels/advanced-levels'
import { queueVisualConfigs } from './queue-configs'

export class CallStackEngine extends BaseGameEngine<CallStackLevel> {
  private gameState: CallStackGameState = {
    currentStack: [],
    executionOrder: [],
    isExecuting: false,
    currentFunction: null,
    stackOverflow: false,
    queues: {
      callstack: [],
      microtask: [],
      macrotask: [],
      priority: [],
      circular: [],
      deque: [],
      animation: [],
      immediate: [],
      idle: []
    },
    queueVisualConfigs
  }

  constructor() {
    super(callstackLibraryConfig)
    this.loadAllLevels()
  }

  protected loadAllLevels(): void {
    this.addLevels('beginner', beginnerLevels)
    this.addLevels('intermediate', intermediateLevels)
    this.addLevels('advanced', advancedLevels)
  }


  // 함수 실행 시뮬레이션
  executeFunction(funcCall: FunctionCall, depth: number = 0): void {
    if (depth > 100) {
      this.gameState.stackOverflow = true
      return
    }

    const isGlobalContext = funcCall.name === '<global>'
    const stackItem: StackItem = {
      id: `${funcCall.name}-${Date.now()}`,
      functionName: funcCall.name,
      returnValue: funcCall.returns,
      color: isGlobalContext ? 'rgb(107, 114, 128)' : this.getColorForDepth(depth),
      height: 60,
      isGlobalContext
    }

    // 스택에 추가
    this.gameState.currentStack.push(stackItem)
    this.gameState.executionOrder.push(funcCall.name)
    this.gameState.currentFunction = funcCall.name

    // 중첩 함수 호출
    if (funcCall.calls) {
      for (const nestedCall of funcCall.calls) {
        this.executeFunction(nestedCall, depth + 1)
      }
    }

    // 스택에서 제거
    this.gameState.currentStack.pop()
    // null 체크 강화
    const currentStack = this.gameState.currentStack
    if (currentStack && currentStack.length > 0) {
      this.gameState.currentFunction = currentStack[currentStack.length - 1]?.functionName || null
    } else {
      this.gameState.currentFunction = null
    }
  }

  // 큐 타입에 따른 색상 반환
  getQueueColor(queueType: QueueType): string {
    return queueVisualConfigs[queueType]?.color || '#6b7280'
  }

  // 사용자 답안 검증
  validateAnswer(level: CallStackLevel, userOrder: string[], layoutType?: string): GameValidationResult {
    try {
      // Type E 레이아웃의 경우 스냅샷 검증
      if (layoutType === 'E') {
        return this.validateTypeESnapshots(level, userOrder)
      }

      // Type B 레이아웃의 경우 큐 상태 검증
      if (layoutType === 'B') {
        return this.validateTypeBQueues(level, userOrder)
      }

      // Type A+ 레이아웃의 경우 시뮬레이션 스텝과 비교
      if (layoutType === 'A+' && level.simulationSteps) {
        // 사용자 답안을 시뮬레이션 스텝 형식으로 변환
        const userSteps: string[] = []
        userOrder.forEach(item => {
          if (item.endsWith(' 종료')) {
            // '함수명 종료' -> '함수명-return'
            const funcName = item.replace(' 종료', '')
            userSteps.push(`${funcName}-return`)
          } else {
            // 시작 함수는 그대로
            userSteps.push(item)
          }
        })
        
        // main과 main-return을 제외한 실제 스텝들만 비교
        const expectedSteps = level.simulationSteps.filter(step => 
          step !== '<global>' && step !== '<global>-return'
        )
        
        const isCorrect = JSON.stringify(userSteps) === JSON.stringify(expectedSteps)
        
        if (isCorrect) {
          const score = this.calculateScore(userOrder.length, level.hints.length)
          return {
            success: true,
            message: '완벽합니다! LIFO 원칙에 따른 함수 시작/종료 순서를 정확히 맞추셨어요! 🎉',
            score
          }
        } else {
          return {
            success: false,
            message: 'LIFO 순서가 올바르지 않습니다. 함수의 시작과 종료 순서를 다시 확인해보세요.',
            hint: this.findDifferenceHint(userSteps, expectedSteps)
          }
        }
      }
      
      // 기본 Type A 검증
      const isCorrect = JSON.stringify(userOrder) === JSON.stringify(level.expectedOrder)

      if (isCorrect) {
        const score = this.calculateScore(userOrder.length, level.hints.length)
        return {
          success: true,
          message: '완벽합니다! 콜스택 순서를 정확히 맞추셨어요! 🎉',
          score
        }
      } else {
        return {
          success: false,
          message: '순서가 올바르지 않습니다. 함수 호출 순서를 다시 확인해보세요.',
          hint: this.findDifferenceHint(userOrder, level.expectedOrder)
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      }
    }
  }

  // 색상 결정 (깊이에 따라)
  private getColorForDepth(depth: number): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
    ]
    return colors[depth % colors.length]
  }

  // 타입 E 스냅샷 검증
  private validateTypeESnapshots(level: CallStackLevel, userSnapshots: any): GameValidationResult {
    try {
      if (!level.expectedSnapshots || !level.snapshotCheckpoints) {
        return {
          success: false,
          message: '레벨 설정이 올바르지 않습니다.'
        }
      }

      let correctSnapshots = 0
      let totalSnapshots = level.snapshotCheckpoints.length
      let firstError: string | null = null

      for (const checkpoint of level.snapshotCheckpoints) {
        const expectedSnapshot = level.expectedSnapshots[checkpoint]
        const userSnapshot = userSnapshots[checkpoint]

        if (!userSnapshot) {
          if (!firstError) {
            firstError = `단계 ${checkpoint + 1}의 스냅샷이 구성되지 않았습니다.`
          }
          continue
        }

        if (this.compareSnapshots(expectedSnapshot, userSnapshot)) {
          correctSnapshots++
        } else {
          if (!firstError) {
            firstError = `단계 ${checkpoint + 1}의 스택 구성이 올바르지 않습니다.`
          }
        }
      }

      const successRate = correctSnapshots / totalSnapshots
      
      if (successRate === 1) {
        const score = this.calculateScore(totalSnapshots, 0)
        return {
          success: true,
          message: `완벽합니다! 모든 실행 단계의 콜스택을 정확히 구성하셨어요! 🎉`,
          score
        }
      } else if (successRate >= 0.7) {
        return {
          success: false,
          message: `${correctSnapshots}/${totalSnapshots} 단계를 맞추셨습니다. 조금 더 정확히 해보세요!`,
          hint: firstError || '일부 스냅샷을 다시 확인해보세요.'
        }
      } else {
        return {
          success: false,
          message: `${correctSnapshots}/${totalSnapshots} 단계를 맞추셨습니다. 함수 호출과 반환 과정을 다시 살펴보세요.`,
          hint: firstError || '스택의 LIFO 원칙을 기억하세요.'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `스냅샷 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      }
    }
  }

  // 타입 B 큐 상태 검증
  private validateTypeBQueues(level: CallStackLevel, userQueues: any): GameValidationResult {
    try {
      // 기본적으로 expectedOrder를 사용하여 검증
      if (level.expectedOrder && Array.isArray(userQueues)) {
        const isCorrect = JSON.stringify(userQueues) === JSON.stringify(level.expectedOrder)
        
        if (isCorrect) {
          const score = this.calculateScore(userQueues.length, level.hints.length)
          return {
            success: true,
            message: '완벽합니다! 이벤트 루프의 실행 순서를 정확히 이해하셨네요! 🎉',
            score
          }
        } else {
          return {
            success: false,
            message: '실행 순서가 올바르지 않습니다. 큐의 우선순위를 다시 확인해보세요.',
            hint: '마이크로태스크는 매크로태스크보다 먼저 실행됩니다.'
          }
        }
      }
      
      return {
        success: false,
        message: '큐 상태 검증에 필요한 데이터가 없습니다.'
      }
    } catch (error) {
      return {
        success: false,
        message: `큐 검증 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      }
    }
  }

  // 스냅샷 비교
  private compareSnapshots(expected: StackItem[], user: StackItem[]): boolean {
    if (expected.length !== user.length) {
      return false
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i].functionName !== user[i].functionName) {
        return false
      }
      
      // 전역 컨텍스트 체크
      if (expected[i].isGlobalContext !== user[i].isGlobalContext) {
        return false
      }
    }

    return true
  }
  
  // 단일 스냅샷 검증 (타입 E 전용)
  validateSnapshot(userSnapshot: StackItem[], expectedSnapshot: (string | StackItem)[]): boolean {
    if (userSnapshot.length !== expectedSnapshot.length) {
      return false
    }
    
    for (let i = 0; i < userSnapshot.length; i++) {
      const expected = expectedSnapshot[i]
      const userFunc = userSnapshot[i].functionName
      
      // expectedSnapshot이 문자열 배열이거나 StackItem 배열일 수 있음
      const expectedFunc = typeof expected === 'string' 
        ? expected 
        : expected.functionName
        
      if (userFunc !== expectedFunc) {
        return false
      }
    }
    
    return true
  }

  // 차이점 힌트 생성
  private findDifferenceHint(userOrder: string[], expectedOrder: string[]): string {
    for (let i = 0; i < Math.max(userOrder.length, expectedOrder.length); i++) {
      if (userOrder[i] !== expectedOrder[i]) {
        return `${i + 1}번째 함수 호출을 다시 확인해보세요.`
      }
    }
    return '배열 길이를 확인해보세요.'
  }

  // 점수 계산
  private calculateScore(correctCount: number, hintsUsed: number): number {
    const baseScore = 100
    const hintPenalty = hintsUsed * 10
    return Math.max(baseScore - hintPenalty, 50)
  }

  // 큐에 아이템 추가
  addToQueue(queueType: QueueType, item: QueueItem): void {
    if (!this.gameState.queues[queueType]) {
      this.gameState.queues[queueType] = []
    }

    const config = this.gameState.queueVisualConfigs[queueType]
    
    // 큐 타입에 따른 추가 로직
    switch (queueType) {
      case 'priority':
        // 우선순위에 따라 정렬
        this.gameState.queues[queueType].push(item)
        this.gameState.queues[queueType].sort((a, b) => (b.priority || 0) - (a.priority || 0))
        break
        
      case 'circular':
        // 원형 큐 - 최대 크기 확인
        if (this.gameState.queues[queueType].length >= config.maxSize) {
          // 가장 오래된 항목 제거 (FIFO)
          this.gameState.queues[queueType].shift()
        }
        this.gameState.queues[queueType].push(item)
        break
        
      default:
        // 일반적인 FIFO 또는 LIFO
        if (config.fifo) {
          this.gameState.queues[queueType].push(item)
        } else {
          this.gameState.queues[queueType].unshift(item)
        }
    }

    // 최대 크기 체크
    if (this.gameState.queues[queueType].length > config.maxSize) {
      if (config.fifo) {
        this.gameState.queues[queueType].shift() // 가장 오래된 항목 제거
      } else {
        this.gameState.queues[queueType].pop() // 가장 최근 항목 제거
      }
    }
  }

  // 큐에서 아이템 제거
  removeFromQueue(queueType: QueueType): QueueItem | null {
    const queue = this.gameState.queues[queueType]
    if (!queue || queue.length === 0) return null

    const config = this.gameState.queueVisualConfigs[queueType]
    
    switch (queueType) {
      case 'deque':
        // 덱의 경우 앞에서 제거 (기본값)
        return queue.shift() || null
        
      default:
        // 일반적인 큐 동작
        if (config.fifo) {
          return queue.shift() || null // FIFO
        } else {
          return queue.pop() || null   // LIFO
        }
    }
  }

  // 덱에서 뒤쪽 제거 (덱 전용)
  removeFromDequeRear(): QueueItem | null {
    const queue = this.gameState.queues['deque']
    if (!queue || queue.length === 0) return null
    return queue.pop() || null
  }

  // 덱 앞쪽에 추가 (덱 전용)
  addToDequeFont(item: QueueItem): void {
    this.gameState.queues['deque'].unshift(item)
    
    const config = this.gameState.queueVisualConfigs['deque']
    if (this.gameState.queues['deque'].length > config.maxSize) {
      this.gameState.queues['deque'].pop() // 뒤에서 제거
    }
  }

  // 함수 호출을 큐 아이템으로 변환
  private createQueueItem(funcCall: FunctionCall, queueType: QueueType): QueueItem {
    return {
      id: `${funcCall.name}-${queueType}-${Date.now()}-${Math.random()}`,
      functionName: funcCall.name,
      returnValue: funcCall.returns,
      color: this.gameState.queueVisualConfigs[queueType].color,
      height: 60,
      queueType,
      priority: funcCall.priority,
      timestamp: Date.now(),
      data: funcCall.params,
      position: funcCall.position
    }
  }

  // 확장된 함수 실행 시뮬레이션
  executeEnhancedFunction(funcCall: FunctionCall, depth: number = 0): void {
    if (depth > 100) {
      this.gameState.stackOverflow = true
      return
    }

    const queueType = funcCall.queueType || 'callstack'
    const queueItem = this.createQueueItem(funcCall, queueType)

    // 큐에 따른 처리
    if (queueType === 'callstack') {
      // 콜스택 처리 (기존 로직)
      const isGlobalContext = funcCall.name === '<global>'
      const stackItem: StackItem = {
        id: queueItem.id,
        functionName: funcCall.name,
        returnValue: funcCall.returns,
        color: isGlobalContext ? 'rgb(107, 114, 128)' : this.getColorForDepth(depth),
        height: 60,
        queueType,
        priority: funcCall.priority,
        timestamp: Date.now(),
        isGlobalContext
      }

      this.gameState.currentStack.push(stackItem)
      this.gameState.executionOrder.push(funcCall.name)
      this.gameState.currentFunction = funcCall.name

      // 중첩 함수 호출
      if (funcCall.calls) {
        for (const nestedCall of funcCall.calls) {
          this.executeEnhancedFunction(nestedCall, depth + 1)
        }
      }

      this.gameState.currentStack.pop()
      this.gameState.currentFunction = this.gameState.currentStack[this.gameState.currentStack.length - 1]?.functionName || null
    } else {
      // 다른 큐들에 추가
      this.addToQueue(queueType, queueItem)
      this.gameState.executionOrder.push(funcCall.name)
    }
  }

  // 게임 상태 리셋
  resetGameState(): void {
    this.gameState = {
      currentStack: [],
      executionOrder: [],
      isExecuting: false,
      currentFunction: null,
      stackOverflow: false,
      queues: {
        callstack: [],
        microtask: [],
        macrotask: [],
        priority: [],
        circular: [],
        deque: [],
        animation: [],
        immediate: [],
        idle: []
      },
      queueVisualConfigs
    }
  }

  // 현재 게임 상태 반환
  getGameState(): CallStackGameState {
    return { ...this.gameState }
  }

  // 특정 큐의 상태 반환
  getQueueState(queueType: QueueType): QueueItem[] {
    return [...(this.gameState.queues[queueType] || [])]
  }

  // 모든 큐의 상태 반환
  getAllQueuesState(): Record<QueueType, QueueItem[]> {
    const result: Partial<Record<QueueType, QueueItem[]>> = {}
    for (const [queueType, items] of Object.entries(this.gameState.queues)) {
      result[queueType as QueueType] = [...items]
    }
    return result as Record<QueueType, QueueItem[]>
  }
}