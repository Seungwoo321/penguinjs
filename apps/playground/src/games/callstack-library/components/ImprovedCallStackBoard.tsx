'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StackItem } from '@/games/callstack-library/types'
import { BookOpen, AlertTriangle } from 'lucide-react'
import { getBookDimensions, BOOK_CONFIG } from '@/games/callstack-library/constants/bookConfig'
import { getBookAnimationConfig, AnimationSpeed } from '@/games/callstack-library/constants/animationConfig'
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync'

interface ImprovedCallStackBoardProps {
  stack: StackItem[]
  maxStackSize: number
  isExecuting: boolean
  stackOverflow: boolean
  currentFunction: string | null
  animationSpeed?: AnimationSpeed
  layout?: 'vertical' | 'horizontal' | 'auto' // 새로운 레이아웃 옵션
}

export function ImprovedCallStackBoard({
  stack,
  maxStackSize,
  isExecuting,
  stackOverflow,
  currentFunction,
  animationSpeed = 'normal',
  layout = 'auto'
}: ImprovedCallStackBoardProps) {
  const isDarkMode = useDarkModeDetection()
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  // 애니메이션 설정 가져오기
  const animationConfig = getBookAnimationConfig(animationSpeed)

  // 화면 크기 추적
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleResize = () => setScreenWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (currentFunction) {
      setHighlightedItem(currentFunction)
      const timer = setTimeout(() => setHighlightedItem(null), 500)
      return () => clearTimeout(timer)
    }
  }, [currentFunction])

  // 레이아웃 결정
  const isHorizontal = layout === 'horizontal' || (layout === 'auto' && screenWidth >= 768)
  const containerHeight = isHorizontal ? '200px' : '400px'

  return (
    <div className="relative">
      {/* 개선된 책장 프레임 */}
      <div className="relative p-4 rounded-2xl shadow-2xl" style={{
        background: `linear-gradient(145deg, rgb(var(--game-callstack-shelf-wood-dark)), rgb(var(--game-callstack-shelf-shadow)))`,
        boxShadow: `0 20px 40px rgba(var(--game-callstack-animation-error), 0.15), inset 0 2px 4px rgba(var(--game-callstack-animation-success), 0.5)`
      }}>
        {/* 책장 내부 - 더 어두운 배경으로 대비 강화 */}
        <div className="relative rounded-xl p-6" style={{
          background: `linear-gradient(180deg, rgb(var(--game-callstack-shelf-wood-light)) 0%, rgb(var(--game-callstack-library-wood)) 50%, rgb(var(--game-callstack-shelf-wood-dark)) 100%)`,
          boxShadow: `inset 0 2px 8px rgba(var(--game-callstack-animation-error), 0.3), inset 0 -2px 4px rgba(var(--game-callstack-animation-error), 0.2)`
        }}>
          {/* 나무 결 텍스처 */}
          <div 
            className="absolute inset-0 opacity-30 rounded-xl"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 20px,
                  rgba(var(--game-callstack-animation-error), 0.1) 20px,
                  rgba(var(--game-callstack-animation-error), 0.1) 22px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 40px,
                  rgba(var(--game-callstack-animation-success), 0.05) 40px,
                  rgba(var(--game-callstack-animation-success), 0.05) 41px
                )
              `
            }}
          />
          
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <div className="p-2 rounded-lg shadow-md" style={{ backgroundColor: 'rgb(var(--game-callstack-library-bg-elevated))' }}>
              <BookOpen className="h-5 w-5" style={{ color: 'rgb(var(--game-callstack-library-warning))' }} />
            </div>
            <span className="font-bold drop-shadow-lg" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
              {isHorizontal ? '콜스택 책상' : '콜스택 책장'}
            </span>
          </h3>
          
          {/* 책 배치 영역 */}
          <div 
            className={`relative rounded-lg overflow-hidden ${isHorizontal ? 'overflow-x-auto' : ''}`} 
            style={{
              height: containerHeight,
              background: isHorizontal 
                ? `linear-gradient(180deg, rgb(var(--game-callstack-shelf-wood-dark)) 0%, rgb(var(--game-callstack-shelf-shadow)) 100%)` // 가로: 책상 스타일
                : 'transparent', // 세로: 기존 스타일
              perspective: '1000px'
            }}
          >
            {isHorizontal && (
              // 가로 레이아웃: 책상 표면 효과
              <div className="absolute inset-0" style={{ 
                background: `linear-gradient(to right, rgba(var(--game-callstack-animation-error), 0.2), transparent, rgba(var(--game-callstack-animation-error), 0.2))` 
              }} />
            )}
            
            {/* 책들 (스택 아이템) */}
            <AnimatePresence>
              {stack.map((item, index) => {
                const dimensions = getBookDimensions(item.functionName)
                
                // 가로 배치일 때의 위치 계산
                const horizontalPosition = isHorizontal 
                  ? index * (dimensions.width + 8) + 20 // 가로로 나열
                  : 0
                
                // 세로 배치일 때의 위치 계산 (기존 방식)
                const verticalPosition = isHorizontal 
                  ? 0
                  : stack.slice(0, index).reduce((acc, prevItem) => 
                      acc + getBookDimensions(prevItem.functionName).height, 0
                    )
                
                return (
                  <motion.div
                    key={item.id}
                    initial={isHorizontal ? { 
                      x: -200,
                      opacity: 0,
                      rotate: Math.random() * 10 - 5
                    } : { 
                      y: -300,
                      opacity: 0,
                      rotate: Math.random() * BOOK_CONFIG.animation.initialRotation - BOOK_CONFIG.animation.initialRotation / 2
                    }}
                    animate={isHorizontal ? { 
                      x: 0,
                      opacity: 1,
                      rotate: dimensions.rotation * 0.3, // 가로일 때는 회전 줄임
                      transition: {
                        type: "spring",
                        stiffness: animationConfig.stiffness,
                        damping: animationConfig.damping,
                        delay: index * animationConfig.delay
                      }
                    } : { 
                      y: 0,
                      opacity: 1,
                      rotate: dimensions.rotation,
                      transition: {
                        type: "spring",
                        stiffness: animationConfig.stiffness,
                        damping: animationConfig.damping,
                        delay: index * animationConfig.delay
                      }
                    }}
                    exit={isHorizontal ? { 
                      x: 200,
                      opacity: 0,
                      rotate: 10,
                      transition: { duration: 0.3 }
                    } : { 
                      x: BOOK_CONFIG.animation.exitX,
                      opacity: 0,
                      rotate: BOOK_CONFIG.animation.exitRotation,
                      transition: { duration: 0.3 }
                    }}
                    className="absolute"
                    style={isHorizontal ? {
                      // 가로 배치 스타일
                      left: `${horizontalPosition}px`,
                      bottom: '50%',
                      transform: 'translateY(50%)',
                      width: `${dimensions.width}px`,
                      height: `${Math.min(dimensions.height, 120)}px`, // 가로일 때 높이 제한
                      zIndex: index + 10,
                      transformStyle: 'preserve-3d'
                    } : {
                      // 세로 배치 스타일 (기존)
                      bottom: `${verticalPosition}px`,
                      left: '50%',
                      transform: `translateX(-50%) rotate(${dimensions.rotation}deg)`,
                      marginLeft: `-${dimensions.width / 2}px`,
                      width: `${dimensions.width}px`,
                      height: `${dimensions.height}px`,
                      zIndex: stack.length - index,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div 
                      className={`h-full rounded shadow-2xl flex items-center px-4 relative overflow-hidden transform transition-all duration-300 ${
                        currentFunction === item.functionName
                          ? 'ring-4 animate-pulse scale-105'
                          : 'hover:scale-102'
                      }`}
                      style={{ 
                        backgroundColor: item.color,
                        ...(currentFunction === item.functionName ? { 
                          boxShadow: `0 0 0 4px rgb(var(--game-callstack-library-warning))` 
                        } : {}),
                        backgroundImage: `
                          linear-gradient(135deg, rgba(var(--game-callstack-animation-success), 0.3) 0%, transparent 50%, rgba(var(--game-callstack-animation-error), 0.1) 100%),
                          linear-gradient(to right, transparent 0%, rgba(var(--game-callstack-animation-error), 0.1) 3px, transparent 3px)
                        `,
                        boxShadow: `
                          0 ${BOOK_CONFIG.shadow.baseOffsetY + index * BOOK_CONFIG.shadow.indexMultiplier}px ${BOOK_CONFIG.shadow.baseBlur + index * BOOK_CONFIG.shadow.indexMultiplier * 1.5}px rgba(var(--game-callstack-animation-error), 0.3),
                          inset 0 1px 2px rgba(var(--game-callstack-animation-success), 0.3),
                          inset 0 -1px 2px rgba(var(--game-callstack-animation-error), 0.2)
                        `
                      }}
                    >
                      {/* 책 측면 (두께) 효과 */}
                      <div 
                        className="absolute left-0 top-0 bottom-0"
                        style={{ 
                          background: `linear-gradient(to right, rgba(var(--game-callstack-animation-error), 0.5), rgba(var(--game-callstack-animation-error), 0.2))`,
                          width: `${dimensions.thickness}px`
                        }}
                      />
                      
                      {/* 책 제본 라인 */}
                      <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'rgb(var(--game-callstack-library-bg-secondary))' }} />
                      <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'rgba(var(--game-callstack-animation-success), 0.2)' }} />
                      
                      {/* 책 표지 텍스처 */}
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `
                            repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 10px,
                              rgba(var(--game-callstack-animation-success), 0.1) 10px,
                              rgba(var(--game-callstack-animation-success), 0.1) 11px
                            )
                          `
                        }}
                      />
                      
                      {/* 개선된 텍스트 가독성 */}
                      <span 
                        className={`font-mono font-bold ml-4 mr-2 relative z-10 ${
                          isHorizontal ? 'text-xs' : 'text-xs'
                        }`}
                        style={{
                          color: 'rgb(var(--game-callstack-library-text-primary))',
                          textShadow: `1px 1px 2px rgba(var(--game-callstack-animation-success), 0.9), -1px -1px 2px rgba(var(--game-callstack-animation-success), 0.9), 1px -1px 2px rgba(var(--game-callstack-animation-success), 0.9), -1px 1px 2px rgba(var(--game-callstack-animation-success), 0.9)`,
                          fontSize: isHorizontal ? '0.7rem' : '0.75rem'
                        }}
                      >
                        {item.functionName}
                      </span>
                      
                      {/* 책 페이지 효과 (오른쪽) */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 rounded-r" style={{
                        background: `linear-gradient(to left, rgb(var(--game-callstack-library-paper)), rgb(var(--game-callstack-library-text-primary)))`
                      }} />
                      <div className="absolute right-2 top-0 bottom-0 w-px" style={{ backgroundColor: 'rgb(var(--game-callstack-library-border))' }} />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {/* 빈 스택 메시지 */}
            {stack.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                <div className="text-center p-6 rounded-xl shadow-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--game-callstack-animation-success), 0.95)' }}>
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-sm font-medium" style={{ color: 'rgb(var(--game-callstack-library-warning))' }}>
                    코드를 실행하면 여기에<br/>함수가 {isHorizontal ? '나란히' : '책처럼 쌓입니다'}
                  </p>
                </div>
              </div>
            )}
            
            {/* 가로 배치일 때 스크롤 인디케이터 */}
            {isHorizontal && stack.length > 0 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {Array.from({ length: Math.min(stack.length, 10) }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: 'rgba(var(--game-callstack-animation-success), 0.6)' }} 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 스택 오버플로우 경고 */}
          {stackOverflow && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--game-callstack-animation-error), 0.3)' }}>
              <div className="text-center p-4 rounded-lg shadow-lg" style={{ backgroundColor: 'rgba(var(--game-callstack-animation-error), 0.1)' }}>
                <p className="font-bold text-lg" style={{ color: 'rgb(var(--game-callstack-library-error))' }}>
                  📚💥 Stack Overflow!
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--game-callstack-library-error))' }}>
                  {isHorizontal ? '책상이 넘쳐났습니다!' : '책장이 넘쳐났습니다!'}
                </p>
              </div>
            </div>
          )}
          
          {/* 스택 크기 표시 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="px-4 py-2 rounded-lg text-sm font-medium shadow-md" style={{ 
              backgroundColor: 'rgb(var(--game-callstack-library-bg-elevated))', 
              color: 'rgb(var(--game-callstack-library-warning))' 
            }}>
              스택 크기: {stack.length} / {maxStackSize}
            </div>
            
            {/* 레이아웃 표시 */}
            <div className="px-3 py-1 rounded-lg text-xs font-medium" style={{ 
              backgroundColor: 'rgb(var(--game-callstack-queue-microtask-light))', 
              color: 'rgb(var(--game-callstack-queue-microtask))' 
            }}>
              {isHorizontal ? '가로 배치' : '세로 배치'}
            </div>
            
            {isExecuting && (
              <div className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ 
                backgroundColor: 'rgb(var(--game-callstack-queue-microtask-light))', 
                color: 'rgb(var(--game-callstack-queue-microtask))' 
              }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'rgb(var(--game-callstack-queue-microtask))' }} />
                실행 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}