/**
 * 디자인 시스템 Hook
 * 일관된 디자인 토큰 사용을 위한 커스텀 Hook
 */

import { useMemo, useCallback } from 'react';
import { designSystem, type ColorToken, type SpacingToken, type TypographyToken } from '../theme/designSystem';

// 현재 테마 컨텍스트 (라이트/다크 모드)
interface ThemeContext {
  mode: 'light' | 'dark';
  reducedMotion: boolean;
  highContrast: boolean;
}

// 디자인 시스템 Hook 반환 타입
interface UseDesignSystemReturn {
  // 색상 관련
  getColor: (path: string) => string;
  getSemanticColor: (type: 'success' | 'warning' | 'error' | 'info', variant?: 'light' | 'main' | 'dark' | 'contrast') => string;
  getQueueColor: (queue: 'callstack' | 'microtask' | 'macrotask', variant?: 'light' | 'main' | 'dark' | 'hover' | 'border') => string;
  
  // 타이포그래피 관련
  getTypography: (size: TypographyToken, breakpoint?: 'mobile' | 'tablet' | 'desktop') => {
    fontSize: string;
    lineHeight: string;
  };
  getFontFamily: (type: 'sans' | 'mono' | 'display') => string;
  
  // 간격 관련
  getSpacing: (token: SpacingToken | number) => string;
  getResponsiveSpacing: (mobile: SpacingToken, tablet?: SpacingToken, desktop?: SpacingToken) => string;
  
  // 컴포넌트 스타일
  getButtonStyle: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size: 'sm' | 'md' | 'lg') => React.CSSProperties;
  getInputStyle: (state?: 'default' | 'focus' | 'error') => React.CSSProperties;
  getPanelStyle: (variant?: 'base' | 'elevated' | 'flat') => React.CSSProperties;
  
  // 애니메이션 관련
  getTransition: (properties: string[], duration?: 'fast' | 'normal' | 'slow' | 'slower') => string;
  getAnimation: (keyframe: string, duration?: string, easing?: string) => string;
  
  // 반응형 관련
  getBreakpoint: (size: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => string;
  
  // 접근성 관련
  getContrastRatio: (foreground: string, background: string) => number;
  ensureWCAGCompliance: (foreground: string, background: string, level?: 'AA' | 'AAA') => boolean;
  
  // 유틸리티
  generateCSS: () => string;
  getThemeVariables: () => Record<string, string>;
}

/**
 * 디자인 시스템 Hook
 */
