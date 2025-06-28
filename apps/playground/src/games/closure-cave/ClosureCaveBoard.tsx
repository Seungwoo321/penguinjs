'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameLevel, GameStagePosition } from '../shared/types'

interface ClosureCaveBoardProps {
  level: GameLevel
  penguinPath: GameStagePosition[] | null
  isAnimating: boolean
  onAnimationComplete: () => void
}

export function ClosureCaveBoard({ 
  level, 
  penguinPath,
  isAnimating,
  onAnimationComplete 
}: ClosureCaveBoardProps) {
  const [currentPenguinPosition, setCurrentPenguinPosition] = useState(
    level.gameBoard.character.startPosition
  )
  const [collectedTreasures, setCollectedTreasures] = useState<string[]>([])
  
  // 펭귄 이동 애니메이션
  useEffect(() => {
    if (!isAnimating || !penguinPath || penguinPath.length === 0) {
      setCurrentPenguinPosition(level.gameBoard.character.startPosition)
      setCollectedTreasures([])
      return
    }
    
    let pathIndex = 0
    const animationInterval = setInterval(() => {
      if (pathIndex < penguinPath.length) {
        const newPosition = penguinPath[pathIndex]
        const prevPosition = pathIndex > 0 ? penguinPath[pathIndex - 1] : level.gameBoard.character.startPosition
        
        // 장애물이 있는지 확인
        const hasObstacle = level.gameBoard.obstacles?.some(
          o => o.position.row === newPosition.row && o.position.col === newPosition.col
        )
        
        // 점프가 필요한지 확인 (장애물이 있거나 대각선 이동)
        const needsJump = hasObstacle || 
          (Math.abs(newPosition.row - prevPosition.row) + Math.abs(newPosition.col - prevPosition.col) > 1)
        
        setCurrentPenguinPosition(newPosition)
        
        // 보물 수집 체크
        level.gameBoard.items.forEach(treasure => {
          if (treasure.position.row === newPosition.row && 
              treasure.position.col === newPosition.col) {
            setCollectedTreasures(prev => {
              if (!prev.includes(treasure.id)) {
                return [...prev, treasure.id]
              }
              return prev
            })
          }
        })
        
        pathIndex++
      } else {
        clearInterval(animationInterval)
        onAnimationComplete()
      }
    }, 600)
    
    return () => clearInterval(animationInterval)
  }, [isAnimating, penguinPath, level, onAnimationComplete])
  
  // 그리드 생성
  const renderGrid = () => {
    const grid = []
    const { rows, cols } = level.gameBoard.grid
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isStart = row === level.gameBoard.character.startPosition.row && 
                       col === level.gameBoard.character.startPosition.col
        const isTarget = row === level.gameBoard.character.targetPosition.row && 
                        col === level.gameBoard.character.targetPosition.col
        
        // 현재 위치에 있는 보물 찾기
        const treasure = level.gameBoard.items.find(
          t => t.position.row === row && t.position.col === col
        )
        
        // 현재 위치에 있는 장애물 찾기
        const obstacle = level.gameBoard.obstacles?.find(
          o => o.position.row === row && o.position.col === col
        )
        
        grid.push(
          <div
            key={`${row}-${col}`}
            className={`
              relative w-16 h-16 border-2 flex items-center justify-center
              ${isStart ? 'bg-green-100 dark:bg-green-900/30 border-green-400' : ''}
              ${isTarget ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400' : ''}
              ${!isStart && !isTarget ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : ''}
            `}
          >
            {/* 시작 지점 표시 */}
            {isStart && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-green-800 dark:text-green-200 font-bold">
                START
              </div>
            )}
            
            {/* 목표 지점 표시 */}
            {isTarget && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-yellow-800 dark:text-yellow-200 font-bold">
                GOAL
              </div>
            )}
            
            {/* 장애물 표시 */}
            {obstacle && (
              <div className="absolute inset-0 flex items-center justify-center">
                {obstacle.type === 'rock' && (
                  <div className="w-12 h-12 bg-gray-600 rounded-lg border-2 border-gray-700 shadow-md flex items-center justify-center">
                    <span className="text-2xl">🪨</span>
                  </div>
                )}
                {obstacle.type === 'ice' && (
                  <div className="w-12 h-12 bg-cyan-200/50 rounded-lg border-2 border-cyan-400 shadow-md flex items-center justify-center">
                    <span className="text-2xl">🧊</span>
                  </div>
                )}
                {obstacle.type === 'water' && (
                  <div className="w-12 h-12 bg-blue-400/30 rounded-full border-2 border-blue-500 shadow-md flex items-center justify-center">
                    <span className="text-2xl">💧</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 보물 표시 */}
            {treasure && !collectedTreasures.includes(treasure.id) && !obstacle && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`
                  text-2xl z-10
                  ${treasure.locked ? 'opacity-50' : ''}
                `}>
                  {treasure.value}
                  {treasure.locked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl">🔒</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* 펭귄 표시 */}
            <AnimatePresence>
              {currentPenguinPosition.row === row && currentPenguinPosition.col === col && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <motion.div
                    animate={{ 
                      y: level.id === 'level-2' && isAnimating ? [0, -20, 0] : [0, -8, 0],
                      rotate: level.id === 'level-2' && isAnimating ? [0, -15, 15, 0] : [0, -10, 10, 0],
                      scale: level.id === 'level-2' && isAnimating ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      duration: level.id === 'level-2' && isAnimating ? 0.6 : 1.5,
                      repeat: level.id === 'level-2' && isAnimating ? 0 : Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-3xl"
                  >
                    🐧
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      }
    }
    
    return grid
  }
  
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          {level.objective}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span>수집한 보물:</span>
          {collectedTreasures.length > 0 ? (
            <div className="flex gap-1">
              {collectedTreasures.map(id => {
                const treasure = level.gameBoard.items.find(t => t.id === id)
                return treasure ? (
                  <span key={id} className="text-lg">{treasure.value}</span>
                ) : null
              })}
            </div>
          ) : (
            <span className="text-slate-700 dark:text-slate-400">없음</span>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <div 
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${level.gameBoard.grid.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.gameBoard.grid.rows}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {renderGrid()}
        </div>
      </div>
      
      {/* 애니메이션 상태 표시 */}
      {isAnimating && (
        <div className="mt-4 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-blue-600 dark:text-blue-400"
          >
            펭귄이 이동 중입니다...
          </motion.div>
        </div>
      )}
    </div>
  )
}