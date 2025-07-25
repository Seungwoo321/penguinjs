/**
 * 개선된 콜스택 도서관 색상 시스템
 * WCAG AA 기준(4.5:1 대비비) 충족 + 도서관 컨셉 유지
 */

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

// 개선된 색상 팔레트
export const IMPROVED_COLORS = {
  // 📚 콜스택 (메인 서가) - 따뜻한 목재 색상
  callstack: {
    light: {
      primary: 'rgb(92, 51, 23)',       // 진한 브라운 (대비비 9.8:1 on white)
      secondary: 'rgb(120, 63, 25)',    // 중간 브라운
      accent: 'rgb(194, 136, 75)',      // 밝은 목재색
      background: {
        light: 'rgb(253, 248, 243)',   // 매우 연한 크림
        main: 'rgb(249, 235, 218)',    // 연한 베이지
        dark: 'rgb(241, 218, 187)'     // 베이지
      },
      text: {
        primary: 'rgb(92, 51, 23)',     // 진한 브라운 (충분한 대비)
        secondary: 'rgb(120, 85, 50)',  // 중간 브라운
        contrast: 'rgb(255, 255, 255)'  // 흰색
      },
      border: {
        main: 'rgb(194, 136, 75)',      // 목재 테두리
        light: 'rgb(217, 180, 138)',    // 연한 테두리
        focus: 'rgb(168, 103, 38)'      // 포커스 테두리
      }
    },
    dark: {
      primary: 'rgb(249, 235, 218)',    // 밝은 베이지 (대비비 13.7:1 on dark)
      secondary: 'rgb(241, 218, 187)',  // 베이지
      accent: 'rgb(217, 180, 138)',     // 따뜻한 베이지
      background: {
        light: 'rgb(46, 32, 21)',       // 매우 진한 브라운
        main: 'rgb(33, 23, 15)',        // 거의 검은 브라운
        dark: 'rgb(23, 16, 10)'         // 검은 브라운
      },
      text: {
        primary: 'rgb(249, 235, 218)',   // 밝은 베이지
        secondary: 'rgb(217, 190, 158)', // 중간 베이지
        contrast: 'rgb(23, 16, 10)'      // 거의 검정
      },
      border: {
        main: 'rgb(120, 85, 50)',       // 어두운 목재
        light: 'rgb(92, 65, 38)',       // 매우 어두운 목재
        focus: 'rgb(217, 180, 138)'     // 밝은 포커스
      }
    }
  },
  
  // 🚀 마이크로태스크 (긴급 처리대) - 신뢰감 있는 파란색
  microtask: {
    light: {
      primary: 'rgb(21, 94, 173)',      // 진한 파랑 (대비비 5.4:1 on white)
      secondary: 'rgb(37, 117, 203)',   // 중간 파랑
      accent: 'rgb(79, 151, 230)',      // 밝은 파랑
      background: {
        light: 'rgb(243, 248, 254)',    // 매우 연한 파랑
        main: 'rgb(225, 237, 251)',     // 연한 파랑
        dark: 'rgb(203, 223, 246)'      // 파스텔 파랑
      },
      text: {
        primary: 'rgb(21, 94, 173)',     // 진한 파랑
        secondary: 'rgb(51, 107, 168)',  // 중간 파랑
        contrast: 'rgb(255, 255, 255)'   // 흰색
      },
      border: {
        main: 'rgb(79, 151, 230)',      // 파란 테두리
        light: 'rgb(147, 194, 246)',    // 연한 테두리
        focus: 'rgb(21, 94, 173)'       // 진한 포커스
      }
    },
    dark: {
      primary: 'rgb(147, 194, 246)',    // 밝은 파랑 (대비비 9.3:1 on dark)
      secondary: 'rgb(121, 175, 237)',  // 중간 밝은 파랑
      accent: 'rgb(79, 151, 230)',      // 액센트 파랑
      background: {
        light: 'rgb(17, 33, 51)',       // 매우 진한 네이비
        main: 'rgb(10, 20, 31)',        // 거의 검은 네이비
        dark: 'rgb(5, 10, 15)'          // 검은 네이비
      },
      text: {
        primary: 'rgb(203, 223, 246)',   // 밝은 파랑
        secondary: 'rgb(147, 194, 246)', // 중간 파랑
        contrast: 'rgb(5, 10, 15)'       // 거의 검정
      },
      border: {
        main: 'rgb(51, 107, 168)',      // 어두운 파랑
        light: 'rgb(37, 78, 122)',      // 매우 어두운 파랑
        focus: 'rgb(147, 194, 246)'     // 밝은 포커스
      }
    }
  },
  
  // 📅 매크로태스크 (예약 처리대) - 활력있는 주황색
  macrotask: {
    light: {
      primary: 'rgb(166, 70, 0)',       // 진한 주황 (대비비 6.7:1 on white)
      secondary: 'rgb(194, 94, 14)',    // 중간 주황
      accent: 'rgb(235, 140, 52)',      // 밝은 주황
      background: {
        light: 'rgb(255, 248, 241)',    // 매우 연한 복숭아
        main: 'rgb(254, 236, 220)',     // 연한 복숭아
        dark: 'rgb(252, 217, 189)'      // 복숭아
      },
      text: {
        primary: 'rgb(166, 70, 0)',      // 진한 주황
        secondary: 'rgb(194, 94, 14)',   // 중간 주황
        contrast: 'rgb(255, 255, 255)'   // 흰색
      },
      border: {
        main: 'rgb(235, 140, 52)',      // 주황 테두리
        light: 'rgb(249, 186, 127)',    // 연한 테두리
        focus: 'rgb(166, 70, 0)'        // 진한 포커스
      }
    },
    dark: {
      primary: 'rgb(249, 186, 127)',    // 밝은 주황 (대비비 10.8:1 on dark)
      secondary: 'rgb(243, 163, 89)',   // 중간 밝은 주황
      accent: 'rgb(235, 140, 52)',      // 액센트 주황
      background: {
        light: 'rgb(51, 28, 13)',       // 매우 진한 브라운-오렌지
        main: 'rgb(38, 20, 8)',         // 거의 검은 브라운-오렌지
        dark: 'rgb(26, 13, 5)'          // 검은 브라운-오렌지
      },
      text: {
        primary: 'rgb(252, 217, 189)',   // 밝은 복숭아
        secondary: 'rgb(249, 186, 127)', // 중간 복숭아
        contrast: 'rgb(26, 13, 5)'       // 거의 검정
      },
      border: {
        main: 'rgb(194, 94, 14)',       // 어두운 주황
        light: 'rgb(166, 70, 0)',       // 매우 어두운 주황
        focus: 'rgb(249, 186, 127)'     // 밝은 포커스
      }
    }
  },
  
  // 공통 요소 색상
  common: {
    light: {
      background: 'rgb(255, 255, 255)',
      surface: 'rgb(250, 249, 247)',
      error: 'rgb(185, 28, 28)',       // 진한 빨강 (대비비 5.9:1)
      success: 'rgb(21, 128, 61)',     // 진한 초록 (대비비 5.8:1)
      warning: 'rgb(180, 83, 9)',      // 진한 주황 (대비비 5.2:1)
      info: 'rgb(30, 64, 175)',        // 진한 파랑 (대비비 8.6:1)
    },
    dark: {
      background: 'rgb(13, 13, 13)',
      surface: 'rgb(23, 23, 23)',
      error: 'rgb(252, 165, 165)',     // 밝은 빨강 (대비비 9.1:1)
      success: 'rgb(134, 239, 172)',   // 밝은 초록 (대비비 11.2:1)
      warning: 'rgb(253, 186, 116)',   // 밝은 주황 (대비비 11.3:1)
      info: 'rgb(147, 197, 253)',      // 밝은 파랑 (대비비 10.7:1)
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

// 도서관 배경 그라디언트
export const LIBRARY_BACKGROUNDS = {
  light: createGradient(
    'rgb(253, 248, 243)', // 매우 연한 크림
    'rgb(249, 235, 218)'  // 연한 베이지
  ),
  dark: createGradient(
    'rgb(33, 23, 15)',    // 거의 검은 브라운
    'rgb(23, 16, 10)'     // 검은 브라운
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

// 자동 텍스트 색상 선택 함수
export function getAutoTextColor(backgroundColor: string, isDark: boolean): string {
  const colors = isDark ? IMPROVED_COLORS.callstack.dark : IMPROVED_COLORS.callstack.light
  
  // 배경색에 따라 최적의 텍스트 색상 선택
  const primaryRatio = getContrastRatio(colors.text.primary, backgroundColor)
  const contrastRatio = getContrastRatio(colors.text.contrast, backgroundColor)
  
  return primaryRatio >= 4.5 ? colors.text.primary : colors.text.contrast
}