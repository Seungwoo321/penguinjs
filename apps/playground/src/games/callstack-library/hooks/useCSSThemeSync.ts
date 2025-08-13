/**
 * CSS 변수와 JavaScript 테마 시스템을 동기화하는 훅
 * Tailwind v4의 CSS 변수 기반 시스템과 연동
 */

import { useEffect, useLayoutEffect } from 'react'
import { CALLSTACK_LIBRARY_THEME } from '@/games/callstack-library/theme/callstackLibraryTheme'

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
    
    // 글로벌 CSS 변수 사용으로 변경 - 더 이상 게임별 CSS 변수 설정하지 않음
    // 대신 글로벌 테마 시스템의 변수들을 활용
    
    // 게임별 특화 변수만 설정 (글로벌과 중복되지 않는 것들)
    if (CALLSTACK_LIBRARY_THEME.semantic) {
      root.style.setProperty('--color-library-success', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.success))
      root.style.setProperty('--color-library-error', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.error))
      root.style.setProperty('--color-library-warning', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.warning))
      root.style.setProperty('--color-library-info', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.info))
      root.style.setProperty('--color-library-processing', rgbToTailwindFormat(CALLSTACK_LIBRARY_THEME.semantic.processing))
    }

    // Cleanup
    return () => {
      // CSS 변수는 유지 (다른 컴포넌트에서 사용 가능)
    }
  }, [isDarkMode])

  // 글로벌 CSS 변수 기반 클래스 생성 헬퍼
  const getTailwindClasses = (queueType: 'callstack' | 'microtask' | 'macrotask') => {
    // 글로벌 CSS 변수 이름 매핑
    const varPrefix = queueType === 'callstack' ? 'queue' : 
                     queueType === 'microtask' ? 'urgent' : 'scheduled'
    
    return {
      background: `bg-[rgb(var(--game-callstack-${varPrefix}-bg-light))]`,
      backgroundMain: `bg-[rgb(var(--game-callstack-${varPrefix}-bg-main))]`,
      text: `text-[rgb(var(--game-callstack-${varPrefix}-primary))]`,
      border: `border-[rgb(var(--game-callstack-${varPrefix}-primary))]`,
      // 호버/포커스 상태
      hover: `hover:bg-[rgb(var(--game-callstack-${varPrefix}-bg-main))]`,
      focus: `focus:border-[rgb(var(--game-callstack-${varPrefix}-accent))]`,
    }
  }

  return {
    getTailwindClasses,
    // 동적 클래스 생성을 위한 유틸리티
    getQueueClasses: (queueType: 'callstack' | 'microtask' | 'macrotask', variant: 'light' | 'main' | 'dark' = 'light') => {
      const varPrefix = queueType === 'callstack' ? 'queue' : 
                       queueType === 'microtask' ? 'urgent' : 'scheduled'
      return `bg-[rgb(var(--game-callstack-${varPrefix}-bg-${variant}))] text-[rgb(var(--game-callstack-${varPrefix}-primary))] border-[rgb(var(--game-callstack-${varPrefix}-primary))]`
    },
    // CSS 변수 직접 접근 - 글로벌 변수 우선
    getCSSVariable: (varName: string) => {
      return getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim()
    }
  }
}

// 글로벌 CSS 변수 기반 정적 클래스 맵 (Tailwind JIT 컴파일을 위해)
export const CALLSTACK_TAILWIND_CLASSES = {
  callstack: {
    bg: 'bg-[rgb(var(--game-callstack-queue-bg-light))] bg-[rgb(var(--game-callstack-queue-bg-main))] bg-[rgb(var(--game-callstack-queue-primary))]',
    text: 'text-[rgb(var(--game-callstack-queue-primary))]',
    border: 'border-[rgb(var(--game-callstack-queue-primary))]',
    hover: 'hover:bg-[rgb(var(--game-callstack-queue-bg-main))]',
    focus: 'focus:border-[rgb(var(--game-callstack-queue-accent))]'
  },
  microtask: {
    bg: 'bg-[rgb(var(--game-callstack-urgent-bg-light))] bg-[rgb(var(--game-callstack-urgent-bg-main))] bg-[rgb(var(--game-callstack-urgent-primary))]',
    text: 'text-[rgb(var(--game-callstack-urgent-primary))]',
    border: 'border-[rgb(var(--game-callstack-urgent-primary))]',
    hover: 'hover:bg-[rgb(var(--game-callstack-urgent-bg-main))]',
    focus: 'focus:border-[rgb(var(--game-callstack-urgent-accent))]'
  },
  macrotask: {
    bg: 'bg-[rgb(var(--game-callstack-scheduled-bg-light))] bg-[rgb(var(--game-callstack-scheduled-bg-main))] bg-[rgb(var(--game-callstack-scheduled-primary))]',
    text: 'text-[rgb(var(--game-callstack-scheduled-primary))]',
    border: 'border-[rgb(var(--game-callstack-scheduled-primary))]',
    hover: 'hover:bg-[rgb(var(--game-callstack-scheduled-bg-main))]',
    focus: 'focus:border-[rgb(var(--game-callstack-scheduled-accent))]'
  }
}

// 다크모드 감지 훅 (호환성을 위해 추가)
export const useDarkModeDetection = () => {
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.classList.contains('dark') 
    : false;
  return isDarkMode;
}