import { GameLevel } from '@/games/shared/types'

export const intermediateLevels: GameLevel[] = [
  {
    id: 'closure-cave-intermediate-1',
    difficulty: 'intermediate',
    stageNumber: 1,
    title: '렉시컬 스코프 깊이 이해',
    description: '중첩된 함수에서 렉시컬 스코프가 어떻게 동작하는지 이해하고, 외부 스코프의 변수에 접근하는 방법을 배웁니다.',
    objective: '펭귄이 보물 💎을 찾도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 0, col: 0 },
        targetPosition: { row: 3, col: 3 }
      },
      items: [
        { id: 'gem1', position: { row: 1, col: 1 }, value: '💎' },
        { id: 'gem2', position: { row: 2, col: 2 }, value: '💎' },
        { id: 'gem3', position: { row: 3, col: 3 }, value: '💎' }
      ],
      obstacles: [
        { type: 'rock', position: { row: 0, col: 2 } },
        { type: 'rock', position: { row: 2, col: 0 } }
      ],
      grid: { rows: 4, cols: 4 }
    },
    codeTemplate: `function outer() {
  const secret = 'hidden';
  
  function middle() {
    // 여기서 secret에 접근하세요
    
    function inner() {
      // 여기서도 secret에 접근할 수 있습니다
      return // ???
    }
    
    return inner();
  }
  
  return middle();
}

outer();`,
    solutionValidator: (code: string, result: any) => {
      return result === 'hidden';
    },
    hints: [
      '렉시컬 스코프는 함수가 정의된 위치에 따라 결정됩니다.',
      'inner 함수에서 outer 함수의 secret 변수에 접근할 수 있습니다.',
      'return secret; 을 사용하세요.'
    ],
    explanation: '렉시컬 스코프(Lexical Scope)는 함수가 선언된 위치에 따라 변수의 유효 범위가 결정되는 것을 의미합니다.'
  },
  {
    id: 'closure-cave-intermediate-2',
    difficulty: 'intermediate',
    stageNumber: 2,
    title: '클로저와 반복문',
    description: '반복문에서 클로저가 어떻게 동작하는지 이해하고, var와 let의 차이를 배웁니다.',
    objective: '펭귄이 숫자 보물을 순서대로 수집하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 0, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'num0', position: { row: 0, col: 0 }, value: '0️⃣' },
        { id: 'num1', position: { row: 0, col: 1 }, value: '1️⃣' },
        { id: 'num2', position: { row: 0, col: 2 }, value: '2️⃣' },
        { id: 'num3', position: { row: 0, col: 3 }, value: '3️⃣' },
        { id: 'num4', position: { row: 0, col: 4 }, value: '4️⃣' }
      ],
      grid: { rows: 1, cols: 5 }
    },
    codeTemplate: `function createFunctions() {
  const functions = [];
  
  for (var i = 0; i < 5; i++) {
    functions.push(function() {
      return i;
    });
  }
  
  return functions;
}

const funcs = createFunctions();
funcs[0](); // 5가 반환됩니다. 왜일까요?`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('let i = 0') || code.includes('(function(j)') || code.includes('const j = i');
    },
    hints: [
      'var는 함수 스코프를 가지므로 모든 클로저가 같은 i를 참조합니다.',
      'let을 사용하면 블록 스코프가 생성됩니다.',
      'IIFE(즉시 실행 함수)를 사용하여 현재 i 값을 캡처할 수 있습니다.'
    ],
    explanation: '반복문에서 var를 사용하면 모든 클로저가 같은 변수를 참조하게 됩니다. let이나 IIFE를 사용하여 해결할 수 있습니다.'
  },
  {
    id: 'closure-cave-intermediate-3',
    difficulty: 'intermediate',
    stageNumber: 3,
    title: '모듈 패턴',
    description: '클로저를 사용하여 프라이빗 변수와 퍼블릭 메서드를 가진 모듈을 만드는 방법을 배웁니다.',
    objective: '펭귄이 금고의 비밀번호를 관리하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 1, col: 0 },
        targetPosition: { row: 1, col: 3 }
      },
      items: [
        { id: 'safe', position: { row: 1, col: 3 }, value: '🔐', locked: true }
      ],
      obstacles: [
        { type: 'ice', position: { row: 0, col: 1 } },
        { type: 'ice', position: { row: 2, col: 1 } }
      ],
      grid: { rows: 3, cols: 4 }
    },
    codeTemplate: `function createSafe() {
  let password = '1234';
  let locked = true;
  
  return {
    // 비밀번호를 확인하는 메서드
    unlock: function(pass) {
      // ???
    },
    
    // 잠금 상태를 확인하는 메서드
    isLocked: function() {
      // ???
    },
    
    // 비밀번호를 변경하는 메서드
    changePassword: function(oldPass, newPass) {
      // ???
    }
  };
}

const safe = createSafe();
safe.unlock('1234');`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('if (pass === password)') && 
             code.includes('locked = false') && 
             code.includes('return locked');
    },
    hints: [
      '프라이빗 변수 password와 locked는 외부에서 직접 접근할 수 없습니다.',
      '반환된 객체의 메서드들만 이 변수들에 접근할 수 있습니다.',
      'unlock 메서드에서 비밀번호를 확인하고 locked를 false로 설정하세요.'
    ],
    explanation: '모듈 패턴은 클로저를 사용하여 프라이빗 변수를 만들고, 퍼블릭 API를 통해서만 접근할 수 있도록 합니다.'
  },
  {
    id: 'closure-cave-intermediate-4',
    difficulty: 'intermediate',
    stageNumber: 4,
    title: '이벤트 핸들러와 클로저',
    description: '이벤트 핸들러에서 클로저가 어떻게 사용되는지 이해하고, 메모리 관리를 배웁니다.',
    objective: '펭귄이 버튼을 눌러 보물을 수집하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 2, col: 0 },
        targetPosition: { row: 2, col: 4 }
      },
      items: [
        { id: 'button1', position: { row: 0, col: 1 }, value: '🔴' },
        { id: 'button2', position: { row: 1, col: 2 }, value: '🟢' },
        { id: 'button3', position: { row: 2, col: 3 }, value: '🔵' },
        { id: 'treasure', position: { row: 2, col: 4 }, value: '💰', locked: true }
      ],
      grid: { rows: 3, cols: 5 }
    },
    codeTemplate: `function setupButtons() {
  const buttons = ['red', 'green', 'blue'];
  const handlers = [];
  
  buttons.forEach(function(color, index) {
    const handler = function() {
      console.log('Button ' + color + ' clicked!');
      // 클릭 횟수를 추적하려면?
    };
    
    handlers.push(handler);
    // button.addEventListener('click', handler);
  });
  
  // 나중에 이벤트를 제거하려면?
  return {
    handlers: handlers,
    cleanup: function() {
      // ???
    }
  };
}`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('let clickCount = 0') || 
             code.includes('clickCounts[color]') ||
             code.includes('removeEventListener');
    },
    hints: [
      '각 이벤트 핸들러는 자신만의 클로저를 가집니다.',
      '클릭 횟수를 추적하려면 클로저 내부에 변수를 만드세요.',
      'cleanup 함수에서 removeEventListener를 호출하여 메모리 누수를 방지하세요.'
    ],
    explanation: '이벤트 핸들러는 클로저를 통해 외부 변수에 접근할 수 있습니다. 메모리 누수를 방지하기 위해 이벤트 리스너를 제거하는 것이 중요합니다.'
  },
  {
    id: 'closure-cave-intermediate-5',
    difficulty: 'intermediate',
    stageNumber: 5,
    title: '부분 적용과 커링',
    description: '클로저를 사용하여 함수의 부분 적용과 커링을 구현하는 방법을 배웁니다.',
    objective: '펭귄이 마법 주문을 조합하여 보물을 얻도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 0, col: 0 },
        targetPosition: { row: 3, col: 3 }
      },
      items: [
        { id: 'spell1', position: { row: 1, col: 0 }, value: '✨' },
        { id: 'spell2', position: { row: 2, col: 1 }, value: '🌟' },
        { id: 'spell3', position: { row: 3, col: 2 }, value: '⭐' },
        { id: 'treasure', position: { row: 3, col: 3 }, value: '🏆' }
      ],
      obstacles: [
        { type: 'water', position: { row: 0, col: 2 } },
        { type: 'water', position: { row: 2, col: 0 } }
      ],
      grid: { rows: 4, cols: 4 }
    },
    codeTemplate: `// 부분 적용
function multiply(a, b) {
  return a * b;
}

function partial(fn, ...args) {
  return function(...remainingArgs) {
    // ???
  };
}

// 커링
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // ???
    } else {
      return function(...nextArgs) {
        // ???
      };
    }
  };
}

const multiplyBy2 = partial(multiply, 2);
multiplyBy2(5); // 10`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('fn(...args, ...remainingArgs)') || 
             code.includes('fn.apply') ||
             code.includes('curried(...args, ...nextArgs)');
    },
    hints: [
      '부분 적용은 함수의 일부 인수를 미리 고정합니다.',
      'partial 함수에서는 미리 받은 인수와 나중에 받은 인수를 합쳐서 원래 함수를 호출합니다.',
      '커링은 함수를 한 번에 하나의 인수만 받도록 변환합니다.'
    ],
    explanation: '부분 적용과 커링은 클로저를 활용하여 함수를 더 유연하게 사용할 수 있게 해주는 함수형 프로그래밍 기법입니다.'
  }
]