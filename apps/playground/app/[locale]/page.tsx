'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { initializeGames } from '@/lib/games'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { usePathname } from 'next/navigation'

export default function HomePage() {
  const t = useTranslations('HomePage')
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  
  // 게임 초기화
  initializeGames()

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-primary))] relative">
      {/* 플로팅 컨트롤 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[rgb(var(--surface-elevated))] rounded-lg p-1 shadow-lg">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      
      <div className="w-full px-4 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="text-5xl">🐧</span>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-penguin-700 to-penguin-900 dark:from-penguin-300 dark:to-penguin-100 bg-clip-text text-transparent">
              PenguinJS
            </h1>
          </div>
          <p className="text-2xl font-medium text-[rgb(var(--text-tertiary))] mb-4">
            {t('slogan')}
          </p>
          <p className="text-lg text-[rgb(var(--text-secondary))] leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* 주요 게임 소개 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[rgb(var(--text-primary))]">난이도별 추천 게임</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <GameCard
              title="호이스팅 헬리콥터"
              description="변수 선언과 호이스팅을 헬리콥터 비행으로 체험하세요"
              stages={15}
              concepts={['호이스팅', 'var/let/const', 'TDZ']}
              href={`/${currentLocale}/games/hoisting-helicopter`}
              icon="🚁"
              difficulty="초급"
              difficultyColor="green"
              isLocked={true}
              isRecommended={true}
            />
            <GameCard
              title="클로저 동굴"
              description="클로저의 신비로운 세계를 탐험하며 스코프와 환경을 이해해보세요"
              stages={15}
              concepts={['클로저', '스코프', '렉시컬 환경']}
              href={`/${currentLocale}/games/closure-cave-enhanced`}
              icon="🕳️"
              difficulty="중급"
              difficultyColor="yellow"
              isNew={true}
              isRecommended={true}
            />
            <GameCard
              title="프로미스 배틀"
              description="비동기 전투에서 Promise의 상태 변화를 마스터하세요"
              stages={15}
              concepts={['Promise', '비동기', 'then/catch']}
              href={`/${currentLocale}/games/promise-battle`}
              icon="⚔️"
              difficulty="고급"
              difficultyColor="red"
              isLocked={true}
              isRecommended={true}
            />
          </div>
        </div>
        
        {/* 게임 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="text-center bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold text-[rgb(var(--primary))] mb-2">18</div>
            <div className="text-[rgb(var(--text-secondary))]">총 게임 수</div>
          </div>
          <div className="text-center bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold text-[rgb(var(--primary))] mb-2">270</div>
            <div className="text-[rgb(var(--text-secondary))]">총 스테이지</div>
          </div>
          <div className="text-center bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg">
            <div className="text-4xl font-bold text-[rgb(var(--primary))] mb-2">3</div>
            <div className="text-[rgb(var(--text-secondary))]">난이도 레벨</div>
          </div>
        </div>

        <div className="text-center mt-20">
          <Link
            href={`/${currentLocale}/games`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#3e6280] to-[#2d3e50] dark:from-[#7ba3b5] dark:to-[#5a8ca3] text-white px-10 py-5 rounded-xl hover:bg-gradient-to-r hover:from-[#2d3e50] hover:to-[#1b2a3a] dark:hover:from-[#5a8ca3] dark:hover:to-[#4a7691] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t('viewAllGames')}
            <span className="text-xl">→</span>
          </Link>
        </div>
      </div>
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
  isRecommended = false
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
}) {
  const cardClass = isLocked 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:shadow-2xl hover:-translate-y-2'

  return (
    <Link href={href} className={`group ${isLocked ? 'pointer-events-none' : ''}`}>
      <div className={`bg-[rgb(var(--surface-elevated))] rounded-2xl p-7 shadow-xl transition-all duration-500 border border-[rgb(var(--border))] overflow-hidden relative ${cardClass}`}>
        
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
                      NEW
                    </span>
                  )}
                  {isLocked && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      🔒 잠김
                    </span>
                  )}
                  {isRecommended && (
                    <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      추천
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
            <span>{stages}개 스테이지</span>
            <span className="text-xs">초급·중급·고급</span>
          </div>
          
          {/* 호버 효과 */}
          {!isLocked && (
            <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center text-[rgb(var(--primary))] text-sm font-medium">
                게임 시작하기
                <span className="ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}