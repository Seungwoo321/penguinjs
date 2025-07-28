/**
 * 스타일 유틸리티 함수들
 * 디자인 시스템과 연동되는 스타일 헬퍼 함수들
 */

import { designSystem } from '../theme/designSystem';
import type { CSSProperties } from 'react';

// 클래스 이름 조합 유틸리티
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// CSS 변수 생성 헬퍼
export const createCSSVariable = (name: string, value: string): string => {
  return `--${name}: ${value}`;
};

// CSS 변수 참조 헬퍼
export const getCSSVariable = (name: string): string => {
  return `var(--${name})`;
};

// 반응형 스타일 생성기
export const createResponsiveStyles = (
  mobile: CSSProperties,
  tablet?: CSSProperties,
  desktop?: CSSProperties
): string => {
  const styles: string[] = [];
  
  // 모바일 스타일 (기본)
  if (mobile) {
    const mobileCSS = Object.entries(mobile)
      .map(([key, value]) => `${kebabCase(key)}: ${value}`)
      .join('; ');
    styles.push(mobileCSS);
  }
  
  // 태블릿 스타일
  if (tablet) {
    const tabletCSS = Object.entries(tablet)
      .map(([key, value]) => `${kebabCase(key)}: ${value}`)
      .join('; ');
    styles.push(`@media (min-width: ${designSystem.breakpoints.md}) { ${tabletCSS} }`);
  }
  
  // 데스크톱 스타일
  if (desktop) {
    const desktopCSS = Object.entries(desktop)
      .map(([key, value]) => `${kebabCase(key)}: ${value}`)
      .join('; ');
    styles.push(`@media (min-width: ${designSystem.breakpoints.lg}) { ${desktopCSS} }`);
  }
  
  return styles.join(' ');
};

// 카멜케이스를 케밥케이스로 변환
export const kebabCase = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

// 색상 유틸리티
export const colorUtils = {
  // 16진수 색상을 RGB로 변환
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // RGB를 16진수로 변환
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  },
  
  // 색상 명도 계산
  getLuminance: (color: string): number => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  
  // 대비비 계산 (WCAG 기준)
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = colorUtils.getLuminance(color1);
    const lum2 = colorUtils.getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  // WCAG 준수 확인
  isWCAGCompliant: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
  },
  
  // 색상에 알파 값 추가
  addAlpha: (color: string, alpha: number): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },
  
  // 색상 밝기 조절
  adjustBrightness: (color: string, amount: number): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    const adjust = (c: number) => Math.max(0, Math.min(255, c + amount));
    
    return colorUtils.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    );
  },
};

// 그림자 유틸리티
export const shadowUtils = {
  // 여러 그림자 조합
  combine: (...shadows: string[]): string => {
    return shadows.filter(Boolean).join(', ');
  },
  
  // 커스텀 그림자 생성
  create: (
    x: number,
    y: number,
    blur: number,
    spread: number = 0,
    color: string = 'rgba(0, 0, 0, 0.1)'
  ): string => {
    return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  },
  
  // 엘리베이션 기반 그림자
  elevation: (level: number): string => {
    const shadows = {
      0: 'none',
      1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
      4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
      5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
    };
    
    return shadows[level as keyof typeof shadows] || shadows[1];
  },
};

// 애니메이션 유틸리티
export const animationUtils = {
  // 트랜지션 생성
  transition: (
    properties: string | string[],
    duration: string = designSystem.animation.duration.normal,
    easing: string = designSystem.animation.easing.easeInOut,
    delay: string = '0ms'
  ): string => {
    const props = Array.isArray(properties) ? properties : [properties];
    return props
      .map(prop => `${prop} ${duration} ${easing} ${delay}`)
      .join(', ');
  },
  
  // 키프레임 애니메이션 생성
  keyframes: (name: string, frames: Record<string, CSSProperties>): string => {
    const frameEntries = Object.entries(frames)
      .map(([key, styles]) => {
        const styleStr = Object.entries(styles)
          .map(([prop, value]) => `${kebabCase(prop)}: ${value}`)
          .join('; ');
        return `${key} { ${styleStr} }`;
      })
      .join(' ');
    
    return `@keyframes ${name} { ${frameEntries} }`;
  },
  
  // 페이드 인 애니메이션
  fadeIn: (duration: string = designSystem.animation.duration.normal): CSSProperties => ({
    opacity: 0,
    animation: `fadeIn ${duration} forwards`,
  }),
  
  // 슬라이드 인 애니메이션
  slideIn: (
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    duration: string = designSystem.animation.duration.normal
  ): CSSProperties => {
    const transforms = {
      up: 'translateY(100%)',
      down: 'translateY(-100%)',
      left: 'translateX(100%)',
      right: 'translateX(-100%)',
    };
    
    return {
      transform: transforms[direction],
      animation: `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration} forwards`,
    };
  },
};

