import { CallStackLevel, StackItem } from '../types'

// 함수별 색상 매핑
const FUNCTION_COLORS: Record<string, string> = {
  '<global>': 'rgb(107, 114, 128)',
  'main': 'rgb(107, 114, 128)',
  'processUser': 'rgb(59, 130, 246)',
  'greet': 'rgb(34, 197, 94)',
  'calculate': 'rgb(59, 130, 246)',
  'multiply': 'rgb(34, 197, 94)',
  'add': 'rgb(168, 85, 247)',
  'factorial': 'rgb(59, 130, 246)',
  'checkNumbers': 'rgb(59, 130, 246)',
  'isEven': 'rgb(34, 197, 94)',
  'processEven': 'rgb(168, 85, 247)',
  'console.log': 'rgb(251, 146, 60)',
  'setTimeout': 'rgb(239, 68, 68)',
  'Promise': 'rgb(236, 72, 153)',
  'queueMicrotask': 'rgb(14, 165, 233)',
  'requestAnimationFrame': 'rgb(34, 197, 94)'
}

// 색상 순환 배열 (동적 함수용)
const COLOR_PALETTE = [
  'rgb(59, 130, 246)',   // blue-500
  'rgb(34, 197, 94)',    // emerald-500
  'rgb(168, 85, 247)',   // purple-500
  'rgb(251, 146, 60)',   // orange-400
  'rgb(236, 72, 153)',   // pink-500
  'rgb(14, 165, 233)'    // sky-500
]

/**
 * 함수 이름에 따른 색상 반환
 */
export function getFunctionColor(functionName: string): string {
  // 정적 매핑 확인
  if (FUNCTION_COLORS[functionName]) {
    return FUNCTION_COLORS[functionName]
  }
  
  // factorial(n) 형태 처리
  if (functionName.startsWith('factorial(')) {
    const n = parseInt(functionName.match(/\d+/)?.[0] || '0')
    return COLOR_PALETTE[(n - 1) % COLOR_PALETTE.length]
  }
  
  // 기타 함수는 해시 기반 색상 할당
  let hash = 0
  for (let i = 0; i < functionName.length; i++) {
    hash = ((hash << 5) - hash) + functionName.charCodeAt(i)
    hash = hash & hash
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length]
}

/**
 * 실행 시뮬레이터 설정
 */
export interface SimulatorConfig {
  // 시뮬레이션 매핑 전략
  mappingStrategy?: 'strict' | 'flexible' | 'custom'
  // 커스텀 매핑 함수
  customMapper?: (execStep: number, simSteps: string[], level: CallStackLevel) => number
  // 스택 아이템 커스터마이징
  stackItemFactory?: (functionName: string, index: number) => Partial<StackItem>
}

/**
 * 실행 단계와 시뮬레이션 단계 간 매핑 정보
 */
interface StepMapping {
  executionStep: number
  simulationIndices: number[]
  stackSnapshot: StackItem[]
}

/**
 * simulationSteps를 기반으로 정확한 스택 상태 생성
 */
export function simulateExecution(
  level: CallStackLevel,
  config: SimulatorConfig = {}
): StackItem[][] {
  if (!level.simulationSteps || !level.executionSteps) {
    return []
  }
  
  const { 
    mappingStrategy = 'flexible',
    customMapper,
    stackItemFactory 
  } = config
  
  // 매핑 테이블 생성
  const mappingTable = createMappingTable(level, mappingStrategy, customMapper)
  
  // 시뮬레이션 실행: 각 실행 단계마다 처음부터 시뮬레이션을 실행
  const history: StackItem[][] = []
  
  for (const mapping of mappingTable) {
    // console.log(`🎯 Processing mapping for exec step ${mapping.executionStep}:`, {
    //   simulationIndices: mapping.simulationIndices
    // })
    
    // 각 실행 단계마다 새로 스택을 계산
    const stack: StackItem[] = []
    const maxSimIndex = Math.max(...mapping.simulationIndices)
    
    // 처음부터 해당 실행 단계까지의 모든 시뮬레이션 단계 실행
    for (let simIndex = 0; simIndex <= maxSimIndex && simIndex < level.simulationSteps.length; simIndex++) {
      const simStep = level.simulationSteps[simIndex]
      if (!simStep) break
      
      // console.log(`  🔄 Processing sim step ${simIndex}: ${simStep}`)
      
      if (simStep.endsWith('-return')) {
        // 함수 종료: 스택에서 제거
        handleReturn(stack, simStep)
        // console.log(`    ➖ Removed from stack, current stack:`, stack.map(s => s.functionName))
      } else if (simStep === 'console.log') {
        // console.log는 즉시 실행되므로 스택에 지속적으로 남지 않음
        // 실제로는 잠깐 스택에 있다가 바로 사라짐
        continue
      } else {
        // 함수 호출: 스택에 추가
        const stackItem = createStackItem(simStep, simIndex, stackItemFactory)
        stack.push(stackItem)
        // console.log(`    ➕ Added to stack: ${stackItem.functionName}, current stack:`, stack.map(s => s.functionName))
      }
    }
    
    // 현재 실행 단계의 스택 상태 저장
    const stackSnapshot = stack.map((item, index) => ({
      ...item,
      id: `${item.functionName}-${mapping.executionStep}-${index}`
    }))
    
    // console.log(`  📸 Final snapshot for exec step ${mapping.executionStep}:`, stackSnapshot.map(s => s.functionName))
    
    history[mapping.executionStep] = stackSnapshot
  }
  
  return history
}

