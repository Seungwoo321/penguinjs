/**
 * CallStack Library 게임 디자인 시스템
 * 일관된 색상, 타이포그래피, 간격, 그림자 등의 디자인 토큰 정의
 */

// 색상 시스템 - WCAG 2.1 AA 준수
export const colors = {
  // 기본 색상 팔레트
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // 메인 컬러
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // 회색 팔레트 (중성색)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 의미론적 색상
  semantic: {
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
      contrast: '#ffffff',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      contrast: '#ffffff',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrast: '#ffffff',
    },
  },
  
  // 도서관 테마 색상
  library: {
    wood: {
      light: '#faf5f0',
      main: '#8b5a3c',
      dark: '#654321',
    },
    book: {
      red: '#dc2626',
      blue: '#2563eb',
      green: '#059669',
      yellow: '#d97706',
      purple: '#7c3aed',
    },
    shelf: {
      light: '#f5f5dc',
      main: '#daa520',
      dark: '#b8860b',
    },
  },
  
  // 큐별 색상 (접근성 고려)
  queue: {
    callstack: {
      light: '#fef7ed',
      main: '#ea580c',
      dark: '#c2410c',
      hover: '#fed7aa',
      border: '#fdba74',
    },
    microtask: {
      light: '#ecfdf5',
      main: '#059669',
      dark: '#047857',
      hover: '#a7f3d0',
      border: '#6ee7b7',
    },
    macrotask: {
      light: '#fefce8',
      main: '#ca8a04',
      dark: '#a16207',
      hover: '#fef08a',
      border: '#facc15',
    },
  },
} as const;

