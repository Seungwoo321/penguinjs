/**
 * 콜스택 도서관 게임 전용 반응형 레이아웃 훅
 * 다양한 화면 크기에서 최적의 사용자 경험 제공
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useCallStackLibraryGameTheme } from './useCallStackLibraryGameTheme'

export interface ResponsiveLayoutConfig {
  // 콜스택 관련 설정
  bookHeight: string
  bookWidth: string
  maxVisibleBooks: number
  stackOverflowThreshold: number
  
  // 큐 관련 설정
  queueMinHeight: string
  queueGap: string
  showScrollIndicator: boolean
  
  // 텍스트 및 UI 요소
  fontSize: {
    title: string
    subtitle: string
    body: string
    caption: string
  }
  buttonSize: {
    minWidth: string
    minHeight: string
    padding: string
  }
  
  // 레이아웃 구성
  layoutDirection: 'vertical' | 'horizontal'
  panelSpacing: string
  enableCompactMode: boolean
}

export interface UseResponsiveLayoutOptions {
  enableDebugMode?: boolean
  customBreakpoints?: {
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export interface ResponsiveLayoutState {
  config: ResponsiveLayoutConfig
  breakpoint: 'sm' | 'md' | 'lg' | 'xl'
  screenWidth: number
  screenHeight: number
  isCompact: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

/**
 * 반응형 레이아웃 훅
 */
