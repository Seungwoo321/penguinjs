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

interface UseCallStackLibraryThemeOptions {
  enableResponsive?: boolean
  enableAnimations?: boolean
  defaultQueueType?: CallStackQueueType
}

interface CallStackLibraryThemeContext {
  // Theme data
  theme: typeof CALLSTACK_LIBRARY_THEME
  
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
    defaultQueueType = 'callstack'
  } = options

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

  // 테마 게터 함수들 메모이제이션
  const themeGetters = useMemo(() => ({
    getQueueTheme: (queueType: CallStackQueueType) => getCallStackQueueTheme(queueType),
    getQueueColor: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['gradients']) => 
      getCallStackQueueColor(queueType, variant),
    getQueueBorder: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['border']) => 
      getCallStackQueueBorder(queueType, variant),
    getQueueText: (queueType: CallStackQueueType, variant?: keyof CallStackQueueTheme['text']) => 
      getCallStackQueueText(queueType, variant)
  }), [])

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

  // 아이콘 헬퍼
  const getQueueIcon = useCallback((queueType: CallStackQueueType) => {
    return CALLSTACK_LIBRARY_THEME.icons[queueType]
  }, [])

  return {
    theme: CALLSTACK_LIBRARY_THEME,
    breakpoint,
    screenWidth,
    ...themeGetters,
    ...styleCreators,
    ...responsiveUtils,
    ...animationUtils,
    getQueueIcon
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
      '--callstack-library-bg': CALLSTACK_LIBRARY_THEME.library.elements.libraryBackground,
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