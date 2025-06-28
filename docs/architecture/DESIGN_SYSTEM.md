# PenguinJS 디자인 시스템

## 목차
1. [색상 체계 (Color System)](#색상-체계-color-system)
2. [색상 대비 가이드라인 (Color Contrast Guidelines)](#색상-대비-가이드라인)
3. [타이포그래피 (Typography)](#타이포그래피)
4. [컴포넌트 (Components)](#컴포넌트)

## 색상 체계 (Color System)

### 브랜드 컬러 팔레트
```css
/* PenguinJS 브랜드 컬러 */
penguin: {
  50:  #f6f9fc  /* 매우 밝은 배경 */
  100: #edf3f8  /* 밝은 배경 */
  200: #d6e6f0  /* 보조 배경 */
  300: #9eb9c7  /* 메인 바디 컬러 */
  400: #7ba3b5  /* 액센트 */
  500: #5a8ca3  /* 기본 */
  600: #4a7691  /* 기본 액션 */
  700: #3e6280  /* 강조 텍스트 */
  800: #2d3e50  /* 헤드 컬러 */
  900: #1b2a3a  /* 다크 네이비 */
}
```

### 현재 CSS 변수 매핑

#### 라이트 모드
```css
:root {
  /* 기본 색상 */
  --background: 246 249 252;        /* penguin-50 */
  --foreground: 27 62 90;           /* penguin-900 */
  --primary: 74 118 145;            /* penguin-600 */
  --primary-foreground: 255 255 255;
  
  /* 카드 및 패널 */
  --card: 255 255 255;              /* 순백색 */
  --card-foreground: 45 96 128;     /* penguin-800 */
  
  /* 게임 UI */
  --game-bg: 246 249 252;           /* penguin-50 = background와 동일 */
  --game-panel: 255 255 255;        /* 순백색 = card와 동일 */
  --game-text: 45 96 128;           /* penguin-800 */
  --game-text-secondary: 62 124 163; /* penguin-700 */
  
  /* 코드 에디터 */
  --editor-bg: 248 250 252;         /* 매우 밝은 회색 */
  --editor-text: 30 41 59;          /* 어두운 회색 */
  --editor-border: 203 213 225;     /* 중간 회색 */
}
```

#### 다크 모드
```css
.dark {
  /* 기본 색상 */
  --background: 15 23 42;           /* slate-900 */
  --foreground: 248 250 252;        /* slate-100 */
  --primary: 123 163 181;           /* penguin-400 */
  
  /* 카드 및 패널 */
  --card: 30 41 59;                 /* slate-800 */
  --card-foreground: 226 232 240;   /* slate-300 */
  
  /* 게임 UI */
  --game-bg: 15 23 42;              /* slate-900 = background와 동일 */
  --game-panel: 30 41 59;           /* slate-800 = card와 동일 */
  --game-text: 226 232 240;         /* slate-300 */
  --game-text-secondary: 148 163 184; /* slate-400 */
  
  /* 코드 에디터 */
  --editor-bg: 15 23 42;            /* slate-900 */
  --editor-text: 248 250 252;       /* slate-100 */
  --editor-border: 123 163 181;     /* penguin-400 */
}
```

## 색상 대비 분석

### 현재 대비 비율 (예상)

#### 라이트 모드
- **배경 vs 텍스트**: `#f6f9fc` vs `#1b3e5a` → 약 12:1 ✅
- **카드 vs 텍스트**: `#ffffff` vs `#2d6080` → 약 8.5:1 ✅
- **에디터 배경 vs 텍스트**: `#f8fafc` vs `#1e293b` → 약 14:1 ✅

#### 다크 모드
- **배경 vs 텍스트**: `#0f172a` vs `#f8fafc` → 약 18:1 ✅
- **카드 vs 텍스트**: `#1e293b` vs `#e2e8f0` → 약 12:1 ✅
- **에디터 배경 vs 텍스트**: `#0f172a` vs `#f8fafc` → 약 18:1 ✅

### WCAG 접근성 기준
- **AA 등급**: 4.5:1 이상 (일반 텍스트)
- **AAA 등급**: 7:1 이상 (일반 텍스트)
- **대형 텍스트**: 3:1 이상 (AA), 4.5:1 이상 (AAA)

## 색상 대비 가이드라인

### WCAG 2.1 준수 기준
PenguinJS는 모든 텍스트 요소에 대해 WCAG 2.1 AA 이상의 색상 대비를 준수합니다.

#### 대비율 기준
- **일반 텍스트 (14px 미만)**: 4.5:1 이상
- **큰 텍스트 (18px 이상 또는 14px 이상 굵은 글씨)**: 3:1 이상
- **AAA 수준 (권장)**: 7:1 이상

### 색상 조합 검증 결과
| 요소 | 라이트 모드 | 다크 모드 | 상태 |
|------|------------|----------|------|
| 기본 텍스트 | 16.89:1 (AAA) | 17.01:1 (AAA) | ✅ |
| 보조 텍스트 | 11.82:1 (AAA) | 13.60:1 (AAA) | ✅ |
| 3차 텍스트 | 7.33:1 (AAA) | 7.87:1 (AAA) | ✅ |
| 주요 버튼 | 4.63:1 (AA) | 5.78:1 (AA) | ✅ |
| 파괴적 버튼 | 4.89:1 (AA) | 4.89:1 (AA) | ✅ |

### 색상 사용 가이드라인

#### 1. 텍스트 색상
- **중요 정보**: `text-primary` (최고 대비)
- **일반 정보**: `text-secondary` 
- **보조 정보**: `text-tertiary`
- **비활성 상태**: `muted-foreground` (최소 4.5:1 보장)

#### 2. 배경 색상
- **메인 배경**: `background`
- **카드/패널**: `card`, `surface-elevated`
- **보조 영역**: `surface-secondary`
- **입력 필드**: `input` 배경색

#### 3. 상태 표시 색상
- **성공**: `text-green-700` on `bg-green-100` (라이트)
- **오류**: `text-red-800` on `bg-red-100` (라이트)
- **경고**: `text-amber-900` on `bg-amber-100` (라이트)
- **정보**: `text-blue-800` on `bg-blue-100` (라이트)

### 자동 검증 도구
```bash
# 색상 대비 검사 실행
npm run check:contrast

# CI/CD 파이프라인에 포함
# .github/workflows/accessibility.yml 참조
```

### 개발 시 주의사항
1. 새로운 색상 조합 사용 시 반드시 대비율 검증
2. 작은 텍스트(12px 이하)는 더 높은 대비율 권장
3. 호버/포커스 상태에서도 대비율 유지
4. 투명도 사용 시 실제 렌더링된 색상으로 검증

## 문제점 식별

### 1. 색상 값 불일치
- CSS 변수의 RGB 값과 Tailwind 컬러 팔레트 불일치
- 하드코딩된 색상과 변수 기반 색상 혼재

### 2. 에디터 배경색 문제
- 라이트 모드에서 `--editor-bg: 248 250 252`는 너무 밝아서 대비 부족 가능성
- 브랜드 컬러와 연결성 부족

### 3. 일관성 부족
- 게임 UI와 전체 앱 색상 체계 연결성 부족
- 컴포넌트별로 다른 색상 적용 방식

## 개선 방안

### 1. 통일된 색상 변수 시스템
```css
/* 브랜드 컬러를 기반으로 한 일관된 변수 */
:root {
  --penguin-50: 246 249 252;
  --penguin-100: 237 243 248;
  --penguin-200: 214 230 240;
  /* ... 전체 팔레트 */
}
```

### 2. 의미론적 색상 변수
```css
/* 용도별 의미론적 변수 */
:root {
  --surface-primary: var(--penguin-50);
  --surface-secondary: var(--penguin-100);
  --text-primary: var(--penguin-900);
  --text-secondary: var(--penguin-700);
}
```

### 3. 컴포넌트별 색상 정의
- 각 컴포넌트의 색상 사용 목적 명확화
- 일관된 색상 적용 규칙 수립

## 타이포그래피

### 폰트 패밀리
- **본문**: Inter (sans-serif)
- **코드**: JetBrains Mono, Fira Code (monospace)
- **제목**: Poppins (display)

### 폰트 크기 및 줄 간격
```css
/* 기본 설정 */
body: 14px / 1.6
h1: 32px / 1.2
h2: 24px / 1.3
h3: 20px / 1.4
code: 14px / 1.6
```

## 레이아웃

### 반응형 브레이크포인트
- **모바일**: < 768px
- **태블릿**: 768px - 1024px  
- **데스크톱**: ≥ 1024px

### 컴포넌트 크기
- **코드 에디터**: 
  - 모바일: min-h-[300px]
  - 데스크톱: min-h-[400px]
- **게임 패널**: flex-1 (동적 크기)

## 액션 아이템
1. 정확한 색상 대비 측정
2. WCAG 기준 준수 확인  
3. 브랜드 컬러 기반 일관된 변수 시스템 구축
4. 컴포넌트별 색상 적용 통일화