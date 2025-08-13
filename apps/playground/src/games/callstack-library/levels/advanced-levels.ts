import { CallStackLevel } from '@/games/callstack-library/types'
import { callstackLibraryThemeConfig } from '@/games/callstack-library/theme/callstackLibraryGameTheme'

// 함수별 색상 매핑 (테마 시스템 사용)
const getFunctionColor = (functionName: string): string => {
  const baseColors = callstackLibraryThemeConfig.specialColors
  
  // 함수명에 따른 색상 분류
  if (functionName.includes('<global>')) {
    return `rgb(${baseColors['function-global']})`
  }
  if (functionName.includes('main')) {
    return `rgb(${baseColors['function-main']})`
  }
  if (functionName.includes('processUser') || functionName.includes('calculate') || 
      functionName.includes('factorial') || functionName.includes('checkNumbers') || 
      functionName.includes('dangerousRecursion')) {
    return `rgb(${baseColors['function-primary']})`
  }
  if (functionName.includes('greet') || functionName.includes('multiply') || 
      functionName.includes('isEven')) {
    return `rgb(${baseColors['function-secondary']})`
  }
  
  // 기본값은 primary 색상
  return `rgb(${baseColors['function-primary']})`
}

export const advancedLevels: CallStackLevel[] = [
  {
    id: 'advanced-1',
    title: '단계별 스냅샷 분석',
    description: '코드 실행의 각 단계에서 콜스택 상태를 정확히 구성해보세요.',
    explanation: '디버깅의 핵심은 각 실행 시점의 스택 상태를 이해하는 것입니다.',
    difficulty: 'advanced',
    stageNumber: 17,
    layoutType: 'E' as const,
    code: `function greet(name) {
  console.log("안녕하세요, " + name);
  return name + "님 환영합니다";
}

function processUser() {
  const result = greet("김철수");
  console.log(result);
}

processUser();`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 11 },
      { step: 1, description: "processUser 호출", currentLine: 11 },
      { step: 2, description: "greet 함수 호출", currentLine: 7 },
      { step: 3, description: "console.log 실행", currentLine: 2 },
      { step: 4, description: "return 실행", currentLine: 3 },
      { step: 5, description: "greet 종료, processUser로 복귀", currentLine: 7 },
      { step: 6, description: "console.log 실행", currentLine: 8 },
      { step: 7, description: "processUser 종료", currentLine: 11 }
    ],
    breakpoints: [2, 3, 7, 8],
    snapshotCheckpoints: [2, 3, 4, 6], // 각 브레이크포인트에 해당하는 실행 단계들
    expectedSnapshots: {
      2: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'process-1', functionName: 'processUser', color: getFunctionColor('primary'), height: 40 }
      ], // Step 2: greet 호출 직전 (라인 7) - greet은 아직 스택에 없음
      3: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'process-1', functionName: 'processUser', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'greet-1', functionName: 'greet', color: getFunctionColor('secondary'), height: 40 }
      ], // Step 3: greet 내부 console.log 실행 (라인 2)
      4: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'process-1', functionName: 'processUser', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'greet-1', functionName: 'greet', color: getFunctionColor('secondary'), height: 40 }
      ], // Step 4: greet의 return 실행 (라인 3) - 아직 스택에 있음
      6: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'process-1', functionName: 'processUser', color: getFunctionColor('primary'), height: 40 }
      ] // Step 6: processUser의 console.log 실행 (라인 8) - greet은 이미 종료됨
    },
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'processUser',
            calls: [
              {
                name: 'greet',
                calls: [
                  { name: 'console.log', params: ['안녕하세요, 김철수'] }
                ],
                returns: '김철수님 환영합니다'
              },
              { name: 'console.log', params: ['김철수님 환영합니다'] }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'processUser', 'greet', 'console.log', 'console.log'],
    simulationSteps: ['<global>', 'processUser', 'greet', 'console.log', 'console.log-return', 'greet-return', 'console.log', 'console.log-return', 'processUser-return', '<global>-return'],
    maxStackSize: 3,
    hints: [
      '각 체크포인트에서 스택의 정확한 상태를 확인하세요.',
      '함수 호출과 종료 시점을 주의깊게 관찰하세요.',
      '전역 실행 컨텍스트는 항상 스택의 맨 아래에 있습니다.'
    ],
    concepts: ['스택 스냅샷', '실행 추적', '디버깅 기법']
  },
  {
    id: 'advanced-2',
    title: '중첩 함수 호출 분석',
    description: '중첩된 함수 호출에서 각 실행 단계의 스택 상태를 구성해보세요.',
    explanation: '복잡한 호출 구조에서 스택의 변화를 정확히 추적하는 것이 중요합니다.',
    difficulty: 'advanced',
    stageNumber: 18,
    layoutType: 'E' as const,
    code: `function calculate(x) {
  return multiply(x, 2);
}

function multiply(a, b) {
  return add(a * b, 1);
}

function add(x, y) {
  console.log("계산 중:", x, "+", y);
  return x + y;
}

const result = calculate(5);
console.log("결과:", result);`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 13 },
      { step: 1, description: "calculate 호출", currentLine: 13 },
      { step: 2, description: "multiply 호출", currentLine: 2 },
      { step: 3, description: "add 호출", currentLine: 6 },
      { step: 4, description: "console.log 실행", currentLine: 10 },
      { step: 5, description: "add return", currentLine: 11 },
      { step: 6, description: "multiply return", currentLine: 6 },
      { step: 7, description: "calculate return", currentLine: 2 },
      { step: 8, description: "최종 console.log", currentLine: 14 }
    ],
    breakpoints: [2, 6, 10, 11],
    snapshotCheckpoints: [2, 3, 4, 5], // breakpoints 라인에서 실행되는 단계들
    expectedSnapshots: {
      2: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'calc-1', functionName: 'calculate', color: getFunctionColor('primary'), height: 40 }
      ], // Step 2: multiply 호출 (라인 2)
      3: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'calc-1', functionName: 'calculate', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'mult-1', functionName: 'multiply', color: getFunctionColor('secondary'), height: 40 }
      ], // Step 3: add 호출 (라인 6)
      4: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'calc-1', functionName: 'calculate', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'mult-1', functionName: 'multiply', color: getFunctionColor('secondary'), height: 40 }, 
        { id: 'add-1', functionName: 'add', color: 'rgb(126, 34, 206)', height: 40 }
      ], // Step 4: console.log 실행 (라인 10)
      5: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'calc-1', functionName: 'calculate', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'mult-1', functionName: 'multiply', color: getFunctionColor('secondary'), height: 40 }, 
        { id: 'add-1', functionName: 'add', color: 'rgb(126, 34, 206)', height: 40 }
      ] // Step 5: add return (라인 11) - return 실행 중이므로 add는 아직 스택에 있음
    },
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'calculate',
            calls: [
              {
                name: 'multiply',
                calls: [
                  {
                    name: 'add',
                    calls: [
                      { name: 'console.log', params: ['계산 중:', 10, '+', 1] }
                    ],
                    returns: 11
                  }
                ],
                returns: 11
              }
            ],
            returns: 11
          },
          { name: 'console.log', params: ['결과:', 11] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'calculate', 'multiply', 'add', 'console.log', 'console.log'],
    simulationSteps: ['<global>', 'calculate', 'multiply', 'add', 'console.log', 'console.log-return', 'add-return', 'multiply-return', 'calculate-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 4,
    hints: [
      '중첩된 함수 호출에서 스택이 어떻게 쌓이는지 관찰하세요.',
      '함수가 종료될 때 스택에서 제거되는 순서를 확인하세요.',
      '가장 깊은 호출부터 차례로 반환됩니다.'
    ],
    concepts: ['중첩 호출', '스택 깊이', '함수 반환 순서']
  },
  {
    id: 'advanced-3',
    title: '재귀 함수 실행 추적',
    description: '재귀 함수의 호출과 반환 과정에서 스택 변화를 분석해보세요.',
    explanation: '재귀 함수는 스택에 여러 호출이 쌓이고 역순으로 반환됩니다.',
    difficulty: 'advanced',
    stageNumber: 19,
    layoutType: 'E' as const,
    code: `function factorial(n) {
  console.log("호출: factorial(" + n + ")");
  
  if (n <= 1) {
    console.log("기저 조건: " + n);
    return 1;
  }
  
  const result = n * factorial(n - 1);
  console.log("반환: " + n + " * factorial(" + (n-1) + ") = " + result);
  return result;
}

console.log("팩토리얼 시작");
const answer = factorial(3);
console.log("최종 결과:", answer);`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 13 },
      { step: 1, description: "console.log 실행", currentLine: 13 },
      { step: 2, description: "factorial(3) 호출", currentLine: 14 },
      { step: 3, description: "factorial(3) 내부 시작", currentLine: 2 },
      { step: 4, description: "factorial(2) 호출 직전", currentLine: 9 },
      { step: 5, description: "factorial(2) 내부 시작", currentLine: 2 },
      { step: 6, description: "factorial(1) 호출 직전", currentLine: 9 },
      { step: 7, description: "factorial(1) 내부 시작", currentLine: 2 },
      { step: 8, description: "기저 조건 도달", currentLine: 5 },
      { step: 9, description: "factorial(1) return 실행", currentLine: 6 },
      { step: 10, description: "factorial(2)로 복귀, 계산 및 로그", currentLine: 10 },
      { step: 11, description: "factorial(2) return 실행", currentLine: 11 },
      { step: 12, description: "factorial(3)로 복귀, 계산 및 로그", currentLine: 10 },
      { step: 13, description: "factorial(3) return 실행", currentLine: 11 },
      { step: 14, description: "최종 console.log", currentLine: 15 }
    ],
    breakpoints: [2, 5, 6, 9, 10, 11],
    snapshotCheckpoints: [4, 8, 9, 10], // 실제 체크포인트에 해당하는 단계들
    expectedSnapshots: {
      4: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'fact-3', functionName: 'factorial(3)', color: getFunctionColor('primary'), height: 40 }
      ], // Step 4: factorial(2) 호출 직전 (라인 9) - factorial(2)는 아직 스택에 없음
      8: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'fact-3', functionName: 'factorial(3)', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'fact-2', functionName: 'factorial(2)', color: getFunctionColor('secondary'), height: 40 }, 
        { id: 'fact-1', functionName: 'factorial(1)', color: 'rgb(126, 34, 206)', height: 40 }
      ], // Step 8: 기저 조건 (라인 5)
      9: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'fact-3', functionName: 'factorial(3)', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'fact-2', functionName: 'factorial(2)', color: getFunctionColor('secondary'), height: 40 }, 
        { id: 'fact-1', functionName: 'factorial(1)', color: 'rgb(126, 34, 206)', height: 40 }
      ], // Step 9: factorial(1) return 실행 (라인 6) - return 실행 중이므로 아직 스택에 있음
      10: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'fact-3', functionName: 'factorial(3)', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'fact-2', functionName: 'factorial(2)', color: getFunctionColor('secondary'), height: 40 }
      ] // Step 10: factorial(2)로 복귀 (라인 10) - factorial(1)은 종료됨
    },
    functionCalls: [
      {
        name: '<global>',
        calls: [
          { name: 'console.log', params: ['팩토리얼 시작'] },
          {
            name: 'factorial(3)',
            calls: [
              { name: 'console.log', params: ['호출: factorial(3)'] },
              {
                name: 'factorial(2)',
                calls: [
                  { name: 'console.log', params: ['호출: factorial(2)'] },
                  {
                    name: 'factorial(1)',
                    calls: [
                      { name: 'console.log', params: ['호출: factorial(1)'] },
                      { name: 'console.log', params: ['기저 조건: 1'] }
                    ],
                    returns: 1
                  },
                  { name: 'console.log', params: ['반환: 2 * factorial(1) = 2'] }
                ],
                returns: 2
              },
              { name: 'console.log', params: ['반환: 3 * factorial(2) = 6'] }
            ],
            returns: 6
          },
          { name: 'console.log', params: ['최종 결과:', 6] }
        ]
      }
    ],
    expectedOrder: ['<global>', 'console.log', 'factorial(3)', 'console.log', 'factorial(2)', 'console.log', 'factorial(1)', 'console.log', 'console.log', 'console.log', 'console.log', 'console.log'],
    simulationSteps: ['<global>', 'console.log', 'console.log-return', 'factorial(3)', 'console.log', 'console.log-return', 'factorial(2)', 'console.log', 'console.log-return', 'factorial(1)', 'console.log', 'console.log-return', 'console.log', 'console.log-return', 'factorial(1)-return', 'console.log', 'console.log-return', 'factorial(2)-return', 'console.log', 'console.log-return', 'factorial(3)-return', 'console.log', 'console.log-return', '<global>-return'],
    maxStackSize: 4,
    hints: [
      '재귀 호출에서 각 호출이 스택에 쌓입니다.',
      '기저 조건에 도달하면 역순으로 반환됩니다.',
      '스택의 깊이는 재귀 호출의 깊이와 같습니다.'
    ],
    concepts: ['재귀 함수', '스택 깊이', 'LIFO 순서']
  },
  {
    id: 'advanced-4',
    title: '복합 실행 흐름 분석',
    description: '조건문과 반복문이 포함된 복잡한 실행 흐름을 추적해보세요.',
    explanation: '복잡한 제어 구조에서도 정확한 스택 상태를 파악할 수 있어야 합니다.',
    difficulty: 'advanced',
    stageNumber: 20,
    layoutType: 'E' as const,
    code: `function checkNumbers(arr) {
  console.log("배열 검사 시작");
  
  for (let i = 0; i < arr.length; i++) {
    if (isEven(arr[i])) {
      console.log(arr[i] + "는 짝수");
      processEven(arr[i]);
    } else {
      console.log(arr[i] + "는 홀수");
    }
  }
  
  console.log("검사 완료");
}

function isEven(num) {
  return num % 2 === 0;
}

function processEven(num) {
  console.log("짝수 처리: " + num);
}

checkNumbers([1, 2, 3]);`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 23 },
      { step: 1, description: "checkNumbers 호출", currentLine: 23 },
      { step: 2, description: "첫 번째 요소 확인 (1)", currentLine: 5 },
      { step: 3, description: "isEven(1) 호출", currentLine: 5 },
      { step: 4, description: "홀수 출력", currentLine: 9 },
      { step: 5, description: "두 번째 요소 확인 (2)", currentLine: 5 },
      { step: 6, description: "isEven(2) 호출", currentLine: 5 },
      { step: 7, description: "processEven(2) 호출", currentLine: 7 },
      { step: 8, description: "세 번째 요소 확인 (3)", currentLine: 5 },
      { step: 9, description: "검사 완료", currentLine: 13 }
    ],
    breakpoints: [2, 5, 6, 7, 13],
    snapshotCheckpoints: [2, 3, 6, 7, 9], // breakpoints 라인에서 실행되는 단계들
    expectedSnapshots: {
      2: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'check-1', functionName: 'checkNumbers', color: getFunctionColor('primary'), height: 40 }
      ], // Step 2: 첫 번째 요소 확인 (라인 5)
      3: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'check-1', functionName: 'checkNumbers', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'even-1', functionName: 'isEven', color: getFunctionColor('secondary'), height: 40 }
      ], // Step 3: isEven(1) 호출 (라인 5)
      6: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'check-1', functionName: 'checkNumbers', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'even-2', functionName: 'isEven', color: getFunctionColor('secondary'), height: 40 }
      ], // Step 6: isEven(2) 호출 (라인 5)
      7: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'check-1', functionName: 'checkNumbers', color: getFunctionColor('primary'), height: 40 }, 
        { id: 'process-1', functionName: 'processEven', color: 'rgb(126, 34, 206)', height: 40 }
      ], // Step 7: processEven(2) 호출 (라인 7)
      9: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 }, 
        { id: 'check-1', functionName: 'checkNumbers', color: getFunctionColor('primary'), height: 40 }
      ] // Step 9: 검사 완료 (라인 13) - checkNumbers는 아직 실행 중
    },
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'checkNumbers',
            calls: [
              { name: 'console.log', params: ['배열 검사 시작'] },
              { name: 'isEven', params: [1], returns: false },
              { name: 'console.log', params: ['1는 홀수'] },
              { name: 'isEven', params: [2], returns: true },
              { name: 'console.log', params: ['2는 짝수'] },
              {
                name: 'processEven',
                calls: [
                  { name: 'console.log', params: ['짝수 처리: 2'] }
                ]
              },
              { name: 'isEven', params: [3], returns: false },
              { name: 'console.log', params: ['3는 홀수'] },
              { name: 'console.log', params: ['검사 완료'] }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'checkNumbers', 'console.log', 'isEven', 'console.log', 'isEven', 'console.log', 'processEven', 'console.log', 'isEven', 'console.log', 'console.log'],
    simulationSteps: ['<global>', 'checkNumbers', 'console.log', 'console.log-return', 'isEven', 'isEven-return', 'console.log', 'console.log-return', 'isEven', 'isEven-return', 'console.log', 'console.log-return', 'processEven', 'console.log', 'console.log-return', 'processEven-return', 'isEven', 'isEven-return', 'console.log', 'console.log-return', 'console.log', 'console.log-return', 'checkNumbers-return', '<global>-return'],
    maxStackSize: 3,
    hints: [
      '반복문에서 함수가 여러 번 호출됩니다.',
      '조건문에 따라 다른 함수가 호출될 수 있습니다.',
      '각 함수 호출마다 스택에 추가되고 제거됩니다.'
    ],
    concepts: ['제어 구조', '조건부 실행', '반복 호출']
  },
  {
    id: 'advanced-5',
    title: '스택 오버플로우 디버깅',
    description: '스택 오버플로우가 발생하는 상황을 분석해보세요.',
    explanation: '무한 재귀는 스택 오버플로우를 일으킵니다.',
    difficulty: 'advanced',
    stageNumber: 21,
    layoutType: 'E' as const,
    code: `let depth = 0;
const maxDepth = 10;

function dangerousRecursion(n) {
  depth++;
  
  if (depth > maxDepth) {
    console.log("스택 오버플로우 위험!");
    return;
  }
  
  console.log(\`깊이: \${depth}\`);
  
  if (n > 0) {
    dangerousRecursion(n - 1);
    dangerousRecursion(n - 1); // 지수적 증가!
  }
  
  depth--;
}

dangerousRecursion(3);`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 22 },
      { step: 1, description: "dangerousRecursion(3) 호출", currentLine: 22 },
      { step: 2, description: "깊이 1 도달", currentLine: 12 },
      { step: 3, description: "첫 번째 재귀 호출 dangerousRecursion(2)", currentLine: 15 },
      { step: 4, description: "깊이 2 도달", currentLine: 12 },
      { step: 5, description: "dangerousRecursion(1) 첫 번째 호출", currentLine: 15 },
      { step: 6, description: "깊이 3 도달 (dangerousRecursion(1))", currentLine: 12 },
      { step: 7, description: "dangerousRecursion(0) 첫 번째 호출", currentLine: 15 },
      { step: 8, description: "깊이 4 도달 (dangerousRecursion(0))", currentLine: 12 },
      { step: 9, description: "dangerousRecursion(0) 두 번째 호출", currentLine: 15 },
      { step: 10, description: "깊이 5 도달", currentLine: 12 },
      { step: 11, description: "dangerousRecursion(1) 복귀", currentLine: 15 },
      { step: 12, description: "dangerousRecursion(1) 두 번째 호출", currentLine: 15 },
      { step: 13, description: "깊이 3 재도달", currentLine: 12 },
      { step: 14, description: "dangerousRecursion(0) 세 번째 호출", currentLine: 15 },
      { step: 15, description: "깊이 4 재도달", currentLine: 12 },
      { step: 16, description: "dangerousRecursion(0) 네 번째 호출", currentLine: 15 },
      { step: 17, description: "깊이 5 재도달", currentLine: 12 },
      { step: 18, description: "dangerousRecursion(2) 두 번째 호출", currentLine: 15 },
      { step: 19, description: "스택 오버플로우 위험 감지", currentLine: 8 },
      { step: 20, description: "재귀 종료 및 정리", currentLine: 22 }
    ],
    breakpoints: [5, 8, 12, 15],
    snapshotCheckpoints: [4, 8, 12, 16, 19],
    expectedSnapshots: {
      4: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 },
        { id: 'danger-3', functionName: 'dangerousRecursion(3)', color: getFunctionColor('primary'), height: 40 },
        { id: 'danger-2-1', functionName: 'dangerousRecursion(2)', color: getFunctionColor('secondary'), height: 40 }
      ],
      8: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 },
        { id: 'danger-3', functionName: 'dangerousRecursion(3)', color: getFunctionColor('primary'), height: 40 },
        { id: 'danger-2-1', functionName: 'dangerousRecursion(2)', color: getFunctionColor('secondary'), height: 40 },
        { id: 'danger-1-1', functionName: 'dangerousRecursion(1)', color: 'rgb(126, 34, 206)', height: 40 },
        { id: 'danger-0-1', functionName: 'dangerousRecursion(0)', color: 'rgb(185, 28, 28)', height: 40 }
      ],
      12: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 },
        { id: 'danger-3', functionName: 'dangerousRecursion(3)', color: getFunctionColor('primary'), height: 40 },
        { id: 'danger-2-1', functionName: 'dangerousRecursion(2)', color: getFunctionColor('secondary'), height: 40 },
        { id: 'danger-1-2', functionName: 'dangerousRecursion(1)', color: 'rgb(126, 34, 206)', height: 40 }
      ],
      16: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 },
        { id: 'danger-3', functionName: 'dangerousRecursion(3)', color: getFunctionColor('primary'), height: 40 },
        { id: 'danger-2-1', functionName: 'dangerousRecursion(2)', color: getFunctionColor('secondary'), height: 40 },
        { id: 'danger-1-2', functionName: 'dangerousRecursion(1)', color: 'rgb(126, 34, 206)', height: 40 },
        { id: 'danger-0-3', functionName: 'dangerousRecursion(0)', color: 'rgb(185, 28, 28)', height: 40 }
      ],
      19: [
        { id: 'global-1', functionName: '<global>', isGlobalContext: true, color: getFunctionColor('<global>'), height: 40 },
        { id: 'danger-3', functionName: 'dangerousRecursion(3)', color: getFunctionColor('primary'), height: 40 },
        { id: 'danger-2-2', functionName: 'dangerousRecursion(2)', color: getFunctionColor('secondary'), height: 40 }
      ]
    },
    functionCalls: [
      {
        name: '<global>',
        calls: [
          {
            name: 'dangerousRecursion(3)',
            calls: [
              { name: 'console.log', params: ['깊이: 1'] },
              {
                name: 'dangerousRecursion(2)',
                calls: [
                  { name: 'console.log', params: ['깊이: 2'] },
                  {
                    name: 'dangerousRecursion(1)',
                    calls: [
                      { name: 'console.log', params: ['깊이: 3'] },
                      { name: 'dangerousRecursion(0)' },
                      { name: 'dangerousRecursion(0)' }
                    ]
                  },
                  {
                    name: 'dangerousRecursion(1)',
                    calls: [
                      { name: 'console.log', params: ['깊이: 3'] },
                      { name: 'dangerousRecursion(0)' },
                      { name: 'dangerousRecursion(0)' }
                    ]
                  }
                ]
              },
              {
                name: 'dangerousRecursion(2)',
                calls: [
                  { name: 'console.log', params: ['스택 오버플로우 위험!'] }
                ]
              }
            ]
          }
        ]
      }
    ],
    expectedOrder: ['<global>', 'dangerousRecursion(3)', 'console.log', 'dangerousRecursion(2)', 'console.log', 'dangerousRecursion(1)', 'console.log', 'dangerousRecursion(0)', 'dangerousRecursion(0)', 'dangerousRecursion(1)', 'console.log', 'dangerousRecursion(0)', 'dangerousRecursion(0)', 'dangerousRecursion(2)', 'console.log'],
    simulationSteps: ['<global>', 'dangerousRecursion(3)', 'console.log', 'console.log-return', 'dangerousRecursion(2)', 'console.log', 'console.log-return', 'dangerousRecursion(1)', 'console.log', 'console.log-return', 'dangerousRecursion(0)', 'dangerousRecursion(0)-return', 'dangerousRecursion(0)', 'dangerousRecursion(0)-return', 'dangerousRecursion(1)-return', 'dangerousRecursion(1)', 'console.log', 'console.log-return', 'dangerousRecursion(0)', 'dangerousRecursion(0)-return', 'dangerousRecursion(0)', 'dangerousRecursion(0)-return', 'dangerousRecursion(1)-return', 'dangerousRecursion(2)-return', 'dangerousRecursion(2)', 'console.log', 'console.log-return', 'dangerousRecursion(2)-return', 'dangerousRecursion(3)-return', '<global>-return'],
    maxStackSize: 10,
    hints: [
      '각 재귀 호출이 두 번씩 분기합니다.',
      '깊이가 지수적으로 증가합니다.',
      '안전장치가 없으면 스택 오버플로우가 발생합니다.'
    ],
    concepts: ['스택 오버플로우', '지수적 증가', '재귀 제한']
  },
  {
    id: 'advanced-6',
    title: '복합 큐 시스템 통합',
    description: '여러 종류의 큐가 함께 작동하는 복잡한 시스템을 이해해보세요.',
    explanation: '실제 시스템에서는 다양한 큐들이 협력하여 효율적인 작업 처리를 제공합니다.',
    difficulty: 'advanced',
    stageNumber: 22,
    layoutType: 'B' as const,
    queueTypes: ['callstack', 'microtask', 'macrotask', 'priority', 'animation'],
    code: `console.log("1: 동기 시작");

// 높은 우선순위 작업
queueMicrotask(() => {
  console.log("2: 마이크로태스크");
});

// 일반 타이머
setTimeout(() => {
  console.log("4: 매크로태스크");
}, 0);

// 애니메이션 프레임
requestAnimationFrame(() => {
  console.log("3: 애니메이션 프레임");
});

// 또 다른 마이크로태스크
Promise.resolve().then(() => {
  console.log("2.5: Promise 마이크로태스크");
});

console.log("1.5: 동기 끝");`,
    functionCalls: [
      {
        name: '<global>',
        queueType: 'callstack',
        calls: [
          { name: 'console.log', params: ['1: 동기 시작'], queueType: 'callstack' },
          { name: 'queueMicrotask', queueType: 'microtask' },
          { name: 'setTimeout', queueType: 'macrotask' },
          { name: 'requestAnimationFrame', queueType: 'animation' },
          { name: 'Promise.resolve().then', queueType: 'microtask' },
          { name: 'console.log', params: ['1.5: 동기 끝'], queueType: 'callstack' }
        ]
      },
      {
        name: 'microtask-1',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['2: 마이크로태스크'], queueType: 'microtask' }
        ]
      },
      {
        name: 'microtask-2',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['2.5: Promise 마이크로태스크'], queueType: 'microtask' }
        ]
      },
      {
        name: 'animation-frame',
        queueType: 'animation',
        calls: [
          { name: 'console.log', params: ['3: 애니메이션 프레임'], queueType: 'animation' }
        ]
      },
      {
        name: 'macrotask-timer',
        queueType: 'macrotask',
        calls: [
          { name: 'console.log', params: ['4: 매크로태스크'], queueType: 'macrotask' }
        ]
      }
    ],
    expectedOrder: ['<global>', 'console.log', 'queueMicrotask', 'setTimeout', 'requestAnimationFrame', 'Promise.resolve().then', 'console.log', 'microtask-1', 'console.log', 'microtask-2', 'console.log', 'animation-frame', 'console.log', 'macrotask-timer', 'console.log'],
    simulationSteps: ['<global>', 'console.log', 'console.log-return', 'queueMicrotask', 'queueMicrotask-return', 'setTimeout', 'setTimeout-return', 'requestAnimationFrame', 'requestAnimationFrame-return', 'Promise.resolve().then', 'Promise.resolve().then-return', 'console.log', 'console.log-return', '<global>-return', 'microtask-1', 'console.log', 'console.log-return', 'microtask-1-return', 'microtask-2', 'console.log', 'console.log-return', 'microtask-2-return', 'animation-frame', 'console.log', 'console.log-return', 'animation-frame-return', 'macrotask-timer', 'console.log', 'console.log-return', 'macrotask-timer-return'],
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 1 },
      { step: 1, description: "console.log('1: 동기 시작') 실행", currentLine: 1 },
      { step: 2, description: "queueMicrotask 등록", currentLine: 3 },
      { step: 3, description: "setTimeout 등록", currentLine: 7 },
      { step: 4, description: "requestAnimationFrame 등록", currentLine: 11 },
      { step: 5, description: "Promise.resolve().then 등록", currentLine: 15 },
      { step: 6, description: "console.log('1.5: 동기 끝') 실행", currentLine: 19 },
      { step: 7, description: "동기 코드 완료, 이벤트 루프 시작", currentLine: 19 },
      { step: 8, description: "마이크로태스크 1 실행", currentLine: 4 },
      { step: 9, description: "마이크로태스크 2 실행", currentLine: 16 },
      { step: 10, description: "애니메이션 프레임 실행", currentLine: 12 },
      { step: 11, description: "매크로태스크 실행", currentLine: 8 }
    ],
    maxStackSize: 4,
    hints: [
      '동기 코드가 가장 먼저 실행됩니다.',
      '마이크로태스크들이 모두 처리된 후 다른 큐를 확인합니다.',
      '애니메이션 프레임이 매크로태스크보다 우선순위가 높습니다.',
      '모든 출력의 순서를 주의깊게 관찰하세요.'
    ],
    concepts: ['큐 우선순위', '이벤트 루프', '복합 시스템', '실행 순서 예측', '브라우저 스케줄링'],
    eventLoopSteps: [
      {
        stepNumber: 0,
        description: "초기 상태 - 프로그램 시작",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: []
        },
        afterState: {
          callstack: ['<global>'],
          microtask: [],
          macrotask: []
        }
      },
      {
        stepNumber: 1,
        description: "비동기 작업 등록",
        beforeState: {
          callstack: ['<global>'],
          microtask: [],
          macrotask: []
        },
        afterState: {
          callstack: [],
          microtask: ['then-callback'],
          macrotask: ['timer-callback']
        }
      },
      {
        stepNumber: 2,
        description: "마이크로태스크 처리",
        beforeState: {
          callstack: [],
          microtask: ['then-callback'],
          macrotask: ['timer-callback']
        },
        afterState: {
          callstack: [],
          microtask: ['microtask-callback'],
          macrotask: ['timer-callback']
        }
      },
      {
        stepNumber: 3,
        description: "매크로태스크 처리",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback']
        },
        afterState: {
          callstack: [],
          microtask: [],
          macrotask: []
        }
      }
    ]
  },
  {
    id: 'advanced-7',
    title: '고급 이벤트 루프 패턴',
    description: '복잡한 비동기 패턴에서 이벤트 루프의 동작을 분석해보세요.',
    explanation: '실제 애플리케이션에서 사용되는 고급 비동기 패턴을 이해해보세요.',
    difficulty: 'advanced',
    stageNumber: 23,
    layoutType: 'C' as const,
    queueTypes: ['callstack', 'microtask', 'macrotask', 'animation'],
    code: `async function fetchData() {
  console.log("1: 비동기 함수 시작");
  
  const promise = new Promise(resolve => {
    setTimeout(() => {
      console.log("3: 타이머 콜백");
      resolve("데이터");
    }, 0);
  });
  
  console.log("2: Promise 생성 완료");
  
  const result = await promise;
  console.log("4: 결과 받음", result);
  
  return result;
}

console.log("0: 프로그램 시작");
fetchData().then(data => {
  console.log("5: 최종 처리", data);
});
console.log("1.5: 동기 코드 완료");`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 1 },
      { step: 1, description: "console.log('0: 프로그램 시작') 실행", currentLine: 1 },
      { step: 2, description: "fetchData() 호출", currentLine: 2 },
      { step: 3, description: "console.log('1: 비동기 함수 시작') 실행", currentLine: 3 },
      { step: 4, description: "Promise 생성자 실행", currentLine: 4 },
      { step: 5, description: "setTimeout 등록", currentLine: 5 },
      { step: 6, description: "console.log('2: Promise 생성 완료') 실행", currentLine: 11 },
      { step: 7, description: "await 일시정지", currentLine: 13 },
      { step: 8, description: "console.log('1.5: 동기 코드 완료') 실행", currentLine: 21 },
      { step: 9, description: "타이머 콜백 실행", currentLine: 6 },
      { step: 10, description: "Promise resolve", currentLine: 7 },
      { step: 11, description: "await 재개", currentLine: 13 },
      { step: 12, description: "console.log('4: 결과 받음') 실행", currentLine: 14 }
    ],
    simulationSteps: ['<global>', 'console.log', 'console.log-return', 'fetchData', 'console.log', 'console.log-return', 'Promise', 'setTimeout', 'setTimeout-return', 'Promise-return', 'console.log', 'console.log-return', 'fetchData-suspend', 'console.log', 'console.log-return', '<global>-return', 'timer-callback', 'console.log', 'console.log-return', 'promise-resolve', 'fetchData-resume', 'console.log', 'console.log-return', 'fetchData-return', 'then-callback', 'console.log', 'console.log-return', 'then-callback-return'],
    maxStackSize: 4,
    hints: [
      'async/await는 Promise의 문법적 설탕입니다.',
      'await는 현재 함수를 일시정지시킵니다.',
      'Promise가 resolve되면 마이크로태스크 큐에 추가됩니다.'
    ],
    concepts: ['async/await', 'Promise', '이벤트 루프', '함수 일시정지/재개'],
    functionCalls: [
      {
        name: '<global>',
        queueType: 'callstack',
        calls: [
          { name: 'console.log', params: ['0: 프로그램 시작'], queueType: 'callstack' },
          { name: 'fetchData', queueType: 'callstack' },
          { name: 'console.log', params: ['1.5: 동기 코드 완료'], queueType: 'callstack' }
        ]
      },
      {
        name: 'fetchData',
        queueType: 'callstack',
        calls: [
          { name: 'console.log', params: ['1: 비동기 함수 시작'], queueType: 'callstack' },
          { name: 'Promise', queueType: 'callstack' },
          { name: 'console.log', params: ['2: Promise 생성 완료'], queueType: 'callstack' },
          { name: 'await', queueType: 'callstack' }
        ]
      },
      {
        name: 'timer-callback',
        queueType: 'macrotask',
        calls: [
          { name: 'console.log', params: ['3: 타이머 콜백'], queueType: 'macrotask' },
          { name: 'resolve', queueType: 'macrotask' }
        ]
      },
      {
        name: 'fetchData-resume',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['4: 결과 받음'], queueType: 'microtask' }
        ]
      },
      {
        name: 'then-callback',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['5: 최종 처리'], queueType: 'microtask' }
        ]
      }
    ],
    expectedOrder: ['<global>', 'console.log', 'fetchData', 'console.log', 'Promise', 'console.log', 'await', 'console.log', 'timer-callback', 'console.log', 'resolve', 'fetchData-resume', 'console.log', 'then-callback', 'console.log'],
    eventLoopSteps: [
      {
        stepNumber: 0,
        description: "초기 상태 - async/await 시작",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: [],
          animation: []
        },
        afterState: {
          callstack: ['<global>', 'fetchData'],
          microtask: [],
          macrotask: [],
          animation: []
        }
      },
      {
        stepNumber: 1,
        description: "Promise 생성 및 타이머 등록",
        beforeState: {
          callstack: ['<global>', 'fetchData'],
          microtask: [],
          macrotask: [],
          animation: []
        },
        afterState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: []
        }
      },
      {
        stepNumber: 2,
        description: "타이머 콜백 실행 및 resolve",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: []
        },
        afterState: {
          callstack: [],
          microtask: ['fetchData-resume'],
          macrotask: [],
          animation: []
        }
      },
      {
        stepNumber: 3,
        description: "async 함수 재개 및 then 처리",
        beforeState: {
          callstack: [],
          microtask: ['fetchData-resume'],
          macrotask: [],
          animation: []
        },
        afterState: {
          callstack: [],
          microtask: ['then-callback'],
          macrotask: [],
          animation: []
        }
      }
    ]
  },
  {
    id: 'advanced-8',
    title: '마스터 레벨: 복합 스케줄링',
    description: '모든 큐 타입이 함께 작동하는 최고 난이도 시나리오입니다.',
    explanation: '실제 브라우저 환경에서 일어나는 복잡한 스케줄링을 완벽히 이해해보세요.',
    difficulty: 'advanced',
    stageNumber: 24,
    layoutType: 'D' as const,
    queueTypes: ['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker'],
    code: `console.log("1: 시작");

// 즉시 실행
queueMicrotask(() => {
  console.log("3: 마이크로태스크 1");
  queueMicrotask(() => {
    console.log("5: 중첩 마이크로태스크");
  });
});

// 타이머
setTimeout(() => {
  console.log("7: 매크로태스크");
  queueMicrotask(() => {
    console.log("8: 매크로태스크 내 마이크로태스크");
  });
}, 0);

// 애니메이션
requestAnimationFrame(() => {
  console.log("6: 애니메이션 프레임");
});

// 추가 마이크로태스크
Promise.resolve().then(() => {
  console.log("4: Promise 마이크로태스크");
});

console.log("2: 동기 완료");`,
    executionSteps: [
      { step: 0, description: "프로그램 시작", currentLine: 1 },
      { step: 1, description: "console.log('1: 시작') 실행", currentLine: 1 },
      { step: 2, description: "queueMicrotask 등록", currentLine: 3 },
      { step: 3, description: "setTimeout 등록", currentLine: 10 },
      { step: 4, description: "requestAnimationFrame 등록", currentLine: 18 },
      { step: 5, description: "Promise.resolve().then 등록", currentLine: 23 },
      { step: 6, description: "console.log('2: 동기 완료') 실행", currentLine: 27 },
      { step: 7, description: "마이크로태스크 1 실행", currentLine: 4 },
      { step: 8, description: "중첩 마이크로태스크 등록", currentLine: 5 },
      { step: 9, description: "Promise 마이크로태스크 실행", currentLine: 24 },
      { step: 10, description: "중첩 마이크로태스크 실행", currentLine: 6 },
      { step: 11, description: "애니메이션 프레임 실행", currentLine: 19 },
      { step: 12, description: "매크로태스크 실행", currentLine: 11 },
      { step: 13, description: "매크로태스크 내 마이크로태스크 실행", currentLine: 13 }
    ],
    simulationSteps: ['<global>', 'console.log', 'console.log-return', 'queueMicrotask', 'queueMicrotask-return', 'setTimeout', 'setTimeout-return', 'requestAnimationFrame', 'requestAnimationFrame-return', 'Promise.resolve().then', 'Promise.resolve().then-return', 'console.log', 'console.log-return', '<global>-return', 'microtask-1', 'console.log', 'console.log-return', 'queueMicrotask', 'queueMicrotask-return', 'microtask-1-return', 'microtask-2', 'console.log', 'console.log-return', 'microtask-2-return', 'microtask-3', 'console.log', 'console.log-return', 'microtask-3-return', 'animation-frame', 'console.log', 'console.log-return', 'animation-frame-return', 'macrotask-timer', 'console.log', 'console.log-return', 'queueMicrotask', 'queueMicrotask-return', 'macrotask-timer-return', 'microtask-4', 'console.log', 'console.log-return', 'microtask-4-return'],
    maxStackSize: 4,
    hints: [
      '마이크로태스크는 항상 다른 큐보다 우선순위가 높습니다.',
      '중첩된 마이크로태스크도 즉시 처리됩니다.',
      '매크로태스크 실행 후에도 마이크로태스크 큐를 확인합니다.',
      '모든 실행 순서를 정확히 예측해보세요.'
    ],
    concepts: ['복합 스케줄링', '큐 우선순위', '중첩 큐', '완전한 이벤트 루프', '마스터 레벨'],
    functionCalls: [
      {
        name: '<global>',
        queueType: 'callstack',
        calls: [
          { name: 'console.log', params: ['1: 시작'], queueType: 'callstack' },
          { name: 'queueMicrotask', queueType: 'microtask' },
          { name: 'setTimeout', queueType: 'macrotask' },
          { name: 'requestAnimationFrame', queueType: 'animation' },
          { name: 'Promise.resolve().then', queueType: 'microtask' },
          { name: 'console.log', params: ['2: 동기 완료'], queueType: 'callstack' }
        ]
      },
      {
        name: 'microtask-1',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['3: 마이크로태스크 1'], queueType: 'microtask' },
          { name: 'queueMicrotask', queueType: 'microtask' }
        ]
      },
      {
        name: 'microtask-2',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['4: Promise 마이크로태스크'], queueType: 'microtask' }
        ]
      },
      {
        name: 'microtask-3',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['5: 중첩 마이크로태스크'], queueType: 'microtask' }
        ]
      },
      {
        name: 'animation-frame',
        queueType: 'animation',
        calls: [
          { name: 'console.log', params: ['6: 애니메이션 프레임'], queueType: 'animation' }
        ]
      },
      {
        name: 'macrotask-timer',
        queueType: 'macrotask',
        calls: [
          { name: 'console.log', params: ['7: 매크로태스크'], queueType: 'macrotask' },
          { name: 'queueMicrotask', queueType: 'microtask' }
        ]
      },
      {
        name: 'microtask-4',
        queueType: 'microtask',
        calls: [
          { name: 'console.log', params: ['8: 매크로태스크 내 마이크로태스크'], queueType: 'microtask' }
        ]
      }
    ],
    expectedOrder: ['<global>', 'console.log', 'queueMicrotask', 'setTimeout', 'requestAnimationFrame', 'Promise.resolve().then', 'console.log', 'microtask-1', 'console.log', 'queueMicrotask', 'microtask-2', 'console.log', 'microtask-3', 'console.log', 'animation-frame', 'console.log', 'macrotask-timer', 'console.log', 'queueMicrotask', 'microtask-4', 'console.log'],
    eventLoopSteps: [
      {
        stepNumber: 0,
        description: "초기 상태 - 복합 스케줄링 시작",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: [],
          animation: [],
          io: [],
          worker: []
        },
        afterState: {
          callstack: ['<global>'],
          microtask: [],
          macrotask: [],
          animation: [],
          io: [],
          worker: []
        }
      },
      {
        stepNumber: 1,
        description: "모든 비동기 작업 등록",
        beforeState: {
          callstack: ['<global>'],
          microtask: [],
          macrotask: [],
          animation: [],
          io: [],
          worker: []
        },
        afterState: {
          callstack: [],
          microtask: ['microtask-1', 'Promise-then'],
          macrotask: ['timer-callback'],
          animation: ['animation-frame'],
          io: [],
          worker: []
        }
      },
      {
        stepNumber: 2,
        description: "마이크로태스크 처리 (중첩 포함)",
        beforeState: {
          callstack: [],
          microtask: ['microtask-1', 'Promise-then'],
          macrotask: ['timer-callback'],
          animation: ['animation-frame'],
          io: [],
          worker: []
        },
        afterState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: ['animation-frame'],
          io: [],
          worker: []
        }
      },
      {
        stepNumber: 3,
        description: "애니메이션 프레임 처리",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: ['animation-frame'],
          io: [],
          worker: []
        },
        afterState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: [],
          io: [],
          worker: []
        }
      },
      {
        stepNumber: 4,
        description: "매크로태스크 처리 및 새 마이크로태스크",
        beforeState: {
          callstack: [],
          microtask: [],
          macrotask: ['timer-callback'],
          animation: [],
          io: [],
          worker: []
        },
        afterState: {
          callstack: [],
          microtask: ['macrotask-microtask'],
          macrotask: [],
          animation: [],
          io: [],
          worker: []
        }
      }
    ]
  }
]