'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { initializeGames } from '@/lib/games'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import { GameManager } from '@/games/shared/GameManager'

const sections = ['hero', 'games', 'cta']

// 타이핑 애니메이션 컴포넌트
function TypewriterText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }
    }, delay + currentIndex * 60)

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay])

  return (
    <h1 className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block ml-1"
      >
        |
      </motion.span>
    </h1>
  )
}

// 숫자 카운트업 컴포넌트
function CountUp({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!hasStarted) return
    
    const steps = Math.abs(to - from)
    const stepDuration = (duration * 1000) / steps
    
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === to) {
          clearInterval(timer)
          return prev
        }
        return prev < to ? prev + 1 : prev - 1
      })
    }, stepDuration)

    return () => clearInterval(timer)
  }, [from, to, duration, hasStarted])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true }}
    >
      {count}
    </motion.span>
  )
}

function ProgressIndicator({ activeSection }: { activeSection: number }) {
  return (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => {
              const element = document.getElementById(section)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === activeSection
                ? 'bg-[rgb(var(--primary))] shadow-lg'
                : 'bg-[rgb(var(--border-primary))] hover:bg-[rgb(var(--text-tertiary))]'
            }`}
            title={section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          />
        ))}
      </div>
      
      {/* 진행률 라인 */}
      <div className="absolute left-1/2 top-1.5 bottom-1.5 w-px bg-[rgb(var(--border-primary))] transform -translate-x-1/2 -z-10" />
      <div 
        className="absolute left-1/2 top-1.5 w-px bg-[rgb(var(--primary))] transform -translate-x-1/2 transition-all duration-500" 
        style={{ height: `${(activeSection / (sections.length - 1)) * (100 - 12)}%` }}
      />
    </div>
  )
}

export default function HomePage() {
  const t = useTranslations('HomePage')
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  const [activeSection, setActiveSection] = useState(0)
  const [userProgress, setUserProgress] = useState<{
    completedGames: string[]
    gameScores: Record<string, { completedStages: number, totalStages: number }>
  }>({ completedGames: [], gameScores: {} })
  
  // 패럴랙스 스크롤을 위한 scroll progress
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3])
  
  // 게임 초기화
  initializeGames()
  
  // GameManager에서 진행도 데이터 가져오기
  useEffect(() => {
    const gameManager = GameManager.getInstance()
    const allProgress = gameManager.getAllGameProgress()
    
    const completedGames: string[] = []
    const gameScores: Record<string, { completedStages: number, totalStages: number }> = {}
    
    // 각 게임별로 진행도 계산
    const gameIds = ['closure-cave', 'callstack-library']
    gameIds.forEach(gameId => {
      let totalCompleted = 0
      let totalStages = 0
      
      // 각 난이도별 진행도 확인
      ;['beginner', 'intermediate', 'advanced'].forEach(difficulty => {
        const progress = allProgress.get(`${gameId}-${difficulty}`)
        if (progress) {
          totalCompleted += progress.completedStages.size
          totalStages += 8 // 각 난이도별 8스테이지
        }
      })
      
      if (totalCompleted > 0) {
        gameScores[gameId] = { completedStages: totalCompleted, totalStages: 24 }
        
        // 모든 스테이지를 완료한 경우 게임 완료로 표시
        if (totalCompleted === 24) {
          completedGames.push(gameId)
        }
      }
    })
    
    setUserProgress({ completedGames, gameScores })
  }, [])
  
  // 스크롤 감지로 활성 섹션 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => 
        document.getElementById(section)
      )
      
      const scrollPosition = window.scrollY + window.innerHeight / 2
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(i)
          break
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-primary))] relative">
      {/* 플로팅 컨트롤 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[rgb(var(--surface-elevated))] rounded-lg p-1 shadow-lg">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      {/* 진행률 인디케이터 */}
      <ProgressIndicator activeSection={activeSection} />
      
      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* 패럴랙스 배경 */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--penguin-50))] via-transparent to-[rgb(var(--penguin-100))] dark:from-[rgb(var(--slate-900))] dark:to-[rgb(var(--slate-800))] -z-10"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-8 flex-wrap">
            <span className="text-5xl md:text-6xl">🐧</span>
            <TypewriterText 
              text="PenguinJS" 
              className="text-5xl md:text-6xl font-bold text-[rgb(var(--text-primary))]"
              delay={300}
            />
          </div>
          <p className="text-2xl md:text-3xl font-medium text-[rgb(var(--text-primary))] mb-6">
            {t('subtitle')}
          </p>
          <p className="text-lg text-[rgb(var(--text-secondary))] leading-relaxed mb-8 max-w-2xl mx-auto">
            {t('detailedDescription')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[rgb(var(--text-tertiary))]">
            <span className="px-3 py-1 bg-[rgb(var(--surface-elevated))] rounded-full">React 19</span>
            <span className="px-3 py-1 bg-[rgb(var(--surface-elevated))] rounded-full">Next.js 15</span>
            <span className="px-3 py-1 bg-[rgb(var(--surface-elevated))] rounded-full">TypeScript</span>
            <span className="px-3 py-1 bg-[rgb(var(--surface-elevated))] rounded-full">Framer Motion</span>
          </div>
        </motion.div>
      </section>

      {/* Games Section */}
      <section id="games" className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[rgb(var(--text-primary))] mb-6">
              {t('availableGames')}
            </h2>
            <p className="text-lg text-[rgb(var(--text-secondary))] max-w-2xl mx-auto mb-8">
              {t('availableGames') === '체험 가능한 게임' ? '현재 ' : ''}<CountUp from={0} to={2} duration={1.5} />{t('gameProgress')}
            </p>
            
            {/* 포트폴리오 하이라이트 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <motion.div 
                className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-[rgb(var(--primary))]">🎮 2개</div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('portfolioHighlights.completedGames')}</div>
              </motion.div>
              <motion.div 
                className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-[rgb(var(--text-secondary))]">🤖 100%</div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('portfolioHighlights.aiCollaboration')}</div>
              </motion.div>
              <motion.div 
                className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-green-600">📱 {t('portfolioHighlights.dualInput')}</div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('portfolioHighlights.touchMouse')}</div>
              </motion.div>
              <motion.div 
                className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="text-lg font-bold text-blue-600">⚡ {t('portfolioHighlights.realtimeFeedback')}</div>
                <div className="text-xs text-[rgb(var(--text-tertiary))]">{t('portfolioHighlights.codeFeedback')}</div>
              </motion.div>
            </div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 * 0.2 }}
              viewport={{ once: true }}
            >
              <GameCard
                title={t('games.closureCave.title')}
                description={t('games.closureCave.description')}
                stages={15}
                concepts={t('games.closureCave.concepts').split(',')}
                href={`/${currentLocale}/games/closure-cave-enhanced`}
                icon="🕳️"
                difficulty={t('games.closureCave.difficulty')}
                difficultyColor="yellow"
                isNew={true}
                index={0}
                translations={{
                  stages: t('gameCard.stages'),
                  difficulties: t('gameCard.difficulties'),
                  startGame: t('gameCard.startGame'),
                  new: t('gameCard.new'),
                  locked: t('gameCard.locked'),
                  recommended: t('gameCard.recommended')
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 * 0.2 }}
              viewport={{ once: true }}
            >
              <GameCard
                title={t('games.callstackLibrary.title')}
                description={t('games.callstackLibrary.description')}
                stages={24}
                concepts={t('games.callstackLibrary.concepts').split(',')}
                href={`/${currentLocale}/games/callstack-library`}
                icon="📚"
                difficulty={t('games.callstackLibrary.difficulty')}
                difficultyColor="red"
                isNew={false}
                index={1}
                translations={{
                  stages: t('gameCard.stages'),
                  difficulties: t('gameCard.difficulties'),
                  startGame: t('gameCard.startGame'),
                  new: t('gameCard.new'),
                  locked: t('gameCard.locked'),
                  recommended: t('gameCard.recommended')
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[rgb(var(--text-primary))] mb-6">
              {t('tryNow')}
            </h2>
            <p className="text-lg text-[rgb(var(--text-secondary))] mb-8 max-w-2xl mx-auto">
              {t('tryNowSubtitle')}
            </p>
            
            {/* 네비게이션 링크 */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link
                href={`/${currentLocale}/about`}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--primary))] transition-colors font-medium"
              >
                {t('navigation.projectStory')}
              </Link>
              <span className="text-[rgb(var(--text-tertiary))]">•</span>
              <Link
                href={`/${currentLocale}/tech`}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--primary))] transition-colors font-medium"
              >
                {t('navigation.techStack')}
              </Link>
              <span className="text-[rgb(var(--text-tertiary))]">•</span>
              <Link
                href={`/${currentLocale}/games`}
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--primary))] transition-colors font-medium"
              >
                {t('navigation.allGames')}
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${currentLocale}/games/closure-cave-enhanced`}
                className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--primary))] text-white px-8 py-4 rounded-xl hover:bg-[rgb(var(--primary-hover))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('cta.playGame')}
                <span className="text-xl">→</span>
              </Link>
              <Link
                href={`/${currentLocale}/about`}
                className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-primary))] px-8 py-4 rounded-xl hover:bg-[rgb(var(--surface-secondary))] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t('cta.learnMore')}
                <span className="text-xl">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function GameCard({
  title,
  description,
  stages,
  concepts,
  href,
  icon,
  isNew = false,
  isLocked = false,
  difficulty,
  difficultyColor,
  isRecommended = false,
  index,
  translations
}: {
  title: string
  description: string
  stages: number
  concepts: string[]
  href: string
  icon: string
  isNew?: boolean
  isLocked?: boolean
  difficulty?: string
  difficultyColor?: string
  isRecommended?: boolean
  index?: number
  translations: {
    stages: string
    difficulties: string
    startGame: string
    new: string
    locked: string
    recommended: string
  }
}) {
  const cardClass = isLocked 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:shadow-2xl hover:-translate-y-2'

  return (
    <Link href={href} className={`group ${isLocked ? 'pointer-events-none' : ''}`}>
      <motion.div 
        className={`bg-[rgb(var(--surface-elevated))] rounded-2xl p-7 shadow-xl transition-all duration-500 border border-[rgb(var(--border))] overflow-hidden relative ${cardClass}`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(var(--primary), 0.1), 0 0 20px rgba(var(--primary), 0.1)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        
        {/* 콘텐츠 */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="text-4xl p-3 bg-[rgb(var(--surface-primary))]/80 rounded-xl shadow-md">
                {icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--primary))] transition-colors">
                  {title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {difficulty && (
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium
                      ${difficultyColor === 'green' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : difficultyColor === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {difficulty}
                    </span>
                  )}
                  {isNew && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {translations.new}
                    </span>
                  )}
                  {isLocked && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      {translations.locked}
                    </span>
                  )}
                  {isRecommended && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {translations.recommended}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[rgb(var(--text-secondary))] leading-relaxed text-sm mb-4">
            {description}
          </p>
          
          {/* 학습 개념 태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {concepts.map(concept => (
              <span key={concept} className="text-xs px-2 py-1 bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-tertiary))] rounded-full">
                {concept}
              </span>
            ))}
          </div>
          
          {/* 스테이지 정보 */}
          <div className="flex items-center justify-between text-sm text-[rgb(var(--text-tertiary))]">
            <span><CountUp from={0} to={stages} duration={2} />{translations.stages}</span>
            <span className="text-xs">{translations.difficulties}</span>
          </div>
          
          {/* 호버 효과 */}
          {!isLocked && (
            <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center text-[rgb(var(--primary))] text-sm font-medium">
                {translations.startGame}
                <span className="ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}