import { GameStage } from '@penguinjs/game-engine'

export interface ClosureLevel {
  id: string
  title: string
  description: string
  objective: string
  // 시각적 게임 요소
  gameBoard: {
    character: {
      startPosition: { row: number; col: number }
      targetPosition: { row: number; col: number }
    }
    items: Array<{
      id: string
      position: { row: number; col: number }
      value: string
      locked?: boolean
    }>
    obstacles?: Array<{
      type: 'rock' | 'ice' | 'water'
      position: { row: number; col: number }
    }>
    grid: {
      rows: number
      cols: number
    }
  }
  // 코드 템플릿
  codeTemplate: string
  // 검증을 위한 솔루션 패턴
  solutionValidator: (code: string, result: any) => boolean
  // 힌트
  hints: string[]
  // 설명
  explanation: string
}

export const closureLevels: ClosureLevel[] = [
  {
    id: 'level-1',
    title: '첫 번째 보물',
    description: '펭귄이 보물에 접근할 수 있도록 클로저를 만들어주세요.',
    objective: '💎 다이아몬드를 가져오는 함수를 반환하세요',
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
  const treasure = "💎";
  
  // 보물을 반환하는 함수를 리턴하세요
  
}

// 펭귄이 보물을 가져옵니다
const findTreasure = getTreasure();`,
    solutionValidator: (code: string, result: any) => {
      try {
        // 함수가 반환되었는지 확인
        const func = eval(code + '\nfindTreasure');
        if (typeof func !== 'function') return false;
        
        // 함수 실행 결과가 💎인지 확인
        const treasure = func();
        return treasure === '💎';
      } catch {
        return false;
      }
    },
    hints: [
      'return function() { ... } 형태로 함수를 반환하세요',
      '반환된 함수 안에서 treasure 변수에 접근할 수 있습니다',
      'return function() { return treasure; }'
    ],
    explanation: '클로저는 함수가 선언될 때의 환경을 기억합니다. 내부 함수는 외부 함수의 변수에 접근할 수 있습니다.'
  },
  {
    id: 'level-2',
    title: '점프 카운터',
    description: '펭귄이 3번 점프해서 장애물을 넘고 보물에 도달하도록 카운터 클로저를 만들어주세요.',
    objective: '호출할 때마다 점프 횟수가 증가하는 함수를 만드세요 (3번 점프 필요)',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'ruby', position: { row: 0, col: 4 }, value: '💎', locked: true }
      ],
      obstacles: [
        { type: 'rock', position: { row: 4, col: 1 } },
        { type: 'ice', position: { row: 3, col: 2 } },
        { type: 'rock', position: { row: 2, col: 3 } }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createJumper() {
  let jumps = 0;
  
  // 점프 횟수를 증가시키고 반환하는 함수를 리턴하세요
  
}

// 펭귄이 점프합니다
const jump = createJumper();
// jump()를 3번 호출하면 보물을 얻을 수 있습니다`,
    solutionValidator: (code: string, result: any) => {
      try {
        const func = eval(code + '\njump');
        if (typeof func !== 'function') return false;
        
        // 3번 호출했을 때 3이 반환되는지 확인
        func(); // 1
        func(); // 2
        const finalJump = func(); // 3
        return finalJump === 3;
      } catch {
        return false;
      }
    },
    hints: [
      'jumps 변수를 증가시키고 반환하세요',
      'return function() { jumps++; return jumps; }',
      '클로저는 외부 변수를 기억하고 수정할 수 있습니다'
    ],
    explanation: '클로저를 사용하면 프라이빗 변수를 만들 수 있습니다. jumps 변수는 외부에서 직접 접근할 수 없지만, 반환된 함수를 통해 값을 변경할 수 있습니다.'
  },
  {
    id: 'level-3',
    title: '비밀번호 금고',
    description: '각 보물함은 비밀번호로 보호되어 있습니다. 올바른 비밀번호로만 열 수 있는 금고를 만들어주세요.',
    objective: '비밀번호가 맞으면 보물을, 틀리면 "locked"를 반환하세요',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'emerald', position: { row: 2, col: 2 }, value: '💚', locked: true },
        { id: 'sapphire', position: { row: 0, col: 4 }, value: '💙', locked: true }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createVault(treasure, password) {
  // 비밀번호를 확인하고 보물을 반환하는 객체를 만드세요
  
}

