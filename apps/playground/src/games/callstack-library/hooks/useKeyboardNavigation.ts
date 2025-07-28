/**
 * 키보드 네비게이션 훅
 * WCAG 2.1 AA 준수를 위한 완전한 키보드 접근성 지원
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface KeyboardNavigationOptions {
  // 네비게이션 컨테이너
  containerRef?: React.RefObject<HTMLElement>;
  // 포커스 가능한 요소 선택자
  focusableSelector?: string;
  // 네비게이션 방향
  orientation?: 'horizontal' | 'vertical' | 'grid';
  // 순환 네비게이션 허용
  wrapAround?: boolean;
  // 탭 트랩 활성화
  trapFocus?: boolean;
  // 초기 포커스 인덱스
  initialFocusIndex?: number;
  // 포커스 변경 콜백
  onFocusChange?: (index: number, element: HTMLElement) => void;
  // 엔터/스페이스 키 핸들러
  onActivate?: (index: number, element: HTMLElement) => void;
  // Escape 키 핸들러
  onEscape?: () => void;
  // 커스텀 키 핸들러
  customKeyHandlers?: Record<string, (event: KeyboardEvent) => void>;
}

interface KeyboardNavigationResult {
  currentFocusIndex: number;
  focusableElements: HTMLElement[];
  focusNext: () => void;
  focusPrevious: () => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusElement: (index: number) => void;
  resetFocus: () => void;
  enableNavigation: () => void;
  disableNavigation: () => void;
  isNavigationEnabled: boolean;
}

// 기본 포커스 가능 요소들
const DEFAULT_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="option"]'
].join(', ');

/**
 * 키보드 네비게이션 훅
 */
export const useKeyboardNavigation = (
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationResult => {
  const {
    containerRef,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    orientation = 'vertical',
    wrapAround = true,
    trapFocus = false,
    initialFocusIndex = -1,
    onFocusChange,
    onActivate,
    onEscape,
    customKeyHandlers = {}
  } = options;

  const [currentFocusIndex, setCurrentFocusIndex] = useState(initialFocusIndex);
  const [isNavigationEnabled, setIsNavigationEnabled] = useState(true);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  // 포커스 가능한 요소들 업데이트
  const updateFocusableElements = useCallback(() => {
    if (!containerRef?.current) {
      setFocusableElements([]);
      return;
    }

    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(element => {
      // 실제로 포커스 가능한지 확인
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        getComputedStyle(element).visibility !== 'hidden' &&
        getComputedStyle(element).display !== 'none' &&
        !element.hasAttribute('inert')
      );
    });

    setFocusableElements(elements);
  }, [containerRef, focusableSelector]);

  // 요소에 포커스
  const focusElement = useCallback((index: number) => {
    const elements = focusableElements;
    if (elements.length === 0) return;

    // 인덱스 범위 확인
    let targetIndex = index;
    if (wrapAround) {
      targetIndex = ((index % elements.length) + elements.length) % elements.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, elements.length - 1));
    }

    const targetElement = elements[targetIndex];
    if (targetElement) {
      // 이전 요소의 tabindex 복원
      if (lastFocusedElement.current && lastFocusedElement.current !== targetElement) {
        lastFocusedElement.current.setAttribute('tabindex', '-1');
      }

      // 새 요소에 포커스
      targetElement.setAttribute('tabindex', '0');
      targetElement.focus();
      
      // 스크롤 인투 뷰 (부드럽게)
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });

      lastFocusedElement.current = targetElement;
      setCurrentFocusIndex(targetIndex);
      onFocusChange?.(targetIndex, targetElement);
    }
  }, [focusableElements, wrapAround, onFocusChange]);

  // 다음 요소로 포커스
  const focusNext = useCallback(() => {
    if (!isNavigationEnabled) return;
    focusElement(currentFocusIndex + 1);
  }, [currentFocusIndex, focusElement, isNavigationEnabled]);

  // 이전 요소로 포커스
  const focusPrevious = useCallback(() => {
    if (!isNavigationEnabled) return;
    focusElement(currentFocusIndex - 1);
  }, [currentFocusIndex, focusElement, isNavigationEnabled]);

  // 첫 번째 요소로 포커스
  const focusFirst = useCallback(() => {
    if (!isNavigationEnabled) return;
    focusElement(0);
  }, [focusElement, isNavigationEnabled]);

  // 마지막 요소로 포커스
  const focusLast = useCallback(() => {
    if (!isNavigationEnabled) return;
    focusElement(focusableElements.length - 1);
  }, [focusElement, focusableElements.length, isNavigationEnabled]);

  // 포커스 초기화
  const resetFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.setAttribute('tabindex', '-1');
    }
    setCurrentFocusIndex(-1);
    lastFocusedElement.current = null;
  }, []);

  // 네비게이션 활성화/비활성화
  const enableNavigation = useCallback(() => {
    setIsNavigationEnabled(true);
  }, []);

  const disableNavigation = useCallback(() => {
    setIsNavigationEnabled(false);
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isNavigationEnabled || !containerRef?.current) return;

    // 커스텀 키 핸들러 먼저 확인
    if (customKeyHandlers[event.key]) {
      customKeyHandlers[event.key](event);
      return;
    }

    switch (event.key) {
      // 방향키 네비게이션
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          event.preventDefault();
          focusPrevious();
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault();
          focusNext();
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          event.preventDefault();
          focusPrevious();
        }
        break;

      // 홈/엔드 키
      case 'Home':
        event.preventDefault();
        focusFirst();
        break;

      case 'End':
        event.preventDefault();
        focusLast();
        break;

      // 활성화 키
      case 'Enter':
      case ' ':
        if (currentFocusIndex >= 0 && focusableElements[currentFocusIndex]) {
          event.preventDefault();
          onActivate?.(currentFocusIndex, focusableElements[currentFocusIndex]);
        }
        break;

      // Escape 키
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      // Tab 키 (포커스 트랩)
      case 'Tab':
        if (trapFocus && focusableElements.length > 0) {
          event.preventDefault();
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
        }
        break;
    }
  }, [
    isNavigationEnabled,
    containerRef,
    customKeyHandlers,
    orientation,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    currentFocusIndex,
    focusableElements,
    onActivate,
    onEscape,
    trapFocus
  ]);

  // 포커스 이벤트 핸들러
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!containerRef?.current || !isNavigationEnabled) return;

    const target = event.target as HTMLElement;
    const index = focusableElements.indexOf(target);
    
    if (index >= 0) {
      setCurrentFocusIndex(index);
      lastFocusedElement.current = target;
      onFocusChange?.(index, target);
    }
  }, [containerRef, isNavigationEnabled, focusableElements, onFocusChange]);

  // 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocus);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocus);
    };
  }, [containerRef, handleKeyDown, handleFocus]);

  // 포커스 가능한 요소들 업데이트
  useEffect(() => {
    updateFocusableElements();

    // MutationObserver로 DOM 변경 감지
    const container = containerRef?.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      updateFocusableElements();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'aria-disabled']
    });

    return () => {
      observer.disconnect();
    };
  }, [containerRef, updateFocusableElements]);

  // 초기 포커스 설정
  useEffect(() => {
    if (initialFocusIndex >= 0 && focusableElements.length > 0) {
      focusElement(initialFocusIndex);
    }
  }, [initialFocusIndex, focusableElements.length, focusElement]);

  return {
    currentFocusIndex,
    focusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusElement,
    resetFocus,
    enableNavigation,
    disableNavigation,
    isNavigationEnabled
  };
};

