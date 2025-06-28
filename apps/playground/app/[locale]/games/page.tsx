'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ThemeToggle, LanguageToggle } from '@penguinjs/ui'
import { Home } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function GamesPage() {
  const t = useTranslations('GamesPage')
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  
  // 전체 18개 게임 데이터
  const allGames = [
    // 구현 완료
    {
      id: 'closure-cave',
      title: '클로저 동굴',
      icon: '🕳️',
      description: '클로저의 신비로운 세계를 탐험하며 스코프와 환경을 이해해보세요',
      concepts: ['클로저', '스코프', '렉시컬 환경'],
      type: 'Flexbox Froggy 스타일',
      stages: 15,
      isImplemented: true,
      href: 'closure-cave-enhanced'
    },
    // 구현 완료
    {
      id: 'callstack-library',
      title: '콜스택 도서관',
      icon: '📚',
      description: '함수 호출 스택과 실행 순서를 시각적으로 이해하세요',
      concepts: ['콜스택', '실행 컨텍스트', '함수 호출'],
      type: '드래그 앤 드롭',
      stages: 15,
      isImplemented: true,
      href: 'callstack-library'
    },
    {
      id: 'promise-battle',
      title: '프로미스 배틀',
      icon: '⚔️',
      description: 'Promise 상태와 비동기 처리를 턴제 카드 게임으로 학습하세요',
      concepts: ['Promise', 'then/catch', '비동기 처리'],
      type: '턴제 카드 게임',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'async-airways',
      title: '비동기 항공사',
      icon: '✈️',
      description: 'async/await와 비동기 프로그래밍을 항공 스케줄 관리로 배웁니다',
      concepts: ['async/await', '동시성', '에러 처리'],
      type: '실시간 스케줄 관리',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'proxy-laboratory',
      title: '프록시 실험실',
      icon: '🪞',
      description: 'Proxy 객체와 메타프로그래밍을 실험으로 탐구하세요',
      concepts: ['Proxy', 'Reflect', '메타프로그래밍'],
      type: '퍼즐/실험',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'event-target',
      title: '이벤트 타겟',
      icon: '🎯',
      description: '이벤트 처리와 버블링을 타겟 게임으로 마스터하세요',
      concepts: ['이벤트', '버블링', '캐처링'],
      type: 'Flexbox Froggy 스타일',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'prototype-chain',
      title: '프로토타입 체인',
      icon: '🔗',
      description: '프로토타입 상속과 체인을 연결 퍼즐로 이해하세요',
      concepts: ['프로토타입', '상속', '__proto__'],
      type: '연결 퍼즐',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'eventloop-cinema',
      title: '이벤트 루프 영화관',
      icon: '🎬',
      description: '이벤트 루프와 비동기 실행 순서를 영화처럼 감상하세요',
      concepts: ['이벤트 루프', '태스크 큐', '마이크로태스크'],
      type: '타이밍 기반',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'memory-museum',
      title: '메모리 관리 박물관',
      icon: '🧠',
      description: '가비지 컬렉션과 메모리 최적화를 박물관에서 학습하세요',
      concepts: ['가비지 컬렉션', '메모리 누수', '최적화'],
      type: '관리 시뮬레이션',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'scope-forest',
      title: '스코프 숲',
      icon: '🌳',
      description: '스코프 체인과 변수 접근을 숲 탐험으로 이해하세요',
      concepts: ['스코프', '렉시컬 스코프', '블록 스코프'],
      type: '탐험/퍼즐',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'hoisting-helicopter',
      title: '호이스팅 헬리콥터',
      icon: '🚁',
      description: '호이스팅과 변수 선언을 헬리콥터 비행으로 체험하세요',
      concepts: ['호이스팅', 'var/let/const', 'TDZ'],
      type: '물리 시뮬레이션',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'this-binding',
      title: 'this 바인딩 타겟',
      icon: '🎯',
      description: 'this 키워드와 바인딩을 타겟 슈팅으로 마스터하세요',
      concepts: ['this', 'bind/call/apply', '화살표 함수'],
      type: '타겟 슈팅',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'destructuring-circus',
      title: '구조분해 서커스',
      icon: '🎪',
      description: '구조분해 할당을 서커스 공연으로 익혀보세요',
      concepts: ['구조분해', '전개 연산자', '기본값'],
      type: '퍼즐/패턴 매칭',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'array-methods-racing',
      title: '배열 메서드 레이싱',
      icon: '🏎️',
      description: '배열 메서드와 함수형 프로그래밍을 레이싱으로 배웁니다',
      concepts: ['map/filter/reduce', '체이닝', '불변성'],
      type: '레이싱/경쟁',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'modules-marketplace',
      title: '모듈 마켓플레이스',
      icon: '🏪',
      description: '모듈 시스템과 import/export를 마켓플레이스에서 운영하세요',
      concepts: ['ES6 모듈', 'import/export', '순환 의존성'],
      type: '경영 시뮬레이션',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'template-literal-art',
      title: '템플릿 리터럴 아트',
      icon: '🎨',
      description: '템플릿 리터럴과 문자열 처리를 예술 창작으로 익히세요',
      concepts: ['템플릿 리터럴', '태그드 템플릿', '문자열 보간'],
      type: '창작/아트',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'error-handling-hospital',
      title: '에러 처리 병원',
      icon: '🏥',
      description: '에러 처리와 디버깅을 병원 응급실에서 학습하세요',
      concepts: ['try/catch', '커스텀 에러', '디버깅'],
      type: '의료 시뮬레이션',
      stages: 15,
      isImplemented: false
    },
    {
      id: 'weakmap-vault',
      title: '약한 참조 금고',
      icon: '🗝️',
      description: 'WeakMap/WeakSet과 메모리 관리를 보안 금고에서 배웁니다',
      concepts: ['WeakMap', 'WeakSet', '가비지 컬렉션'],
      type: '보안/스파이',
      stages: 15,
      isImplemented: false
    }
  ]

  return (
    <main className="min-h-screen bg-[rgb(var(--surface-primary))] relative">
      {/* 플로팅 컨트롤 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Link 
          href={`/${currentLocale}`}
          className="p-2 rounded-lg bg-[rgb(var(--surface-elevated))] hover:bg-[rgb(var(--surface-secondary))] transition-all shadow-lg"
          title="홈으로"
        >
          <Home className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 bg-[rgb(var(--surface-elevated))] rounded-lg p-1 shadow-lg">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-5xl">🐧</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--text-primary))]">
              게임 컬렉션
            </h1>
          </div>
          <p className="text-lg text-[rgb(var(--text-secondary))] mb-8">
            18개의 인터랙티브 게임으로 JavaScript를 마스터하세요
          </p>
          
          {/* 진행 현황 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-[rgb(var(--primary))]">1/18</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))]">구현 완료</div>
            </div>
            <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-[rgb(var(--text-secondary))]">17</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))]">개발 예정</div>
            </div>
            <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-green-600">15/270</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))]">구현 스테이지</div>
            </div>
            <div className="bg-[rgb(var(--surface-elevated))] rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold text-blue-600">5.5%</div>
              <div className="text-sm text-[rgb(var(--text-tertiary))]">전체 진행률</div>
            </div>
          </div>
        </div>

        {/* 전체 게임 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {/* 하단 안내 */}
        <div className="text-center mt-16 p-8 bg-[rgb(var(--surface-elevated))] rounded-xl">
          <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
            🎯 JavaScript 마스터가 되는 여정
          </h3>
          <p className="text-[rgb(var(--text-secondary))] mb-2">
            18개의 게임으로 JavaScript의 모든 핵심 개념을 완벽하게 마스터할 수 있습니다.
          </p>
          <p className="text-sm text-[rgb(var(--text-tertiary))]">
            펭귄과 함께 하나씩 정복해나가세요!
          </p>
        </div>
      </div>
    </main>
  )
}

