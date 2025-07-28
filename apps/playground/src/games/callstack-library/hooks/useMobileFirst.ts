/**
 * Mobile-first 반응형 디자인 훅
 * 모바일 우선 설계 원칙에 따른 반응형 시스템
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

interface ViewportConfig {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;
}

interface ResponsiveConfig {
  minTouchTarget: number;
  maxContentWidth: number;
  containerPadding: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  typography: {
    mobile: Record<string, string>;
    tablet: Record<string, string>;
    desktop: Record<string, string>;
    wide: Record<string, string>;
  };
  spacing: {
    mobile: Record<string, string>;
    tablet: Record<string, string>;
    desktop: Record<string, string>;
    wide: Record<string, string>;
  };
}

interface UseMobileFirstResult {
  // 현재 상태
  breakpoint: keyof Breakpoints;
  viewport: ViewportConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // 반응형 유틸리티
  getResponsiveValue: <T>(values: Record<keyof Breakpoints, T>) => T;
  getFluidValue: (min: number, max: number, minVw: number, maxVw: number) => string;
  getTouchOptimizedSize: (baseSize: number) => number;
  
  // CSS 생성기
  generateResponsiveCSS: (styles: Record<keyof Breakpoints, React.CSSProperties>) => React.CSSProperties;
  generateFluidCSS: (property: string, min: number, max: number) => React.CSSProperties;
  
  // 조건부 렌더링
  showOn: (breakpoints: (keyof Breakpoints)[]) => boolean;
  hideOn: (breakpoints: (keyof Breakpoints)[]) => boolean;
}

const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

const DEFAULT_CONFIG: ResponsiveConfig = {
  minTouchTarget: 44,
  maxContentWidth: 1400,
  containerPadding: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
    wide: '40px'
  },
  typography: {
    mobile: {
      h1: 'clamp(24px, 6vw, 32px)',
      h2: 'clamp(20px, 5vw, 28px)',
      h3: 'clamp(18px, 4vw, 24px)',
      body: 'clamp(14px, 3.5vw, 16px)',
      caption: 'clamp(12px, 3vw, 14px)'
    },
    tablet: {
      h1: 'clamp(28px, 5vw, 36px)',
      h2: 'clamp(24px, 4.5vw, 32px)',
      h3: 'clamp(20px, 4vw, 28px)',
      body: 'clamp(15px, 3vw, 17px)',
      caption: 'clamp(13px, 2.5vw, 15px)'
    },
    desktop: {
      h1: 'clamp(32px, 4vw, 42px)',
      h2: 'clamp(28px, 3.5vw, 36px)',
      h3: 'clamp(24px, 3vw, 30px)',
      body: 'clamp(16px, 2.5vw, 18px)',
      caption: 'clamp(14px, 2vw, 16px)'
    },
    wide: {
      h1: 'clamp(36px, 3.5vw, 48px)',
      h2: 'clamp(32px, 3vw, 40px)',
      h3: 'clamp(28px, 2.5vw, 34px)',
      body: 'clamp(17px, 2vw, 19px)',
      caption: 'clamp(15px, 1.8vw, 17px)'
    }
  },
  spacing: {
    mobile: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      xxl: '24px'
    },
    tablet: {
      xs: '6px',
      sm: '12px',
      md: '18px',
      lg: '24px',
      xl: '30px',
      xxl: '36px'
    },
    desktop: {
      xs: '8px',
      sm: '16px',
      md: '24px',
      lg: '32px',
      xl: '40px',
      xxl: '48px'
    },
    wide: {
      xs: '10px',
      sm: '20px',
      md: '30px',
      lg: '40px',
      xl: '50px',
      xxl: '60px'
    }
  }
};

/**
 * Mobile-first 반응형 디자인 훅
 */
