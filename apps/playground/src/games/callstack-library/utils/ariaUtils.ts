/**
 * ARIA 유틸리티
 * WCAG 2.1 AA 준수를 위한 접근성 속성 관리
 */

// ARIA 역할 타입
export type AriaRole = 
  | 'button' 
  | 'link' 
  | 'navigation' 
  | 'main' 
  | 'complementary'
  | 'region'
  | 'list'
  | 'listitem'
  | 'tablist'
  | 'tab'
  | 'tabpanel'
  | 'menu'
  | 'menuitem'
  | 'dialog'
  | 'alert'
  | 'status'
  | 'progressbar'
  | 'group'
  | 'article'
  | 'section';

// ARIA 속성 인터페이스
export interface AriaAttributes {
  role?: AriaRole;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-pressed'?: boolean | 'mixed';
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-level'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-flowto'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-multiline'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-placeholder'?: string;
  'aria-readonly'?: boolean;
  'aria-required'?: boolean;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-activedescendant'?: string;
  'aria-modal'?: boolean;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  [key: string]: any; // 추가 속성 허용
}

/**
 * 콜스택 도서관 게임 전용 ARIA 라벨
 */
export const CALLSTACK_LIBRARY_ARIA_LABELS = {
  // 전체 영역
  game: {
    main: '콜스택 도서관 게임',
    stage: (stageNumber: number) => `스테이지 ${stageNumber}`,
    description: '자바스크립트 이벤트 루프를 도서관 시스템으로 학습하는 교육 게임'
  },

  // 레이아웃 영역
  layout: {
    codeEditor: '코드 편집기 영역',
    visualization: '시각화 영역',
    controls: '게임 컨트롤 영역',
    evaluation: '평가 및 제출 영역',
    hints: '힌트 표시 영역'
  },

  // 콜스택 관련
  callstack: {
    main: '메인 서가 (콜스택)',
    item: (name: string, index: number) => `${name} 함수 - 위치 ${index + 1}`,
    empty: '메인 서가가 비어있습니다',
    overflow: (count: number) => `${count}개의 도서가 서가 한계를 초과했습니다`,
    push: (name: string) => `${name} 도서가 서가에 추가되었습니다`,
    pop: (name: string) => `${name} 도서가 서가에서 제거되었습니다`
  },

  // 마이크로태스크 큐 관련
  microtask: {
    main: '긴급 처리대 (마이크로태스크 큐)',
    item: (name: string, index: number) => `${name} - 긴급 처리 순서 ${index + 1}`,
    empty: '긴급 처리 대기 도서가 없습니다',
    add: (name: string) => `${name}이(가) 긴급 처리대에 추가되었습니다`,
    process: (name: string) => `${name}이(가) 긴급 처리되었습니다`
  },

  // 매크로태스크 큐 관련
  macrotask: {
    main: '예약 처리대 (매크로태스크 큐)',
    item: (name: string, index: number, delay?: number) => 
      delay ? `${name} - 예약 시간 ${delay}ms, 순서 ${index + 1}` : `${name} - 예약 순서 ${index + 1}`,
    empty: '예약된 도서가 없습니다',
    add: (name: string, delay?: number) => 
      delay ? `${name}이(가) ${delay}ms 후 처리 예약되었습니다` : `${name}이(가) 예약 처리대에 추가되었습니다`,
    process: (name: string) => `${name}이(가) 예약 처리되었습니다`
  },

  // 버튼 및 컨트롤
  controls: {
    play: '실행',
    pause: '일시정지',
    reset: '초기화',
    nextStep: '다음 단계',
    previousStep: '이전 단계',
    submit: '답안 제출',
    hint: '힌트 보기',
    simulate: '시뮬레이션 실행',
    addFunction: (name: string) => `${name} 함수 추가`,
    removeFunction: (name: string) => `${name} 함수 제거`,
    reorderFunction: '함수 순서 변경'
  },

  // 상태 메시지
  status: {
    executing: '코드 실행 중',
    paused: '일시정지됨',
    completed: '실행 완료',
    error: (message: string) => `오류 발생: ${message}`,
    success: '정답입니다!',
    incorrect: '다시 시도해보세요',
    hint: (number: number) => `힌트 ${number}번 사용`,
    stepChange: (current: number, total: number) => `현재 ${current}단계, 전체 ${total}단계`
  },

  // 검증 결과
  validation: {
    correct: '올바른 답안입니다',
    incorrect: '잘못된 답안입니다',
    partial: '부분적으로 맞았습니다',
    queueMismatch: (queue: string) => `${queue} 큐의 상태가 일치하지 않습니다`,
    orderMismatch: '실행 순서가 올바르지 않습니다'
  },

  // 네비게이션
  navigation: {
    skipToMain: '메인 콘텐츠로 건너뛰기',
    backToStages: '스테이지 목록으로 돌아가기',
    nextStage: '다음 스테이지로',
    previousStage: '이전 스테이지로',
    stageSelect: '스테이지 선택'
  }
} as const;