export const useResponsiveLayout = (
  options: UseResponsiveLayoutOptions = {}
): ResponsiveLayoutState & {
  // 유틸리티 함수들
  getOptimalColumnCount: () => number
  getOptimalBookSize: (itemCount: number) => { width: string; height: string }
  shouldShowScrollIndicator: (itemCount: number, containerHeight: number) => boolean
  getResponsiveSpacing: (baseSpacing: number) => string
  getAdaptiveTextSize: (baseSize: string) => string
  
  // 레이아웃 전환 함수들
  adaptLayoutForScreen: () => ResponsiveLayoutConfig
  getCompactModeConfig: () => Partial<ResponsiveLayoutConfig>
  
  // 디버그 정보 (개발용)
  debugInfo?: {
    containerDimensions: { width: number; height: number }
    calculatedSizes: Record<string, any>
    performanceMetrics: Record<string, number>
  }
} => {
  const {
    enableDebugMode = false,
    customBreakpoints
  } = options

  const libraryTheme = useCallStackLibraryGameTheme()
  
  // 화면 크기 상태
  const [screenDimensions, setScreenDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  })

  // 화면 크기 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // 성능 최적화를 위한 디바운스
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // 브레이크포인트 계산
  const breakpoint = useMemo(() => {
    const breakpoints = customBreakpoints || {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
    const { width } = screenDimensions
    
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    return 'sm'
  }, [screenDimensions.width, customBreakpoints])

  // 디바이스 타입 및 방향
  const deviceInfo = useMemo(() => {
    const { width, height } = screenDimensions
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      orientation: width > height ? 'landscape' as const : 'portrait' as const,
      isCompact: width < 640 || height < 480
    }
  }, [screenDimensions])

  // 반응형 설정 계산
  const responsiveConfig = useMemo((): ResponsiveLayoutConfig => {
    const { width, height } = screenDimensions
    const { isMobile, isTablet, isCompact } = deviceInfo

    // 기본 크기 계산
    const baseBookHeight = isMobile ? 40 : isTablet ? 55 : 65
    const baseBookWidth = Math.min(baseBookHeight * 0.7, width * 0.08)
    
    // 최대 표시 가능한 책 수 계산
    const availableHeight = height * 0.3 // 콜스택 영역이 전체의 약 1/3
    const maxVisibleBooks = Math.floor(availableHeight / (baseBookHeight * 0.8))

    return {
      // 콜스택 설정
      bookHeight: `${baseBookHeight}px`,
      bookWidth: `${baseBookWidth}px`,
      maxVisibleBooks: Math.max(3, Math.min(8, maxVisibleBooks)),
      stackOverflowThreshold: maxVisibleBooks + 2,
      
      // 큐 설정
      queueMinHeight: isMobile ? '120px' : isTablet ? '150px' : '180px',
      queueGap: isMobile ? '8px' : '12px',
      showScrollIndicator: isCompact,
      
      // 텍스트 크기
      fontSize: {
        title: isMobile ? '16px' : isTablet ? '18px' : '20px',
        subtitle: isMobile ? '14px' : '16px',
        body: isMobile ? '13px' : '14px',
        caption: isMobile ? '11px' : '12px'
      },
      
      // 버튼 크기 (터치 친화적)
      buttonSize: {
        minWidth: '44px',  // WCAG 권장 최소 터치 타겟
        minHeight: '44px',
        padding: isMobile ? '8px 12px' : '10px 16px'
      },
      
      // 레이아웃
      layoutDirection: width < height && isMobile ? 'vertical' : 'horizontal',
      panelSpacing: isMobile ? '12px' : isTablet ? '16px' : '20px',
      enableCompactMode: isCompact
    }
  }, [screenDimensions, deviceInfo])

  // 유틸리티 함수들
  const getOptimalColumnCount = useCallback(() => {
    const { width } = screenDimensions
    if (width < 640) return 1
    if (width < 1024) return 2
    if (width < 1440) return 3
    return 4
  }, [screenDimensions.width])

  const getOptimalBookSize = useCallback((itemCount: number) => {
    const baseConfig = responsiveConfig
    const scaleFactor = Math.min(1, Math.max(0.7, 1 - (itemCount - 5) * 0.05))
    
    return {
      width: `${parseInt(baseConfig.bookWidth) * scaleFactor}px`,
      height: `${parseInt(baseConfig.bookHeight) * scaleFactor}px`
    }
  }, [responsiveConfig])

  const shouldShowScrollIndicator = useCallback((itemCount: number, containerHeight: number) => {
    const itemHeight = parseInt(responsiveConfig.bookHeight)
    const totalHeight = itemCount * itemHeight * 0.8 // 겹침 효과 고려
    return totalHeight > containerHeight
  }, [responsiveConfig.bookHeight])

  const getResponsiveSpacing = useCallback((baseSpacing: number) => {
    const { isMobile, isTablet } = deviceInfo
    const multiplier = isMobile ? 0.75 : isTablet ? 0.9 : 1
    return `${baseSpacing * multiplier}px`
  }, [deviceInfo])

  const getAdaptiveTextSize = useCallback((baseSize: string) => {
    const { isMobile } = deviceInfo
    const sizeMap: Record<string, string> = {
      'text-xs': isMobile ? 'text-xs' : 'text-sm',
      'text-sm': isMobile ? 'text-sm' : 'text-base',
      'text-base': isMobile ? 'text-sm' : 'text-base',
      'text-lg': isMobile ? 'text-base' : 'text-lg',
      'text-xl': isMobile ? 'text-lg' : 'text-xl'
    }
    return sizeMap[baseSize] || baseSize
  }, [deviceInfo])

  // 레이아웃 적응 함수들
  const adaptLayoutForScreen = useCallback(() => {
    return responsiveConfig
  }, [responsiveConfig])

  const getCompactModeConfig = useCallback((): Partial<ResponsiveLayoutConfig> => {
    return {
      bookHeight: '35px',
      bookWidth: '25px',
      maxVisibleBooks: 4,
      queueMinHeight: '100px',
      fontSize: {
        title: '14px',
        subtitle: '12px',
        body: '11px',
        caption: '10px'
      },
      enableCompactMode: true
    }
  }, [])

  // 디버그 정보 (개발용)
  const debugInfo = useMemo(() => {
    if (!enableDebugMode) return undefined

    return {
      containerDimensions: screenDimensions,
      calculatedSizes: {
        bookHeight: responsiveConfig.bookHeight,
        bookWidth: responsiveConfig.bookWidth,
        maxVisible: responsiveConfig.maxVisibleBooks,
        breakpoint,
        deviceType: deviceInfo
      },
      performanceMetrics: {
        renderTime: performance.now(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    }
  }, [enableDebugMode, screenDimensions, responsiveConfig, breakpoint, deviceInfo])

  return {
    // 상태
    config: responsiveConfig,
    breakpoint,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    ...deviceInfo,
    orientation: deviceInfo.orientation,
    
    // 유틸리티 함수들
    getOptimalColumnCount,
    getOptimalBookSize,
    shouldShowScrollIndicator,
    getResponsiveSpacing,
    getAdaptiveTextSize,
    
    // 레이아웃 함수들
    adaptLayoutForScreen,
    getCompactModeConfig,
    
    // 디버그 정보
    ...(enableDebugMode && { debugInfo })
  }
}

/**
 * 특정 컨테이너에 대한 반응형 설정을 제공하는 훅
 */
export const useContainerResponsive = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseResponsiveLayoutOptions = {}
) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const baseLayout = useResponsiveLayout(options)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerRef])

  const containerConfig = useMemo(() => {
    if (containerSize.width === 0) return baseLayout.config

    // 컨테이너 크기에 따른 조정
    const isNarrowContainer = containerSize.width < 400
    const isShortContainer = containerSize.height < 300

    return {
      ...baseLayout.config,
      bookHeight: isShortContainer ? '30px' : baseLayout.config.bookHeight,
      bookWidth: isNarrowContainer ? '20px' : baseLayout.config.bookWidth,
      maxVisibleBooks: isShortContainer ? 3 : baseLayout.config.maxVisibleBooks,
      enableCompactMode: isNarrowContainer || isShortContainer
    }
  }, [baseLayout.config, containerSize])

  return {
    ...baseLayout,
    config: containerConfig,
    containerSize
  }
}

export default useResponsiveLayout