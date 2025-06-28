# 다음 개발 계획 - CallStack Library Game

## 개요
CallStack Library 게임의 고급 스테이지들 중 특별한 큐 시스템을 사용하는 스테이지들에 대한 레이아웃 개선이 필요합니다.

## 현재 상태

### ✅ 완료된 스테이지
- **고급 스테이지 2 (Event Loop 시뮬레이션)**
  - 큐 타입: `callstack`, `microtask`, `macrotask`
  - 구현 내용:
    - IntegratedCallStackBoard 컴포넌트에 expandOrderSection=true 적용
    - 왼쪽 50%: 콜스택 책장 + 긴급/일반 반납대
    - 오른쪽 50%: 예상 실행 순서 영역

### ❌ 개발 필요 스테이지

#### 1. 고급 스테이지 6 - 우선순위 큐
- **큐 타입**: `callstack`, `priority`
- **필요 기능**:
  - 우선순위 큐 시각화 (우선순위별 정렬)
  - 우선순위 레벨 표시
  - 우선순위에 따른 실행 순서 예측

#### 2. 고급 스테이지 7 - 원형 큐
- **큐 타입**: `callstack`, `circular`
- **필요 기능**:
  - 원형 버퍼 시각화
  - 현재 위치(head/tail) 표시
  - 버퍼 오버플로우 처리 시각화

#### 3. 고급 스테이지 8 - 덱 (양방향 큐)
- **큐 타입**: `callstack`, `deque`
- **필요 기능**:
  - 양방향 삽입/삭제 시각화
  - 앞/뒤 구분 표시
  - pushFront/pushBack, popFront/popBack 동작 시각화

#### 4. 고급 스테이지 9 - 통합 큐 시스템
- **큐 타입**: `callstack`, `microtask`, `macrotask`, `priority`, `animation`
- **필요 기능**:
  - 5개 큐 타입 모두 표시
  - 복잡한 실행 순서 시각화
  - 애니메이션 프레임 타이밍 표시

## 구현 방향

### 1. 컴포넌트 구조 개선
```typescript
// CallStackLibraryGame.tsx
{selectedDifficulty === 'advanced' && currentStage === 6 ? (
  // 우선순위 큐 특별 레이아웃
  <PriorityQueueBoard ... />
) : selectedDifficulty === 'advanced' && currentStage === 7 ? (
  // 원형 큐 특별 레이아웃
  <CircularQueueBoard ... />
) : ...}
```

### 2. 각 스테이지별 전용 컴포넌트 개발
- `PriorityQueueBoard.tsx`: 우선순위 큐 전용
- `CircularQueueBoard.tsx`: 원형 큐 전용
- `DequeBoard.tsx`: 덱 전용
- `MultiQueueBoard.tsx`: 통합 큐 시스템 전용

### 3. 공통 기능
- 드래그 앤 드롭으로 실행 순서 예측
- 시각적 피드백 (정답/오답)
- 애니메이션 효과
- 큐별 특성 설명

## 우선순위
1. **고급 스테이지 9** (가장 복잡, 모든 큐 타입 포함)
2. **고급 스테이지 6** (우선순위 큐)
3. **고급 스테이지 7** (원형 큐)
4. **고급 스테이지 8** (덱)

## 예상 작업 시간
- 각 스테이지별 컴포넌트 개발: 4-6시간
- 테스트 및 디버깅: 2시간
- 전체 예상 시간: 약 20-30시간

## 참고 사항
- 고급 스테이지 2의 구현을 참조하여 일관성 있는 UI/UX 제공
- 각 큐 타입의 특성을 직관적으로 이해할 수 있는 시각화 필요
- 모바일 반응형 디자인 고려