/**
 * 포커스 트랩 훅
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  options: {
    enabled?: boolean;
    onEscape?: () => void;
    returnFocusOnDeactivate?: boolean;
  } = {}
) => {
  const {
    enabled = true,
    onEscape,
    returnFocusOnDeactivate = true
  } = options;

  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // 이전 포커스 저장
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // 컨테이너 내 첫 번째 포커스 가능한 요소에 포커스
    const firstFocusable = containerRef.current.querySelector<HTMLElement>(
      DEFAULT_FOCUSABLE_SELECTOR
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // 포커스 트랩 핸들러
    const handleFocusIn = (event: FocusEvent) => {
      if (!containerRef.current) return;

      const target = event.target as HTMLElement;
      if (!containerRef.current.contains(target)) {
        // 포커스가 컨테이너 밖으로 나가면 다시 안으로
        const firstFocusable = containerRef.current.querySelector<HTMLElement>(
          DEFAULT_FOCUSABLE_SELECTOR
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    };

    // Escape 키 핸들러
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);

      // 이전 포커스 복원
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [enabled, containerRef, onEscape, returnFocusOnDeactivate]);
};

/**
 * 라이브 리전 훅 (스크린 리더 알림)
 */
export const useLiveRegion = (
  politeness: 'polite' | 'assertive' = 'polite'
) => {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 라이브 리전 생성
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only'; // 시각적으로 숨김
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(region);
    regionRef.current = region;

    return () => {
      document.body.removeChild(region);
      regionRef.current = null;
    };
  }, [politeness]);

  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      regionRef.current.textContent = message;
      
      // 메시지가 반복되는 경우를 위해 잠시 비운 후 다시 설정
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 100);
    }
  }, []);

  return announce;
};