'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StackItem } from './types'
import { BookOpen, AlertTriangle } from 'lucide-react'
import { getBookDimensions, BOOK_CONFIG } from './constants/bookConfig'
import { getBookAnimationConfig, AnimationSpeed } from './constants/animationConfig'

interface CallStackBoardProps {
  stack: StackItem[]
  maxStackSize: number
  isExecuting: boolean
  stackOverflow: boolean
  currentFunction: string | null
  animationSpeed?: AnimationSpeed
}


export function CallStackBoard({
  stack,
  maxStackSize,
  isExecuting,
  stackOverflow,
  currentFunction,
  animationSpeed = 'normal'
}: CallStackBoardProps) {
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)
  
  // 애니메이션 설정 가져오기
  const animationConfig = getBookAnimationConfig(animationSpeed)

  useEffect(() => {
    if (currentFunction) {
      setHighlightedItem(currentFunction)
      const timer = setTimeout(() => setHighlightedItem(null), 500)
      return () => clearTimeout(timer)
    }
  }, [currentFunction])

  return (
    <div className="relative">
      {/* 책상 프레임 */}
      <div className="relative p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-[rgb(var(--muted))] to-[rgb(var(--border))]">
        {/* 책상 표면 */}
        <div className="relative rounded-xl p-6" style={{
          background: 'linear-gradient(180deg, rgb(var(--bookshelf-frame)) 0%, rgb(var(--bookshelf-shelf)) 100%)',
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
            <div className="p-2 bg-[rgb(var(--card))]/90 rounded-lg shadow-md">
              <BookOpen className="h-5 w-5 text-[rgb(var(--bookshelf-text))]" />
            </div>
            <span className="font-bold text-[rgb(var(--bookshelf-text))] drop-shadow-lg">
              콜스택 데스크
            </span>
          </h3>
          
          {/* 책상 위 공간 */}
          <div className="relative rounded-lg" style={{
            height: '400px',
            background: 'transparent',
            perspective: '1000px'
          }}>
            
            {/* 책들 (스택 아이템) */}
            <AnimatePresence>
              {stack.map((item, index) => {
                const dimensions = getBookDimensions(item.functionName)
                const previousHeight = stack.slice(0, index).reduce((acc, prevItem) => 
                  acc + getBookDimensions(prevItem.functionName).height, 0
                )
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ 
                      y: -300,
                      opacity: 0,
                      rotate: Math.random() * BOOK_CONFIG.animation.initialRotation - BOOK_CONFIG.animation.initialRotation / 2
                    }}
                    animate={{ 
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
                    exit={{ 
                      x: BOOK_CONFIG.animation.exitX,
                      opacity: 0,
                      rotate: BOOK_CONFIG.animation.exitRotation,
                      transition: { duration: 0.3 }
                    }}
                    className="absolute"
                    style={{
                      bottom: `${previousHeight}px`,
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
                        backgroundImage: `
                          linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%),
                          linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 3px, transparent 3px)
                        `,
                        boxShadow: currentFunction === item.functionName 
                          ? `0 0 0 4px rgb(var(--game-callstack-library-warning)), 0 ${BOOK_CONFIG.shadow.baseOffsetY + index * BOOK_CONFIG.shadow.indexMultiplier}px ${BOOK_CONFIG.shadow.baseBlur + index * BOOK_CONFIG.shadow.indexMultiplier * 1.5}px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)`
                          : `0 ${BOOK_CONFIG.shadow.baseOffsetY + index * BOOK_CONFIG.shadow.indexMultiplier}px ${BOOK_CONFIG.shadow.baseBlur + index * BOOK_CONFIG.shadow.indexMultiplier * 1.5}px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.2)`
                      }}
                    >
                      {/* 책 측면 (두께) 효과 */}
                      <div 
                        className="absolute left-0 top-0 bottom-0"
                        style={{
                          background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))',
                          width: `${dimensions.thickness}px`
                        }}
                      />
                      
                      {/* 책 제본 라인 */}
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[rgb(var(--surface-secondary))]/30" />
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[rgb(var(--surface-elevated))]/20" />
                      
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
                      
                      <span 
                        className="font-mono text-xs font-bold ml-4 mr-2 relative z-10 text-[rgb(var(--foreground))]"
                      >
                        {item.functionName}
                      </span>
                      
                      {/* 책 페이지 효과 (오른쪽) */}
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-2 rounded-r"
                        style={{
                          background: `linear-gradient(to left, rgb(var(--game-callstack-library-paper)), rgb(var(--surface-elevated)))`
                        }}
                      />
                      <div 
                        className="absolute right-2 top-0 bottom-0 w-px"
                        style={{ backgroundColor: 'rgb(var(--border))' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {/* 빈 스택 메시지 */}
            {stack.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
                <div className="text-center p-6 bg-[rgb(var(--card))]/90 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-[rgb(var(--bookshelf-text))] text-sm font-medium">
                    코드를 실행하면 여기에<br/>함수가 책처럼 쌓입니다
                  </p>
                </div>
              </div>
            )}
            
            {/* 책상 그림자 효과 */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                filter: 'blur(8px)'
              }}
            />
          </div>
          
          {/* 스택 오버플로우 경고 */}
          {stackOverflow && (
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(var(--destructive), 0.3)' }}
            >
              <div 
                className="text-center p-4 rounded-lg shadow-lg"
                style={{ backgroundColor: 'rgb(var(--destructive) / 0.1)' }}
              >
                <p 
                  className="font-bold text-lg"
                  style={{ color: 'rgb(var(--destructive))' }}
                >
                  📚💥 Stack Overflow!
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'rgb(var(--destructive))' }}
                >
                  책장이 넘쳐났습니다!
                </p>
              </div>
            </div>
          )}
          
          {/* 스택 크기 표시 */}
          <div className="mt-4 flex items-center justify-between">
            <div 
              className="px-4 py-2 rounded-lg text-sm font-medium shadow-md"
              style={{
                backgroundColor: 'rgb(var(--surface-elevated) / 0.9)',
                color: 'rgb(var(--game-callstack-library-warning))'
              }}
            >
              스택 크기: {stack.length} / {maxStackSize}
            </div>
            
            {isExecuting && (
              <div 
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'rgb(var(--primary) / 0.1)',
                  color: 'rgb(var(--primary))'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'rgb(var(--primary))' }}
                />
                실행 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}