# 📚 콜스택 도서관 게임 상세 설계 문서

## 1. 게임 컨셉 상세

### 1.1 스토리텔링
- **배경**: 마법의 도서관에서 JavaScript 코드를 책으로 관리하는 특별한 사서
- **주인공**: 플레이어는 견습 사서에서 시작하여 도서관장까지 성장
- **목표**: 책(함수)들을 올바른 순서로 정리하여 도서관을 효율적으로 운영

### 1.2 게임 메타포
- **책 = 함수**: 각 함수 호출은 책 한 권
- **책장 = 콜스택**: 책들이 쌓이는 수직 구조
- **대출 데스크 = 태스크 큐**: 비동기 작업 대기 장소
- **긴급 반납대 = 마이크로태스크 큐**: 우선 처리 작업
- **일반 반납대 = 매크로태스크 큐**: 일반 처리 작업

## 2. 스테이지별 상세 설계

### 🟢 초급 스테이지 (1-8)

#### 스테이지 1: 첫 번째 책 정리
**코드 예시**:
```javascript
function greet() {
  console.log("안녕하세요!");
}

greet();
console.log("환영합니다!");
```

**학습 포인트**:
- 함수 호출 시 콜스택에 추가
- 함수 완료 시 콜스택에서 제거
- 순차적 실행 이해

**시각화**:
- 책이 천천히 쌓이고 사라지는 애니메이션
- 현재 실행 중인 책 하이라이트

#### 스테이지 2: 책장 쌓기
**코드 예시**:
```javascript
function outer() {
  console.log("외부 시작");
  inner();
  console.log("외부 끝");
}

function inner() {
  console.log("내부 실행");
}

outer();
```

**학습 포인트**:
- 중첩 함수 호출
- LIFO(Last In First Out) 원칙
- 실행 컨텍스트 이해

#### 스테이지 3: 연쇄 정리
**코드 예시**:
```javascript
function first() {
  return second();
}

function second() {
  return third();
}

function third() {
  return "완료!";
}

console.log(first());
```

**학습 포인트**:
- 함수 체인 호출
- 반환값 전달 과정
- 콜스택 최대 깊이

#### 스테이지 4: 책 더미 관리
**코드 예시**:
```javascript
function calculateSum(a, b) {
  return add(a, b);
}

function add(x, y) {
  return x + y;
}

function processData() {
  const result = calculateSum(5, 3);
  console.log(`결과: ${result}`);
  return result;
}

processData();
```

**학습 포인트**:
- 콜스택 깊이 관리
- 메모리 사용량 이해
- 효율적인 함수 설계

#### 스테이지 5: 순환 정리
**코드 예시**:
```javascript
function countdown(n) {
  if (n <= 0) {
    console.log("발사!");
    return;
  }
  console.log(n);
  countdown(n - 1);
}

countdown(3);
```

**학습 포인트**:
- 재귀 함수 기초
- 종료 조건의 중요성
- 재귀 vs 반복문

#### 스테이지 6: 효율적 정리
**코드 예시**:
```javascript
// 재귀 버전
function sumRecursive(n) {
  if (n <= 0) return 0;
  return n + sumRecursive(n - 1);
}

// 반복문 버전
function sumIterative(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log(sumRecursive(5));
console.log(sumIterative(5));
```

**학습 포인트**:
- 재귀와 반복문 비교
- 콜스택 사용량 차이
- 성능 고려사항

#### 스테이지 7: 정리 순서
**코드 예시**:
```javascript
function multiply(a, b) {
  console.log(`${a} × ${b} 계산`);
  return a * b;
}

function calculate() {
  const x = multiply(2, 3);
  const y = multiply(x, 4);
  return y;
}

console.log(`최종 결과: ${calculate()}`);
```

**학습 포인트**:
- 실행 순서 추적
- 반환값 활용
- 디버깅 기초

#### 스테이지 8: 첫 비동기 체험
**코드 예시**:
```javascript
console.log("1. 시작");

setTimeout(() => {
  console.log("3. 비동기 실행");
}, 0);

console.log("2. 끝");
```

**학습 포인트**:
- setTimeout 소개
- 비동기 개념 첫 경험
- 실행 순서의 차이

