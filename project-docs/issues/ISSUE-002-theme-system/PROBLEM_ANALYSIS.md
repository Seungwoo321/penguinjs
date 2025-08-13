# 테마 시스템 문제 상세 분석

## 현재 상태 분석

### 1. 기술 스택
- **Next.js 15.3.2** (App Router)
- **Tailwind CSS v4** (Beta)
- **next-themes** (테마 관리)
- **TypeScript**

### 2. 현재 구현 방식

#### A. 전역 테마 설정 (`/app/[locale]/layout.tsx`)
```tsx
<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <NextIntlClientProvider messages={messages} locale={locale}>
    {children}
  </NextIntlClientProvider>
</ThemeProvider>
```

#### B. CSS 변수 정의 (`/app/[locale]/globals.css`)
```css
:root {
  --surface-primary: 246 249 252;
  --text-primary: 27 42 58;
  /* ... */
}

.dark {
  --surface-primary: 15 23 42;
  --text-primary: 248 250 252;
  /* ... */
}
```

#### C. 컴포넌트 구현 패턴
```tsx
// 패턴 1: Tailwind dark: 클래스
<div className="bg-white dark:bg-slate-900">

// 패턴 2: CSS 변수
<div className="bg-background text-foreground">

// 패턴 3: 하드코딩
<div className="bg-green-100 border-green-300">
```

### 3. 문제 발생 지점

#### A. Portal 렌더링 구조
```
document
└── html.dark
    └── body
        ├── #__next (앱 루트)
        │   └── [컴포넌트들] ✅ dark: 클래스 작동
        └── [Portal 직속]
            └── GameGuideModal ❌ dark: 클래스 작동 안함
```

#### B. 영향받는 컴포넌트
1. **클로저 동굴**
   - `/src/games/closure-cave/GameGuideModal.tsx`
   - `/src/games/closure-cave/EnhancedClosureCaveGame.tsx`

2. **콜스택 도서관**
   - `/src/games/callstack-library/GameGuideModal.tsx`
   - `/src/games/callstack-library/CallStackLibraryGame.tsx`

3. **공통 컴포넌트**
   - `/src/components/GameGuideModal.tsx`

### 4. 코드 분석 결과

#### A. 문제가 있는 코드 예시
```tsx
// GameGuideModal.tsx
<div className="bg-white dark:bg-slate-900 rounded-2xl">
  {/* Portal로 body 직속 렌더링 시 dark: 클래스 미작동 */}
</div>
```

#### B. 일부 해결된 코드 예시
```tsx
// CallStackLibraryGame.tsx
<div className="min-h-screen bg-background">
  {/* CSS 변수 사용으로 테마 변경 시 작동 */}
</div>
```

### 5. 기술적 제약사항

#### A. Next.js App Router
- Server Components가 기본
- Client boundary에서만 테마 상태 접근 가능
- Hydration 불일치 주의 필요

#### B. Tailwind CSS v4
- CSS-first approach 필수
- JavaScript 설정 최소화
- `@theme`, `@utility` 디렉티브 사용

#### C. Portal 렌더링
- React Portal은 DOM 트리 외부 렌더링
- CSS 상속 끊김
- 별도 테마 전파 필요

### 6. 성능 고려사항

#### A. 현재 방식의 문제
- 테마 변경 시 전체 리렌더링
- JavaScript 의존적 테마 적용
- 불필요한 DOM 조작

#### B. 개선 필요사항
- CSS-only 테마 전환
- 최소한의 JavaScript 개입
- 효율적인 리페인트

### 7. 타입 안전성 부재

현재 테마 토큰에 대한 타입 정의가 없어:
- 오타 가능성
- 자동완성 미지원
- 리팩토링 어려움

## 결론

현재 시스템은:
1. **일관성 부족**: 3가지 이상의 테마 적용 방식 혼재
2. **Portal 문제**: 테마 전파 메커니즘 부재
3. **타입 안전성 부재**: 개발자 실수 가능성 높음
4. **성능 비효율**: JavaScript 의존적 구현

이를 해결하기 위해서는 **근본적인 아키텍처 재설계**가 필요합니다.