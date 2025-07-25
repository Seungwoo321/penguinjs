/**
 * layoutClassifier 단위 테스트
 * 
 * 게임 레이아웃 분류 및 설정 관리 유틸리티들을 검증합니다.
 */

import { describe, it, expect } from 'vitest';
import {
  getLayoutType,
  getLayoutConfig,
  getRequiredQueues,
  getStageQueues,
  getLayoutDescription,
  getAllLayoutInfo,
  getDifficultyLayoutTypes,
  LAYOUT_CONFIGS,
  type LayoutConfig,
  type PlayMode
} from '../layoutClassifier';
import { LayoutType } from '../../types';
import { GameDifficulty } from '../../../shared/types';

describe('layoutClassifier', () => {
  describe('LAYOUT_CONFIGS', () => {
    it('모든 레이아웃 타입이 정의되어야 한다', () => {
      const expectedTypes: LayoutType[] = ['A', 'A+', 'B', 'C', 'D', 'E'];
      
      expectedTypes.forEach(type => {
        expect(LAYOUT_CONFIGS).toHaveProperty(type);
        expect(LAYOUT_CONFIGS[type].type).toBe(type);
      });
    });

    it('각 레이아웃 설정이 올바른 구조를 가져야 한다', () => {
      Object.values(LAYOUT_CONFIGS).forEach(config => {
        expect(config).toHaveProperty('type');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('stages');
        expect(config).toHaveProperty('difficulty');
        expect(config).toHaveProperty('gridTemplate');
        expect(config).toHaveProperty('components');
        expect(config).toHaveProperty('playMode');
        expect(config).toHaveProperty('evaluation');
        
        expect(Array.isArray(config.stages)).toBe(true);
        expect(Array.isArray(config.difficulty)).toBe(true);
        expect(typeof config.name).toBe('string');
        expect(typeof config.description).toBe('string');
        expect(typeof config.gridTemplate).toBe('string');
      });
    });

    it('타입 A 설정이 올바르게 정의되어야 한다', () => {
      const configA = LAYOUT_CONFIGS['A'];
      
      expect(configA.type).toBe('A');
      expect(configA.name).toBe('기본 콜스택');
      expect(configA.description).toBe('함수 호출 순서 학습');
      expect(configA.stages).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(configA.difficulty).toEqual(['beginner']);
      expect(configA.playMode).toBe('order-prediction');
      expect(configA.components.codeEditor).toBe(true);
      expect(configA.components.callstack).toBe(true);
      expect(configA.components.functionSelector).toBe(true);
      expect(configA.evaluation.checkOrder).toBe(true);
    });

    it('타입 A+ 설정이 올바르게 정의되어야 한다', () => {
      const configAPlus = LAYOUT_CONFIGS['A+'];
      
      expect(configAPlus.type).toBe('A+');
      expect(configAPlus.name).toBe('시작/종료 추적');
      expect(configAPlus.description).toBe('LIFO 원칙 체득');
      expect(configAPlus.stages).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
      expect(configAPlus.difficulty).toEqual(['intermediate']);
      expect(configAPlus.playMode).toBe('start-end-tracking');
      expect(configAPlus.evaluation.checkLifoPrinciple).toBe(true);
    });

    it('타입 B 설정이 올바르게 정의되어야 한다', () => {
      const configB = LAYOUT_CONFIGS['B'];
      
      expect(configB.type).toBe('B');
      expect(configB.name).toBe('이벤트 루프');
      expect(configB.description).toBe('비동기 + 스택 상태');
      expect(configB.stages).toEqual([21, 22]);
      expect(configB.difficulty).toEqual(['advanced']);
      expect(configB.playMode).toBe('queue-states');
      expect(configB.components.queueVisualizer).toEqual(['callstack', 'microtask', 'macrotask']);
      expect(configB.components.snapshotBuilder).toBe(true);
    });

    it('타입 C 설정이 올바르게 정의되어야 한다', () => {
      const configC = LAYOUT_CONFIGS['C'];
      
      expect(configC.type).toBe('C');
      expect(configC.name).toBe('다중 큐 시스템');
      expect(configC.stages).toEqual([23]);
      expect(configC.components.queueVisualizer).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'generator']);
    });

    it('타입 D 설정이 올바르게 정의되어야 한다', () => {
      const configD = LAYOUT_CONFIGS['D'];
      
      expect(configD.type).toBe('D');
      expect(configD.name).toBe('최종 통합');
      expect(configD.stages).toEqual([24]);
      expect(configD.components.queueVisualizer).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker']);
    });

    it('타입 E 설정이 올바르게 정의되어야 한다', () => {
      const configE = LAYOUT_CONFIGS['E'];
      
      expect(configE.type).toBe('E');
      expect(configE.name).toBe('스택 스냅샷');
      expect(configE.stages).toEqual([17, 18, 19, 20]);
      expect(configE.playMode).toBe('timeline-snapshot');
      expect(configE.components.functionSelector).toBe(false);
      expect(configE.evaluation.checkSnapshots).toBe(true);
    });
  });

  describe('getLayoutType', () => {
    it('초급 1-8 스테이지는 타입 A를 반환해야 한다', () => {
      for (let stage = 1; stage <= 8; stage++) {
        expect(getLayoutType('beginner', stage)).toBe('A');
      }
    });

    it('중급 9-16 스테이지는 타입 A+를 반환해야 한다', () => {
      for (let stage = 9; stage <= 16; stage++) {
        expect(getLayoutType('intermediate', stage)).toBe('A+');
      }
    });

    it('고급 17-20 스테이지는 타입 E를 반환해야 한다', () => {
      for (let stage = 17; stage <= 20; stage++) {
        expect(getLayoutType('advanced', stage)).toBe('E');
      }
    });

    it('고급 21-22 스테이지는 타입 B를 반환해야 한다', () => {
      expect(getLayoutType('advanced', 21)).toBe('B');
      expect(getLayoutType('advanced', 22)).toBe('B');
    });

    it('고급 23 스테이지는 타입 C를 반환해야 한다', () => {
      expect(getLayoutType('advanced', 23)).toBe('C');
    });

    it('고급 24 스테이지는 타입 D를 반환해야 한다', () => {
      expect(getLayoutType('advanced', 24)).toBe('D');
    });

    it('범위를 벗어난 스테이지는 기본값 A를 반환해야 한다', () => {
      expect(getLayoutType('beginner', 0)).toBe('A');
      expect(getLayoutType('beginner', 9)).toBe('A');
      expect(getLayoutType('intermediate', 8)).toBe('A');
      expect(getLayoutType('intermediate', 17)).toBe('A');
      expect(getLayoutType('advanced', 16)).toBe('A');
      expect(getLayoutType('advanced', 25)).toBe('A');
    });

    it('잘못된 난이도에 대해 기본값 A를 반환해야 한다', () => {
      expect(getLayoutType('invalid' as GameDifficulty, 5)).toBe('A');
    });
  });

  describe('getLayoutConfig', () => {
    it('유효한 레이아웃 타입의 설정을 반환해야 한다', () => {
      const types: LayoutType[] = ['A', 'A+', 'B', 'C', 'D', 'E'];
      
      types.forEach(type => {
        const config = getLayoutConfig(type);
        expect(config.type).toBe(type);
        expect(config).toBe(LAYOUT_CONFIGS[type]);
      });
    });

    it('반환된 설정이 원본과 동일한 참조여야 한다', () => {
      const configA = getLayoutConfig('A');
      expect(configA).toBe(LAYOUT_CONFIGS['A']);
    });
  });

  describe('getRequiredQueues', () => {
    it('타입 A는 기본 callstack만 반환해야 한다', () => {
      const queues = getRequiredQueues('A');
      expect(queues).toEqual(['callstack']);
    });

    it('타입 A+도 기본 callstack만 반환해야 한다', () => {
      const queues = getRequiredQueues('A+');
      expect(queues).toEqual(['callstack']);
    });

    it('타입 B는 3개 큐를 반환해야 한다', () => {
      const queues = getRequiredQueues('B');
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask']);
    });

    it('타입 C는 5개 큐를 반환해야 한다', () => {
      const queues = getRequiredQueues('C');
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'generator']);
    });

    it('타입 D는 6개 큐를 반환해야 한다', () => {
      const queues = getRequiredQueues('D');
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker']);
    });

    it('타입 E는 기본 callstack만 반환해야 한다', () => {
      const queues = getRequiredQueues('E');
      expect(queues).toEqual(['callstack']);
    });
  });

  describe('getStageQueues', () => {
    it('초급 스테이지는 callstack만 반환해야 한다', () => {
      const queues = getStageQueues('beginner', 5);
      expect(queues).toEqual(['callstack']);
    });

    it('중급 스테이지는 callstack만 반환해야 한다', () => {
      const queues = getStageQueues('intermediate', 12);
      expect(queues).toEqual(['callstack']);
    });

    it('고급 21번 스테이지는 3개 큐를 반환해야 한다', () => {
      const queues = getStageQueues('advanced', 21);
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask']);
    });

    it('고급 23번 스테이지는 5개 큐를 반환해야 한다', () => {
      const queues = getStageQueues('advanced', 23);
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'generator']);
    });

    it('고급 24번 스테이지는 6개 큐를 반환해야 한다', () => {
      const queues = getStageQueues('advanced', 24);
      expect(queues).toEqual(['callstack', 'microtask', 'macrotask', 'animation', 'io', 'worker']);
    });
  });

  describe('getLayoutDescription', () => {
    it('각 레이아웃 타입의 설명을 반환해야 한다', () => {
      expect(getLayoutDescription('A')).toBe('함수 호출 순서 학습');
      expect(getLayoutDescription('A+')).toBe('LIFO 원칙 체득');
      expect(getLayoutDescription('B')).toBe('비동기 + 스택 상태');
      expect(getLayoutDescription('C')).toBe('복잡한 비동기 패턴');
      expect(getLayoutDescription('D')).toBe('모든 개념 통합');
      expect(getLayoutDescription('E')).toBe('실행 단계별 스택 상태 예측');
    });
  });

  describe('getAllLayoutInfo', () => {
    it('모든 레이아웃 설정을 배열로 반환해야 한다', () => {
      const allInfo = getAllLayoutInfo();
      
      expect(Array.isArray(allInfo)).toBe(true);
      expect(allInfo).toHaveLength(6);
      
      const types = allInfo.map(config => config.type);
      expect(types).toContain('A');
      expect(types).toContain('A+');
      expect(types).toContain('B');
      expect(types).toContain('C');
      expect(types).toContain('D');
      expect(types).toContain('E');
    });

    it('반환된 배열의 각 항목이 올바른 구조여야 한다', () => {
      const allInfo = getAllLayoutInfo();
      
      allInfo.forEach(config => {
        expect(config).toHaveProperty('type');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('stages');
        expect(config).toHaveProperty('difficulty');
      });
    });
  });

  describe('getDifficultyLayoutTypes', () => {
    it('초급 난이도는 8개의 A 타입을 반환해야 한다', () => {
      const layouts = getDifficultyLayoutTypes('beginner');
      
      expect(layouts).toHaveLength(8);
      expect(layouts.every(type => type === 'A')).toBe(true);
    });

    it('중급 난이도는 8개의 A+ 타입을 반환해야 한다', () => {
      const layouts = getDifficultyLayoutTypes('intermediate');
      
      expect(layouts).toHaveLength(8);
      expect(layouts.every(type => type === 'A+')).toBe(true);
    });

    it('고급 난이도는 8개의 다양한 타입을 반환해야 한다', () => {
      const layouts = getDifficultyLayoutTypes('advanced');
      
      expect(layouts).toHaveLength(8);
      expect(layouts).toEqual(['E', 'E', 'E', 'E', 'B', 'B', 'C', 'D']);
    });

    it('잘못된 난이도는 빈 배열을 반환해야 한다', () => {
      const layouts = getDifficultyLayoutTypes('invalid' as GameDifficulty);
      expect(layouts).toEqual([]);
    });
  });

  describe('PlayMode 타입', () => {
    it('모든 레이아웃에서 유효한 PlayMode를 사용해야 한다', () => {
      const validPlayModes: PlayMode[] = [
        'order-prediction',
        'start-end-tracking',
        'snapshot-building',
        'queue-states',
        'timeline-snapshot'
      ];

      Object.values(LAYOUT_CONFIGS).forEach(config => {
        expect(validPlayModes).toContain(config.playMode);
      });
    });
  });

  describe('엣지 케이스', () => {
    it('극한 스테이지 번호를 처리해야 한다', () => {
      expect(getLayoutType('beginner', -1)).toBe('A');
      expect(getLayoutType('beginner', 1000)).toBe('A');
      expect(getLayoutType('advanced', 0)).toBe('A');
    });

    it('모든 난이도와 스테이지 조합을 테스트해야 한다', () => {
      const difficulties: GameDifficulty[] = ['beginner', 'intermediate', 'advanced'];
      
      difficulties.forEach(difficulty => {
        for (let stage = 1; stage <= 30; stage++) {
          const layoutType = getLayoutType(difficulty, stage);
          expect(['A', 'A+', 'B', 'C', 'D', 'E']).toContain(layoutType);
        }
      });
    });

    it('모든 레이아웃의 스테이지가 중복되지 않아야 한다', () => {
      const stageToLayout = new Map<number, LayoutType>();
      
      Object.values(LAYOUT_CONFIGS).forEach(config => {
        config.stages.forEach(stage => {
          if (stageToLayout.has(stage)) {
            throw new Error(`Stage ${stage} is defined in multiple layouts`);
          }
          stageToLayout.set(stage, config.type);
        });
      });
      
      // 스테이지 1-24가 모두 정의되어 있는지 확인
      for (let stage = 1; stage <= 24; stage++) {
        expect(stageToLayout.has(stage)).toBe(true);
      }
    });

    it('각 레이아웃의 난이도와 스테이지가 일치해야 한다', () => {
      Object.values(LAYOUT_CONFIGS).forEach(config => {
        config.stages.forEach(stage => {
          config.difficulty.forEach(difficulty => {
            const computedType = getLayoutType(difficulty, stage);
            expect(computedType).toBe(config.type);
          });
        });
      });
    });
  });
});