/**
 * 접근성을 만족하는 색상 관리 훅
 * WCAG 2.1 AA 기준을 자동으로 만족하는 색상 시스템
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getContrastRatio, 
  checkWCAGCompliance, 
  getAccessibleTextColor,
  adjustColorForAccessibility,
  WCAGLevels,
  getColorDebugInfo,
  type AccessibleColorPair
} from '../utils/colorUtils';

interface AccessibleColorConfig {
  enforceWCAG?: boolean;
  preferredLevel?: keyof typeof WCAGLevels;
  debugMode?: boolean;
  autoAdjust?: boolean;
}

interface AccessibleColorTheme {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    disabled: string;
  };
  accent: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  interactive: {
    default: string;
    hover: string;
    active: string;
    focus: string;
    disabled: string;
  };
}

interface ColorValidationResult {
  isValid: boolean;
  ratio: number;
  level: string;
  recommendation?: string;
}

interface UseAccessibleColorsResult {
  theme: AccessibleColorTheme;
  validateColors: (fg: string, bg: string) => ColorValidationResult;
  getTextColor: (backgroundColor: string) => string;
  adjustColor: (color: string, backgroundColor: string) => string;
  debugInfo: Record<string, any>;
  isValidCombination: (fg: string, bg: string) => boolean;
}

/**
 * 접근성 색상 관리 훅
 */
export const useAccessibleColors = (
  isDarkMode: boolean = false,
  config: AccessibleColorConfig = {}
): UseAccessibleColorsResult => {
  const {
    enforceWCAG = true,
    preferredLevel = 'AA_NORMAL',
    debugMode = false,
    autoAdjust = true
  } = config;

  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  // 기본 색상 팔레트 (WCAG 호환)
  const baseColors = useMemo(() => {
    if (isDarkMode) {
      return {
        backgrounds: {
          primary: '#1a1a1a',      // 매우 어두운 회색
          secondary: '#2d2d2d',    // 어두운 회색
          tertiary: '#404040'      // 중간 어두운 회색
        },
        accents: {
          primary: '#60a5fa',      // 밝은 파란색
          secondary: '#a78bfa',    // 밝은 보라색
          success: '#4ade80',      // 밝은 초록색
          warning: '#fbbf24',      // 밝은 주황색
          error: '#f87171',       // 밝은 빨간색
          info: '#38bdf8'         // 밝은 하늘색
        }
      };
    } else {
      return {
        backgrounds: {
          primary: '#ffffff',      // 흰색
          secondary: '#f8fafc',    // 매우 밝은 회색
          tertiary: '#e2e8f0'      // 밝은 회색
        },
        accents: {
          primary: '#1e40af',      // 어두운 파란색
          secondary: '#7c3aed',    // 어두운 보라색
          success: '#15803d',      // 어두운 초록색
          warning: '#d97706',      // 어두운 주황색
          error: '#dc2626',       // 어두운 빨간색
          info: '#0284c7'         // 어두운 하늘색
        }
      };
    }
  }, [isDarkMode]);

  // 접근성 텍스트 색상 생성
  const generateTextColors = useCallback((backgrounds: any) => {
    const primary = getAccessibleTextColor(backgrounds.primary, preferredLevel);
    const secondary = getAccessibleTextColor(backgrounds.secondary, preferredLevel);
    
    // 보조 텍스트는 투명도 적용 후에도 접근성을 만족하도록 조정
    let secondaryText = isDarkMode ? '#a1a1aa' : '#64748b';
    if (enforceWCAG) {
      secondaryText = adjustColorForAccessibility(
        secondaryText, 
        backgrounds.primary, 
        preferredLevel
      );
    }

    return {
      primary,
      secondary: secondaryText,
      inverse: isDarkMode ? '#000000' : '#ffffff',
      disabled: isDarkMode ? '#525252' : '#9ca3af'
    };
  }, [isDarkMode, preferredLevel, enforceWCAG]);

  // 상호작용 색상 생성
  const generateInteractiveColors = useCallback((accent: string, background: string) => {
    const base = enforceWCAG 
      ? adjustColorForAccessibility(accent, background, preferredLevel)
      : accent;
    
    return {
      default: base,
      hover: adjustColorBrightness(base, isDarkMode ? 10 : -10),
      active: adjustColorBrightness(base, isDarkMode ? 20 : -20),
      focus: base,
      disabled: isDarkMode ? '#404040' : '#d1d5db'
    };
  }, [isDarkMode, enforceWCAG, preferredLevel]);

  // 접근성 테마 생성 - theme을 먼저 선언
  const theme = useMemo((): AccessibleColorTheme => {
    const { backgrounds, accents } = baseColors;
    
    const textColors = generateTextColors(backgrounds);
    const interactiveColors = generateInteractiveColors(accents.primary, backgrounds.primary);

    // 액센트 색상들도 배경과의 대비 확인
    const processedAccents = Object.fromEntries(
      Object.entries(accents).map(([key, color]) => [
        key,
        enforceWCAG 
          ? adjustColorForAccessibility(color, backgrounds.primary, preferredLevel)
          : color
      ])
    ) as AccessibleColorTheme['accent'];

    return {
      background: backgrounds,
      text: textColors,
      accent: processedAccents,
      interactive: interactiveColors
    };
  }, [baseColors, generateTextColors, generateInteractiveColors, enforceWCAG, preferredLevel]);

  // 색상 검증 함수
  const validateColors = useCallback((foreground: string, background: string): ColorValidationResult => {
    const ratio = getContrastRatio(foreground, background);
    const isValid = ratio >= WCAGLevels[preferredLevel];
    
    let level = '';
    if (ratio >= WCAGLevels.AAA_NORMAL) level = 'AAA';
    else if (ratio >= WCAGLevels.AA_NORMAL) level = 'AA';
    else if (ratio >= WCAGLevels.AA_LARGE) level = 'AA (Large)';
    else level = 'Fail';

    return {
      isValid,
      ratio: Number(ratio.toFixed(2)),
      level,
      recommendation: !isValid 
        ? `대비비를 ${WCAGLevels[preferredLevel]}:1 이상으로 높여주세요.`
        : undefined
    };
  }, [preferredLevel]);

  // 텍스트 색상 자동 선택
  const getTextColor = useCallback((backgroundColor: string): string => {
    return getAccessibleTextColor(backgroundColor, preferredLevel);
  }, [preferredLevel]);

  // 색상 자동 조정
  const adjustColor = useCallback((color: string, backgroundColor: string): string => {
    if (!enforceWCAG) return color;
    return adjustColorForAccessibility(color, backgroundColor, preferredLevel);
  }, [enforceWCAG, preferredLevel]);

  // 색상 조합 유효성 검사
  const isValidCombination = useCallback((foreground: string, background: string): boolean => {
    return checkWCAGCompliance(foreground, background, preferredLevel);
  }, [preferredLevel]);

  // 디버그 정보 수집
  useEffect(() => {
    if (!debugMode) return;

    const info: Record<string, any> = {
      isDarkMode,
      preferredLevel,
      colorValidations: {}
    };

    // 주요 색상 조합들의 접근성 검증
    const combinations = [
      ['primary-text-on-primary-bg', theme.text.primary, theme.background.primary],
      ['secondary-text-on-primary-bg', theme.text.secondary, theme.background.primary],
      ['primary-accent-on-primary-bg', theme.accent.primary, theme.background.primary],
      ['error-on-primary-bg', theme.accent.error, theme.background.primary],
      ['warning-on-primary-bg', theme.accent.warning, theme.background.primary],
    ];

    combinations.forEach(([name, fg, bg]) => {
      info.colorValidations[name] = getColorDebugInfo(fg, bg);
    });

    setDebugInfo(info);
  }, [theme, debugMode, isDarkMode, preferredLevel]);

  return {
    theme,
    validateColors,
    getTextColor,
    adjustColor,
    debugInfo,
    isValidCombination
  };
};

