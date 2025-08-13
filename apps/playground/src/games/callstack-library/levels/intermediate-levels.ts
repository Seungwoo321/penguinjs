import { CallStackLevel } from '@/games/callstack-library/types'

export const intermediateLevels: CallStackLevel[] = [
  {
    id: 'intermediate-1',
    title: '복잡한 재귀 패턴',
    description: '피보나치 수열의 재귀 호출을 추적해보세요.',
    explanation: '재귀 호출은 여러 번 분기할 수 있습니다.',
    difficulty: 'intermediate',
    stageNumber: 9,
    layoutType: 'A+',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(3);
console.log(result);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'fibonacci(3)',
            calls: [
              {
                name: 'fibonacci(2)',
                calls: [
                  { name: 'fibonacci(1)', returns: 1 },
                  { name: 'fibonacci(0)', returns: 0 }
                ],
                returns: 1
              },
              { name: 'fibonacci(1)', returns: 1 }
            ],
            returns: 2
          },
          { name: 'console.log', params: [2] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'fibonacci(3)', 'fibonacci(2)', 'fibonacci(1)', 'fibonacci(0)', 'fibonacci(1)', 'console.log'],
    simulationSteps: ['<global>', 'fibonacci(3)', 'fibonacci(2)', 'fibonacci(1)', 'fibonacci(1)-return', 'fibonacci(0)', 'fibonacci(0)-return', 'fibonacci(2)-return', 'fibonacci(1)', 'fibonacci(1)-return', 'fibonacci(3)-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 4,
    hints: [
      'fibonacci(3)은 fibonacci(2)와 fibonacci(1)을 호출합니다.',
      '왼쪽 분기(n-1)가 먼저 실행됩니다.',
      '각 재귀 호출은 독립적인 스택 프레임을 가집니다.'
    ],
    concepts: ['재귀 분기', '트리 구조', '메모이제이션']
  },
  {
    id: 'intermediate-2',
    title: '상호 재귀',
    description: '서로를 호출하는 함수들의 실행 순서를 파악해보세요.',
    explanation: '두 함수가 서로를 호출하는 패턴입니다.',
    difficulty: 'intermediate',
    stageNumber: 10,
    code: `function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}

console.log(isEven(3));`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'isEven(3)',
            calls: [
              {
                name: 'isOdd(2)',
                calls: [
                  {
                    name: 'isEven(1)',
                    calls: [
                      {
                        name: 'isOdd(0)',
                        returns: false
                      }
                    ],
                    returns: false
                  }
                ],
                returns: false
              }
            ],
            returns: false
          },
          { name: 'console.log', params: [false] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'isEven(3)', 'isOdd(2)', 'isEven(1)', 'isOdd(0)', 'console.log'],
    simulationSteps: ['<global>', 'isEven(3)', 'isOdd(2)', 'isEven(1)', 'isOdd(0)', 'isOdd(0)-return', 'isEven(1)-return', 'isOdd(2)-return', 'isEven(3)-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 5,
    hints: [
      '짝수 확인은 홀수 확인을 호출합니다.',
      '홀수 확인은 다시 짝수 확인을 호출합니다.',
      '0에 도달하면 재귀가 종료됩니다.'
    ],
    concepts: ['상호 재귀', '조건부 반환'],
    layoutType: 'A+'
  },
  {
    id: 'intermediate-3',
    title: '고차 함수와 콜스택',
    description: '고차 함수의 콜백 실행 순서를 추적해보세요.',
    explanation: '함수를 인자로 받는 고차 함수의 동작을 이해합니다.',
    difficulty: 'intermediate',
    stageNumber: 11,
    code: `function processArray(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i]));
  }
  return result;
}

function double(x) {
  return x * 2;
}

const numbers = [1, 2];
const doubled = processArray(numbers, double);
console.log(doubled);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'processArray',
            params: [[1, 2], 'double'],
            calls: [
              { name: 'double', params: [1], returns: 2 },
              { name: 'double', params: [2], returns: 4 }
            ],
            returns: [2, 4]
          },
          { name: 'console.log', params: [[2, 4]] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'processArray', 'double', 'double', 'console.log'],
    simulationSteps: ['<global>', 'processArray', 'double', 'double-return', 'double', 'double-return', 'processArray-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 3,
    hints: [
      'processArray가 먼저 호출됩니다.',
      '반복문 내에서 callback(double)이 각 요소마다 호출됩니다.',
      '모든 처리가 끝나면 결과를 반환합니다.'
    ],
    concepts: ['고차 함수', '콜백', '반복문'],
    layoutType: 'A+'
  },
  {
    id: 'intermediate-4',
    title: '에러 스택 추적',
    description: '에러가 발생할 때의 콜스택을 이해해보세요.',
    explanation: '에러는 콜스택을 따라 전파됩니다.',
    difficulty: 'intermediate',
    stageNumber: 12,
    code: `function validateAge(age) {
  if (age < 0) {
    throw new Error("나이는 음수일 수 없습니다");
  }
  return true;
}

function createUser(name, age) {
  validateAge(age);
  return { name, age };
}

try {
  const user = createUser("김펭귄", -5);
} catch (e) {
  console.log("에러 발생!");
}`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'createUser',
            params: ['김펭귄', -5],
            calls: [
              {
                name: 'validateAge',
                params: [-5],
                returns: 'Error'
              }
            ]
          },
          { name: 'console.log', params: ['에러 발생!'] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'createUser', 'validateAge', 'console.log'],
    simulationSteps: ['<global>', 'createUser', 'validateAge', 'validateAge-return', 'createUser-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 3,
    hints: [
      'createUser가 validateAge를 호출합니다.',
      'validateAge에서 에러가 발생합니다.',
      'catch 블록에서 에러를 처리합니다.'
    ],
    concepts: ['에러 처리', '스택 추적', 'try-catch'],
    layoutType: 'A+'
  },
  {
    id: 'intermediate-5',
    title: '클로저와 콜스택',
    description: '클로저가 포함된 함수의 실행 순서를 파악해보세요.',
    explanation: '클로저는 외부 함수의 컨텍스트를 기억합니다.',
    difficulty: 'intermediate',
    stageNumber: 13,
    code: `function createCounter() {
  let count = 0;
  
  return function increment() {
    count++;
    console.log(count);
    return count;
  };
}

const counter = createCounter();
counter();
counter();`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'createCounter',
            returns: 'increment function'
          },
          {
            name: 'increment',
            calls: [
              { name: 'console.log', params: [1] }
            ],
            returns: 1
          },
          {
            name: 'increment',
            calls: [
              { name: 'console.log', params: [2] }
            ],
            returns: 2
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'createCounter', 'increment', 'console.log', 'increment', 'console.log'],
    simulationSteps: ['<global>', 'createCounter', 'createCounter-return', 'increment', 'console.log', 'console.log-return', 'increment-return', 'increment', 'console.log', 'console.log-return', 'increment-return', '<global>-return'],
    maxStackSize: 3,
    hints: [
      'createCounter는 한 번만 호출됩니다.',
      '반환된 increment 함수가 두 번 호출됩니다.',
      '각 increment 호출은 독립적인 스택 프레임을 가집니다.'
    ],
    concepts: ['클로저', '함수 팩토리', '상태 유지'],
    layoutType: 'A+'
  },
  {
    id: 'intermediate-6',
    title: '중첩 연쇄 호출',
    description: '깊이 중첩된 함수 호출의 LIFO 원칙을 이해해보세요.',
    explanation: '함수가 연쇄적으로 호출될 때 스택이 어떻게 쌓이고 해제되는지 학습합니다.',
    difficulty: 'intermediate',
    stageNumber: 14,
    layoutType: 'A+',
    code: `function first() {
  console.log("첫 번째 시작");
  second();
  console.log("첫 번째 끝");
}

function second() {
  console.log("두 번째 시작");
  third();
  console.log("두 번째 끝");
}

function third() {
  console.log("세 번째");
}

first();`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'first',
            calls: [
              { name: 'console.log', params: ['첫 번째 시작'] },
              {
                name: 'second',
                calls: [
                  { name: 'console.log', params: ['두 번째 시작'] },
                  {
                    name: 'third',
                    calls: [
                      { name: 'console.log', params: ['세 번째'] }
                    ]
                  },
                  { name: 'console.log', params: ['두 번째 끝'] }
                ]
              },
              { name: 'console.log', params: ['첫 번째 끝'] }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'first', 'console.log', 'second', 'console.log', 'third', 'console.log', 'console.log', 'console.log'],
    simulationSteps: [
      '<global>',
      'first',
      'console.log',
      'console.log-return',
      'second',
      'console.log',
      'console.log-return',
      'third',
      'console.log',
      'console.log-return',
      'third-return',
      'console.log',
      'console.log-return',
      'second-return',
      'console.log',
      'console.log-return',
      'first-return',
      '<global>-return'
    ],
    maxStackSize: 5,
    hints: [
      '각 함수가 다음 함수를 호출하여 스택이 쌓입니다.',
      'third가 끝나면 second로, second가 끝나면 first로 돌아갑니다.',
      'LIFO: 마지막에 들어간 함수가 먼저 나옵니다.'
    ],
    concepts: ['중첩 호출', '스택 추적', '실행 컨텍스트']
  },
  {
    id: 'intermediate-7',
    title: '배열 메서드 체이닝',
    description: '배열 메서드들이 연속적으로 호출될 때의 스택을 추적해보세요.',
    explanation: 'map, filter 같은 고차 함수들이 체이닝될 때 콜백 함수들의 실행 순서를 이해합니다.',
    difficulty: 'intermediate',
    stageNumber: 15,
    layoutType: 'A+',
    code: `const numbers = [1, 2, 3];

const result = numbers
  .map(x => {
    console.log(\`map: \${x}\`);
    return x * 2;
  })
  .filter(x => {
    console.log(\`filter: \${x}\`);
    return x > 2;
  });

console.log("결과:", result);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'Array.map',
            calls: [
              {
                name: 'mapCallback',
                params: [1],
                calls: [{ name: 'console.log', params: ['map: 1'] }],
                returns: 2
              },
              {
                name: 'mapCallback',
                params: [2],
                calls: [{ name: 'console.log', params: ['map: 2'] }],
                returns: 4
              },
              {
                name: 'mapCallback',
                params: [3],
                calls: [{ name: 'console.log', params: ['map: 3'] }],
                returns: 6
              }
            ],
            returns: [2, 4, 6]
          },
          {
            name: 'Array.filter',
            calls: [
              {
                name: 'filterCallback',
                params: [2],
                calls: [{ name: 'console.log', params: ['filter: 2'] }],
                returns: false
              },
              {
                name: 'filterCallback',
                params: [4],
                calls: [{ name: 'console.log', params: ['filter: 4'] }],
                returns: true
              },
              {
                name: 'filterCallback',
                params: [6],
                calls: [{ name: 'console.log', params: ['filter: 6'] }],
                returns: true
              }
            ],
            returns: [4, 6]
          },
          { name: 'console.log', params: ['결과:', [4, 6]] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'Array.map', 'mapCallback', 'console.log', 'mapCallback', 'console.log', 'mapCallback', 'console.log', 'Array.filter', 'filterCallback', 'console.log', 'filterCallback', 'console.log', 'filterCallback', 'console.log', 'console.log'],
    simulationSteps: [
      '<global>',
      'Array.map',
      'mapCallback',
      'console.log',
      'console.log-return',
      'mapCallback-return',
      'mapCallback',
      'console.log',
      'console.log-return',
      'mapCallback-return',
      'mapCallback',
      'console.log',
      'console.log-return',
      'mapCallback-return',
      'Array.map-return',
      'Array.filter',
      'filterCallback',
      'console.log',
      'console.log-return',
      'filterCallback-return',
      'filterCallback',
      'console.log',
      'console.log-return',
      'filterCallback-return',
      'filterCallback',
      'console.log',
      'console.log-return',
      'filterCallback-return',
      'Array.filter-return',
      'console.log',
      'console.log-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      'map이 먼저 모든 요소를 처리한 후 filter가 실행됩니다.',
      '각 콜백 함수는 독립적인 스택 프레임을 가집니다.',
      '메서드 체이닝은 이전 결과를 다음 메서드로 전달합니다.'
    ],
    concepts: ['메서드 체이닝', '고차 함수', '콜백 실행']
  },
  {
    id: 'intermediate-8',
    title: '이진 트리 순회',
    description: '트리 구조를 재귀적으로 순회할 때의 복잡한 LIFO 패턴을 이해해보세요.',
    explanation: '중위 순회(Inorder)는 왼쪽-루트-오른쪽 순서로 트리를 방문합니다.',
    difficulty: 'intermediate',
    stageNumber: 16,
    layoutType: 'A+',
    code: `const tree = {
  value: 2,
  left: {
    value: 1,
    left: null,
    right: null
  },
  right: {
    value: 3,
    left: null,
    right: null
  }
};

function inorder(node) {
  if (!node) return;
  
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}

inorder(tree);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'inorder(tree)',
            calls: [
              {
                name: 'inorder(left:1)',
                calls: [
                  { name: 'inorder(null)', returns: undefined },
                  { name: 'console.log', params: [1] },
                  { name: 'inorder(null)', returns: undefined }
                ]
              },
              { name: 'console.log', params: [2] },
              {
                name: 'inorder(right:3)',
                calls: [
                  { name: 'inorder(null)', returns: undefined },
                  { name: 'console.log', params: [3] },
                  { name: 'inorder(null)', returns: undefined }
                ]
              }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'inorder(tree)', 'inorder(left:1)', 'inorder(null)', 'console.log', 'inorder(null)', 'console.log', 'inorder(right:3)', 'inorder(null)', 'console.log', 'inorder(null)'],
    simulationSteps: [
      '<global>',
      'inorder(tree)',
      'inorder(left:1)',
      'inorder(null)',
      'inorder(null)-return',
      'console.log',
      'console.log-return',
      'inorder(null)',
      'inorder(null)-return',
      'inorder(left:1)-return',
      'console.log',
      'console.log-return',
      'inorder(right:3)',
      'inorder(null)',
      'inorder(null)-return',
      'console.log',
      'console.log-return',
      'inorder(null)',
      'inorder(null)-return',
      'inorder(right:3)-return',
      'inorder(tree)-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      '트리의 왼쪽 서브트리를 먼저 완전히 탐색합니다.',
      '각 노드에서 왼쪽-출력-오른쪽 순서를 따릅니다.',
      'null 체크로 재귀가 종료되고 스택이 해제됩니다.'
    ],
    concepts: ['트리 순회', '재귀 깊이', '복잡한 LIFO']
  }
]