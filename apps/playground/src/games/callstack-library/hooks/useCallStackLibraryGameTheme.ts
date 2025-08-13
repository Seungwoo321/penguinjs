/**
 * 콜스택 도서관 전용 게임 테마 훅 (CSS 변수 기반 - 간소화됨)
 * 타입 안전성과 호환성을 위한 최소한의 API 제공
 */

import { useThemeMode } from '@/games/shared/hooks/useGameTheme'

// 콜스택 도서관 전용 테마 훅 (간소화된 버전)
export const useCallStackLibraryGameTheme = (forceDarkMode?: boolean) => {
  const isDarkMode = useThemeMode(forceDarkMode)

  // 호환성을 위한 간소화된 API 제공
  return {
    // 다크모드 상태
    isDarkMode,
    
    // 기존 API 호환성을 위한 최소한의 theme 객체
    theme: {
      isDarkMode,
      borderRadius: {
        panel: '8px',
        button: '6px',
        card: '12px',
        small: '4px'
      }
    }
    
    // 레거시 호환성을 위한 deprecated 메서드들 (콘솔 경고와 함께)
    // 실제 사용 시 CSS 변수를 직접 사용하는 것을 권장합니다
  }
}

// CSS 클래스명 생성 헬퍼
export const callstackLibraryClasses = {
  container: 'callstack-library-container',
  queue: 'callstack-library-queue',
  book: 'callstack-library-book',
  shelf: 'callstack-library-shelf',
  librarian: 'callstack-library-librarian',
  animation: 'callstack-library-animation',
  layout: 'callstack-library-layout',
  memory: 'callstack-library-memory',
  code: 'callstack-library-code'
}

// 스타일 상수
export const callstackLibraryConstants = {
  queueSizes: {
    mobile: { width: 280, height: 200 },
    tablet: { width: 400, height: 280 },
    desktop: { width: 500, height: 350 }
  },
  bookSizes: {
    mobile: { width: 40, height: 60 },
    tablet: { width: 50, height: 75 },
    desktop: { width: 60, height: 90 }
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
      queue: 600
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    keyframes: {
      highlight: `
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      `,
      bookMove: `
        0% { transform: translateX(0) translateY(0); }
        50% { transform: translateX(10px) translateY(-5px); }
        100% { transform: translateX(0) translateY(0); }
      `
    }
  }
}