function GameCard({ game }: { game: any }) {
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  const gameUrl = game.isImplemented ? `/${currentLocale}/games/${game.href}` : '#'
  const isClickable = game.isImplemented
  
  return (
    <div className={`relative ${!isClickable ? 'cursor-not-allowed' : ''}`}>
      <Link 
        href={gameUrl} 
        className={`group block ${!isClickable ? 'pointer-events-none' : ''}`}
        onClick={!isClickable ? (e) => e.preventDefault() : undefined}
      >
        <div className={`bg-[rgb(var(--surface-elevated))] rounded-xl p-6 shadow-lg transition-all duration-300 border border-[rgb(var(--border))] ${
          isClickable ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-60'
        }`}>
          {/* 상태 배지 */}
          {game.isImplemented && (
            <div className="absolute top-4 right-4">
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                플레이 가능
              </span>
            </div>
          )}
          {!game.isImplemented && (
            <div className="absolute top-4 right-4">
              <span className="inline-block text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                개발 예정
              </span>
            </div>
          )}
          
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
          
          {/* 학습 개념 태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {game.concepts.map((concept: string) => (
              <span key={concept} className="text-xs px-2 py-1 bg-[rgb(var(--surface-secondary))] text-[rgb(var(--text-tertiary))] rounded-full">
                {concept}
              </span>
            ))}
          </div>
          
          {/* 게임 정보 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--text-tertiary))]">
              {game.stages}개 스테이지
            </span>
            <span className="text-xs text-[rgb(var(--text-tertiary))]">
              초급·중급·고급
            </span>
          </div>
          
          {/* 호버 효과 */}
          {isClickable && (
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center text-[rgb(var(--primary))] text-sm font-medium">
                게임 시작하기
                <span className="ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}