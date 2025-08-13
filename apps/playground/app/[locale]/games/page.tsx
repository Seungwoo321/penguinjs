'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { Home, ChevronRight, Trophy, Clock, Star } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameManager } from '@/games/shared/GameManager'

// 카테고리별 게임 그룹핑
const getGameCategories = (t: any) => ({
  [t('categories.basicConcepts.name')]: {
    icon: '📚',
    description: t('categories.basicConcepts.description'),
    gameIds: ['closure-cave', 'scope-forest', 'hoisting-helicopter']
  },
  [t('categories.functionsExecution.name')]: {
    icon: '⚡',
    description: t('categories.functionsExecution.description'),
    gameIds: ['callstack-library', 'this-binding', 'prototype-chain']
  },
  [t('categories.asyncProcessing.name')]: {
    icon: '⏱️',
    description: t('categories.asyncProcessing.description'),
    gameIds: ['promise-battle', 'async-airways', 'eventloop-cinema']
  },
  [t('categories.advancedFeatures.name')]: {
    icon: '🔧',
    description: t('categories.advancedFeatures.description'),
    gameIds: ['proxy-laboratory', 'weakmap-vault', 'memory-museum']
  },
  [t('categories.practicalSkills.name')]: {
    icon: '💡',
    description: t('categories.practicalSkills.description'),
    gameIds: ['array-methods-racing', 'modules-marketplace', 'error-handling-hospital']
  },
  [t('categories.domEvents.name')]: {
    icon: '🎯',
    description: t('categories.domEvents.description'),
    gameIds: ['event-target', 'destructuring-circus', 'template-literal-art']
  }
})

// 게임 난이도 정의
const gameDifficulty = {
  'closure-cave': 2,
  'callstack-library': 3,
  'promise-battle': 3,
  'async-airways': 3,
  'proxy-laboratory': 4,
  'event-target': 2,
  'prototype-chain': 3,
  'eventloop-cinema': 4,
  'memory-museum': 4,
  'scope-forest': 1,
  'hoisting-helicopter': 2,
  'this-binding': 3,
  'destructuring-circus': 2,
  'array-methods-racing': 2,
  'modules-marketplace': 3,
  'template-literal-art': 2,
  'error-handling-hospital': 3,
  'weakmap-vault': 4
}

// 예상 완료 시간 (분)
const gameEstimatedTime = {
  'closure-cave': 45,
  'callstack-library': 60,
  'promise-battle': 50,
  'async-airways': 55,
  'proxy-laboratory': 70,
  'event-target': 40,
  'prototype-chain': 55,
  'eventloop-cinema': 65,
  'memory-museum': 60,
  'scope-forest': 30,
  'hoisting-helicopter': 40,
  'this-binding': 50,
  'destructuring-circus': 35,
  'array-methods-racing': 45,
  'modules-marketplace': 50,
  'template-literal-art': 35,
  'error-handling-hospital': 55,
  'weakmap-vault': 65
}

// 게임별 사전 지식 요구사항
const gamePrerequisites = {
  'closure-cave': ['scope-forest'],
  'callstack-library': ['scope-forest', 'hoisting-helicopter'],
  'promise-battle': ['callstack-library'],
  'async-airways': ['promise-battle'],
  'proxy-laboratory': ['closure-cave', 'this-binding'],
  'event-target': [],
  'prototype-chain': ['this-binding'],
  'eventloop-cinema': ['callstack-library', 'promise-battle'],
  'memory-museum': ['closure-cave', 'weakmap-vault'],
  'scope-forest': [],
  'hoisting-helicopter': [],
  'this-binding': ['scope-forest'],
  'destructuring-circus': [],
  'array-methods-racing': [],
  'modules-marketplace': ['scope-forest', 'hoisting-helicopter'],
  'template-literal-art': [],
  'error-handling-hospital': ['promise-battle'],
  'weakmap-vault': ['closure-cave']
}

// 게임별 다음 추천 게임
const gameNextRecommendations = {
  'scope-forest': ['hoisting-helicopter', 'closure-cave'],
  'hoisting-helicopter': ['callstack-library', 'modules-marketplace'],
  'closure-cave': ['proxy-laboratory', 'weakmap-vault'],
  'callstack-library': ['promise-battle', 'eventloop-cinema'],
  'promise-battle': ['async-airways', 'error-handling-hospital'],
  'async-airways': ['eventloop-cinema'],
  'this-binding': ['prototype-chain', 'proxy-laboratory'],
  'event-target': ['destructuring-circus'],
  'prototype-chain': ['proxy-laboratory'],
  'eventloop-cinema': ['memory-museum'],
  'destructuring-circus': ['array-methods-racing'],
  'array-methods-racing': ['modules-marketplace'],
  'template-literal-art': ['destructuring-circus'],
  'modules-marketplace': ['error-handling-hospital'],
  'error-handling-hospital': ['memory-museum'],
  'proxy-laboratory': ['memory-museum'],
  'weakmap-vault': ['memory-museum'],
  'memory-museum': []
}

