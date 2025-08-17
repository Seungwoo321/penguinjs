# PenguinJS 게임 엔진 상세 설계서

## 1. 개요

### 목적
JavaScript 학습 게임 플랫폼의 핵심 게임 엔진 아키텍처와 각 모듈의 역할 및 상호작용 정의

### 설계 목표
- **모듈성**: 각 게임 유형에 맞는 독립적 엔진 모듈
- **재사용성**: 공통 기능의 효율적 재사용
- **확장성**: 새로운 게임 유형 쉽게 추가 가능
- **성능**: 부드러운 실시간 인터랙션 제공
- **안전성**: 사용자 코드의 안전한 실행 환경

### 아키텍처 패턴
- **상속 기반 구조**: BaseGameEngine을 상속한 게임별 엔진
- **Map 기반 레벨 관리**: 난이도별 레벨 매핑
- **TypeScript 제네릭**: 게임별 레벨 타입 유연성
- **GameManager 싱글톤**: 중앙 집중식 게임 관리

---

## 2. 전체 아키텍처 개요

### 엔진 구조 계층
```
Game Engine Architecture
├── GameManager (싱글톤)          # 전체 게임 관리
│   ├── Game Configs             # 게임 설정 관리
│   ├── Game Progress            # 진행도 관리
│   └── Local Storage            # 로컬 저장소
├── BaseGameEngine               # 기본 게임 엔진
│   ├── Level Management         # 레벨 관리 시스템
│   ├── Validation System        # 답안 검증
│   └── Stage Navigation         # 스테이지 네비게이션
├── Game-Specific Engines        # 게임별 엔진
│   ├── ClosureCaveEngine       # 클로저 게임 엔진
│   ├── CallStackEngine          # 콜스택 게임 엔진
│   └── [Future Engines]         # 추가 예정 엔진
└── UI Components                # UI 컴포넌트
    ├── Game Board               # 게임 보드
    ├── Code Editor              # 코드 에디터
    └── Progress Display         # 진행도 표시
```

---

## 3. BaseGameEngine 클래스

### 핵심 기능
```typescript
abstract class BaseGameEngine<TLevel> {
  protected levels: Map<GameDifficulty, TLevel[]>
  protected config: GameConfig
  
  // 추상 메서드
  protected abstract loadAllLevels(): void
  abstract validateAnswer(level: TLevel, answer: any): GameValidationResult
  
  // 레벨 관리
  protected addLevels(difficulty: GameDifficulty, levels: TLevel[]): void
  getLevelByStage(difficulty: GameDifficulty, stage: number): TLevel | null
  getTotalStages(difficulty: GameDifficulty): number
}
```

### 🚨 발견된 구현 이슈
1. **타입 안전성 문제**: `(level as any)` 사용으로 타입 체크 우회
2. **중복 검증**: difficulty 속성 이중 체크 (Map key와 level 속성)
3. **console.error 사용**: 프로덕션 환경에서 콘솔 로그 노출

---

## 4. GameManager 싱글톤

### 주요 기능
```typescript
class GameManager {
  private static instance: GameManager
  private gameConfigs: Map<string, GameConfig>
  private gameProgress: Map<string, GameProgress>
  private currentSession: GameSession | null
  
  // 게임 등록 및 관리
  registerGame(config: GameConfig): void
  getGameProgress(gameId: string, difficulty: GameDifficulty): GameProgress
  updateProgress(gameId: string, difficulty: GameDifficulty, stage: number): void
  
  // 진행도 저장/로드
  saveProgress(): void
  loadProgress(): void
}
```

### 진행도 저장 방식
- **저장소**: localStorage 사용
- **키 형식**: `penguinjs_game_${gameId}_${difficulty}`
- **데이터 형식**: JSON 직렬화

---

## 5. 게임별 구현 현황

### ✅ Closure Cave Engine
- BaseGameEngine 상속 구현
- 15개 스테이지 완료
- CodeMirror 에디터 통합

### ✅ CallStack Library Engine  
- BaseGameEngine 상속 구현
- 24개 스테이지 완료
- 드래그 앤 드롭 인터페이스

### ⚠️ Promise Battle Engine
- 기본 구조만 구현
- 게임 로직 미완성

---

## 6. 향후 개선 사항

### 기술 부채
- `any` 타입 사용 제거
- 타입 안전성 강화
- 에러 핸들링 개선
- 프로덕션 로깅 시스템 구축

### 기능 추가 계획
- Web Worker 기반 안전한 코드 실행
- 애니메이션 시스템 구현
- 분석 데이터 수집 기능
- 고급 힌트 시스템
- 실시간 코드 검증

### 성능 최적화
- 레벨 데이터 지연 로딩
- 메모리 사용량 최적화
- 렌더링 성능 개선