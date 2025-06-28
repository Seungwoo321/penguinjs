# JavaScript 학습 게임 플랫폼 - React 19 아키텍처 설계서

## 1. 프로젝트 개요

### 프로젝트명
**JSPlayground** - JavaScript 핵심 개념 학습 게임 플랫폼

### 기술 스택 (daily-tools 기반)
- **Framework**: Next.js 15.3.2
- **Language**: TypeScript 5.8.3+
- **Runtime**: React 19.1.0
- **Build Tool**: Turbo (Monorepo)
- **Package Manager**: pnpm 10.11.0+
- **Styling**: Tailwind CSS 4.1.8
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand (추가)
- **Code Editor**: Monaco Editor (추가)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **Theming**: next-themes
- **Internationalization**: next-intl

---

## 2. 아키텍처 개요

### 전체 아키텍처 패턴
- **Micro Frontend Architecture**: 각 게임을 독립적인 모듈로 구성
- **Component-Driven Development**: 재사용 가능한 컴포넌트 중심 설계
- **Progressive Web App**: 오프라인 지원 및 설치 가능

### 폴더 구조 (Turborepo 기반)
```
📁 js-playground/
├── 📁 apps/
│   ├── 📁 playground/              # 메인 게임 플랫폼
│   │   ├── 📁 app/
│   │   │   ├── 📁 [locale]/
│   │   │   │   ├── 📄 layout.tsx
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📁 games/
│   │   │   │       ├── 📁 closure-cave/
│   │   │   │       ├── 📁 promise-battle/
│   │   │   │       └── 📄 [gameId]/page.tsx
│   │   │   ├── 📄 globals.css
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 messages/            # 다국어 지원
│   │   │   ├── 📄 en.json
│   │   │   ├── 📄 ko.json
│   │   │   └── 📄 ja.json
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 games/       # 게임별 컴포넌트
│   │   │   │   ├── 📁 common/      # 공통 컴포넌트
│   │   │   │   └── 📁 layout/
│   │   │   ├── 📁 hooks/
│   │   │   ├── 📁 stores/          # Zustand 스토어
│   │   │   ├── 📁 lib/
│   │   │   │   ├── 📄 game-engine.ts
│   │   │   │   ├── 📄 code-runner.ts
│   │   │   │   └── 📄 visualizer.ts
│   │   │   └── 📁 types/
│   │   ├── 📄 package.json
│   │   ├── 📄 next.config.mjs
│   │   └── 📄 tsconfig.json
│   └── 📁 docs/                    # 문서 사이트 (선택사항)
├── 📁 packages/
│   ├── 📁 config-eslint/          # ESLint 설정
│   ├── 📁 config-typescript/      # TypeScript 설정
│   ├── 📁 ui/                     # 공통 UI 컴포넌트
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/
│   │   │   │   └── 📁 ui/         # shadcn/ui 기반
│   │   │   └── 📁 styles/
│   │   └── 📄 package.json
│   ├── 📁 game-engine/            # 게임 엔진 패키지
│   │   ├── 📁 src/
│   │   │   ├── 📁 core/
│   │   │   ├── 📁 visualizers/
│   │   │   └── 📁 runners/
│   │   └── 📄 package.json
│   └── 📁 utils/                  # 공통 유틸리티
├── 📄 package.json
├── 📄 pnpm-workspace.yaml
├── 📄 turbo.json
└── 📄 tsconfig.base.json
```

---

## 3. 핵심 모듈 설계

### 3.1 게임 엔진 (Game Engine)

#### 책임
- 각 게임의 공통 로직 관리
- 스테이지 진행 및 점수 계산
- 게임 상태 관리
- 애니메이션 제어

#### 주요 기능
- 게임 라이프사이클 관리
- 공통 UI 컴포넌트 제공
- 진행도 추적 및 저장
- 성과 평가 시스템

### 3.2 코드 실행 엔진 (Code Execution Engine)

#### 책임
- 사용자 입력 코드 검증
- 안전한 코드 실행 환경 제공
- 실행 결과 분석
- 에러 핸들링

#### 주요 기능
- 샌드박스 환경에서 코드 실행
- 실행 시간 제한 및 메모리 관리
- 코드 품질 검사
- 실행 결과 시각화