/**
 * ARIA 속성 생성 헬퍼
 */
export const createAriaAttributes = (
  role: AriaRole,
  label: string,
  additionalProps: Partial<AriaAttributes> = {}
): AriaAttributes => {
  return {
    role,
    'aria-label': label,
    ...additionalProps
  };
};

/**
 * 라이브 리전 속성 생성
 */
export const createLiveRegionAttributes = (
  politeness: 'polite' | 'assertive' = 'polite',
  atomic: boolean = true
): AriaAttributes => {
  return {
    'aria-live': politeness,
    'aria-atomic': atomic
  };
};

/**
 * 진행률 표시 속성 생성
 */
export const createProgressAttributes = (
  current: number,
  max: number,
  label: string
): AriaAttributes => {
  return {
    role: 'progressbar',
    'aria-label': label,
    'aria-valuenow': current,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuetext': `${current}/${max}`
  };
};

/**
 * 탭 패널 속성 생성
 */
export const createTabAttributes = (
  isSelected: boolean,
  tabId: string,
  panelId: string,
  label: string
): AriaAttributes => {
  return {
    role: 'tab',
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-label': label,
    id: tabId,
    tabIndex: isSelected ? 0 : -1
  };
};

/**
 * 다이얼로그 속성 생성
 */
export const createDialogAttributes = (
  label: string,
  describedBy?: string
): AriaAttributes => {
  return {
    role: 'dialog',
    'aria-label': label,
    'aria-modal': true,
    ...(describedBy && { 'aria-describedby': describedBy })
  };
};

/**
 * 버튼 그룹 속성 생성
 */
export const createButtonGroupAttributes = (
  label: string,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): AriaAttributes => {
  return {
    role: 'group',
    'aria-label': label,
    'aria-orientation': orientation
  };
};

/**
 * 리스트 속성 생성
 */
export const createListAttributes = (
  label: string,
  size?: number
): AriaAttributes => {
  return {
    role: 'list',
    'aria-label': label,
    ...(size !== undefined && { 'aria-setsize': size })
  };
};

/**
 * 리스트 아이템 속성 생성
 */
export const createListItemAttributes = (
  position: number,
  setSize: number,
  label?: string
): AriaAttributes => {
  return {
    role: 'listitem',
    'aria-posinset': position,
    'aria-setsize': setSize,
    ...(label && { 'aria-label': label })
  };
};

/**
 * 알림 메시지 속성 생성
 */
export const createAlertAttributes = (
  message: string,
  assertive: boolean = false
): AriaAttributes => {
  return {
    role: 'alert',
    'aria-live': assertive ? 'assertive' : 'polite',
    'aria-atomic': true,
    'aria-label': message
  };
};

/**
 * 포커스 가능 여부 확인
 */
export const isFocusable = (element: HTMLElement): boolean => {
  if (element.hasAttribute('tabindex')) {
    const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);
    return tabindex >= 0;
  }

  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  if (focusableTags.includes(element.tagName)) {
    return !(element as HTMLButtonElement | HTMLInputElement).disabled;
  }

  return false;
};

/**
 * 스크린 리더 전용 텍스트 클래스
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * 스크린 리더 전용 스타일
 */
export const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0
};

/**
 * 포커스 링 스타일
 */
export const focusRingStyles: React.CSSProperties = {
  outline: '2px solid #2563eb',
  outlineOffset: '2px'
};

/**
 * 고대비 모드 감지
 */
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * 모션 감소 모드 감지
 */
export const isPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * 스크린 리더 사용 감지 (휴리스틱)
 */
export const isScreenReaderActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // NVDA, JAWS 등의 스크린 리더가 추가하는 속성 확인
  return !!(
    document.body.getAttribute('aria-hidden') === 'true' ||
    document.documentElement.getAttribute('data-sr-active') ||
    // VoiceOver는 감지가 어려우므로 iOS/macOS 확인
    (navigator.userAgent.includes('Mac') && 'ontouchstart' in window)
  );
};