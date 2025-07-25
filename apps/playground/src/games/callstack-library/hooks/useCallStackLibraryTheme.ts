/**
 * 콜스택 도서관 게임 전용 테마 훅
 * 다른 게임들은 각자의 테마 훅을 가질 예정
 */

import { useMemo, useCallback, useState, useEffect } from 'react'
import { 
  CALLSTACK_LIBRARY_THEME,
  type CallStackQueueType,
  type CallStackQueueTheme,
  getCallStackQueueTheme,
  getCallStackQueueColor,
  getCallStackQueueBorder,
  getCallStackQueueText,
  createLibraryBookStyles,
  createLibraryShelfStyles,
  getLibraryResponsiveValue,
  getLibraryBreakpoint
} from '../theme/callstackLibraryTheme'
import { useThemeAccessibleColors } from './useAccessibleColors'

interface UseCallStackLibraryThemeOptions {
  enableResponsive?: boolean
  enableAnimations?: boolean
  defaultQueueType?: CallStackQueueType
  forceDarkMode?: boolean // 강제 다크 모드
  enforceAccessibility?: boolean // 접근성 강제 적용
  debugColors?: boolean // 색상 디버그 모드
}

interface CallStackLibraryThemeContext {
  // Theme data
  theme: typeof CALLSTACK_LIBRARY_THEME
  
  // Theme mode
  isDarkMode: boolean
  
  // Current responsive state
  breakpoint: 'sm' | 'md' | 'lg' | 'xl'
  screenWidth: number
  
  // Theme getters
  getQueueTheme: (queueType: CallStackQueueType) => CallStackQueueTheme
  getQueueColor: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['gradients']) => string
  getQueueBorder: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['border']) => string
  getQueueText: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['text']) => string
  
  // Style creators
  createBookStyles: (queueType: CallStackQueueType, isOpen?: boolean) => Record<string, React.CSSProperties>
  createShelfStyles: (queueType: CallStackQueueType) => Record<string, React.CSSProperties>
  
  // Responsive utilities
  getResponsiveBookSize: () => string
  getResponsiveShelfGap: () => string
  getResponsivePadding: () => string
  
  // Animation utilities
  getBookDropAnimation: () => object
  getShelfSlideAnimation: () => object
  
  // Icon helpers
  getQueueIcon: (queueType: CallStackQueueType) => string
  
  // Background getter
  getLibraryBackground: () => string
  
  // Accessibility features
  isAccessible: (foreground: string, background: string) => boolean
  getAccessibleTextColor: (backgroundColor: string) => string
  adjustColorForAccessibility: (color: string, backgroundColor: string) => string
  colorDebugInfo: Record<string, any>
}

/**
 * 콜스택 도서관 게임 전용 테마 훅
 */
