# JSPlayground 개발 배포 가이드

## 1. 개요

### 목적
JavaScript 학습 게임 플랫폼의 효율적인 개발 환경 구축과 안정적인 배포 프로세스 제공

### 적용 범위
- 로컬 개발 환경 설정
- 팀 협업 워크플로우
- 빌드 및 배포 자동화
- 운영 환경 관리

### 전제 조건
- Node.js 20.0.0 이상
- pnpm 10.11.0 이상
- Git 기본 지식
- TypeScript 기본 지식

---

## 2. 개발 환경 설정

### 시스템 요구사항

#### 최소 요구사항
- **OS**: Windows 10, macOS 10.15, Ubuntu 18.04 이상
- **CPU**: 4코어 이상
- **RAM**: 8GB 이상
- **저장공간**: 10GB 이상 여유 공간
- **네트워크**: 안정적인 인터넷 연결

#### 권장 요구사항
- **CPU**: 8코어 이상
- **RAM**: 16GB 이상
- **SSD**: 빠른 읽기/쓰기 속도
- **외부 모니터**: 듀얼 모니터 구성

### 필수 도구 설치

#### Node.js 및 패키지 매니저
1. **Node.js 설치**
   - 공식 웹사이트에서 LTS 버전 다운로드
   - 버전 확인: `node --version`
   - 권장 버전: 20.x 이상

2. **pnpm 설치**
   - 전역 설치: `npm install -g pnpm`
   - 버전 확인: `pnpm --version`
   - 프로젝트 내 버전 고정 설정

#### 개발 도구
1. **Visual Studio Code**
   - 공식 에디터 권장
   - 확장 프로그램 설치 (후술)

2. **Git**
   - 버전 관리 도구
   - SSH 키 설정 권장

3. **브라우저**
   - Chrome (개발용 메인)
   - Firefox, Safari, Edge (테스트용)

### VS Code 확장 프로그램

#### 필수 확장 프로그램
- **TypeScript and JavaScript Language Features**: 기본 TS/JS 지원
- **ES7+ React/Redux/React-Native snippets**: React 코드 스니펫
- **Prettier**: 코드 포맷팅
- **ESLint**: 코드 품질 검사
- **Auto Rename Tag**: HTML/JSX 태그 자동 수정
- **Bracket Pair Colorizer**: 괄호 쌍 색상 구분

#### 권장 확장 프로그램
- **GitLens**: Git 기능 확장
- **Thunder Client**: API 테스트
- **Code Spell Checker**: 스펠링 검사
- **TODO Highlight**: TODO 주석 강조
- **Path Intellisense**: 경로 자동 완성

### 프로젝트 초기 설정

