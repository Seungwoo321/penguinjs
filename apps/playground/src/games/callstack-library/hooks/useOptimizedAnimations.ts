/**
 * 콜스택 도서관 게임 전용 최적화된 애니메이션 훅
 * 성능을 고려한 애니메이션 시스템
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react'
import { useCallStackLibraryGameTheme } from './useCallStackLibraryGameTheme'

export interface OptimizedAnimationConfig {
  enableAnimations: boolean
  reducedMotion: boolean
  performanceMode: 'high' | 'balanced' | 'performance'
  maxConcurrentAnimations: number
}

export interface AnimationVariant {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  scale?: number;
  x?: number;
  y?: number;
  opacity?: number;
  rotateX?: number;
  rotateY?: number;
  height?: number | string;
  marginBottom?: number;
  transformOrigin?: string;
  [key: string]: any; // 추가 속성 허용
}

export interface AnimationVariants {
  bookDrop: AnimationVariant
  bookHover: AnimationVariant
  shelfSlide: AnimationVariant
  queueTransition: AnimationVariant
  stackCollapse: AnimationVariant
  stackExpand: AnimationVariant
}

/**
 * 최적화된 애니메이션 훅
 */
export const useOptimizedAnimations = (
  config: Partial<OptimizedAnimationConfig> = {}
): {
  variants: AnimationVariants
  shouldAnimate: (animationType: string) => boolean
  getOptimizedTransition: (baseTransition: any) => any
  createStackAnimation: (itemCount: number, index: number) => AnimationVariant
  getBatchedAnimationDelay: (index: number, maxDelay?: number) => number
  useReducedMotion: boolean
} => {
  const libraryTheme = useCallStackLibraryGameTheme()
  const animationQueueRef = useRef<Set<string>>(new Set())
  
  // 사용자 모션 설정 감지
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const finalConfig: OptimizedAnimationConfig = useMemo(() => ({
    enableAnimations: true,
    reducedMotion: prefersReducedMotion,
    performanceMode: 'balanced',
    maxConcurrentAnimations: 8,
    ...config
  }), [prefersReducedMotion, config])

  // 성능 모드별 애니메이션 설정
  const getPerformanceBasedConfig = useCallback(() => {
    const baseConfig = {
      duration: { fast: 150, normal: 300, slow: 500 },
      easing: { default: 'ease', bounce: 'ease-out', smooth: 'ease-in-out' },
      bookDrop: {
        stiffness: 100,
        damping: 15,
        mass: 1
      },
      timing: {
        bookFlip: 300
      }
    }

    switch (finalConfig.performanceMode) {
      case 'high':
        return {
          stiffness: baseConfig.bookDrop.stiffness * 0.8, // 부드럽게
          damping: baseConfig.bookDrop.damping * 1.2,     // 안정적으로
          mass: baseConfig.bookDrop.mass * 0.9,           // 가볍게
          duration: baseConfig.timing.bookFlip * 1.2      // 길게
        }
      
      case 'performance':
        return {
          stiffness: baseConfig.bookDrop.stiffness * 1.5, // 빠르게
          damping: baseConfig.bookDrop.damping * 0.8,     // 덜 안정적
          mass: baseConfig.bookDrop.mass * 1.2,           // 무겁게
          duration: baseConfig.timing.bookFlip * 0.6      // 짧게
        }
      
      default: // balanced
        return {
          stiffness: baseConfig.bookDrop.stiffness,
          damping: baseConfig.bookDrop.damping,
          mass: baseConfig.bookDrop.mass,
          duration: baseConfig.timing.bookFlip
        }
    }
  }, [finalConfig.performanceMode])

  // 최적화된 애니메이션 변형들
  const variants = useMemo((): AnimationVariants => {
    const perfConfig = getPerformanceBasedConfig()
    
    if (finalConfig.reducedMotion) {
      // 모션 민감 사용자를 위한 단순한 애니메이션
      return {
        bookDrop: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 }
        },
        bookHover: {
          scale: 1.02,
          transition: { duration: 0.1 }
        },
        shelfSlide: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.3 }
        },
        queueTransition: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2 }
        },
        stackCollapse: {
          animate: { height: 0, opacity: 0 },
          transition: { duration: 0.2 }
        },
        stackExpand: {
          animate: { height: 'auto', opacity: 1 },
          transition: { duration: 0.2 }
        }
      }
    }

    return {
      bookDrop: {
        initial: { 
          x: -100, 
          opacity: 0, 
          rotateY: -15,
          scale: 0.8 
        },
        animate: { 
          x: 0, 
          opacity: 1,
          rotateY: 0,
          scale: 1,
          y: 0
        },
        exit: { 
          x: 100, 
          opacity: 0, 
          rotateY: 15,
          scale: 0.8
        },
        transition: {
          type: "spring",
          stiffness: perfConfig.stiffness,
          damping: perfConfig.damping,
          mass: perfConfig.mass
        }
      },
      
      bookHover: {
        scale: 1.05,
        y: -2,
        rotateX: 5,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      },
      
      shelfSlide: {
        initial: { 
          x: -50, 
          opacity: 0,
          scale: 0.95
        },
        animate: { 
          x: 0, 
          opacity: 1,
          scale: 1
        },
        exit: {
          x: 50,
          opacity: 0,
          scale: 0.95
        },
        transition: {
          type: "spring",
          stiffness: perfConfig.stiffness * 0.8,
          damping: perfConfig.damping,
          mass: perfConfig.mass * 1.1
        }
      },
      
      queueTransition: {
        initial: { 
          scale: 0.9, 
          opacity: 0,
          y: 20
        },
        animate: { 
          scale: 1, 
          opacity: 1,
          y: 0
        },
        exit: { 
          scale: 0.9, 
          opacity: 0,
          y: -20
        },
        transition: {
          type: "spring",
          stiffness: perfConfig.stiffness * 1.2,
          damping: perfConfig.damping * 0.9,
          mass: perfConfig.mass * 0.8
        }
      },
      
      stackCollapse: {
        animate: { 
          height: 0, 
          opacity: 0,
          scale: 0.8
        },
        transition: {
          height: { duration: perfConfig.duration * 0.8 },
          opacity: { duration: perfConfig.duration * 0.6 },
          scale: { duration: perfConfig.duration * 0.7 }
        }
      },
      
      stackExpand: {
        animate: { 
          height: 'auto', 
          opacity: 1,
          scale: 1
        },
        transition: {
          height: { duration: perfConfig.duration },
          opacity: { duration: perfConfig.duration * 0.8 },
          scale: { duration: perfConfig.duration * 0.9 }
        }
      }
    }
  }, [finalConfig.reducedMotion, getPerformanceBasedConfig])

  // 애니메이션 실행 여부 결정
  const shouldAnimate = useCallback((animationType: string): boolean => {
    if (!finalConfig.enableAnimations || finalConfig.reducedMotion) {
      return false
    }
    
    // 동시 애니메이션 수 제한
    if (animationQueueRef.current.size >= finalConfig.maxConcurrentAnimations) {
      return false
    }
    
    // 중요한 애니메이션은 항상 허용
    const criticalAnimations = ['bookDrop', 'stackCollapse', 'stackExpand']
    if (criticalAnimations.includes(animationType)) {
      return true
    }
    
    // 성능 모드에 따른 추가 제한
    if (finalConfig.performanceMode === 'performance') {
      const allowedAnimations = ['bookDrop', 'stackCollapse', 'stackExpand']
      return allowedAnimations.includes(animationType)
    }
    
    return true
  }, [finalConfig])

  // 최적화된 트랜지션 생성
  const getOptimizedTransition = useCallback((baseTransition: object) => {
    if (finalConfig.reducedMotion) {
      return { duration: 0.2 }
    }
    
    const perfConfig = getPerformanceBasedConfig()
    
    return {
      ...baseTransition,
      stiffness: perfConfig.stiffness,
      damping: perfConfig.damping,
      mass: perfConfig.mass
    }
  }, [finalConfig.reducedMotion, getPerformanceBasedConfig])

  // 스택 아이템별 최적화된 애니메이션 생성
  const createStackAnimation = useCallback((itemCount: number, index: number) => {
    if (!shouldAnimate('bookDrop')) {
      return { initial: { opacity: 0 }, animate: { opacity: 1 } }
    }

    const delayFactor = Math.min(0.03, 0.1 / itemCount) // 아이템이 많을수록 딜레이 감소
    const staggerDelay = index * delayFactor
    
    return {
      ...variants.bookDrop,
      transition: {
        ...variants.bookDrop.transition,
        delay: staggerDelay
      }
    }
  }, [shouldAnimate, variants.bookDrop])

  // 배치된 애니메이션 딜레이 계산
  const getBatchedAnimationDelay = useCallback((index: number, maxDelay = 0.3): number => {
    if (finalConfig.reducedMotion) return 0
    
    // 성능 모드에 따른 딜레이 조정
    const baseDelay = Math.min(index * 0.05, maxDelay)
    
    switch (finalConfig.performanceMode) {
      case 'performance':
        return baseDelay * 0.5 // 빠르게
      case 'high':
        return baseDelay * 1.5 // 여유롭게
      default:
        return baseDelay
    }
  }, [finalConfig.reducedMotion, finalConfig.performanceMode])

  // 애니메이션 큐 관리
  useEffect(() => {
    const interval = setInterval(() => {
      // 주기적으로 애니메이션 큐 정리
      animationQueueRef.current.clear()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    variants,
    shouldAnimate,
    getOptimizedTransition,
    createStackAnimation,
    getBatchedAnimationDelay,
    useReducedMotion: finalConfig.reducedMotion
  }
}

/**
 * 메모이제이션된 애니메이션 컴포넌트를 위한 헬퍼
 */
export const createMemoizedAnimationComponent = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  shouldUpdateFn?: (prevProps: T, nextProps: T) => boolean
) => {
  return React.memo(Component, shouldUpdateFn || ((prev, next) => {
    // 기본적으로 애니메이션 관련 prop 변경 시에만 리렌더링
    const animationProps = ['animate', 'initial', 'exit', 'transition', 'variants']
    
    return animationProps.every(prop => {
      return JSON.stringify(prev[prop]) === JSON.stringify(next[prop])
    })
  }))
}

/**
 * GPU 가속을 위한 CSS 스타일 헬퍼
 */
export const getGPUAcceleratedStyles = () => ({
  transform: 'translateZ(0)', // GPU 레이어 생성
  willChange: 'transform, opacity', // 브라우저 최적화 힌트
  contain: 'layout style paint' as const, // 렌더링 최적화
  backfaceVisibility: 'hidden' as const, // 뒷면 숨기기
})

export default useOptimizedAnimations