export const useCallStackLibraryTheme = (
  options: UseCallStackLibraryThemeOptions = {}
): CallStackLibraryThemeContext => {
  const {
    enableResponsive = true,
    enableAnimations = true,
    defaultQueueType = 'callstack',
    forceDarkMode,
    enforceAccessibility = true,
    debugColors = false
  } = options

  // 다크 모드 감지 - 항상 실행되도록 보장
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (forceDarkMode !== undefined) return forceDarkMode
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  // 접근성 색상 시스템 - 항상 실행되도록 보장
  const accessibleColors = useThemeAccessibleColors('library', isDarkMode)

  useEffect(() => {
    if (forceDarkMode !== undefined) {
      setIsDarkMode(forceDarkMode)
      return
    }
    
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [forceDarkMode])

  // 반응형 상태 관리
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    if (!enableResponsive || typeof window === 'undefined') return

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [enableResponsive])

  // 현재 브레이크포인트 계산
  const breakpoint = useMemo(() => {
    return getLibraryBreakpoint(screenWidth)
  }, [screenWidth])

  // 다크/라이트 모드별 색상 조정 함수 (개선된 대비비 로직)
  const adjustColorForMode = useCallback((color: string, isBackground = false): string => {
    // 라이트 모드에서는 기본 색상 사용
    if (!isDarkMode) {
      return color
    }
    
    // 다크 모드에서는 사전 정의된 다크 모드 색상 사용
    // callstack (갈색 계열)
    if (color === 'rgb(92, 51, 23)' || color === 'rgb(120, 63, 25)') {
      return isBackground ? 'rgb(46, 32, 21)' : 'rgb(249, 235, 218)'
    }
    if (color === 'rgb(194, 136, 75)') {
      return isBackground ? 'rgb(92, 65, 38)' : 'rgb(217, 180, 138)'
    }
    if (color === 'rgb(253, 248, 243)' || color === 'rgb(249, 235, 218)') {
      return isBackground ? 'rgb(33, 23, 15)' : 'rgb(249, 235, 218)'
    }
    if (color === 'rgb(241, 218, 187)') {
      return isBackground ? 'rgb(23, 16, 10)' : 'rgb(217, 190, 158)'
    }
    
    // microtask (파란색 계열)
    if (color === 'rgb(21, 94, 173)' || color === 'rgb(37, 117, 203)') {
      return isBackground ? 'rgb(17, 33, 51)' : 'rgb(147, 194, 246)'
    }
    if (color === 'rgb(79, 151, 230)') {
      return isBackground ? 'rgb(37, 78, 122)' : 'rgb(147, 194, 246)'
    }
    if (color === 'rgb(243, 248, 254)' || color === 'rgb(225, 237, 251)') {
      return isBackground ? 'rgb(10, 20, 31)' : 'rgb(203, 223, 246)'
    }
    if (color === 'rgb(203, 223, 246)') {
      return isBackground ? 'rgb(5, 10, 15)' : 'rgb(147, 194, 246)'
    }
    
    // macrotask (주황색 계열)
    if (color === 'rgb(166, 70, 0)' || color === 'rgb(194, 94, 14)') {
      return isBackground ? 'rgb(51, 28, 13)' : 'rgb(249, 186, 127)'
    }
    if (color === 'rgb(235, 140, 52)') {
      return isBackground ? 'rgb(166, 70, 0)' : 'rgb(249, 186, 127)'
    }
    if (color === 'rgb(255, 248, 241)' || color === 'rgb(254, 236, 220)') {
      return isBackground ? 'rgb(38, 20, 8)' : 'rgb(252, 217, 189)'
    }
    if (color === 'rgb(252, 217, 189)') {
      return isBackground ? 'rgb(26, 13, 5)' : 'rgb(249, 186, 127)'
    }
    
    // 그라디언트 처리 - 재귀 호출 방지
    if (color.includes('linear-gradient')) {
      return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
        // 직접 색상 매칭 처리
        const rgbStr = `rgb(${r}, ${g}, ${b})`
        
        // callstack 색상
        if (rgbStr === 'rgb(92, 51, 23)' || rgbStr === 'rgb(120, 63, 25)') {
          return isBackground ? 'rgb(46, 32, 21)' : 'rgb(249, 235, 218)'
        }
        // microtask 색상
        if (rgbStr === 'rgb(21, 94, 173)' || rgbStr === 'rgb(37, 117, 203)') {
          return isBackground ? 'rgb(17, 33, 51)' : 'rgb(147, 194, 246)'
        }
        // macrotask 색상
        if (rgbStr === 'rgb(166, 70, 0)' || rgbStr === 'rgb(194, 94, 14)') {
          return isBackground ? 'rgb(51, 28, 13)' : 'rgb(249, 186, 127)'
        }
        
        // 기본값
        return isBackground ? 'rgb(23, 23, 23)' : 'rgb(240, 240, 240)'
      })
    }
    
    // 기본 폴백: 어두운 배경, 밝은 텍스트
    return isBackground ? 'rgb(23, 23, 23)' : 'rgb(240, 240, 240)'
  }, [isDarkMode])

  // 테마 게터 함수들 메모이제이션 (접근성 강화)
  const themeGetters = useMemo(() => ({
    getQueueTheme: (queueType: CallStackQueueType) => {
      const baseTheme = getCallStackQueueTheme(queueType)
      
      if (enforceAccessibility && accessibleColors.libraryColors[queueType]) {
        const accessibleTheme = accessibleColors.libraryColors[queueType]
        return {
          ...baseTheme,
          background: {
            light: accessibleTheme.background,
            main: accessibleTheme.background,
            dark: accessibleTheme.background
          },
          text: {
            primary: accessibleTheme.text,
            secondary: accessibleColors.theme.text.secondary,
            contrast: accessibleColors.theme.text.inverse
          },
          border: {
            main: accessibleTheme.border,
            light: accessibleTheme.border,
            focus: accessibleTheme.accent
          }
        }
      }
      
      if (!isDarkMode) return baseTheme
      
      // 다크 모드용 색상 조정
      return {
        ...baseTheme,
        background: {
          light: adjustColorForMode(baseTheme.background.light, true),
          main: adjustColorForMode(baseTheme.background.main, true),
          dark: adjustColorForMode(baseTheme.background.dark, true)
        },
        text: {
          primary: adjustColorForMode(baseTheme.text.primary),
          secondary: adjustColorForMode(baseTheme.text.secondary),
          contrast: isDarkMode ? 'rgb(240, 240, 240)' : baseTheme.text.contrast
        }
      }
    },
    getQueueColor: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['gradients']) => {
      if (enforceAccessibility && accessibleColors.libraryColors[queueType]) {
        return accessibleColors.libraryColors[queueType].background
      }
      const color = getCallStackQueueColor(queueType, variant)
      return adjustColorForMode(color, variant === 'light' || variant === 'main')
    },
    getQueueBorder: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['border']) => {
      if (enforceAccessibility && accessibleColors.libraryColors[queueType]) {
        return accessibleColors.libraryColors[queueType].border
      }
      const color = getCallStackQueueBorder(queueType, variant)
      return adjustColorForMode(color)
    },
    getQueueText: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['text']) => {
      if (enforceAccessibility && accessibleColors.libraryColors[queueType]) {
        return variant === 'secondary' 
          ? accessibleColors.theme.text.secondary
          : accessibleColors.libraryColors[queueType].text
      }
      const color = getCallStackQueueText(queueType, variant)
      return adjustColorForMode(color, false)
    }
  }), [isDarkMode, adjustColorForMode, enforceAccessibility, accessibleColors])

  // 스타일 생성 함수들
  const styleCreators = useMemo(() => ({
    createBookStyles: (queueType: CallStackQueueType, isOpen = false) => 
      createLibraryBookStyles(queueType, isOpen),
    createShelfStyles: (queueType: CallStackQueueType) => 
      createLibraryShelfStyles(queueType)
  }), [])

  // 반응형 유틸리티 함수들
  const responsiveUtils = useMemo(() => ({
    getResponsiveBookSize: () => 
      getLibraryResponsiveValue(CALLSTACK_LIBRARY_THEME.library.elements.bookHeight, screenWidth),
    getResponsiveShelfGap: () => 
      getLibraryResponsiveValue(CALLSTACK_LIBRARY_THEME.spacing.shelfGap, screenWidth),
    getResponsivePadding: () => 
      getLibraryResponsiveValue(CALLSTACK_LIBRARY_THEME.spacing.sectionPadding, screenWidth)
  }), [screenWidth])

  // 애니메이션 유틸리티 함수들
  const animationUtils = useMemo(() => {
    if (!enableAnimations) {
      return {
        getBookDropAnimation: () => ({}),
        getShelfSlideAnimation: () => ({})
      }
    }

    return {
      getBookDropAnimation: () => ({
        type: "spring" as const,
        ...CALLSTACK_LIBRARY_THEME.animations.bookDrop
      }),
      getShelfSlideAnimation: () => ({
        type: "spring" as const,
        ...CALLSTACK_LIBRARY_THEME.animations.shelfSlide
      })
    }
  }, [enableAnimations])

  // 라이브러리 배경 조정 - 실제 화면 배경과 동일하게
  const getLibraryBackground = useCallback(() => {
    // 라이트/다크 모드 관계없이 실제 화면 배경 사용
    return 'rgb(var(--background))'
  }, [isDarkMode])

  // 아이콘 헬퍼
  const getQueueIcon = useCallback((queueType: CallStackQueueType) => {
    return CALLSTACK_LIBRARY_THEME.icons[queueType]
  }, [])

  return {
    theme: CALLSTACK_LIBRARY_THEME,
    isDarkMode,
    breakpoint,
    screenWidth,
    ...themeGetters,
    ...styleCreators,
    ...responsiveUtils,
    ...animationUtils,
    getQueueIcon,
    getLibraryBackground,
    // 접근성 기능들
    isAccessible: accessibleColors.isValidCombination,
    getAccessibleTextColor: accessibleColors.getTextColor,
    adjustColorForAccessibility: accessibleColors.adjustColor,
    colorDebugInfo: debugColors ? accessibleColors.debugInfo : {}
  }
}

