/**
 * 접근성이 강화된 버튼 컴포넌트
 * WCAG 2.1 AA 준수, 키보드 네비게이션 및 스크린 리더 지원
 */

import React, { forwardRef, useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@penguinjs/ui';
import { useTouchFriendly } from '@/games/callstack-library/hooks/useMobileFirst';
import { 
  AriaAttributes, 
  createAriaAttributes, 
  focusRingStyles,
  isPrefersReducedMotion 
} from '@/games/callstack-library/utils/ariaUtils';
import { useLiveRegion } from '@/games/callstack-library/hooks/useKeyboardNavigation';
import { useDesignTokens } from './DesignSystemProvider';

interface AccessibleButtonProps extends 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  // 기본 속성
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  
  // 아이콘
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // 접근성
  label: string; // 필수 aria-label
  description?: string; // 추가 설명
  announceOnClick?: string; // 클릭 시 스크린 리더 알림
  keyboardShortcut?: string; // 키보드 단축키
  
  // 상태
  pressed?: boolean;
  expanded?: boolean;
  selected?: boolean;
  
  // 핸들러
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  
  // 테마
  themeColor?: 'callstack' | 'microtask' | 'macrotask';
  
  children: React.ReactNode;
}

/**
 * 접근성 버튼 컴포넌트
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  // 기본 속성
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  
  // 아이콘
  leftIcon,
  rightIcon,
  
  // 접근성
  label,
  description,
  announceOnClick,
  keyboardShortcut,
  role = 'button',
  
  // 상태
  pressed,
  expanded,
  selected,
  
  // 핸들러
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  
  // 테마
  themeColor = 'callstack',
  
  // 기타
  className,
  children,
  ...ariaProps
}, ref) => {
  const designTokens = useDesignTokens();
  const { viewport, getTouchStyles } = useTouchFriendly();
  const announce = useLiveRegion('polite');
  
  const [hasFocus, setHasFocus] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const prefersReducedMotion = isPrefersReducedMotion();
  
  // 내부 ref (외부 ref와 병합)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mergedRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // 디자인 시스템 기반 크기별 스타일 (메모이제이션)
  const sizeStyles = useMemo(() => ({
    sm: {
      minHeight: 32,
      padding: `${designTokens.getSpacing(2)} ${designTokens.getSpacing(3)}`,
      fontSize: designTokens.getTypography('sm').fontSize,
      iconSize: 'w-4 h-4'
    },
    md: {
      minHeight: 40,
      padding: `${designTokens.getSpacing(3)} ${designTokens.getSpacing(4)}`, 
      fontSize: designTokens.getTypography('base').fontSize,
      iconSize: 'w-5 h-5'
    },
    lg: {
      minHeight: 48,
      padding: `${designTokens.getSpacing(4)} ${designTokens.getSpacing(6)}`,
      fontSize: designTokens.getTypography('lg').fontSize,
      iconSize: 'w-6 h-6'
    }
  }), [designTokens, size]);

  const currentSize = sizeStyles[size];
  const touchStyles = getTouchStyles(currentSize.minHeight);

  // 디자인 시스템 기반 변형별 스타일 (메모이제이션)
  const variantStyles = useMemo((): React.CSSProperties => {
    // 디자인 시스템의 기본 스타일 사용
    const baseStyle = designTokens.getButtonStyle(variant, size);
    
    // CSS 변수 기반 색상 매핑
    const colors = {
      text: 'rgb(var(--text-primary))',
      background: `rgb(var(--game-callstack-queue-${themeColor}))`,
      border: `rgb(var(--game-callstack-queue-${themeColor}))`,
      hover: `rgba(var(--game-callstack-queue-${themeColor}), 0.8)`,
      active: `rgb(var(--game-callstack-button-primary))`
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: designTokens.getSemanticColor('info', 'main'),
          color: designTokens.getSemanticColor('info', 'contrast'),
          border: `2px solid ${colors.border}`
        };

      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: `rgb(var(--game-callstack-queue-${themeColor}-light))`,
          color: colors.text,
          border: `2px solid ${colors.border}`
        };

      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: colors.text,
          border: '2px solid transparent'
        };

      case 'danger':
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: '2px solid #b91c1c'
        };

      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: colors.text,
          border: 'none',
          textDecoration: 'underline',
          padding: 0,
          minHeight: 'auto'
        };

      default:
        return {};
    }
  }, [variant, size, themeColor, designTokens]);

  // 포커스 스타일
  const focusStyles: React.CSSProperties = hasFocus ? {
    ...focusRingStyles,
    outlineColor: `rgb(var(--game-callstack-focus-ring))`
  } : {};

  // 비활성화 스타일
  const disabledStyles: React.CSSProperties = (disabled || loading) ? {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none'
  } : {};

  // 최종 스타일 (메모이제이션)
  const buttonStyles: React.CSSProperties = useMemo(() => ({
    ...touchStyles,
    ...variantStyles,
    ...focusStyles,
    ...disabledStyles,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '6px', // 기본 버튼 radius
    fontWeight: '500',
    fontSize: currentSize.fontSize,
    lineHeight: '1.2',
    textAlign: 'center',
    textDecoration: variant === 'outline' ? 'underline' : 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: prefersReducedMotion ? 'none' : 'all 0.15s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    outline: 'none',
    cursor: (disabled || loading) ? 'not-allowed' : 'pointer'
  }), [touchStyles, variantStyles, focusStyles, disabledStyles, fullWidth, currentSize, prefersReducedMotion, disabled, loading]);

  // 클릭 핸들러
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // 햅틱 피드백
    if (viewport.isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // 스크린 리더 알림
    if (announceOnClick) {
      announce(announceOnClick);
    }

    onClick?.(event);
  };

  // 포커스 핸들러
  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    setHasFocus(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    setHasFocus(false);
    setIsActive(false);
    onBlur?.(event);
  };

  // 키보드 핸들러
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Space 또는 Enter 키로 활성화
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setIsActive(true);
      buttonRef.current?.click();
    }

    onKeyDown?.(event);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setIsActive(false);
    }
  };

  // 키보드 단축키 표시 (반복 업데이트 방지)
  useEffect(() => {
    if (!keyboardShortcut || !buttonRef.current) return;

    // 이미 존재하는 툴팁 제거
    const existingTooltip = buttonRef.current.querySelector('.keyboard-shortcut-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('span');
    tooltip.className = 'sr-only keyboard-shortcut-tooltip';
    tooltip.textContent = `키보드 단축키: ${keyboardShortcut}`;
    buttonRef.current.appendChild(tooltip);

    return () => {
      if (buttonRef.current?.contains(tooltip)) {
        buttonRef.current.removeChild(tooltip);
      }
    };
  }, [keyboardShortcut]);

  // ARIA 속성 조합
  const combinedAriaProps: any = {
    ...(createAriaAttributes(role as any, label, {
      'aria-pressed': pressed as any,
      'aria-expanded': expanded as any,
      'aria-selected': selected as any,
      'aria-disabled': (disabled || loading) as any,
      'aria-busy': loading as any,
      ...(ariaProps as any)
    }) as any)
  };

  if (description) {
    combinedAriaProps['aria-describedby'] = `${label}-description`;
  }

  return (
    <>
      <motion.button
        ref={mergedRef}
        type="button"
        style={buttonStyles}
        className={cn(
          'accessible-button',
          `accessible-button--${variant}`,
          `accessible-button--${size}`,
          {
            'accessible-button--loading': loading,
            'accessible-button--disabled': disabled,
            'accessible-button--focused': hasFocus,
            'accessible-button--active': isActive,
            'accessible-button--full-width': fullWidth
          },
          className
        )}
        disabled={disabled}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onMouseLeave={() => setIsActive(false)}
        whileTap={!prefersReducedMotion ? { scale: 0.98 } : undefined}
        {...combinedAriaProps}
      >
        {/* 로딩 스피너 */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'inherit' }}
            >
              <LoadingSpinner size={size} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 버튼 내용 */}
        <span 
          className={cn(
            'flex items-center gap-2',
            loading && 'opacity-0'
          )}
        >
          {leftIcon && (
            <span className={cn('flex-shrink-0', currentSize.iconSize)}>
              {leftIcon}
            </span>
          )}
          
          <span className="flex-1 min-w-0">
            {children}
          </span>
          
          {rightIcon && (
            <span className={cn('flex-shrink-0', currentSize.iconSize)}>
              {rightIcon}
            </span>
          )}
        </span>

        {/* 활성 상태 효과 */}
        {isActive && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            style={{
              backgroundColor: 'currentColor',
              borderRadius: 'inherit'
            }}
          />
        )}
      </motion.button>

      {/* 설명 텍스트 (스크린 리더용) */}
      {description && (
        <span id={`${label}-description`} className="sr-only">
          {description}
        </span>
      )}
    </>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

/**
 * 로딩 스피너 컴포넌트
 */
const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const spinnerSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div
      className="animate-spin"
      style={{
        width: spinnerSizes[size],
        height: spinnerSizes[size],
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%'
      }}
      role="status"
      aria-label="로딩 중"
    />
  );
};

/**
 * 버튼 그룹 컴포넌트 (접근성 개선)
 */
interface AccessibleButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  label: string;
  className?: string;
}

export const AccessibleButtonGroup: React.FC<AccessibleButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  label,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={label}
      aria-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        'gap-2',
        className
      )}
    >
      {children}
    </div>
  );
};