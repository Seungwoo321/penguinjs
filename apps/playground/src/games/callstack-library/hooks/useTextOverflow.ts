/**
 * 텍스트 오버플로우 감지 및 처리 훅
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { checkTextOverflow, TextOverflowConfig, createTextOverflowStyles } from '@/games/callstack-library/utils/textUtils';

interface UseTextOverflowOptions extends TextOverflowConfig {
  text: string;
  dependencies?: any[];
  onOverflow?: (isOverflowing: boolean) => void;
}

interface UseTextOverflowReturn {
  ref: React.RefObject<HTMLElement>;
  isOverflowing: boolean;
  displayText: string;
  showTooltip: boolean;
  styles: React.CSSProperties;
  truncatedText: string;
}

/**
 * 텍스트 오버플로우를 자동으로 감지하고 처리하는 훅
 */
export const useTextOverflow = (options: UseTextOverflowOptions): UseTextOverflowReturn => {
  const {
    text,
    maxLines = 1,
    maxWidth = '100%',
    showTooltip = true,
    breakWord = true,
    dependencies = [],
    onOverflow
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [displayText, setDisplayText] = useState(text);

  // ResizeObserver를 사용한 반응형 텍스트 오버플로우 감지
  const checkOverflow = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    const overflow = checkTextOverflow(element);
    
    setIsOverflowing(overflow);
    onOverflow?.(overflow);

    // 오버플로우가 발생하면 텍스트를 단계적으로 줄임
    if (overflow && maxLines === 1) {
      const containerWidth = element.clientWidth;
      const charWidth = 8; // 대략적인 문자 폭 (px)
      const maxChars = Math.floor(containerWidth / charWidth) - 3; // 말줄임표 고려
      
      if (maxChars > 0 && text.length > maxChars) {
        setDisplayText(text.slice(0, maxChars) + '...');
      } else {
        setDisplayText(text);
      }
    } else {
      setDisplayText(text);
    }
  }, [text, maxLines, onOverflow]);

  // 컨테이너 크기 변화 감지
  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(ref.current);
    
    // 초기 체크
    checkOverflow();

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow, text, ...dependencies]);

  // 텍스트 변경 시 재체크
  useEffect(() => {
    setDisplayText(text);
    checkOverflow();
  }, [text, checkOverflow]);

  const styles = createTextOverflowStyles({
    maxLines,
    maxWidth,
    breakWord
  });

  return {
    ref,
    isOverflowing,
    displayText,
    showTooltip: showTooltip && isOverflowing,
    styles,
    truncatedText: displayText
  };
};

/**
 * 함수명 전용 텍스트 오버플로우 훅
 */
export const useFunctionNameOverflow = (
  functionName: string,
  maxLength: number = 20
): UseTextOverflowReturn => {
  return useTextOverflow({
    text: functionName,
    maxLines: 1,
    maxWidth: '100%',
    showTooltip: true,
    breakWord: false // 함수명은 단어 기준으로 자르지 않음
  });
};

/**
 * 설명 텍스트 전용 다중 라인 오버플로우 훅
 */
export const useDescriptionOverflow = (
  description: string,
  maxLines: number = 3
): UseTextOverflowReturn => {
  return useTextOverflow({
    text: description,
    maxLines,
    maxWidth: '100%',
    showTooltip: true,
    breakWord: true
  });
};

/**
 * 버튼 내 텍스트 오버플로우 훅
 */
export const useButtonTextOverflow = (
  buttonText: string,
  containerWidth?: number
): UseTextOverflowReturn => {
  return useTextOverflow({
    text: buttonText,
    maxLines: 1,
    maxWidth: containerWidth ? `${containerWidth}px` : '100%',
    showTooltip: true,
    breakWord: false
  });
};