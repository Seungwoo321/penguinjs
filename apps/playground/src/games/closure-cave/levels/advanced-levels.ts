import { GameLevel } from '../../shared/types'

export const advancedLevels: GameLevel[] = [
  {
    id: 'closure-cave-advanced-1',
    difficulty: 'advanced',
    stageNumber: 1,
    title: '메모이제이션과 캐싱',
    description: '클로저를 사용하여 함수 결과를 캐싱하고 성능을 최적화하는 방법을 배웁니다.',
    objective: '펭귄이 연산 결과를 캐싱하여 빠르게 보물을 찾도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 0, col: 0 },
        targetPosition: { row: 4, col: 4 }
      },
      items: [
        { id: 'cache1', position: { row: 1, col: 1 }, value: '🗺️' },
        { id: 'cache2', position: { row: 2, col: 2 }, value: '🗺️' },
        { id: 'cache3', position: { row: 3, col: 3 }, value: '🗺️' },
        { id: 'treasure', position: { row: 4, col: 4 }, value: '🏅' }
      ],
      obstacles: [
        { type: 'rock', position: { row: 0, col: 3 } },
        { type: 'rock', position: { row: 1, col: 2 } },
        { type: 'rock', position: { row: 3, col: 0 } }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = // 어떻게 키를 만들까요?
    
    if (/* 캐시에 값이 있나요? */) {
      console.log('Cache hit!');
      return // ???
    }
    
    console.log('Computing...');
    const result = // ???
    // 결과를 캐시에 저장
    
    return result;
  };
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);
memoizedFib(40);`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('JSON.stringify(args)') && 
             code.includes('key in cache') && 
             code.includes('cache[key]') &&
             code.includes('fn(...args)') &&
             code.includes('cache[key] = result');
    },
    hints: [
      '인수를 문자열로 변환하여 캐시 키로 사용하세요 (JSON.stringify).',
      'in 연산자를 사용하여 캐시에 키가 있는지 확인하세요.',
      '캐시에 값이 없으면 함수를 실행하고 결과를 캐시에 저장하세요.'
    ],
    explanation: '메모이제이션은 클로저를 사용하여 함수의 결과를 캐싱하고, 같은 인수로 다시 호출될 때 저장된 결과를 반환하여 성능을 향상시킵니다.'
  },
  {
    id: 'closure-cave-advanced-2',
    difficulty: 'advanced',
    stageNumber: 2,
    title: '비동기 클로저',
    description: '비동기 작업에서 클로저가 어떻게 사용되는지 이해하고, 콜백 함수와의 관계를 배웁니다.',
    objective: '펭귄이 타이머를 설정하고 순차적으로 보물을 수집하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 2, col: 0 },
        targetPosition: { row: 2, col: 4 }
      },
      items: [
        { id: 'timer1', position: { row: 2, col: 1 }, value: '⏰' },
        { id: 'timer2', position: { row: 2, col: 2 }, value: '⏱️' },
        { id: 'timer3', position: { row: 2, col: 3 }, value: '⏲️' },
        { id: 'treasure', position: { row: 2, col: 4 }, value: '🏆' }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createTimerManager() {
  const timers = [];
  
  function addTimer(callback, delay) {
    const timerId = setTimeout(function() {
      console.log('Timer fired after ' + delay + 'ms');
      callback();
      
      // 타이머를 배열에서 제거
      const index = timers.indexOf(timerId);
      if (index > -1) {
        // ???
      }
    }, delay);
    
    timers.push(timerId);
    return timerId;
  }
  
  function clearAllTimers() {
    // 모든 타이머를 취소
    timers.forEach(function(timerId) {
      // ???
    });
    timers.length = 0;
  }
  
  return {
    addTimer: addTimer,
    clearAll: clearAllTimers,
    getActiveCount: function() {
      return // ???
    }
  };
}`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('timers.splice(index, 1)') && 
             code.includes('clearTimeout(timerId)') && 
             code.includes('return timers.length');
    },
    hints: [
      'setTimeout의 콜백 함수는 클로저를 통해 외부 변수에 접근할 수 있습니다.',
      'splice를 사용하여 배열에서 타이머 ID를 제거하세요.',
      'clearTimeout을 사용하여 타이머를 취소하세요.'
    ],
    explanation: '비동기 작업에서 클로저는 콜백 함수가 외부 변수에 접근할 수 있게 해주어, 비동기 작업이 완료된 후에도 상태를 유지할 수 있습니다.'
  },
  {
    id: 'closure-cave-advanced-3',
    difficulty: 'advanced',
    stageNumber: 3,
    title: '팩토리 패턴',
    description: '클로저를 사용하여 팩토리 패턴을 구현하고, 객체 생성을 최적화하는 방법을 배웁니다.',
    objective: '펭귄이 다양한 타입의 보물을 생성하여 수집하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 0, col: 0 },
        targetPosition: { row: 3, col: 3 }
      },
      items: [
        { id: 'gold', position: { row: 1, col: 1 }, value: '🪙' },
        { id: 'diamond', position: { row: 2, col: 1 }, value: '💎' },
        { id: 'emerald', position: { row: 3, col: 2 }, value: '💚' },
        { id: 'chest', position: { row: 3, col: 3 }, value: '🗝️' }
      ],
      obstacles: [
        { type: 'water', position: { row: 0, col: 2 } },
        { type: 'ice', position: { row: 2, col: 0 } }
      ],
      grid: { rows: 4, cols: 4 }
    },
    codeTemplate: `function treasureFactory() {
  const treasureTypes = {
    gold: { icon: '🪙', value: 100 },
    diamond: { icon: '💎', value: 500 },
    emerald: { icon: '💚', value: 300 }
  };
  
  let totalCreated = 0;
  const instances = [];
  
  function createTreasure(type) {
    if (!treasureTypes[type]) {
      throw new Error('Unknown treasure type: ' + type);
    }
    
    const treasure = {
      type: type,
      icon: treasureTypes[type].icon,
      value: treasureTypes[type].value,
      id: // 고유 ID 생성
      collected: false,
      collect: function() {
        if (!this.collected) {
          this.collected = true;
          return // ???
        }
        return 0;
      }
    };
    
    // ???
    return treasure;
  }
  
  return {
    create: createTreasure,
    getStats: function() {
      return {
        totalCreated: // ???
        totalValue: instances.reduce(function(sum, treasure) {
          return sum + (treasure.collected ? treasure.value : 0);
        }, 0)
      };
    }
  };
}`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('totalCreated++') && 
             code.includes("type + '_' + totalCreated") && 
             code.includes('instances.push(treasure)') &&
             code.includes('return this.value');
    },
    hints: [
      '총 생성 횟수를 증가시키고 이를 사용하여 고유 ID를 만드세요.',
      '생성된 보물 인스턴스를 instances 배열에 추가하세요.',
      'collect 메서드에서 this.value를 반환하세요.'
    ],
    explanation: '팩토리 패턴은 클로저를 사용하여 객체 생성 로직을 캐플슐화하고, 생성된 인스턴스를 추적하며 통계를 관리할 수 있습니다.'
  },
  {
    id: 'closure-cave-advanced-4',
    difficulty: 'advanced',
    stageNumber: 4,
    title: '디바운싱과 쓰로틀링',
    description: '클로저를 사용하여 디바운싱과 쓰로틀링을 구현하고, 성능 최적화를 배웁니다.',
    objective: '펭귄이 빠르게 움직이는 플랫폼에서 보물을 수집하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 4, col: 0 },
        targetPosition: { row: 0, col: 4 }
      },
      items: [
        { id: 'platform1', position: { row: 3, col: 1 }, value: '🗻' },
        { id: 'platform2', position: { row: 2, col: 2 }, value: '🗻' },
        { id: 'platform3', position: { row: 1, col: 3 }, value: '🗻' },
        { id: 'treasure', position: { row: 0, col: 4 }, value: '🎯' }
      ],
      obstacles: [
        { type: 'rock', position: { row: 4, col: 2 } },
        { type: 'rock', position: { row: 2, col: 0 } },
        { type: 'rock', position: { row: 0, col: 2 } }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function debounce(func, wait) {
  let timeoutId;
  
  return function debounced(...args) {
    const context = this;
    
    // 이전 타이머를 취소
    // ???
    
    timeoutId = setTimeout(function() {
      // ???
    }, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function throttled(...args) {
    const context = this;
    
    if (!inThrottle) {
      // 첫 번째 호출은 즉시 실행
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      // 마지막 호출을 저장
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          // ???
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('clearTimeout(timeoutId)') && 
             code.includes('func.apply(context, args)') && 
             code.includes('func.apply(context, args)');
    },
    hints: [
      '디바운싱은 마지막 호출 후 일정 시간이 지나면 함수를 실행합니다.',
      '쓰로틀링은 일정 시간 간격으로만 함수를 실행합니다.',
      'apply를 사용하여 원래 컨텍스트를 유지하면서 함수를 호출하세요.'
    ],
    explanation: '디바운싱과 쓰로틀링은 클로저를 사용하여 타이머와 상태를 관리하며, 함수 호출 빈도를 제한하여 성능을 최적화합니다.'
  },
  {
    id: 'closure-cave-advanced-5',
    difficulty: 'advanced',
    stageNumber: 5,
    title: '상태 머신 패턴',
    description: '클로저를 사용하여 복잡한 상태 머신을 구현하고, 상태 전환을 관리하는 방법을 배웁니다.',
    objective: '펭귄이 모든 상태를 거쳐 최종 보물을 획득하도록 도와주세요!',
    gameBoard: {
      character: {
        startPosition: { row: 2, col: 0 },
        targetPosition: { row: 2, col: 4 }
      },
      items: [
        { id: 'state1', position: { row: 2, col: 1 }, value: '🔴', type: 'state' },
        { id: 'state2', position: { row: 2, col: 2 }, value: '🟡', type: 'state' },
        { id: 'state3', position: { row: 2, col: 3 }, value: '🟢', type: 'state' },
        { id: 'treasure', position: { row: 2, col: 4 }, value: '👑' }
      ],
      grid: { rows: 5, cols: 5 }
    },
    codeTemplate: `function createStateMachine(config) {
  let currentState = config.initial;
  const states = config.states;
  const transitions = config.transitions;
  
  // 상태 전환 기록
  const history = [currentState];
  
  function transition(action) {
    const currentTransitions = transitions[currentState];
    
    if (!currentTransitions || !currentTransitions[action]) {
      console.log('Invalid transition: ' + action + ' from ' + currentState);
      return false;
    }
    
    const nextState = currentTransitions[action];
    
    // 상태 전환 전 훅
    if (states[currentState].onExit) {
      // ???
    }
    
    currentState = nextState;
    history.push(currentState);
    
    // 상태 진입 훅
    if (states[currentState].onEnter) {
      // ???
    }
    
    return true;
  }
  
  return {
    getState: function() {
      return // ???
    },
    transition: transition,
    canTransition: function(action) {
      return // ???
    },
    getHistory: function() {
      return // ???
    },
    reset: function() {
      currentState = config.initial;
      history.length = 0;
      history.push(currentState);
    }
  };
}

// 사용 예시
const trafficLight = createStateMachine({
  initial: 'red',
  states: {
    red: { onEnter: () => console.log('STOP!') },
    yellow: { onEnter: () => console.log('CAUTION!') },
    green: { onEnter: () => console.log('GO!') }
  },
  transitions: {
    red: { next: 'green' },
    green: { next: 'yellow' },
    yellow: { next: 'red' }
  }
});`,
    solutionValidator: (code: string, result: any) => {
      return code.includes('states[currentState].onExit()') && 
             code.includes('states[currentState].onEnter()') && 
             code.includes('return currentState') &&
             code.includes('return !!currentTransitions && !!currentTransitions[action]') &&
             code.includes('return [...history]');
    },
    hints: [
      'onExit과 onEnter 훅을 호출할 때 클로저가 currentState에 접근합니다.',
      'canTransition에서는 현재 상태에서 해당 액션으로 전환이 가능한지 확인합니다.',
      'getHistory에서는 원본 배열의 복사본을 반환하여 변경을 방지하세요.'
    ],
    explanation: '상태 머신 패턴은 클로저를 사용하여 현재 상태와 전환 기록을 캐플슐화하고, 복잡한 상태 로직을 관리할 수 있게 해죍니다.'
  }
]