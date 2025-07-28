# CallStack Library 색상 시스템 구현 완료

## 구현 개요
Tailwind CSS v4의 CSS 변수 기반 시스템을 활용하여 CallStack Library 게임의 독립적인 색상 시스템을 구현했습니다.

## 주요 변경사항

### 1. CSS 변수 네임스페이스
- `--game-callstack-*` 접두사로 기본 테마와 충돌 방지
- 게임별 독립적인 색상 관리 가능

### 2. 색상 변수 구조
```css
/* 메인 서가 (CallStack) */
--game-callstack-queue-primary: 74 74 74;
--game-callstack-queue-bg-light: 252 251 250;

/* 긴급 처리대 (MicroTask) */
--game-callstack-urgent-primary: 21 94 117;
--game-callstack-urgent-bg-light: 243 251 252;

/* 예약 처리대 (MacroTask) */
--game-callstack-scheduled-primary: 171 71 73;
--game-callstack-scheduled-bg-light: 255 248 246;
```

### 3. Tailwind v4 통합
```jsx
// CSS 변수를 직접 참조하는 방식
<div className="bg-[rgb(var(--game-callstack-queue-bg-light))]" />

// 또는 style 속성 사용
<div style={{ 
  backgroundColor: 'rgb(var(--game-callstack-queue-primary))' 
}} />
```

### 4. 다크 모드 지원
- `.dark` 클래스에서 자동으로 다크 모드 색상 적용
- CSS 변수만 변경되므로 컴포넌트 코드 수정 불필요

### 5. 제거된 하드코딩
- `bg-blue-500`, `text-orange-900` 등 Tailwind 색상 클래스 제거
- `#dcfce7`, `#dc2626` 등 하드코딩된 HEX 값 제거
- 모든 색상이 CSS 변수 참조로 변경

## 파일 구조
```
callstack-library/
├── styles/
│   └── callstack-library.css      # CSS 변수 정의
├── hooks/
│   └── useCSSThemeSync.ts         # JS 테마와 CSS 변수 동기화
└── components/
    └── common/
        └── QueueStyles.tsx        # 재사용 가능한 스타일 유틸리티
```

## 사용 예시
```jsx
// 1. 게임 컴포넌트에서 CSS 변수 동기화
const libraryTheme = useCallStackLibraryTheme()
useCSSThemeSync(libraryTheme.isDarkMode)

// 2. 컴포넌트에서 CSS 변수 사용
<div 
  className="rounded-lg"
  style={{ 
    backgroundColor: 'rgb(var(--game-callstack-queue-bg-light))',
    color: 'rgb(var(--game-callstack-queue-primary))'
  }}
>
```

## 장점
1. **독립성**: 다른 게임이나 전역 테마와 충돌 없음
2. **유지보수성**: CSS 변수만 수정하면 전체 색상 변경 가능
3. **성능**: CSS 변수는 브라우저가 최적화하여 처리
4. **확장성**: 새로운 색상 추가가 용이
5. **Tailwind v4 호환**: 최신 CSS 기반 설정과 완벽 호환

## 주의사항
- CSS 변수는 RGB 값을 공백으로 구분하여 저장 (Tailwind v4 형식)
- `rgb()` 함수로 감싸서 사용해야 함
- 동적 클래스명 생성 시 Tailwind JIT 컴파일 고려 필요