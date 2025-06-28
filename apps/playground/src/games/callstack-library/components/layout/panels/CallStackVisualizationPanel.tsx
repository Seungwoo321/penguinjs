// 콜스택 시각화 패널 컴포넌트

import React from 'react'
import { cn, GamePanel } from '@penguinjs/ui'
import { CallStackVisualizationPanelProps } from '../../../types/layout'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 콜스택 시각화 패널
 * 레이아웃 타입에 따라 다른 시각화 방식을 제공
 */
export const CallStackVisualizationPanel: React.FC<CallStackVisualizationPanelProps> = ({
  callstack,
  queues,
  layoutType,
  className
}) => {
  
  const title = queues && queues.length > 1 ? '📚 콜스택 & 큐 시스템' : '📚 콜스택 책장'
  
  return (
    <GamePanel title={title} className={cn("flex flex-col overflow-hidden", className)}>
      {/* 설명 텍스트 */}
      <div className="px-4 py-2 border-b border-editor-border flex-shrink-0">
        <p className="text-xs text-game-text-secondary">
          {getVisualizationDescription(layoutType)}
        </p>
      </div>
      
      {/* 시각화 영역 */}
      <div className="flex-1 p-4 overflow-hidden">
        {queues && queues.length > 1 ? (
          <MultiShelfBookcase queues={queues} callstack={callstack} />
        ) : (
          <SingleCallStackVisualization callstack={callstack} layoutType={layoutType} />
        )}
      </div>
      
      {/* 하단 정보 */}
      <div className="px-4 py-2 border-t border-editor-border bg-surface-secondary flex-shrink-0">
        <div className="flex justify-between items-center text-xs text-game-text-secondary">
          <span>스택 크기: {callstack.length}</span>
          <span>최대 깊이: 5</span>
        </div>
      </div>
    </GamePanel>
  )
}

/**
 * 단일 콜스택 시각화 (타입 A, A+) - 도서관 책장
 */
