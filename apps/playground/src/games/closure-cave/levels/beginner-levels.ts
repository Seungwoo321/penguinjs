import { GameLevel } from '../../shared/types'

export const beginnerLevels: GameLevel[] = [
  {
    id: 'closure-cave-beginner-1',
    difficulty: 'beginner',
    stageNumber: 1,
    title: '기본 함수 스코프 이해',
    description: '펭귄이 동굴 입구에서 첫 번째 보물을 발견했어요. 간단한 함수로 보물에 접근해보세요.',
    objective: '💎 함수 내부에서 보물을 반환하는 함수를 작성하세요',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'diamond', position: { row: 0, col: 4 }, value: '💎' }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function getTreasure() {
  // 여기에 코드를 작성하세요
  
}

return getTreasure;`,
    solutionValidator: (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          const treasureFunc = result()
          return treasureFunc === '💎' || (typeof treasureFunc === 'function' && treasureFunc() === '💎')
        }
        return false
      } catch {
        return false
      }
    },
    hints: [
      '함수 내부에서 보물 값을 반환해보세요',
      'return "💎" 을 사용해보세요',
      '함수는 값을 반환할 수 있습니다'
    ],
    explanation: '함수는 값을 캡슐화하고 반환할 수 있는 기본 단위입니다. 이것이 클로저의 시작점이에요.'
  },

  {
    id: 'closure-cave-beginner-2',
    difficulty: 'beginner',
    stageNumber: 2,
    title: '간단한 클로저 만들기',
    description: '동굴 깊숙한 곳에 숨겨진 보물이 있어요. 외부 변수를 기억하는 함수를 만들어보세요.',
    objective: '🏆 외부 변수에 접근하는 내부 함수를 반환하세요',
    gameBoard: {
      character: {
        startPosition: { row: 3, col: 0 },
        targetPosition: { row: 1, col: 3 }
      },
      items: [
        { id: 'trophy', position: { row: 1, col: 3 }, value: '🏆' }
      ],
      grid: { rows: 4, cols: 4 }
    },
    codeTemplate: `function createTreasureHunter() {
  const treasure = "🏆";
  
  // 여기에 클로저를 만드세요
  
}

return createTreasureHunter;`,
    solutionValidator: (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          const hunterFactory = result
          const hunter = hunterFactory()
          return typeof hunter === 'function' && hunter() === '🏆'
        }
        return false
      } catch {
        return false
      }
    },
    hints: [
      '내부 함수에서 외부 변수 treasure에 접근해보세요',
      'function 키워드로 내부 함수를 만들고 반환하세요',
      '내부 함수: return function() { return treasure; }'
    ],
    explanation: '클로저는 함수가 선언될 때의 환경을 기억합니다. 내부 함수는 외부 함수의 변수에 접근할 수 있어요.'
  },

  {
    id: 'closure-cave-beginner-3',
    difficulty: 'beginner',
    stageNumber: 3,
    title: '외부 변수 접근하기',
    description: '동굴의 다른 방에서 보물을 찾아야 해요. 매개변수로 받은 값을 기억하는 클로저를 만들어보세요.',
    objective: '🔮 매개변수 값을 기억하는 클로저 함수를 작성하세요',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 1 },
        targetPosition: { row: 1, col: 4 }
      },
      items: [
        { id: 'crystal', position: { row: 1, col: 4 }, value: '🔮' }
      ],
      obstacles: [
        { type: 'rock', position: { row: 2, col: 2 } }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createMemory(item) {
  // 매개변수 item을 기억하는 클로저를 만드세요
  
}

return createMemory;`,
    solutionValidator: (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          const memoryFactory = result
          const memory = memoryFactory('🔮')
          return typeof memory === 'function' && memory() === '🔮'
        }
        return false
      } catch {
        return false
      }
    },
    hints: [
      '매개변수 item을 사용하는 내부 함수를 반환하세요',
      'return function() { return item; }',
      '클로저는 외부 함수의 매개변수도 기억합니다'
    ],
    explanation: '클로저는 외부 함수의 매개변수도 기억할 수 있습니다. 이를 통해 동적인 값을 캡처할 수 있어요.'
  },

  {
    id: 'closure-cave-beginner-4',
    difficulty: 'beginner',
    stageNumber: 4,
    title: '카운터 클로저 구현',
    description: '동굴에서 찾은 보물의 개수를 세어야 해요. 상태를 유지하는 카운터 클로저를 만들어보세요.',
    objective: '🎯 호출할 때마다 1씩 증가하는 카운터 함수를 작성하세요',
    gameBoard: {
      character: {
        startPosition: { row: 2, col: 0 },
        targetPosition: { row: 2, col: 4 }
      },
      items: [
        { id: 'target1', position: { row: 1, col: 2 }, value: '1️⃣' },
        { id: 'target2', position: { row: 2, col: 4 }, value: '2️⃣' },
        { id: 'target3', position: { row: 3, col: 2 }, value: '3️⃣' }
      ],
      grid: { rows: 4, cols: 5 }
    },
    codeTemplate: `function createCounter() {
  // 카운터 변수와 증가 함수를 만드세요
  
}

return createCounter;`,
    solutionValidator: (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          const counterFactory = result
          const counter = counterFactory()
          return typeof counter === 'function' && 
                 counter() === 1 && 
                 counter() === 2 && 
                 counter() === 3
        }
        return false
      } catch {
        return false
      }
    },
    hints: [
      'let count = 0; 으로 시작하세요',
      'return function() { return ++count; }',
      '클로저는 변수의 상태를 유지할 수 있습니다'
    ],
    explanation: '클로저의 강력한 기능 중 하나는 상태 보존입니다. 외부 함수가 종료되어도 내부 함수는 변수를 계속 기억해요.'
  },

  {
    id: 'closure-cave-beginner-5',
    difficulty: 'beginner',
    stageNumber: 5,
    title: '클로저로 데이터 보호',
    description: '동굴의 마지막 보물을 안전하게 보관해야 해요. 외부에서 직접 접근할 수 없는 안전한 보관소를 만들어보세요.',
    objective: '🔒 private 변수를 가진 안전한 보관소를 작성하세요',
    gameBoard: {
      character: {
        startPosition: { row: 3, col: 0 },
        targetPosition: { row: 0, col: 3 }
      },
      items: [
        { id: 'lock', position: { row: 0, col: 3 }, value: '🔒', locked: true }
      ],
      obstacles: [
        { type: 'water', position: { row: 1, col: 1 } },
        { type: 'water', position: { row: 2, col: 2 } }
      ],
      grid: { rows: 4, cols: 4 }
    },
    codeTemplate: `function createVault(secret) {
  // private 변수를 만들고 접근 메서드를 반환하세요
  
}

return createVault;`,
    solutionValidator: (code: string, result: any) => {
      try {
        if (typeof result === 'function') {
          const vaultFactory = result
          const vault = vaultFactory('🔒')
          return typeof vault === 'object' &&
                 typeof vault.getSecret === 'function' &&
                 vault.getSecret() === '🔒' &&
                 vault.secret === undefined // private이어야 함
        }
        return false
      } catch {
        return false
      }
    },
    hints: [
      '객체에 메서드를 담아 반환하세요: { getSecret: function() {...} }',
      'secret 변수는 외부에서 직접 접근할 수 없어야 합니다',
      'return { getSecret: function() { return secret; } };'
    ],
    explanation: '클로저를 사용하면 진짜 private 변수를 만들 수 있습니다. 외부에서는 제공된 메서드로만 접근 가능해요.'
  }
]