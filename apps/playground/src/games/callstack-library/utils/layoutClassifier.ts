import { GameDifficulty } from '../../shared/types'

// 정확한 레이아웃 타입 정의 (A, A+, B, C, D, E)
export type LayoutType = 'A' | 'A+' | 'B' | 'C' | 'D' | 'E'

// 게임플레이 방식
export type PlayMode = 'order-prediction' | 'start-end-tracking' | 'snapshot-building' | 'queue-states' | 'timeline-snapshot'

// 확장된 레이아웃 설정
export interface LayoutConfig {
  type: LayoutType
  name: string
  description: string
  stages: number[]
  difficulty: GameDifficulty[]
  
  // UI 구성
  gridTemplate: string
  components: {
    codeEditor: boolean
    callstack: boolean
    functionSelector: boolean
    queueVisualizer?: string[]
    snapshotBuilder?: boolean
  }
  
  // 게임플레이
  playMode: PlayMode
  
  // 평가 방식
  evaluation: {
    checkOrder: boolean
    checkLifoPrinciple: boolean
    checkSnapshots: boolean
    checkQueueStates: boolean
  }
}

// 5개 레이아웃 타입별 설정
export const LAYOUT_CONFIGS: Record<LayoutType, LayoutConfig> = {
  'A': {
    type: 'A',
    name: '기본 콜스택',
    description: '함수 호출 순서 학습',
    stages: [1, 2, 3, 4, 5, 6, 7, 8],
    difficulty: ['beginner'],
    gridTemplate: 'grid-cols-[1fr_2fr_1fr]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: true
    },
    playMode: 'order-prediction',
    evaluation: {
      checkOrder: true,
      checkLifoPrinciple: false,
      checkSnapshots: false,
      checkQueueStates: false
    }
  },

  'A+': {
    type: 'A+',
    name: '시작/종료 추적',
    description: 'LIFO 원칙 체득',
    stages: [9, 10, 11, 12, 13, 14, 15, 16],
    difficulty: ['intermediate'],
    gridTemplate: 'grid-cols-[300px_1fr_350px]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: true
    },
    playMode: 'start-end-tracking',
    evaluation: {
      checkOrder: true,
      checkLifoPrinciple: true,
      checkSnapshots: false,
      checkQueueStates: false
    }
  },

  'B': {
    type: 'B',
    name: '이벤트 루프',
    description: '비동기 + 스택 상태',
    stages: [21, 22],
    difficulty: ['advanced'],
    gridTemplate: 'grid-cols-[350px_1fr_350px]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: true,
      queueVisualizer: ['callstack', 'microtask', 'macrotask'],
      snapshotBuilder: true
    },
    playMode: 'queue-states',
    evaluation: {
      checkOrder: false,
      checkLifoPrinciple: true,
      checkSnapshots: true,
      checkQueueStates: true
    }
  },

  'C': {
    type: 'C',
    name: '다중 큐 시스템',
    description: '복잡한 비동기 패턴',
    stages: [23],
    difficulty: ['advanced'],
    gridTemplate: 'grid-cols-[300px_1fr_300px]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: true,
      queueVisualizer: ['callstack', 'microtask', 'macrotask', 'animation', 'generator'],
      snapshotBuilder: true
    },
    playMode: 'queue-states',
    evaluation: {
      checkOrder: false,
      checkLifoPrinciple: true,
      checkSnapshots: true,
      checkQueueStates: true
    }
  },

  'D': {
    type: 'D',
    name: '최종 통합',
    description: '모든 개념 통합',
    stages: [24],
    difficulty: ['advanced'],
    gridTemplate: 'grid-cols-[350px_1fr_350px]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: true,
      queueVisualizer: ['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker'],
      snapshotBuilder: true
    },
    playMode: 'queue-states',
    evaluation: {
      checkOrder: false,
      checkLifoPrinciple: true,
      checkSnapshots: true,
      checkQueueStates: true
    }
  },

  'E': {
    type: 'E',
    name: '스택 스냅샷',
    description: '실행 단계별 스택 상태 예측',
    stages: [17, 18, 19, 20],
    difficulty: ['advanced'],
    gridTemplate: 'grid-cols-[300px_1fr_400px]',
    components: {
      codeEditor: true,
      callstack: true,
      functionSelector: false,
      snapshotBuilder: true
    },
    playMode: 'timeline-snapshot',
    evaluation: {
      checkOrder: false,
      checkLifoPrinciple: false,
      checkSnapshots: true,
      checkQueueStates: false
    }
  }
}

// 정확한 스테이지별 레이아웃 타입 매핑
export function getLayoutType(difficulty: GameDifficulty, stage: number): LayoutType {
  // 초급 1-8: 타입 A
  if (difficulty === 'beginner' && stage >= 1 && stage <= 8) {
    return 'A'
  }
  
  // 중급 9-16: 타입 A+  
  if (difficulty === 'intermediate' && stage >= 9 && stage <= 16) {
    return 'A+'
  }
  
  // 고급 17-20: 타입 E
  if (difficulty === 'advanced' && stage >= 17 && stage <= 20) {
    return 'E'
  }
  
  // 고급 21-22: 타입 B
  if (difficulty === 'advanced' && (stage === 21 || stage === 22)) {
    return 'B'
  }
  
  // 고급 23: 타입 C
  if (difficulty === 'advanced' && stage === 23) {
    return 'C'
  }
  
  // 고급 24: 타입 D
  if (difficulty === 'advanced' && stage === 24) {
    return 'D'
  }
  
  // 기본값
  return 'A'
}

// 레이아웃 설정 가져오기
export function getLayoutConfig(type: LayoutType): LayoutConfig {
  return LAYOUT_CONFIGS[type]
}

// 레이아웃 타입별 필요한 큐 목록 반환 (하위 호환)
export function getRequiredQueues(layoutType: LayoutType): string[] {
  const config = LAYOUT_CONFIGS[layoutType]
  return config.components.queueVisualizer || ['callstack']
}

// 스테이지에서 사용해야 할 큐 목록 반환
export function getStageQueues(difficulty: GameDifficulty, stage: number): string[] {
  const layoutType = getLayoutType(difficulty, stage)
  return getRequiredQueues(layoutType)
}

// 레이아웃 타입의 특징 설명 반환
export function getLayoutDescription(layoutType: LayoutType): string {
  return LAYOUT_CONFIGS[layoutType].description
}

// 모든 레이아웃 타입 정보 반환 (디버그/관리용)
export function getAllLayoutInfo() {
  return Object.values(LAYOUT_CONFIGS)
}

// 특정 난이도의 모든 스테이지 레이아웃 타입 반환
export function getDifficultyLayoutTypes(difficulty: GameDifficulty): LayoutType[] {
  const layouts: LayoutType[] = []
  
  if (difficulty === 'beginner') {
    // 초급 1-8: 모두 타입 A
    for (let i = 1; i <= 8; i++) {
      layouts.push('A')
    }
  } else if (difficulty === 'intermediate') {
    // 중급 9-16: 모두 타입 A+
    for (let i = 9; i <= 16; i++) {
      layouts.push('A+')
    }
  } else if (difficulty === 'advanced') {
    // 고급 17-24: 다양한 타입
    for (let i = 17; i <= 24; i++) {
      layouts.push(getLayoutType(difficulty, i))
    }
  }
  
  return layouts
}