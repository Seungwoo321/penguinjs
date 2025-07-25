/**
 * 검증 유틸리티
 * 런타임 타입 검증 및 데이터 유효성 검사
 */

import { LayoutType, QueueType } from '../types';

/**
 * 레이아웃 타입 검증
 */
export const isValidLayoutType = (type: unknown): type is LayoutType => {
  return typeof type === 'string' && ['A', 'A+', 'B', 'C', 'D', 'E'].includes(type);
};

/**
 * 큐 타입 검증
 */
export const isValidQueueType = (type: unknown): type is QueueType => {
  return typeof type === 'string' && [
    'callstack',
    'microtask',
    'macrotask',
    'priority',
    'circular',
    'deque',
    'animation',
    'immediate',
    'idle'
  ].includes(type);
};

/**
 * 난이도 검증
 */
export const isValidDifficulty = (difficulty: unknown): difficulty is 'beginner' | 'intermediate' | 'advanced' => {
  return typeof difficulty === 'string' && ['beginner', 'intermediate', 'advanced'].includes(difficulty);
};

/**
 * 스테이지 번호 검증
 */
export const isValidStage = (stage: unknown, maxStage: number = 30): stage is number => {
  return typeof stage === 'number' && stage >= 1 && stage <= maxStage && Number.isInteger(stage);
};

/**
 * 배열 null 체크 및 기본값 반환
 */
export const safeArray = <T>(arr: T[] | null | undefined, defaultValue: T[] = []): T[] => {
  return Array.isArray(arr) ? arr : defaultValue;
};

/**
 * 객체 속성 안전 접근
 */
export const safeGet = <T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined => {
  if (obj && typeof obj === 'object' && key in obj) {
    return obj[key];
  }
  return defaultValue;
};

/**
 * 함수명 검증 및 정규화
 */
export const normalizeFunctionName = (name: unknown): string => {
  if (typeof name !== 'string') return 'unknown';
  
  // 특수문자 제거 및 공백 처리
  const normalized = name.trim().replace(/[^\w\s\(\)\.]/g, '');
  return normalized || 'unknown';
};

/**
 * 스택 오버플로우 체크
 */
export const isStackOverflow = (currentSize: number, maxSize: number): boolean => {
  return currentSize >= maxSize;
};

/**
 * 큐 아이템 ID 생성
 */
export const generateItemId = (prefix: string, timestamp?: number): string => {
  const ts = timestamp || Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${ts}-${random}`;
};

/**
 * 배열 인덱스 안전 접근
 */
export const safeIndex = <T>(arr: T[], index: number, defaultValue?: T): T | undefined => {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index];
};

/**
 * 문자열 길이 제한
 */
export const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 색상값 검증
 */
export const isValidColor = (color: unknown): boolean => {
  if (typeof color !== 'string') return false;
  
  // HEX 색상
  if (/^#[0-9A-F]{6}$/i.test(color)) return true;
  
  // RGB/RGBA
  if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+)?\)$/i.test(color)) return true;
  
  // HSL/HSLA
  if (/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(,\s*[\d.]+)?\)$/i.test(color)) return true;
  
  return false;
};

/**
 * 깊은 객체 병합 (null 안전)
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T | null | undefined,
  source: Partial<T> | null | undefined
): T => {
  if (!target) return (source || {}) as T;
  if (!source) return target;
  
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue as T[typeof key];
      }
    }
  }
  
  return result;
};

/**
 * 함수 실행 시 에러 처리
 */
export const safeTry = async <T>(
  fn: () => T | Promise<T>,
  defaultValue: T,
  onError?: (error: Error) => void
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    }
    return defaultValue;
  }
};

/**
 * 디바운스된 검증 함수
 */
export const createValidator = <T>(
  validateFn: (value: T) => boolean,
  delay: number = 300
): ((value: T) => Promise<boolean>) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (value: T): Promise<boolean> => {
    return new Promise((resolve) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        resolve(validateFn(value));
      }, delay);
    });
  };
};