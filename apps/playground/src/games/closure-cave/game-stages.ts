import { GameStage } from '@penguinjs/game-engine'

export interface ClosureCaveGameStage extends GameStage {
  gameElements?: {
    penguin?: {
      position: { x: number; y: number }
      animation?: string
    }
    treasures?: Array<{
      id: string
      name: string
      position: { x: number; y: number }
      icon: string
      collected?: boolean
    }>
    obstacles?: Array<{
      type: 'ice' | 'rock' | 'water'
      position: { x: number; y: number }
    }>
    exitPortal?: {
      position: { x: number; y: number }
      locked: boolean
    }
  }
  gameGoal?: string
  successConditions?: {
    treasuresCollected?: number
    variablesCreated?: string[]
    functionsReturned?: boolean
  }
}

export const closureCaveGameStages: ClosureCaveGameStage[] = [
  {
    id: 'cc-1',
    title: '동굴 입구: 첫 번째 보물',
    description: '펭귄이 동굴 깊은 곳의 보물에 접근하려면 클로저를 사용해야 합니다. 외부 함수의 보물을 기억하는 내부 함수를 만들어보세요!',
    difficulty: 'beginner',
    concept: 'closure-basics',
    gameGoal: '💎 보물 상자를 열어 다이아몬드를 획득하세요!',
    gameElements: {
      penguin: { position: { x: 50, y: 300 }, animation: 'idle' },
      treasures: [
        { 
          id: 'diamond', 
          name: '다이아몬드', 
          position: { x: 400, y: 300 }, 
          icon: '💎',
          collected: false 
        }
      ],
      exitPortal: { position: { x: 500, y: 300 }, locked: true }
    },
    successConditions: {
      treasuresCollected: 1,
      functionsReturned: true
    },
    initialCode: `function openTreasureBox() {
  let treasure = "💎 다이아몬드";
  
  // 보물을 가져오는 함수를 반환하세요
  // return function() { ... }
  
}

// 펭귄이 보물상자를 열어요!
const getTreasure = openTreasureBox();`,
    solution: `function openTreasureBox() {
  let treasure = "💎 다이아몬드";
  
  return function() {
    return treasure;
  };
}

const getTreasure = openTreasureBox();
return getTreasure();`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: "💎 다이아몬드",
        description: '보물상자에서 다이아몬드를 가져와야 합니다'
      }
    ],
    hints: [
      '외부 함수(openTreasureBox)의 treasure 변수를 기억하는 함수를 반환하세요',
      'return function() { return treasure; } 형태로 작성해보세요',
      '반환된 함수를 호출해야 실제 보물을 얻을 수 있어요!'
    ],
    explanation: '클로저는 함수가 선언될 때의 환경을 기억합니다. 내부 함수는 외부 함수의 변수(treasure)에 접근할 수 있으며, 외부 함수가 종료된 후에도 이를 기억합니다.'
  },
  {
    id: 'cc-2',
    title: '비밀 통로: 숨겨진 보물들',
    description: '여러 보물이 숨겨진 비밀 통로를 발견했습니다! 각 보물함은 비밀번호로 보호되어 있어요. 클로저를 사용해 각 보물함의 비밀을 지켜보세요.',
    difficulty: 'beginner',
    concept: 'closure-privacy',
    gameGoal: '🗝️ 3개의 보물함을 모두 열어 보물을 획득하세요!',
    gameElements: {
      penguin: { position: { x: 50, y: 200 }, animation: 'walking' },
      treasures: [
        { id: 'ruby', name: '루비', position: { x: 200, y: 150 }, icon: '💎', collected: false },
        { id: 'emerald', name: '에메랄드', position: { x: 300, y: 200 }, icon: '💚', collected: false },
        { id: 'sapphire', name: '사파이어', position: { x: 400, y: 250 }, icon: '💙', collected: false }
      ],
      obstacles: [
        { type: 'rock', position: { x: 150, y: 200 } },
        { type: 'ice', position: { x: 350, y: 180 } }
      ]
    },
    successConditions: {
      treasuresCollected: 3,
      variablesCreated: ['password', 'treasure']
    },
    initialCode: `function createTreasureBox(treasureName, secretPassword) {
  // 비밀번호와 보물을 안전하게 보관하고
  // checkPassword와 getTreasure 메서드를 가진 객체를 반환하세요
  
}

// 세 개의 보물함을 만들어요
const rubyBox = createTreasureBox("루비", "penguin123");
const emeraldBox = createTreasureBox("에메랄드", "ice456");
const sapphireBox = createTreasureBox("사파이어", "cave789");`,
    solution: `function createTreasureBox(treasureName, secretPassword) {
  let password = secretPassword;
  let treasure = treasureName;
  let isOpen = false;
  
  return {
    checkPassword: function(inputPassword) {
      if (inputPassword === password) {
        isOpen = true;
        return true;
      }
      return false;
    },
    getTreasure: function() {
      if (isOpen) {
        return treasure;
      }
      return "🔒 잠겨있습니다";
    }
  };
}

const rubyBox = createTreasureBox("루비", "penguin123");
rubyBox.checkPassword("penguin123");
return rubyBox.getTreasure();`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: "루비",
        description: '올바른 비밀번호로 루비 상자를 열어야 합니다'
      }
    ],
    hints: [
      '외부에서 직접 접근할 수 없는 private 변수들을 만드세요',
      'checkPassword로 비밀번호를 확인하고, getTreasure로 보물을 가져오세요',
      'isOpen 변수로 상자가 열렸는지 추적하면 좋습니다'
    ],
    explanation: '클로저를 사용하면 진정한 프라이빗 변수를 만들 수 있습니다. 외부에서는 반환된 메서드를 통해서만 접근할 수 있어 데이터를 안전하게 보호할 수 있습니다.'
  },
  {
    id: 'cc-3',
    title: '얼음 미로: 다중 경로',
    description: '펭귄이 얼음 미로에 갇혔어요! 각 통로마다 다른 번호가 있고, 올바른 순서로 통과해야 합니다. 반복문과 클로저를 사용해 각 통로의 번호를 기억하세요.',
    difficulty: 'beginner',
    concept: 'closure-loops',
    gameGoal: '🧊 5개의 얼음 통로를 순서대로 통과하세요!',
    gameElements: {
      penguin: { position: { x: 50, y: 300 }, animation: 'sliding' },
      obstacles: [
        { type: 'ice', position: { x: 100, y: 100 } },
        { type: 'ice', position: { x: 200, y: 150 } },
        { type: 'ice', position: { x: 300, y: 200 } },
        { type: 'ice', position: { x: 400, y: 250 } },
        { type: 'ice', position: { x: 500, y: 300 } }
      ]
    },
    successConditions: {
      functionsReturned: true
    },
    initialCode: `function createIcePaths() {
  let paths = [];
  
  for (let i = 0; i < 5; i++) {
    // 각 통로가 자신의 번호를 기억하는 함수를 만드세요
    
  }
  
  return paths;
}

// 펭귄이 통로들을 확인해요
const icePaths = createIcePaths();`,
    solution: `function createIcePaths() {
  let paths = [];
  
  for (let i = 0; i < 5; i++) {
    paths.push(function() {
      return "통로 " + i + "번";
    });
  }
  
  return paths;
}

const icePaths = createIcePaths();
return icePaths[0]();`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: "통로 0번",
        description: '첫 번째 통로는 "통로 0번"을 반환해야 합니다'
      }
    ],
    hints: [
      'let 키워드를 사용하면 각 반복마다 새로운 변수가 생성됩니다',
      '각 함수가 해당 반복의 i 값을 기억하게 됩니다',
      'paths 배열에 함수들을 push하는 것을 잊지 마세요'
    ],
    explanation: 'let 키워드는 블록 스코프를 생성합니다. 반복문에서 let을 사용하면 각 반복마다 새로운 변수가 생성되어, 각 함수가 해당 시점의 값을 올바르게 기억합니다.'
  },
  {
    id: 'cc-4',
    title: '마법의 연구실: 주문 제작',
    description: '동굴 깊은 곳에서 마법의 연구실을 발견했어요! 모듈 패턴을 사용해 마법 주문을 만들고 관리하는 시스템을 구축하세요.',
    difficulty: 'intermediate',
    concept: 'closure-module',
    gameGoal: '✨ 3가지 마법 주문을 조합해 최종 보물을 획득하세요!',
    gameElements: {
      penguin: { position: { x: 250, y: 300 }, animation: 'casting' },
      treasures: [
        { id: 'fire-spell', name: '불꽃 주문', position: { x: 150, y: 200 }, icon: '🔥', collected: false },
        { id: 'ice-spell', name: '얼음 주문', position: { x: 250, y: 150 }, icon: '❄️', collected: false },
        { id: 'light-spell', name: '빛 주문', position: { x: 350, y: 200 }, icon: '✨', collected: false }
      ]
    },
    successConditions: {
      variablesCreated: ['spells', 'power'],
      treasuresCollected: 3
    },
    initialCode: `const SpellBook = (function() {
  // 프라이빗 변수: 주문들과 마법 파워
  
  // 퍼블릭 API를 반환하세요:
  // - addSpell(name, power): 주문 추가
  // - castSpell(name): 주문 시전
  // - getTotalPower(): 전체 파워 확인
  
})();`,
    solution: `const SpellBook = (function() {
  let spells = {};
  let totalPower = 0;
  
  function addSpell(name, power) {
    spells[name] = power;
    totalPower += power;
    return "✨ " + name + " 주문이 추가되었습니다!";
  }
  
  function castSpell(name) {
    if (spells[name]) {
      return name + " 주문 시전! 파워: " + spells[name];
    }
    return "주문을 찾을 수 없습니다";
  }
  
  function getTotalPower() {
    return totalPower;
  }
  
  return {
    addSpell: addSpell,
    castSpell: castSpell,
    getTotalPower: getTotalPower
  };
})();

SpellBook.addSpell("불꽃", 10);
return SpellBook.getTotalPower();`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: 10,
        description: '불꽃 주문(파워 10)을 추가한 후 전체 파워는 10이어야 합니다'
      }
    ],
    hints: [
      'IIFE를 사용해 즉시 실행되는 함수를 만드세요',
      '프라이빗 변수로 spells 객체와 totalPower를 선언하세요',
      '퍼블릭 메서드들을 객체로 반환하여 API를 노출하세요'
    ],
    explanation: '모듈 패턴은 IIFE와 클로저를 활용해 프라이빗 스코프를 만들고, 필요한 기능만 퍼블릭 API로 노출합니다. 이는 캡슐화와 정보 은닉을 구현하는 강력한 패턴입니다.'
  },
  {
    id: 'cc-5',
    title: '최종 보스: 기억의 수호자',
    description: '동굴의 최종 보스를 만났습니다! 거대한 데이터를 다루면서도 메모리를 효율적으로 관리해야 합니다. 클로저의 메모리 관리를 마스터하세요!',
    difficulty: 'advanced',
    concept: 'closure-memory',
    gameGoal: '🐉 메모리를 효율적으로 관리하며 보스를 물리치세요!',
    gameElements: {
      penguin: { position: { x: 100, y: 300 }, animation: 'battle' },
      obstacles: [
        { type: 'rock', position: { x: 300, y: 300 } }
      ],
      exitPortal: { position: { x: 500, y: 300 }, locked: true }
    },
    successConditions: {
      functionsReturned: true
    },
    initialCode: `function createBattleSystem() {
  // 거대한 보스 데이터
  let bossData = new Array(100000).fill('BOSS_MEMORY');
  let playerHealth = 100;
  let bossHealth = 1000;
  
  // 메모리 효율적인 전투 시스템을 만드세요
  // 필요없는 데이터는 참조하지 마세요!
  
}

// 전투 시작!
const battle = createBattleSystem();`,
    solution: `function createBattleSystem() {
  let bossData = new Array(100000).fill('BOSS_MEMORY');
  let playerHealth = 100;
  let bossHealth = 1000;
  
  // 필요한 데이터만 추출
  const bossName = "기억의 수호자";
  const damage = 10;
  
  // bossData는 더 이상 참조하지 않음
  bossData = null;
  
  return {
    attack: function() {
      bossHealth -= damage;
      return bossName + "에게 " + damage + " 데미지!";
    },
    getBossHealth: function() {
      return bossHealth;
    }
  };
}

const battle = createBattleSystem();
return battle.attack();`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: "기억의 수호자에게 10 데미지!",
        description: '공격 함수가 올바른 메시지를 반환해야 합니다'
      }
    ],
    hints: [
      '큰 데이터(bossData)를 직접 참조하지 마세요',
      '필요한 정보만 별도 변수에 저장하세요',
      '사용하지 않는 데이터는 null로 설정해 가비지 컬렉션을 도와주세요'
    ],
    explanation: '클로저가 불필요한 대용량 데이터를 참조하면 메모리 누수가 발생할 수 있습니다. 필요한 데이터만 선별적으로 참조하고, 사용하지 않는 데이터는 명시적으로 해제하는 것이 중요합니다.'
  }
]