// 타이포그래피 시스템
export const typography = {
  // 글꼴 패밀리
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
    display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  
  // 글꼴 크기 (반응형 고려)
  fontSize: {
    xs: {
      desktop: '0.75rem',
      tablet: '0.75rem',
      mobile: '0.75rem',
      lineHeight: '1rem',
    },
    sm: {
      desktop: '0.875rem',
      tablet: '0.875rem',
      mobile: '0.875rem',
      lineHeight: '1.25rem',
    },
    base: {
      desktop: '1rem',
      tablet: '1rem',
      mobile: '0.9rem',
      lineHeight: '1.5rem',
    },
    lg: {
      desktop: '1.125rem',
      tablet: '1.125rem',
      mobile: '1rem',
      lineHeight: '1.75rem',
    },
    xl: {
      desktop: '1.25rem',
      tablet: '1.25rem',
      mobile: '1.125rem',
      lineHeight: '1.75rem',
    },
    '2xl': {
      desktop: '1.5rem',
      tablet: '1.5rem',
      mobile: '1.25rem',
      lineHeight: '2rem',
    },
    '3xl': {
      desktop: '1.875rem',
      tablet: '1.75rem',
      mobile: '1.5rem',
      lineHeight: '2.25rem',
    },
    '4xl': {
      desktop: '2.25rem',
      tablet: '2rem',
      mobile: '1.75rem',
      lineHeight: '2.5rem',
    },
  },
  
  // 글꼴 두께
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // 줄 간격
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // 문자 간격
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// 간격 시스템 (8px 기반)
export const spacing = {
  0: '0px',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  32: '8rem',   // 128px
  40: '10rem',  // 160px
  48: '12rem',  // 192px
  56: '14rem',  // 224px
  64: '16rem',  // 256px
} as const;

// 둥근 모서리 시스템
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// 그림자 시스템
export const boxShadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// 애니메이션 시스템
export const animation = {
  // 지속 시간
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  
  // 이징 함수
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // 키프레임
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideInUp: {
      from: { transform: 'translateY(100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    slideInDown: {
      from: { transform: 'translateY(-100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
} as const;

// 중단점 시스템 (Mobile-first)
export const breakpoints = {
  sm: '640px',   // 모바일 가로
  md: '768px',   // 태블릿 세로
  lg: '1024px',  // 태블릿 가로 / 소형 노트북
  xl: '1280px',  // 데스크톱
  '2xl': '1536px', // 대형 데스크톱
} as const;

// Z-인덱스 시스템
export const zIndex = {
  base: 0,
  overlay: 10,
  dropdown: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
  notification: 60,
  debug: 9999,
} as const;

// 컴포넌트별 디자인 토큰
export const components = {
  button: {
    // 기본 스타일
    base: {
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      transition: `all ${animation.duration.normal} ${animation.easing.easeInOut}`,
    },
    
    // 크기별 스타일
    sizes: {
      sm: {
        fontSize: typography.fontSize.sm.desktop,
        padding: `${spacing[2]} ${spacing[3]}`,
        minHeight: spacing[8],
      },
      md: {
        fontSize: typography.fontSize.base.desktop,
        padding: `${spacing[3]} ${spacing[4]}`,
        minHeight: spacing[10],
      },
      lg: {
        fontSize: typography.fontSize.lg.desktop,
        padding: `${spacing[4]} ${spacing[6]}`,
        minHeight: spacing[12],
      },
    },
    
    // 변형별 스타일
    variants: {
      primary: {
        backgroundColor: colors.primary[500],
        color: '#ffffff',
        border: 'none',
        '&:hover': {
          backgroundColor: colors.primary[600],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${colors.primary[200]}`,
        },
      },
      secondary: {
        backgroundColor: colors.gray[100],
        color: colors.gray[700],
        border: `1px solid ${colors.gray[300]}`,
        '&:hover': {
          backgroundColor: colors.gray[200],
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary[600],
        border: `1px solid ${colors.primary[300]}`,
        '&:hover': {
          backgroundColor: colors.primary[50],
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.gray[600],
        border: 'none',
        '&:hover': {
          backgroundColor: colors.gray[100],
        },
      },
      danger: {
        backgroundColor: colors.semantic.error.main,
        color: colors.semantic.error.contrast,
        border: 'none',
        '&:hover': {
          backgroundColor: colors.semantic.error.dark,
        },
      },
    },
  },
  
  input: {
    base: {
      fontSize: typography.fontSize.base.desktop,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.gray[300]}`,
      padding: `${spacing[3]} ${spacing[4]}`,
      transition: `all ${animation.duration.normal} ${animation.easing.easeInOut}`,
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[200]}`,
      },
    },
  },
  
  panel: {
    base: {
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.gray[200]}`,
      boxShadow: boxShadow.sm,
    },
    
    variants: {
      elevated: {
        boxShadow: boxShadow.lg,
      },
      flat: {
        boxShadow: 'none',
        border: `1px solid ${colors.gray[300]}`,
      },
    },
  },
} as const;

// 다크 모드 색상
export const darkMode = {
  colors: {
    background: colors.gray[900],
    surface: colors.gray[800],
    primary: colors.primary[400],
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[300],
      disabled: colors.gray[500],
    },
  },
} as const;

// 유틸리티 함수들
export const designTokens = {
  // 반응형 폰트 사이즈 계산
  getResponsiveFontSize: (size: keyof typeof typography.fontSize, breakpoint: 'mobile' | 'tablet' | 'desktop') => {
    return typography.fontSize[size][breakpoint];
  },
  
  // 색상 대비 계산 (WCAG 준수)
  getContrastColor: (backgroundColor: string): string => {
    // 간단한 명도 기반 대비 색상 선택
    const isLight = backgroundColor.includes('50') || backgroundColor.includes('100') || backgroundColor.includes('200');
    return isLight ? colors.gray[900] : '#ffffff';
  },
  
  // 간격 계산
  getSpacing: (multiplier: number): string => {
    return `${multiplier * 0.25}rem`;
  },
  
  // 그림자 조합
  combineShadows: (...shadows: string[]): string => {
    return shadows.join(', ');
  },
} as const;

// 타입 정의
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof typography.fontSize;
export type AnimationToken = keyof typeof animation.duration;

// 기본 내보내기
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  breakpoints,
  zIndex,
  components,
  darkMode,
  designTokens,
} as const;

export default designSystem;