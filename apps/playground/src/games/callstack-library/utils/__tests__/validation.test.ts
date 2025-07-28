/**
 * validation 유틸리티 단위 테스트
 * 
 * 런타임 타입 검증 및 데이터 유효성 검사 유틸리티들을 검증합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidLayoutType,
  isValidQueueType,
  isValidDifficulty,
  isValidStage,
  safeArray,
  safeGet,
  normalizeFunctionName,
  isStackOverflow,
  generateItemId,
  safeIndex,
  truncateString,
  isValidColor,
  deepMerge,
  safeTry,
  createValidator
} from '../validation';

describe('validation utilities', () => {
  describe('isValidLayoutType', () => {
    it('유효한 레이아웃 타입을 검증해야 한다', () => {
      const validTypes = ['A', 'A+', 'B', 'C', 'D', 'E'];
      
      validTypes.forEach(type => {
        expect(isValidLayoutType(type)).toBe(true);
      });
    });

    it('유효하지 않은 레이아웃 타입을 거부해야 한다', () => {
      const invalidTypes = ['F', 'X', 'AA', '', 123, null, undefined, {}];
      
      invalidTypes.forEach(type => {
        expect(isValidLayoutType(type)).toBe(false);
      });
    });
  });

  describe('isValidQueueType', () => {
    it('유효한 큐 타입을 검증해야 한다', () => {
      const validTypes = [
        'callstack', 'microtask', 'macrotask', 'priority',
        'circular', 'deque', 'animation', 'immediate', 'idle'
      ];
      
      validTypes.forEach(type => {
        expect(isValidQueueType(type)).toBe(true);
      });
    });

    it('유효하지 않은 큐 타입을 거부해야 한다', () => {
      const invalidTypes = ['invalid', 'stack', '', 123, null, undefined, {}];
      
      invalidTypes.forEach(type => {
        expect(isValidQueueType(type)).toBe(false);
      });
    });
  });

  describe('isValidDifficulty', () => {
    it('유효한 난이도를 검증해야 한다', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      
      validDifficulties.forEach(difficulty => {
        expect(isValidDifficulty(difficulty)).toBe(true);
      });
    });

    it('유효하지 않은 난이도를 거부해야 한다', () => {
      const invalidDifficulties = ['easy', 'hard', 'expert', '', 123, null, undefined];
      
      invalidDifficulties.forEach(difficulty => {
        expect(isValidDifficulty(difficulty)).toBe(false);
      });
    });
  });

  describe('isValidStage', () => {
    it('유효한 스테이지 번호를 검증해야 한다', () => {
      expect(isValidStage(1)).toBe(true);
      expect(isValidStage(15)).toBe(true);
      expect(isValidStage(30)).toBe(true);
    });

    it('유효하지 않은 스테이지 번호를 거부해야 한다', () => {
      expect(isValidStage(0)).toBe(false);
      expect(isValidStage(-1)).toBe(false);
      expect(isValidStage(31)).toBe(false);
      expect(isValidStage(1.5)).toBe(false);
      expect(isValidStage('1' as any)).toBe(false);
      expect(isValidStage(null)).toBe(false);
      expect(isValidStage(undefined)).toBe(false);
    });

    it('커스텀 최대 스테이지를 처리해야 한다', () => {
      expect(isValidStage(50, 100)).toBe(true);
      expect(isValidStage(101, 100)).toBe(false);
    });
  });

  describe('safeArray', () => {
    it('유효한 배열을 그대로 반환해야 한다', () => {
      const testArray = [1, 2, 3];
      expect(safeArray(testArray)).toBe(testArray);
    });

    it('null이나 undefined에 대해 기본값을 반환해야 한다', () => {
      expect(safeArray(null)).toEqual([]);
      expect(safeArray(undefined)).toEqual([]);
    });

    it('커스텀 기본값을 사용할 수 있어야 한다', () => {
      const defaultValue = ['default'];
      expect(safeArray(null, defaultValue)).toBe(defaultValue);
    });

    it('배열이 아닌 값에 대해 기본값을 반환해야 한다', () => {
      expect(safeArray('not an array' as any)).toEqual([]);
      expect(safeArray(123 as any)).toEqual([]);
      expect(safeArray({} as any)).toEqual([]);
    });
  });

  describe('safeGet', () => {
    const testObj = {
      name: 'test',
      value: 42,
      nested: { deep: 'value' }
    };

    it('존재하는 속성을 반환해야 한다', () => {
      expect(safeGet(testObj, 'name')).toBe('test');
      expect(safeGet(testObj, 'value')).toBe(42);
    });

    it('존재하지 않는 속성에 대해 undefined를 반환해야 한다', () => {
      expect(safeGet(testObj, 'nonexistent' as any)).toBeUndefined();
    });

    it('null이나 undefined 객체에 대해 기본값을 반환해야 한다', () => {
      expect(safeGet(null, 'name')).toBeUndefined();
      expect(safeGet(undefined, 'name')).toBeUndefined();
      expect(safeGet(null, 'name', 'default')).toBe('default');
    });

    it('객체가 아닌 값에 대해 기본값을 반환해야 한다', () => {
      expect(safeGet('string' as any, 'length', 'default')).toBe('default');
      expect(safeGet(123 as any, 'toString', 'default')).toBe('default');
    });
  });

  describe('normalizeFunctionName', () => {
    it('정상적인 함수명을 정리해야 한다', () => {
      expect(normalizeFunctionName('myFunction')).toBe('myFunction');
      expect(normalizeFunctionName('  trimMe  ')).toBe('trimMe');
      expect(normalizeFunctionName('console.log')).toBe('console.log');
      expect(normalizeFunctionName('func()')).toBe('func()');
    });

    it('특수문자를 제거해야 한다', () => {
      expect(normalizeFunctionName('func@#$%')).toBe('func');
      expect(normalizeFunctionName('my-function')).toBe('myfunction');
      expect(normalizeFunctionName('func*&^%')).toBe('func');
    });

    it('문자열이 아닌 값에 대해 unknown을 반환해야 한다', () => {
      expect(normalizeFunctionName(123)).toBe('unknown');
      expect(normalizeFunctionName(null)).toBe('unknown');
      expect(normalizeFunctionName(undefined)).toBe('unknown');
      expect(normalizeFunctionName({})).toBe('unknown');
    });

    it('빈 문자열이나 공백만 있는 경우 unknown을 반환해야 한다', () => {
      expect(normalizeFunctionName('')).toBe('unknown');
      expect(normalizeFunctionName('   ')).toBe('unknown');
      expect(normalizeFunctionName('@#$%')).toBe('unknown');
    });
  });

  describe('isStackOverflow', () => {
    it('스택 오버플로우를 올바르게 감지해야 한다', () => {
      expect(isStackOverflow(100, 100)).toBe(true);
      expect(isStackOverflow(101, 100)).toBe(true);
      expect(isStackOverflow(99, 100)).toBe(false);
      expect(isStackOverflow(0, 100)).toBe(false);
    });

    it('경계값을 올바르게 처리해야 한다', () => {
      expect(isStackOverflow(0, 0)).toBe(true);
      expect(isStackOverflow(1, 1)).toBe(true);
      expect(isStackOverflow(0, 1)).toBe(false);
    });
  });

  describe('generateItemId', () => {
    it('고유한 ID를 생성해야 한다', () => {
      const id1 = generateItemId('test');
      const id2 = generateItemId('test');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+-[a-z0-9]{7}$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]{7}$/);
    });

    it('커스텀 타임스탬프를 사용할 수 있어야 한다', () => {
      const timestamp = 1234567890;
      const id = generateItemId('custom', timestamp);
      
      expect(id).toMatch(/^custom-1234567890-[a-z0-9]{7}$/);
    });

    it('다른 프리픽스로 다른 ID를 생성해야 한다', () => {
      const id1 = generateItemId('prefix1');
      const id2 = generateItemId('prefix2');
      
      expect(id1.startsWith('prefix1-')).toBe(true);
      expect(id2.startsWith('prefix2-')).toBe(true);
    });
  });

  describe('safeIndex', () => {
    const testArray = ['a', 'b', 'c'];

    it('유효한 인덱스의 값을 반환해야 한다', () => {
      expect(safeIndex(testArray, 0)).toBe('a');
      expect(safeIndex(testArray, 1)).toBe('b');
      expect(safeIndex(testArray, 2)).toBe('c');
    });

    it('유효하지 않은 인덱스에 대해 기본값을 반환해야 한다', () => {
      expect(safeIndex(testArray, -1)).toBeUndefined();
      expect(safeIndex(testArray, 3)).toBeUndefined();
      expect(safeIndex(testArray, -1, 'default')).toBe('default');
      expect(safeIndex(testArray, 3, 'default')).toBe('default');
    });

    it('배열이 아닌 값에 대해 기본값을 반환해야 한다', () => {
      expect(safeIndex(null as any, 0)).toBeUndefined();
      expect(safeIndex('string' as any, 0)).toBeUndefined();
      expect(safeIndex({} as any, 0, 'default')).toBe('default');
    });
  });

  describe('truncateString', () => {
    it('짧은 문자열을 그대로 반환해야 한다', () => {
      expect(truncateString('short', 10)).toBe('short');
      expect(truncateString('exact', 5)).toBe('exact');
    });

    it('긴 문자열을 자르고 접미사를 추가해야 한다', () => {
      expect(truncateString('this is a long string', 10)).toBe('this is...');
      expect(truncateString('this is a long string', 10, '…')).toBe('this is a…');
    });

    it('접미사 길이를 고려해야 한다', () => {
      expect(truncateString('hello world', 8)).toBe('hello...');
      expect(truncateString('hello world', 8, '---')).toBe('hello---');
    });

    it('매우 짧은 최대 길이를 처리해야 한다', () => {
      expect(truncateString('hello', 3)).toBe('...');
      expect(truncateString('hello', 1, '!')).toBe('!');
    });
  });

  describe('isValidColor', () => {
    it('HEX 색상을 검증해야 한다', () => {
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#FFFFFF')).toBe(true);
      expect(isValidColor('#3b82f6')).toBe(true);
      expect(isValidColor('#ABC123')).toBe(true);
    });

    it('RGB/RGBA 색상을 검증해야 한다', () => {
      expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
      expect(isValidColor('rgb(0,255,0)')).toBe(true);
      expect(isValidColor('rgba(0, 0, 255, 0.5)')).toBe(true);
      expect(isValidColor('rgba(255,255,255,1)')).toBe(true);
    });

    it('HSL/HSLA 색상을 검증해야 한다', () => {
      expect(isValidColor('hsl(360, 100%, 50%)')).toBe(true);
      expect(isValidColor('hsl(0,0%,0%)')).toBe(true);
      expect(isValidColor('hsla(180, 50%, 25%, 0.8)')).toBe(true);
      expect(isValidColor('hsla(240,100%,100%,1)')).toBe(true);
    });

    it('유효하지 않은 색상을 거부해야 한다', () => {
      expect(isValidColor('invalid')).toBe(false);
      expect(isValidColor('#GGGGGG')).toBe(false);
      expect(isValidColor('#12345')).toBe(false);
      expect(isValidColor('#1234567')).toBe(false); // 7자리 HEX
      expect(isValidColor('rgb(a, 0, 0)')).toBe(false); // 문자가 포함된 RGB
      expect(isValidColor('hsl(abc, 100%, 50%)')).toBe(false); // 문자가 포함된 HSL
      expect(isValidColor('rgb( 255, 255, 255 )')).toBe(false); // 앞뒤 공백
      expect(isValidColor('hsl( 180, 50%, 25% )')).toBe(false); // 앞뒤 공백
      expect(isValidColor(123)).toBe(false);
      expect(isValidColor(null)).toBe(false);
      expect(isValidColor(undefined)).toBe(false);
    });
  });

  describe('deepMerge', () => {
    it('두 객체를 병합해야 한다', () => {
      const target = { a: 1, b: { x: 1, y: 2 } };
      const source = { b: { y: 3, z: 4 }, c: 3 };
      
      const result = deepMerge(target, source);
      
      expect(result).toEqual({
        a: 1,
        b: { x: 1, y: 3, z: 4 },
        c: 3
      });
    });

    it('null이나 undefined 대상을 처리해야 한다', () => {
      const source = { a: 1, b: 2 };
      
      expect(deepMerge(null, source)).toEqual(source);
      expect(deepMerge(undefined, source)).toEqual(source);
    });

    it('null이나 undefined 소스를 처리해야 한다', () => {
      const target = { a: 1, b: 2 };
      
      expect(deepMerge(target, null)).toEqual(target);
      expect(deepMerge(target, undefined)).toEqual(target);
    });

    it('배열을 값으로 교체해야 한다', () => {
      const target = { arr: [1, 2, 3] };
      const source = { arr: [4, 5, 6] };
      
      const result = deepMerge(target, source);
      expect(result.arr).toEqual([4, 5, 6]);
    });

    it('원본 객체를 변경하지 않아야 한다', () => {
      const target = { a: 1, b: { x: 1 } };
      const source = { b: { y: 2 } };
      
      const result = deepMerge(target, source);
      
      expect(target.b).toEqual({ x: 1 });
      expect(result.b).toEqual({ x: 1, y: 2 });
    });
  });

  describe('safeTry', () => {
    it('성공적인 함수 실행 결과를 반환해야 한다', async () => {
      const result = await safeTry(() => 'success', 'default');
      expect(result).toBe('success');
    });

    it('Promise를 반환하는 함수를 처리해야 한다', async () => {
      const result = await safeTry(() => Promise.resolve('async success'), 'default');
      expect(result).toBe('async success');
    });

    it('에러 발생 시 기본값을 반환해야 한다', async () => {
      const result = await safeTry(() => {
        throw new Error('test error');
      }, 'default');
      
      expect(result).toBe('default');
    });

    it('에러 핸들러를 호출해야 한다', async () => {
      const errorHandler = vi.fn();
      
      await safeTry(() => {
        throw new Error('test error');
      }, 'default', errorHandler);
      
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('Promise rejection을 처리해야 한다', async () => {
      const result = await safeTry(() => Promise.reject(new Error('async error')), 'default');
      expect(result).toBe('default');
    });

    it('Error가 아닌 예외를 처리해야 한다', async () => {
      const errorHandler = vi.fn();
      
      const result = await safeTry(() => {
        throw 'string error';
      }, 'default', errorHandler);
      
      expect(result).toBe('default');
      expect(errorHandler).not.toHaveBeenCalled(); // Error 인스턴스가 아니므로 호출되지 않음
    });
  });

  describe('createValidator', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('디바운스된 검증 함수를 생성해야 한다', async () => {
      const validateFn = vi.fn().mockReturnValue(true);
      const validator = createValidator(validateFn, 100);
      
      const promise = validator('test');
      
      expect(validateFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(100);
      const result = await promise;
      
      expect(validateFn).toHaveBeenCalledWith('test');
      expect(result).toBe(true);
    });

    it('연속 호출 시 이전 호출을 취소해야 한다', async () => {
      const validateFn = vi.fn().mockReturnValue(true);
      const validator = createValidator(validateFn, 100);
      
      validator('test1'); // 첫 번째 호출
      const promise2 = validator('test2'); // 두 번째 호출이 첫 번째를 취소
      
      vi.advanceTimersByTime(100);
      await promise2;
      
      expect(validateFn).toHaveBeenCalledTimes(1);
      expect(validateFn).toHaveBeenCalledWith('test2');
    });

    it('기본 지연시간을 사용해야 한다', async () => {
      const validateFn = vi.fn().mockReturnValue(false);
      const validator = createValidator(validateFn); // 기본값 300ms
      
      const promise = validator('test');
      
      vi.advanceTimersByTime(299);
      expect(validateFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(1);
      const result = await promise;
      
      expect(validateFn).toHaveBeenCalledWith('test');
      expect(result).toBe(false);
    });

    it('다른 값으로 여러 번 호출할 수 있어야 한다', async () => {
      const validateFn = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const validator = createValidator(validateFn, 50);
      
      const promise1 = validator('test1');
      vi.advanceTimersByTime(50);
      const result1 = await promise1;
      
      const promise2 = validator('test2');
      vi.advanceTimersByTime(50);
      const result2 = await promise2;
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(validateFn).toHaveBeenCalledTimes(2);
    });
  });
});