/**
 * 실행 단계와 시뮬레이션 단계 간 매핑 테이블 생성
 */
function createMappingTable(
  level: CallStackLevel,
  strategy: string,
  customMapper?: (execStep: number, simSteps: string[], level: CallStackLevel) => number
): StepMapping[] {
  const mappings: StepMapping[] = []
  const { executionSteps, simulationSteps } = level
  
  if (!executionSteps || !simulationSteps) return mappings
  
  switch (strategy) {
    case 'strict':
      // 엄격한 매핑: executionSteps와 simulationSteps가 1:1 대응
      return createStrictMapping(executionSteps, simulationSteps)
      
    case 'custom':
      // 커스텀 매핑 함수 사용
      if (customMapper) {
        return createCustomMapping(executionSteps, simulationSteps, level, customMapper)
      }
      // fallthrough to flexible
      
    case 'flexible':
    default:
      // 유연한 매핑: 실행 단계 설명을 기반으로 매핑
      return createFlexibleMapping(executionSteps, simulationSteps)
  }
}

/**
 * 엄격한 1:1 매핑
 */
function createStrictMapping(
  executionSteps: any[],
  simulationSteps: string[]
): StepMapping[] {
  return executionSteps.map((step, index) => ({
    executionStep: index,
    simulationIndices: [index],
    stackSnapshot: []
  }))
}

/**
 * 커스텀 매핑
 */
function createCustomMapping(
  executionSteps: any[],
  simulationSteps: string[],
  level: CallStackLevel,
  mapper: (execStep: number, simSteps: string[], level: CallStackLevel) => number
): StepMapping[] {
  const mappings: StepMapping[] = []
  let lastSimIndex = 0
  
  executionSteps.forEach((step, execIndex) => {
    const targetSimIndex = mapper(execIndex, simulationSteps, level)
    const indices: number[] = []
    
    for (let i = lastSimIndex; i <= targetSimIndex && i < simulationSteps.length; i++) {
      indices.push(i)
    }
    
    mappings.push({
      executionStep: execIndex,
      simulationIndices: indices,
      stackSnapshot: []
    })
    
    lastSimIndex = targetSimIndex + 1
  })
  
  return mappings
}

/**
 * 유연한 매핑: 실행 단계 설명을 기반으로 시뮬레이션 단계 매핑
 */
function createFlexibleMapping(
  executionSteps: any[],
  simulationSteps: string[]
): StepMapping[] {
  const mappings: StepMapping[] = []
  
  // 각 실행 단계별로 어느 시뮬레이션 인덱스까지 진행해야 하는지 미리 계산
  const targetIndices = calculateTargetIndices(executionSteps, simulationSteps)
  
  // Debug mapping calculation
  // console.log('🔍 Flexible Mapping Debug:', {
  //   executionSteps: executionSteps.map((s, i) => `${i}: ${s.description}`),
  //   simulationSteps,
  //   targetIndices
  // })
  
  let lastTargetIndex = -1
  
  executionSteps.forEach((execStep, execIndex) => {
    const targetIndex = targetIndices[execIndex]
    const indices: number[] = []
    
    // 이전 단계 다음부터 현재 목표까지
    for (let i = lastTargetIndex + 1; i <= targetIndex && i < simulationSteps.length; i++) {
      indices.push(i)
    }
    
    // console.log(`Step ${execIndex} (${execStep.description}): lastTarget=${lastTargetIndex}, target=${targetIndex}, indices=[${indices.join(',')}]`)
    
    mappings.push({
      executionStep: execIndex,
      simulationIndices: indices,
      stackSnapshot: []
    })
    
    lastTargetIndex = targetIndex
  })
  
  // console.log('📋 Final mappings:', mappings)
  return mappings
}

