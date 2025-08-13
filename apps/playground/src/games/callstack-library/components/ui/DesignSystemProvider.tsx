'use client'

/**
 * 디자인 시스템 Provider
 * 전역 스타일과 테마 변수를 관리하는 컨텍스트 프로바이더
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { designSystem } from '@/games/callstack-library/theme/designSystem';
import { useDesignSystem, type ThemeContext } from '@/games/callstack-library/hooks/useDesignSystem';

// 디자인 시스템 컨텍스트 타입
interface DesignSystemContextType {
  theme: ThemeContext;
  updateTheme: (updates: Partial<ThemeContext>) => void;
  designTokens: ReturnType<typeof useDesignSystem>;
}

// 디자인 시스템 컨텍스트
const DesignSystemContext = createContext<DesignSystemContextType | null>(null);

// Provider Props
interface DesignSystemProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<ThemeContext>;
  injectGlobalStyles?: boolean;
}

/**
 * 디자인 시스템 Provider 컴포넌트
 */
export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  initialTheme,
  injectGlobalStyles = true,
}) => {
  // 테마 상태 관리
  const [theme, setTheme] = useState<ThemeContext>(() => ({
    mode: 'light',
    reducedMotion: false,
    highContrast: false,
    ...initialTheme,
  }));

  // 디자인 토큰 Hook
  const designTokens = useDesignSystem(theme);

  // 테마 업데이트 함수
  const updateTheme = useMemo(
    () => (updates: Partial<ThemeContext>) => {
      setTheme(prev => ({ ...prev, ...updates }));
    },
    []
  );

  // 컨텍스트 값 (얕은 비교로 최적화)
  const contextValue = useMemo(() => ({
    theme,
    updateTheme,
    designTokens,
  }), [theme.mode, theme.reducedMotion, theme.highContrast, updateTheme, designTokens]);

  // 전역 스타일 주입 (메모이제이션으로 최적화)
  const globalStyles = useMemo(() => {
    if (!injectGlobalStyles) return '';
    
    // CSS 변수 생성
    const themeVariables = designTokens.getThemeVariables();
    const cssVariables = Object.entries(themeVariables)
      .map(([key, value]) => `${key}: ${value}`)
      .join(';\n  ');

    return `
      :root {
        ${cssVariables};
        
        /* 기본 색상 팔레트 */
        --color-primary-50: ${designSystem.colors.primary[50]};
        --color-primary-100: ${designSystem.colors.primary[100]};
        --color-primary-200: ${designSystem.colors.primary[200]};
        --color-primary-300: ${designSystem.colors.primary[300]};
        --color-primary-400: ${designSystem.colors.primary[400]};
        --color-primary-500: ${designSystem.colors.primary[500]};
        --color-primary-600: ${designSystem.colors.primary[600]};
        --color-primary-700: ${designSystem.colors.primary[700]};
        --color-primary-800: ${designSystem.colors.primary[800]};
        --color-primary-900: ${designSystem.colors.primary[900]};
        
        /* 큐 색상 */
        --queue-callstack-light: ${designSystem.colors.queue.callstack.light};
        --queue-callstack-main: ${designSystem.colors.queue.callstack.main};
        --queue-callstack-dark: ${designSystem.colors.queue.callstack.dark};
        --queue-callstack-hover: ${designSystem.colors.queue.callstack.hover};
        --queue-callstack-border: ${designSystem.colors.queue.callstack.border};
        
        --queue-microtask-light: ${designSystem.colors.queue.microtask.light};
        --queue-microtask-main: ${designSystem.colors.queue.microtask.main};
        --queue-microtask-dark: ${designSystem.colors.queue.microtask.dark};
        --queue-microtask-hover: ${designSystem.colors.queue.microtask.hover};
        --queue-microtask-border: ${designSystem.colors.queue.microtask.border};
        
        --queue-macrotask-light: ${designSystem.colors.queue.macrotask.light};
        --queue-macrotask-main: ${designSystem.colors.queue.macrotask.main};
        --queue-macrotask-dark: ${designSystem.colors.queue.macrotask.dark};
        --queue-macrotask-hover: ${designSystem.colors.queue.macrotask.hover};
        --queue-macrotask-border: ${designSystem.colors.queue.macrotask.border};
        
        /* 간격 */
        --spacing-1: ${designSystem.spacing[1]};
        --spacing-2: ${designSystem.spacing[2]};
        --spacing-3: ${designSystem.spacing[3]};
        --spacing-4: ${designSystem.spacing[4]};
        --spacing-6: ${designSystem.spacing[6]};
        --spacing-8: ${designSystem.spacing[8]};
        --spacing-12: ${designSystem.spacing[12]};
        --spacing-16: ${designSystem.spacing[16]};
        
        /* 폰트 */
        --font-family-sans: ${designSystem.typography.fontFamily.sans.join(', ')};
        --font-family-mono: ${designSystem.typography.fontFamily.mono.join(', ')};
        --font-family-display: ${designSystem.typography.fontFamily.display.join(', ')};
        
        /* 애니메이션 */
        --duration-fast: ${designSystem.animation.duration.fast};
        --duration-normal: ${designSystem.animation.duration.normal};
        --duration-slow: ${designSystem.animation.duration.slow};
        
        /* 그림자 */
        --shadow-sm: ${designSystem.boxShadow.sm};
        --shadow-base: ${designSystem.boxShadow.base};
        --shadow-md: ${designSystem.boxShadow.md};
        --shadow-lg: ${designSystem.boxShadow.lg};
        
        /* 둥근 모서리 */
        --radius-sm: ${designSystem.borderRadius.sm};
        --radius-base: ${designSystem.borderRadius.base};
        --radius-md: ${designSystem.borderRadius.md};
        --radius-lg: ${designSystem.borderRadius.lg};
        --radius-xl: ${designSystem.borderRadius.xl};
      }
      
      /* 다크 모드 */
      [data-theme="dark"] {
        --bg-primary: ${designSystem.darkMode.colors.background};
        --bg-secondary: ${designSystem.darkMode.colors.surface};
        --text-primary: ${designSystem.darkMode.colors.text.primary};
        --text-secondary: ${designSystem.darkMode.colors.text.secondary};
      }
      
      /* 고대비 모드 */
      [data-high-contrast="true"] {
        --color-primary-500: #000000;
        --text-primary: #000000;
        --bg-primary: #ffffff;
      }
      
      /* 애니메이션 감소 */
      [data-reduced-motion="true"] * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* 기본 스타일 리셋 */
      .callstack-library-reset {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      .callstack-library-reset *,
      .callstack-library-reset *::before,
      .callstack-library-reset *::after {
        box-sizing: inherit;
      }
      
      /* 유틸리티 클래스 */
      .ds-text-primary { color: var(--text-primary); }
      .ds-text-secondary { color: var(--text-secondary); }
      .ds-bg-primary { background-color: var(--bg-primary); }
      .ds-bg-secondary { background-color: var(--bg-secondary); }
      
      .ds-font-sans { font-family: var(--font-family-sans); }
      .ds-font-mono { font-family: var(--font-family-mono); }
      .ds-font-display { font-family: var(--font-family-display); }
      
      .ds-shadow-sm { box-shadow: var(--shadow-sm); }
      .ds-shadow-base { box-shadow: var(--shadow-base); }
      .ds-shadow-md { box-shadow: var(--shadow-md); }
      .ds-shadow-lg { box-shadow: var(--shadow-lg); }
      
      .ds-rounded-sm { border-radius: var(--radius-sm); }
      .ds-rounded-base { border-radius: var(--radius-base); }
      .ds-rounded-md { border-radius: var(--radius-md); }
      .ds-rounded-lg { border-radius: var(--radius-lg); }
      .ds-rounded-xl { border-radius: var(--radius-xl); }
      
      .ds-transition { transition: all var(--duration-normal) ease-in-out; }
      .ds-transition-fast { transition: all var(--duration-fast) ease-in-out; }
      .ds-transition-slow { transition: all var(--duration-slow) ease-in-out; }
      
      /* 컴포넌트 기본 스타일 */
      .ds-button {
        font-family: var(--font-family-sans);
        font-weight: ${designSystem.typography.fontWeight.medium};
        border-radius: var(--radius-md);
        transition: all var(--duration-normal) ease-in-out;
        cursor: pointer;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }
      
      .ds-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      
      .ds-button-sm {
        padding: var(--spacing-2) var(--spacing-3);
        font-size: ${designSystem.typography.fontSize.sm.desktop};
        min-height: var(--spacing-8);
      }
      
      .ds-button-md {
        padding: var(--spacing-3) var(--spacing-4);
        font-size: ${designSystem.typography.fontSize.base.desktop};
        min-height: var(--spacing-12);
      }
      
      .ds-button-lg {
        padding: var(--spacing-4) var(--spacing-6);
        font-size: ${designSystem.typography.fontSize.lg.desktop};
        min-height: var(--spacing-16);
      }
      
      .ds-button-primary {
        background-color: var(--color-primary-500);
        color: white;
      }
      
      .ds-button-primary:hover {
        background-color: var(--color-primary-600);
      }
      
      .ds-button-primary:focus {
        box-shadow: 0 0 0 3px var(--color-primary-200);
      }
      
      .ds-input {
        font-family: var(--font-family-sans);
        border: 1px solid ${designSystem.colors.gray[300]};
        border-radius: var(--radius-md);
        padding: var(--spacing-3) var(--spacing-4);
        transition: all var(--duration-normal) ease-in-out;
        background-color: var(--bg-primary);
        color: var(--text-primary);
      }
      
      .ds-input:focus {
        outline: none;
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 3px var(--color-primary-200);
      }
      
      .ds-panel {
        background-color: var(--bg-primary);
        border-radius: var(--radius-lg);
        border: 1px solid ${designSystem.colors.gray[200]};
        box-shadow: var(--shadow-sm);
      }
      
      /* 접근성 개선 */
      .ds-focus-visible:focus-visible {
        outline: 2px solid var(--color-primary-500);
        outline-offset: 2px;
      }
      
      .ds-screen-reader-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* 반응형 유틸리티 */
      @media (max-width: ${designSystem.breakpoints.sm}) {
        .ds-mobile\\:text-sm { font-size: ${designSystem.typography.fontSize.sm.mobile}; }
        .ds-mobile\\:text-base { font-size: ${designSystem.typography.fontSize.base.mobile}; }
        .ds-mobile\\:text-lg { font-size: ${designSystem.typography.fontSize.lg.mobile}; }
      }
      
      @media (min-width: ${designSystem.breakpoints.md}) {
        .ds-tablet\\:text-sm { font-size: ${designSystem.typography.fontSize.sm.tablet}; }
        .ds-tablet\\:text-base { font-size: ${designSystem.typography.fontSize.base.tablet}; }
        .ds-tablet\\:text-lg { font-size: ${designSystem.typography.fontSize.lg.tablet}; }
      }
      
      @media (min-width: ${designSystem.breakpoints.lg}) {
        .ds-desktop\\:text-sm { font-size: ${designSystem.typography.fontSize.sm.desktop}; }
        .ds-desktop\\:text-base { font-size: ${designSystem.typography.fontSize.base.desktop}; }
        .ds-desktop\\:text-lg { font-size: ${designSystem.typography.fontSize.lg.desktop}; }
      }
    `;
  }, [designTokens, injectGlobalStyles, theme.mode]);

  useEffect(() => {
    if (!injectGlobalStyles || !globalStyles) return;

    const styleId = 'callstack-library-design-system';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // 스타일이 실제로 변경된 경우에만 업데이트
    if (styleElement.textContent !== globalStyles) {
      styleElement.textContent = globalStyles;
    }

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [globalStyles, injectGlobalStyles]);

  // HTML 데이터 속성 설정 (next-themes와 충돌 방지)
  useEffect(() => {
    // next-themes가 이미 테마를 관리하므로 data-theme는 설정하지 않음
    document.documentElement.setAttribute('data-high-contrast', theme.highContrast.toString());
    document.documentElement.setAttribute('data-reduced-motion', theme.reducedMotion.toString());
  }, [theme]);

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
};

/**
 * 디자인 시스템 Hook
 */
export const useDesignSystemContext = (): DesignSystemContextType => {
  const context = useContext(DesignSystemContext);
  
  if (!context) {
    throw new Error('useDesignSystemContext must be used within a DesignSystemProvider');
  }
  
  return context;
};

// 편의 Hook들
export const useTheme = () => {
  const { theme, updateTheme } = useDesignSystemContext();
  return { theme, updateTheme };
};

export const useDesignTokens = () => {
  const { designTokens } = useDesignSystemContext();
  return designTokens;
};

// 컴포넌트 레벨 스타일 Hook
export const useComponentStyles = () => {
  const { designTokens } = useDesignSystemContext();
  
  return {
    button: designTokens.getButtonStyle,
    input: designTokens.getInputStyle,
    panel: designTokens.getPanelStyle,
  };
};

// 타입 내보내기
export type { DesignSystemContextType, DesignSystemProviderProps };