export const useMobileFirst = (
  customBreakpoints?: Partial<Breakpoints>,
  customConfig?: Partial<ResponsiveConfig>
): UseMobileFirstResult => {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };
  const config = { ...DEFAULT_CONFIG, ...customConfig };

  const [viewport, setViewport] = useState<ViewportConfig>({
    width: typeof window !== 'undefined' ? window.innerWidth : 320,
    height: typeof window !== 'undefined' ? window.innerHeight : 568,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    orientation: 'portrait',
    isTouchDevice: false,
    hasHover: false,
    prefersReducedMotion: false
  });

  // 뷰포트 정보 업데이트
  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // 터치 디바이스 감지
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 호버 지원 감지
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    // 모션 감소 선호도 감지
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setViewport({
      width,
      height,
      devicePixelRatio: window.devicePixelRatio,
      orientation,
      isTouchDevice,
      hasHover,
      prefersReducedMotion
    });
  }, []);

  // 이벤트 리스너 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;

    updateViewport();

    const mediaQueries = [
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(prefers-reduced-motion: reduce)')
    ];

    const handleChange = () => updateViewport();
    
    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, [updateViewport]);

  // 현재 브레이크포인트 계산
  const breakpoint = useMemo((): keyof Breakpoints => {
    const { width } = viewport;
    if (width >= breakpoints.wide) return 'wide';
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
    return 'mobile';
  }, [viewport.width, breakpoints]);

  // 편의 속성들
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop' || breakpoint === 'wide';

  // 반응형 값 선택기
  const getResponsiveValue = useCallback(<T>(values: Record<keyof Breakpoints, T>): T => {
    // Mobile-first: 현재 브레이크포인트 이하에서 가장 큰 값 선택
    if (breakpoint === 'wide' && values.wide !== undefined) return values.wide;
    if ((breakpoint === 'desktop' || breakpoint === 'wide') && values.desktop !== undefined) return values.desktop;
    if ((breakpoint === 'tablet' || breakpoint === 'desktop' || breakpoint === 'wide') && values.tablet !== undefined) return values.tablet;
    return values.mobile;
  }, [breakpoint]);

  // 유동적 값 계산 (CSS clamp 함수 생성)
  const getFluidValue = useCallback((
    min: number, 
    max: number, 
    minVw: number = breakpoints.mobile, 
    maxVw: number = breakpoints.desktop
  ): string => {
    const slope = (max - min) / (maxVw - minVw);
    const intersection = min - slope * minVw;
    const preferredValue = `${intersection}px + ${slope * 100}vw`;
    
    return `clamp(${min}px, ${preferredValue}, ${max}px)`;
  }, [breakpoints]);

  // 터치 최적화 크기 계산
  const getTouchOptimizedSize = useCallback((baseSize: number): number => {
    if (!viewport.isTouchDevice) return baseSize;
    return Math.max(baseSize, config.minTouchTarget);
  }, [viewport.isTouchDevice, config.minTouchTarget]);

  // 반응형 CSS 생성
  const generateResponsiveCSS = useCallback((
    styles: Record<keyof Breakpoints, React.CSSProperties>
  ): React.CSSProperties => {
    return getResponsiveValue(styles);
  }, [getResponsiveValue]);

  // 유동적 CSS 생성
  const generateFluidCSS = useCallback((
    property: string,
    min: number,
    max: number
  ): React.CSSProperties => {
    return {
      [property]: getFluidValue(min, max)
    };
  }, [getFluidValue]);

  // 조건부 표시/숨김
  const showOn = useCallback((targetBreakpoints: (keyof Breakpoints)[]): boolean => {
    return targetBreakpoints.includes(breakpoint);
  }, [breakpoint]);

  const hideOn = useCallback((targetBreakpoints: (keyof Breakpoints)[]): boolean => {
    return !targetBreakpoints.includes(breakpoint);
  }, [breakpoint]);

  return {
    breakpoint,
    viewport,
    isMobile,
    isTablet,
    isDesktop,
    getResponsiveValue,
    getFluidValue,
    getTouchOptimizedSize,
    generateResponsiveCSS,
    generateFluidCSS,
    showOn,
    hideOn
  };
};

/**
 * 반응형 그리드 시스템 훅
 */
export const useResponsiveGrid = (columns: Record<keyof Breakpoints, number>) => {
  const { breakpoint, getResponsiveValue } = useMobileFirst();
  
  const gridColumns = getResponsiveValue(columns);
  
  const gridStyles = useMemo((): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    gap: 'var(--grid-gap, 1rem)',
    width: '100%'
  }), [gridColumns]);

  return {
    gridColumns,
    gridStyles,
    breakpoint
  };
};

/**
 * 반응형 타이포그래피 훅
 */
export const useResponsiveTypography = () => {
  const { breakpoint, getResponsiveValue } = useMobileFirst();
  
  const typography = getResponsiveValue(DEFAULT_CONFIG.typography);
  
  return {
    typography,
    getTextStyle: (variant: keyof typeof typography) => ({
      fontSize: typography[variant],
      lineHeight: '1.5'
    }),
    breakpoint
  };
};

/**
 * 터치 친화적 인터페이스 훅
 */
export const useTouchFriendly = () => {
  const { viewport, getTouchOptimizedSize } = useMobileFirst();
  
  const getTouchStyles = useCallback((baseSize: number = 40): React.CSSProperties => {
    const optimizedSize = getTouchOptimizedSize(baseSize);
    
    return {
      minHeight: `${optimizedSize}px`,
      minWidth: `${optimizedSize}px`,
      padding: viewport.isTouchDevice ? '12px 16px' : '8px 12px',
      cursor: viewport.hasHover ? 'pointer' : 'default'
    };
  }, [viewport, getTouchOptimizedSize]);

  return {
    viewport,
    getTouchStyles,
    isTouchDevice: viewport.isTouchDevice,
    hasHover: viewport.hasHover
  };
};