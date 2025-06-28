# PenguinJS 게임 개발 가이드

이 가이드는 JavaScript 개념 학습 게임을 쉽게 개발할 수 있도록 도와줍니다.

## 아키텍처 개요

### 핵심 컴포넌트

1. **GameManager**: 모든 게임의 진행 상황과 잠금 해제를 관리
2. **GameFactory**: 새로운 게임을 쉽게 생성할 수 있는 유틸리티
3. **공통 타입 시스템**: 모든 게임이 공유하는 타입 정의
4. **게임 엔진**: 각 게임별 로직과 검증 시스템

## 새로운 게임 개발 단계

### 1. 게임 기획 (js-concept-games-detailed-plan.md 참고)

```markdown
## N. 🎮 Your Game Name

### 게임 타입: **구체적인 게임 장르**
- **테마**: 매력적인 테마 설정
- **목표**: 명확한 학습 목표

### 게임플레이
- 상세한 게임 메커니즘 5-6개 항목

### 특별 요소 (카드/아이템/도구 등)
- 게임에 특화된 요소들 5-6개

### 스테이지 구성
**🟢 Beginner (5 stages)**
- 구체적인 학습 목표 5개

**🟡 Intermediate (5 stages)**  
- 중급 수준 학습 목표 5개

**🔴 Advanced (5 stages)**
- 고급 수준 학습 목표 5개
```

### 2. 레벨 데이터 생성

```typescript
// src/games/your-game/levels.ts
import { GameLevel, GameDifficulty } from '../shared/types'
import { GameFactory } from '../shared/GameFactory'

export const yourGameLevels = {
  beginner: [
    GameFactory.createLevelTemplate('your-game', 'beginner', 1, {
      title: '첫 번째 도전',
      description: '게임 설명',
      objective: '🎯 목표 설명',
      codeTemplate: `// 템플릿 코드
function solution() {
  // 여기에 코드 작성
}
return solution;`,
      hints: GameFactory.hintTemplates.functionBasic,
      explanation: '개념 설명',
      solutionValidator: GameFactory.validators.functionReturns('예상 결과')
    }),
    // ... 4개 더 추가
  ],
  intermediate: [
    // ... 5개 추가
  ],
  advanced: [
    // ... 5개 추가
  ]
}
```

### 3. 게임 엔진 구현

```typescript
// src/games/your-game/game-engine.ts
import { GameLevel, GameDifficulty, GameValidationResult } from '../shared/types'
import { yourGameLevels } from './levels'

export class YourGameEngine {
  private levels: Map<string, GameLevel> = new Map()

  constructor() {
    this.initializeLevels()
  }

  private initializeLevels(): void {
    Object.values(yourGameLevels).flat().forEach(level => {
      this.levels.set(level.id, level)
    })
  }

  getLevelsByDifficulty(difficulty: GameDifficulty): GameLevel[] {
    return yourGameLevels[difficulty] || []
  }

  validateSolution(level: GameLevel, userCode: string): GameValidationResult {
    try {
      const func = new Function('return ' + userCode)
      const result = func()
      
      const isValid = level.solutionValidator(userCode, result)
      
      if (isValid) {
        return {
          success: true,
          message: '성공! 🎉',
          characterPath: this.calculatePath(level),
          score: this.calculateScore(level)
        }
      } else {
        return {
          success: false,
          message: '다시 시도해보세요! 🤔'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `오류: ${error.message} ❌`
      }
    }
  }

  getGameConfig() {
    return {
      id: 'your-game',
      name: '게임 이름',
      description: '게임 설명',
      icon: '🎮',
      difficulties: ['beginner', 'intermediate', 'advanced'],
      totalStagesPerDifficulty: 5,
      unlockRequirements: {
        beginner: {},
        intermediate: { requiredDifficulty: 'beginner' },
        advanced: { requiredDifficulty: 'intermediate' }
      }
    }
  }
}
```

### 4. 게임 컴포넌트 구현

```typescript
// src/games/your-game/YourGameComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import { GameManager } from '../shared/GameManager'
import { YourGameEngine } from './game-engine'

export function YourGameComponent() {
  const [gameEngine] = useState(() => new YourGameEngine())
  const [gameManager] = useState(() => GameManager.getInstance())
  
  useEffect(() => {
    // 게임 등록
    const config = gameEngine.getGameConfig()
    gameManager.registerGame(config)
  }, [])

  // 게임 로직 구현...
  
  return (
    <div>
      {/* 게임 UI */}
    </div>
  )
}
```

### 5. 게임 안내 모달 구현 (필수)