/**
 * 색상 밝기 조정 헬퍼 함수
 */
const adjustColorBrightness = (color: string, amount: number): string => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;

  const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount));
  const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount));
  const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount));

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * 테마별 접근성 색상 매핑
 */
export const useThemeAccessibleColors = (themeName: string, isDarkMode: boolean) => {
  const accessibleColors = useAccessibleColors(isDarkMode, {
    enforceWCAG: true,
    preferredLevel: 'AA_NORMAL',
    autoAdjust: true
  });

  // 도서관 테마별 특화 색상
  const libraryColors = useMemo(() => {
    const base = accessibleColors.theme;
    
    return {
      callstack: {
        background: isDarkMode ? '#1e293b' : '#f1f5f9',
        text: accessibleColors.getTextColor(isDarkMode ? '#1e293b' : '#f1f5f9'),
        accent: isDarkMode ? '#60a5fa' : '#1e40af',
        border: isDarkMode ? '#334155' : '#cbd5e1'
      },
      microtask: {
        background: isDarkMode ? '#1e3a3a' : '#ecfdf5',
        text: accessibleColors.getTextColor(isDarkMode ? '#1e3a3a' : '#ecfdf5'),
        accent: isDarkMode ? '#4ade80' : '#15803d',
        border: isDarkMode ? '#2d5555' : '#a7f3d0'
      },
      macrotask: {
        background: isDarkMode ? '#3a2e1e' : '#fef3c7',
        text: accessibleColors.getTextColor(isDarkMode ? '#3a2e1e' : '#fef3c7'),
        accent: isDarkMode ? '#fbbf24' : '#d97706',
        border: isDarkMode ? '#554020' : '#fed7aa'
      }
    };
  }, [accessibleColors, isDarkMode]);

  return {
    ...accessibleColors,
    libraryColors
  };
};