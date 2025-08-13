# 메모리 누수 문제 분석

## 1. 문제 현상

### 1.1 발생 위치
- **게임**: 콜스택 도서관 (CallStack Library)
- **단계**: 고급 스테이지 6 (전체 스테이지 22)
- **증상**: 아무 조작 없이도 메모리 사용량 109.97MB 경고 발생

### 1.2 경고 메시지 (최종 업데이트)
```
초기 상태: 🚨 Memory leak detected: 109.97MB used (threshold: 100MB)
1차 수정 후: 🚨 Memory leak detected: 229.71MB used (threshold: 80MB)
2차 수정 후: 🚨 Memory leak detected: 298.66MB used (threshold: 80MB)
```

**🚨 치명적: 수정 작업으로 메모리 사용량이 3배 증가 (109.97MB → 298.66MB)**
- 첫 번째 수정: 2.1배 증가 (109.97MB → 229.71MB)
- 두 번째 수정: 1.3배 추가 증가 (229.71MB → 298.66MB)
- **총 증가율: 271% (거의 3배)**

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

### 난이도: 매우 높음 (상향 조정)
- 의존성 배열 미세 조정 필요
- React useEffect 깊은 이해 요구
- 테스트 및 검증 복잡

## 7. 수정 작업 실패 분석 (신규 추가)

### 7.1 첫 번째 수정 실패 (109.97MB → 229.71MB)

#### 잘못된 접근 방식
```typescript
// 원래 문제 코드
}, [enableMonitoring, cleanupInterval, collectMemoryStats, 
    isMemoryPressure, optimizeMemory, // ← 순환 참조
    leakThreshold, maxComponentAge, forceCleanup])

// 잘못된 수정 (더 심각한 버그 추가)
}, [enableMonitoring, cleanupInterval, collectMemoryStats, 
    stats.usedJSHeapSize, // ← 무한 루프 생성!
    leakThreshold, maxComponentAge, forceCleanup])
```

#### 실패 원인
1. **표면적 증상만 분석**: "순환 참조" 경고만 보고 근본 원인 미파악
2. **더 심각한 버그 추가**: `stats.usedJSHeapSize`를 의존성 배열에 추가
3. **부작용 검증 누락**: 수정이 다른 부분에 미치는 영향 무시

#### 무한 루프 메커니즘
```
1. useEffect 실행 → interval 생성
2. collectMemoryStats() → setStats() → stats.usedJSHeapSize 변경
3. 의존성 배열 감지 → useEffect 재실행
4. 이전 interval 정리 없이 새 interval 생성
5. 지수적 interval 증가: 1개 → 2개 → 4개 → 8개...
```

### 7.2 두 번째 수정 실패 (229.71MB → 298.66MB)

#### 잘못된 수정 시도
- `stats.usedJSHeapSize` 제거했지만 `collectMemoryStats` 의존성 유지
- 근본적인 아키텍처 문제는 그대로 남김

#### 남아있는 문제들
1. **Stale Closure**: interval 내부에서 오래된 `stats` 값 참조
2. **과도한 리렌더링**: 30초마다 모든 컴포넌트 업데이트
3. **의존성 체인**: `forceCleanup` → `collectMemoryStats` → 무한 재생성
4. **React StrictMode**: 개발 환경에서 모든 effect 2배 실행

### 7.3 분석 실패의 근본 원인

#### 1. 잘못된 문제 진단
- **했어야 할 것**: 실행 흐름 추적 → 상태 업데이트 패턴 분석
- **실제로 한 것**: "메모리 누수" → "순환 참조 찾기" → "의존성 수정"

#### 2. React Hook 동작 원리 미이해
- `useState`의 `setState`가 리렌더링을 트리거하는 점 간과
- useEffect 의존성 배열에 상태값 넣는 위험성 무시
- useCallback 의존성 변경시 함수 재생성되는 메커니즘 무시

