# ISSUE-002: 테마 시스템 일관성 문제

## 이슈 정보
- **이슈 번호**: ISSUE-002
- **발생일**: 2025-01-31
- **심각도**: High
- **영향 범위**: 전체 애플리케이션 UI/UX
- **상태**: 분석 완료 / 해결 방안 수립

## 문제 설명

### 1. 증상
- GameGuideModal이 라이트/다크 테마 전환 시 항상 다크 테마로 표시됨
- 일부 게임 컴포넌트에서 테마가 부분적으로만 적용됨
- Portal 기반 컴포넌트들이 테마 변경을 감지하지 못함

### 2. 근본 원인
```
[HTML 루트]
└── class="dark" (next-themes가 토글)
    └── [Body]
        ├── [App 컴포넌트들] ✅ 테마 적용됨
        └── [Portal 컴포넌트들] ❌ 테마 적용 안됨
            └── GameGuideModal (body 직속으로 렌더링)
```

Portal로 렌더링되는 컴포넌트들이 HTML 루트의 `dark` 클래스 영향을 받지 못함

### 3. 현재 구현의 문제점

#### A. 혼재된 테마 적용 방식
```tsx
// 방식 1: Tailwind dark: 클래스 (Portal에서 작동 안함)
className="bg-white dark:bg-slate-900"

// 방식 2: CSS 변수 (일부만 사용)
className="text-foreground bg-background"

// 방식 3: 하드코딩된 색상
className="bg-green-100 border-green-300"
```

#### B. 일관성 없는 구현
- 같은 컴포넌트 내에서도 여러 방식 혼용
- 게임별로 다른 테마 시스템 사용
- 타입 안전성 부재

## 해결 방안

### 아키텍처 설계 원칙

1. **Single Source of Truth**
   - 모든 테마 토큰은 CSS Custom Properties로 정의
   - JavaScript에서는 읽기만 가능

2. **Zero Runtime Cost**
   - 테마 변경이 CSS만으로 처리됨
   - JavaScript 리렌더링 최소화

3. **Type Safety**
   - TypeScript로 모든 토큰 타입 정의
   - 컴파일 타임 검증

### 구현 계획

#### Phase 1: CSS Design Token System
```css
/* globals.css */
@layer tokens {
  :root {
    /* Primitive Tokens */
    --color-gray-50: 248 250 252;
    --color-gray-900: 15 23 42;
    
    /* Semantic Tokens */
    --semantic-background: var(--color-gray-50);
    --semantic-text: var(--color-gray-900);
    
    /* Component Tokens */
    --component-modal-bg: var(--semantic-background);
    --component-button-bg: var(--semantic-primary);
  }
  
  /* Dark theme */
  :root:has(.dark) {
    --semantic-background: var(--color-gray-900);
    --semantic-text: var(--color-gray-50);
  }
}
```

#### Phase 2: Type System
```typescript
// theme/tokens.ts
export const tokens = {
  color: {
    background: 'var(--semantic-background)',
    text: 'var(--semantic-text)',
  },
  component: {
    modal: {
      background: 'var(--component-modal-bg)',
    }
  }
} as const;

// Type-safe token getter
export function token(path: string): string {
  return `var(--${path})`;
}
```

#### Phase 3: Portal Solution
```typescript
// components/ThemedPortal.tsx
export function ThemedPortal({ children }: { children: React.ReactNode }) {
  const portalRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    const portal = portalRef.current;
    if (!portal) return;
    
    // CSS 변수 동기화
    const syncTheme = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const props = Array.from(rootStyles)
        .filter(prop => prop.startsWith('--'));
      
      props.forEach(prop => {
        portal.style.setProperty(
          prop,
          rootStyles.getPropertyValue(prop)
        );
      });
    };
    
    syncTheme();
    
    // 테마 변경 감지
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    return () => observer.disconnect();
  }, []);
  
  return createPortal(
    <div ref={portalRef} className="contents">
      {children}
    </div>,
    document.body
  );
}
```

### 마이그레이션 전략

#### 1단계: 긴급 수정 (1일)
- Portal 컴포넌트들을 CSS 변수 사용으로 변경
- GameGuideModal 우선 수정

#### 2단계: 토큰 시스템 구축 (3일)
- CSS Design Token 정의
- TypeScript 타입 시스템 구축
- 문서화

#### 3단계: 점진적 마이그레이션 (2주)
- 컴포넌트별로 순차적 변경
- 테스트 작성
- 성능 측정

### 기대 효과

1. **일관된 테마 적용**
   - 모든 컴포넌트에서 테마가 정확히 작동
   - Portal 문제 해결

2. **개발자 경험 향상**
   - 타입 안전성으로 실수 방지
   - 자동완성 지원

3. **성능 개선**
   - Runtime overhead 제거
   - 번들 사이즈 감소

4. **유지보수성**
   - 중앙화된 토큰 관리
   - 새 테마 추가 용이

## 참고 자료

- [Next.js App Router 테마 가이드](https://nextjs.org/docs/app/building-your-application/styling/css-variables)
- [Tailwind CSS v4 Design Tokens](https://tailwindcss.com/docs/v4-beta)
- [CSS Custom Properties 명세](https://www.w3.org/TR/css-variables-1/)

## 관련 파일

- `/app/[locale]/globals.css` - CSS 토큰 정의
- `/src/games/closure-cave/GameGuideModal.tsx` - 문제 발생 컴포넌트
- `/src/games/callstack-library/GameGuideModal.tsx` - 문제 발생 컴포넌트
- `/packages/ui/src/components/ThemeToggle.tsx` - 테마 토글 컴포넌트