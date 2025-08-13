/**
 * 개선된 콜스택 도서관 색상 시스템
 * WCAG AA 기준(4.5:1 대비비) 충족 + 도서관 컨셉 유지
 */

import { callstackLibraryThemeConfig } from './callstackLibraryGameTheme'

// 색상 대비비 계산 함수
function getContrastRatio(rgb1: string, rgb2: string): number {
  const getLuminance = (rgb: string) => {
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number)
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(rgb1)
  const l2 = getLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// 테마 시스템을 사용한 색상 팔레트
export const IMPROVED_COLORS = {
  // 📚 콜스택 (메인 서가) - 따뜻한 목재 색상
  callstack: {
    light: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['function-global']})`,       // 테마에서 가져온 갈색
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['function-main']})`,    // 메인 함수 색상
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['library-wood']})`,      // 도서관 목재색
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,   // 도서관 종이색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-light']})`,    // 선반 밝은색
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-dark']})`     // 선반 어두운색
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['function-global']})`,     // 갈색 텍스트
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['function-main']})`,  // 메인 함수 텍스트
        contrast: 'rgb(255, 255, 255)'  // 흰색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['library-wood']})`,      // 목재 테두리
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-light']})`,    // 연한 테두리
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`      // 포커스 테두리
      }
    },
    dark: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,    // 밝은 종이색
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-light']})`,  // 연한 선반색
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['library-wood']})`,     // 목재색
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,       // 그림자색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`,        // 잉크색
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`         // 그림자색
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,   // 종이색 텍스트
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-light']})`, // 연한 선반색 텍스트
        contrast: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`      // 잉크색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-dark']})`,       // 어두운 선반색
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,      // 그림자색
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`     // 포커스색
      }
    }
  },
  
  // 🚀 마이크로태스크 (긴급 처리대) - 신뢰감 있는 파란색
  microtask: {
    light: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,      // 테마 마이크로태스크 색상
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-intermediate']})`,   // 중급 단계 색상
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,      // 밝은 마이크로태스크 색상
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,    // 종이색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,     // 연한 마이크로태스크 색상
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['stage-intermediate']})`      // 중급 단계 색상
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,     // 마이크로태스크 색상
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-intermediate']})`,  // 중급 단계 색상
        contrast: 'rgb(255, 255, 255)'   // 흰색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,      // 마이크로태스크 테두리
        light: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,    // 연한 테두리
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`       // 포커스 테두리
      }
    },
    dark: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,    // 밝은 마이크로태스크 색상
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-intermediate']})`,  // 중급 단계 색상
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,      // 마이크로태스크 색상
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,       // 그림자색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`,        // 잉크색
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`          // 그림자색
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,   // 밝은 마이크로태스크 색상
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-intermediate']})`, // 중급 단계 색상
        contrast: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`       // 잉크색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,      // 마이크로태스크 색상
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,      // 그림자색
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`     // 포커스색
      }
    }
  },
  
  // 📅 매크로태스크 (예약 처리대) - 활력있는 녹색
  macrotask: {
    light: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask']})`,       // 테마 매크로태스크 색상
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-beginner']})`,    // 초급 단계 색상
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask-light']})`,      // 밝은 매크로태스크 색상
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,    // 종이색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask-light']})`,     // 연한 매크로태스크 색상
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['stage-beginner']})`      // 초급 단계 색상
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask']})`,      // 매크로태스크 색상
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-beginner']})`,   // 초급 단계 색상
        contrast: 'rgb(255, 255, 255)'   // 흰색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask']})`,      // 매크로태스크 테두리
        light: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask-light']})`,    // 연한 테두리
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`        // 포커스 테두리
      }
    },
    dark: {
      primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask-light']})`,    // 밝은 매크로태스크 색상
      secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-beginner']})`,   // 초급 단계 색상
      accent: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask']})`,      // 매크로태스크 색상
      background: {
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,       // 그림자색
        main: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`,         // 잉크색
        dark: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`          // 그림자색
      },
      text: {
        primary: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask-light']})`,   // 밝은 매크로태스크 색상
        secondary: `rgb(${callstackLibraryThemeConfig.specialColors['stage-beginner']})`, // 초급 단계 색상
        contrast: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`       // 잉크색
      },
      border: {
        main: `rgb(${callstackLibraryThemeConfig.specialColors['queue-macrotask']})`,       // 매크로태스크 색상
        light: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,       // 그림자색
        focus: `rgb(${callstackLibraryThemeConfig.specialColors['focus-ring']})`     // 포커스색
      }
    }
  },
  
  // 공통 요소 색상
  common: {
    light: {
      background: 'rgb(255, 255, 255)',
      surface: `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`,
      error: `rgb(${callstackLibraryThemeConfig.colorScheme.error})`,
      success: `rgb(${callstackLibraryThemeConfig.colorScheme.success})`,
      warning: `rgb(${callstackLibraryThemeConfig.colorScheme.warning})`,
      info: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask']})`,
    },
    dark: {
      background: `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`,
      surface: `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`,
      error: `rgb(${callstackLibraryThemeConfig.specialColors['error-border']})`,
      success: `rgb(${callstackLibraryThemeConfig.specialColors['success-border']})`,
      warning: `rgb(${callstackLibraryThemeConfig.specialColors['function-quaternary']})`,
      info: `rgb(${callstackLibraryThemeConfig.specialColors['queue-microtask-light']})`,
    }
  }
}

// 테마별 그라디언트 생성 함수
export function createGradient(
  color1: string, 
  color2: string, 
  direction: string = 'to bottom'
): string {
  return `linear-gradient(${direction}, ${color1}, ${color2})`
}

// 도서관 배경 그라디언트 (테마 시스템 사용)
export const LIBRARY_BACKGROUNDS = {
  light: createGradient(
    `rgb(${callstackLibraryThemeConfig.specialColors['library-paper']})`, // 종이색
    `rgb(${callstackLibraryThemeConfig.specialColors['shelf-wood-light']})`  // 연한 선반색
  ),
  dark: createGradient(
    `rgb(${callstackLibraryThemeConfig.specialColors['library-ink']})`,    // 잉크색
    `rgb(${callstackLibraryThemeConfig.specialColors['shelf-shadow']})`     // 그림자색
  )
}

// 텍스처 효과 (CSS로 구현)
export const TEXTURES = {
  wood: `repeating-linear-gradient(
    90deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  )`,
  leather: `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
  paper: `repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.01) 10px,
    rgba(0, 0, 0, 0.01) 20px
  )`
}

// 색상 유효성 검증 함수
export function validateColorContrast(
  foreground: string, 
  background: string, 
  minRatio: number = 4.5
): boolean {
  const ratio = getContrastRatio(foreground, background)
  return ratio >= minRatio
}

// 자동 텍스트 색상 선택 함수 (테마 시스템 사용)
export function getAutoTextColor(backgroundColor: string, isDark: boolean): string {
  const colors = isDark ? IMPROVED_COLORS.callstack.dark : IMPROVED_COLORS.callstack.light
  
  // 배경색에 따라 최적의 텍스트 색상 선택
  const primaryRatio = getContrastRatio(colors.text.primary, backgroundColor)
  const contrastRatio = getContrastRatio(colors.text.contrast, backgroundColor)
  
  return primaryRatio >= 4.5 ? colors.text.primary : colors.text.contrast
}

// 테마 시스템에서 색상 가져오기 헬퍼 함수
export function getThemeColor(colorKey: string): string {
  return `rgb(${callstackLibraryThemeConfig.specialColors[colorKey] || callstackLibraryThemeConfig.colorScheme.primary})`
}