#### 3. 부작용 검증 프로세스 부재
- 각 수정사항이 다른 Hook에 미치는 영향 미분석
- React StrictMode 환경 고려 부족
- 의존성 체인 전체 검토 누락

#### 4. 근본 원인 vs 증상 혼동
- **실제 근본 원인**: useEffect에서 상태 업데이트하는 함수를 의존성으로 사용
- **잘못 본 증상**: 메모리 사용량 증가, ESLint 순환 참조 경고

## 8. 현재 상태 분석 (298.66MB)

### 8.1 남아있는 실제 문제들

#### 문제 1: Interval Stale Closure
```typescript
// useMemoryManagement.ts:170
if (stats.usedJSHeapSize && stats.usedJSHeapSize / (1024 * 1024) > leakThreshold * 0.8) {
  // interval은 생성 시점의 stats 값만 기억함
}
```
**영향**: 메모리 감지 로직이 실시간 상태를 반영하지 않음

#### 문제 2: 의존성 체인 무한 루프
```typescript
const forceCleanup = useCallback(() => {
  collectMemoryStats(); // 상태 업데이트 함수 호출
}, [collectMemoryStats]); // collectMemoryStats 변경시마다 재생성

useEffect(() => {
  return () => {
    forceCleanup(); // forceCleanup 변경시마다 cleanup 재등록
  };
}, [forceCleanup]);
```
**영향**: cleanup function이 무한 재등록되며 메모리 누적

#### 문제 3: 과도한 리렌더링
```typescript
setStats(memoryInfo); // 30초마다 실행
```
**영향**: 이 hook을 사용하는 모든 컴포넌트가 30초마다 불필요한 리렌더링

#### 문제 4: React StrictMode 배수 효과
- 개발 환경에서 모든 effect가 2번 실행됨
- interval, cleanup function이 2배로 생성
- 실제 production 환경과 다른 동작

### 8.2 왜 여전히 298.66MB인가?
1. **메모리 감지 실패**: Stale closure로 인해 실제 메모리 상태 파악 불가
2. **정리 메커니즘 실패**: cleanup이 제대로 작동하지 않음
3. **지속적인 메모리 누적**: 30초마다 새로운 리소스 생성하지만 정리는 미완료
4. **개발 환경 배수 효과**: StrictMode에서 모든 부작용이 2배로 증폭

## 9. 근본적 해결 방안

### 9.1 아키텍처 수준 수정

#### 1. 메모리 모니터링 분리
```typescript
// 별도의 Web Worker 또는 독립적인 시스템으로 분리
// React 컴포넌트 생명주기와 분리된 메모리 모니터링
```

#### 2. 상태 기반에서 이벤트 기반으로 전환
```typescript
// 현재: 30초마다 stats 상태 업데이트 → 모든 컴포넌트 리렌더링
// 개선: 메모리 임계값 초과시에만 이벤트 발생 → 필요시에만 반응
```

#### 3. Hook 의존성 체인 제거
```typescript
// 현재: useCallback들이 서로 의존하는 복잡한 체인
// 개선: ref를 활용한 안정적인 함수 참조
```

### 9.2 구체적 수정 사항

#### 1. useMemoryManagement Hook 완전 재작성
```typescript
export const useMemoryManagement = (options = {}) => {
  const { enableMonitoring = false, leakThreshold = 80 } = options;
  
  // 상태 대신 ref 사용하여 리렌더링 방지
  const metricsRef = useRef({ usedMB: 0, leakDetected: false });
  const intervalRef = useRef(null);
  
  // 안정적인 함수 참조 (의존성 없음)
  const checkMemory = useCallback(() => {
    if (!enableMonitoring || !('memory' in performance)) return;
    
    const memory = performance.memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    
    metricsRef.current = {
      usedMB,
      leakDetected: usedMB > leakThreshold
    };
    
    // 임계값 초과시에만 경고 (상태 업데이트 없음)
    if (metricsRef.current.leakDetected) {
      console.warn(`🚨 Memory leak detected: ${usedMB.toFixed(2)}MB used`);
      // 이벤트 시스템으로 알림 (리렌더링 없음)
      gameEvents.performanceMemoryPressure('useMemoryManagement', usedMB);
    }
  }, [enableMonitoring, leakThreshold]); // 안정적인 의존성만
  
  // 단순한 interval 관리 (의존성 체인 없음)
  useEffect(() => {
    if (!enableMonitoring) return;
    
    intervalRef.current = setInterval(checkMemory, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableMonitoring, checkMemory]);
  
  // 상태 반환 대신 현재 값 조회 함수 제공
  const getCurrentMetrics = useCallback(() => metricsRef.current, []);
  
  return {
    getCurrentMetrics,
    // 상태 기반 리액티브 값 제거
  };
};
```