**레이아웃 전환**: A → B (매크로태스크 큐 첫 등장)

### 🟡 중급 스테이지 (9-16)

#### 스테이지 9: 복잡한 재귀
**코드 예시**:
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(5));
```

**학습 포인트**:
- 트리 형태의 재귀
- 중복 계산 문제
- 콜스택 복잡도

#### 스테이지 10: 상호 참조
**코드 예시**:
```javascript
function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}

function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}

console.log(isEven(4));
console.log(isOdd(3));
```

**학습 포인트**:
- 상호 재귀 패턴
- 함수 간 협력
- 스택 추적 복잡도

#### 스테이지 11: 고차 함수
**코드 예시**:
```javascript
function processArray(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i]));
  }
  return result;
}

function double(x) {
  return x * 2;
}

const numbers = [1, 2, 3];
console.log(processArray(numbers, double));
```

**학습 포인트**:
- 콜백 함수 실행
- 고차 함수 패턴
- 함수형 프로그래밍 기초

#### 스테이지 12: 에러 처리
**코드 예시**:
```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error("0으로 나눌 수 없습니다!");
  }
  return a / b;
}

function calculate() {
  try {
    const result = divide(10, 0);
    console.log(result);
  } catch (error) {
    console.error("에러 발생:", error.message);
  }
}

calculate();
```

**학습 포인트**:
- 에러 전파 메커니즘
- try-catch 블록
- 스택 추적 정보

#### 스테이지 13: 비동기 기초
**코드 예시**:
```javascript
console.log("작업 시작");

setTimeout(() => {
  console.log("2초 후 실행");
}, 2000);

setTimeout(() => {
  console.log("1초 후 실행");
}, 1000);

console.log("동기 작업 완료");
```

**학습 포인트**:
- 타이머 순서
- 비동기 큐 동작
- 이벤트 루프 기초

#### 스테이지 14: Promise 입문
**코드 예시**:
```javascript
console.log("1. 시작");

const promise = new Promise((resolve) => {
  console.log("2. Promise 생성");
  resolve("성공!");
});

promise.then((result) => {
  console.log(`4. Promise 결과: ${result}`);
});

console.log("3. 끝");
```

**학습 포인트**:
- Promise 생성과 실행
- then 콜백 타이밍
- 마이크로태스크 소개

#### 스테이지 15: 이벤트 루프 소개
**코드 예시**:
```javascript
console.log("시작");

setTimeout(() => {
  console.log("매크로태스크");
}, 0);

Promise.resolve().then(() => {
  console.log("마이크로태스크");
});

console.log("끝");
```

**학습 포인트**:
- 이벤트 루프 개념
- 태스크 큐 종류
- 실행 우선순위

#### 스테이지 16: 실행 순서 예측
**코드 예시**:
```javascript
function asyncOperation() {
  console.log("1");
  
  setTimeout(() => {
    console.log("5");
  }, 0);
  
  Promise.resolve().then(() => {
    console.log("3");
  }).then(() => {
    console.log("4");
  });
  
  console.log("2");
}

asyncOperation();
```

**학습 포인트**:
- 복합 실행 순서
- 큐 우선순위 이해
- 실전 패턴 준비

### 🔴 고급 스테이지 (17-24)

#### 스테이지 17: 마이크로 vs 매크로
**코드 예시**:
```javascript
console.log("시작");

