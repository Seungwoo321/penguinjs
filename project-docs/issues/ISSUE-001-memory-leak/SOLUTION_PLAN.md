# 메모리 누수 해결 계획

## 1. 해결 목표

### 1.1 즉시 목표
- 메모리 사용량을 100MB 이하로 유지
- 경고 메시지 제거
- 안정적인 게임 플레이 보장

### 1.2 장기 목표
- 메모리 사용량 50% 감소 (목표: 50MB 이하)
- 성능 모니터링 시스템 구축
- 메모리 누수 방지 가이드라인 확립

## 2. 해결 방안

### 2.1 Phase 1: 긴급 수정 (1-2일)

#### A. useMemoryManagement 순환 참조 해결
```typescript
// 수정 전
useEffect(() => {
  if (isMemoryPressure && optimizeMemory) {
    optimizeMemory()
  }
}, [isMemoryPressure, optimizeMemory])

// 수정 후
useEffect(() => {
  if (isMemoryPressure) {
    const timer = setTimeout(() => {
      optimizeMemoryRef.current?.()
    }, 100)
    return () => clearTimeout(timer)
  }
}, [isMemoryPressure])
```

#### B. 메모리 관리 임계값 조정
```typescript
// 현재 설정
const MEMORY_LEAK_THRESHOLD = 100 // MB
const CLEANUP_INTERVAL = 60000 // 1분

// 수정 설정
const MEMORY_LEAK_THRESHOLD = 80 // MB
const CLEANUP_INTERVAL = 30000 // 30초
```

#### C. Context 상태 히스토리 크기 제한
```typescript
// 최대 50개 항목만 유지
const MAX_HISTORY_SIZE = 50

const newHistory = [...state.queueStatesHistory, newState].slice(-MAX_HISTORY_SIZE)
```

### 2.2 Phase 2: 구조 개선 (3-5일)

#### A. GameGuideModal 컴포넌트 분리
```
GameGuideModal.tsx (1200줄)
├── GameGuideHeader.tsx
├── GameGuideSteps.tsx
├── DifficultyGuides/
│   ├── BeginnerGuide.tsx
│   ├── IntermediateGuide.tsx
│   └── AdvancedGuide.tsx
└── GameGuideUtils.ts
```

#### B. DOM 조작 React 방식으로 전환
```typescript
// 이미지 lazy loading을 React 컴포넌트로 처리
const LazyImage: React.FC<{src: string}> = ({src}) => {
  return <img src={src} loading="lazy" />
}
```

#### C. 애니메이션 최적화
- Framer Motion → CSS Transitions 전환
- GPU 가속 활용
- will-change 속성 적용

### 2.3 Phase 3: 성능 최적화 (1주)

#### A. Web Worker 도입
```typescript
// memoryWorker.ts
self.addEventListener('message', (e) => {
  if (e.data.type === 'CHECK_MEMORY') {
    // 메모리 체크 로직
    self.postMessage({ type: 'MEMORY_STATUS', usage: memoryUsage })
  }
})
```

#### B. 가상 스크롤링 적용
```typescript
import { FixedSizeList } from 'react-window'

// 긴 리스트에 가상 스크롤링 적용
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

#### C. 리소스 풀링
```typescript
class AnimationControllerPool {
  private pool: AnimationController[] = []
  
  acquire(): AnimationController {
    return this.pool.pop() || new AnimationController()
  }
  
  release(controller: AnimationController) {
    controller.reset()
    this.pool.push(controller)
  }
}
```

## 3. 구현 우선순위

### 높음 (즉시 시작)
1. useMemoryManagement 순환 참조 해결
2. 메모리 임계값 조정
3. Context 히스토리 크기 제한

### 중간 (Phase 1 완료 후)
4. GameGuideModal 컴포넌트 분리
5. DOM 조작 React 전환
6. 애니메이션 최적화

### 낮음 (여유 있을 때)
7. Web Worker 도입
8. 가상 스크롤링
9. 리소스 풀링

## 4. 위험 관리

### 4.1 잠재적 위험
- 기존 기능 손상 가능성
- 성능 개선 미미할 가능성
- 새로운 버그 도입 위험

### 4.2 위험 완화 전략
- 단계별 점진적 적용
- 각 변경사항별 성능 측정
- 자동화된 테스트 작성
- 롤백 계획 수립

## 5. 성공 지표

### 5.1 정량적 지표
- 메모리 사용량: 100MB → 50MB (50% 감소)
- 경고 발생 빈도: 0회
- 페이지 로드 시간: 20% 개선

### 5.2 정성적 지표
- 사용자 불만 제로
- 부드러운 게임 플레이
- 장시간 플레이 가능