// 두 개의 금고를 만듭니다
const vault1 = createVault("emerald", "penguin");
const vault2 = createVault("sapphire", "cave");`,
    solutionValidator: (code: string, result: any) => {
      try {
        eval(code);
        // vault1 테스트
        const v1 = eval('vault1');
        if (!v1 || typeof v1.open !== 'function') {
          console.log('vault1이 없거나 open 함수가 없습니다');
          return false;
        }
        
        const v1Result1 = v1.open('penguin');
        const v1Result2 = v1.open('wrong');
        
        if (v1Result1 !== 'emerald') {
          console.log('vault1.open("penguin") 결과:', v1Result1, '기대값: emerald');
          return false;
        }
        if (v1Result2 !== 'locked') {
          console.log('vault1.open("wrong") 결과:', v1Result2, '기대값: locked');
          return false;
        }
        
        // vault2 테스트
        const v2 = eval('vault2');
        if (!v2 || typeof v2.open !== 'function') {
          console.log('vault2가 없거나 open 함수가 없습니다');
          return false;
        }
        
        const v2Result1 = v2.open('cave');
        const v2Result2 = v2.open('wrong');
        
        if (v2Result1 !== 'sapphire') {
          console.log('vault2.open("cave") 결과:', v2Result1, '기대값: sapphire');
          return false;
        }
        if (v2Result2 !== 'locked') {
          console.log('vault2.open("wrong") 결과:', v2Result2, '기대값: locked');
          return false;
        }
        
        return true;
      } catch (error) {
        console.log('실행 중 에러:', error);
        return false;
      }
    },
    hints: [
      'open 메서드를 가진 객체를 반환하세요',
      'open 메서드에서 입력된 키와 password를 비교하세요',
      'return { open: function(key) { return key === password ? treasure : "locked"; } }'
    ],
    explanation: '클로저를 사용하면 진정한 프라이빗 변수를 만들 수 있습니다. password와 treasure는 외부에서 직접 접근할 수 없고, open 메서드를 통해서만 접근 가능합니다.'
  },
  {
    id: 'level-4',
    title: '다중 경로',
    description: '여러 펭귄이 각자의 경로를 기억해야 합니다. 반복문과 클로저를 사용해 각 펭귄의 경로를 만들어주세요.',
    objective: '각 펭귄이 자신의 번호를 기억하는 함수 배열을 만드세요',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 't1', position: { row: 3, col: 1 }, value: '1️⃣' },
        { id: 't2', position: { row: 2, col: 2 }, value: '2️⃣' },
        { id: 't3', position: { row: 1, col: 3 }, value: '3️⃣' }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createPenguins() {
  const penguins = [];
  
  for (let i = 1; i <= 3; i++) {
    // 각 펭귄이 자신의 번호를 기억하는 함수를 추가하세요
    
  }
  
  return penguins;
}

// 3마리의 펭귄을 만듭니다
const penguinTeam = createPenguins();`,
    solutionValidator: (code: string, result: any) => {
      try {
        const team = eval(code + '\npenguinTeam');
        if (!Array.isArray(team) || team.length !== 3) return false;
        
        // 각 펭귄이 올바른 번호를 반환하는지 확인
        for (let i = 0; i < 3; i++) {
          if (typeof team[i] !== 'function') return false;
          if (team[i]() !== `펭귄 ${i + 1}번`) return false;
        }
        
        return true;
      } catch {
        return false;
      }
    },
    hints: [
      'let을 사용하면 각 반복마다 새로운 변수가 생성됩니다',
      'penguins.push()로 함수를 배열에 추가하세요',
      'penguins.push(function() { return "펭귄 " + i + "번"; });'
    ],
    explanation: 'let 키워드는 블록 스코프를 생성합니다. 반복문에서 let을 사용하면 각 반복마다 새로운 변수가 생성되어, 각 함수가 해당 시점의 값을 올바르게 기억합니다.'
  },
  {
    id: 'level-5',
    title: '마법 주문서',
    description: '모듈 패턴을 사용해 마법 주문을 관리하는 시스템을 만들어주세요.',
    objective: '주문을 추가하고 시전할 수 있는 마법서를 만드세요',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'fire', position: { row: 1, col: 1 }, value: '🔥' },
        { id: 'ice', position: { row: 2, col: 2 }, value: '❄️' },
        { id: 'star', position: { row: 3, col: 3 }, value: '⭐' }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `const SpellBook = (function() {
  // 프라이빗 변수
  const spells = {};
  
  // 퍼블릭 API를 반환하세요
  // - addSpell(name, emoji): 주문 추가
  // - cast(name): 주문 시전 (이모지 반환)
  
})();

// 마법서를 사용합니다
SpellBook.addSpell("fire", "🔥");
SpellBook.addSpell("ice", "❄️");`,
    solutionValidator: (code: string, result: any) => {
      try {
        eval(code);
        const book = eval('SpellBook');
        
        // API 확인
        if (!book || typeof book.addSpell !== 'function' || typeof book.cast !== 'function') {
          return false;
        }
        
        // 주문 추가 및 시전 테스트
        book.addSpell('star', '⭐');
        
        return book.cast('fire') === '🔥' && 
               book.cast('ice') === '❄️' && 
               book.cast('star') === '⭐' &&
               book.cast('unknown') === undefined;
      } catch {
        return false;
      }
    },
    hints: [
      'IIFE를 사용해 즉시 실행되는 함수를 만드세요',
      'return { addSpell: ..., cast: ... } 형태로 API를 노출하세요',
      'spells[name] = emoji로 주문을 저장하고, spells[name]으로 가져오세요'
    ],
    explanation: '모듈 패턴은 IIFE와 클로저를 활용해 프라이빗 스코프를 만들고, 필요한 기능만 퍼블릭 API로 노출합니다. 이는 캡슐화와 정보 은닉을 구현하는 강력한 패턴입니다.'
  }
]

