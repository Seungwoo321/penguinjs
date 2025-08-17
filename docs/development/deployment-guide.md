# PenguinJS 개발 배포 가이드

## 1. 개요

### 목적
JavaScript 학습 게임 플랫폼의 효율적인 개발 환경 구축과 안정적인 배포 프로세스 제공

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

### 프로젝트 초기 설정

```bash
# 저장소 클론
git clone [repository-url] penguinjs
cd penguinjs

# 의존성 설치
pnpm install

# 개발 서버 시작 (포트 4000)
pnpm dev
```

---

## 3. 프로젝트 구조

```
penguinjs/
├── apps/
│   └── playground/          # Next.js 메인 애플리케이션
├── packages/
│   ├── ui/                 # 공통 UI 컴포넌트
│   ├── game-engine/        # 게임 엔진
│   └── utils/              # 유틸리티 함수
├── docs/                   # 프로젝트 문서
└── turbo.json             # Turborepo 설정
```

---

## 4. 개발 명령어

### 기본 명령어
```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트 실행
pnpm lint

# 테스트 실행
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Turbo 명령어
```bash
# 모든 앱/패키지 빌드
pnpm turbo build

# 캐시 정리
pnpm turbo clean
```

---

## 5. 현재 CI/CD 구성

### GitHub Actions

#### 구현된 워크플로우
- **accessibility.yml**: 색상 대비 접근성 체크 ✅

#### 미구현 워크플로우
- 테스트 자동화 ❌
- 빌드 검증 ❌
- 배포 자동화 ❌
- 의존성 보안 체크 ❌

---

## 6. 빌드 및 배포

### 로컬 빌드
```bash
# playground 앱 빌드
cd apps/playground
pnpm build

# 빌드 결과 확인
ls -la .next/
```

### 프로덕션 빌드 최적화
- Next.js 자동 최적화
- 이미지 최적화
- 코드 스플리팅
- Tree shaking

### 배포 옵션

#### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

#### 정적 호스팅
```bash
# 정적 파일 빌드
pnpm build
pnpm export

# out/ 폴더를 호스팅
```

---

## 7. 환경 변수

### 개발 환경 (.env.local)
```env
NEXT_PUBLIC_APP_URL=http://localhost:4000
```

### 프로덕션 환경
- Vercel 대시보드에서 설정
- 또는 .env.production 파일 사용

---

## 8. 모니터링 및 디버깅

### 개발 도구
- React DevTools
- Next.js DevTools
- Chrome DevTools

### 성능 모니터링
- Lighthouse 점수 체크
- Core Web Vitals 측정
- Bundle 크기 분석

```bash
# Bundle 분석
ANALYZE=true pnpm build
```

---

## 9. 트러블슈팅

### 일반적인 문제

#### pnpm 관련
```bash
# pnpm 캐시 정리
pnpm store prune

# node_modules 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Next.js 관련
```bash
# .next 캐시 정리
rm -rf .next
pnpm dev
```

#### TypeScript 관련
```bash
# TypeScript 캐시 정리
rm -rf tsconfig.tsbuildinfo
pnpm type-check
```

---

## 10. 향후 개선 사항

### 단기 계획
- [ ] GitHub Actions CI/CD 파이프라인 구축
- [ ] 자동 테스트 실행
- [ ] PR 자동 검증

### 중기 계획
- [ ] Docker 컨테이너화
- [ ] 스테이징 환경 구축
- [ ] 자동 배포 파이프라인

### 장기 계획
- [ ] 블루-그린 배포
- [ ] 카나리 배포
- [ ] A/B 테스팅 인프라

---

## 11. 보안 고려사항

### 코드 보안
- 의존성 정기 업데이트
- 보안 취약점 스캔
- 환경 변수 관리

### 배포 보안
- HTTPS 강제
- CSP 헤더 설정
- Rate limiting

---

## 12. 팀 협업

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `fix/*`: 버그 수정

### 코드 리뷰
- PR 필수
- 최소 1명 리뷰
- 테스트 통과 필수

### 커밋 컨벤션
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 업데이트
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```