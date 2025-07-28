# 메모리 누수 문제 분석

## 1. 문제 현상

### 1.1 발생 위치
- **게임**: 콜스택 도서관 (CallStack Library)
- **단계**: 고급 스테이지 6 (전체 스테이지 22)
- **증상**: 아무 조작 없이도 메모리 사용량 109.97MB 경고 발생

### 1.2 경고 메시지 (업데이트)
```
초기 상태: 🚨 Memory leak detected: 109.97MB used (threshold: 100MB)
수정 후 악화: 🚨 Memory leak detected: 229.71MB used (threshold: 80MB)
```

**⚠️ 중요: 수정 작업 후 메모리 사용량이 2배 증가 (109.97MB → 229.71MB)**

### 1.3 사용자 영향
- 게임 플레이 중 지속적인 경고 메시지로 인한 사용자 경험 저하
- 장시간 플레이 시 브라우저 성능 저하 가능성
- 메모리 부족으로 인한 게임 크래시 위험

## 2. 근본 원인 분석

### 2.1 useMemoryManagement Hook의 순환 참조 (수정 후 악화)

#### 원인 분석: 의존성 배열의 치명적 오류
```typescript
// useMemoryManagement.ts:179 - 수정 작업 중 추가된 심각한 버그
useEffect(() => {
  // ...interval 생성 코드...
}, [enableMonitoring, cleanupInterval, collectMemoryStats, 
    stats.usedJSHeapSize, // ← 이것이 무한 루프의 원인!
    leakThreshold, maxComponentAge, forceCleanup])
```

**심각한 문제점**:
1. `stats.usedJSHeapSize`가 의존성 배열에 포함됨
2. `collectMemoryStats()` 호출 → `stats` 업데이트 → `usedJSHeapSize` 변경
3. useEffect 재실행 → 새로운 interval 생성
4. **이전 interval이 정리되지 않음** → 다중 interval 동시 실행
5. 메모리 사용량 기하급수적 증가

#### 메모리 누수 2배 증가의 메커니즘
```
시간 0초: interval 1개 생성
시간 30초: stats 업데이트 → interval 2개 동시 실행
시간 60초: stats 업데이트 → interval 4개 동시 실행  
시간 90초: stats 업데이트 → interval 8개 동시 실행
→ 지수적으로 메모리 사용량 증가
```

### 2.2 DOM 직접 조작
```typescript
// optimizeMemory 함수 내부
const images = document.querySelectorAll('img')
images.forEach(img => {
  img.loading = 'lazy'
})
```

**문제점**:
- React의 Virtual DOM과 충돌
- React 렌더링 사이클 외부에서 DOM 변경
- 메모리 누수 및 예측 불가능한 동작 유발

### 2.3 대용량 컴포넌트
- GameGuideModal.tsx: 1200줄 이상의 거대 컴포넌트
- 메모리에 전체 컴포넌트 로드
- 코드 스플리팅 미적용

### 2.4 상태 히스토리 무제한 저장
```typescript
// GameContext.tsx
queueStatesHistory: [...state.queueStatesHistory, newState]
```

**문제점**:
- 모든 큐 상태 변경 이력을 무제한 저장
- 게임 진행할수록 메모리 사용량 급증

## 3. 추가 위험 요소

### 3.1 애니메이션 리소스
- Framer Motion 애니메이션 컨트롤러 미정리
- 컴포넌트 언마운트 시 리소스 정리 누락

### 3.2 이벤트 리스너
- 전역 이벤트 리스너 등록 후 미제거
- 메모리 누수의 전형적인 패턴

### 3.3 타이머
- setInterval 사용 시 clearInterval 누락 가능성
- 백그라운드에서 계속 실행되는 타이머

## 4. 영향 범위

### 4.1 직접 영향
- 고급 스테이지 (특히 스테이지 17-22)
- 메모리 집약적 기능 사용 구간

### 4.2 간접 영향
- 전체 게임 성능
- 다른 브라우저 탭/애플리케이션
- 시스템 전체 성능

## 5. 스택 트레이스 분석

### 5.1 오류 발생 경로
```
Memory leak detected: 229.71MB used
overrideMethod @ hook.js:608
useMemoryManagement.useCallback[collectMemoryStats] @ useMemoryManagement.ts:80
useMemoryManagement.useEffect @ useMemoryManagement.ts:160
```

**분석**:
1. `useMemoryManagement.ts:160` - useEffect에서 interval 생성
2. `useMemoryManagement.ts:80` - collectMemoryStats 함수 실행 
3. `hook.js:608` - React DevTools 또는 프로파일링 도구
4. 메모리 경고 발생

### 5.2 자동 최적화 무한 루프
```
useMemoryManagement.ts:164 🧹 Auto-optimizing memory due to pressure
useMemoryManagement.ts:80 🚨 Memory leak detected: 229.71MB used
```

**순환 패턴**:
- Auto-optimization 실행 → 메모리 정리 시도
- 하지만 interval 누적으로 인해 메모리 사용량 계속 증가
- 30초마다 반복되는 악순환

## 6. 우선순위 평가 (업데이트)

### 긴급도: 매우 높음 (상향 조정)
- **메모리 사용량 2배 증가**로 즉시 수정 필요
- 사용자 게임 플레이 완전 불가능
- 브라우저 크래시 가능성 매우 높음

### 중요도: 매우 높음 (상향 조정)
- 수정 작업이 오히려 문제를 악화시킴
- 전체 메모리 관리 시스템 재검토 필요

### 난이도: 높음 (상향 조정)
- 의존성 배열 미세 조정 필요
- React useEffect 깊은 이해 요구
- 테스트 및 검증 복잡