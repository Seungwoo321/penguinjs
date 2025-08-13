/**
 * 터치 친화적 버튼 컴포넌트
 * 모바일과 데스크톱 모두에서 최적화된 상호작용 제공
 */

import React, { forwardRef, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useTouchFriendly } from '@/games/callstack-library/hooks/useMobileFirst';
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync';

// 색상 밝기 조정 함수
const adjustColorBrightness = (color: string, amount: number): string => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  
  const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount));
  const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount));
  const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount));
  
  return `rgb(${r}, ${g}, ${b})`;
};

interface TouchFriendlyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  motionProps?: MotionProps;
  themeColor?: 'callstack' | 'microtask' | 'macrotask';
  children: React.ReactNode;
}

/**
 * 터치 친화적 버튼 컴포넌트
 */
export const TouchFriendlyButton = forwardRef<HTMLButtonElement, TouchFriendlyButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  motionProps = {},
  themeColor = 'callstack',
  disabled,
  children,
  className = '',
  onClick,
  ...props
}, ref) => {
  const { getTouchStyles, viewport } = useTouchFriendly();
  const [isPressed, setIsPressed] = useState(false);
  const isDarkMode = useDarkModeDetection();

  // 사이즈별 기본 크기
  const baseSizes = {
    sm: 32,
    md: 40,
    lg: 48
  };

  // 터치 최적화된 스타일
  const touchStyles = getTouchStyles(baseSizes[size]);

  // 테마별 색상
  const getVariantStyles = () => {
    const baseColors = {
      background: `rgb(var(--game-callstack-${themeColor}-main))`,
      text: `rgb(var(--game-callstack-${themeColor}-text-primary))`,
      border: `rgb(var(--game-callstack-${themeColor}-border))`,
      hover: `rgb(var(--game-callstack-${themeColor}-hover))`,
      active: `rgb(var(--game-callstack-${themeColor}-button))`
    };

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: baseColors.active,
          color: `rgb(var(--game-callstack-${themeColor}-text-contrast))`,
          border: `1px solid ${baseColors.border}`,
          '&:hover': {
            backgroundColor: baseColors.hover,
            transform: 'translateY(-1px)',
            boxShadow: 'var(--game-callstack-library-shadow-button)'
          },
          '&:active': {
            backgroundColor: baseColors.active,
            transform: 'translateY(0)',
            boxShadow: 'none'
          }
        };

      case 'secondary':
        return {
          backgroundColor: baseColors.background,
          color: baseColors.text,
          border: `1px solid ${baseColors.border}`,
          '&:hover': {
            backgroundColor: baseColors.hover,
            borderColor: baseColors.active
          },
          '&:active': {
            backgroundColor: baseColors.active,
            color: `rgb(var(--game-callstack-${themeColor}-text-contrast))`
          }
        };

      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: baseColors.text,
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: baseColors.background,
            borderColor: baseColors.border
          },
          '&:active': {
            backgroundColor: baseColors.hover
          }
        };

      case 'danger':
        return {
          backgroundColor: 'rgb(var(--game-callstack-library-overdue))',
          color: 'rgb(255, 255, 255)',  // 흰색은 테마와 무관하게 사용
          border: '1px solid rgb(var(--game-callstack-library-overdue))',
          '&:hover': {
            backgroundColor: adjustColorBrightness('rgb(var(--game-callstack-library-overdue))', isDarkMode ? 20 : -20),
            transform: 'translateY(-1px)'
          },
          '&:active': {
            backgroundColor: adjustColorBrightness('rgb(var(--game-callstack-library-overdue))', isDarkMode ? 30 : -30),
            transform: 'translateY(0)'
          }
        };

      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  // 비활성화 스타일
  const disabledStyles = disabled || loading ? {
    backgroundColor: 'rgb(var(--game-callstack-queue-bg-main))',
    color: 'rgb(var(--game-callstack-queue-secondary))',
    borderColor: 'rgb(var(--game-callstack-queue-border-light))',
    cursor: 'not-allowed',
    opacity: 0.6
  } : {};

  // 최종 스타일
  const buttonStyles: React.CSSProperties = {
    ...touchStyles,
    ...variantStyles,
    ...disabledStyles,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--game-callstack-library-radius-button)',
    fontWeight: '500',
    fontSize: size === 'sm' ? '14px' : size === 'lg' ? '16px' : '15px',
    lineHeight: '1.2',
    textAlign: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'all 0.15s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    outline: 'none'
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = () => {
    if (viewport.isTouchDevice && !disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    if (viewport.isTouchDevice) {
      setIsPressed(false);
    }
  };

  // 클릭 핸들러 (터치와 마우스 모두 대응)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    // 햅틱 피드백 (지원되는 경우)
    if (viewport.isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    onClick?.(event);
  };

  // 모션 설정
  const motionConfig = {
    whileTap: viewport.isTouchDevice 
      ? { scale: 0.98 }
      : { scale: 0.95 },
    whileHover: viewport.hasHover && !disabled && !loading
      ? { y: -1 }
      : undefined,
    transition: { duration: 0.1 },
    ...motionProps
  };

  // framer motion과 충돌하는 props 분리
  const { 
    onAnimationStart, 
    onAnimationEnd, 
    onDragStart,
    onDragEnd,
    onDrag,
    onDragEnter,
    onDragExit,
    onDragLeave,
    onDragOver,
    onDrop,
    ...safeProps 
  } = props;
  
  return (
    <motion.button
      ref={ref}
      style={buttonStyles}
      className={`touch-friendly-button ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-pressed={isPressed}
      aria-disabled={disabled || loading}
      {...motionConfig}
      {...safeProps}
    >
      {/* 로딩 인디케이터 */}
      {loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: 'inherit',
            borderRadius: 'inherit'
          }}
        >
          <LoadingSpinner size={size} />
        </div>
      )}
      
      {/* 버튼 콘텐츠 */}
      <div 
        className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}
        style={{ transition: 'opacity 0.15s ease-in-out' }}
      >
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        <span className="flex-1 min-w-0">
          {children}
        </span>
        
        {rightIcon && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </div>
      
      {/* 리플 이펙트 (터치 피드백) */}
      {viewport.isTouchDevice && isPressed && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            borderRadius: 'inherit',
            animation: 'ripple 0.3s ease-out'
          }}
        />
      )}
    </motion.button>
  );
});

TouchFriendlyButton.displayName = 'TouchFriendlyButton';

/**
 * 로딩 스피너 컴포넌트
 */
interface LoadingSpinnerProps {
  size: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size }) => {
  const spinnerSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 16;
  
  return (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
};

/**
 * 버튼 그룹 컴포넌트
 */
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  className = ''
}) => {
  const { viewport } = useTouchFriendly();
  
  const spacingMap = {
    tight: '4px',
    normal: '8px',
    loose: '12px'
  };

  const groupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    gap: spacingMap[spacing],
    // 모바일에서는 간격을 조금 더 넓게
    ...(viewport.isTouchDevice && {
      gap: orientation === 'vertical' ? '12px' : '8px'
    })
  };

  return (
    <div 
      className={`button-group ${className}`}
      style={groupStyles}
      role="group"
    >
      {children}
    </div>
  );
};

/**
 * CSS 애니메이션 정의 (전역 스타일에 추가 필요)
 */
export const buttonAnimationCSS = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes ripple {
    to {
      opacity: 0;
      transform: scale(2);
    }
  }
  
  .touch-friendly-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  
  @media (hover: hover) {
    .touch-friendly-button:hover {
      transition: all 0.15s ease-in-out;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .touch-friendly-button,
    .touch-friendly-button * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;