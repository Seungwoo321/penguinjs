# 테마 시스템 구현 가이드

## 즉시 적용 가능한 수정 사항

### 1. GameGuideModal 긴급 수정

현재 가장 시급한 문제인 GameGuideModal의 테마 미적용 문제를 CSS 변수로 해결:

```tsx
// Before (작동 안함)
<div className="bg-white dark:bg-slate-900">

// After (즉시 적용 가능)
<div className="bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
```

#### 수정 필요 파일:
- `/src/games/closure-cave/GameGuideModal.tsx`
- `/src/games/callstack-library/GameGuideModal.tsx`
- `/src/components/GameGuideModal.tsx`

### 2. 부모 컨테이너 수정

```tsx
// EnhancedClosureCaveGame.tsx
// Before
<div className="min-h-screen">

// After
<div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
```

## 단계별 마이그레이션 계획

### Step 1: CSS 변수 확장 (Day 1)

```css
/* globals.css에 추가 */
@layer utilities {
  /* Quick fix utilities */
  .theme-bg {
    background-color: rgb(var(--background));
  }
  
  .theme-text {
    color: rgb(var(--foreground));
  }
  
  .theme-card {
    background-color: rgb(var(--card));
    color: rgb(var(--card-foreground));
  }
  
  .theme-modal {
    background-color: rgb(var(--surface-elevated));
    color: rgb(var(--text-primary));
  }
}
```

### Step 2: Portal Helper 생성 (Day 2)

```typescript
// src/components/ThemeAwarePortal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function ThemeAwarePortal({ children }: { children: React.ReactNode }) {
  const portalRoot = useRef<HTMLDivElement>();
  
  useEffect(() => {
    const root = document.createElement('div');
    root.className = document.documentElement.className; // 클래스 복사
    document.body.appendChild(root);
    portalRoot.current = root;
    
    // 클래스 변경 감지
    const observer = new MutationObserver(() => {
      if (portalRoot.current) {
        portalRoot.current.className = document.documentElement.className;
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      observer.disconnect();
      if (portalRoot.current) {
        document.body.removeChild(portalRoot.current);
      }
    };
  }, []);
  
  return portalRoot.current 
    ? createPortal(children, portalRoot.current)
    : null;
}
```

### Step 3: 컴포넌트 변환 템플릿

#### A. 모달 컴포넌트
```tsx
// Template for Modal migration
export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <ThemeAwarePortal>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="theme-modal rounded-2xl shadow-2xl">
              {children}
            </div>
          </div>
        </ThemeAwarePortal>
      )}
    </AnimatePresence>
  );
}
```

#### B. 게임 보드 컴포넌트
```tsx
// Template for Game Board migration
export function GameBoard() {
  return (
    <div className="theme-card rounded-lg p-4">
      <div className="grid grid-cols-4 gap-2">
        {cells.map(cell => (
          <div 
            key={cell.id}
            className="aspect-square rounded theme-bg border border-[rgb(var(--border))]"
          >
            {/* Cell content */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 4: 타입 정의 추가 (Day 3)

```typescript
// src/theme/index.ts
export const theme = {
  colors: {
    background: 'rgb(var(--background))',
    foreground: 'rgb(var(--foreground))',
    card: 'rgb(var(--card))',
    cardForeground: 'rgb(var(--card-foreground))',
    primary: 'rgb(var(--primary))',
    primaryForeground: 'rgb(var(--primary-foreground))',
    border: 'rgb(var(--border))',
  },
  game: {
    board: 'rgb(var(--game-bg))',
    cell: 'rgb(var(--game-panel))',
    character: '#fbbf24', // Keep some constants
  }
} as const;

export type Theme = typeof theme;
```

### Step 5: VS Code 스니펫 설정

```json
// .vscode/theme.code-snippets
{
  "Theme Background": {
    "prefix": "tbg",
    "body": ["bg-[rgb(var(--background))]"],
    "description": "Theme-aware background"
  },
  "Theme Text": {
    "prefix": "ttxt",
    "body": ["text-[rgb(var(--foreground))]"],
    "description": "Theme-aware text color"
  },
  "Theme Card": {
    "prefix": "tcard",
    "body": ["bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))]"],
    "description": "Theme-aware card styling"
  }
}
```

## 검증 체크리스트

### 수정 전 확인사항
- [ ] 현재 스타일 스크린샷 저장
- [ ] 영향받는 컴포넌트 목록 작성
- [ ] 테스트 케이스 준비

### 수정 후 검증
- [ ] 라이트 모드에서 정상 표시
- [ ] 다크 모드에서 정상 표시
- [ ] 테마 전환 시 즉시 반영
- [ ] Portal 컴포넌트 테마 적용
- [ ] 성능 저하 없음
- [ ] TypeScript 오류 없음

### 테스트 시나리오
1. **기본 테마 전환**
   - 라이트 → 다크 전환
   - 다크 → 라이트 전환
   - 시스템 테마 따라가기

2. **Portal 컴포넌트**
   - 모달 열기/닫기
   - 테마 전환 후 모달 열기
   - 여러 모달 동시 열기

3. **게임 화면**
   - 게임 보드 테마 적용
   - 애니메이션 중 테마 전환
   - 게임 상태 변경 시 테마 유지

## 트러블슈팅

### 문제: CSS 변수가 적용되지 않음
```tsx
// 확인사항
1. CSS 변수가 :root에 정의되어 있는지
2. 변수명 오타 확인
3. rgb() 함수로 감쌌는지

// 디버깅
console.log(getComputedStyle(document.documentElement).getPropertyValue('--background'));
```

### 문제: Portal에서 테마가 깜빡임
```tsx
// 해결책: useLayoutEffect 사용
useLayoutEffect(() => {
  // 동기적으로 스타일 적용
}, []);
```

### 문제: 타입 에러 발생
```tsx
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/theme": ["./src/theme/index.ts"],
      "@/theme/*": ["./src/theme/*"]
    }
  }
}
```

## 성능 최적화 팁

1. **CSS 변수 스코프 제한**
```css
/* 전역 변수는 최소화 */
.game-board {
  --local-cell-size: 3rem;
  --local-gap: 0.5rem;
}
```

2. **불필요한 리렌더링 방지**
```tsx
// Memoize theme values
const themeValues = useMemo(() => ({
  background: theme.colors.background,
  text: theme.colors.foreground,
}), []); // 의존성 없음 - 정적 값
```

3. **Critical CSS 인라인**
```tsx
// layout.tsx
<style dangerouslySetInnerHTML={{
  __html: `
    :root { 
      --background: 246 249 252; 
      --foreground: 27 42 58;
    }
    .dark {
      --background: 15 23 42;
      --foreground: 248 250 252;
    }
  `
}} />
```

## 다음 단계

1. **컴포넌트 라이브러리 구축**
   - 테마 aware 기본 컴포넌트
   - Storybook 문서화

2. **자동화 도구**
   - ESLint 규칙 추가
   - 마이그레이션 스크립트

3. **모니터링**
   - 테마 전환 성능 측정
   - 사용자 선호도 분석