/**
 * 특정 큐 타입에 특화된 테마 훅
 */
export const useCallStackQueueTheme = (queueType: CallStackQueueType) => {
  const fullTheme = useCallStackLibraryTheme()
  
  return useMemo(() => {
    const queueTheme = fullTheme.getQueueTheme(queueType)
    
    return {
      ...fullTheme,
      currentQueue: queueType,
      queueTheme,
      // 현재 큐 타입에 특화된 스타일들
      styles: {
        book: fullTheme.createBookStyles(queueType),
        bookOpen: fullTheme.createBookStyles(queueType, true),
        shelf: fullTheme.createShelfStyles(queueType)
      },
      colors: {
        primary: queueTheme.primary,
        secondary: queueTheme.secondary,
        accent: queueTheme.accent,
        background: queueTheme.background,
        text: queueTheme.text,
        gradients: queueTheme.gradients,
        border: queueTheme.border
      },
      icon: fullTheme.getQueueIcon(queueType)
    }
  }, [fullTheme, queueType])
}

/**
 * CSS 변수를 생성하는 헬퍼 훅 (CSS-in-JS 대신 CSS 변수 사용을 위해)
 */
export const useCallStackLibraryCSSVariables = (queueType?: CallStackQueueType) => {
  const theme = useCallStackLibraryTheme()
  
  return useMemo(() => {
    const baseVariables = {
      '--callstack-library-bg': theme.getLibraryBackground(),
      '--callstack-library-wood-texture': CALLSTACK_LIBRARY_THEME.library.textures.wood,
      '--callstack-library-book-radius': CALLSTACK_LIBRARY_THEME.borderRadius.book,
      '--callstack-library-panel-radius': CALLSTACK_LIBRARY_THEME.borderRadius.panel,
      '--callstack-library-book-shadow': CALLSTACK_LIBRARY_THEME.shadows.book,
      '--callstack-library-panel-shadow': CALLSTACK_LIBRARY_THEME.shadows.panel
    }

    if (!queueType) return baseVariables

    const queueTheme = theme.getQueueTheme(queueType)
    const queueVariables = {
      [`--callstack-library-${queueType}-primary`]: queueTheme.primary,
      [`--callstack-library-${queueType}-secondary`]: queueTheme.secondary,
      [`--callstack-library-${queueType}-accent`]: queueTheme.accent,
      [`--callstack-library-${queueType}-bg-light`]: queueTheme.background.light,
      [`--callstack-library-${queueType}-bg-main`]: queueTheme.background.main,
      [`--callstack-library-${queueType}-bg-dark`]: queueTheme.background.dark,
      [`--callstack-library-${queueType}-text-primary`]: queueTheme.text.primary,
      [`--callstack-library-${queueType}-text-contrast`]: queueTheme.text.contrast,
      [`--callstack-library-${queueType}-gradient-main`]: queueTheme.gradients.main,
      [`--callstack-library-${queueType}-gradient-light`]: queueTheme.gradients.light,
      [`--callstack-library-${queueType}-gradient-button`]: queueTheme.gradients.button,
      [`--callstack-library-${queueType}-border-main`]: queueTheme.border.main,
      [`--callstack-library-${queueType}-border-focus`]: queueTheme.border.focus
    }

    return { ...baseVariables, ...queueVariables }
  }, [theme, queueType])
}

export default useCallStackLibraryTheme