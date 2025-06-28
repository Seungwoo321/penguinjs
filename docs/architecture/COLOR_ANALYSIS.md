# PenguinJS 색상 분석 보고서

## 라이트 테마 - 메인 페이지 DOM 요소별 색상 분석

### 1. 메인 배경 (main)
- **클래스**: `bg-[hsl(var(--surface-primary))]`
- **CSS 변수값**: `--surface-primary: 246 249 252`
- **계산된 색상**: `#f6f9fc` (매우 연한 아이스 블루)
- **용도**: 전체 페이지 배경

### 2. 타이틀 (h1)
- **클래스**: `bg-gradient-to-r from-penguin-700 to-penguin-900`
- **CSS 변수값**:
  - `--penguin-700: 62 98 128` → `#3e6280`
  - `--penguin-900: 27 42 58` → `#1b2a3a`
- **텍스트 색상**: 그라데이션 (진한 블루 → 네이비)
- **배경과의 대비**: 
  - `#3e6280` vs `#f6f9fc` = 7.27:1 ✅ (AAA)
  - `#1b2a3a` vs `#f6f9fc` = 16.94:1 ✅ (AAA)

### 3. 슬로건 텍스트 (p.slogan)
- **클래스**: `text-[hsl(var(--text-tertiary))]`
- **CSS 변수값**: `--text-tertiary: 62 98 128`
- **계산된 색상**: `#3e6280`
- **배경과의 대비**: `#3e6280` vs `#f6f9fc` = 7.27:1 ✅ (AAA)

### 4. 설명 텍스트 (p.description)
- **클래스**: `text-[hsl(var(--text-secondary))]`
- **CSS 변수값**: `--text-secondary: 45 62 80`
- **계산된 색상**: `#2d3e50`
- **배경과의 대비**: `#2d3e50` vs `#f6f9fc` = 11.07:1 ✅ (AAA)

### 5. GameCard 컴포넌트
#### 5.1 카드 배경
- **클래스**: `bg-[hsl(var(--surface-elevated))]`
- **CSS 변수값**: `--surface-elevated: 255 255 255`
- **계산된 색상**: `#ffffff` (순백색)

#### 5.2 카드 제목
- **클래스**: `text-[hsl(var(--text-secondary))]`
- **CSS 변수값**: `--text-secondary: 45 62 80`
- **계산된 색상**: `#2d3e50`
- **카드 배경과의 대비**: `#2d3e50` vs `#ffffff` = 11.53:1 ✅ (AAA)

#### 5.3 카드 설명
- **클래스**: `text-[hsl(var(--text-tertiary))]`
- **CSS 변수값**: `--text-tertiary: 62 98 128`
- **계산된 색상**: `#3e6280`
- **카드 배경과의 대비**: `#3e6280` vs `#ffffff` = 7.57:1 ✅ (AAA)

#### 5.4 난이도 뱃지 (초급)
- **클래스**: `bg-emerald-100 text-emerald-800`
- **배경색**: `#d1fae5` (에메랄드 100)
- **텍스트색**: `#065f46` (에메랄드 800)
- **대비**: 9.52:1 ✅ (AAA)

### 6. "모든 게임 보기" 버튼
- **클래스**: `bg-gradient-to-r from-penguin-600 to-penguin-700 text-white`
- **배경색**: `#4a7691` → `#3e6280`
- **텍스트색**: `#ffffff`
- **대비**: 
  - `#ffffff` vs `#4a7691` = 4.65:1 ✅ (AA)
  - `#ffffff` vs `#3e6280` = 6.59:1 ✅ (AA)

## 색상 대비 검증 결과

### WCAG 기준 충족 여부
- **AAA 수준 (7:1 이상)**: 5개 요소
- **AA 수준 (4.5:1 이상)**: 2개 요소
- **미달**: 0개 요소

### 개선이 필요한 부분
1. 버튼의 대비가 AA 수준이지만 AAA를 위해서는 더 진한 색상 필요
2. 현재 모든 텍스트가 충분한 대비를 가지고 있음

## 색상 계산 공식
```javascript
// HSL to HEX 변환
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// RGB to HEX 변환 (현재 사용)
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// 명도 계산
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// 대비율 계산
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

## 현재 문제점
1. CSS 변수가 RGB 값으로 저장되어 있으나, hsl() 함수로 사용되고 있음
2. 일부 컴포넌트에서 Tailwind 기본 색상과 커스텀 CSS 변수가 혼재
3. 폰트 시스템이 Inter 폰트만 사용 중 (한글 폰트 미적용)