/**
 * 각 실행 단계의 목표 시뮬레이션 인덱스 계산
 * 패턴 매칭을 통한 범용적 접근
 */
function calculateTargetIndices(
  executionSteps: any[],
  simulationSteps: string[]
): number[] {
  const targets: number[] = []
  
  // 균등 분배 방식: 실행 단계 수에 맞춰 시뮬레이션 단계를 분배
  const stepRatio = simulationSteps.length / executionSteps.length
  
  executionSteps.forEach((execStep, execIndex) => {
    const { description } = execStep
    
    // 기본 인덱스 (균등 분배)
    let targetIndex = Math.floor(execIndex * stepRatio)
    
    // 특정 패턴에 따른 조정
    if (description.includes('시작')) {
      targetIndex = 0
    } else if (description.includes('호출')) {
      // 함수 호출은 새로운 스택 프레임 추가 시점
      targetIndex = findNextPushIndex(targetIndex, simulationSteps)
    } else if (description.includes('실행')) {
      // 내부 실행은 현재 상태 유지하면서 세부 동작
      if (description.includes('console.log')) {
        targetIndex = findConsoleLogIndex(targetIndex, simulationSteps, execIndex)
      }
    } else if (description.includes('return') || description.includes('반환') || description.includes('종료')) {
      // 함수 반환은 스택 프레임 제거 시점
      targetIndex = findNextReturnIndex(targetIndex, simulationSteps)
    }
    
    // 경계 검사
    targetIndex = Math.max(0, Math.min(targetIndex, simulationSteps.length - 1))
    
    // 순서 보장: 이전 단계보다 작을 수 없음
    if (targets.length > 0) {
      targetIndex = Math.max(targetIndex, targets[targets.length - 1])
    }
    
    targets.push(targetIndex)
  })
  
  return targets
}

/**
 * 다음 함수 호출(push) 인덱스 찾기
 */
function findNextPushIndex(startIndex: number, simulationSteps: string[]): number {
  for (let i = startIndex; i < simulationSteps.length; i++) {
    if (!simulationSteps[i].includes('-return')) {
      return i
    }
  }
  return startIndex
}

/**
 * 다음 함수 반환(return) 인덱스 찾기
 */
function findNextReturnIndex(startIndex: number, simulationSteps: string[]): number {
  for (let i = startIndex; i < simulationSteps.length; i++) {
    if (simulationSteps[i].includes('-return')) {
      return i
    }
  }
  return startIndex
}

/**
 * console.log 인덱스 찾기 (여러 개가 있을 수 있으므로 순서 고려)
 */
function findConsoleLogIndex(startIndex: number, simulationSteps: string[], execIndex: number): number {
  let consoleLogCount = 0
  const targetCount = Math.floor(execIndex / 2) // 대략적인 console.log 순서 추정
  
  for (let i = 0; i < simulationSteps.length; i++) {
    if (simulationSteps[i] === 'console.log') {
      if (consoleLogCount === targetCount) {
        return i
      }
      consoleLogCount++
    }
  }
  
  // 찾지 못한 경우 기본값
  return startIndex
}

/**
 * 매핑 중단 조건 확인
 */
function shouldStopMapping(
  description: string,
  currentSimStep: string,
  simulationSteps: string[],
  simIndex: number
): boolean {
  const nextSimStep = simulationSteps[simIndex + 1]
  
  // 함수 호출 완료
  if (description.includes('호출') && 
      !currentSimStep.includes('-return') &&
      !nextSimStep?.includes('-return')) {
    return true
  }
  
  // console.log 실행 완료
  if (description.includes('console.log') && 
      currentSimStep.includes('console.log')) {
    return true
  }
  
  // 함수 반환 완료
  if ((description.includes('return') || description.includes('반환')) &&
      currentSimStep.includes('-return')) {
    return true
  }
  
  // 프로그램 시작/종료
  if (description.includes('시작') && currentSimStep === '<global>') {
    return true
  }
  
  if (description.includes('종료') && currentSimStep === '<global>-return') {
    return true
  }
  
  return false
}

/**
 * 스택에서 함수 제거 처리
 */