setTimeout(() => {
  console.log("타임아웃 1");
  Promise.resolve().then(() => {
    console.log("Promise in timeout");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
  setTimeout(() => {
    console.log("타임아웃 in Promise");
  }, 0);
});

setTimeout(() => {
  console.log("타임아웃 2");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 2");
});

console.log("끝");
```

**학습 포인트**:
- 중첩된 비동기 호출
- 큐 처리 순서 규칙
- 실행 컨텍스트 전환

#### 스테이지 18: 이벤트 루프 심화
**코드 예시**:
```javascript
async function complexFlow() {
  console.log("1. async 함수 시작");
  
  await Promise.resolve();
  console.log("2. await 후");
  
  setTimeout(() => {
    console.log("6. setTimeout");
  }, 0);
  
  await new Promise(resolve => {
    console.log("3. Promise executor");
    resolve();
  });
  
  console.log("4. 두 번째 await 후");
  
  queueMicrotask(() => {
    console.log("5. queueMicrotask");
  });
}

complexFlow();
console.log("메인 스크립트 끝");
```

**학습 포인트**:
- async/await와 이벤트 루프
- queueMicrotask API
- 복잡한 비동기 플로우

#### 스테이지 19: async/await 패턴
**코드 예시**:
```javascript
async function fetchData(id) {
  console.log(`Fetching data ${id}...`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return `Data ${id}`;
}

async function processSequential() {
  const data1 = await fetchData(1);
  const data2 = await fetchData(2);
  return [data1, data2];
}

async function processParallel() {
  const [data1, data2] = await Promise.all([
    fetchData(3),
    fetchData(4)
  ]);
  return [data1, data2];
}

console.log("순차 처리 시작");
processSequential().then(console.log);

console.log("병렬 처리 시작");
processParallel().then(console.log);
```

**학습 포인트**:
- 순차 vs 병렬 처리
- Promise.all 활용
- 성능 최적화

#### 스테이지 20: 제너레이터
**코드 예시**:
```javascript
function* taskGenerator() {
  console.log("작업 1 시작");
  yield 1;
  
  console.log("작업 2 시작");
  yield 2;
  
  console.log("작업 3 시작");
  return 3;
}

const gen = taskGenerator();

setTimeout(() => {
  console.log("비동기:", gen.next().value);
}, 100);

Promise.resolve().then(() => {
  console.log("Promise:", gen.next().value);
});

console.log("동기:", gen.next().value);
```

**학습 포인트**:
- 제너레이터 실행 중단/재개
- 비동기와 제너레이터
- 이터레이터 프로토콜

**레이아웃 전환**: B → C

#### 스테이지 21: 복합 비동기
**코드 예시**:
```javascript
async function complexAsync() {
  console.log("Start");
  
  const results = await Promise.allSettled([
    Promise.resolve("성공"),
    Promise.reject("실패"),
    new Promise(resolve => setTimeout(() => resolve("지연"), 100))
  ]);
  
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(`작업 ${index + 1} 성공:`, result.value);
    } else {
      console.log(`작업 ${index + 1} 실패:`, result.reason);
    }
  });
  
  await Promise.race([
    new Promise(resolve => setTimeout(() => resolve("느림"), 200)),
    new Promise(resolve => setTimeout(() => resolve("빠름"), 50))
  ]).then(winner => console.log("경쟁 승자:", winner));
}

complexAsync();
```

**학습 포인트**:
- Promise.allSettled
- Promise.race
- 에러 처리 전략

#### 스테이지 22: 애니메이션 프레임
**코드 예시**:
```javascript
let count = 0;

function animate() {
  console.log(`프레임 ${++count}`);
  
  if (count < 3) {
    requestAnimationFrame(animate);
  }
}

console.log("시작");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

requestAnimationFrame(() => {
  console.log("첫 번째 RAF");
  animate();
});

console.log("끝");
```

**학습 포인트**:
- requestAnimationFrame 타이밍
- 브라우저 렌더링 사이클
- 애니메이션 최적화

#### 스테이지 23: 실무 패턴
**코드 예시**:
```javascript
// 디바운스 구현
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 쓰로틀 구현
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 사용 예시
const debouncedLog = debounce(() => console.log("디바운스!"), 300);
const throttledLog = throttle(() => console.log("쓰로틀!"), 300);

// 연속 호출 시뮬레이션
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    console.log(`호출 ${i + 1}`);
    debouncedLog();
    throttledLog();
  }, i * 100);
}
```

**학습 포인트**:
- 디바운스 패턴
- 쓰로틀 패턴
- 실무 최적화 기법

#### 스테이지 24: 최종 도전
**코드 예시**:
```javascript
async function ultimateChallenge() {
  console.log("1. 시작");
  
  const generator = (function* () {
    yield "제너레이터 1";
    yield new Promise(resolve => 
      setTimeout(() => resolve("제너레이터 Promise"), 50)
    );
  })();
  
  setTimeout(() => {
    console.log("7. 매크로태스크");
    queueMicrotask(() => {
      console.log("8. 중첩 마이크로태스크");
    });
  }, 0);
  
  Promise.resolve().then(() => {
    console.log("3. Promise 1");
    return generator.next().value;
  }).then(value => {
    console.log(`4. ${value}`);
  });
  
  await Promise.resolve();
  console.log("2. await 후");
  
  requestAnimationFrame(() => {
    console.log("9. RAF");
  });
  
  const secondGen = await generator.next().value;
  console.log(`5. ${secondGen}`);
  
  queueMicrotask(() => {
    console.log("6. 마이크로태스크");
  });
}