// 레이아웃 유틸리티
export const layoutUtils = {
  // Flexbox 유틸리티
  flex: {
    center: (): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    
    between: (): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }),
    
    column: (): CSSProperties => ({
      display: 'flex',
      flexDirection: 'column',
    }),
    
    wrap: (): CSSProperties => ({
      display: 'flex',
      flexWrap: 'wrap',
    }),
  },
  
  // Grid 유틸리티
  grid: {
    auto: (minColumnWidth: string = '250px'): CSSProperties => ({
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`,
      gap: designSystem.spacing[4],
    }),
    
    columns: (count: number): CSSProperties => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: designSystem.spacing[4],
    }),
  },
  
  // 반응형 간격
  responsiveGap: (mobile: string, tablet?: string, desktop?: string): CSSProperties => ({
    gap: mobile,
    [`@media (min-width: ${designSystem.breakpoints.md})`]: {
      gap: tablet || mobile,
    },
    [`@media (min-width: ${designSystem.breakpoints.lg})`]: {
      gap: desktop || tablet || mobile,
    },
  }),
  
  // 종횡비 유지
  aspectRatio: (ratio: string): CSSProperties => ({
    aspectRatio: ratio,
    // 구형 브라우저는 padding-top hack 사용
    position: 'relative',
    paddingTop: `${(1 / parseFloat(ratio)) * 100}%`,
  }),
};

// 텍스트 유틸리티
export const textUtils = {
  // 텍스트 오버플로우 처리
  ellipsis: (lines: number = 1): CSSProperties => {
    if (lines === 1) {
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      };
    }
    
    return {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      lineClamp: lines,
    };
  },
  
  // 반응형 폰트 크기
  responsiveSize: (
    mobile: string,
    tablet?: string,
    desktop?: string
  ): CSSProperties => ({
    fontSize: mobile,
    [`@media (min-width: ${designSystem.breakpoints.md})`]: {
      fontSize: tablet || mobile,
    },
    [`@media (min-width: ${designSystem.breakpoints.lg})`]: {
      fontSize: desktop || tablet || mobile,
    },
  }),
  
  // 읽기 편한 줄 길이
  readableWidth: (): CSSProperties => ({
    maxWidth: '65ch', // 최적 읽기 너비
  }),
};

// 접근성 유틸리티
export const a11yUtils = {
  // 스크린 리더 전용 텍스트
  srOnly: (): CSSProperties => ({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  }),
  
  // 포커스 표시기
  focusRing: (color: string = designSystem.colors.primary[500]): CSSProperties => ({
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
  }),
  
  // 고대비 모드 지원
  highContrast: (styles: CSSProperties): CSSProperties => styles,
  
  // 모션 감소 지원
  reducedMotion: (styles: CSSProperties): CSSProperties => styles,
};

// 성능 최적화 유틸리티
export const performanceUtils = {
  // GPU 가속 활성화
  gpuAcceleration: (): CSSProperties => ({
    transform: 'translateZ(0)',
    willChange: 'transform',
  }),
  
  // 레이어 분리
  layerSeparation: (): CSSProperties => ({
    isolation: 'isolate',
  }),
  
  // 애니메이션 최적화
  optimizeAnimation: (): CSSProperties => ({
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  }),
};

// 통합 스타일 생성기
export const createStyles = (styles: Record<string, CSSProperties>): Record<string, string> => {
  const result: Record<string, string> = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    const cssText = Object.entries(value)
      .map(([prop, val]) => `${kebabCase(prop)}: ${val}`)
      .join('; ');
    result[key] = cssText;
  });
  
  return result;
};

// 디자인 토큰 접근 헬퍼
export const tokens = {
  color: (path: string): string => {
    const keys = path.split('.');
    let current: any = designSystem.colors;
    
    for (const key of keys) {
      if (current && current[key]) {
        current = current[key];
      } else {
        console.warn(`Color token not found: ${path}`);
        return '#000000';
      }
    }
    
    return typeof current === 'string' ? current : '#000000';
  },
  
  spacing: (key: keyof typeof designSystem.spacing): string => {
    return designSystem.spacing[key];
  },
  
  fontSize: (key: keyof typeof designSystem.typography.fontSize, breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string => {
    return designSystem.typography.fontSize[key][breakpoint];
  },
  
  shadow: (key: keyof typeof designSystem.boxShadow): string => {
    return designSystem.boxShadow[key];
  },
  
  radius: (key: keyof typeof designSystem.borderRadius): string => {
    return designSystem.borderRadius[key];
  },
};