// 학습 경로별 추천 게임 (초보자, 중급자, 고급자)
const learningPaths = {
  beginner: ['scope-forest', 'hoisting-helicopter', 'closure-cave'],
  intermediate: ['callstack-library', 'promise-battle', 'this-binding'],
  advanced: ['proxy-laboratory', 'eventloop-cinema', 'memory-museum']
}

export default function GamesPage() {
  const t = useTranslations('GamesPage')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [userProgress, setUserProgress] = useState<{
    completedGames: string[]
    gameScores: Record<string, { completedStages: number, totalStages: number }>
  }>({ completedGames: [], gameScores: {} })

  const gameCategories = getGameCategories(t)

  // GameManager에서 진행도 데이터 가져오기
  useEffect(() => {
    const gameManager = GameManager.getInstance()
    const allProgress = gameManager.getAllGameProgress()
    
    const completedGames: string[] = []
    const gameScores: Record<string, { completedStages: number, totalStages: number }> = {}
    
    // 각 게임별로 진행도 계산
    allGames.forEach(game => {
      let totalCompleted = 0
      let totalStages = 0
      
      // 각 난이도별 진행도 확인
      ;['beginner', 'intermediate', 'advanced'].forEach(difficulty => {
        const progress = allProgress.get(`${game.id}-${difficulty}`)
        if (progress) {
          totalCompleted += progress.completedStages.size
          totalStages += 8 // 각 난이도별 8스테이지
        }
      })
      
      if (totalCompleted > 0) {
        gameScores[game.id] = { completedStages: totalCompleted, totalStages: 24 }
        
        // 모든 스테이지를 완료한 경우 게임 완료로 표시
        if (totalCompleted === 24) {
          completedGames.push(game.id)
        }
      }
    })
    
    setUserProgress({ completedGames, gameScores })
  }, [])
  
  // 전체 18개 게임 데이터
  const allGames = [
    {
      id: 'closure-cave',
      title: t('games.closureCave.title'),
      icon: '🕳️',
      description: t('games.closureCave.description'),
      concepts: t('games.closureCave.concepts'),
      type: t('games.closureCave.type'),
      stages: 15,
      isImplemented: true,
      href: 'closure-cave-enhanced'
    },
    {
      id: 'callstack-library',
      title: t('games.callstackLibrary.title'),
      icon: '📚',
      description: t('games.callstackLibrary.description'),
      concepts: t('games.callstackLibrary.concepts'),
      type: t('games.callstackLibrary.type'),
      stages: 24,
      isImplemented: true,
      href: 'callstack-library'
    },
    {
      id: 'promise-battle',
      title: t('games.promiseBattle.title'),
      icon: '⚔️',
      description: t('games.promiseBattle.description'),
      concepts: t('games.promiseBattle.concepts'),
      type: t('games.promiseBattle.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'async-airways',
      title: t('games.asyncAirways.title'),
      icon: '✈️',
      description: t('games.asyncAirways.description'),
      concepts: t('games.asyncAirways.concepts'),
      type: t('games.asyncAirways.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'proxy-laboratory',
      title: t('games.proxyLaboratory.title'),
      icon: '🪞',
      description: t('games.proxyLaboratory.description'),
      concepts: t('games.proxyLaboratory.concepts'),
      type: t('games.proxyLaboratory.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'event-target',
      title: t('games.eventTarget.title'),
      icon: '🎯',
      description: t('games.eventTarget.description'),
      concepts: t('games.eventTarget.concepts'),
      type: t('games.eventTarget.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'prototype-chain',
      title: t('games.prototypeChain.title'),
      icon: '🔗',
      description: t('games.prototypeChain.description'),
      concepts: t('games.prototypeChain.concepts'),
      type: t('games.prototypeChain.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'eventloop-cinema',
      title: t('games.eventloopCinema.title'),
      icon: '🎬',
      description: t('games.eventloopCinema.description'),
      concepts: t('games.eventloopCinema.concepts'),
      type: t('games.eventloopCinema.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'memory-museum',
      title: t('games.memoryMuseum.title'),
      icon: '🧠',
      description: t('games.memoryMuseum.description'),
      concepts: t('games.memoryMuseum.concepts'),
      type: t('games.memoryMuseum.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'scope-forest',
      title: t('games.scopeForest.title'),
      icon: '🌳',
      description: t('games.scopeForest.description'),
      concepts: t('games.scopeForest.concepts'),
      type: t('games.scopeForest.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'hoisting-helicopter',
      title: t('games.hoistingHelicopter.title'),
      icon: '🚁',
      description: t('games.hoistingHelicopter.description'),
      concepts: t('games.hoistingHelicopter.concepts'),
      type: t('games.hoistingHelicopter.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'this-binding',
      title: t('games.thisBinding.title'),
      icon: '🎯',
      description: t('games.thisBinding.description'),
      concepts: t('games.thisBinding.concepts'),
      type: t('games.thisBinding.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'destructuring-circus',
      title: t('games.destructuringCircus.title'),
      icon: '🎪',
      description: t('games.destructuringCircus.description'),
      concepts: t('games.destructuringCircus.concepts'),
      type: t('games.destructuringCircus.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'array-methods-racing',
      title: t('games.arrayMethodsRacing.title'),
      icon: '🏎️',
      description: t('games.arrayMethodsRacing.description'),
      concepts: t('games.arrayMethodsRacing.concepts'),
      type: t('games.arrayMethodsRacing.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'modules-marketplace',
      title: t('games.modulesMarketplace.title'),
      icon: '🏪',
      description: t('games.modulesMarketplace.description'),
      concepts: t('games.modulesMarketplace.concepts'),
      type: t('games.modulesMarketplace.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'template-literal-art',
      title: t('games.templateLiteralArt.title'),
      icon: '🎨',
      description: t('games.templateLiteralArt.description'),
      concepts: t('games.templateLiteralArt.concepts'),
      type: t('games.templateLiteralArt.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'error-handling-hospital',
      title: t('games.errorHandlingHospital.title'),
      icon: '🏥',
      description: t('games.errorHandlingHospital.description'),
      concepts: t('games.errorHandlingHospital.concepts'),
      type: t('games.errorHandlingHospital.type'),
      stages: 15,
      isImplemented: false
    },
    {
      id: 'weakmap-vault',
      title: t('games.weakmapVault.title'),
      icon: '🗝️',
      description: t('games.weakmapVault.description'),
      concepts: t('games.weakmapVault.concepts'),
      type: t('games.weakmapVault.type'),
      stages: 15,
      isImplemented: false
    }
  ]

  // 카테고리별로 게임 필터링
  const getGamesForCategory = (categoryName: string) => {
    const category = gameCategories[categoryName]
    if (!category) return []
    return allGames.filter(game => category.gameIds.includes(game.id))
  }

  // 완료된 게임 수 계산 (사용자 진행도)
  const getCompletedCount = (categoryName: string) => {
    const games = getGamesForCategory(categoryName)
    return games.filter(game => userProgress.completedGames.includes(game.id)).length
  }

  // 필터링된 게임 목록
  const filteredGames = selectedCategory 
    ? getGamesForCategory(selectedCategory)
    : allGames

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-primary))] relative">
      {/* 플로팅 컨트롤 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link 
          href={`/${currentLocale}`}
          className="p-2 rounded-lg bg-[rgb(var(--surface-elevated))] hover:bg-[rgb(var(--surface-secondary))] transition-all shadow-lg"
          title={t('homeTitle')}
        >
          <Home className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 bg-[rgb(var(--surface-elevated))] rounded-lg p-1 shadow-lg">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full px-4 py-12">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <span className="text-5xl">🐧</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--text-primary))]">
              {t('gameCollection')}
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-[rgb(var(--text-secondary))] mb-8"
          >
            {t('masterJavaScript')}
          </motion.p>
          
          {/* 진행 현황 통계 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            {/* 전체 진행도 원형 차트와 통계 */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
              {/* 원형 진행도 차트 */}
              <div className="bg-[rgb(var(--surface-elevated))] rounded-2xl p-8 shadow-lg">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-6 text-center">{t('progress.overallProgress')}</h3>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  {/* 배경 원 */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgb(var(--border-primary))"
                      strokeWidth="16"
                      fill="none"
                    />
                    {/* 진행도 원 */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgb(var(--primary))"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - userProgress.completedGames.length / 18)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  {/* 중앙 텍스트 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[rgb(var(--primary))]">{Math.round((userProgress.completedGames.length / 18) * 100)}%</div>
                      <div className="text-sm text-[rgb(var(--text-tertiary))]">{t('progress.completed')}</div>
                    </div>
                  </div>
                </div>
                {/* 예상 완료 시간 */}
                <div className="text-center">
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {userProgress.completedGames.length > 0 ? (
                      t('progress.completionEstimate', { 
                        months: Math.ceil((18 - userProgress.completedGames.length) / (userProgress.completedGames.length / 30))
                      })
                    ) : (
                      t('progress.startFirstGame')
                    )}
                  </p>
                </div>
              </div>

              {/* 숫자 통계 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--primary))]">{userProgress.completedGames.length}/18</div>
                  <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">{t('progress.completedGames')}</div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2">
                    <div className="h-full bg-[rgb(var(--primary))] rounded-full transition-all duration-1000" style={{ width: `${(userProgress.completedGames.length / 18) * 100}%` }}></div>
                  </div>
                </div>
                <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center">
                  <div className="text-2xl font-bold text-green-600">{Object.values(userProgress.gameScores).reduce((sum, score) => sum + score.completedStages, 0)}/432</div>
                  <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">{t('progress.completedStages')}</div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2">
                    <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: `${(Object.values(userProgress.gameScores).reduce((sum, score) => sum + score.completedStages, 0) / 432) * 100}%` }}></div>
                  </div>
                </div>
                <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center">
                  <div className="text-2xl font-bold text-blue-600">{userProgress.completedGames.reduce((sum, gameId) => sum + (gameEstimatedTime[gameId] || 0), 0)}{t('gameCard.minutes')}</div>
                  <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">학습한 시간</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">약 {(userProgress.completedGames.reduce((sum, gameId) => sum + (gameEstimatedTime[gameId] || 0), 0) / 60).toFixed(1)}시간</div>
                </div>
                <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg flex flex-col justify-center items-center text-center">
                  <div className="text-2xl font-bold text-purple-600">{18 - userProgress.completedGames.length}</div>
                  <div className="text-sm text-[rgb(var(--text-tertiary))] mt-1">남은 게임</div>
                  <div className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">도전 대기중</div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* 카테고리 네비게이션 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">카테고리별 탐색</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-[rgb(var(--primary))] hover:underline"
              >
                전체 보기
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(gameCategories).map(([categoryName, category]) => {
              const completedCount = getCompletedCount(categoryName)
              const totalCount = category.gameIds.length
              const isSelected = selectedCategory === categoryName

              return (
                <motion.button
                  key={categoryName}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(isSelected ? null : categoryName)}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-[rgb(var(--primary))] text-white shadow-xl' 
                      : 'bg-[rgb(var(--surface-elevated))] hover:bg-[rgb(var(--surface-secondary))] shadow-lg'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className={`font-medium text-sm mb-1 ${
                    isSelected ? 'text-white' : 'text-[rgb(var(--text-primary))]'
                  }`}>
                    {categoryName}
                  </h3>
                  <div className={`text-xs ${
                    isSelected ? 'text-white/80' : 'text-[rgb(var(--text-tertiary))]'
                  }`}>
                    {completedCount}/{totalCount} 완료
                  </div>
                  {(completedCount > 0 || category.gameIds.some(id => userProgress.gameScores[id])) && (
                    <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isSelected ? 'bg-white/50' : 'bg-[rgb(var(--primary))]'
                        }`}
                        style={{ width: `${(completedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* 선택된 카테고리 설명 */}
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto mb-8"
          >
            <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{gameCategories[selectedCategory].icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">{selectedCategory}</h3>
                  <p className="text-[rgb(var(--text-secondary))]">{gameCategories[selectedCategory].description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 게임 그리드 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GameCard 
                game={game} 
                userProgress={userProgress}
                allGames={allGames}
                isRecommended={learningPaths.beginner.includes(game.id) && userProgress.completedGames.length === 0}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* 하단 안내 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 p-8 bg-[rgb(var(--surface-elevated))] rounded-xl max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
            {t('footer.title')}
          </h3>
          <p className="text-[rgb(var(--text-secondary))] mb-2">
            {t('footer.description')}
          </p>
          <p className="text-sm text-[rgb(var(--text-tertiary))]">
            {t('footer.encouragement')}
          </p>
        </motion.div>
      </div>
    </main>
  )
}

function GameCard({ 
  game, 
  userProgress,
  allGames,
  isRecommended = false
}: { 
  game: any
  userProgress: {
    completedGames: string[]
    gameScores: Record<string, { completedStages: number, totalStages: number }>
  }
  allGames: any[]
  isRecommended?: boolean
}) {
  const t = useTranslations('GamesPage')
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  const gameUrl = game.isImplemented ? `/${currentLocale}/games/${game.href}` : '#'
  const isClickable = game.isImplemented
  const difficulty = gameDifficulty[game.id] || 2
  const estimatedTime = gameEstimatedTime[game.id] || 45
  
  // 게임 진행도 확인
  const gameProgress = userProgress.gameScores[game.id]
  const isCompleted = userProgress.completedGames.includes(game.id)
  const isInProgress = gameProgress && gameProgress.completedStages > 0 && !isCompleted
  
  // 사전 요구사항 확인
  const prerequisites = gamePrerequisites[game.id] || []
  const hasCompletedPrerequisites = prerequisites.every(prereqId => 
    userProgress.completedGames.includes(prereqId)
  )
  
  // 다음 추천 게임인지 확인
  const isNextRecommended = userProgress.completedGames.some(completedId => {
    const recommendations = gameNextRecommendations[completedId] || []
    return recommendations.includes(game.id)
  })
  
  return (
    <div className={`relative ${!isClickable ? 'cursor-not-allowed' : ''}`}>
      <Link 
        href={gameUrl} 
        className={`group block ${!isClickable ? 'pointer-events-none' : ''}`}
        onClick={!isClickable ? (e) => e.preventDefault() : undefined}
      >
        <div className={`bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg transition-all duration-300 border border-[rgb(var(--border))] h-full ${
          isClickable ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-60'
        }`}>
          {/* 상태 배지 */}
          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
            {isCompleted && (
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ✅ {t('gameCard.completed')}
              </span>
            )}
            {isInProgress && (
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                🔄 {t('gameCard.inProgress')} {gameProgress.completedStages}/24
              </span>
            )}
            {(isRecommended || isNextRecommended) && !isCompleted && (
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                ⭐ 추천
              </span>
            )}
            {!game.isImplemented && (
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                🔒 {t('gameCard.comingSoon')}
              </span>
            )}
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="text-3xl p-3 bg-[rgb(var(--surface-secondary))] rounded-lg">
              {game.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors mb-1">
                {game.title}
              </h3>
              <div className="text-sm text-[rgb(var(--text-tertiary))]">
                {game.type}
              </div>
            </div>
          </div>
          
          <p className="text-[rgb(var(--text-secondary))] leading-relaxed mb-4">
            {game.description}
          </p>

          {/* 난이도와 예상 시간 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < difficulty 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
              <span className="text-xs text-[rgb(var(--text-tertiary))] ml-1">
                {difficulty === 1 ? t('gameCard.difficulty.beginner') : difficulty === 2 ? t('gameCard.difficulty.basic') : difficulty === 3 ? t('gameCard.difficulty.intermediate') : difficulty === 4 ? t('gameCard.difficulty.advanced') : t('gameCard.difficulty.expert')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[rgb(var(--text-tertiary))]">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{estimatedTime}{t('gameCard.minutes')}</span>
            </div>
          </div>
          
          {/* 학습 개념 태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {game.concepts.split(', ').map((concept: string) => (
              <span key={concept} className="text-xs px-2 py-1 bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-tertiary))] rounded-full">
                {concept}
              </span>
            ))}
          </div>
          
          {/* 사전 요구사항 또는 다음 추천 게임 */}
          {prerequisites.length > 0 && !hasCompletedPrerequisites && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-yellow-900/20 rounded-lg border border-amber-300 dark:border-yellow-800/30">
              <p className="text-xs text-amber-900 dark:text-yellow-200 font-semibold">
                🔐 {t('gameCard.prerequisiteRequired')}: {prerequisites.map(prereqId => 
                  allGames.find(g => g.id === prereqId)?.title
                ).filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          
          {isNextRecommended && !isCompleted && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
              <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
                💡 {t('gameCard.nextRecommended')}
              </p>
            </div>
          )}
          
          {/* 게임 정보 및 진행도 */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[rgb(var(--text-tertiary))]">
              {game.stages}{t('gameCard.stages')}
            </span>
            <span className="text-xs text-[rgb(var(--text-tertiary))]">
              {t('gameCard.difficulties')}
            </span>
          </div>
          
          {/* 진행도 바 */}
          {gameProgress && (
            <div className="mb-2">
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary))]/80 rounded-full transition-all duration-500"
                  style={{ width: `${(gameProgress.completedStages / 24) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {/* 호버 효과 */}
          {isClickable && (
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center text-[rgb(var(--primary))] text-sm font-medium">
                {isCompleted ? t('gameCard.playAgain') : isInProgress ? t('gameCard.continueGame') : t('gameCard.startGame')}
                <span className="ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}