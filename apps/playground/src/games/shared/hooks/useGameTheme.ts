/**
 * 공통 게임 테마 훅
 * 모든 게임이 동일한 API로 테마를 사용할 수 있도록 하는 재사용 가능한 훅
 */

import { useState, useEffect, useMemo } from 'react'

// 게임별 테마 설정 타입
export interface GameThemeConfig {
  gameId: string
  namespace: string
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
    background: {
      main: string
      elevated: string
      secondary: string
    }
    text: {
      primary: string
      secondary: string
      muted: string
    }
    border: {
      default: string
      strong: string
      light: string
    }
  }
  specialColors?: Record<string, string>
}

// 색상 강도 타입
export type ColorIntensity = 'light' | 'main' | 'dark'

// 테마 모드 감지 훅
export const useThemeMode = (forceDarkMode?: boolean) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (forceDarkMode !== undefined) return forceDarkMode
    // SSR에서는 항상 light mode로 시작
    return false
  })

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setHydrated(true)
    if (forceDarkMode !== undefined) return
    
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  useEffect(() => {
    if (forceDarkMode !== undefined) {
      setIsDarkMode(forceDarkMode)
      return
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkMode(isDark)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [forceDarkMode])

  return isDarkMode
}

// 공통 게임 테마 훅
export const useGameTheme = (config: GameThemeConfig, forceDarkMode?: boolean) => {
  const isDarkMode = useThemeMode(forceDarkMode)
  const { gameId, namespace, colorScheme, specialColors = {} } = config

  // CSS 변수명 생성
  const getVariableName = (category: string, type?: string) => {
    const base = `--game-${namespace}`
    return type ? `${base}-${category}-${type}` : `${base}-${category}`
  }

  // 색상 값 반환 (CSS 변수 또는 fallback)
  const getColorValue = (variableName: string, fallback?: string) => {
    if (typeof window === 'undefined') return fallback || 'transparent'
    
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim()
    
    return value || fallback || 'transparent'
  }

  // RGB 형식으로 색상 반환 (CSS 변수 값을 직접 사용)
  const getRGBColor = (variableName: string, fallback?: string) => {
    const value = getColorValue(variableName, fallback)
    return `rgb(${value})`
  }

  // RGBA 형식으로 색상 반환 (투명도 지원)
  const getRGBAColor = (variableName: string, opacity: number = 1, fallback?: string) => {
    const value = getColorValue(variableName, fallback)
    return `rgba(${value}, ${opacity})`
  }

  // 테마 API 메모이제이션
  const themeAPI = useMemo(() => ({
    // 기본 정보
    gameId,
    namespace,
    isDarkMode,

    // 주요 색상 접근
    getPrimaryColor: (intensity: ColorIntensity = 'main') => 
      `rgb(var(${getVariableName('primary', intensity)}))`,
    
    getSecondaryColor: (intensity: ColorIntensity = 'main') =>
      `rgb(var(${getVariableName('secondary', intensity)}))`,
    
    getAccentColor: (intensity: ColorIntensity = 'main') =>
      `rgb(var(${getVariableName('accent', intensity)}))`,

    // 상태 색상
    getSuccessColor: () => `rgb(var(${getVariableName('success')}))`,
    getWarningColor: () => `rgb(var(${getVariableName('warning')}))`,
    getErrorColor: () => `rgb(var(${getVariableName('error')}))`,
    
    // 투명도가 적용된 상태 색상
    getSuccessColorWithOpacity: (opacity: number = 1) =>
      getRGBAColor(getVariableName('success'), opacity),
    getWarningColorWithOpacity: (opacity: number = 1) =>
      getRGBAColor(getVariableName('warning'), opacity),
    getErrorColorWithOpacity: (opacity: number = 1) =>
      getRGBAColor(getVariableName('error'), opacity),

    // 배경 색상
    getBackgroundColor: (type: 'main' | 'elevated' | 'secondary' = 'main') =>
      `rgb(var(${getVariableName('bg', type)}))`,

    // 텍스트 색상
    getTextColor: (type: 'primary' | 'secondary' | 'muted' = 'primary') =>
      `rgb(var(${getVariableName('text', type)}))`,

    // 경계선 색상
    getBorderColor: (type: 'default' | 'strong' | 'light' = 'default') =>
      `rgb(var(${getVariableName('border', type)}))`,

    // 특수 색상 (게임별 고유 색상)
    getSpecialColor: (colorKey: string) =>
      getRGBColor(getVariableName('special', colorKey)),
    
    // 투명도가 적용된 특수 색상
    getSpecialColorWithOpacity: (colorKey: string, opacity: number = 1) =>
      getRGBAColor(getVariableName('special', colorKey), opacity),

    // 유틸리티 메서드
    getGameVariable: (name: string) => getVariableName(name),
    
    // 인라인 스타일 헬퍼
    getGameStyles: () => ({
      background: `rgb(var(${getVariableName('bg', 'main')}))`,
      color: `rgb(var(${getVariableName('text', 'primary')}))`,
      borderColor: `rgb(var(${getVariableName('border', 'default')}))`
    }),

    // 카드 스타일
    getCardStyles: () => ({
      background: `rgb(var(${getVariableName('bg', 'elevated')}))`,
      color: `rgb(var(${getVariableName('text', 'primary')}))`,
      border: `1px solid rgb(var(${getVariableName('border', 'light')}))`
    }),

    // 버튼 스타일
    getButtonStyles: (variant: 'primary' | 'secondary' | 'accent' = 'primary') => ({
      background: `rgb(var(${getVariableName(variant, 'main')}))`,
      color: variant === 'primary' 
        ? `rgb(var(--primary-foreground))` 
        : `rgb(var(${getVariableName('text', 'primary')}))`,
      border: `1px solid rgb(var(${getVariableName(variant, 'main')}))`
    }),

    // 호버 스타일
    getHoverStyles: (variant: 'primary' | 'secondary' | 'accent' = 'primary') => ({
      background: `rgb(var(${getVariableName(variant, 'dark')}))`,
    })

  }), [gameId, namespace, isDarkMode])

  return themeAPI
}

// CSS 변수 자동 주입 훅
export const useCSSThemeVariables = (config: GameThemeConfig) => {
  const { namespace, colorScheme, specialColors = {} } = config

  useEffect(() => {
    const root = document.documentElement
    const { primary, secondary, accent, success, warning, error, background, text, border } = colorScheme

    // 기본 색상 변수 설정
    root.style.setProperty(`--game-${namespace}-primary-main`, primary)
    root.style.setProperty(`--game-${namespace}-primary-light`, primary.replace(/[\d.]+/g, (match) => String(Math.min(255, parseFloat(match) + 20))))
    root.style.setProperty(`--game-${namespace}-primary-dark`, primary.replace(/[\d.]+/g, (match) => String(Math.max(0, parseFloat(match) - 20))))

    root.style.setProperty(`--game-${namespace}-secondary-main`, secondary)
    root.style.setProperty(`--game-${namespace}-secondary-light`, secondary.replace(/[\d.]+/g, (match) => String(Math.min(255, parseFloat(match) + 20))))
    root.style.setProperty(`--game-${namespace}-secondary-dark`, secondary.replace(/[\d.]+/g, (match) => String(Math.max(0, parseFloat(match) - 20))))

    root.style.setProperty(`--game-${namespace}-accent-main`, accent)
    root.style.setProperty(`--game-${namespace}-accent-light`, accent.replace(/[\d.]+/g, (match) => String(Math.min(255, parseFloat(match) + 20))))
    root.style.setProperty(`--game-${namespace}-accent-dark`, accent.replace(/[\d.]+/g, (match) => String(Math.max(0, parseFloat(match) - 20))))

    // 상태 색상
    root.style.setProperty(`--game-${namespace}-success`, success)
    root.style.setProperty(`--game-${namespace}-warning`, warning)
    root.style.setProperty(`--game-${namespace}-error`, error)

    // 배경 색상
    root.style.setProperty(`--game-${namespace}-bg-main`, background.main)
    root.style.setProperty(`--game-${namespace}-bg-elevated`, background.elevated)
    root.style.setProperty(`--game-${namespace}-bg-secondary`, background.secondary)

    // 텍스트 색상
    root.style.setProperty(`--game-${namespace}-text-primary`, text.primary)
    root.style.setProperty(`--game-${namespace}-text-secondary`, text.secondary)
    root.style.setProperty(`--game-${namespace}-text-muted`, text.muted)

    // 경계선 색상
    root.style.setProperty(`--game-${namespace}-border-default`, border.default)
    root.style.setProperty(`--game-${namespace}-border-strong`, border.strong)
    root.style.setProperty(`--game-${namespace}-border-light`, border.light)

    // 특수 색상
    Object.entries(specialColors).forEach(([key, value]) => {
      root.style.setProperty(`--game-${namespace}-special-${key}`, value)
    })

    // 클린업 함수
    return () => {
      const properties = [
        `--game-${namespace}-primary-main`,
        `--game-${namespace}-primary-light`,
        `--game-${namespace}-primary-dark`,
        `--game-${namespace}-secondary-main`,
        `--game-${namespace}-secondary-light`,
        `--game-${namespace}-secondary-dark`,
        `--game-${namespace}-accent-main`,
        `--game-${namespace}-accent-light`,
        `--game-${namespace}-accent-dark`,
        `--game-${namespace}-success`,
        `--game-${namespace}-warning`,
        `--game-${namespace}-error`,
        `--game-${namespace}-bg-main`,
        `--game-${namespace}-bg-elevated`,
        `--game-${namespace}-bg-secondary`,
        `--game-${namespace}-text-primary`,
        `--game-${namespace}-text-secondary`,
        `--game-${namespace}-text-muted`,
        `--game-${namespace}-border-default`,
        `--game-${namespace}-border-strong`,
        `--game-${namespace}-border-light`,
        ...Object.keys(specialColors).map(key => `--game-${namespace}-special-${key}`)
      ]
      
      properties.forEach(prop => root.style.removeProperty(prop))
    }
  }, [namespace, colorScheme, specialColors])
}

// 통합 테마 훅 (CSS 변수 자동 주입 + 테마 API 제공)
export const useCompleteGameTheme = (config: GameThemeConfig, forceDarkMode?: boolean) => {
  useCSSThemeVariables(config)
  return useGameTheme(config, forceDarkMode)
}