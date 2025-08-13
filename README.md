# 🐧 PenguinJS

**Cool Code, Warm Learning** - JavaScript 핵심 개념을 게임으로 학습하는 인터랙티브 플랫폼

## 📋 프로젝트 개요

PenguinJS는 JavaScript의 복잡한 개념들을 직관적이고 재미있는 게임으로 학습할 수 있는 교육 플랫폼입니다. Flexbox Froggy와 같은 인터랙티브 학습 경험을 JavaScript 영역으로 확장하여, 개발자들이 더 쉽고 재미있게 학습할 수 있도록 설계되었습니다.

## 🎮 주요 특징

- **18개의 학습 게임**: 클로저부터 이벤트루프까지 JS 핵심 개념 완전 커버
- **270개의 스테이지**: 초급-중급-고급 단계별 학습 (게임당 15스테이지)
- **완전 클라이언트 사이드**: 서버 없이 브라우저에서 완전 동작
- **안전한 코드 실행**: Web Worker 기반 샌드박스 환경
- **PWA 지원**: 오프라인 학습 가능
- **다국어 지원**: 한국어, 영어, 일본어, 중국어

## 🐧 캐릭터

**Penguin Developer** - 차분하고 끈기있는 아기 황제펭귄이 여러분의 JavaScript 학습 여정을 함께합니다.

## 🎯 학습 게임 목록

### 기초 개념
1. ✅ **Closure Cave** - 클로저와 스코프 체인 *(구현 완료)*
2. ✅ **CallStack Library** - 함수 호출 스택과 실행 순서 *(구현 완료)*
3. 🔒 **Scope Forest** - 스코프 체인과 변수 접근 *(개발 예정)*
4. 🔒 **Hoisting Helicopter** - 호이스팅과 변수 선언 *(개발 예정)*

### 비동기 프로그래밍
5. ⚠️ **Promise Battle** - Promise 상태와 비동기 처리 *(기초 구조만)*
6. 🔒 **Async Airways** - async/await와 비동기 프로그래밍 *(개발 예정)*
7. 🔒 **EventLoop Cinema** - 이벤트 루프와 실행 순서 *(개발 예정)*

### 고급 개념
8. 🔒 **Proxy Laboratory** - Proxy 객체와 메타프로그래밍 *(개발 예정)*
9. 🔒 **Event Target** - 이벤트 처리와 이벤트 버블링 *(개발 예정)*
10. 🔒 **Prototype Chain** - 프로토타입 상속과 체인 *(개발 예정)*
11. 🔒 **This Binding Target** - this 키워드와 바인딩 *(개발 예정)*

### 실무 기능
12. 🔒 **Memory Management Museum** - 가비지 컬렉션과 메모리 최적화 *(개발 예정)*
13. 🔒 **Destructuring Circus** - 구조분해 할당 *(개발 예정)*
14. 🔒 **Array Methods Racing** - 배열 메서드와 함수형 프로그래밍 *(개발 예정)*
15. 🔒 **Modules Marketplace** - 모듈 시스템과 import/export *(개발 예정)*
16. 🔒 **Template Literal Art** - 템플릿 리터럴과 문자열 처리 *(개발 예정)*
17. 🔒 **Error Handling Hospital** - 에러 처리와 디버깅 *(개발 예정)*
18. 🔒 **WeakMap/WeakSet Vault** - WeakMap/WeakSet과 메모리 관리 *(개발 예정)*

> **범례**: ✅ 구현 완료 | ⚠️ 부분 구현 | 🔒 개발 예정

## 📊 구현 현황

### 전체 진행률
- **게임 구현**: 3/18 (16.7%)
- **스테이지 구현**: ~50/270 (18.5%)
- **핵심 기능**: 40% 완료

### 기능별 구현 상태
| 기능 | 상태 | 설명 |
|------|------|------|
| 다국어 지원 | ✅ | 한국어, 영어, 일본어, 중국어 지원 |
| 다크 모드 | ✅ | 시스템 테마 연동 |
| 게임 진행도 저장 | ✅ | 로컬 스토리지 기반 |
| 코드 에디터 | ⚠️ | CodeMirror 적용 (Monaco 전환 예정) |
| PWA 지원 | ❌ | 오프라인 지원 개발 필요 |
| Web Worker 샌드박스 | ❌ | 안전한 코드 실행 환경 필요 |

## 🛠️ 기술 스택

- **Framework**: Next.js 15.3.2
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5.8.3+
- **Build Tool**: Turbo (Monorepo)
- **Package Manager**: pnpm 10.11.0+
- **Styling**: Tailwind CSS 4.1.8
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React

## 📁 프로젝트 구조

```
penguinjs/
├── docs/                    # 프로젝트 문서
│   ├── planning/           # 기획 문서
│   ├── architecture/       # 아키텍처 설계
│   └── development/        # 개발 가이드
├── apps/                   # 애플리케이션 (향후 추가)
├── packages/               # 공유 패키지 (향후 추가)
├── README.md              # 이 파일
└── LICENSE                # 라이센스
```

## 📖 문서

### 기획 문서
- [프로젝트 개요](docs/planning/overview.md) - 전체 프로젝트 비전과 목표
- [게임 상세 설계](docs/planning/game-details.md) - 18개 게임별 상세 메커니즘
- [캐릭터 디자인](docs/planning/character-design.yml) - 펭귄 캐릭터 디자인 스펙

### 아키텍처 문서
- [시스템 설계](docs/architecture/system-design.md) - 전체 시스템 아키텍처
- [UI 디자인 시스템](docs/architecture/ui-design-system.md) - UI/UX 디자인 가이드
- [데이터 스키마](docs/architecture/data-schema.md) - 데이터 구조 설계
- [게임 엔진](docs/architecture/game-engine.md) - 게임 엔진 상세 설계

### 개발 문서
- [테스트 전략](docs/development/test-strategy.md) - 테스트 및 QA 계획
- [배포 가이드](docs/development/deployment-guide.md) - 개발 환경 및 배포 가이드

## 🚀 시작하기

### 전제 조건
- Node.js 20.0.0 이상
- pnpm 10.11.0 이상

### 설치 및 실행
```bash
# 저장소 클론
git clone [repository-url] penguinjs
cd penguinjs

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

## 🤝 기여하기

PenguinJS는 오픈소스 프로젝트입니다. 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📧 연락처

프로젝트 관련 문의사항이 있으시면 Issues를 통해 연락해 주세요.

---

**🐧 "Cool Code, Warm Learning" - PenguinJS와 함께 JavaScript 마스터가 되어보세요!**