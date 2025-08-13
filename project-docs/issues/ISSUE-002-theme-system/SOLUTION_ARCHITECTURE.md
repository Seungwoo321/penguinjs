# 올바른 테마 시스템 아키텍처

## 설계 철학

### 1. 근본 원칙

#### Single Source of Truth
- 모든 테마 값은 CSS Custom Properties에서 정의
- JavaScript는 읽기만 가능, 쓰기 불가
- 중복 정의 제거

#### Zero Runtime Cost
- 테마 전환이 CSS만으로 이루어짐
- JavaScript 실행 없이 즉각 반영
- 리렌더링 최소화

#### Type Safety First
- 모든 토큰에 TypeScript 타입 정의
- 컴파일 타임 검증
- IDE 자동완성 지원

#### Progressive Enhancement
- CSS 변수 미지원 브라우저도 기본 동작
- JavaScript 없이도 기본 테마 표시
- 점진적 기능 향상

## 아키텍처 설계

### Layer 1: Design Token System

```css
/* globals.css */
@layer primitives {
  :root {
    /* Color Primitives - RGB 값으로 정의 */
    --primitive-white: 255 255 255;
    --primitive-black: 0 0 0;
    
    /* Gray Scale */
    --primitive-gray-50: 248 250 252;
    --primitive-gray-100: 241 245 249;
    --primitive-gray-200: 226 232 240;
    --primitive-gray-300: 203 213 225;
    --primitive-gray-400: 148 163 184;
    --primitive-gray-500: 100 116 139;
    --primitive-gray-600: 71 85 105;
    --primitive-gray-700: 51 65 85;
    --primitive-gray-800: 30 41 59;
    --primitive-gray-900: 15 23 42;
    
    /* Brand Colors */
    --primitive-penguin-50: 246 249 252;
    --primitive-penguin-100: 237 243 248;
    --primitive-penguin-200: 214 230 240;
    --primitive-penguin-300: 158 185 199;
    --primitive-penguin-400: 123 163 181;
    --primitive-penguin-500: 90 140 163;
    --primitive-penguin-600: 74 118 145;
    --primitive-penguin-700: 62 98 128;
    --primitive-penguin-800: 45 62 80;
    --primitive-penguin-900: 27 42 58;
  }
}

@layer semantics {
  :root {
    /* Semantic Tokens - 의미론적 이름 */
    --semantic-background-primary: rgb(var(--primitive-white));
    --semantic-background-secondary: rgb(var(--primitive-gray-50));
    --semantic-background-elevated: rgb(var(--primitive-white));
    
    --semantic-text-primary: rgb(var(--primitive-gray-900));
    --semantic-text-secondary: rgb(var(--primitive-gray-700));
    --semantic-text-disabled: rgb(var(--primitive-gray-400));
    
    --semantic-border-primary: rgb(var(--primitive-gray-200));
    --semantic-border-secondary: rgb(var(--primitive-gray-100));
    
    --semantic-interactive-primary: rgb(var(--primitive-penguin-600));
    --semantic-interactive-primary-hover: rgb(var(--primitive-penguin-700));
  }
  
  /* Dark Theme Override */
  :root:has(.dark) {
    --semantic-background-primary: rgb(var(--primitive-gray-900));
    --semantic-background-secondary: rgb(var(--primitive-gray-800));
    --semantic-background-elevated: rgb(var(--primitive-gray-800));
    
    --semantic-text-primary: rgb(var(--primitive-gray-50));
    --semantic-text-secondary: rgb(var(--primitive-gray-200));
    --semantic-text-disabled: rgb(var(--primitive-gray-600));
    
    --semantic-border-primary: rgb(var(--primitive-gray-700));
    --semantic-border-secondary: rgb(var(--primitive-gray-800));
    
    --semantic-interactive-primary: rgb(var(--primitive-penguin-400));
    --semantic-interactive-primary-hover: rgb(var(--primitive-penguin-300));
  }
}

@layer components {
  :root {
    /* Component-specific Tokens */
    --component-modal-background: var(--semantic-background-elevated);
    --component-modal-text: var(--semantic-text-primary);
    --component-modal-backdrop: rgba(0, 0, 0, 0.5);
    
    --component-button-primary-bg: var(--semantic-interactive-primary);
    --component-button-primary-text: rgb(var(--primitive-white));
    --component-button-primary-hover: var(--semantic-interactive-primary-hover);
    
    --component-game-board-bg: var(--semantic-background-secondary);
    --component-game-cell-bg: var(--semantic-background-elevated);
    --component-game-character: rgb(251 191 36); /* amber-400 */
  }
}
```

