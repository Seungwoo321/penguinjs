# 클로저 동굴 (Closure Cave) - 게임 설계

## 게임 컨셉
Flexbox Froggy처럼 코드를 작성해서 펭귄이 보물에 도달하도록 하는 게임

## 게임 메커니즘

### 1. 기본 플레이
- 화면에 펭귄과 보물이 배치됨
- 플레이어가 클로저 코드를 작성
- 코드 실행 시 펭귄이 보물로 이동하는 애니메이션
- 올바른 클로저를 만들면 보물 획득

### 2. 시각적 표현
```
🐧 (펭귄) -----> 💎 (보물)
         클로저로 연결
```

### 3. 레벨 예시

#### Level 1: 기본 클로저
```javascript
// 목표: 펭귄이 보물에 접근할 수 있도록 클로저 만들기
function createPath() {
  const treasure = "💎";
  
  // 여기에 코드 작성
  return function() {
    return treasure;
  };
}
```

#### Level 2: 카운터 클로저
```javascript
// 목표: 펭귄이 3번 점프해서 보물에 도달
function createJumper() {
  let jumps = 0;
  
  // 점프할 때마다 카운트 증가
  return function() {
    jumps++;
    return jumps;
  };
}
```

#### Level 3: 여러 보물 관리
```javascript
// 목표: 각 보물함에 비밀번호로 접근
function createVault(password) {
  const secret = "💎";
  
  return {
    open: function(key) {
      return key === password ? secret : "🔒";
    }
  };
}
```

## 시각적 피드백

1. **코드 실행 전**: 펭귄이 시작 위치에서 대기
2. **코드 실행 중**: 
   - 올바른 경우: 펭귄이 보물로 이동
   - 틀린 경우: 펭귄이 제자리에서 흔들림
3. **성공 시**: 
   - 보물 획득 애니메이션
   - 다음 레벨 잠금 해제

## 진행도 시스템
- 각 레벨 완료 시 별 1-3개 획득
- 힌트 미사용: 3개 별
- 1-2개 힌트: 2개 별  
- 3개 이상 힌트: 1개 별