// 책 크기 설정을 중앙에서 관리
export const BOOK_CONFIG = {
  // 두께 설정
  thickness: {
    min: 4,      // 최소 두께
    range: 4,    // 랜덤 범위 (최대 = min + range)
  },
  
  // 너비 설정
  width: {
    base: 140,   // 기본 너비
    range: 40,   // 랜덤 범위
    // 두께에 비례하여 추가되는 너비는 getBookDimensions에서 계산
  },
  
  // 높이 설정
  height: {
    base: 40,    // 기본 높이
    range: 15,   // 랜덤 범위
  },
  
  // 회전 각도 설정
  rotation: {
    max: 4,      // 최대 회전 각도 (양수/음수 모두 적용)
  },
  
  // 애니메이션 설정
  animation: {
    initialRotation: 20,  // 초기 떨어질 때 회전 각도
    exitX: 200,          // 나갈 때 X 이동 거리
    exitRotation: 20,    // 나갈 때 회전 각도
  },
  
  // 그림자 설정
  shadow: {
    baseOffsetY: 10,     // 기본 Y 오프셋
    baseBlur: 20,        // 기본 블러
    indexMultiplier: 2,  // 인덱스별 증가량
  },
} as const

// 책 크기를 계산하는 함수
export const getBookDimensions = (functionName: string) => {
  const seed = functionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const thickness = BOOK_CONFIG.thickness.min + (seed % BOOK_CONFIG.thickness.range)
  
  return {
    width: BOOK_CONFIG.width.base + (seed % BOOK_CONFIG.width.range) + thickness * 2,
    height: BOOK_CONFIG.height.base + (seed % BOOK_CONFIG.height.range),
    thickness: thickness,
    rotation: (seed % (BOOK_CONFIG.rotation.max * 2)) - BOOK_CONFIG.rotation.max
  }
}