export const useDesignSystem = (themeContext?: Partial<ThemeContext>): UseDesignSystemReturn => {
  const theme = useMemo(() => ({
    mode: 'light' as const,
    reducedMotion: false,
    highContrast: false,
    ...themeContext,
  }), [themeContext]);

  // 색상 관련 함수들
  const getColor = useCallback((path: string): string => {
    const keys = path.split('.');
    let current: any = designSystem.colors;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        console.warn(`Color path not found: ${path}`);
        return '#000000';
      }
    }
    
    return typeof current === 'string' ? current : '#000000';
  }, []);

  const getSemanticColor = useCallback((
    type: 'success' | 'warning' | 'error' | 'info',
    variant: 'light' | 'main' | 'dark' | 'contrast' = 'main'
  ): string => {
    return designSystem.colors.semantic[type][variant];
  }, []);

  const getQueueColor = useCallback((
    queue: 'callstack' | 'microtask' | 'macrotask',
    variant: 'light' | 'main' | 'dark' | 'hover' | 'border' = 'main'
  ): string => {
    return designSystem.colors.queue[queue][variant];
  }, []);

  // 타이포그래피 관련 함수들
  const getTypography = useCallback((
    size: TypographyToken,
    breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  ) => {
    const typography = designSystem.typography.fontSize[size];
    return {
      fontSize: typography[breakpoint],
      lineHeight: typography.lineHeight,
    };
  }, []);

  const getFontFamily = useCallback((type: 'sans' | 'mono' | 'display'): string => {
    return designSystem.typography.fontFamily[type].join(', ');
  }, []);

  // 간격 관련 함수들
  const getSpacing = useCallback((token: SpacingToken | number): string => {
    if (typeof token === 'number') {
      return designSystem.designTokens.getSpacing(token);
    }
    return designSystem.spacing[token];
  }, []);

  const getResponsiveSpacing = useCallback((
    mobile: SpacingToken,
    tablet?: SpacingToken,
    desktop?: SpacingToken
  ): string => {
    const mobileValue = designSystem.spacing[mobile];
    const tabletValue = tablet ? designSystem.spacing[tablet] : mobileValue;
    const desktopValue = desktop ? designSystem.spacing[desktop] : tabletValue;
    
    return `${mobileValue} ${tabletValue} ${desktopValue}`;
  }, []);

  // 컴포넌트 스타일 함수들
  const getButtonStyle = useCallback((
    variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
    size: 'sm' | 'md' | 'lg'
  ): React.CSSProperties => {
    const baseStyle = designSystem.components.button.base;
    const sizeStyle = designSystem.components.button.sizes[size];
    const variantStyle = designSystem.components.button.variants[variant];
    
    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    } as React.CSSProperties;
  }, []);

  const getInputStyle = useCallback((
    state: 'default' | 'focus' | 'error' = 'default'
  ): React.CSSProperties => {
    const baseStyle = designSystem.components.input.base;
    
    const stateStyles = {
      default: {},
      focus: {
        borderColor: designSystem.colors.primary[500],
        boxShadow: `0 0 0 3px ${designSystem.colors.primary[200]}`,
      },
      error: {
        borderColor: designSystem.colors.semantic.error.main,
        boxShadow: `0 0 0 3px ${designSystem.colors.semantic.error.light}`,
      },
    };
    
    return {
      ...baseStyle,
      ...stateStyles[state],
    } as React.CSSProperties;
  }, []);

  const getPanelStyle = useCallback((
    variant: 'base' | 'elevated' | 'flat' = 'base'
  ): React.CSSProperties => {
    const baseStyle = designSystem.components.panel.base;
    
    if (variant === 'base') {
      return baseStyle as React.CSSProperties;
    }
    
    const variantStyle = designSystem.components.panel.variants[variant as 'elevated' | 'flat'];
    
    return {
      ...baseStyle,
      ...variantStyle,
    } as React.CSSProperties;
  }, []);

  // 애니메이션 관련 함수들
  const getTransition = useCallback((
    properties: string[],
    duration: 'fast' | 'normal' | 'slow' | 'slower' = 'normal'
  ): string => {
    if (theme.reducedMotion) {
      return 'none';
    }
    
    const durationValue = designSystem.animation.duration[duration];
    const easing = designSystem.animation.easing.easeInOut;
    
    return properties
      .map(property => `${property} ${durationValue} ${easing}`)
      .join(', ');
  }, [theme.reducedMotion]);

  const getAnimation = useCallback((
    keyframe: string,
    duration: string = designSystem.animation.duration.normal,
    easing: string = designSystem.animation.easing.easeInOut
  ): string => {
    if (theme.reducedMotion) {
      return 'none';
    }
    
    return `${keyframe} ${duration} ${easing}`;
  }, [theme.reducedMotion]);

  // 반응형 관련 함수들
  const getBreakpoint = useCallback((size: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): string => {
    return designSystem.breakpoints[size];
  }, []);

  // 접근성 관련 함수들
  const getContrastRatio = useCallback((foreground: string, background: string): number => {
    // 간단한 대비비 계산 (실제로는 더 정확한 계산 필요)
    // 여기서는 색상의 명도를 기반으로 간단히 계산
    const getLuminance = (color: string): number => {
      // RGB 값 추출 및 상대적 명도 계산
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(Number);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };
    
    const fgLuminance = getLuminance(foreground);
    const bgLuminance = getLuminance(background);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const ensureWCAGCompliance = useCallback((
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean => {
    const ratio = getContrastRatio(foreground, background);
    const minRatio = level === 'AAA' ? 7 : 4.5;
    return ratio >= minRatio;
  }, [getContrastRatio]);

  // 유틸리티 함수들
  const generateCSS = useCallback((): string => {
    // CSS 변수 생성
    const cssVariables: string[] = [];
    
    // 색상 변수
    Object.entries(designSystem.colors.primary).forEach(([key, value]) => {
      cssVariables.push(`--color-primary-${key}: ${value};`);
    });
    
    // 간격 변수
    Object.entries(designSystem.spacing).forEach(([key, value]) => {
      cssVariables.push(`--spacing-${key}: ${value};`);
    });
    
    // 타이포그래피 변수
    Object.entries(designSystem.typography.fontSize).forEach(([key, value]) => {
      cssVariables.push(`--font-size-${key}: ${value.desktop};`);
    });
    
    return `:root {\n  ${cssVariables.join('\n  ')}\n}`;
  }, []);

  const getThemeVariables = useCallback((): Record<string, string> => {
    const variables: Record<string, string> = {};
    
    // 현재 테마에 따른 색상 변수
    if (theme.mode === 'dark') {
      variables['--bg-primary'] = designSystem.darkMode.colors.background;
      variables['--bg-secondary'] = designSystem.darkMode.colors.surface;
      variables['--text-primary'] = designSystem.darkMode.colors.text.primary;
      variables['--text-secondary'] = designSystem.darkMode.colors.text.secondary;
    } else {
      variables['--bg-primary'] = '#ffffff';
      variables['--bg-secondary'] = designSystem.colors.gray[50];
      variables['--text-primary'] = designSystem.colors.gray[900];
      variables['--text-secondary'] = designSystem.colors.gray[600];
    }
    
    return variables;
  }, [theme.mode]);

  return {
    getColor,
    getSemanticColor,
    getQueueColor,
    getTypography,
    getFontFamily,
    getSpacing,
    getResponsiveSpacing,
    getButtonStyle,
    getInputStyle,
    getPanelStyle,
    getTransition,
    getAnimation,
    getBreakpoint,
    getContrastRatio,
    ensureWCAGCompliance,
    generateCSS,
    getThemeVariables,
  };
};

// 디자인 시스템 상수 내보내기
export { designSystem };
export type { UseDesignSystemReturn, ThemeContext };