#### 2. 메모리 정리 시스템 개선
```typescript
// 전역 메모리 관리자 도입
class MemoryManager {
  private cleanupRegistry = new Set<() => void>();
  
  register(cleanup: () => void) {
    this.cleanupRegistry.add(cleanup);
    return () => this.cleanupRegistry.delete(cleanup);
  }
  
  forceCleanup() {
    this.cleanupRegistry.forEach(cleanup => {
      try { cleanup(); } catch (e) { console.error(e); }
    });
  }
}
```

#### 3. 컴포넌트 최적화
```typescript
// GameGuideModal 분할
// - GameGuideHeader (200줄)
// - GameGuideContent (400줄)  
// - GameGuideFooter (100줄)
// - GameGuideSection (각 200줄씩 3개)

// React.memo 적용
const GameGuideHeader = React.memo(({ title, stage }) => {
  // 헤더 로직
});
```

#### 4. 상태 히스토리 제한
```typescript
// CallStackLibraryContext.tsx
const MAX_HISTORY_SIZE = 50;

const addToHistory = (newState) => {
  setState(prev => ({
    ...prev,
    queueStatesHistory: [
      ...prev.queueStatesHistory.slice(-MAX_HISTORY_SIZE + 1),
      newState
    ]
  }));
};
```

### 9.3 검증 및 테스트 계획

#### 1. 메모리 사용량 모니터링
- Chrome DevTools Memory 탭으로 실시간 추적
- 30초 간격으로 5분간 측정
- 목표: 80MB 이하 유지

#### 2. 리렌더링 최적화 검증
- React DevTools Profiler로 불필요한 렌더링 확인
- 목표: 메모리 체크시 리렌더링 0회

#### 3. 기능 테스트
- 고급 스테이지 6에서 10분간 연속 플레이
- 메모리 경고 발생 여부 확인
- 게임 기능 정상 작동 확인

### 9.4 구현 우선순위

#### Phase 1: 긴급 수정 (즉시)
1. useMemoryManagement Hook 의존성 배열 최소화
2. stats 상태 업데이트를 ref 기반으로 변경
3. 메모리 테스트 및 검증

#### Phase 2: 구조적 개선 (1-2일)
1. GameGuideModal 컴포넌트 분할
2. 상태 히스토리 크기 제한
3. 불필요한 애니메이션 최적화

#### Phase 3: 아키텍처 개선 (3-5일)
1. Web Worker 기반 메모리 모니터링 도입
2. 이벤트 기반 메모리 관리 시스템 구축
3. 전체 성능 최적화 및 테스트

### 9.5 성공 기준

#### 기술적 기준
- 메모리 사용량: 80MB 이하 안정적 유지
- 리렌더링: 메모리 체크시 불필요한 리렌더링 0회
- 응답성: 사용자 인터랙션 지연 없음

#### 사용자 경험 기준  
- 메모리 경고 메시지 미발생
- 게임 플레이 중 끊김 현상 없음
- 브라우저 성능 저하 없음

이 계획은 이전 실패의 근본 원인을 바탕으로 수립되었으며, 단순한 증상 수정이 아닌 아키텍처 수준에서의 근본적 해결을 목표로 합니다.