// 게임 실행 엔진
export class ClosureGameEngine {
  private currentLevel: ClosureLevel
  private userCode: string = ''
  
  constructor(level: ClosureLevel) {
    this.currentLevel = level
  }
  
  validateSolution(code: string): {
    success: boolean
    penguinPath?: Array<{ row: number; col: number }>
    message?: string
  } {
    try {
      // 코드 실행 및 검증
      const result = {}
      const isValid = this.currentLevel.solutionValidator(code, result)
      
      if (isValid) {
        // 성공 시 펭귄의 이동 경로 생성
        const path = this.generatePenguinPath()
        return {
          success: true,
          penguinPath: path,
          message: '🎉 성공! 펭귄이 보물을 찾았습니다!'
        }
      } else {
        return {
          success: false,
          message: '아직 올바른 클로저가 아닙니다. 다시 시도해보세요!'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `코드 실행 중 오류가 발생했습니다: ${error}`
      }
    }
  }
  
  private generatePenguinPath(): Array<{ row: number; col: number }> {
    const { startPosition, targetPosition } = this.currentLevel.gameBoard.character
    const path: Array<{ row: number; col: number }> = []
    const obstacles = this.currentLevel.gameBoard.obstacles || []
    
    // Level 2 (점프 카운터)의 특별한 경로
    if (this.currentLevel.id === 'level-2') {
      // 장애물을 피해 점프하는 경로
      path.push({ ...startPosition })         // (4,0)
      path.push({ row: 4, col: 2 })          // 첫 번째 점프로 바위 넘기
      path.push({ row: 2, col: 2 })          // 두 번째 점프로 얼음 넘기  
      path.push({ row: 0, col: 4 })          // 세 번째 점프로 목표 도달
      return path
    }
    
    // 기본 경로 생성
    let currentRow = startPosition.row
    let currentCol = startPosition.col
    
    path.push({ ...startPosition })
    
    // 장애물 체크 함수
    const hasObstacle = (row: number, col: number) => {
      return obstacles.some(o => o.position.row === row && o.position.col === col)
    }
    
    // 먼저 행 이동
    while (currentRow !== targetPosition.row) {
      const nextRow = currentRow + (currentRow < targetPosition.row ? 1 : -1)
      
      // 장애물이 있으면 열을 먼저 이동
      if (hasObstacle(nextRow, currentCol)) {
        if (currentCol < targetPosition.col) {
          currentCol++
          path.push({ row: currentRow, col: currentCol })
        }
      } else {
        currentRow = nextRow
        path.push({ row: currentRow, col: currentCol })
      }
    }
    
    // 다음 열 이동
    while (currentCol !== targetPosition.col) {
      currentCol += currentCol < targetPosition.col ? 1 : -1
      path.push({ row: currentRow, col: currentCol })
    }
    
    return path
  }
}