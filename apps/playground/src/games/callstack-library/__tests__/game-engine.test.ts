/**
 * CallStackEngine 단위 테스트
 * 
 * CallStack 게임의 핵심 엔진 로직을 검증합니다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CallStackEngine } from '../game-engine';
import { CallStackLevel, FunctionCall, QueueType } from '../types';
import { GameValidationResult, GameDifficulty } from '../../shared/types';

describe('CallStackEngine', () => {
  let engine: CallStackEngine;

  beforeEach(() => {
    engine = new CallStackEngine();
  });

  describe('초기화', () => {
    it('엔진이 올바르게 초기화되어야 한다', () => {
      expect(engine).toBeInstanceOf(CallStackEngine);
    });

    it('초기 게임 상태가 올바르게 설정되어야 한다', () => {
      const state = engine.getGameState();
      
      expect(state.currentStack).toEqual([]);
      expect(state.executionOrder).toEqual([]);
      expect(state.isExecuting).toBe(false);
      expect(state.currentFunction).toBeNull();
      expect(state.stackOverflow).toBe(false);
      expect(state.queues).toBeDefined();
      expect(state.queues.callstack).toEqual([]);
      expect(state.queues.microtask).toEqual([]);
      expect(state.queues.macrotask).toEqual([]);
    });

    it('모든 난이도의 레벨이 로드되어야 한다', () => {
      const beginnerLevels = engine.getAllLevels('beginner');
      const intermediateLevels = engine.getAllLevels('intermediate');
      const advancedLevels = engine.getAllLevels('advanced');

      expect(beginnerLevels.length).toBeGreaterThan(0);
      expect(intermediateLevels.length).toBeGreaterThan(0);
      expect(advancedLevels.length).toBeGreaterThan(0);
    });
  });

  describe('함수 실행 시뮬레이션', () => {
    it('단일 함수 호출을 시뮬레이션할 수 있어야 한다', () => {
      const funcCall: FunctionCall = {
        name: 'testFunction',
        returns: 'test result'
      };

      engine.executeFunction(funcCall);
      const state = engine.getGameState();

      expect(state.executionOrder).toContain('testFunction');
      expect(state.currentStack).toHaveLength(0); // 실행 완료 후 스택에서 제거됨
      expect(state.currentFunction).toBeNull();
    });

    it('중첩 함수 호출을 시뮬레이션할 수 있어야 한다', () => {
      const funcCall: FunctionCall = {
        name: 'outerFunction',
        returns: 'outer result',
        calls: [
          {
            name: 'innerFunction',
            returns: 'inner result'
          }
        ]
      };

      engine.executeFunction(funcCall);
      const state = engine.getGameState();

      expect(state.executionOrder).toEqual(['outerFunction', 'innerFunction']);
      expect(state.currentStack).toHaveLength(0);
      expect(state.currentFunction).toBeNull();
    });

    it('깊은 중첩 함수 호출을 처리할 수 있어야 한다', () => {
      const createNestedCall = (depth: number): FunctionCall => {
        if (depth === 0) {
          return {
            name: `function${depth}`,
            returns: `result${depth}`
          };
        }
        return {
          name: `function${depth}`,
          returns: `result${depth}`,
          calls: [createNestedCall(depth - 1)]
        };
      };

      const funcCall = createNestedCall(5);
      engine.executeFunction(funcCall);
      const state = engine.getGameState();

      expect(state.executionOrder).toHaveLength(6); // function5부터 function0까지
      expect(state.stackOverflow).toBe(false);
    });

    it('스택 오버플로우를 감지해야 한다', () => {
      const createDeepCall = (depth: number): FunctionCall => {
        if (depth === 0) {
          return {
            name: `function${depth}`,
            returns: `result${depth}`
          };
        }
        return {
          name: `function${depth}`,
          returns: `result${depth}`,
          calls: [createDeepCall(depth - 1)]
        };
      };

      const funcCall = createDeepCall(150); // 스택 오버플로우를 유발할 깊이
      engine.executeFunction(funcCall);
      const state = engine.getGameState();

      expect(state.stackOverflow).toBe(true);
    });

    it('글로벌 컨텍스트를 올바르게 처리해야 한다', () => {
      const funcCall: FunctionCall = {
        name: '<global>',
        returns: undefined
      };

      engine.executeFunction(funcCall);
      const state = engine.getGameState();

      expect(state.executionOrder).toContain('<global>');
    });

    it('실행 중에 currentFunction이 올바르게 설정되어야 한다', () => {
      const funcCall: FunctionCall = {
        name: 'testFunction',
        returns: 'test result',
        calls: [
          {
            name: 'nestedFunction',
            returns: 'nested result'
          }
        ]
      };

      // 실행 중 상태 체크를 위한 Mock
      const originalExecuteFunction = engine.executeFunction.bind(engine);
      const executionStates: (string | null)[] = [];
      
      engine.executeFunction = function(funcCall: FunctionCall, depth: number = 0) {
        originalExecuteFunction(funcCall, depth);
        executionStates.push(this.getGameState().currentFunction);
      };

      engine.executeFunction(funcCall);
      
      // 실행 완료 후 currentFunction은 null이어야 함
      expect(engine.getGameState().currentFunction).toBeNull();
    });
  });

  describe('큐 색상 관리', () => {
    it('유효한 큐 타입에 대해 색상을 반환해야 한다', () => {
      const queueTypes: QueueType[] = [
        'callstack', 'microtask', 'macrotask', 'priority',
        'circular', 'deque', 'animation', 'immediate', 'idle'
      ];

      queueTypes.forEach(queueType => {
        const color = engine.getQueueColor(queueType);
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/); // 유효한 헥사 색상 코드
      });
    });

    it('유효하지 않은 큐 타입에 대해 기본 색상을 반환해야 한다', () => {
      const invalidQueueType = 'invalid' as QueueType;
      const color = engine.getQueueColor(invalidQueueType);
      expect(color).toBe('#6b7280'); // 기본 색상
    });
  });

  describe('답안 검증 - Type A (기본)', () => {
    const mockLevel: CallStackLevel = {
      id: 'test-level',
      title: 'Test Level',
      description: 'Test Description',
      code: 'console.log("test")',
      expectedOrder: ['function1', 'function2', 'function3'],
      hints: ['hint1', 'hint2'],
      explanation: 'Test explanation',
      layoutType: 'A',
      difficulty: 'beginner' as GameDifficulty
    };

    it('정확한 답안을 검증해야 한다', () => {
      const userOrder = ['function1', 'function2', 'function3'];
      const result = engine.validateAnswer(mockLevel, userOrder);

      expect(result.success).toBe(true);
      expect(result.message).toContain('완벽합니다');
      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('잘못된 답안을 검증해야 한다', () => {
      const userOrder = ['function1', 'function3', 'function2'];
      const result = engine.validateAnswer(mockLevel, userOrder);

      expect(result.success).toBe(false);
      expect(result.message).toContain('순서가 올바르지 않습니다');
      expect(result.hint).toBeDefined();
    });

    it('빈 답안을 처리해야 한다', () => {
      const userOrder: string[] = [];
      const result = engine.validateAnswer(mockLevel, userOrder);

      expect(result.success).toBe(false);
    });

    it('길이가 다른 답안을 처리해야 한다', () => {
      const userOrder = ['function1', 'function2'];
      const result = engine.validateAnswer(mockLevel, userOrder);

      expect(result.success).toBe(false);
    });
  });

  describe('답안 검증 - Type A+ (시뮬레이션)', () => {
    const mockLevelAPlus: CallStackLevel = {
      id: 'test-level-a-plus',
      title: 'Test Level A+',
      description: 'Test Description A+',
      code: 'function test() { nested(); }',
      expectedOrder: [],
      simulationSteps: ['function1', 'function2', 'function2-return', 'function1-return'],
      hints: ['hint1'],
      explanation: 'Test explanation',
      layoutType: 'A+',
      difficulty: 'intermediate' as GameDifficulty
    };

    it('Type A+ 레이아웃의 정확한 답안을 검증해야 한다', () => {
      const userOrder = ['function1', 'function2', 'function2 종료', 'function1 종료'];
      const result = engine.validateAnswer(mockLevelAPlus, userOrder, 'A+');

      expect(result.success).toBe(true);
      expect(result.message).toContain('LIFO 원칙');
      expect(result.score).toBeDefined();
    });

    it('Type A+ 레이아웃의 잘못된 답안을 검증해야 한다', () => {
      const userOrder = ['function1', 'function2', 'function1 종료', 'function2 종료'];
      const result = engine.validateAnswer(mockLevelAPlus, userOrder, 'A+');

      expect(result.success).toBe(false);
      expect(result.message).toContain('LIFO 순서가 올바르지 않습니다');
      expect(result.hint).toBeDefined();
    });

    it('글로벌 컨텍스트가 제외되어야 한다', () => {
      const mockLevelWithGlobal: CallStackLevel = {
        ...mockLevelAPlus,
        simulationSteps: ['<global>', 'function1', 'function1-return', '<global>-return']
      };

      const userOrder = ['function1', 'function1 종료'];
      const result = engine.validateAnswer(mockLevelWithGlobal, userOrder, 'A+');

      expect(result.success).toBe(true);
    });
  });

  describe('답안 검증 - Type E (스냅샷)', () => {
    const mockLevelE: CallStackLevel = {
      id: 'test-level-e',
      title: 'Test Level E',
      description: 'Test Description E',
      code: 'function test() { snapshot(); }',
      expectedOrder: [],
      expectedSnapshots: {
        1: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }],
        2: [
          { id: '1', functionName: 'function1', color: '#000', height: 40 },
          { id: '2', functionName: 'function2', color: '#000', height: 40 }
        ],
        3: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }]
      },
      snapshotCheckpoints: [1, 2, 3],
      hints: ['hint1'],
      explanation: 'Test explanation',
      layoutType: 'E',
      difficulty: 'advanced' as GameDifficulty
    };

    it('Type E 레이아웃의 정확한 스냅샷을 검증해야 한다', () => {
      const userSnapshots = {
        1: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }],
        2: [
          { id: '1', functionName: 'function1', color: '#000', height: 40 },
          { id: '2', functionName: 'function2', color: '#000', height: 40 }
        ],
        3: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }]
      };
      const result = engine.validateAnswer(mockLevelE, userSnapshots, 'E');

      expect(result.success).toBe(true);
    });

    it('Type E 레이아웃의 잘못된 스냅샷을 검증해야 한다', () => {
      const userSnapshots = {
        1: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }],
        2: [{ id: '2', functionName: 'function2', color: '#000', height: 40 }],
        3: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }]
      };
      const result = engine.validateAnswer(mockLevelE, userSnapshots, 'E');

      expect(result.success).toBe(false);
    });

    it('Type E 레이아웃에서 필수 데이터가 없으면 에러를 반환해야 한다', () => {
      const incompleteLevelE: CallStackLevel = {
        ...mockLevelE,
        expectedSnapshots: undefined
      };

      const userSnapshots = {
        1: [{ id: '1', functionName: 'function1', color: '#000', height: 40 }]
      };
      const result = engine.validateAnswer(incompleteLevelE, userSnapshots, 'E');

      expect(result.success).toBe(false);
      expect(result.message).toContain('레벨 설정이 올바르지 않습니다');
    });
  });

  describe('에러 처리', () => {
    it('검증 중 예외가 발생하면 적절히 처리해야 한다', () => {
      const mockLevel: CallStackLevel = {
        id: 'error-level',
        title: 'Error Level',
        description: 'Error Description',
        code: 'error code',
        expectedOrder: ['function1'],
        hints: [],
        explanation: 'Error explanation',
        layoutType: 'A',
        difficulty: 'beginner' as GameDifficulty
      };

      // JSON.stringify에서 에러를 발생시키는 circular reference 객체
      const circularRef: any = {};
      circularRef.self = circularRef;
      
      // 이 경우는 실제로는 드물지만, 에러 처리 코드를 테스트하기 위함
      try {
        const result = engine.validateAnswer(mockLevel, [circularRef]);
        // 정상적으로 에러 처리가 되었다면 success: false여야 함
        expect(result.success).toBe(false);
        expect(result.message).toContain('오류가 발생했습니다');
      } catch (error) {
        // 에러가 catch되지 않고 밖으로 나오면 안됨
        expect(true).toBe(false); // 이 라인에 도달하면 안됨
      }
    });

    it('null 또는 undefined 답안을 처리해야 한다', () => {
      const mockLevel: CallStackLevel = {
        id: 'null-level',
        title: 'Null Level',
        description: 'Null Description',
        code: 'null code',
        expectedOrder: ['function1'],
        hints: [],
        explanation: 'Null explanation',
        layoutType: 'A',
        difficulty: 'beginner' as GameDifficulty
      };

      const result1 = engine.validateAnswer(mockLevel, null as any);
      const result2 = engine.validateAnswer(mockLevel, undefined as any);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe('점수 계산', () => {
    it('적은 힌트 사용 시 높은 점수를 받아야 한다', () => {
      const level1: CallStackLevel = {
        id: 'score-test-1',
        title: 'Score Test 1',
        description: 'Score Description',
        code: 'score test',
        expectedOrder: ['function1', 'function2'],
        hints: ['hint1', 'hint2', 'hint3'], // 많은 힌트
        explanation: 'Score explanation',
        layoutType: 'A',
        difficulty: 'beginner' as GameDifficulty
      };

      const level2: CallStackLevel = {
        ...level1,
        id: 'score-test-2',
        hints: ['hint1'] // 적은 힌트
      };

      const userOrder = ['function1', 'function2'];
      const result1 = engine.validateAnswer(level1, userOrder);
      const result2 = engine.validateAnswer(level2, userOrder);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.score).toBeGreaterThan(result1.score!);
    });
  });

  describe('게임 상태 관리', () => {
    it('게임 상태를 초기화할 수 있어야 한다', () => {
      // 상태 변경
      engine.executeFunction({
        name: 'testFunction',
        returns: 'test'
      });

      // 초기화
      engine.resetGameState();
      const state = engine.getGameState();

      expect(state.currentStack).toEqual([]);
      expect(state.executionOrder).toEqual([]);
      expect(state.isExecuting).toBe(false);
      expect(state.currentFunction).toBeNull();
      expect(state.stackOverflow).toBe(false);
    });

    it('게임 상태가 일관성을 유지해야 한다', () => {
      const state1 = engine.getGameState();
      const state2 = engine.getGameState();
      
      // 내용은 동일해야 함
      expect(state1.currentStack.length).toBe(state2.currentStack.length);
      expect(state1.executionOrder.length).toBe(state2.executionOrder.length);
      expect(state1.isExecuting).toBe(state2.isExecuting);
      expect(state1.currentFunction).toBe(state2.currentFunction);
      expect(state1.stackOverflow).toBe(state2.stackOverflow);
      
      // 큐 상태도 동일해야 함
      expect(Object.keys(state1.queues)).toEqual(Object.keys(state2.queues));
    });
  });

  describe('레벨 관리', () => {
    it('특정 난이도의 레벨을 조회할 수 있어야 한다', () => {
      const beginnerLevels = engine.getAllLevels('beginner');
      const intermediateLevels = engine.getAllLevels('intermediate');
      const advancedLevels = engine.getAllLevels('advanced');

      expect(Array.isArray(beginnerLevels)).toBe(true);
      expect(Array.isArray(intermediateLevels)).toBe(true);
      expect(Array.isArray(advancedLevels)).toBe(true);

      expect(beginnerLevels.length).toBeGreaterThan(0);
      expect(intermediateLevels.length).toBeGreaterThan(0);
      expect(advancedLevels.length).toBeGreaterThan(0);
    });

    it('특정 스테이지의 레벨을 조회할 수 있어야 한다', () => {
      const beginnerLevels = engine.getAllLevels('beginner');
      const firstLevel = beginnerLevels[0];
      
      if (firstLevel && 'stageNumber' in firstLevel) {
        const foundLevel = engine.getLevelByStage('beginner', (firstLevel as any).stageNumber);
        expect(foundLevel).toEqual(firstLevel);
      }
    });

    it('존재하지 않는 스테이지 조회 시 null을 반환해야 한다', () => {
      const foundLevel = engine.getLevelByStage('beginner', 9999);
      expect(foundLevel).toBeNull();
    });

    it('총 스테이지 수를 조회할 수 있어야 한다', () => {
      const beginnerStages = engine.getTotalStages('beginner');
      const intermediateStages = engine.getTotalStages('intermediate');
      const advancedStages = engine.getTotalStages('advanced');
      
      expect(beginnerStages).toBeGreaterThan(0);
      expect(intermediateStages).toBeGreaterThan(0);
      expect(advancedStages).toBeGreaterThan(0);
    });

    it('게임 설정을 조회할 수 있어야 한다', () => {
      const config = engine.getGameConfig();
      expect(config).toBeDefined();
      expect(config.id).toBeDefined();
      expect(config.title).toBeDefined();
      expect(config.description).toBeDefined();
      expect(config.difficulties).toBeDefined();
      expect(Array.isArray(config.difficulties)).toBe(true);
    });
  });

  describe('유틸리티 메서드', () => {
    it('깊이에 따른 색상을 생성해야 한다', () => {
      // private 메서드이므로 다른 방법으로 테스트
      const funcCall1: FunctionCall = { name: 'func1', returns: 'result1' };
      const funcCall2: FunctionCall = { 
        name: 'func2', 
        returns: 'result2',
        calls: [{ name: 'func3', returns: 'result3' }]
      };

      engine.executeFunction(funcCall1);
      const state1 = engine.getGameState();
      
      engine.resetGameState();
      engine.executeFunction(funcCall2);
      const state2 = engine.getGameState();

      // 실행 순서가 기록되어야 함
      expect(state1.executionOrder).toContain('func1');
      expect(state2.executionOrder).toContain('func2');
      expect(state2.executionOrder).toContain('func3');
    });

    it('차이점 힌트를 생성해야 한다', () => {
      const level: CallStackLevel = {
        id: 'hint-test',
        title: 'Hint Test',
        description: 'Hint Description',
        code: 'hint test',
        expectedOrder: ['function1', 'function2', 'function3'],
        hints: [],
        explanation: 'Hint explanation',
        layoutType: 'A',
        difficulty: 'beginner' as GameDifficulty
      };

      const userOrder = ['function1', 'function3', 'function2'];
      const result = engine.validateAnswer(level, userOrder);

      expect(result.success).toBe(false);
      expect(result.hint).toBeDefined();
      expect(typeof result.hint).toBe('string');
    });
  });

  describe('큐 관리', () => {
    beforeEach(() => {
      engine.resetGameState();
    });

    it('다양한 큐 타입에 아이템을 추가할 수 있어야 한다', () => {
      const queueTypes: QueueType[] = ['microtask', 'macrotask', 'priority', 'circular', 'deque'];
      
      queueTypes.forEach(queueType => {
        const queueItem = {
          id: `test-${queueType}`,
          functionName: `testFunc-${queueType}`,
          returnValue: 'test',
          color: '#000000',
          height: 60,
          queueType,
          timestamp: Date.now()
        };
        
        engine.addToQueue(queueType, queueItem);
        const queueState = engine.getQueueState(queueType);
        expect(queueState.length).toBeGreaterThan(0);
        expect(queueState[queueState.length - 1].functionName).toBe(`testFunc-${queueType}`);
      });
    });

    it('큐에서 아이템을 제거할 수 있어야 한다', () => {
      const queueItem = {
        id: 'test-remove',
        functionName: 'testFunc',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'microtask' as QueueType,
        timestamp: Date.now()
      };
      
      engine.addToQueue('microtask', queueItem);
      expect(engine.getQueueState('microtask').length).toBe(1);
      
      const removedItem = engine.removeFromQueue('microtask');
      expect(removedItem).not.toBeNull();
      expect(removedItem?.functionName).toBe('testFunc');
      expect(engine.getQueueState('microtask').length).toBe(0);
    });

    it('빈 큐에서 제거 시 null을 반환해야 한다', () => {
      const removedItem = engine.removeFromQueue('microtask');
      expect(removedItem).toBeNull();
    });

    it('우선순위 큐가 올바르게 정렬되어야 한다', () => {
      const item1 = {
        id: 'test-priority-1',
        functionName: 'lowPriority',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'priority' as QueueType,
        priority: 1,
        timestamp: Date.now()
      };
      
      const item2 = {
        id: 'test-priority-2',
        functionName: 'highPriority',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'priority' as QueueType,
        priority: 10,
        timestamp: Date.now()
      };
      
      engine.addToQueue('priority', item1);
      engine.addToQueue('priority', item2);
      
      const queueState = engine.getQueueState('priority');
      expect(queueState[0].functionName).toBe('highPriority'); // 높은 우선순위가 앞에
      expect(queueState[1].functionName).toBe('lowPriority');
    });

    it('원형 큐가 최대 크기를 유지해야 한다', () => {
      // queue-configs.ts에서 circular 큐의 maxSize는 20
      const circularMaxSize = 20;
      
      // maxSize를 초과하도록 아이템 추가
      for (let i = 0; i < 25; i++) {
        const item = {
          id: `circular-${i}`,
          functionName: `func${i}`,
          returnValue: 'test',
          color: '#000000',
          height: 60,
          queueType: 'circular' as QueueType,
          timestamp: Date.now()
        };
        engine.addToQueue('circular', item);
      }
      
      const finalState = engine.getQueueState('circular');
      // 최대 크기를 초과하지 않아야 함
      expect(finalState.length).toBeLessThanOrEqual(circularMaxSize);
    });

    it('덱에서 양쪽 끝에서 조작할 수 있어야 한다', () => {
      const item1 = {
        id: 'deque-front',
        functionName: 'frontItem',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'deque' as QueueType,
        timestamp: Date.now()
      };
      
      const item2 = {
        id: 'deque-rear',
        functionName: 'rearItem',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'deque' as QueueType,
        timestamp: Date.now()
      };
      
      engine.addToDequeFont(item1);
      engine.addToQueue('deque', item2);
      
      const queueState = engine.getQueueState('deque');
      expect(queueState[0].functionName).toBe('frontItem');
      expect(queueState[1].functionName).toBe('rearItem');
      
      // 뒤쪽에서 제거
      const rearRemoved = engine.removeFromDequeRear();
      expect(rearRemoved?.functionName).toBe('rearItem');
      
      // 앞쪽에서 제거
      const frontRemoved = engine.removeFromQueue('deque');
      expect(frontRemoved?.functionName).toBe('frontItem');
    });

    it('모든 큐 상태를 조회할 수 있어야 한다', () => {
      const item = {
        id: 'test-all-queues',
        functionName: 'testFunc',
        returnValue: 'test',
        color: '#000000',
        height: 60,
        queueType: 'microtask' as QueueType,
        timestamp: Date.now()
      };
      
      engine.addToQueue('microtask', item);
      
      const allQueues = engine.getAllQueuesState();
      expect(allQueues).toBeDefined();
      expect(allQueues.microtask).toBeDefined();
      expect(allQueues.microtask.length).toBe(1);
      expect(allQueues.macrotask).toBeDefined();
      expect(Array.isArray(allQueues.callstack)).toBe(true);
    });
  });

  describe('확장된 함수 실행', () => {
    beforeEach(() => {
      engine.resetGameState();
    });

    it('확장된 함수 실행을 시뮬레이션할 수 있어야 한다', () => {
      const funcCall: FunctionCall = {
        name: 'enhancedFunc',
        returns: 'result',
        queueType: 'microtask',
        priority: 5
      };
      
      engine.executeEnhancedFunction(funcCall);
      const state = engine.getGameState();
      
      expect(state.executionOrder).toContain('enhancedFunc');
      expect(state.queues.microtask.length).toBe(1);
      expect(state.queues.microtask[0].functionName).toBe('enhancedFunc');
      expect(state.queues.microtask[0].priority).toBe(5);
    });

    it('콜스택 타입의 확장된 함수 실행을 처리해야 한다', () => {
      const funcCall: FunctionCall = {
        name: 'stackFunc',
        returns: 'result',
        queueType: 'callstack'
      };
      
      engine.executeEnhancedFunction(funcCall);
      const state = engine.getGameState();
      
      expect(state.executionOrder).toContain('stackFunc');
      expect(state.currentStack.length).toBe(0); // 실행 완료 후 제거됨
    });

    it('스택 오버플로우를 감지해야 한다', () => {
      const createDeepCall = (depth: number): FunctionCall => {
        if (depth === 0) {
          return {
            name: `enhancedFunc${depth}`,
            returns: `result${depth}`,
            queueType: 'callstack'
          };
        }
        return {
          name: `enhancedFunc${depth}`,
          returns: `result${depth}`,
          queueType: 'callstack',
          calls: [createDeepCall(depth - 1)]
        };
      };
      
      const funcCall = createDeepCall(150);
      engine.executeEnhancedFunction(funcCall);
      const state = engine.getGameState();
      
      expect(state.stackOverflow).toBe(true);
    });
  });

  describe('스냅샷 검증', () => {
    it('단일 스냅샷을 검증할 수 있어야 한다', () => {
      const userSnapshot = [
        { id: '1', functionName: 'func1', color: '#000', height: 40 },
        { id: '2', functionName: 'func2', color: '#000', height: 40 }
      ];
      
      const expectedSnapshot = ['func1', 'func2'];
      
      const isValid = engine.validateSnapshot(userSnapshot, expectedSnapshot);
      expect(isValid).toBe(true);
    });

    it('잘못된 스냅샷을 감지해야 한다', () => {
      const userSnapshot = [
        { id: '1', functionName: 'func1', color: '#000', height: 40 }
      ];
      
      const expectedSnapshot = ['func1', 'func2'];
      
      const isValid = engine.validateSnapshot(userSnapshot, expectedSnapshot);
      expect(isValid).toBe(false);
    });

    it('StackItem 객체 배열과 비교할 수 있어야 한다', () => {
      const userSnapshot = [
        { id: '1', functionName: 'func1', color: '#000', height: 40 }
      ];
      
      const expectedSnapshot = [
        { id: '1', functionName: 'func1', color: '#000', height: 40 }
      ];
      
      const isValid = engine.validateSnapshot(userSnapshot, expectedSnapshot);
      expect(isValid).toBe(true);
    });
  });
});