function handleReturn(stack: StackItem[], returnStep: string): void {
  const funcName = returnStep.replace('-return', '')
  
  // 스택에서 해당 함수 찾아서 제거 (뒤에서부터 검색)
  let lastIndex = -1
  for (let i = stack.length - 1; i >= 0; i--) {
    const item = stack[i]
    
    // 정확한 매칭
    if (item.functionName === funcName) {
      lastIndex = i
      break
    }
    
    // 매개변수가 있는 함수 처리 (예: factorial(3))
    if (funcName === 'factorial' && item.functionName.startsWith('factorial(')) {
      lastIndex = i
      break
    }
    
    // main과 <global> 매칭
    if (funcName === 'main' && item.functionName === '<global>') {
      lastIndex = i
      break
    }
  }
  
  if (lastIndex !== -1) {
    stack.splice(lastIndex, 1)
  }
}

/**
 * 스택 아이템 생성
 */
function createStackItem(
  functionName: string,
  index: number,
  customFactory?: (functionName: string, index: number) => Partial<StackItem>
): StackItem {
  const baseItem: StackItem = {
    id: `${functionName}-${index}`,
    functionName: functionName === 'main' ? '<global>' : functionName,
    height: 40,
    color: getFunctionColor(functionName),
    isGlobalContext: functionName === '<global>' || functionName === 'main'
  }
  
  if (customFactory) {
    const customProps = customFactory(functionName, index)
    return { ...baseItem, ...customProps }
  }
  
  return baseItem
}

/**
 * expectedSnapshots를 기반으로 스택 상태 보간
 * simulationSteps가 없는 레벨을 위한 폴백 메서드
 */
export function interpolateFromSnapshots(level: CallStackLevel): StackItem[][] {
  const history: StackItem[][] = []
  const snapshots = level.expectedSnapshots || {}
  const executionSteps = level.executionSteps || []
  
  executionSteps.forEach((step, index) => {
    if (snapshots[index]) {
      // 스냅샷이 있는 경우 그대로 사용
      history[index] = snapshots[index].map((item, idx) => ({
        ...item,
        id: item.id || `${item.functionName}-${index}-${idx}`,
        height: item.height || 40,
        color: item.color || getFunctionColor(item.functionName),
        isGlobalContext: item.isGlobalContext || item.functionName === '<global>'
      }))
    } else {
      // 스냅샷이 없는 경우 보간
      history[index] = interpolateStack(index, snapshots, step)
    }
  })
  
  return history
}

/**
 * 두 스냅샷 사이의 스택 상태 보간
 */
function interpolateStack(
  index: number,
  snapshots: Record<number, StackItem[]>,
  step: any
): StackItem[] {
  const prevIndex = findPreviousSnapshotIndex(index, snapshots)
  const nextIndex = findNextSnapshotIndex(index, snapshots)
  
  if (prevIndex !== null && snapshots[prevIndex]) {
    const prevStack = snapshots[prevIndex]
    
    // 함수 호출인 경우 이전 상태 유지
    if (step.description.includes('호출')) {
      return prevStack.map((item, idx) => ({
        ...item,
        id: `${item.functionName}-${index}-${idx}`
      }))
    }
    
    // 함수 종료인 경우 다음 상태로 전환
    if (step.description.includes('종료') || step.description.includes('반환')) {
      if (nextIndex !== null && snapshots[nextIndex]) {
        return snapshots[nextIndex].map((item, idx) => ({
          ...item,
          id: `${item.functionName}-${index}-${idx}`
        }))
      }
    }
    
    // 기본: 이전 상태 유지
    return prevStack.map((item, idx) => ({
      ...item,
      id: `${item.functionName}-${index}-${idx}`
    }))
  }
  
  // 스냅샷이 없는 경우 기본 전역 컨텍스트
  return [{
    id: `global-${index}-0`,
    functionName: '<global>',
    height: 40,
    color: FUNCTION_COLORS['<global>'],
    isGlobalContext: true
  }]
}

function findPreviousSnapshotIndex(index: number, snapshots: Record<number, StackItem[]>): number | null {
  for (let i = index - 1; i >= 0; i--) {
    if (snapshots[i]) return i
  }
  return null
}

function findNextSnapshotIndex(index: number, snapshots: Record<number, StackItem[]>): number | null {
  const indices = Object.keys(snapshots).map(Number).sort((a, b) => a - b)
  for (const i of indices) {
    if (i > index) return i
  }
  return null
}