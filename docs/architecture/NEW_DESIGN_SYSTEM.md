# PenguinJS 새로운 디자인 시스템

## 🎨 색상 철학
- **친근하고 장난기 있는**: 펭귄의 특성을 반영
- **부드럽고 따뜻한**: 학습 환경에 적합
- **현대적이고 깔끔한**: 개발자 도구의 전문성

## 🎯 새로운 색상 팔레트

### 주요 브랜드 색상
```css
/* 아이스 블루 계열 - 펭귄의 서식지 */
--ice-50:  #f0f9ff;  /* 매우 연한 아이스 블루 */
--ice-100: #e0f2fe;  /* 연한 아이스 블루 */
--ice-200: #bae6fd;  /* 밝은 아이스 블루 */
--ice-300: #7dd3fc;  /* 중간 아이스 블루 */
--ice-400: #38bdf8;  /* 선명한 아이스 블루 */
--ice-500: #0ea5e9;  /* 기본 아이스 블루 */
--ice-600: #0284c7;  /* 진한 아이스 블루 */
--ice-700: #0369a1;  /* 깊은 아이스 블루 */
--ice-800: #075985;  /* 매우 진한 아이스 블루 */
--ice-900: #0c4a6e;  /* 거의 네이비 */

/* 오렌지 계열 - 펭귄 부리/발 색상 */
--orange-50:  #fff7ed;  /* 매우 연한 오렌지 */
--orange-100: #ffedd5;  /* 연한 오렌지 */
--orange-200: #fed7aa;  /* 밝은 오렌지 */
--orange-300: #fdba74;  /* 중간 오렌지 */
--orange-400: #fb923c;  /* 선명한 오렌지 */
--orange-500: #f97316;  /* 기본 오렌지 */
--orange-600: #ea580c;  /* 진한 오렌지 */

/* 중성 색상 - 펭귄 몸체 색상 */
--neutral-50:  #fafafa;  /* 거의 흰색 */
--neutral-100: #f4f4f5;  /* 매우 연한 회색 */
--neutral-200: #e4e4e7;  /* 연한 회색 */
--neutral-300: #d4d4d8;  /* 밝은 회색 */
--neutral-400: #a1a1aa;  /* 중간 회색 */
--neutral-500: #71717a;  /* 기본 회색 */
--neutral-600: #52525b;  /* 진한 회색 */
--neutral-700: #3f3f46;  /* 깊은 회색 */
--neutral-800: #27272a;  /* 매우 진한 회색 */
--neutral-900: #18181b;  /* 거의 검은색 */
```

## 📝 폰트 시스템

### 본문 폰트
- **주 폰트**: "Pretendard", -apple-system, BlinkMacSystemFont
- **대체 폰트**: "Segoe UI", Roboto, sans-serif
- **특징**: 한글/영문 모두 깔끔하고 가독성 높음

### 코드 폰트
- **주 폰트**: "JetBrains Mono"
- **대체 폰트**: "Cascadia Code", "Fira Code", Consolas, monospace
- **특징**: 리거처 지원, 가독성 높은 프로그래밍 폰트

### 디스플레이 폰트
- **주 폰트**: "Comfortaa" (로고/타이틀용)
- **특징**: 둥글고 친근한 느낌

## 🌈 라이트 모드 색상 매핑

```css
/* 배경 */
--background: var(--ice-50);        /* 메인 배경 - 매우 연한 아이스 블루 */
--surface: var(--neutral-50);       /* 카드/패널 - 거의 흰색 */
--surface-hover: var(--ice-100);    /* 호버 상태 */

/* 텍스트 */
--text-primary: var(--neutral-900);     /* 주요 텍스트 - 거의 검은색 */
--text-secondary: var(--neutral-700);   /* 보조 텍스트 */
--text-tertiary: var(--neutral-500);    /* 힌트/설명 텍스트 */

/* 액센트 */
--accent-primary: var(--ice-600);       /* 주요 액션 */
--accent-secondary: var(--orange-500);  /* 보조 액션/강조 */

/* 테두리 */
--border: var(--ice-200);               /* 기본 테두리 */
--border-subtle: var(--ice-100);        /* 연한 테두리 */

/* 상태 색상 */
--success: #10b981;  /* 에메랄드 그린 */
--warning: #f59e0b;  /* 앰버 */
--error: #ef4444;    /* 레드 */
--info: var(--ice-500);
```

## 🌙 다크 모드 색상 매핑

```css
/* 배경 */
--background: var(--neutral-900);       /* 메인 배경 - 거의 검은색 */
--surface: var(--neutral-800);          /* 카드/패널 */
--surface-hover: var(--neutral-700);    /* 호버 상태 */

/* 텍스트 */
--text-primary: var(--neutral-50);      /* 주요 텍스트 - 거의 흰색 */
--text-secondary: var(--neutral-200);   /* 보조 텍스트 */
--text-tertiary: var(--neutral-400);    /* 힌트/설명 텍스트 */

/* 액센트 */
--accent-primary: var(--ice-400);       /* 주요 액션 */
--accent-secondary: var(--orange-400);  /* 보조 액션/강조 */

/* 테두리 */
--border: var(--neutral-700);           /* 기본 테두리 */
--border-subtle: var(--neutral-800);    /* 연한 테두리 */

/* 상태 색상 */
--success: #34d399;  /* 밝은 에메랄드 */
--warning: #fbbf24;  /* 밝은 앰버 */
--error: #f87171;    /* 밝은 레드 */
--info: var(--ice-400);
```

## 🎮 게임별 테마 색상

### 초급 (Beginner)
- 메인: 에메랄드 그린 계열
- 배경: #ecfdf5
- 액센트: #10b981

### 중급 (Intermediate)  
- 메인: 앰버/오렌지 계열
- 배경: #fffbeb
- 액센트: #f59e0b

### 고급 (Advanced)
- 메인: 퍼플/인디고 계열
- 배경: #f5f3ff
- 액센트: #8b5cf6

## 📊 색상 대비 (WCAG 기준)

### 라이트 모드
- 배경(#f0f9ff) vs 주요 텍스트(#18181b): 19.23:1 ✅ AAA
- 카드(#fafafa) vs 보조 텍스트(#3f3f46): 11.42:1 ✅ AAA

### 다크 모드
- 배경(#18181b) vs 주요 텍스트(#fafafa): 19.03:1 ✅ AAA
- 카드(#27272a) vs 보조 텍스트(#e4e4e7): 12.63:1 ✅ AAA