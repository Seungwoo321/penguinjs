/**
 * 색상 유틸리티 함수들
 * WCAG 2.1 접근성 가이드라인 준수를 위한 색상 처리
 */

/**
 * RGB 색상을 상대 휘도로 변환
 * @param r Red 값 (0-255)
 * @param g Green 값 (0-255)
 * @param b Blue 값 (0-255)
 * @returns 상대 휘도 (0-1)
 */
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  // sRGB 색공간에서 선형으로 변환
  const toLinear = (value: number): number => {
    const normalized = value / 255;
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // ITU-R BT.709 표준에 따른 가중치
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * 두 색상 간의 대비비 계산 (WCAG 2.1 기준)
 * @param color1 첫 번째 색상 (hex, rgb, rgba)
 * @param color2 두 번째 색상 (hex, rgb, rgba)
 * @returns 대비비 (1:1 ~ 21:1)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format');
  }

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * 색상 문자열을 RGB 값으로 파싱
 * @param color 색상 문자열 (hex, rgb, rgba, hsl)
 * @returns RGB 객체 또는 null
 */
export const parseColor = (color: string): { r: number; g: number; b: number } | null => {
  const cleanColor = color.trim().toLowerCase();

  // Hex 색상 (#fff, #ffffff)
  const hexMatch = cleanColor.match(/^#([a-f\d]{3}|[a-f\d]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    } else {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }

  // RGB/RGBA 색상
  const rgbMatch = cleanColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return { r, g, b };
  }

  // HSL 색상 (기본적인 변환만)
  const hslMatch = cleanColor.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    
    const { r, g, b } = hslToRgb(h, s, l);
    return { r, g, b };
  }

  // 색상명 (기본적인 것들만)
  const colorNames: Record<string, { r: number; g: number; b: number }> = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'transparent': { r: 255, g: 255, b: 255 } // 투명은 흰색으로 처리
  };

  return colorNames[cleanColor] || null;
};

/**
 * HSL을 RGB로 변환
 */
const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 무채색
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * WCAG 기준 검증
 */
export const WCAGLevels = {
  AA_NORMAL: 4.5,    // AA 기준 일반 텍스트
  AA_LARGE: 3,       // AA 기준 큰 텍스트 (18pt+ 또는 14pt+ bold)
  AAA_NORMAL: 7,     // AAA 기준 일반 텍스트
  AAA_LARGE: 4.5     // AAA 기준 큰 텍스트
} as const;

/**
 * WCAG 준수 여부 확인
 */
export const checkWCAGCompliance = (
  foreground: string, 
  background: string, 
  level: keyof typeof WCAGLevels = 'AA_NORMAL'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= WCAGLevels[level];
};

/**
 * 주어진 배경색에 대해 접근성을 만족하는 텍스트 색상 생성
 */
export const getAccessibleTextColor = (
  backgroundColor: string,
  level: keyof typeof WCAGLevels = 'AA_NORMAL'
): string => {
  const requiredRatio = WCAGLevels[level];
  
  // 흰색과 검은색 중 더 좋은 대비를 가지는 색상 선택
  const whiteRatio = getContrastRatio('#ffffff', backgroundColor);
  const blackRatio = getContrastRatio('#000000', backgroundColor);
  
  if (whiteRatio >= requiredRatio) {
    return '#ffffff';
  } else if (blackRatio >= requiredRatio) {
    return '#000000';
  }
  
  // 둘 다 기준을 만족하지 않으면 더 높은 대비를 가지는 색상 반환
  return whiteRatio > blackRatio ? '#ffffff' : '#000000';
};

/**
 * 색상의 밝기를 조정하여 접근성 기준을 만족하도록 함
 */
