/**
 * executionSimulator 단위 테스트
 * 
 * CallStack 시뮬레이션의 핵심 로직을 검증합니다.
 */

import { describe, it, expect } from 'vitest';
import { 
  simulateExecution, 
  interpolateFromSnapshots, 
  getFunctionColor,
  generateStepMapping,
  SimulatorConfig 
} from '../executionSimulator';
import { CallStackLevel, StackItem } from '../../types';

describe('executionSimulator', () => {
  describe('getFunctionColor', () => {
    it('정적 매핑된 함수의 색상을 반환해야 한다', () => {
      expect(getFunctionColor('<global>')).toBe('rgb(107, 114, 128)');
      expect(getFunctionColor('console.log')).toBe('rgb(251, 146, 60)');
      expect(getFunctionColor('setTimeout')).toBe('rgb(239, 68, 68)');
      expect(getFunctionColor('Promise')).toBe('rgb(236, 72, 153)');
    });

    it('factorial(n) 형태의 함수 색상을 반환해야 한다', () => {
      expect(getFunctionColor('factorial(1)')).toBeTruthy();
      expect(getFunctionColor('factorial(2)')).toBeTruthy();
      expect(getFunctionColor('factorial(3)')).toBeTruthy();
      // 색상이 순환되어야 함
      const color1 = getFunctionColor('factorial(1)');
      const color7 = getFunctionColor('factorial(7)'); // 6개 색상 순환
      expect(color1).toBe(color7);
    });

    it('factorial() 패턴이지만 숫자가 없는 경우를 처리해야 한다', () => {
      const color = getFunctionColor('factorial()');
      expect(color).toBeTruthy();
      // 숫자가 없으면 0이 파싱되고 (0-1) % 6 = -1 % 6 = 5
      expect(color).toBe('rgb(14, 165, 233)');
    });

    it('factorial(abc) 같은 잘못된 형식을 처리해야 한다', () => {
      const color = getFunctionColor('factorial(abc)');
      expect(color).toBeTruthy();
      // 숫자가 없으면 0이 파싱되고 (0-1) % 6 = -1 % 6 = 5
      expect(color).toBe('rgb(14, 165, 233)');
    });

    it('매핑되지 않은 함수는 해시 기반 색상을 반환해야 한다', () => {
      const color1 = getFunctionColor('customFunction1');
      const color2 = getFunctionColor('customFunction2');
      const color3 = getFunctionColor('customFunction1'); // 동일 함수는 동일 색상
      
      expect(color1).toBeTruthy();
      expect(color2).toBeTruthy();
      expect(color1).toBe(color3);
    });
  });

  describe('simulateExecution', () => {
    const createTestLevel = (overrides?: Partial<CallStackLevel>): CallStackLevel => ({
      id: 'test-level',
      title: 'Test Level',
      description: 'Test',
      explanation: 'Test',
      difficulty: 'beginner',
      stageNumber: 1,
      code: '',
      functionCalls: [],
      expectedOrder: [],
      maxStackSize: 10,
      hints: [],
      concepts: [],
      ...overrides
    });

    it('simulationSteps가 없으면 빈 배열을 반환해야 한다', () => {
      const level = createTestLevel();
      const result = simulateExecution(level);
      expect(result).toEqual([]);
    });

    it('executionSteps가 없으면 빈 배열을 반환해야 한다', () => {
      const level = createTestLevel({
        simulationSteps: ['<global>', 'func1']
      });
      const result = simulateExecution(level);
      expect(result).toEqual([]);
    });

    it('기본 시뮬레이션을 수행해야 한다', () => {
      const level = createTestLevel({
        simulationSteps: [
          '<global>',
          'func1',
          'func1-return',
          '<global>-return'
        ],
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'func1 호출', currentLine: 2 },
          { step: 2, description: 'func1 종료', currentLine: 3 },
          { step: 3, description: '프로그램 종료', currentLine: 4 }
        ]
      });

      const result = simulateExecution(level);
      
      expect(result).toHaveLength(4);
      expect(result[0][0].functionName).toBe('<global>');
      expect(result[1]).toHaveLength(2); // <global>, func1
      expect(result[2]).toHaveLength(1); // <global>만 남음
      expect(result[3]).toHaveLength(0); // 모두 종료
    });

    it('console.log는 스택에 지속되지 않아야 한다', () => {
      const level = createTestLevel({
        simulationSteps: [
          '<global>',
          'console.log',
          '<global>-return'
        ],
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'console.log 실행', currentLine: 2 },
          { step: 2, description: '프로그램 종료', currentLine: 3 }
        ]
      });

      const result = simulateExecution(level);
      
      // console.log는 즉시 실행되므로 스택에 남지 않음
      expect(result[1]).toHaveLength(1); // <global>만
      expect(result[1][0].functionName).toBe('<global>');
    });

    it('중첩된 함수 호출을 올바르게 시뮬레이션해야 한다', () => {
      const level = createTestLevel({
        simulationSteps: [
          '<global>',
          'outer',
          'inner',
          'inner-return',
          'outer-return',
          '<global>-return'
        ],
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'outer 호출', currentLine: 2 },
          { step: 2, description: 'inner 호출', currentLine: 3 },
          { step: 3, description: 'inner 종료', currentLine: 4 },
          { step: 4, description: 'outer 종료', currentLine: 5 },
          { step: 5, description: '프로그램 종료', currentLine: 6 }
        ]
      });

      const result = simulateExecution(level);
      
      expect(result[2]).toHaveLength(3); // <global>, outer, inner
      expect(result[2][0].functionName).toBe('<global>');
      expect(result[2][1].functionName).toBe('outer');
      expect(result[2][2].functionName).toBe('inner');
      
      expect(result[3]).toHaveLength(2); // inner 제거됨
      expect(result[4]).toHaveLength(1); // outer 제거됨
    });

    describe('매핑 전략', () => {
      it('strict 전략을 사용할 수 있어야 한다', () => {
        const level = createTestLevel({
          simulationSteps: ['<global>', 'func1', 'func1-return'],
          executionSteps: [
            { step: 0, description: 'Step 0', currentLine: 1 },
            { step: 1, description: 'Step 1', currentLine: 2 },
            { step: 2, description: 'Step 2', currentLine: 3 }
          ]
        });

        const config: SimulatorConfig = {
          mappingStrategy: 'strict'
        };

        const result = simulateExecution(level, config);
        expect(result).toHaveLength(3);
      });

      it('custom 매퍼를 사용할 수 있어야 한다', () => {
        const level = createTestLevel({
          simulationSteps: ['<global>', 'func1', 'func2', 'func2-return', 'func1-return'],
          executionSteps: [
            { step: 0, description: 'Start', currentLine: 1 },
            { step: 1, description: 'Middle', currentLine: 2 },
            { step: 2, description: 'End', currentLine: 3 }
          ]
        });

        const config: SimulatorConfig = {
          mappingStrategy: 'custom',
          customMapper: (execStep) => {
            // 커스텀 매핑 로직
            return execStep * 2;
          }
        };

        const result = simulateExecution(level, config);
        expect(result).toHaveLength(3);
      });

      it('stackItemFactory를 사용하여 스택 아이템을 커스터마이징할 수 있어야 한다', () => {
        const level = createTestLevel({
          simulationSteps: ['<global>', 'customFunc'],
          executionSteps: [
            { step: 0, description: 'Start', currentLine: 1 },
            { step: 1, description: 'Custom function', currentLine: 2 }
          ]
        });

        const config: SimulatorConfig = {
          stackItemFactory: (functionName, index) => ({
            color: 'rgb(255, 0, 0)',
            height: 80,
            returnValue: 'custom-return'
          })
        };

        const result = simulateExecution(level, config);
        expect(result[1][1].color).toBe('rgb(255, 0, 0)');
        expect(result[1][1].height).toBe(80);
        expect(result[1][1].returnValue).toBe('custom-return');
      });
    });

    it('main을 <global>로 변환해야 한다', () => {
      const level = createTestLevel({
        simulationSteps: ['main', 'func1', 'func1-return', 'main-return'],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'Call func1', currentLine: 2 },
          { step: 2, description: 'Return from func1', currentLine: 3 },
          { step: 3, description: 'End', currentLine: 4 }
        ]
      });

      const result = simulateExecution(level);
      expect(result[0][0].functionName).toBe('<global>');
    });

    it('factorial 함수의 return을 올바르게 처리해야 한다', () => {
      const level = createTestLevel({
        simulationSteps: [
          '<global>',
          'factorial(3)',
          'factorial(2)',
          'factorial(1)',
          'factorial-return',
          'factorial-return',
          'factorial-return',
          '<global>-return'
        ],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'Call factorial(3)', currentLine: 2 },
          { step: 2, description: 'Call factorial(2)', currentLine: 3 },
          { step: 3, description: 'Call factorial(1)', currentLine: 4 },
          { step: 4, description: 'Return from factorial(1)', currentLine: 5 },
          { step: 5, description: 'Return from factorial(2)', currentLine: 6 },
          { step: 6, description: 'Return from factorial(3)', currentLine: 7 },
          { step: 7, description: 'End', currentLine: 8 }
        ]
      });

      const result = simulateExecution(level);
      
      // 가장 깊은 호출 시점
      expect(result[3]).toHaveLength(4); // <global>, factorial(3), factorial(2), factorial(1)
      
      // 첫 번째 반환 후
      expect(result[4]).toHaveLength(3); // factorial(1) 제거됨
      
      // 두 번째 반환 후
      expect(result[5]).toHaveLength(2); // factorial(2) 제거됨
      
      // 세 번째 반환 후
      expect(result[6]).toHaveLength(1); // factorial(3) 제거됨
    });
  });

  describe('interpolateFromSnapshots', () => {
    it('스냅샷을 기반으로 스택 상태를 생성해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'Middle', currentLine: 2 },
          { step: 2, description: 'End', currentLine: 3 }
        ],
        expectedSnapshots: {
          0: [{ id: '1', functionName: '<global>', color: '', height: 40 }],
          2: []
        }
      };

      const result = interpolateFromSnapshots(level);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].functionName).toBe('<global>');
      expect(result[2]).toHaveLength(0);
    });

    it('스냅샷이 없는 단계는 보간해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'func1 호출', currentLine: 2 },
          { step: 2, description: 'func1 종료', currentLine: 3 }
        ],
        expectedSnapshots: {
          0: [{ id: '1', functionName: '<global>', color: '', height: 40 }],
          2: []
        }
      };

      const result = interpolateFromSnapshots(level);
      
      // 중간 단계(1)는 이전 상태를 유지
      expect(result[1]).toHaveLength(1);
      expect(result[1][0].functionName).toBe('<global>');
    });

    it('스냅샷의 누락된 속성을 채워야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 }
        ],
        expectedSnapshots: {
          0: [{ 
            id: '', 
            functionName: 'testFunc',
            color: '',
            height: 0
          }]
        }
      };

      const result = interpolateFromSnapshots(level);
      
      expect(result[0][0].id).toBeTruthy();
      expect(result[0][0].height).toBe(40);
      expect(result[0][0].color).toBeTruthy();
    });

    it('executionSteps가 없으면 빈 배열을 반환해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        expectedSnapshots: {
          0: [{ id: '1', functionName: '<global>', color: '', height: 40 }]
        }
      };

      const result = interpolateFromSnapshots(level);
      expect(result).toEqual([]);
    });

    it('이전 스냅샷이 없는 경우를 처리해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'Middle', currentLine: 2 },
          { step: 2, description: 'End', currentLine: 3 }
        ],
        expectedSnapshots: {
          2: [{ id: '1', functionName: 'func1', color: '', height: 40 }]
        }
      };

      const result = interpolateFromSnapshots(level);
      
      // 인덱스 0과 1은 이전 스냅샷이 없으므로 기본 전역 컨텍스트를 반환해야 함
      expect(result[0][0].functionName).toBe('<global>');
      expect(result[1][0].functionName).toBe('<global>');
    });

    it('다음 스냅샷이 없는 경우를 처리해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'func1 종료', currentLine: 2 },
          { step: 2, description: 'End', currentLine: 3 }
        ],
        expectedSnapshots: {
          0: [
            { id: '1', functionName: '<global>', color: '', height: 40 },
            { id: '2', functionName: 'func1', color: '', height: 40 }
          ]
        }
      };

      const result = interpolateFromSnapshots(level);
      
      // 인덱스 1은 종료 설명이지만 다음 스냅샷이 없으므로 이전 상태를 유지
      expect(result[1]).toHaveLength(2);
      expect(result[2][0].functionName).toBe('<global>');
    });

    it('함수 종료 시 다음 스냅샷으로 전환해야 한다', () => {
      const level: CallStackLevel = {
        id: 'test',
        title: 'Test',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner',
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 },
          { step: 1, description: 'func1 호출', currentLine: 2 },
          { step: 2, description: 'func1 종료', currentLine: 3 },
          { step: 3, description: 'End', currentLine: 4 }
        ],
        expectedSnapshots: {
          0: [{ id: '1', functionName: '<global>', color: '', height: 40 }],
          1: [
            { id: '1', functionName: '<global>', color: '', height: 40 },
            { id: '2', functionName: 'func1', color: '', height: 40 }
          ],
          3: [{ id: '1', functionName: '<global>', color: '', height: 40 }]
        }
      };

      const result = interpolateFromSnapshots(level);
      
      // 인덱스 2는 func1 종료이고, 다음 스냅샷(3)이 존재하므로 해당 스냅샷으로 전환
      expect(result[2]).toHaveLength(1);
      expect(result[2][0].functionName).toBe('<global>');
      expect(result[2][0].id).toBe('<global>-2-0');
    });
  });

  describe('console.log 처리 엣지 케이스', () => {
    it('console.log가 없는 시뮬레이션 단계를 처리해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>', 'func1', 'func1-return', '<global>-return'],
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'console.log 실행', currentLine: 2 },
          { step: 2, description: 'func1 호출', currentLine: 3 },
          { step: 3, description: '프로그램 종료', currentLine: 4 }
        ]
      };

      const result = simulateExecution(level);
      
      // console.log를 찾지 못해도 정상적으로 동작해야 함
      expect(result).toHaveLength(4);
    });
  });

  describe('엣지 케이스 - 헬퍼 함수 fallback', () => {
    it('findNextReturnIndex가 return을 찾지 못하면 startIndex를 반환해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>', 'func1', 'func2'], // return이 없음
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'func1 호출', currentLine: 2 },
          { step: 2, description: 'func2 종료', currentLine: 3 } // 종료 설명이지만 simulationSteps에 return이 없음
        ]
      };

      const result = simulateExecution(level);
      
      // return을 찾지 못해도 정상적으로 동작해야 함
      expect(result).toHaveLength(3);
      expect(result[2]).toHaveLength(3); // 모든 함수가 스택에 남아있음
    });

    it('console.log가 많이 있어도 targetCount를 넘어서면 fallback 처리되어야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>', 'console.log', 'console.log'], // 2개의 console.log
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'console.log 실행', currentLine: 2 },
          { step: 2, description: 'console.log 실행', currentLine: 3 },
          { step: 3, description: 'console.log 실행', currentLine: 4 }, // 3번째 console.log 실행 (simulationSteps에는 2개만)
          { step: 4, description: 'console.log 실행', currentLine: 5 }, // 4번째 console.log 실행
          { step: 5, description: 'console.log 실행', currentLine: 6 }, // 5번째 console.log 실행
          { step: 6, description: '프로그램 종료', currentLine: 7 }
        ]
      };

      const result = simulateExecution(level);
      
      // console.log 개수가 부족해도 정상적으로 동작해야 함
      expect(result).toHaveLength(7);
    });

    it('빈 문자열인 simulationStep을 처리해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>', 'func1', '', 'func1-return'], // 빈 문자열 포함
        executionSteps: [
          { step: 0, description: '프로그램 시작', currentLine: 1 },
          { step: 1, description: 'func1 호출', currentLine: 2 },
          { step: 2, description: '중간 단계', currentLine: 3 },
          { step: 3, description: 'func1 종료', currentLine: 4 }
        ]
      };

      const result = simulateExecution(level);
      
      // 빈 문자열을 만나면 break되어야 함
      expect(result).toHaveLength(4);
      expect(result[2]).toHaveLength(2); // <global>과 func1만 있어야 함
    });
  });

  describe('엣지 케이스 - createMappingTable', () => {
    it('executionSteps나 simulationSteps가 없으면 빈 배열을 반환해야 한다', () => {
      const level1 = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>'],
        executionSteps: undefined
      };

      const result1 = simulateExecution(level1);
      expect(result1).toEqual([]);

      const level2 = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: undefined,
        executionSteps: [{ step: 0, description: 'Start', currentLine: 1 }]
      };

      const result2 = simulateExecution(level2);
      expect(result2).toEqual([]);
    });

    it('flexible 매핑에서 simulationSteps가 null인 경우를 처리해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: null as any,
        executionSteps: [{ step: 0, description: 'Start', currentLine: 1 }]
      };

      const result = simulateExecution(level, { mappingStrategy: 'flexible' });
      expect(result).toEqual([]);
    });

    it('custom 매핑에서 executionSteps가 null인 경우를 처리해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        simulationSteps: ['<global>'],
        executionSteps: null as any
      };

      const result = simulateExecution(level, { 
        mappingStrategy: 'custom',
        customMapper: () => 0
      });
      expect(result).toEqual([]);
    });
  });

  describe('엣지 케이스 - interpolateFromSnapshots', () => {
    it('expectedSnapshots가 없으면 빈 객체로 처리해야 한다', () => {
      const level = {
        id: 'test-level',
        title: 'Test Level',
        description: 'Test',
        explanation: 'Test',
        difficulty: 'beginner' as const,
        stageNumber: 1,
        code: '',
        functionCalls: [],
        expectedOrder: [],
        maxStackSize: 10,
        hints: [],
        concepts: [],
        executionSteps: [
          { step: 0, description: 'Start', currentLine: 1 }
        ]
        // expectedSnapshots 없음
      };

      const result = interpolateFromSnapshots(level);
      
      // 기본 전역 컨텍스트로 처리되어야 함
      expect(result).toHaveLength(1);
      expect(result[0][0].functionName).toBe('<global>');
    });

  });

    it('빈 스택에서 simulateExecution이 빈 배열을 반환해야 한다', () => {
      const emptyLevel: CallStackLevel = {
        id: 'empty-level',
        title: 'Empty Level',
        difficulty: 'beginner',
        stage: 1,
        executionSteps: [],
        simulationSteps: [],
        expectedResult: 'Empty result',
        hints: [],
        explanation: 'Empty explanation',
        codeExamples: []
      };

      const result = simulateExecution(emptyLevel);
      expect(result).toEqual([]);
    });
});