### 3.3 시각화 엔진 (Visualization Engine)

#### 책임
- 추상적 개념의 시각적 표현
- 인터랙티브 애니메이션 제공
- 실시간 상태 변화 표시
- 게임별 맞춤 시각화

#### 주요 기능
- Canvas 및 SVG 기반 렌더링
- 물리 기반 애니메이션
- 실시간 데이터 바인딩
- 반응형 그래픽

### 3.4 진행도 관리 시스템 (Progress Management)

#### 책임
- 사용자 학습 진행도 추적
- 성취 시스템 관리
- 통계 데이터 수집
- 개인화 추천

#### 주요 기능
- 로컬 스토리지 기반 데이터 저장
- 진행도 시각화
- 성취 배지 시스템
- 학습 패턴 분석

---

## 4. 컴포넌트 아키텍처

### 4.1 공통 컴포넌트 (Shared Components)

#### Layout Components
- **GameLayout**: 모든 게임의 기본 레이아웃
- **Header**: 네비게이션 및 사용자 정보
- **Sidebar**: 게임 메뉴 및 진행도
- **Footer**: 추가 정보 및 링크

#### UI Components
- **CodeEditor**: Monaco Editor 래퍼
- **Button**: 다양한 스타일의 버튼
- **Modal**: 공통 모달 컴포넌트
- **ProgressBar**: 진행도 표시
- **Badge**: 성취 및 레벨 표시

#### Game Components
- **StageHeader**: 스테이지 정보 표시
- **GameControls**: 게임 조작 버튼
- **ScoreDisplay**: 점수 및 통계 표시
- **HintSystem**: 힌트 제공 시스템

### 4.2 게임별 컴포넌트 (Game-Specific Components)

#### Closure Cave
- **CaveVisualizer**: 동굴 구조 시각화
- **ScopeIndicator**: 스코프 레벨 표시
- **TreasureChest**: 보물상자 애니메이션

#### Promise Battle
- **CardDeck**: 카드 덱 관리
- **BattleField**: 대전 화면
- **ChainBuilder**: Promise 체인 구성

#### CallStack Library
- **BookStack**: 책 쌓기 애니메이션
- **FunctionCard**: 함수 정보 카드
- **StackVisualizer**: 스택 상태 표시

---

## 5. 상태 관리 설계

### 5.1 전역 상태 (Global State)

#### 사용자 상태
- 현재 플레이 중인 게임
- 전체 진행도 및 레벨
- 사용자 설정 및 선호도
- 성취 및 배지 정보

#### 게임 설정
- 게임 목록 및 메타데이터
- 난이도 설정
- 테마 및 UI 설정
- 언어 설정

### 5.2 로컬 상태 (Local State)

#### 게임 상태
- 현재 스테이지 정보
- 게임 플레이 상태
- 임시 점수 및 시간
- 사용자 입력 데이터

#### UI 상태
- 모달 및 팝업 상태
- 로딩 상태
- 에러 상태
- 애니메이션 상태

---

## 6. 데이터 플로우

### 6.1 게임 플레이 플로우

1. **게임 선택**: 사용자가 특정 게임 선택
2. **스테이지 로드**: 해당 스테이지 데이터 로드
3. **게임 초기화**: 게임 상태 및 UI 초기화
4. **사용자 입력**: 코드 작성 또는 인터랙션
5. **검증 및 실행**: 입력 검증 후 코드 실행
6. **결과 처리**: 실행 결과 분석 및 피드백
7. **진행도 업데이트**: 성과에 따른 진행도 저장
8. **다음 단계**: 성공 시 다음 스테이지로 진행

### 6.2 데이터 저장 플로우

1. **로컬 저장**: 모든 진행도는 localStorage에 저장
2. **백업 생성**: 중요 데이터의 JSON 백업 제공
3. **데이터 복원**: 백업 파일을 통한 데이터 복원
4. **동기화**: 다중 기기 간 수동 동기화 지원

---

## 7. 성능 최적화 전략

### 7.1 코드 스플리팅

#### 게임별 분할
- 각 게임을 별도 청크로 분리
- 동적 import를 통한 지연 로딩
- 공통 라이브러리는 별도 청크로 관리