#### 저장소 클론
```bash
# 저장소 클론
git clone [repository-url] js-playground
cd js-playground

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

#### 환경 변수 설정
1. **.env.local 파일 생성**
   - 개발용 환경 변수 설정
   - API 키, 서드파티 서비스 설정

2. **환경별 설정 파일**
   - development, staging, production 환경 분리
   - 민감 정보는 별도 관리

---

## 3. 개발 워크플로우

### 브랜치 전략

#### Git Flow 기반 브랜치 모델
```
main                  # 프로덕션 배포 브랜치
├── develop          # 개발 통합 브랜치
├── feature/*        # 기능 개발 브랜치
├── hotfix/*         # 긴급 수정 브랜치
└── release/*        # 릴리스 준비 브랜치
```

#### 브랜치 명명 규칙
- **feature/**: `feature/closure-cave-animation`
- **hotfix/**: `hotfix/code-execution-security`
- **release/**: `release/v1.2.0`
- **docs/**: `docs/update-readme`

### 커밋 메시지 규칙

#### Conventional Commits 형식
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### 커밋 타입
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 스타일 변경 (포맷팅 등)
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스, 도구 설정 변경

#### 커밋 메시지 예시
```
feat(closure-cave): add code execution visualization

- Add step-by-step code execution animation
- Implement variable scope highlighting
- Add execution timeline controls

Closes #123
```

### 코드 리뷰 프로세스

#### Pull Request 작성 가이드
1. **제목**: 명확하고 구체적인 변경 내용
2. **설명**: 변경 사유, 구현 방법, 테스트 내용
3. **체크리스트**: 완료해야 할 항목 확인
4. **스크린샷**: UI 변경 시 이전/이후 비교

#### 리뷰 기준
- **기능 정확성**: 요구사항 충족 여부
- **코드 품질**: 가독성, 유지보수성
- **성능**: 메모리, 속도 최적화
- **보안**: 보안 취약점 검토
- **테스트**: 적절한 테스트 커버리지

### 로컬 개발 가이드

#### 개발 서버 실행
```bash
# 전체 프로젝트 개발 서버
pnpm dev

# 특정 앱만 실행
pnpm dev --filter playground

# 테스트와 함께 실행
pnpm dev:test
```

#### 핫 리로드 설정
- 파일 변경 시 자동 새로고침
- 타입 에러 실시간 표시
- 빠른 피드백 루프 제공

#### 디버깅 설정
1. **VS Code 디버거 설정**
   - launch.json 구성
   - 브레이크포인트 설정
   - 변수 값 실시간 확인

2. **브라우저 개발자 도구**
   - React DevTools 활용
   - 성능 프로파일링
   - 네트워크 모니터링

---

## 4. 빌드 시스템

### Turborepo 기반 모노레포

#### 워크스페이스 구조
```
js-playground/
├── apps/               # 애플리케이션
│   └── playground/     # 메인 게임 앱
├── packages/           # 공유 패키지
│   ├── ui/            # UI 컴포넌트
│   ├── game-engine/   # 게임 엔진
│   └── utils/         # 유틸리티
└── docs/              # 문서
```

#### Turbo 스크립트 실행
```bash
# 전체 프로젝트 빌드
pnpm build

# 특정 패키지만 빌드
pnpm build --filter=ui

# 병렬 빌드 (성능 향상)
pnpm build --parallel

# 변경된 것만 빌드 (인크리멘탈)
pnpm build --since=HEAD~1
```

### Next.js 빌드 최적화

#### 정적 사이트 생성
- **Static Site Generation (SSG)**: 빌드 타임 페이지 생성
- **정적 에셋 최적화**: 이미지, 폰트, CSS 최적화
- **코드 스플리팅**: 페이지별, 컴포넌트별 분할
- **트리 쉐이킹**: 사용하지 않는 코드 제거

#### 번들 분석
```bash
# 번들 크기 분석
pnpm analyze

# 의존성 트리 확인
pnpm why [package-name]

# 중복 패키지 확인
pnpm dedupe
```

### 타입 체크 및 린팅

#### TypeScript 컴파일 검사
```bash
# 타입 체크
pnpm type-check

# 특정 패키지 타입 체크
pnpm type-check --filter=playground
```

#### ESLint 및 Prettier
```bash
# 린트 검사
pnpm lint

# 자동 수정
pnpm lint:fix

# 포맷팅
pnpm format
```

---

## 5. 테스트 실행

### 단위 테스트

#### Vitest 테스트 실행
```bash
# 모든 테스트 실행
pnpm test

# 특정 패키지 테스트
pnpm test --filter=game-engine

# 워치 모드
pnpm test:watch

# 커버리지 포함
pnpm test:coverage
```

#### 테스트 패턴
- **파일명**: `*.test.ts`, `*.spec.ts`
- **테스트 위치**: 소스 파일과 동일 디렉토리 또는 `__tests__` 폴더
- **모킹**: `vi.mock()` 활용

### 통합 테스트

#### 컴포넌트 테스트
```bash
# React 컴포넌트 테스트
pnpm test:components

# 게임 엔진 통합 테스트
pnpm test:integration
```

### E2E 테스트

#### Playwright 테스트
```bash
# E2E 테스트 실행
pnpm test:e2e

# 특정 브라우저만
pnpm test:e2e:chrome

# 헤드리스 모드
pnpm test:e2e:headless

# 디버그 모드
pnpm test:e2e:debug
```

---

## 6. CI/CD 파이프라인

### GitHub Actions 워크플로우

#### 기본 워크플로우 구조
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

#### 단계별 파이프라인
1. **코드 체크아웃**: 최신 코드 가져오기
2. **의존성 설치**: 캐시된 node_modules 활용
3. **린트 검사**: 코드 품질 검증
4. **타입 체크**: TypeScript 타입 검증
5. **단위 테스트**: 빠른 피드백
6. **빌드**: 프로덕션 빌드 검증
7. **E2E 테스트**: 전체 시나리오 검증

### 배포 자동화

#### 브랜치별 배포 전략
- **main 브랜치**: 프로덕션 배포
- **develop 브랜치**: 스테이징 배포
- **feature 브랜치**: 미리보기 배포

#### 배포 환경별 설정
1. **Development**: 개발자 로컬 환경
2. **Staging**: 프로덕션과 동일한 테스트 환경
3. **Production**: 실제 사용자 환경

---

## 7. 배포 전략

### 정적 사이트 배포

#### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 첫 배포 설정
vercel

# 프로덕션 배포
vercel --prod
```

#### 장점
- **Zero-config**: 별도 설정 없이 자동 배포
- **미리보기**: PR마다 자동 미리보기 URL 생성
- **CDN**: 전 세계 Edge 네트워크 활용
- **Analytics**: 내장 성능 분석 도구

#### GitHub Pages 배포
```bash
# 정적 파일 생성
pnpm build

# gh-pages 브랜치에 배포
pnpm deploy:gh-pages
```

#### Netlify 배포
- **빌드 설정**: netlify.toml 파일 구성
- **폼 처리**: 사용자 피드백 폼 처리
- **플러그인**: 다양한 빌드 플러그인 활용

### Progressive Web App (PWA)

#### PWA 설정
1. **서비스 워커**: 오프라인 캐싱
2. **웹 매니페스트**: 앱 설치 정보
3. **아이콘**: 다양한 크기 앱 아이콘
4. **오프라인 페이지**: 네트워크 연결 실패 시 표시

#### 캐싱 전략
- **정적 리소스**: 장기 캐싱
- **API 응답**: 짧은 캐싱
- **게임 데이터**: 오프라인 우선
- **사용자 데이터**: 로컬 저장소 활용

---

## 8. 환경별 설정

### 개발 환경 (Development)

#### 특징
- **핫 리로드**: 실시간 코드 반영
- **디버그 모드**: 상세한 로그 출력
- **목업 데이터**: 테스트용 가짜 데이터
- **개발 도구**: React DevTools, Redux DevTools

#### 설정 파일
```
apps/playground/.env.development
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 스테이징 환경 (Staging)

#### 특징
- **프로덕션 동일**: 실제 환경과 최대한 유사
- **테스트 데이터**: 실제와 유사한 테스트 데이터
- **모니터링**: 성능 및 오류 모니터링
- **접근 제한**: 개발팀만 접근 가능

#### 배포 프로세스
1. **develop 브랜치 푸시**: 자동 배포 트리거
2. **빌드 및 테스트**: CI 파이프라인 실행
3. **스테이징 배포**: 성공 시 자동 배포
4. **수동 테스트**: QA 팀 테스트 진행

### 프로덕션 환경 (Production)

#### 특징
- **최적화**: 최고 성능으로 최적화
- **모니터링**: 실시간 성능 및 오류 추적
- **백업**: 정기적 데이터 백업
- **보안**: 최고 수준 보안 설정

#### 배포 승인 프로세스
1. **코드 리뷰**: 팀 리더 승인
2. **QA 통과**: 모든 테스트 통과
3. **스테이징 검증**: 스테이징 환경 테스트
4. **프로덕션 배포**: 수동 배포 승인

---

## 9. 모니터링 및 로깅

### 성능 모니터링

#### Web Vitals 추적
- **FCP (First Contentful Paint)**: 첫 콘텐츠 표시 시간
- **LCP (Largest Contentful Paint)**: 주요 콘텐츠 로딩 시간
- **CLS (Cumulative Layout Shift)**: 레이아웃 변화 측정
- **FID (First Input Delay)**: 첫 입력 응답 시간

#### 모니터링 도구
- **Vercel Analytics**: 기본 성능 메트릭
- **Google Analytics**: 사용자 행동 분석
- **Sentry**: 오류 추적 및 성능 모니터링
- **Lighthouse CI**: 자동화된 성능 감사

### 오류 추적

#### 클라이언트 오류
- **JavaScript 오류**: 런타임 에러 자동 수집
- **네트워크 오류**: API 호출 실패 추적
- **사용자 행동**: 오류 발생 전 사용자 행동 기록
- **브라우저 정보**: 사용자 환경 정보 수집

#### 오류 대응 프로세스
1. **자동 알림**: 심각한 오류 즉시 알림
2. **우선순위 분류**: 영향도에 따른 우선순위
3. **근본 원인 분석**: 오류 발생 원인 조사
4. **수정 및 배포**: 빠른 수정과 배포

### 사용자 분석

#### 학습 효과 측정
- **완료율**: 스테이지별 완료율 추적
- **학습 시간**: 개념별 평균 학습 시간
- **재방문**: 사용자 재방문 패턴 분석
- **만족도**: 사용자 피드백 및 평점

#### 게임 밸런싱 데이터
- **난이도 분포**: 각 스테이지 난이도 적절성
- **포기 지점**: 사용자가 포기하는 지점 분석
- **힌트 사용**: 힌트 사용 패턴 분석
- **시간 분포**: 스테이지별 소요 시간 분포

---

## 10. 보안 관리

### 코드 보안

#### 의존성 보안 검사
```bash
# 보안 취약점 스캔
pnpm audit

# 자동 수정
pnpm audit fix

# 의존성 업데이트
pnpm update
```

#### 정적 보안 분석
- **ESLint Security**: 보안 관련 ESLint 규칙
- **CodeQL**: GitHub의 코드 분석 도구
- **Snyk**: 의존성 취약점 모니터링

### 배포 보안

#### 환경 변수 관리
- **민감 정보 분리**: API 키, 토큰 별도 관리
- **환경별 설정**: 환경마다 다른 설정값
- **암호화**: 중요 정보 암호화 저장
- **접근 제한**: 필요한 인원만 접근 가능

#### HTTPS 및 보안 헤더
- **SSL/TLS**: 모든 통신 암호화
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy 설정
- **CORS**: Cross-Origin Resource Sharing 설정

---

## 11. 팀 협업

### 개발 환경 표준화

#### 에디터 설정 통일
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

#### Git 훅 설정
```bash
# Husky 설치 및 설정
pnpm add -D husky lint-staged

# pre-commit 훅
# .husky/pre-commit
pnpm lint-staged

# commit-msg 훅
# .husky/commit-msg
pnpm commitlint --edit $1
```

### 문서화

#### 코드 문서화
- **JSDoc**: 함수 및 클래스 문서화
- **README**: 패키지별 사용법 설명
- **Storybook**: 컴포넌트 문서화
- **TypeDoc**: TypeScript API 문서 자동 생성

#### 온보딩 가이드
1. **개발 환경 설정**: 단계별 설정 가이드
2. **프로젝트 구조**: 코드베이스 이해를 위한 설명
3. **개발 워크플로우**: 실제 개발 과정 설명
4. **트러블슈팅**: 자주 발생하는 문제 해결법

### 커뮤니케이션

#### 정기 미팅
- **일일 스탠드업**: 진행 상황 및 이슈 공유
- **주간 리뷰**: 완료된 작업 리뷰
- **스프린트 계획**: 다음 스프린트 계획 수립
- **회고**: 개선점 논의 및 액션 아이템 도출

#### 이슈 관리
- **GitHub Issues**: 버그, 기능 요청 관리
- **프로젝트 보드**: 칸반 방식 진행 상황 관리
- **마일스톤**: 릴리스 계획 및 진행률 추적
- **라벨**: 이슈 분류 및 우선순위 표시

---

## 12. 트러블슈팅

### 일반적인 문제

#### 의존성 설치 문제
```bash
# 캐시 정리
pnpm store prune

# lock 파일 삭제 후 재설치
rm pnpm-lock.yaml
pnpm install

# 특정 패키지 재설치
pnpm add [package-name] --force
```

#### 빌드 오류
```bash
# 타입 에러 확인
pnpm type-check

# 린트 오류 확인
pnpm lint

# 캐시 정리 후 빌드
pnpm clean
pnpm build
```

#### 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :3000

# 프로세스 종료
kill -9 [PID]

# 다른 포트 사용
PORT=3001 pnpm dev
```

### 성능 문제

#### 느린 빌드
- **증분 빌드**: Turbo 캐시 활용
- **병렬 처리**: 멀티코어 활용
- **불필요한 의존성**: 사용하지 않는 패키지 제거
- **TypeScript 설정**: 프로젝트 참조 활용

#### 메모리 부족
- **Node.js 메모리 증가**: `--max-old-space-size=4096`
- **워커 프로세스 제한**: 동시 실행 작업 수 조절
- **의존성 최적화**: 큰 패키지 대안 찾기

### 배포 문제

#### 배포 실패
1. **로그 확인**: 배포 로그에서 오류 메시지 확인
2. **환경 변수**: 필요한 환경 변수 설정 확인
3. **빌드 테스트**: 로컬에서 프로덕션 빌드 테스트
4. **롤백**: 문제 발생 시 이전 버전으로 롤백

#### 성능 저하
- **번들 분석**: 불필요한 코드 포함 여부 확인
- **이미지 최적화**: 이미지 크기 및 포맷 최적화
- **캐싱**: 적절한 캐시 설정 확인
- **CDN**: CDN 설정 및 지역별 성능 확인

---

## 13. 유지보수

### 정기 업데이트

#### 의존성 업데이트 주기
- **보안 패치**: 즉시 적용
- **마이너 업데이트**: 월 1회
- **메이저 업데이트**: 분기 1회
- **Node.js LTS**: 연 2회

#### 업데이트 프로세스
1. **호환성 확인**: 브레이킹 체인지 검토
2. **테스트 환경**: 스테이징에서 먼저 테스트
3. **점진적 배포**: 카나리 배포 또는 블루-그린 배포
4. **모니터링**: 배포 후 성능 및 오류 모니터링

### 성능 최적화

#### 정기 성능 감사
- **Lighthouse 점수**: 월별 성능 점수 추적
- **번들 크기**: 번들 크기 증가 추이 모니터링
- **로딩 시간**: 페이지별 로딩 시간 측정
- **사용자 경험**: 실제 사용자 성능 데이터 분석

### 백업 및 복구

#### 코드 백업
- **Git 저장소**: 여러 원격 저장소 사용
- **자동 백업**: 정기적 자동 백업 스크립트
- **버전 태그**: 안정 버전 태그 관리

#### 사용자 데이터 보호
- **로컬 스토리지**: 사용자 진행도 보호
- **내보내기 기능**: 사용자 데이터 내보내기 지원
- **복구 도구**: 데이터 손실 시 복구 도구 제공