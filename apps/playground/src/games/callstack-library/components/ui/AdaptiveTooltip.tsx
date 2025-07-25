/**
 * 적응형 툴팁 컴포넌트
 * 텍스트 오버플로우 시 자동으로 표시되는 접근성 친화적 툴팁
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveTooltipProps {
  content: string;
  children: React.ReactElement;
  show?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth?: number;
  delay?: number;
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * 적응형 툴팁 컴포넌트
 */
export const AdaptiveTooltip: React.FC<AdaptiveTooltipProps> = ({
  content,
  children,
  show = false,
  placement = 'auto',
  maxWidth = 300,
  delay = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 툴팁 위치 계산
  const calculatePosition = (): TooltipPosition => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { top: 0, left: 0, placement: 'top' };
    }

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const spacing = 8; // 툴팁과 요소 간 간격

    // 자동 배치 로직
    let finalPlacement = placement;
    if (placement === 'auto') {
      // 공간이 가장 넓은 곳을 선택
      const spaces = {
        top: trigger.top,
        bottom: viewport.height - trigger.bottom,
        left: trigger.left,
        right: viewport.width - trigger.right
      };
      
      finalPlacement = Object.entries(spaces).reduce((max, [key, value]) => 
        value > spaces[max] ? key as any : max, 'top'
      );
    }

    let top = 0;
    let left = 0;

    switch (finalPlacement) {
      case 'top':
        top = trigger.top - tooltip.height - spacing;
        left = trigger.left + (trigger.width - tooltip.width) / 2;
        break;
      case 'bottom':
        top = trigger.bottom + spacing;
        left = trigger.left + (trigger.width - tooltip.width) / 2;
        break;
      case 'left':
        top = trigger.top + (trigger.height - tooltip.height) / 2;
        left = trigger.left - tooltip.width - spacing;
        break;
      case 'right':
        top = trigger.top + (trigger.height - tooltip.height) / 2;
        left = trigger.right + spacing;
        break;
    }

    // 뷰포트 경계 조정
    left = Math.max(spacing, Math.min(left, viewport.width - tooltip.width - spacing));
    top = Math.max(spacing, Math.min(top, viewport.height - tooltip.height - spacing));

    return { top, left, placement: finalPlacement };
  };

  // 마우스 이벤트 핸들러
  const handleMouseEnter = () => {
    if (!show) return;
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // 키보드 이벤트 핸들러 (접근성)
  const handleFocus = () => {
    if (!show) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  // 위치 업데이트
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
  }, [isVisible, content]);

  // 스크롤 시 툴팁 숨김
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('scroll', handleScroll, true);
      return () => document.removeEventListener('scroll', handleScroll, true);
    }
  }, [isVisible]);

  // cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // children에 이벤트 핸들러 추가
  const childWithHandlers = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'aria-describedby': isVisible ? 'adaptive-tooltip' : undefined
  });

  return (
    <>
      {childWithHandlers}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              id="adaptive-tooltip"
              role="tooltip"
              className={`
                fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg
                pointer-events-none select-none
                dark:bg-gray-700 dark:text-gray-200
                ${className}
              `}
              style={{
                top: position.top,
                left: position.left,
                maxWidth: `${maxWidth}px`,
                wordWrap: 'break-word'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.15,
                ease: 'easeOut'
              }}
            >
              {content}
              
              {/* 화살표 */}
              <div
                className={`
                  absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45
                  ${position.placement === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : ''}
                  ${position.placement === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' : ''}
                  ${position.placement === 'left' ? '-right-1 top-1/2 -translate-y-1/2' : ''}
                  ${position.placement === 'right' ? '-left-1 top-1/2 -translate-y-1/2' : ''}
                `}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

/**
 * 텍스트 오버플로우 전용 툴팁 래퍼
 */
interface TextOverflowTooltipProps {
  text: string;
  children: React.ReactElement;
  isOverflowing: boolean;
  maxWidth?: number;
}

export const TextOverflowTooltip: React.FC<TextOverflowTooltipProps> = ({
  text,
  children,
  isOverflowing,
  maxWidth = 300
}) => {
  return (
    <AdaptiveTooltip
      content={text}
      show={isOverflowing}
      placement="auto"
      maxWidth={maxWidth}
      delay={300}
    >
      {children}
    </AdaptiveTooltip>
  );
};

/**
 * 함수명 전용 툴팁
 */
export const FunctionNameTooltip: React.FC<TextOverflowTooltipProps> = (props) => {
  return (
    <TextOverflowTooltip
      {...props}
      maxWidth={250}
    />
  );
};