#### 라우트별 분할
- 페이지별 코드 스플리팅
- 프리로딩 전략 적용
- 중요도에 따른 우선순위 설정

### 7.2 렌더링 최적화

#### React 최적화
- memo, useMemo, useCallback 적극 활용
- 가상화 리스트로 대량 데이터 처리
- Suspense를 통한 점진적 로딩

#### 애니메이션 최적화
- CSS 변환 속성 활용
- 하드웨어 가속 최적화
- 애니메이션 프레임 최적화

### 7.3 리소스 최적화

#### 이미지 최적화
- WebP 포맷 우선 사용
- 반응형 이미지 제공
- 지연 로딩 적용

#### 폰트 최적화
- 서브셋 폰트 사용
- 폰트 display swap 설정
- 로컬 폰트 우선 활용

---

## 8. 보안 고려사항

### 8.1 코드 실행 보안

#### 샌드박스 환경
- Web Worker를 통한 격리 실행
- 실행 시간 제한 설정
- 메모리 사용량 제한

#### 입력 검증
- 악성 코드 패턴 검사
- 위험한 API 호출 차단
- 코드 복잡도 제한

### 8.2 데이터 보안

#### 로컬 데이터 보호
- 중요 데이터 암호화
- 무결성 검증
- 안전한 백업 생성

#### 개인정보 보호
- 최소한의 데이터 수집
- 로컬 저장소 우선 사용
- 데이터 익명화

---

## 9. 접근성 고려사항

### 9.1 웹 접근성 표준

#### WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 기준 준수
- 대체 텍스트 제공

#### 반응형 디자인
- 모바일 우선 설계
- 다양한 화면 크기 지원
- 터치 인터페이스 최적화

### 9.2 학습 접근성

#### 다국어 지원
- i18n 프레임워크 적용
- 지역화 가능한 컴포넌트 설계
- 문화적 맥락 고려

#### 학습 장애 지원
- 단계별 학습 진도 조절
- 시각적 피드백 강화
- 음성 안내 옵션

---

## 10. 배포 및 운영

### 10.1 배포 전략

#### Next.js 정적 사이트 배포
- Vercel (권장), Netlify, GitHub Pages 활용
- `next export`를 통한 정적 파일 생성
- CDN을 통한 글로벌 배포
- Turbo 기반 자동 배포 파이프라인

#### PWA 배포
- Next.js PWA 플러그인 활용
- 서비스 워커 자동 생성
- 오프라인 캐싱 전략
- 앱 설치 프롬프트

### 10.2 모니터링 및 분석

#### 성능 모니터링
- Core Web Vitals 추적
- 로딩 시간 분석
- 에러 추적 및 알림

#### 사용자 분석
- 게임 완주율 분석
- 학습 패턴 파악
- 난이도 조정 데이터

---

## 11. 확장성 고려사항

### 11.1 수평적 확장

#### 새로운 게임 추가
- 플러그인 아키텍처 적용
- 표준화된 게임 인터페이스
- 독립적인 게임 모듈

#### 다양한 언어 지원
- 언어별 코드 실행 엔진
- 언어별 시각화 컴포넌트
- 통합된 학습 관리 시스템

### 11.2 수직적 확장

#### 고급 기능 추가
- AI 기반 개인화 추천
- 실시간 멀티플레이어
- 소셜 기능 통합
- 클라우드 동기화

#### 플랫폼 확장
- 모바일 앱 변환
- 데스크톱 앱 패키징
- VR/AR 환경 지원

---

## 12. 개발 일정 및 마일스톤

### Phase 1: 기반 구조 (4주)
- React 19 프로젝트 셋업
- 공통 컴포넌트 개발
- 기본 라우팅 및 상태 관리
- 디자인 시스템 구축

### Phase 2: 핵심 게임 (6주)
- Closure Cave 완전 구현
- Promise Battle 완전 구현
- CallStack Library 완전 구현
- 기본 진행도 시스템

### Phase 3: 확장 기능 (4주)
- 나머지 게임들 구현
- 고급 시각화 기능
- 성취 시스템 완성
- PWA 기능 추가

### Phase 4: 최적화 및 배포 (2주)
- 성능 최적화
- 접근성 개선
- 테스트 및 버그 수정
- 프로덕션 배포