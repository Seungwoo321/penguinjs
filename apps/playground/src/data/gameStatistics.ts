/**
 * 게임 플랫폼 전체 통계 데이터
 * 홈페이지 및 대시보드에서 사용
 */

export interface GameInfo {
  id: string;
  title: string;
  icon: string;
  description: string;
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stages: number;
  estimatedHours: number;
  isImplemented: boolean;
  category: 'fundamentals' | 'async' | 'advanced' | 'patterns';
}

export const games: GameInfo[] = [
  // 구현 완료
  {
    id: 'closure-cave',
    title: '클로저 동굴',
    icon: '🕳️',
    description: '클로저의 신비로운 세계를 탐험하며 스코프와 환경을 이해해보세요',
    concepts: ['클로저', '스코프', '렉시컬 환경'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: true,
    category: 'fundamentals'
  },
  {
    id: 'callstack-library',
    title: '콜스택 도서관',
    icon: '📚',
    description: '함수 호출 스택과 실행 순서를 시각적으로 이해하세요',
    concepts: ['콜스택', '실행 컨텍스트', '함수 호출'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 2,
    isImplemented: true,
    category: 'fundamentals'
  },
  
  // 개발 예정 - 기초
  {
    id: 'hoisting-helicopter',
    title: '호이스팅 헬리콥터',
    icon: '🚁',
    description: '호이스팅과 변수 선언을 헬리콥터 비행으로 체험하세요',
    concepts: ['호이스팅', 'var/let/const', 'TDZ'],
    difficulty: 'beginner',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'fundamentals'
  },
  {
    id: 'scope-forest',
    title: '스코프 숲',
    icon: '🌳',
    description: '스코프 체인과 변수 접근을 숲 탐험으로 이해하세요',
    concepts: ['스코프', '렉시컬 스코프', '블록 스코프'],
    difficulty: 'beginner',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'fundamentals'
  },
  {
    id: 'this-binding',
    title: 'this 바인딩 타겟',
    icon: '🎯',
    description: 'this 키워드와 바인딩을 타겟 슈팅으로 마스터하세요',
    concepts: ['this', 'bind/call/apply', '화살표 함수'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'fundamentals'
  },
  
  // 개발 예정 - 비동기
  {
    id: 'promise-battle',
    title: '프로미스 배틀',
    icon: '⚔️',
    description: 'Promise 상태와 비동기 처리를 턴제 카드 게임으로 학습하세요',
    concepts: ['Promise', 'then/catch', '비동기 처리'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 2,
    isImplemented: false,
    category: 'async'
  },
  {
    id: 'async-airways',
    title: '비동기 항공사',
    icon: '✈️',
    description: 'async/await와 비동기 프로그래밍을 항공 스케줄 관리로 배웁니다',
    concepts: ['async/await', '동시성', '에러 처리'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 2,
    isImplemented: false,
    category: 'async'
  },
  {
    id: 'eventloop-cinema',
    title: '이벤트 루프 영화관',
    icon: '🎬',
    description: '이벤트 루프와 비동기 실행 순서를 영화처럼 감상하세요',
    concepts: ['이벤트 루프', '태스크 큐', '마이크로태스크'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 2,
    isImplemented: false,
    category: 'async'
  },
  
  // 개발 예정 - 고급
  {
    id: 'proxy-laboratory',
    title: '프록시 실험실',
    icon: '🪞',
    description: 'Proxy 객체와 메타프로그래밍을 실험으로 탐구하세요',
    concepts: ['Proxy', 'Reflect', '메타프로그래밍'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 2,
    isImplemented: false,
    category: 'advanced'
  },
  {
    id: 'prototype-chain',
    title: '프로토타입 체인',
    icon: '🔗',
    description: '프로토타입 상속과 체인을 연결 퍼즐로 이해하세요',
    concepts: ['프로토타입', '상속', '__proto__'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'advanced'
  },
  {
    id: 'memory-museum',
    title: '메모리 관리 박물관',
    icon: '🧠',
    description: '가비지 컬렉션과 메모리 최적화를 박물관에서 학습하세요',
    concepts: ['가비지 컬렉션', '메모리 누수', '최적화'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 2,
    isImplemented: false,
    category: 'advanced'
  },
  {
    id: 'weakmap-vault',
    title: '약한 참조 금고',
    icon: '🗝️',
    description: 'WeakMap/WeakSet과 메모리 관리를 보안 금고에서 배웁니다',
    concepts: ['WeakMap', 'WeakSet', '가비지 컬렉션'],
    difficulty: 'advanced',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'advanced'
  },
  
  // 개발 예정 - 패턴
  {
    id: 'event-target',
    title: '이벤트 타겟',
    icon: '🎯',
    description: '이벤트 처리와 버블링을 타겟 게임으로 마스터하세요',
    concepts: ['이벤트', '버블링', '캐처링'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'patterns'
  },
  {
    id: 'destructuring-circus',
    title: '구조분해 서커스',
    icon: '🎪',
    description: '구조분해 할당을 서커스 공연으로 익혀보세요',
    concepts: ['구조분해', '전개 연산자', '기본값'],
    difficulty: 'beginner',
    stages: 15,
    estimatedHours: 1,
    isImplemented: false,
    category: 'patterns'
  },
  {
    id: 'array-methods-racing',
    title: '배열 메서드 레이싱',
    icon: '🏎️',
    description: '배열 메서드와 함수형 프로그래밍을 레이싱으로 배웁니다',
    concepts: ['map/filter/reduce', '체이닝', '불변성'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'patterns'
  },
  {
    id: 'modules-marketplace',
    title: '모듈 마켓플레이스',
    icon: '🏪',
    description: '모듈 시스템과 import/export를 마켓플레이스에서 운영하세요',
    concepts: ['ES6 모듈', 'import/export', '순환 의존성'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'patterns'
  },
  {
    id: 'template-literal-art',
    title: '템플릿 리터럴 아트',
    icon: '🎨',
    description: '템플릿 리터럴과 문자열 처리를 예술 창작으로 익히세요',
    concepts: ['템플릿 리터럴', '태그드 템플릿', '문자열 보간'],
    difficulty: 'beginner',
    stages: 15,
    estimatedHours: 1,
    isImplemented: false,
    category: 'patterns'
  },
  {
    id: 'error-handling-hospital',
    title: '에러 처리 병원',
    icon: '🏥',
    description: '에러 처리와 디버깅을 병원 응급실에서 학습하세요',
    concepts: ['try/catch', '커스텀 에러', '디버깅'],
    difficulty: 'intermediate',
    stages: 15,
    estimatedHours: 1.5,
    isImplemented: false,
    category: 'patterns'
  }
];

/**
 * 플랫폼 통계 계산
 */
export function getGameStatistics() {
  const totalGames = games.length;
  const implementedGames = games.filter(g => g.isImplemented).length;
  const totalStages = games.reduce((sum, game) => sum + game.stages, 0);
  const implementedStages = games.filter(g => g.isImplemented).reduce((sum, game) => sum + game.stages, 0);
  const allConcepts = games.flatMap(g => g.concepts);
  const uniqueConcepts = new Set(allConcepts);
  const totalConcepts = Array.from(uniqueConcepts).length;
  const totalEstimatedHours = games.reduce((sum, game) => sum + game.estimatedHours, 0);
  
  const difficultyBreakdown = {
    beginner: games.filter(g => g.difficulty === 'beginner').length,
    intermediate: games.filter(g => g.difficulty === 'intermediate').length,
    advanced: games.filter(g => g.difficulty === 'advanced').length
  };
  
  const categoryBreakdown = {
    fundamentals: games.filter(g => g.category === 'fundamentals').length,
    async: games.filter(g => g.category === 'async').length,
    advanced: games.filter(g => g.category === 'advanced').length,
    patterns: games.filter(g => g.category === 'patterns').length
  };
  
  return {
    totalGames,
    implementedGames,
    totalStages,
    implementedStages,
    totalConcepts,
    totalEstimatedHours,
    completionPercentage: Math.round((implementedGames / totalGames) * 100),
    difficultyBreakdown,
    categoryBreakdown,
    
    // 홈페이지용 요약 통계
    summary: {
      games: `${implementedGames}/${totalGames}`,
      stages: implementedStages,
      concepts: totalConcepts,
      estimatedHours: Math.round(totalEstimatedHours)
    }
  };
}

/**
 * 난이도별 추천 게임 가져오기
 */
export function getRecommendedGames() {
  return {
    beginner: games.find(g => g.difficulty === 'beginner' && !g.isImplemented),
    intermediate: games.find(g => g.difficulty === 'intermediate' && g.isImplemented),
    advanced: games.find(g => g.difficulty === 'advanced' && !g.isImplemented)
  };
}