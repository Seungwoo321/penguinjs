'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClosureCaveGameStage } from '@/games/closure-cave/game-stages'

interface ClosureCaveGameProps {
  stage: ClosureCaveGameStage
  onComplete: () => void
  testResults: any
}

export function ClosureCaveGame({ stage, onComplete, testResults }: ClosureCaveGameProps) {
  const [collectedTreasures, setCollectedTreasures] = useState<string[]>([])
  const [penguinPosition, setPenguinPosition] = useState(stage.gameElements?.penguin?.position || { x: 50, y: 300 })
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // 테스트 통과 시 보물 수집 애니메이션
    if (testResults?.passed === testResults?.total && testResults?.total > 0) {
      const treasures = stage.gameElements?.treasures || []
      treasures.forEach((treasure, index) => {
        setTimeout(() => {
          setCollectedTreasures(prev => [...prev, treasure.id])
          
          // 펭귄 이동 애니메이션
          setPenguinPosition(treasure.position)
        }, index * 500)
      })

      // 모든 보물 수집 후 성공 메시지
      setTimeout(() => {
        setShowSuccess(true)
        setTimeout(onComplete, 2000)
      }, treasures.length * 500 + 1000)
    }
  }, [testResults, stage.gameElements, onComplete])

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {/* 동굴 배경 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/cave-texture.png')] opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      {/* 게임 목표 */}
      <div className="absolute top-4 left-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
        <p className="text-yellow-100 text-sm font-medium">{stage.gameGoal}</p>
      </div>

      {/* 장애물 */}
      {stage.gameElements?.obstacles?.map((obstacle, index) => (
        <div
          key={index}
          className="absolute w-12 h-12"
          style={{ left: obstacle.position.x, top: obstacle.position.y }}
        >
          {obstacle.type === 'ice' && (
            <div className="w-full h-full bg-cyan-300/30 rounded-lg border-2 border-cyan-400 shadow-lg shadow-cyan-400/20" />
          )}
          {obstacle.type === 'rock' && (
            <div className="w-full h-full bg-gray-600 rounded-lg border-2 border-gray-700" />
          )}
          {obstacle.type === 'water' && (
            <div className="w-full h-full bg-blue-500/30 rounded-full border-2 border-blue-400 animate-pulse" />
          )}
        </div>
      ))}

      {/* 보물 */}
      <AnimatePresence>
        {stage.gameElements?.treasures?.map((treasure) => (
          !collectedTreasures.includes(treasure.id) && (
            <motion.div
              key={treasure.id}
              className="absolute"
              style={{ left: treasure.position.x, top: treasure.position.y }}
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              exit={{ 
                scale: 0,
                opacity: 0,
                transition: { duration: 0.5 }
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-400/50 border-2 border-yellow-500">
                  <span className="text-2xl">{treasure.icon}</span>
                </div>
                <p className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap">
                  {treasure.name}
                </p>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* 출구 포털 */}
      {stage.gameElements?.exitPortal && (
        <motion.div
          className="absolute"
          style={{ 
            left: stage.gameElements.exitPortal.position.x, 
            top: stage.gameElements.exitPortal.position.y 
          }}
          animate={showSuccess ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className={`w-20 h-20 rounded-full ${
            showSuccess 
              ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-400/50' 
              : 'bg-gray-700 opacity-50'
          } flex items-center justify-center`}>
            <span className="text-2xl">{showSuccess ? '✨' : '🚪'}</span>
          </div>
        </motion.div>
      )}

      {/* 펭귄 캐릭터 */}
      <motion.div
        className="absolute z-10"
        animate={penguinPosition}
        transition={{ type: "spring", stiffness: 50, damping: 10 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className="w-14 h-14 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🐧</span>
          </div>
          {stage.gameElements?.penguin?.animation === 'casting' && (
            <motion.div
              className="absolute -inset-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full border-2 border-purple-400 border-dashed" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* 성공 메시지 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold text-white mb-2">🎉 성공!</h3>
              <p className="text-white/90">모든 보물을 획득했습니다!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 수집한 보물 표시 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {collectedTreasures.map((treasureId) => {
          const treasure = stage.gameElements?.treasures?.find(t => t.id === treasureId)
          return treasure ? (
            <motion.div
              key={treasureId}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center border border-yellow-400"
            >
              <span className="text-lg">{treasure.icon}</span>
            </motion.div>
          ) : null
        })}
      </div>
    </div>
  )
}