ultimateChallenge().then(() => {
  console.log("10. 완료");
});
```

**학습 포인트**:
- 모든 개념 통합
- 복잡한 실행 순서
- 전문가 수준 이해

**레이아웃**: D (모든 큐 시스템 표시)

## 3. 게임 UI/UX 상세

### 3.1 공통 UI 요소
- **상단 바**: 현재 스테이지, 진행도, 점수
- **힌트 버튼**: 단계별 힌트 제공 (사용 시 점수 감소)
- **속도 조절**: 애니메이션 속도 조절 (0.5x, 1x, 2x, 4x)
- **단계 실행**: 한 스텝씩 실행 가능
- **리셋 버튼**: 처음부터 다시 시작

### 3.2 책 디자인
- **일반 함수**: 파란색 책
- **콜백 함수**: 초록색 책
- **Promise**: 보라색 책
- **async 함수**: 주황색 책
- **에러**: 빨간색 책

### 3.3 애니메이션 효과
- **책 추가**: 위에서 떨어지며 부드럽게 착지
- **책 제거**: 페이드 아웃하며 위로 상승
- **현재 실행**: 책 표지 빛나는 효과
- **큐 이동**: 곡선 경로로 부드럽게 이동

### 3.4 난이도별 게임플레이 방식

#### 초급 (스테이지 1-8)
- **학습 목표**: 함수 호출 순서 이해
- **플레이 방식**: 코드를 보고 함수 실행 순서를 예측하여 함수명을 순서대로 배치
- **예시**: `[main] → [greet] → [console.log]`

#### 중급 (스테이지 1-8)
- **학습 목표**: 콜스택의 push/pop 동작 이해 (LIFO 원칙)
- **플레이 방식**: 함수 호출(시작)과 반환(종료) 시점을 모두 예측
- **UI 개선**: 
  - 함수 카드에 "시작"/"종료" 구분 표시
  - 시작: 📥 아이콘과 함께 표시 (파란색)
  - 종료: 📤 아이콘과 함께 표시 (빨간색)
- **예시**: `[main 시작] → [outer 시작] → [inner 시작] → [inner 종료] → [outer 종료] → [main 종료]`

#### 고급 (스테이지 1-8)
- **학습 목표**: 각 실행 시점의 콜스택 상태 이해
- **플레이 방식 A - 스냅샷 방식**:
  - 주요 실행 시점마다 스택 상태 예측
  - 드래그 앤 드롭으로 스택 구성
  - 예: "시점 3에서 스택: [main, factorial(3), factorial(2)]"
- **플레이 방식 B - 인터랙티브 방식**:
  - 코드를 한 줄씩 실행하며 스택 변화 추적
  - 각 단계에서 현재 스택 상태 입력
  - 코드 하이라이트와 스택 상태를 동시에 표시

## 4. 평가 시스템

### 4.1 점수 체계
- **기본 점수**: 100점
- **감점 요인**:
  - 틀린 예측: -20점
  - 힌트 사용: -10점
  - 시간 초과: -5점
- **가산점**:
  - 빠른 완료: +10점
  - 힌트 미사용: +20점
  - 완벽한 예측: +30점

### 4.2 난이도별 평가 기준

#### 초급 평가
- 함수 호출 순서만 확인
- 예측 순서와 실행 순서 일치 여부 판단

#### 중급 평가
- 함수 시작/종료 쌍이 올바른 순서인지 검증
- LIFO 원칙 준수 확인 (시작된 함수가 올바른 순서로 종료되는지)
- 코드 예시:
  ```javascript
  function evaluateIntermediateMode(userOrder, expected) {
    const stack = []
    for (const item of userOrder) {
      if (item.includes('시작')) {
        stack.push(item)
      } else if (item.includes('종료')) {
        const expectedPop = item.replace('종료', '시작')
        if (stack[stack.length - 1] !== expectedPop) {
          return { valid: false, error: 'LIFO 원칙 위반' }
        }
        stack.pop()
      }
    }
    return { valid: stack.length === 0 }
  }
  ```

#### 고급 평가
- 각 시점의 스택 상태 정확성 평가
- 스택에 있는 함수들의 순서와 구성 확인
- 비동기 코드의 경우 큐 상태까지 평가

### 4.3 별점 시스템
- ⭐⭐⭐: 90점 이상
- ⭐⭐: 70-89점
- ⭐: 50-69점

### 4.4 업적 시스템
- **초보 사서**: 초급 완료
- **숙련 사서**: 중급 완료
- **도서관장**: 고급 완료
- **콜스택 마스터**: 모든 스테이지 3성 클리어
- **스피드런**: 특정 시간 내 완료
- **퍼펙트**: 힌트 없이 전체 완료

## 5. 구현 로드맵

### Phase 1 (2주)
- 레이아웃 시스템 구현 (A, B, C, D)
- 기본 애니메이션 시스템
- 게임 엔진 확장

### Phase 2 (3주)
- 초급 스테이지 1-8 구현
- 기본 UI 컴포넌트
- 점수 시스템

### Phase 3 (3주)
- 중급 스테이지 9-16 구현
- 이벤트 루프 시각화
- 힌트 시스템

### Phase 4 (3주)
- 고급 스테이지 17-24 구현
- 복합 큐 시스템
- 업적 시스템

### Phase 5 (1주)
- 테스트 및 디버깅
- 성능 최적화
- 사용자 피드백 반영

## 6. 기술 사양

### 6.1 주요 컴포넌트
```typescript
// 메인 게임 컴포넌트
CallStackLibraryGame.tsx

