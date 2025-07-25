/**
 * CSS 변수와 JavaScript 테마 시스템을 동기화하는 훅
 * Tailwind v4의 CSS 변수 기반 시스템과 연동
 */

import { useEffect, useLayoutEffect } from 'react'
import { CALLSTACK_LIBRARY_THEME } from '../theme/callstackLibraryTheme'

// RGB 문자열을 Tailwind v4 형식으로 변환 (공백 구분)
const rgbToTailwindFormat = (rgbString: string): string => {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return '0 0 0'
  return `${match[1]} ${match[2]} ${match[3]}`
}

export const useCSSThemeSync = (isDarkMode: boolean = false) => {
  // useLayoutEffect로 렌더링 전에 CSS 변수 설정
  useLayoutEffect(() => {
    // 서버 사이드에서는 실행하지 않음 (브라우저 환경 체크)
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const theme = CALLSTACK_LIBRARY_THEME.colors

    // 각 큐 타입별로 CSS 변수 설정
    const setCSSVariables = (prefix: string, colors: any) => {
      root.style.setProperty(`--color-${prefix}-primary`, rgbToTailwindFormat(colors.primary))
      root.style.setProperty(`--color-${prefix}-secondary`, rgbToTailwindFormat(colors.secondary))
      root.style.setProperty(`--color-${prefix}-accent`, rgbToTailwindFormat(colors.accent))
      root.style.setProperty(`--color-${prefix}-bg-light`, rgbToTailwindFormat(colors.background.light))
      root.style.setProperty(`--color-${prefix}-bg-main`, rgbToTailwindFormat(colors.background.main))
      root.style.setProperty(`--color-${prefix}-bg-dark`, rgbToTailwindFormat(colors.background.dark))
      root.style.setProperty(`--color-${prefix}-border-main`, rgbToTailwindFormat(colors.border.main))
      root.style.setProperty(`--color-${prefix}-border-light`, rgbToTailwindFormat(colors.border.light))
      root.style.setProperty(`--color-${prefix}-border-focus`, rgbToTailwindFormat(colors.border.focus))
    }

    // 라이트/다크 모드 처리
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 각 큐 타입별 색상 설정
    setCSSVariables('callstack', theme.callstack)
    setCSSVariables('microtask', theme.microtask)
    setCSSVariables('macrotask', theme.macrotask)

    // 의미론적 색상 설정
    if (CALLSTACK_LIBRARY_THEME.semantic) {
      root.style.setProperty('--color-library-success', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.success))
      root.style.setProperty('--color-library-error', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.error))
      root.style.setProperty('--color-library-warning', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.warning))
      root.style.setProperty('--color-library-info', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.info))
      root.style.setProperty('--color-library-processing', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.processing))
    }

    // 배경 레벨 설정
    if (CALLSTACK_LIBRARY_THEME.backgrounds) {
      root.style.setProperty('--color-library-bg-1', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.backgrounds.level1))
      root.style.setProperty('--color-library-bg-2', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.backgrounds.level2))
      root.style.setProperty('--color-library-bg-3', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.backgrounds.level3))
      root.style.setProperty('--color-library-bg-4', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.backgrounds.level4))
    }

    // Cleanup
    return () => {
      // CSS 변수는 유지 (다른 컴포넌트에서 사용 가능)
    }
  }, [isDarkMode])

  // Tailwind 클래스 생성 헬퍼
  const getTailwindClasses = (queueType: 'callstack' | 'microtask' | 'macrotask') => {
    return {
      background: `bg-${queueType}-light`,
      backgroundMain: `bg-${queueType}-main`,
      text: `text-${queueType}`,
      border: `border-${queueType}`,
      gradient: `bg-gradient-${queueType}`,
      // 호버/포커스 상태
      hover: `hover:bg-${queueType}-main`,
      focus: `focus:border-${queueType}-focus`,
      // 다크 모드
      dark: {
        background: `dark:bg-${queueType}-dark`,
        text: `dark:text-${queueType}`,
      }
    }
  }

  return {
    getTailwindClasses,
    // 동적 클래스 생성을 위한 유틸리티
    getQueueClasses: (queueType: 'callstack' | 'microtask' | 'macrotask', variant: 'light' | 'main' | 'dark' = 'light') => {
      return `bg-${queueType}-${variant} text-${queueType} border-${queueType}`
    },
    // CSS 변수 직접 접근
    getCSSVariable: (varName: string) => {
      return getComputedStyle(document.documentElement).getPropertyValue(`--color-${varName}`).trim()
    }
  }
}

// 정적 클래스 맵 (Tailwind JIT 컴파일을 위해)
export const CALLSTACK_TAILWIND_CLASSES = {
  callstack: {
    bg: 'bg-callstack-light bg-callstack-main bg-callstack-primary',
    text: 'text-callstack',
    border: 'border-callstack',
    gradient: 'bg-gradient-callstack',
    hover: 'hover:bg-callstack-main',
    focus: 'focus:border-callstack-focus'
  },
  microtask: {
    bg: 'bg-microtask-light bg-microtask-main bg-microtask-primary',
    text: 'text-microtask',
    border: 'border-microtask',
    gradient: 'bg-gradient-microtask',
    hover: 'hover:bg-microtask-main',
    focus: 'focus:border-microtask-focus'
  },
  macrotask: {
    bg: 'bg-macrotask-light bg-macrotask-main bg-macrotask-primary',
    text: 'text-macrotask',
    border: 'border-macrotask',
    gradient: 'bg-gradient-macrotask',
    hover: 'hover:bg-macrotask-main',
    focus: 'focus:border-macrotask-focus'
  }
}