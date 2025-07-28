'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StackItem } from '../types'
import { BookOpen, AlertTriangle } from 'lucide-react'
import { getBookDimensions, BOOK_CONFIG } from '../constants/bookConfig'
import { getBookAnimationConfig, AnimationSpeed } from '../constants/animationConfig'

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
        background: 'linear-gradient(145deg, #8B4513, #654321)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
      }}>
        {/* 책장 내부 - 더 어두운 배경으로 대비 강화 */}
        <div className="relative rounded-xl p-6" style={{
          background: 'linear-gradient(180deg, #D2B48C 0%, #CD853F 50%, #A0522D 100%)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2)'
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
                  rgba(0, 0, 0, 0.1) 20px,
                  rgba(0, 0, 0, 0.1) 22px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 40px,
                  rgba(255, 255, 255, 0.05) 40px,
                  rgba(255, 255, 255, 0.05) 41px
                )
              `
            }}
          />
          
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <div className="p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-md">
              <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <span className="font-bold text-white drop-shadow-lg">
              {isHorizontal ? '콜스택 책상' : '콜스택 책장'}
            </span>
          </h3>
          
          {/* 책 배치 영역 */}
          <div 
            className={`relative rounded-lg overflow-hidden ${isHorizontal ? 'overflow-x-auto' : ''}`} 
            style={{
              height: containerHeight,
              background: isHorizontal 
                ? 'linear-gradient(180deg, #8B4513 0%, #654321 100%)' // 가로: 책상 스타일
                : 'transparent', // 세로: 기존 스타일
              perspective: '1000px'
            }}
          >
            {isHorizontal && (
              // 가로 레이아웃: 책상 표면 효과
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
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
                          ? 'ring-4 ring-yellow-400 animate-pulse scale-105'
                          : 'hover:scale-102'
                      }`}
                      style={{ 
                        backgroundColor: item.color,
                        backgroundImage: `
                          linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
                          linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 3px, transparent 3px)
                        `,
                        boxShadow: `
                          0 ${BOOK_CONFIG.shadow.baseOffsetY + index * BOOK_CONFIG.shadow.indexMultiplier}px ${BOOK_CONFIG.shadow.baseBlur + index * BOOK_CONFIG.shadow.indexMultiplier * 1.5}px rgba(0, 0, 0, 0.3),
                          inset 0 1px 2px rgba(255, 255, 255, 0.3),
                          inset 0 -1px 2px rgba(0, 0, 0, 0.2)
                        `
                      }}
                    >
                      {/* 책 측면 (두께) 효과 */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/50 to-black/20"
                        style={{ width: `${dimensions.thickness}px` }}
                      />
                      
                      {/* 책 제본 라인 */}
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-black/30" />
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/20" />
                      
                      {/* 책 표지 텍스처 */}
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `
                            repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 10px,
                              rgba(255,255,255,0.1) 10px,
                              rgba(255,255,255,0.1) 11px
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
                          color: '#1a1a1a',
                          textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9)',
                          fontSize: isHorizontal ? '0.7rem' : '0.75rem'
                        }}
                      >
                        {item.functionName}
                      </span>
                      
                      {/* 책 페이지 효과 (오른쪽) */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-gray-100 to-white rounded-r" />
                      <div className="absolute right-2 top-0 bottom-0 w-px bg-gray-300" />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {/* 빈 스택 메시지 */}
            {stack.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                <div className="text-center p-6 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
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
                    className="w-2 h-2 rounded-full bg-white/60" 
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 스택 오버플로우 경고 */}
          {stackOverflow && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-lg backdrop-blur-sm">
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/70 rounded-lg shadow-lg">
                <p className="text-red-800 dark:text-red-200 font-bold text-lg">
                  📚💥 Stack Overflow!
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {isHorizontal ? '책상이 넘쳐났습니다!' : '책장이 넘쳐났습니다!'}
                </p>
              </div>
            </div>
          )}
          
          {/* 스택 크기 표시 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="bg-white/90 dark:bg-slate-800/90 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-lg text-sm font-medium shadow-md">
              스택 크기: {stack.length} / {maxStackSize}
            </div>
            
            {/* 레이아웃 표시 */}
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-lg text-xs font-medium">
              {isHorizontal ? '가로 배치' : '세로 배치'}
            </div>
            
            {isExecuting && (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                실행 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}