### Layer 2: Type System

```typescript
// theme/tokens.ts
export const primitiveColors = {
  white: 'var(--primitive-white)',
  black: 'var(--primitive-black)',
  gray: {
    50: 'var(--primitive-gray-50)',
    100: 'var(--primitive-gray-100)',
    200: 'var(--primitive-gray-200)',
    300: 'var(--primitive-gray-300)',
    400: 'var(--primitive-gray-400)',
    500: 'var(--primitive-gray-500)',
    600: 'var(--primitive-gray-600)',
    700: 'var(--primitive-gray-700)',
    800: 'var(--primitive-gray-800)',
    900: 'var(--primitive-gray-900)',
  },
  penguin: {
    50: 'var(--primitive-penguin-50)',
    // ... etc
  }
} as const;

export const semanticTokens = {
  background: {
    primary: 'var(--semantic-background-primary)',
    secondary: 'var(--semantic-background-secondary)',
    elevated: 'var(--semantic-background-elevated)',
  },
  text: {
    primary: 'var(--semantic-text-primary)',
    secondary: 'var(--semantic-text-secondary)',
    disabled: 'var(--semantic-text-disabled)',
  },
  border: {
    primary: 'var(--semantic-border-primary)',
    secondary: 'var(--semantic-border-secondary)',
  },
  interactive: {
    primary: 'var(--semantic-interactive-primary)',
    primaryHover: 'var(--semantic-interactive-primary-hover)',
  }
} as const;

export const componentTokens = {
  modal: {
    background: 'var(--component-modal-background)',
    text: 'var(--component-modal-text)',
    backdrop: 'var(--component-modal-backdrop)',
  },
  button: {
    primary: {
      background: 'var(--component-button-primary-bg)',
      text: 'var(--component-button-primary-text)',
      hover: 'var(--component-button-primary-hover)',
    }
  },
  game: {
    board: 'var(--component-game-board-bg)',
    cell: 'var(--component-game-cell-bg)',
    character: 'var(--component-game-character)',
  }
} as const;

// Type exports
export type PrimitiveColor = typeof primitiveColors;
export type SemanticToken = typeof semanticTokens;
export type ComponentToken = typeof componentTokens;

// Helper function with type safety
export function token<
  T extends keyof SemanticToken,
  K extends keyof SemanticToken[T]
>(category: T, token: K): string {
  return semanticTokens[category][token];
}

// CSS-in-TS helper
export const css = {
  bg: (token: string) => ({ backgroundColor: token }),
  text: (token: string) => ({ color: token }),
  border: (token: string) => ({ borderColor: token }),
} as const;
```

### Layer 3: Portal Solution

