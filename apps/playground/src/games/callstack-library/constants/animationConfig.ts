// 애니메이션 속도 설정을 중앙에서 관리
export const ANIMATION_CONFIG = {
  // 시뮬레이션 지연 시간 (ms)
  delays: {
    initial: 300,        // 시작 대기 시간
    stackPush: 800,      // 스택에 책이 추가될 때
    stackPop: 1000,      // 스택에서 책이 제거될 때
    queueMove: 500,      // 큐에서 이동할 때
    processStart: 1000,  // 처리 시작 시
  },
  
  // 속도별 배수 설정
  speedMultipliers: {
    fast: 0.7,     // 빠름 (30% 빠르게)
    normal: 1,     // 보통
    slow: 1.5,     // 느림 (50% 느리게)
  },
  
  // 책 떨어지는 애니메이션 설정
  bookAnimation: {
    fast: {
      stiffness: 120,    // 스프링 강도 (높을수록 빠름)
      damping: 18,       // 감쇠 (높을수록 빨리 멈춤)
      delay: 0.1,        // 책들 사이 지연
    },
    normal: {
      stiffness: 100,
      damping: 15,
      delay: 0.15,
    },
    slow: {
      stiffness: 60,
      damping: 20,
      delay: 0.25,
    },
  },
  
  // 큐 애니메이션 지속 시간 배수
  queueAnimation: {
    fast: 1.33,     // delay * 1.33
    normal: 1.33,
    slow: 1.33,
  },
} as const

export type AnimationSpeed = 'fast' | 'normal' | 'slow'

// 지연 시간 계산 함수
export const getDelay = (baseDelay: keyof typeof ANIMATION_CONFIG.delays | number, speed: AnimationSpeed) => {
  const delay = typeof baseDelay === 'number' ? baseDelay : ANIMATION_CONFIG.delays[baseDelay]
  return delay * ANIMATION_CONFIG.speedMultipliers[speed]
}

// 책 애니메이션 설정 가져오기
export const getBookAnimationConfig = (speed: AnimationSpeed) => {
  return ANIMATION_CONFIG.bookAnimation[speed]
}