export const adjustColorForAccessibility = (
  color: string,
  backgroundColor: string,
  level: keyof typeof WCAGLevels = 'AA_NORMAL',
  preference: 'lighter' | 'darker' | 'auto' = 'auto'
): string => {
  const currentRatio = getContrastRatio(color, backgroundColor);
  const requiredRatio = WCAGLevels[level];
  
  if (currentRatio >= requiredRatio) {
    return color; // 이미 기준을 만족함
  }
  
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const { r, g, b } = rgb;
  
  // 밝게 또는 어둡게 조정
  const adjustBrightness = (amount: number): string => {
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    return `rgb(${newR}, ${newG}, ${newB})`;
  };
  
  // 이진 탐색으로 최적값 찾기
  let step = preference === 'lighter' ? 10 : -10;
  if (preference === 'auto') {
    // 배경색의 밝기에 따라 방향 결정
    const bgRgb = parseColor(backgroundColor);
    if (bgRgb) {
      const bgBrightness = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
      step = bgBrightness > 128 ? -10 : 10;
    }
  }
  
  let adjustedColor = color;
  let currentAmount = 0;
  
  // 점진적으로 조정
  for (let i = 0; i < 30; i++) { // 최대 30번 시도 (255를 초과할 수 있도록)
    currentAmount += step;
    const testColor = adjustBrightness(currentAmount);
    const testRatio = getContrastRatio(testColor, backgroundColor);
    
    if (testRatio >= requiredRatio) {
      adjustedColor = testColor;
      break;
    }
    
    // 범위를 벗어나면 반대 방향으로
    // 극단적인 조정이 필요한 경우 방향을 바꿔서 다시 시도
    if (Math.abs(currentAmount) >= 255) {
      step = -step;
      currentAmount = 0;
    }
  }
  
  return adjustedColor;
};

/**
 * 색상 팔레트에서 접근성을 만족하는 조합 생성
 */
export interface AccessibleColorPair {
  background: string;
  foreground: string;
  ratio: number;
  level: string;
}

export const generateAccessiblePalette = (
  baseColors: string[],
  level: keyof typeof WCAGLevels = 'AA_NORMAL'
): AccessibleColorPair[] => {
  const pairs: AccessibleColorPair[] = [];
  const requiredRatio = WCAGLevels[level];
  
  for (const bg of baseColors) {
    for (const fg of baseColors) {
      if (bg === fg) continue;
      
      const ratio = getContrastRatio(fg, bg);
      if (ratio >= requiredRatio) {
        pairs.push({
          background: bg,
          foreground: fg,
          ratio,
          level: ratio >= WCAGLevels.AAA_NORMAL ? 'AAA' : 'AA'
        });
      }
    }
  }
  
  return pairs.sort((a, b) => b.ratio - a.ratio);
};

/**
 * 색상에 투명도 적용 시 접근성 계산
 */
export const getEffectiveColor = (
  foregroundColor: string,
  backgroundColor: string,
  alpha: number
): string => {
  const fg = parseColor(foregroundColor);
  const bg = parseColor(backgroundColor);
  
  if (!fg || !bg) return foregroundColor;
  
  // 알파 블렌딩 공식 적용
  const r = Math.round(fg.r * alpha + bg.r * (1 - alpha));
  const g = Math.round(fg.g * alpha + bg.g * (1 - alpha));
  const b = Math.round(fg.b * alpha + bg.b * (1 - alpha));
  
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * 색상 디버깅 정보 생성
 */
export const getColorDebugInfo = (foreground: string, background: string) => {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    foreground,
    background,
    contrastRatio: Number(ratio.toFixed(2)),
    wcagAA: ratio >= WCAGLevels.AA_NORMAL,
    wcagAALarge: ratio >= WCAGLevels.AA_LARGE,
    wcagAAA: ratio >= WCAGLevels.AAA_NORMAL,
    wcagAAALarge: ratio >= WCAGLevels.AAA_LARGE,
    recommendation: ratio < WCAGLevels.AA_NORMAL 
      ? `대비비가 부족합니다. 최소 ${WCAGLevels.AA_NORMAL}:1이 필요합니다.`
      : ratio >= WCAGLevels.AAA_NORMAL 
        ? '우수한 접근성을 제공합니다.'
        : '기본 접근성 기준을 만족합니다.'
  };
};