```typescript
// components/ThemedPortal.tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ThemedPortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export function ThemedPortal({ 
  children, 
  containerId = 'theme-portal-root' 
}: ThemedPortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  
  useLayoutEffect(() => {
    // Create or find portal container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'contents'; // No layout impact
      document.body.appendChild(container);
    }
    
    portalRef.current = container as HTMLDivElement;
    
    // Sync CSS custom properties
    const syncCustomProperties = () => {
      if (!portalRef.current) return;
      
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Get all custom properties
      const customProps = Array.from(computedStyle)
        .filter(prop => prop.startsWith('--'));
      
      // Apply to portal container
      customProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        portalRef.current!.style.setProperty(prop, value);
      });
      
      // Also sync theme class
      const isDark = root.classList.contains('dark');
      portalRef.current.classList.toggle('dark', isDark);
    };
    
    // Initial sync
    syncCustomProperties();
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      const hasRelevantChange = mutations.some(
        mutation => 
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || 
           mutation.attributeName === 'style')
      );
      
      if (hasRelevantChange) {
        syncCustomProperties();
      }
    });
    
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      subtree: false
    });
    
    setMounted(true);
    
    return () => {
      observer.disconnect();
      // Don't remove container - other portals might use it
    };
  }, [containerId]);
  
  if (!mounted || !portalRef.current) {
    return null;
  }
  
  return createPortal(children, portalRef.current);
}
```

### Layer 4: Component Implementation

```typescript
// components/GameGuideModal.tsx
'use client';

import { ThemedPortal } from './ThemedPortal';
import { componentTokens } from '@/theme/tokens';
import { motion, AnimatePresence } from 'framer-motion';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}

export function GameGuideModal({ isOpen, onClose }: GameGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <ThemedPortal>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: componentTokens.modal.backdrop }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="rounded-2xl shadow-2xl max-w-2xl w-full"
              style={{
                backgroundColor: componentTokens.modal.background,
                color: componentTokens.modal.text,
              }}
            >
              {/* Modal content */}
            </div>
          </motion.div>
        </ThemedPortal>
      )}
    </AnimatePresence>
  );
}
```

### Layer 5: Tailwind Integration

```css
/* globals.css - Tailwind v4 integration */
@theme {
  /* Map CSS variables to Tailwind */
  --color-background: var(--semantic-background-primary);
  --color-foreground: var(--semantic-text-primary);
  --color-card: var(--semantic-background-elevated);
  --color-card-foreground: var(--semantic-text-primary);
  --color-primary: var(--semantic-interactive-primary);
  --color-primary-foreground: rgb(var(--primitive-white));
  --color-border: var(--semantic-border-primary);
}

/* Utility classes */
@layer utilities {
  .theme-bg-primary {
    background-color: var(--semantic-background-primary);
  }
  
  .theme-text-primary {
    color: var(--semantic-text-primary);
  }
  
  .theme-modal {
    background-color: var(--component-modal-background);
    color: var(--component-modal-text);
  }
}
```

## 구현 로드맵

### Phase 1: Foundation (3일)
1. CSS Token System 구축
2. TypeScript 타입 정의
3. 빌드 파이프라인 설정

### Phase 2: Core Components (5일)
1. ThemedPortal 구현 및 테스트
2. 핵심 UI 컴포넌트 마이그레이션
3. 게임 모달 컴포넌트 수정

### Phase 3: Migration (7일)
1. 모든 게임 컴포넌트 순차 마이그레이션
2. 레거시 코드 제거
3. 통합 테스트

### Phase 4: Documentation (2일)
1. 개발자 가이드 작성
2. 컴포넌트 스토리북 업데이트
3. 마이그레이션 가이드

## 성공 지표

1. **기능적 지표**
   - 모든 컴포넌트에서 테마 정상 작동
   - Portal 컴포넌트 테마 전파 성공
   - 타입 안전성 100% 달성

2. **성능 지표**
   - 테마 전환 시 리렌더링 50% 감소
   - JavaScript 번들 사이즈 10% 감소
   - First Contentful Paint 개선

3. **개발자 경험**
   - 자동완성 지원
   - 컴파일 타임 오류 검출
   - 일관된 API

## 위험 요소 및 대응 방안

1. **브라우저 호환성**
   - CSS Custom Properties 미지원 브라우저
   - 대응: PostCSS 폴백 제공

2. **마이그레이션 리스크**
   - 기존 코드 breaking change
   - 대응: 점진적 마이그레이션, Feature Flag 활용

3. **성능 이슈**
   - 많은 CSS 변수로 인한 성능 저하
   - 대응: Critical CSS 추출, 사용하지 않는 토큰 제거