const SingleCallStackVisualization: React.FC<{
  callstack: any[]
  layoutType: string
}> = ({ callstack, layoutType }) => {
  return (
    <div className="w-full h-[600px] relative" style={{ 
      background: `
        radial-gradient(ellipse at center top, rgba(255, 248, 220, 0.6) 0%, transparent 60%),
        linear-gradient(180deg, #8B4513 0%, #A0522D 15%, #CD853F 30%, #DEB887 45%, #F5DEB3 60%, #DEB887 75%, #CD853F 90%, #8B4513 100%)
      `,
      boxShadow: `
        inset 0 0 50px rgba(0, 0, 0, 0.3),
        0 20px 40px rgba(0, 0, 0, 0.4)
      `
    }}>
      {/* 나무 질감 레이어 1 - 나무결 */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(101, 67, 33, 0.3) 1px,
            transparent 2px,
            transparent 8px,
            rgba(139, 69, 19, 0.2) 9px,
            transparent 10px,
            transparent 25px
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            rgba(160, 82, 45, 0.1) 1px,
            transparent 3px,
            transparent 120px
          )
        `,
        opacity: 0.7
      }}></div>
      
      {/* 나무 질감 레이어 2 - 나무 옹이들 */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(ellipse 80px 40px at 20% 25%, rgba(101, 67, 33, 0.4) 0%, transparent 70%),
          radial-gradient(ellipse 60px 30px at 75% 40%, rgba(139, 69, 19, 0.3) 0%, transparent 60%),
          radial-gradient(ellipse 40px 20px at 45% 70%, rgba(160, 82, 45, 0.2) 0%, transparent 50%),
          radial-gradient(ellipse 100px 50px at 85% 80%, rgba(101, 67, 33, 0.3) 0%, transparent 65%)
        `,
        opacity: 0.6
      }}></div>
      
      {/* 책장 구조 */}
      <div className="absolute inset-4 flex flex-col">
        {/* 상단 선반 - 진짜 나무 */}
        <div className="h-12 relative mb-4" style={{
          background: `linear-gradient(180deg, #8B4513 0%, #A0522D 20%, #CD853F 50%, #8B4513 100%)`,
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 6px rgba(0, 0, 0, 0.3)
          `
        }}>
          {/* 선반 나무결 */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                rgba(101, 67, 33, 0.4) 1px,
                transparent 2px,
                transparent 12px
              )
            `,
            opacity: 0.8
          }}></div>
          {/* 선반 앞면 */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{
            background: `linear-gradient(180deg, #654321 0%, #8B4513 100%)`,
            boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.2)`
          }}></div>
        </div>
        
        {/* 책 영역 - 책장 안쪽 */}
        <div className="flex-1 relative" style={{
          background: `
            linear-gradient(180deg, #F5DEB3 0%, #DEB887 30%, #CD853F 70%, #A0522D 100%)
          `,
          boxShadow: `
            inset 4px 4px 12px rgba(0, 0, 0, 0.3),
            inset -4px 4px 12px rgba(0, 0, 0, 0.2)
          `
        }}>
          {/* 책장 안쪽 나무결 */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                rgba(139, 69, 19, 0.15) 1px,
                transparent 2px,
                transparent 15px
              )
            `,
            opacity: 0.5
          }}></div>
          
          {/* 책들 - 위에서 아래로 쌓이는 형태 (단일 콜스택) */}
          <div className="absolute inset-0 p-4 flex flex-col-reverse items-center justify-start gap-2 overflow-y-auto">
            {callstack.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: '#8B4513' }}>
                <div className="text-8xl mb-4 drop-shadow-lg filter">📚</div>
                <p className="text-xl font-bold mb-2 drop-shadow-sm">빈 책장</p>
                <p className="text-sm opacity-80 text-center drop-shadow-sm">함수가 호출되면<br/>이곳에 책이 꽂힙니다</p>
              </div>
            ) : (
              <AnimatePresence>
                {callstack.map((item, index) => (
                  <motion.div
                    key={`${item.name || item.functionName || item}-${index}`}
                    initial={{ 
                      y: -50, 
                      opacity: 0,
                      scale: 0.9 
                    }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      scale: 1 
                    }}
                    exit={{ 
                      y: -50, 
                      opacity: 0,
                      scale: 0.9
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      delay: index * 0.05
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <BookVisualization
                      item={item}
                      index={index}
                      layoutType={layoutType}
                    />
                  </motion.div>
                ))}
                
                {/* 펭귄 사서 애니메이션 */}
                <PenguinLibrarian isActive={callstack.length > 0} />
              </AnimatePresence>
            )}
          </div>
        </div>
        
        {/* 하단 선반 - 진짜 나무 */}
        <div className="h-12 relative mt-4" style={{
          background: `linear-gradient(180deg, #8B4513 0%, #A0522D 20%, #CD853F 50%, #8B4513 100%)`,
          boxShadow: `
            0 -4px 12px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 6px rgba(0, 0, 0, 0.3)
          `
        }}>
          {/* 선반 나무결 */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                rgba(101, 67, 33, 0.4) 1px,
                transparent 2px,
                transparent 12px
              )
            `,
            opacity: 0.8
          }}></div>
          {/* 선반 앞면 */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{
            background: `linear-gradient(180deg, #8B4513 0%, #654321 100%)`,
            boxShadow: `inset 0 -1px 2px rgba(255, 255, 255, 0.2)`
          }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 다중 선반 책장 (타입 B, C, D) - 큐 개수에 따라 선반 추가
 */
