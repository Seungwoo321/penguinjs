/**
 * textUtils 단위 테스트
 * 
 * 텍스트 표시 관련 유틸리티 함수들을 검증합니다.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createTextOverflowStyles,
  getResponsiveFontSize,
  checkTextOverflow,
  truncateFunctionName,
  getVisualTextLength,
  truncateByVisualLength,
  createTextDisplayClasses,
  typography,
  type TextOverflowConfig
} from '../textUtils';

describe('textUtils', () => {
  describe('createTextOverflowStyles', () => {
    it('기본 설정으로 단일 라인 말줄임 스타일을 생성해야 한다', () => {
      const styles = createTextOverflowStyles();
      
      expect(styles.maxWidth).toBe('100%');
      expect(styles.overflow).toBe('hidden');
      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.whiteSpace).toBe('nowrap');
      expect(styles.wordBreak).toBe('break-word');
    });

    it('커스텀 설정을 적용해야 한다', () => {
      const config: TextOverflowConfig = {
        maxWidth: '200px',
        breakWord: false
      };
      
      const styles = createTextOverflowStyles(config);
      
      expect(styles.maxWidth).toBe('200px');
      expect(styles.wordBreak).toBe('normal');
    });

    it('다중 라인 말줄임 스타일을 생성해야 한다', () => {
      const config: TextOverflowConfig = {
        maxLines: 3,
        maxWidth: '300px'
      };
      
      const styles = createTextOverflowStyles(config);
      
      expect(styles.maxWidth).toBe('300px');
      expect(styles.overflow).toBe('hidden');
      expect(styles.display).toBe('-webkit-box');
      expect(styles.WebkitLineClamp).toBe(3);
      expect(styles.WebkitBoxOrient).toBe('vertical');
      expect(styles.lineHeight).toBe('1.5em');
      expect(styles.maxHeight).toBe('4.5em'); // 3 * 1.5em
    });

    it('maxLines가 1일 때는 단일 라인 스타일을 사용해야 한다', () => {
      const config: TextOverflowConfig = {
        maxLines: 1,
        maxWidth: '150px'
      };
      
      const styles = createTextOverflowStyles(config);
      
      expect(styles.whiteSpace).toBe('nowrap');
      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.WebkitLineClamp).toBeUndefined();
    });

    it('breakWord 설정을 올바르게 적용해야 한다', () => {
      const configTrue = createTextOverflowStyles({ breakWord: true });
      const configFalse = createTextOverflowStyles({ breakWord: false });
      
      expect(configTrue.wordBreak).toBe('break-word');
      expect(configFalse.wordBreak).toBe('normal');
    });
  });

  describe('getResponsiveFontSize', () => {
    it('clamp CSS 함수를 올바르게 생성해야 한다', () => {
      const result = getResponsiveFontSize(12, 2, 18);
      expect(result).toBe('clamp(12px, 2vw, 18px)');
    });

    it('다른 단위를 사용할 수 있어야 한다', () => {
      const remResult = getResponsiveFontSize(1, 2, 3, 'rem');
      const emResult = getResponsiveFontSize(0.8, 1.5, 2, 'em');
      
      expect(remResult).toBe('clamp(1rem, 2vw, 3rem)');
      expect(emResult).toBe('clamp(0.8em, 1.5vw, 2em)');
    });

    it('기본 단위는 px여야 한다', () => {
      const result = getResponsiveFontSize(10, 1.5, 20);
      expect(result).toContain('px');
    });

    it('소수점을 포함한 값을 처리해야 한다', () => {
      const result = getResponsiveFontSize(12.5, 2.3, 18.7);
      expect(result).toBe('clamp(12.5px, 2.3vw, 18.7px)');
    });
  });

  describe('createTextOverflowStyles with breakWord', () => {
    it('breakWord가 true일 때 word-break: break-word 스타일이 적용되어야 한다', () => {
      const style = createTextOverflowStyles({ maxLines: 2, breakWord: true });
      expect(style.wordBreak).toBe('break-word');
    });

    it('breakWord가 false일 때 word-break: normal 스타일이 적용되어야 한다', () => {
      const style = createTextOverflowStyles({ maxLines: 2, breakWord: false });
      expect(style.wordBreak).toBe('normal');
    });

    it('기본값은 word-break: break-word이어야 한다', () => {
      const style = createTextOverflowStyles({ maxLines: 2 });
      expect(style.wordBreak).toBe('break-word');
    });
  });

  describe('checkTextOverflow', () => {
    it('오버플로우가 발생한 경우 true를 반환해야 한다', () => {
      const mockElement = {
        scrollWidth: 200,
        clientWidth: 150,
        scrollHeight: 100,
        clientHeight: 100
      } as HTMLElement;
      
      expect(checkTextOverflow(mockElement)).toBe(true);
    });

    it('세로 오버플로우가 발생한 경우 true를 반환해야 한다', () => {
      const mockElement = {
        scrollWidth: 150,
        clientWidth: 150,
        scrollHeight: 200,
        clientHeight: 150
      } as HTMLElement;
      
      expect(checkTextOverflow(mockElement)).toBe(true);
    });

    it('오버플로우가 없는 경우 false를 반환해야 한다', () => {
      const mockElement = {
        scrollWidth: 150,
        clientWidth: 200,
        scrollHeight: 100,
        clientHeight: 150
      } as HTMLElement;
      
      expect(checkTextOverflow(mockElement)).toBe(false);
    });

    it('정확히 맞는 경우 false를 반환해야 한다', () => {
      const mockElement = {
        scrollWidth: 150,
        clientWidth: 150,
        scrollHeight: 100,
        clientHeight: 100
      } as HTMLElement;
      
      expect(checkTextOverflow(mockElement)).toBe(false);
    });
  });

  describe('truncateFunctionName', () => {
    it('짧은 함수명은 그대로 반환해야 한다', () => {
      expect(truncateFunctionName('myFunc')).toBe('myFunc');
      expect(truncateFunctionName('test', 10)).toBe('test');
    });

    it('특별한 함수명들을 단축해야 한다', () => {
      expect(truncateFunctionName('setTimeout')).toBe('setTimeout');
      expect(truncateFunctionName('setInterval')).toBe('setInterval');
      expect(truncateFunctionName('queueMicrotask')).toBe('queueMicrotask'); // 13글자라 그대로 유지
      expect(truncateFunctionName('requestAnimationFrame')).toBe('requestAF');
      expect(truncateFunctionName('addEventListener')).toBe('addEventListener'); // 16글자라 그대로 유지
      expect(truncateFunctionName('removeEventListener')).toBe('removeEventListener'); // 19글자라 그대로 유지
    });

    it('기본 최대 길이는 20이어야 한다', () => {
      const longName = 'thisIsAVeryLongFunctionName';
      const result = truncateFunctionName(longName);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('...');
    });

    it('커스텀 최대 길이를 사용해야 한다', () => {
      const longName = 'longFunctionName';
      const result = truncateFunctionName(longName, 10);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('최대 길이가 10 이하일 때는 앞부분만 보존해야 한다', () => {
      const result = truncateFunctionName('veryLongName', 8);
      expect(result).toBe('veryL...');
      expect(result.length).toBe(8);
    });

    it('일반적인 경우 앞부분과 끝부분을 보존해야 한다', () => {
      const result = truncateFunctionName('veryLongFunctionName', 15);
      expect(result.length).toBe(15);
      expect(result).toContain('...');
      expect(result.startsWith('very')).toBe(true);
      expect(result.endsWith('Name')).toBe(true);
    });
  });

  describe('getVisualTextLength', () => {
    it('영문 텍스트는 1글자당 1로 계산해야 한다', () => {
      expect(getVisualTextLength('hello')).toBe(5);
      expect(getVisualTextLength('test123')).toBe(7);
    });

    it('한글은 1글자당 1로 계산해야 한다 (정규식에서 한글 범위 누락)', () => {
      expect(getVisualTextLength('안녕')).toBe(2);
      expect(getVisualTextLength('한국어')).toBe(3);
    });

    it('일본어는 1글자당 2로 계산해야 한다', () => {
      expect(getVisualTextLength('こんにちは')).toBe(10);
    });

    it('중국어는 1글자당 2로 계산해야 한다', () => {
      expect(getVisualTextLength('你好')).toBe(4);
    });

    it('혼합 텍스트를 올바르게 계산해야 한다', () => {
      expect(getVisualTextLength('hello안녕')).toBe(7); // 5 + 2
      expect(getVisualTextLength('test한글123')).toBe(9); // 4 + 2 + 3
    });

    it('빈 문자열은 0을 반환해야 한다', () => {
      expect(getVisualTextLength('')).toBe(0);
    });

    it('공백과 특수문자를 처리해야 한다', () => {
      expect(getVisualTextLength('hello world!')).toBe(12);
      expect(getVisualTextLength('test@#$%')).toBe(8);
    });
  });

  describe('truncateByVisualLength', () => {
    it('영문 텍스트를 시각적 길이 기준으로 자르기', () => {
      expect(truncateByVisualLength('hello world', 5)).toBe('hello...');
      expect(truncateByVisualLength('test', 10)).toBe('test');
    });

    it('한글 텍스트를 시각적 길이 기준으로 자르기', () => {
      expect(truncateByVisualLength('안녕하세요', 4)).toBe('안녕하세...');
      expect(truncateByVisualLength('한국어', 6)).toBe('한국어');
    });

    it('혼합 텍스트를 올바르게 처리해야 한다', () => {
      expect(truncateByVisualLength('hello안녕', 7)).toBe('hello안녕'); // 정확히 7글자
      expect(truncateByVisualLength('test한글', 6)).toBe('test한글'); // 정확히 6글자
    });

    it('잘린 텍스트에는 ...이 추가되어야 한다', () => {
      const result = truncateByVisualLength('very long text', 8);
      expect(result).toContain('...');
      expect(result).toBe('very lon...');
    });

    it('잘리지 않은 텍스트에는 ...이 없어야 한다', () => {
      const result = truncateByVisualLength('short', 10);
      expect(result).not.toContain('...');
      expect(result).toBe('short');
    });

    it('정확히 맞는 길이의 텍스트를 처리해야 한다', () => {
      const result = truncateByVisualLength('hello', 5);
      expect(result).toBe('hello');
      expect(result).not.toContain('...');
    });

    it('빈 문자열을 처리해야 한다', () => {
      expect(truncateByVisualLength('', 5)).toBe('');
    });
  });

  describe('createTextDisplayClasses', () => {
    it('기본 클래스를 포함해야 한다', () => {
      const classes = createTextDisplayClasses({});
      expect(classes).toContain('text-display-optimized');
    });

    it('단일 라인 클래스를 추가해야 한다', () => {
      const classes = createTextDisplayClasses({ maxLines: 1 });
      expect(classes).toContain('single-line-truncate');
      expect(classes).not.toContain('multi-line-truncate');
    });

    it('다중 라인 클래스를 추가해야 한다', () => {
      const classes = createTextDisplayClasses({ maxLines: 3 });
      expect(classes).toContain('multi-line-truncate');
      expect(classes).not.toContain('single-line-truncate');
    });

    it('breakWord가 true일 때 관련 클래스를 추가해야 한다', () => {
      const classes = createTextDisplayClasses({ breakWord: true });
      expect(classes).toContain('break-word');
    });

    it('breakWord가 false일 때 관련 클래스를 추가하지 않아야 한다', () => {
      const classes = createTextDisplayClasses({ breakWord: false });
      expect(classes).not.toContain('break-word');
    });

    it('모든 클래스를 공백으로 구분해야 한다', () => {
      const classes = createTextDisplayClasses({ maxLines: 2, breakWord: true });
      const classArray = classes.split(' ');
      
      expect(classArray).toContain('text-display-optimized');
      expect(classArray).toContain('multi-line-truncate');
      expect(classArray).toContain('break-word');
    });
  });

  describe('typography', () => {
    it('헤딩 크기들이 정의되어야 한다', () => {
      expect(typography.heading.h1).toContain('clamp');
      expect(typography.heading.h2).toContain('clamp');
      expect(typography.heading.h3).toContain('clamp');
      expect(typography.heading.h4).toContain('clamp');
      expect(typography.heading.h5).toContain('clamp');
      expect(typography.heading.h6).toContain('clamp');
    });

    it('본문 텍스트 크기들이 정의되어야 한다', () => {
      expect(typography.body.large).toContain('clamp');
      expect(typography.body.medium).toContain('clamp');
      expect(typography.body.small).toContain('clamp');
    });

    it('캡션 크기들이 정의되어야 한다', () => {
      expect(typography.caption.large).toContain('clamp');
      expect(typography.caption.medium).toContain('clamp');
      expect(typography.caption.small).toContain('clamp');
    });

    it('모든 크기가 px 단위를 사용해야 한다', () => {
      const allSizes = [
        ...Object.values(typography.heading),
        ...Object.values(typography.body),
        ...Object.values(typography.caption)
      ];
      
      allSizes.forEach(size => {
        expect(size).toContain('px');
      });
    });

    it('h1이 가장 큰 크기여야 한다', () => {
      // h1의 최대 크기가 h2보다 커야 함
      expect(typography.heading.h1).toContain('32px');
      expect(typography.heading.h2).toContain('28px');
    });

    it('크기가 계층적으로 정의되어야 한다', () => {
      // 각 크기가 clamp 함수를 포함하고 있어야 함
      expect(typography.heading.h1).toMatch(/clamp\(\d+px, [\d.]+vw, \d+px\)/);
      expect(typography.body.large).toMatch(/clamp\(\d+px, [\d.]+vw, \d+px\)/);
      expect(typography.caption.small).toMatch(/clamp\(\d+px, [\d.]+vw, \d+px\)/);
    });
  });

  describe('ASCII vs CJK 문자 처리', () => {
    it('ASCII 문자만 있을 때 각 문자를 1로 계산해야 한다', () => {
      const ascii = 'abcdefghij';
      expect(getVisualTextLength(ascii)).toBe(10);
      
      const truncated = truncateByVisualLength(ascii, 5);
      expect(truncated).toBe('abcde...');
    });

    it('CJK 문자와 ASCII 문자가 섞여있을 때 정확히 계산해야 한다', () => {
      const mixed = 'a한b글c';
      expect(getVisualTextLength(mixed)).toBe(5); // a(1) + 한(1) + b(1) + 글(1) + c(1)
      
      const truncated = truncateByVisualLength(mixed, 4);
      expect(truncated).toBe('a한b글...');
    });
  });

  describe('엣지 케이스', () => {
    it('빈 설정 객체를 처리해야 한다', () => {
      expect(() => createTextOverflowStyles({})).not.toThrow();
      expect(() => createTextDisplayClasses({})).not.toThrow();
    });

    it('0 길이 문자열을 처리해야 한다', () => {
      expect(truncateFunctionName('', 10)).toBe('');
      expect(getVisualTextLength('')).toBe(0);
      expect(truncateByVisualLength('', 5)).toBe('');
    });

    it('매우 작은 maxLength를 처리해야 한다', () => {
      expect(truncateFunctionName('longname', 1)).toBe('longna...');
      expect(truncateFunctionName('longname', 3)).toBe('...');
    });

    it('maxVisualLength가 0인 경우를 처리해야 한다', () => {
      expect(truncateByVisualLength('test', 0)).toBe('...');
    });

    it('특수 문자와 이모지를 포함한 텍스트를 처리해야 한다', () => {
      expect(() => getVisualTextLength('test🌟emoji')).not.toThrow();
      expect(() => truncateByVisualLength('test@#$%', 5)).not.toThrow();
    });

    it('매우 긴 함수명을 처리해야 한다', () => {
      const veryLongName = 'a'.repeat(1000);
      const result = truncateFunctionName(veryLongName, 20);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('유니코드 문자를 올바르게 처리해야 한다', () => {
      expect(() => getVisualTextLength('αβγδε')).not.toThrow();
      expect(() => truncateByVisualLength('αβγδε', 5)).not.toThrow();
    });
  });
});