// 레이아웃 컴포넌트
layouts/
  LayoutTypeA.tsx  // 기본 콜스택
  LayoutTypeB.tsx  // 이벤트 루프
  LayoutTypeC.tsx  // 복합 큐 (4개)
  LayoutTypeD.tsx  // 통합 시스템

// 시각화 컴포넌트
components/
  BookStack.tsx      // 책 스택 시각화
  QueueSystem.tsx    // 큐 시스템 시각화
  ExecutionFlow.tsx  // 실행 흐름 표시
  
// 게임 엔진
engine/
  CallStackEngine.ts    // 핵심 게임 로직
  AnimationEngine.ts    // 애니메이션 제어
  ScoreEngine.ts        // 점수 계산
```

### 6.2 상태 관리
```typescript
interface GameState {
  currentStage: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  score: number
  hintsUsed: number
  executionStack: StackItem[]
  queues: {
    microtask: QueueItem[]
    macrotask: QueueItem[]
    animation: QueueItem[]
    generator: QueueItem[]
  }
  userPrediction: string[]
  isExecuting: boolean
  executionSpeed: number
}
```

### 6.3 애니메이션 시스템
- Framer Motion 기반
- 60fps 목표
- GPU 가속 활용
- 반응형 애니메이션

## 7. 접근성 고려사항
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 색맹 모드 지원
- 애니메이션 끄기 옵션

## 8. 성능 최적화
- 레벨 데이터 지연 로딩
- 애니메이션 최적화 (will-change)
- 메모이제이션 활용
- 불필요한 리렌더링 방지

## 9. 확장 가능성
- 새로운 JavaScript 기능 추가 가능
- 다국어 지원 준비
- 멀티플레이어 모드 고려
- 커스텀 레벨 에디터 가능성

## 10. 결론
이 상세 설계 문서는 콜스택 도서관 게임을 체계적으로 구현하기 위한 완전한 가이드를 제공합니다. JavaScript의 실행 메커니즘을 재미있고 직관적으로 학습할 수 있도록 설계되었으며, 초보자부터 전문가까지 모든 수준의 학습자에게 가치 있는 경험을 제공할 것입니다.