const MultiShelfBookcase: React.FC<{
  queues: string[]
  callstack: any[]
}> = ({ queues, callstack }) => {
  
  const queueCount = queues.length
  const shelfCount = queueCount - 1 // 선반 개수 = 큐 개수 - 1
  
  return (
    <div className="w-full h-[600px] relative" style={{ 
      background: `
        radial-gradient(ellipse at center top, rgba(255, 248, 220, 0.6) 0%, transparent 60%),
        linear-gradient(180deg, #8B4513 0%, #A0522D 15%, #CD853F 30%, #DEB887 45%, #F5DEB3 60%, #DEB887 75%, #CD853F 90%, #8B4513 100%)
      `,
      boxShadow: `
        inset 0 0 50px rgba(0, 0, 0, 0.3),
        0 20px 40px rgba(0, 0, 0, 0.4)
      `
    }}>
      {/* 나무 질감 레이어 */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent 0px,
            rgba(101, 67, 33, 0.3) 1px,
            transparent 2px,
            transparent 8px,
            rgba(139, 69, 19, 0.2) 9px,
            transparent 10px,
            transparent 25px
          )
        `,
        opacity: 0.7
      }}></div>
      
      {/* 책장 구조 */}
      <div className="absolute inset-4 flex flex-col">
        {/* 상단 선반 */}
        <BookShelf />
        
        {/* 큐별 칸들 */}
        <div className="flex-1 flex flex-col">
          {queues.map((queueType, index) => (
            <React.Fragment key={queueType}>
              {/* 큐 영역 */}
              <QueueSection
                queueType={queueType}
                items={queueType === 'callstack' ? callstack : []}
                isLast={index === queues.length - 1}
              />
              
              {/* 중간 선반 (마지막 제외) */}
              {index < queues.length - 1 && <BookShelf />}
            </React.Fragment>
          ))}
        </div>
        
        {/* 하단 선반 */}
        <BookShelf />
      </div>
    </div>
  )
}

/**
 * 책장 선반 컴포넌트
 */
const BookShelf: React.FC = () => (
  <div className="h-12 relative my-2" style={{
    background: `linear-gradient(180deg, #8B4513 0%, #A0522D 20%, #CD853F 50%, #8B4513 100%)`,
    boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 6px rgba(0, 0, 0, 0.3)
    `
  }}>
    {/* 선반 나무결 */}
    <div className="absolute inset-0" style={{
      backgroundImage: `
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          rgba(101, 67, 33, 0.4) 1px,
          transparent 2px,
          transparent 12px
        )
      `,
      opacity: 0.8
    }}></div>
    {/* 선반 앞면 */}
    <div className="absolute bottom-0 left-0 right-0 h-3" style={{
      background: `linear-gradient(180deg, #654321 0%, #8B4513 100%)`,
      boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.2)`
    }}></div>
  </div>
)

/**
 * 큐 섹션 컴포넌트
 */
const QueueSection: React.FC<{
  queueType: string
  items: any[]
  isLast: boolean
}> = ({ queueType, items, isLast }) => {
  
  const queueConfig = getQueueConfig(queueType)
  
  return (
    <div className="flex-1 relative min-h-[80px]" style={{
      background: `
        linear-gradient(180deg, #F5DEB3 0%, #DEB887 30%, #CD853F 70%, #A0522D 100%)
      `,
      boxShadow: `
        inset 4px 4px 12px rgba(0, 0, 0, 0.3),
        inset -4px 4px 12px rgba(0, 0, 0, 0.2)
      `
    }}>
      {/* 큐 라벨 */}
      <div className="absolute top-2 left-4 flex items-center gap-2 bg-white/80 px-2 py-1 rounded text-xs font-semibold shadow-sm">
        <span>{queueConfig.icon}</span>
        <span>{queueConfig.name}</span>
        <span className="text-gray-500">({items.length})</span>
      </div>
      
      {/* 책들 */}
      <div className="absolute inset-0 pt-8 p-4 flex items-end justify-start gap-1 overflow-x-auto">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 text-sm w-full py-4">
            {queueType === 'callstack' ? '빈 콜스택' : `빈 ${queueConfig.name}`}
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${queueType}-${item.name || item.functionName || item}-${index}`}
                initial={{ 
                  x: -50, 
                  opacity: 0,
                  scale: 0.8 
                }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  scale: 1 
                }}
                exit={{ 
                  x: 50, 
                  opacity: 0,
                  scale: 0.8
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.05
                }}
                whileHover={{
                  y: -3,
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
              >
                <QueueBookVisualization
                  item={item}
                  index={index}
                  queueType={queueType}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

/**
 * 큐별 책 시각화
 */
const QueueBookVisualization: React.FC<{
  item: any
  index: number
  queueType: string
}> = ({ item, index, queueType }) => {
  
  const queueConfig = getQueueConfig(queueType)
  
  // 큐 타입별 색상
  const queueColors = {
    callstack: { spine: 'bg-blue-700', cover: 'bg-blue-600', text: 'text-blue-100' },
    microtask: { spine: 'bg-green-700', cover: 'bg-green-600', text: 'text-green-100' },
    macrotask: { spine: 'bg-yellow-700', cover: 'bg-yellow-600', text: 'text-yellow-100' },
    animation: { spine: 'bg-purple-700', cover: 'bg-purple-600', text: 'text-purple-100' },
    generator: { spine: 'bg-orange-700', cover: 'bg-orange-600', text: 'text-orange-100' },
    io: { spine: 'bg-red-700', cover: 'bg-red-600', text: 'text-red-100' },
    worker: { spine: 'bg-gray-700', cover: 'bg-gray-600', text: 'text-gray-100' }
  }
  
  const color = queueColors[queueType as keyof typeof queueColors] || queueColors.callstack
  const bookWidth = 30 + (index % 3) * 8
  const bookHeight = 60 + (index % 2) * 20
  
  return (
    <div 
      className="relative flex-shrink-0 transform transition-transform hover:-translate-y-1"
      style={{ width: `${bookWidth}px`, height: `${bookHeight}px` }}
    >
      <div className={cn(
        "h-full w-full rounded-t-sm shadow-md relative overflow-hidden",
        color.cover
      )}>
        {/* 책등 상단 */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-2",
          color.spine
        )} />
        
        {/* 책 라벨 */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center px-1 text-center",
          color.text
        )}>
          <span className="text-xs font-bold" style={{ 
            writingMode: 'vertical-rl',
            fontSize: '10px'
          }}>
            {item.name || item.functionName || (typeof item === 'string' ? item : queueConfig.icon)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * 개별 큐 시각화
 */
const QueueVisualization: React.FC<{
  queueType: string
  items: any[]
}> = ({ queueType, items }) => {
  
  const queueConfig = getQueueConfig(queueType)
  
  return (
    <div className={cn(
      "border-2 rounded-lg p-3 bg-white dark:bg-slate-800",
      queueConfig.borderColor
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-mono">{queueConfig.icon}</span>
        <span className="text-sm font-semibold">{queueConfig.name}</span>
        <span className="text-xs text-gray-500">({items.length})</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto">
        {items.length === 0 ? (
          <div className="text-xs text-gray-400 italic">비어있음</div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "px-2 py-1 text-xs rounded border",
                queueConfig.itemStyle
              )}
            >
              {item.name || item.functionName || (typeof item === 'string' ? item : 'Unknown')}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * 책 시각화 - 스택처럼 쌓이는 형태 (단일 콜스택용)
 */
const BookVisualization: React.FC<{
  item: any
  index: number
  layoutType: string
}> = ({ item, index, layoutType }) => {
  
  // 전역 실행 컨텍스트인지 확인
  const isGlobalContext = item.isGlobalContext || item.functionName === '<global>'
  
  // 책 색상 팔레트
  const bookStyles = [
    { spine: 'bg-blue-700', cover: 'bg-blue-600', text: 'text-blue-100', shadow: 'shadow-blue-900/50' },
    { spine: 'bg-emerald-700', cover: 'bg-emerald-600', text: 'text-emerald-100', shadow: 'shadow-emerald-900/50' },
    { spine: 'bg-red-700', cover: 'bg-red-600', text: 'text-red-100', shadow: 'shadow-red-900/50' },
    { spine: 'bg-purple-700', cover: 'bg-purple-600', text: 'text-purple-100', shadow: 'shadow-purple-900/50' },
    { spine: 'bg-amber-700', cover: 'bg-amber-600', text: 'text-amber-100', shadow: 'shadow-amber-900/50' },
    { spine: 'bg-pink-700', cover: 'bg-pink-600', text: 'text-pink-100', shadow: 'shadow-pink-900/50' }
  ]
  
  // 전역 실행 컨텍스트는 특별한 스타일
  const globalContextStyle = { 
    spine: 'bg-gray-600', 
    cover: 'bg-gray-500', 
    text: 'text-gray-100', 
    shadow: 'shadow-gray-700/50' 
  }
  
  const style = isGlobalContext ? globalContextStyle : bookStyles[index % bookStyles.length]
  
  // 스택처럼 쌓이는 책 - 가로로 넓고 세로로 얇게
  const bookWidth = 200 + (index % 3) * 20 // 200-240px 사이의 너비
  const bookHeight = 35 + (index % 3) * 5 // 35-45px 사이의 두께
  
  return (
    <div 
      className="relative flex-shrink-0"
      style={{ width: `${bookWidth}px`, height: `${bookHeight}px` }}
    >
      {/* 책 본체 - 스택처럼 쌓인 형태 */}
      <div className={cn(
        "h-full w-full rounded relative overflow-hidden",
        style.cover,
        style.shadow,
        "shadow-lg",
        isGlobalContext && "border-2 border-dashed border-gray-400"
      )}>
        {/* 책 두께 효과 - 3D 입체감 */}
        <div className={cn(
          "absolute -bottom-1 left-2 right-2 h-3 rounded-b",
          style.spine
        )} style={{
          transform: 'perspective(100px) rotateX(-45deg)',
          transformOrigin: 'top'
        }} />
        
        {/* 책 옆면 효과 */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-300 opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-300 opacity-30" />
        
        {/* 책 표지 텍스처 */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%),
              linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.1) 100%)
            `,
          }}
        />
        
        {/* 책 라벨 - 가로로 표시 */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center px-4",
          style.text
        )}>
          <span className="text-sm font-bold drop-shadow-sm text-center flex items-center gap-2">
            {isGlobalContext && <span className="text-xs">📍</span>}
            {item.name || item.functionName || (typeof item === 'string' ? item : 'Unknown')}
          </span>
        </div>
        
        {/* 스택 깊이 표시 (인덱스) */}
        <div className={cn(
          "absolute top-1 right-2 w-6 h-6 rounded-full flex items-center justify-center",
          "bg-white/80 text-xs font-bold",
          style.spine.replace('bg-', 'text-')
        )}>
          {index + 1}
        </div>
      </div>
    </div>
  )
}

/**
 * 펭귄 사서 애니메이션 컴포넌트
 */
const PenguinLibrarian: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [showPenguin, setShowPenguin] = React.useState(false)
  const [messageIndex, setMessageIndex] = React.useState(0)
  
  // 다양한 펭귄 메시지
  const messages = [
    "책 정리 완료!",
    "함수가 추가됐어요~",
    "콜스택 관리 중...",
    "LIFO 순서 확인!",
    "깔끔하게 정리했어요",
    "펭귄 도서관입니다 🐧"
  ]
  
  React.useEffect(() => {
    if (isActive) {
      setShowPenguin(true)
      setMessageIndex(Math.floor(Math.random() * messages.length))
      const timer = setTimeout(() => setShowPenguin(false), 5000) // 2초 → 5초로 변경
      return () => clearTimeout(timer)
    }
  }, [isActive])
  
  if (!showPenguin) return null
  
  return (
    <motion.div
      className="absolute right-4 bottom-4 pointer-events-none"
      initial={{ x: 100, opacity: 0 }}
      animate={{ 
        x: [100, 0, 0, 0, 0, 100],
        opacity: [0, 1, 1, 1, 1, 0]
      }}
      transition={{ 
        duration: 5,
        times: [0, 0.1, 0.2, 0.8, 0.9, 1],
        ease: "easeInOut"
      }}
    >
      {/* 펭귄 캐릭터 */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -5, 0],
          rotate: [0, 3, -3, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* SVG 펭귄 캐릭터 */}
        <svg width="60" height="80" viewBox="0 0 60 80" className="filter drop-shadow-lg">
          {/* 그림자 */}
          <ellipse cx="30" cy="75" rx="15" ry="3" fill="rgba(0,0,0,0.2)" />
          
          {/* 발 - 걷는 애니메이션 */}
          <motion.g>
            <motion.path
              d="M20 65 L15 72 L18 73 L22 72 L20 65"
              fill="#FFA500"
              animate={{
                rotate: [-10, 10, -10],
                y: [0, -2, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "20px 69px" }}
            />
            <motion.path
              d="M40 65 L38 72 L42 73 L45 72 L40 65"
              fill="#FFA500"
              animate={{
                rotate: [10, -10, 10],
                y: [-2, 0, -2]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "40px 69px" }}
            />
          </motion.g>
          
          {/* 몸통 (검은색 부분) */}
          <ellipse cx="30" cy="45" rx="22" ry="28" fill="#1a1a1a" />
          
          {/* 배 (흰색 부분) */}
          <ellipse cx="30" cy="48" rx="16" ry="22" fill="#FFFFFF" />
          
          {/* 왼쪽 날개/팔 */}
          <motion.path
            d="M8 35 Q5 40 8 50 Q10 52 12 50 L12 35 Q10 33 8 35"
            fill="#1a1a1a"
            animate={{
              d: [
                "M8 35 Q5 40 8 50 Q10 52 12 50 L12 35 Q10 33 8 35",
                "M6 38 Q3 43 6 48 Q8 50 10 48 L10 38 Q8 36 6 38",
                "M8 35 Q5 40 8 50 Q10 52 12 50 L12 35 Q10 33 8 35"
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* 오른쪽 날개/팔 - 책을 들고 있는 모습 */}
          <motion.g
            animate={{
              rotate: [0, -10, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "48px 40px" }}
          >
            <path d="M48 35 Q52 38 50 45 Q48 47 46 45 L48 35" fill="#1a1a1a" />
            {/* 들고 있는 책 */}
            <rect x="50" y="38" width="8" height="12" fill="#4169E1" rx="1" />
            <rect x="51" y="39" width="6" height="10" fill="#87CEEB" />
          </motion.g>
          
          {/* 머리 */}
          <circle cx="30" cy="22" r="15" fill="#1a1a1a" />
          
          {/* 얼굴 흰 부분 */}
          <ellipse cx="30" cy="24" rx="12" ry="10" fill="#FFFFFF" />
          
          {/* 눈 */}
          <motion.g
            animate={{
              scaleY: [1, 0.3, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <circle cx="25" cy="22" r="3" fill="#000000" />
            <circle cx="35" cy="22" r="3" fill="#000000" />
            <circle cx="26" cy="21" r="1" fill="#FFFFFF" />
            <circle cx="36" cy="21" r="1" fill="#FFFFFF" />
          </motion.g>
          
          {/* 부리 */}
          <motion.path
            d="M30 26 L27 28 L30 30 L33 28 Z"
            fill="#FFA500"
            animate={{
              d: [
                "M30 26 L27 28 L30 30 L33 28 Z",
                "M30 26 L27 28 L30 31 L33 28 Z",
                "M30 26 L27 28 L30 30 L33 28 Z"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* 모자 (선택적) */}
          <g>
            <rect x="20" y="10" width="20" height="2" fill="#8B4513" />
            <path d="M22 12 L22 8 L38 8 L38 12" fill="#8B4513" />
            <rect x="28" y="8" width="4" height="1" fill="#FFD700" />
          </g>
        </svg>
        
        {/* 말풍선 */}
        <motion.div
          className="absolute -top-12 -left-8 bg-white rounded-lg px-2 py-1 text-xs font-medium shadow-lg border"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-blue-600">{messages[messageIndex]}</div>
          {/* 말풍선 꼬리 */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </motion.div>
        
        {/* 반짝이 효과 */}
        <motion.div
          className="absolute -top-2 -right-2 text-yellow-400"
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.5
          }}
        >
          ✨
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// 유틸리티 함수들
function getVisualizationDescription(layoutType: string): string {
  switch (layoutType) {
    case 'A': return '함수 호출 순서 시각화'
    case 'A+': return 'LIFO 원칙과 시작/종료 추적'
    case 'B': return '이벤트 루프와 3개 큐 시스템'
    case 'C': return '5개 큐가 포함된 복잡한 시스템'
    case 'D': return '모든 큐가 통합된 마스터 레벨'
    default: return '콜스택 시각화'
  }
}

function getQueueConfig(queueType: string) {
  const configs = {
    callstack: {
      name: '콜스택',
      icon: '📥',
      borderColor: 'border-blue-500',
      itemStyle: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    microtask: {
      name: '마이크로태스크',
      icon: '⚡',
      borderColor: 'border-green-500',
      itemStyle: 'bg-green-100 border-green-300 text-green-800'
    },
    macrotask: {
      name: '매크로태스크',
      icon: '⏰',
      borderColor: 'border-yellow-500',
      itemStyle: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    animation: {
      name: '애니메이션',
      icon: '🎬',
      borderColor: 'border-purple-500',
      itemStyle: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    io: {
      name: 'I/O',
      icon: '💾',
      borderColor: 'border-red-500',
      itemStyle: 'bg-red-100 border-red-300 text-red-800'
    },
    worker: {
      name: 'Worker',
      icon: '👷',
      borderColor: 'border-gray-500',
      itemStyle: 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }
  
  return configs[queueType as keyof typeof configs] || configs.callstack
}