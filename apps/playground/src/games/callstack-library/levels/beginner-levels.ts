import { CallStackLevel } from '@/games/callstack-library/types'

export const beginnerLevels: CallStackLevel[] = [
  {
    id: 'beginner-1',
    title: '첫 번째 책 정리',
    description: '단순한 함수 호출과 반환을 이해해보세요.',
    explanation: '함수가 호출되면 콜스택에 책처럼 쌓이고, 실행이 끝나면 제거됩니다.',
    difficulty: 'beginner',
    stageNumber: 1,
    layoutType: 'A',
    code: `function greet() {
  console.log("안녕하세요!");
}

greet();
console.log("환영합니다!");`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          { 
            name: 'greet', 
            calls: [
              { name: 'console.log', params: ['안녕하세요!'] }
            ]
          },
          { name: 'console.log', params: ['환영합니다!'] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'greet', 'console.log("안녕하세요!")', 'console.log("환영합니다!")'],
    simulationSteps: [
      '<global>',
      'greet',
      'console.log("안녕하세요!")',
      'console.log-return',
      'greet-return',
      'console.log("환영합니다!")',
      'console.log-return',
      '<global>-return'
    ],
    maxStackSize: 3,
    hints: [
      '프로그램은 전역 실행 컨텍스트(<global>)에서 시작합니다.',
      'greet() 함수가 먼저 호출되어 콜스택에 쌓입니다.',
      '함수 실행이 끝나면 콜스택에서 제거되고 다음 줄로 이동합니다.'
    ],
    concepts: ['함수 호출', '실행 순서', '콜스택 기초']
  },
  {
    id: 'beginner-2',
    title: '책장 쌓기',
    description: '함수 안에서 다른 함수를 호출할 때 콜스택의 변화를 관찰하세요.',
    explanation: '함수가 다른 함수를 호출하면 콜스택이 책장처럼 높이 쌓입니다.',
    difficulty: 'beginner',
    stageNumber: 2,
    layoutType: 'A',
    code: `function outer() {
  console.log("외부 시작");
  inner();
  console.log("외부 끝");
}

function inner() {
  console.log("내부 실행");
}

outer();`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'outer',
            calls: [
              { name: 'console.log', params: ['외부 시작'] },
              { 
                name: 'inner',
                calls: [
                  { name: 'console.log', params: ['내부 실행'] }
                ]
              },
              { name: 'console.log', params: ['외부 끝'] }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'outer', 'console.log("외부 시작")', 'inner', 'console.log("내부 실행")', 'console.log("외부 끝")'],
    simulationSteps: [
      '<global>',
      'outer',
      'console.log("외부 시작")',
      'console.log-return',
      'inner',
      'console.log("내부 실행")',
      'console.log-return',
      'inner-return',
      'console.log("외부 끝")',
      'console.log-return',
      'outer-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      'outer 함수가 먼저 콜스택에 쌓입니다.',
      'outer 함수 내부에서 inner 함수가 호출되어 그 위에 쌓입니다.',
      'inner 함수가 끝나면 콜스택에서 제거되고 outer로 돌아갑니다.'
    ],
    concepts: ['중첩 호출', 'LIFO 원칙', '실행 컨텍스트']
  },
  {
    id: 'beginner-3',
    title: '연쇄 정리',
    description: '함수가 다른 함수의 결과를 반환하는 체인 호출을 추적해보세요.',
    explanation: '함수들이 연쇄적으로 호출되며 값을 전달합니다.',
    difficulty: 'beginner',
    stageNumber: 3,
    layoutType: 'A',
    code: `function first() {
  return second();
}

function second() {
  return third();
}

function third() {
  return "완료!";
}

console.log(first());`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'first',
            calls: [
              {
                name: 'second',
                calls: [
                  {
                    name: 'third',
                    returns: '완료!'
                  }
                ],
                returns: '완료!'
              }
            ],
            returns: '완료!'
          },
          { name: 'console.log', params: ['완료!'] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'first', 'second', 'third', 'console.log("완료!")'],
    simulationSteps: [
      '<global>',
      'first',
      'second',
      'third',
      'third-return',
      'second-return',
      'first-return',
      'console.log("완료!")',
      'console.log-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      '각 함수는 다음 함수를 호출하고 그 결과를 반환합니다.',
      '콜스택은 third까지 쌓였다가 차례로 해제됩니다.',
      '반환값이 체인을 따라 전달됩니다.'
    ],
    concepts: ['함수 체인', '반환값 전달', '콜스택 깊이']
  },
  {
    id: 'beginner-4',
    title: '책 더미 관리',
    description: '여러 함수가 협력하여 작업을 처리하는 과정을 이해해보세요.',
    explanation: '콜스택의 깊이와 메모리 사용을 고려한 함수 설계가 중요합니다.',
    difficulty: 'beginner',
    stageNumber: 4,
    layoutType: 'A',
    code: `function calculateSum(a, b) {
  return add(a, b);
}

function add(x, y) {
  return x + y;
}

function processData() {
  const result = calculateSum(5, 3);
  console.log(\`결과: \${result}\`);
  return result;
}

processData();`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'processData',
            calls: [
              {
                name: 'calculateSum',
                params: [5, 3],
                calls: [
                  {
                    name: 'add',
                    params: [5, 3],
                    returns: 8
                  }
                ],
                returns: 8
              },
              { name: 'console.log', params: ['결과: 8'] }
            ],
            returns: 8
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'processData', 'calculateSum', 'add', 'console.log("결과: 8")'],
    simulationSteps: [
      '<global>',
      'processData',
      'calculateSum',
      'add',
      'add-return',
      'calculateSum-return',
      'console.log("결과: 8")',
      'console.log-return',
      'processData-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      'processData에서 calculateSum을 호출합니다.',
      'calculateSum은 add를 호출하여 실제 계산을 수행합니다.',
      '각 함수는 자신의 역할만 수행하고 결과를 반환합니다.'
    ],
    concepts: ['콜스택 깊이', '함수 분리', '메모리 관리']
  },
  {
    id: 'beginner-5',
    title: '순환 정리',
    description: '재귀 함수가 자기 자신을 호출하는 과정을 추적해보세요.',
    explanation: '재귀는 함수가 자기 자신을 호출하는 프로그래밍 기법입니다.',
    difficulty: 'beginner',
    stageNumber: 5,
    layoutType: 'A',
    code: `function countdown(n) {
  if (n <= 0) {
    console.log("발사!");
    return;
  }
  console.log(n);
  countdown(n - 1);
}

countdown(3);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'countdown(3)',
            calls: [
              { name: 'console.log', params: [3] },
              {
                name: 'countdown(2)',
                calls: [
                  { name: 'console.log', params: [2] },
                  {
                    name: 'countdown(1)',
                    calls: [
                      { name: 'console.log', params: [1] },
                      {
                        name: 'countdown(0)',
                        calls: [
                          { name: 'console.log', params: ['발사!'] }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'countdown(3)', 'console.log(3)', 'countdown(2)', 'console.log(2)', 'countdown(1)', 'console.log(1)', 'countdown(0)', 'console.log("발사!")'],
    simulationSteps: [
      '<global>',
      'countdown(3)',
      'console.log(3)',
      'console.log-return',
      'countdown(2)',
      'console.log(2)',
      'console.log-return',
      'countdown(1)',
      'console.log(1)',
      'console.log-return',
      'countdown(0)',
      'console.log("발사!")',
      'console.log-return',
      'countdown(0)-return',
      'countdown(1)-return',
      'countdown(2)-return',
      'countdown(3)-return',
      '<global>-return'
    ],
    maxStackSize: 6,
    hints: [
      '각 countdown 호출은 새로운 스택 프레임을 만듭니다.',
      '재귀는 기저 조건(n <= 0)에 도달할 때까지 계속됩니다.',
      '모든 재귀 호출이 완료되면 역순으로 반환됩니다.'
    ],
    concepts: ['재귀 함수', '기저 조건', '스택 프레임']
  },
  {
    id: 'beginner-6',
    title: '효율적 정리',
    description: '재귀와 반복문의 콜스택 사용량 차이를 비교해보세요.',
    explanation: '같은 작업도 구현 방식에 따라 콜스택 사용량이 달라집니다.',
    difficulty: 'beginner',
    stageNumber: 6,
    layoutType: 'A',
    code: `// 재귀 버전
function sumRecursive(n) {
  if (n <= 0) return 0;
  return n + sumRecursive(n - 1);
}

// 반복문 버전
function sumIterative(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log(sumRecursive(5));
console.log(sumIterative(5));`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'sumRecursive(5)',
            calls: [
              {
                name: 'sumRecursive(4)',
                calls: [
                  {
                    name: 'sumRecursive(3)',
                    calls: [
                      {
                        name: 'sumRecursive(2)',
                        calls: [
                          {
                            name: 'sumRecursive(1)',
                            calls: [
                              {
                                name: 'sumRecursive(0)',
                                returns: 0
                              }
                            ],
                            returns: 1
                          }
                        ],
                        returns: 3
                      }
                    ],
                    returns: 6
                  }
                ],
                returns: 10
              }
            ],
            returns: 15
          },
          { name: 'console.log', params: [15] },
          {
            name: 'sumIterative(5)',
            returns: 15
          },
          { name: 'console.log', params: [15] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'sumRecursive(5)', 'sumRecursive(4)', 'sumRecursive(3)', 'sumRecursive(2)', 'sumRecursive(1)', 'sumRecursive(0)', 'console.log(15)', 'sumIterative(5)', 'console.log(15)'],
    simulationSteps: [
      '<global>',
      'sumRecursive(5)',
      'sumRecursive(4)',
      'sumRecursive(3)',
      'sumRecursive(2)',
      'sumRecursive(1)',
      'sumRecursive(0)',
      'sumRecursive(0)-return',
      'sumRecursive(1)-return',
      'sumRecursive(2)-return',
      'sumRecursive(3)-return',
      'sumRecursive(4)-return',
      'sumRecursive(5)-return',
      'console.log(15)',
      'console.log-return',
      'sumIterative(5)',
      'sumIterative(5)-return',
      'console.log(15)',
      'console.log-return',
      '<global>-return'
    ],
    maxStackSize: 8,
    hints: [
      '재귀 버전은 각 호출마다 새로운 스택 프레임을 생성합니다.',
      '반복문 버전은 단일 스택 프레임만 사용합니다.',
      '큰 숫자의 경우 재귀는 스택 오버플로우를 일으킬 수 있습니다.'
    ],
    concepts: ['재귀 vs 반복문', '콜스택 효율성', '성능 비교']
  },
  {
    id: 'beginner-7',
    title: '정리 순서',
    description: '함수 호출과 반환값의 실행 순서를 정확히 추적해보세요.',
    explanation: '코드는 위에서 아래로, 함수는 호출된 순서대로 실행됩니다.',
    difficulty: 'beginner',
    stageNumber: 7,
    layoutType: 'A',
    code: `function multiply(a, b) {
  console.log(\`\${a} × \${b} 계산\`);
  return a * b;
}

function calculate() {
  const x = multiply(2, 3);
  const y = multiply(x, 4);
  return y;
}

console.log(\`최종 결과: \${calculate()}\`);`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'calculate',
            calls: [
              {
                name: 'multiply',
                params: [2, 3],
                calls: [
                  { name: 'console.log', params: ['2 × 3 계산'] }
                ],
                returns: 6
              },
              {
                name: 'multiply',
                params: [6, 4],
                calls: [
                  { name: 'console.log', params: ['6 × 4 계산'] }
                ],
                returns: 24
              }
            ],
            returns: 24
          },
          { name: 'console.log', params: ['최종 결과: 24'] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'calculate', 'multiply(2,3)', 'console.log("2 × 3 계산")', 'multiply(6,4)', 'console.log("6 × 4 계산")', 'console.log("최종 결과: 24")'],
    simulationSteps: [
      '<global>',
      'calculate',
      'multiply(2,3)',
      'console.log("2 × 3 계산")',
      'console.log-return',
      'multiply-return',
      'multiply(6,4)',
      'console.log("6 × 4 계산")',
      'console.log-return',
      'multiply-return',
      'calculate-return',
      'console.log("최종 결과: 24")',
      'console.log-return',
      '<global>-return'
    ],
    maxStackSize: 4,
    hints: [
      'calculate 함수가 호출되면 내부 코드가 순차적으로 실행됩니다.',
      '첫 번째 multiply의 결과가 두 번째 multiply의 인자가 됩니다.',
      '모든 계산이 끝난 후 최종 결과가 출력됩니다.'
    ],
    concepts: ['실행 순서', '반환값 활용', '순차적 처리']
  },
  {
    id: 'beginner-8',
    title: '첫 비동기 체험',
    description: 'setTimeout을 사용한 비동기 코드의 실행 순서를 관찰해보세요.',
    explanation: '비동기 코드는 나중에 실행되도록 예약됩니다.',
    difficulty: 'beginner',
    stageNumber: 8,
    layoutType: 'A',
    queueTypes: ['callstack', 'macrotask'],
    code: `console.log("1. 시작");

setTimeout(() => {
  console.log("3. 비동기 실행");
}, 0);

console.log("2. 끝");`,
    functionCalls: [
      {
        name: '<global>',
        calls: [
          { name: 'console.log', params: ['1. 시작'] },
          { 
            name: 'setTimeout',
            params: ['() => {...}', 0],
            createsTask: {
              type: 'macrotask',
              name: 'setTimeout callback'
            }
          },
          { name: 'console.log', params: ['2. 끝'] }
        ]
      }
    ],
    asyncTasks: [
      {
        type: 'macrotask',
        name: 'setTimeout callback',
        calls: [
          { name: 'console.log', params: ['3. 비동기 실행'] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'console.log("1. 시작")', 'setTimeout', 'console.log("2. 끝")', 'setTimeout callback', 'console.log("3. 비동기 실행")'],
    simulationSteps: [
      '<global>',
      'console.log("1. 시작")',
      'console.log-return',
      'setTimeout',
      'setTimeout-return',
      'console.log("2. 끝")',
      'console.log-return',
      '<global>-return',
      'setTimeout-callback',
      'console.log("3. 비동기 실행")',
      'console.log-return',
      'setTimeout-callback-return'
    ],
    maxStackSize: 3,
    hints: [
      'setTimeout은 콜백을 태스크 큐에 예약합니다.',
      '0초 지연이어도 콜백은 현재 코드가 끝난 후 실행됩니다.',
      '이것이 JavaScript의 비동기 처리 방식입니다.'
    ],
    concepts: ['비동기 처리', 'setTimeout', '태스크 큐', '이벤트 루프 입문']
  }
]