```typescript
// src/games/your-game/GameGuideModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Target, Layers, ArrowRight } from 'lucide-react'

interface GameGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

export function GameGuideModal({ isOpen, onClose, onStart }: GameGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const guideSteps = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "게임명에 오신 것을 환영합니다!",
      content: "게임 테마와 학습 목표 설명",
      visual: (
        // 실제 게임 화면과 일치하는 미니 버전
        <div className="실제게임화면과동일한스타일">
          {/* 게임 특화 시각화 요소 */}
        </div>
      )
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "게임 목표",
      content: "학습할 JavaScript 개념과 단계별 목표",
      visual: (
        <div className="space-y-3">
          {/* 단계별 학습 과정 시각화 */}
        </div>
      )
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "게임 방법",
      content: "조작 방법과 UI 사용법",
      visual: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 실제 게임 UI의 축소 버전 */}
        </div>
      )
    }
  ]

  // 나머지 모달 구현...
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* 모달 내용 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* 헤더, 진행 표시, 콘텐츠, 버튼 구현 */}
              {/* 중요: 라이트 테마에서 명확한 색상 대비 유지 */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### 6. 게임 컴포넌트에 안내 모달 통합

```typescript
// src/games/your-game/YourGameComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import { GameGuideModal } from './GameGuideModal'

export function YourGameComponent() {
  const [showGuide, setShowGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)

  useEffect(() => {
    // 최초 방문 시 자동으로 가이드 표시
    if (!hasSeenGuide) {
      setShowGuide(true)
    }
  }, [hasSeenGuide])

  const handleGuideStart = () => {
    setShowGuide(false)
    setHasSeenGuide(true)
    // 게임 시작 로직
  }

  return (
    <div className="min-h-screen">
      {/* 게임 가이드 모달 */}
      <GameGuideModal 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onStart={handleGuideStart}
      />
      
      {/* 메인 게임 UI */}
      <div className="max-w-7xl mx-auto p-4">
        {/* 헤더에 가이드 재열기 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <h1>게임 제목</h1>
          <button
            onClick={() => setShowGuide(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            게임 가이드 보기
          </button>
        </div>
        
        {/* 나머지 게임 UI */}
      </div>
    </div>
  )
}
```

### 7. 라우팅 설정

```typescript
// app/[locale]/games/your-game/page.tsx
import { YourGameComponent } from '@/src/games/your-game/YourGameComponent'

export default function YourGamePage() {
  return <YourGameComponent />
}
```

## 개발 도구 활용

### GameFactory 유틸리티

```typescript
import { GameFactory } from '../shared/GameFactory'

// 레벨 생성
const level = GameFactory.createLevelTemplate('game-id', 'beginner', 1, {
  // 레벨 데이터
})

// 검증자 사용
const validator = GameFactory.validators.functionReturns('expected')

// 힌트 템플릿 사용  
const hints = GameFactory.hintTemplates.functionBasic

// 아이템 생성
const treasure = GameFactory.itemTemplates.treasure('id', {row: 0, col: 0}, '💎')
```

### 공통 컴포넌트 활용

- `GamePanel`: 게임 패널 래퍼
- `CodeEditor`: 코드 에디터
- `Button`: 일관된 버튼 스타일
- `ThemeToggle`: 테마 전환

## 예제: 클로저 동굴 분석

클로저 동굴 게임 구현을 참고하세요:

- `src/games/closure-cave/complete-levels.ts`: 15단계 레벨 정의
- `src/games/closure-cave/enhanced-game-engine.ts`: 게임 엔진
- `src/games/closure-cave/EnhancedClosureCaveGame.tsx`: UI 컴포넌트

## 모범 사례

1. **일관된 구조**: 모든 게임이 같은 패턴을 따르도록
2. **재사용 가능한 컴포넌트**: 공통 요소는 shared에서 가져오기
3. **점진적 난이도**: 각 스테이지가 자연스럽게 연결되도록
4. **명확한 피드백**: 성공/실패 시 의미 있는 메시지 제공
5. **접근성 고려**: WCAG AAA 수준의 색상 대비 유지
6. **필수 게임 안내 모달**: 모든 게임은 반드시 안내 모달 구현
   - 실제 게임 화면과 일치하는 시각적 디자인
   - 라이트 테마에서 명확한 색상 대비 (텍스트: slate-700 이상)
   - 3단계 구성: 게임 소개 → 게임 목표 → 게임 방법
   - 상호작용 미리보기 제공

## 테스트

```typescript
// 게임 엔진 검증
const engine = new YourGameEngine()
const validation = engine.validateAllLevels()
console.log(`Valid: ${validation.valid}, Invalid: ${validation.invalid}`)
```

## 배포

1. 게임 완성 후 메인 페이지에 카드 추가
2. 내비게이션 메뉴에 링크 추가  
3. 다국어 지원을 위한 번역 파일 업데이트

이 가이드를 따라하면 일관되고 확장 가능한 JavaScript 학습 게임을 쉽게 개발할 수 있습니다.