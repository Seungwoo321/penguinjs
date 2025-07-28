/**
 * ariaUtils 단위 테스트
 * 
 * WCAG 2.1 AA 준수를 위한 접근성 속성 관리 유틸리티들을 검증합니다.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createAriaAttributes,
  createLiveRegionAttributes,
  createProgressAttributes,
  createTabAttributes,
  createDialogAttributes,
  createButtonGroupAttributes,
  createListAttributes,
  createListItemAttributes,
  createAlertAttributes,
  isFocusable,
  isHighContrastMode,
  isPrefersReducedMotion,
  isScreenReaderActive,
  CALLSTACK_LIBRARY_ARIA_LABELS,
  SR_ONLY_CLASS,
  srOnlyStyles,
  focusRingStyles,
  type AriaRole,
  type AriaAttributes
} from '../ariaUtils';

// Mock DOM API
const mockMatchMedia = vi.fn();
const mockDocument = {
  body: {
    getAttribute: vi.fn()
  },
  documentElement: {
    getAttribute: vi.fn()
  }
};

beforeEach(() => {
  vi.stubGlobal('window', {
    matchMedia: mockMatchMedia
  });
  vi.stubGlobal('document', mockDocument);
  vi.stubGlobal('navigator', {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('ariaUtils', () => {
  describe('createAriaAttributes', () => {
    it('기본 ARIA 속성을 생성해야 한다', () => {
      const attributes = createAriaAttributes('button', 'Click me');
      
      expect(attributes).toEqual({
        role: 'button',
        'aria-label': 'Click me'
      });
    });

    it('추가 속성을 포함해야 한다', () => {
      const additionalProps = {
        'aria-disabled': true,
        'aria-pressed': false
      };
      
      const attributes = createAriaAttributes('button', 'Toggle button', additionalProps);
      
      expect(attributes).toEqual({
        role: 'button',
        'aria-label': 'Toggle button',
        'aria-disabled': true,
        'aria-pressed': false
      });
    });

    it('다양한 역할을 지원해야 한다', () => {
      const roles: AriaRole[] = ['navigation', 'main', 'dialog', 'alert'];
      
      roles.forEach(role => {
        const attributes = createAriaAttributes(role, `${role} element`);
        expect(attributes.role).toBe(role);
        expect(attributes['aria-label']).toBe(`${role} element`);
      });
    });
  });

  describe('createLiveRegionAttributes', () => {
    it('기본 라이브 리전 속성을 생성해야 한다', () => {
      const attributes = createLiveRegionAttributes();
      
      expect(attributes).toEqual({
        'aria-live': 'polite',
        'aria-atomic': true
      });
    });

    it('assertive 라이브 리전을 생성해야 한다', () => {
      const attributes = createLiveRegionAttributes('assertive', false);
      
      expect(attributes).toEqual({
        'aria-live': 'assertive',
        'aria-atomic': false
      });
    });

    it('off 상태의 라이브 리전을 생성해야 한다', () => {
      const attributes = createLiveRegionAttributes('off' as any);
      
      expect(attributes['aria-live']).toBe('off');
    });
  });

  describe('createProgressAttributes', () => {
    it('진행률 속성을 생성해야 한다', () => {
      const attributes = createProgressAttributes(30, 100, 'Loading progress');
      
      expect(attributes).toEqual({
        role: 'progressbar',
        'aria-label': 'Loading progress',
        'aria-valuenow': 30,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuetext': '30/100'
      });
    });

    it('완료된 진행률을 처리해야 한다', () => {
      const attributes = createProgressAttributes(100, 100, 'Completed');
      
      expect(attributes['aria-valuenow']).toBe(100);
      expect(attributes['aria-valuemax']).toBe(100);
      expect(attributes['aria-valuetext']).toBe('100/100');
    });

    it('0% 진행률을 처리해야 한다', () => {
      const attributes = createProgressAttributes(0, 50, 'Starting');
      
      expect(attributes['aria-valuenow']).toBe(0);
      expect(attributes['aria-valuemin']).toBe(0);
      expect(attributes['aria-valuetext']).toBe('0/50');
    });
  });

  describe('createTabAttributes', () => {
    it('선택된 탭 속성을 생성해야 한다', () => {
      const attributes = createTabAttributes(true, 'tab1', 'panel1', 'First Tab');
      
      expect(attributes).toEqual({
        role: 'tab',
        'aria-selected': true,
        'aria-controls': 'panel1',
        'aria-label': 'First Tab',
        id: 'tab1',
        tabIndex: 0
      });
    });

    it('선택되지 않은 탭 속성을 생성해야 한다', () => {
      const attributes = createTabAttributes(false, 'tab2', 'panel2', 'Second Tab');
      
      expect(attributes).toEqual({
        role: 'tab',
        'aria-selected': false,
        'aria-controls': 'panel2',
        'aria-label': 'Second Tab',
        id: 'tab2',
        tabIndex: -1
      });
    });
  });

  describe('createDialogAttributes', () => {
    it('기본 다이얼로그 속성을 생성해야 한다', () => {
      const attributes = createDialogAttributes('Settings Dialog');
      
      expect(attributes).toEqual({
        role: 'dialog',
        'aria-label': 'Settings Dialog',
        'aria-modal': true
      });
    });

    it('설명이 있는 다이얼로그 속성을 생성해야 한다', () => {
      const attributes = createDialogAttributes('Confirmation Dialog', 'description1');
      
      expect(attributes).toEqual({
        role: 'dialog',
        'aria-label': 'Confirmation Dialog',
        'aria-modal': true,
        'aria-describedby': 'description1'
      });
    });
  });

  describe('createButtonGroupAttributes', () => {
    it('기본 버튼 그룹 속성을 생성해야 한다', () => {
      const attributes = createButtonGroupAttributes('Action Buttons');
      
      expect(attributes).toEqual({
        role: 'group',
        'aria-label': 'Action Buttons',
        'aria-orientation': 'horizontal'
      });
    });

    it('수직 버튼 그룹 속성을 생성해야 한다', () => {
      const attributes = createButtonGroupAttributes('Vertical Actions', 'vertical');
      
      expect(attributes).toEqual({
        role: 'group',
        'aria-label': 'Vertical Actions',
        'aria-orientation': 'vertical'
      });
    });
  });

  describe('createListAttributes', () => {
    it('기본 리스트 속성을 생성해야 한다', () => {
      const attributes = createListAttributes('Navigation Menu');
      
      expect(attributes).toEqual({
        role: 'list',
        'aria-label': 'Navigation Menu'
      });
    });

    it('크기가 지정된 리스트 속성을 생성해야 한다', () => {
      const attributes = createListAttributes('Items List', 5);
      
      expect(attributes).toEqual({
        role: 'list',
        'aria-label': 'Items List',
        'aria-setsize': 5
      });
    });

    it('0 크기 리스트를 처리해야 한다', () => {
      const attributes = createListAttributes('Empty List', 0);
      
      expect(attributes['aria-setsize']).toBe(0);
    });
  });

  describe('createListItemAttributes', () => {
    it('리스트 아이템 속성을 생성해야 한다', () => {
      const attributes = createListItemAttributes(2, 5, 'Second Item');
      
      expect(attributes).toEqual({
        role: 'listitem',
        'aria-posinset': 2,
        'aria-setsize': 5,
        'aria-label': 'Second Item'
      });
    });

    it('라벨 없는 리스트 아이템을 생성해야 한다', () => {
      const attributes = createListItemAttributes(1, 3);
      
      expect(attributes).toEqual({
        role: 'listitem',
        'aria-posinset': 1,
        'aria-setsize': 3
      });
    });

    it('첫 번째와 마지막 아이템을 처리해야 한다', () => {
      const firstItem = createListItemAttributes(1, 10);
      const lastItem = createListItemAttributes(10, 10);
      
      expect(firstItem['aria-posinset']).toBe(1);
      expect(lastItem['aria-posinset']).toBe(10);
      expect(firstItem['aria-setsize']).toBe(10);
      expect(lastItem['aria-setsize']).toBe(10);
    });
  });

  describe('createAlertAttributes', () => {
    it('기본 알림 속성을 생성해야 한다', () => {
      const attributes = createAlertAttributes('Operation completed');
      
      expect(attributes).toEqual({
        role: 'alert',
        'aria-live': 'polite',
        'aria-atomic': true,
        'aria-label': 'Operation completed'
      });
    });

    it('긴급 알림 속성을 생성해야 한다', () => {
      const attributes = createAlertAttributes('Critical error occurred', true);
      
      expect(attributes).toEqual({
        role: 'alert',
        'aria-live': 'assertive',
        'aria-atomic': true,
        'aria-label': 'Critical error occurred'
      });
    });
  });

  describe('isFocusable', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = {
        hasAttribute: vi.fn(),
        getAttribute: vi.fn(),
        tagName: 'DIV'
      } as any;
    });

    it('tabindex가 0 이상인 요소는 포커스 가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(true);
      mockElement.getAttribute = vi.fn().mockReturnValue('0');
      
      expect(isFocusable(mockElement)).toBe(true);
    });

    it('tabindex가 -1인 요소는 포커스 불가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(true);
      mockElement.getAttribute = vi.fn().mockReturnValue('-1');
      
      expect(isFocusable(mockElement)).toBe(false);
    });

    it('버튼 요소는 포커스 가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(false);
      mockElement.tagName = 'BUTTON';
      (mockElement as any).disabled = false;
      
      expect(isFocusable(mockElement)).toBe(true);
    });

    it('비활성화된 버튼은 포커스 불가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(false);
      mockElement.tagName = 'BUTTON';
      (mockElement as any).disabled = true;
      
      expect(isFocusable(mockElement)).toBe(false);
    });

    it('링크 요소는 포커스 가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(false);
      mockElement.tagName = 'A';
      (mockElement as any).disabled = false;
      
      expect(isFocusable(mockElement)).toBe(true);
    });

    it('입력 요소는 포커스 가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(false);
      mockElement.tagName = 'INPUT';
      (mockElement as any).disabled = false;
      
      expect(isFocusable(mockElement)).toBe(true);
    });

    it('일반 div는 포커스 불가능해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(false);
      mockElement.tagName = 'DIV';
      
      expect(isFocusable(mockElement)).toBe(false);
    });

    it('빈 tabindex 속성을 처리해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(true);
      mockElement.getAttribute = vi.fn().mockReturnValue('');
      
      expect(isFocusable(mockElement)).toBe(true); // 빈 문자열은 0으로 파싱됨
    });

    it('유효하지 않은 tabindex를 처리해야 한다', () => {
      mockElement.hasAttribute = vi.fn().mockReturnValue(true);
      mockElement.getAttribute = vi.fn().mockReturnValue('invalid');
      
      expect(isFocusable(mockElement)).toBe(false); // NaN >= 0은 false
    });
  });

  describe('isHighContrastMode', () => {
    it('고대비 모드가 활성화된 경우 true를 반환해야 한다', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(isHighContrastMode()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    });

    it('고대비 모드가 비활성화된 경우 false를 반환해야 한다', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isHighContrastMode()).toBe(false);
    });

    it('window가 없는 환경에서 false를 반환해야 한다', () => {
      vi.stubGlobal('window', undefined);
      
      expect(isHighContrastMode()).toBe(false);
    });
  });

  describe('isPrefersReducedMotion', () => {
    it('모션 감소 모드가 활성화된 경우 true를 반환해야 한다', () => {
      mockMatchMedia.mockReturnValue({
        matches: true
      });
      
      expect(isPrefersReducedMotion()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('모션 감소 모드가 비활성화된 경우 false를 반환해야 한다', () => {
      mockMatchMedia.mockReturnValue({
        matches: false
      });
      
      expect(isPrefersReducedMotion()).toBe(false);
    });

    it('window가 없는 환경에서 false를 반환해야 한다', () => {
      vi.stubGlobal('window', undefined);
      
      expect(isPrefersReducedMotion()).toBe(false);
    });
  });

  describe('isScreenReaderActive', () => {
    beforeEach(() => {
      mockDocument.body.getAttribute.mockReturnValue(null);
      mockDocument.documentElement.getAttribute.mockReturnValue(null);
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      vi.stubGlobal('window', {
        matchMedia: mockMatchMedia
      });
    });

    it('body에 aria-hidden이 true인 경우 true를 반환해야 한다', () => {
      mockDocument.body.getAttribute.mockReturnValue('true');
      
      expect(isScreenReaderActive()).toBe(true);
    });

    it('documentElement에 data-sr-active가 있는 경우 true를 반환해야 한다', () => {
      mockDocument.documentElement.getAttribute.mockReturnValue('true');
      
      expect(isScreenReaderActive()).toBe(true);
    });

    it('Mac에서 터치 기능이 있는 경우 true를 반환해야 한다', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      });
      vi.stubGlobal('window', {
        matchMedia: mockMatchMedia,
        ontouchstart: null
      });
      
      expect(isScreenReaderActive()).toBe(true);
    });

    it('스크린 리더가 감지되지 않으면 false를 반환해야 한다', () => {
      expect(isScreenReaderActive()).toBe(false);
    });

    it('window가 없는 환경에서 false를 반환해야 한다', () => {
      vi.stubGlobal('window', undefined);
      
      expect(isScreenReaderActive()).toBe(false);
    });
  });

  describe('CALLSTACK_LIBRARY_ARIA_LABELS', () => {
    it('게임 관련 라벨이 정의되어야 한다', () => {
      expect(CALLSTACK_LIBRARY_ARIA_LABELS.game.main).toBe('콜스택 도서관 게임');
      expect(CALLSTACK_LIBRARY_ARIA_LABELS.game.stage(5)).toBe('스테이지 5');
      expect(CALLSTACK_LIBRARY_ARIA_LABELS.game.description).toContain('자바스크립트 이벤트 루프');
    });

    it('레이아웃 관련 라벨이 정의되어야 한다', () => {
      const layout = CALLSTACK_LIBRARY_ARIA_LABELS.layout;
      
      expect(layout.codeEditor).toBe('코드 편집기 영역');
      expect(layout.visualization).toBe('시각화 영역');
      expect(layout.controls).toBe('게임 컨트롤 영역');
      expect(layout.evaluation).toBe('평가 및 제출 영역');
      expect(layout.hints).toBe('힌트 표시 영역');
    });

    it('콜스택 관련 라벨이 정의되어야 한다', () => {
      const callstack = CALLSTACK_LIBRARY_ARIA_LABELS.callstack;
      
      expect(callstack.main).toBe('메인 서가 (콜스택)');
      expect(callstack.item('myFunction', 0)).toBe('myFunction 함수 - 위치 1');
      expect(callstack.empty).toBe('메인 서가가 비어있습니다');
      expect(callstack.overflow(5)).toBe('5개의 도서가 서가 한계를 초과했습니다');
      expect(callstack.push('testFunc')).toBe('testFunc 도서가 서가에 추가되었습니다');
      expect(callstack.pop('testFunc')).toBe('testFunc 도서가 서가에서 제거되었습니다');
    });

    it('마이크로태스크 관련 라벨이 정의되어야 한다', () => {
      const microtask = CALLSTACK_LIBRARY_ARIA_LABELS.microtask;
      
      expect(microtask.main).toBe('긴급 처리대 (마이크로태스크 큐)');
      expect(microtask.item('promise', 1)).toBe('promise - 긴급 처리 순서 2');
      expect(microtask.empty).toBe('긴급 처리 대기 도서가 없습니다');
      expect(microtask.add('task')).toBe('task이(가) 긴급 처리대에 추가되었습니다');
      expect(microtask.process('task')).toBe('task이(가) 긴급 처리되었습니다');
    });

    it('매크로태스크 관련 라벨이 정의되어야 한다', () => {
      const macrotask = CALLSTACK_LIBRARY_ARIA_LABELS.macrotask;
      
      expect(macrotask.main).toBe('예약 처리대 (매크로태스크 큐)');
      expect(macrotask.item('timer', 0)).toBe('timer - 예약 순서 1');
      expect(macrotask.item('timer', 0, 1000)).toBe('timer - 예약 시간 1000ms, 순서 1');
      expect(macrotask.empty).toBe('예약된 도서가 없습니다');
      expect(macrotask.add('task')).toBe('task이(가) 예약 처리대에 추가되었습니다');
      expect(macrotask.add('task', 500)).toBe('task이(가) 500ms 후 처리 예약되었습니다');
      expect(macrotask.process('task')).toBe('task이(가) 예약 처리되었습니다');
    });

    it('컨트롤 관련 라벨이 정의되어야 한다', () => {
      const controls = CALLSTACK_LIBRARY_ARIA_LABELS.controls;
      
      expect(controls.play).toBe('실행');
      expect(controls.pause).toBe('일시정지');
      expect(controls.reset).toBe('초기화');
      expect(controls.nextStep).toBe('다음 단계');
      expect(controls.previousStep).toBe('이전 단계');
      expect(controls.submit).toBe('답안 제출');
      expect(controls.hint).toBe('힌트 보기');
      expect(controls.simulate).toBe('시뮬레이션 실행');
      expect(controls.addFunction('test')).toBe('test 함수 추가');
      expect(controls.removeFunction('test')).toBe('test 함수 제거');
      expect(controls.reorderFunction).toBe('함수 순서 변경');
    });

    it('상태 메시지 라벨이 정의되어야 한다', () => {
      const status = CALLSTACK_LIBRARY_ARIA_LABELS.status;
      
      expect(status.executing).toBe('코드 실행 중');
      expect(status.paused).toBe('일시정지됨');
      expect(status.completed).toBe('실행 완료');
      expect(status.error('Network error')).toBe('오류 발생: Network error');
      expect(status.success).toBe('정답입니다!');
      expect(status.incorrect).toBe('다시 시도해보세요');
      expect(status.hint(3)).toBe('힌트 3번 사용');
      expect(status.stepChange(2, 5)).toBe('현재 2단계, 전체 5단계');
    });

    it('검증 결과 라벨이 정의되어야 한다', () => {
      const validation = CALLSTACK_LIBRARY_ARIA_LABELS.validation;
      
      expect(validation.correct).toBe('올바른 답안입니다');
      expect(validation.incorrect).toBe('잘못된 답안입니다');
      expect(validation.partial).toBe('부분적으로 맞았습니다');
      expect(validation.queueMismatch('microtask')).toBe('microtask 큐의 상태가 일치하지 않습니다');
      expect(validation.orderMismatch).toBe('실행 순서가 올바르지 않습니다');
    });

    it('네비게이션 라벨이 정의되어야 한다', () => {
      const navigation = CALLSTACK_LIBRARY_ARIA_LABELS.navigation;
      
      expect(navigation.skipToMain).toBe('메인 콘텐츠로 건너뛰기');
      expect(navigation.backToStages).toBe('스테이지 목록으로 돌아가기');
      expect(navigation.nextStage).toBe('다음 스테이지로');
      expect(navigation.previousStage).toBe('이전 스테이지로');
      expect(navigation.stageSelect).toBe('스테이지 선택');
    });
  });

  describe('스타일 상수', () => {
    it('SR_ONLY_CLASS가 정의되어야 한다', () => {
      expect(SR_ONLY_CLASS).toBe('sr-only');
    });

    it('srOnlyStyles가 올바르게 정의되어야 한다', () => {
      expect(srOnlyStyles).toEqual({
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0
      });
    });

    it('focusRingStyles가 올바르게 정의되어야 한다', () => {
      expect(focusRingStyles).toEqual({
        outline: '2px solid #2563eb',
        outlineOffset: '2px'
      });
    });
  });

  describe('엣지 케이스', () => {
    it('빈 문자열 라벨을 처리해야 한다', () => {
      const attributes = createAriaAttributes('button', '');
      expect(attributes['aria-label']).toBe('');
    });

    it('특수 문자가 포함된 라벨을 처리해야 한다', () => {
      const label = 'Button with "quotes" & special chars <>';
      const attributes = createAriaAttributes('button', label);
      expect(attributes['aria-label']).toBe(label);
    });

    it('매우 긴 라벨을 처리해야 한다', () => {
      const longLabel = 'A'.repeat(1000);
      const attributes = createAriaAttributes('button', longLabel);
      expect(attributes['aria-label']).toBe(longLabel);
    });

    it('null/undefined 값들을 안전하게 처리해야 한다', () => {
      const attributes = createDialogAttributes('Test Dialog', undefined);
      expect(attributes).not.toHaveProperty('aria-describedby');
    });

    it('0 값을 올바르게 처리해야 한다', () => {
      const attributes = createProgressAttributes(0, 0, 'Zero progress');
      expect(attributes['aria-valuenow']).toBe(0);
      expect(attributes['aria-valuemax']).toBe(0);
    });

    it('음수 값을 처리해야 한다', () => {
      const attributes = createListItemAttributes(-1, 5);
      expect(attributes['aria-posinset']).toBe(-1);
    });
  });
});