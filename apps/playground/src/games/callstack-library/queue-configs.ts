import { QueueVisualConfig, QueueType } from './types'

/**
 * 큐 타입별 시각적 설정
 * 일관된 디자인 언어를 위한 통합 설정
 */
export const queueVisualConfigs: Record<QueueType, QueueVisualConfig> = {
  callstack: {
    type: 'callstack',
    name: '메인 서가',
    color: '#3b82f6', // 파란색 - 메인 실행 흐름
    maxSize: 100,
    fifo: false, // LIFO
    description: '현재 실행 중인 함수들의 책장',
    icon: '📚',
    animationDuration: 300
  },
  
  microtask: {
    type: 'microtask',
    name: '긴급 반납대',
    color: '#10b981', // 녹색 - 높은 우선순위
    maxSize: 50,
    fifo: true,
    description: 'Promise 등 우선 처리가 필요한 책들',
    icon: '⚡',
    animationDuration: 200
  },
  
  macrotask: {
    type: 'macrotask',
    name: '일반 반납대',
    color: '#f59e0b', // 노란색 - 일반 우선순위
    maxSize: 50,
    fifo: true,
    description: 'setTimeout 등 예약된 책들',
    icon: '⏰',
    animationDuration: 400
  },
  
  priority: {
    type: 'priority',
    name: '우선 열람실',
    color: '#ef4444', // 빨간색 - 우선순위 기반
    maxSize: 30,
    fifo: false, // 우선순위 기반 정렬
    description: '중요도에 따라 먼저 처리되는 책들',
    icon: '🎯',
    animationDuration: 350
  },
  
  circular: {
    type: 'circular',
    name: '회전 책장',
    color: '#8b5cf6', // 보라색 - 순환 구조
    maxSize: 20,
    fifo: true,
    description: '계속 순환하며 재사용되는 책장',
    icon: '🔄',
    animationDuration: 400
  },
  
  generator: {
    type: 'generator',
    name: '제너레이터 보관소',
    color: '#ec4899', // 분홍색 - 제너레이터
    maxSize: 25,
    fifo: true,
    description: '제너레이터 함수들을 위한 특별한 책장',
    icon: '🔄',
    animationDuration: 300
  },

  io: {
    type: 'io',
    name: 'I/O 처리대',
    color: '#8b5cf6', // 바이올렛 - I/O 처리
    maxSize: 30,
    fifo: true,
    description: '입출력 작업을 처리하는 전용 책장',
    icon: '💾',
    animationDuration: 350
  },

  worker: {
    type: 'worker',
    name: '워커 작업실',
    color: '#f59e0b', // 앰버 - 워커 처리
    maxSize: 20,
    fifo: true,
    description: '웹 워커 작업을 위한 별도 공간',
    icon: '⚙️',
    animationDuration: 400
  },
  
  animation: {
    type: 'animation',
    name: '전시 준비실',
    color: '#06b6d4', // 시안색 - 애니메이션 관련
    maxSize: 60,
    fifo: true,
    description: '화면 갱신을 위해 대기 중인 책들',
    icon: '🎬',
    animationDuration: 250
  },
  
}

/**
 * 큐 타입별 우선순위 정의
 * 낮은 숫자일수록 높은 우선순위
 */
export const queuePriorities: Record<QueueType, number> = {
  callstack: 0,    // 최고 우선순위 - 즉시 실행
  microtask: 1,    // 높은 우선순위
  animation: 2,    // 애니메이션 프레임
  macrotask: 3,    // 일반 타이머
  priority: 4,     // 사용자 정의 우선순위 큐
  generator: 5,    // 제너레이터 큐
  circular: 6,     // 원형 큐  
  io: 7,           // I/O 처리 큐
  worker: 8        // 웹 워커 큐
}

/**
 * 큐 실행 순서를 결정하는 함수
 */
export function getExecutionOrder(queueTypes: QueueType[]): QueueType[] {
  return queueTypes.sort((a, b) => queuePriorities[a] - queuePriorities[b])
}

/**
 * 큐 타입에 따른 색상 팔레트 생성
 */
export function getQueueColorPalette(queueType: QueueType): {
  primary: string
  secondary: string
  light: string
  dark: string
} {
  const baseColor = queueVisualConfigs[queueType].color
  
  // 색상 변형 생성 (실제 구현에서는 color manipulation 라이브러리 사용 권장)
  return {
    primary: baseColor,
    secondary: baseColor + '80', // 50% 투명도
    light: baseColor + '20',     // 12.5% 투명도
    dark: baseColor.replace('#', '#') // 실제로는 더 어두운 색상으로 변환
  }
}

/**
 * 큐 애니메이션 설정
 */
export const queueAnimationVariants = {
  enter: {
    initial: { x: -100, opacity: 0, scale: 0.8 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: 100, opacity: 0, scale: 0.8 }
  },
  
  priority: {
    initial: { y: -50, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 50, opacity: 0, scale: 0.9 }
  },
  
  circular: {
    initial: { rotate: -90, opacity: 0, scale: 0.7 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    exit: { rotate: 90, opacity: 0, scale: 0.7 }
  },
  
  generator: {
    initial: { x: 0, y: -30, opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { x: 0, y: 30, opacity: 0 }
  },

  io: {
    initial: { x: -20, y: 0, opacity: 0 },
    animate: { x: 0, y: 0, opacity: 1 },
    exit: { x: 20, y: 0, opacity: 0 }
  },

  worker: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  }
}