# 테마 시스템 이슈 문서

## 개요
이 폴더는 PenguinJS 프로젝트의 테마 시스템 일관성 문제(ISSUE-002)에 대한 상세 문서를 포함합니다.

## 문서 구조

### 1. [PROBLEM_ANALYSIS.md](./PROBLEM_ANALYSIS.md)
- 현재 테마 시스템의 문제점 상세 분석
- 기술 스택별 제약사항
- 영향받는 컴포넌트 목록

### 2. [SOLUTION_ARCHITECTURE.md](./SOLUTION_ARCHITECTURE.md)
- 올바른 테마 시스템의 설계 철학
- 5개 레이어로 구성된 아키텍처
- 구현 로드맵 및 성공 지표

### 3. [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- 즉시 적용 가능한 수정 사항
- 단계별 마이그레이션 계획
- 검증 체크리스트 및 트러블슈팅

## 핵심 문제

### 현상
- GameGuideModal 등 Portal 기반 컴포넌트가 테마 변경 시 반응하지 않음
- 항상 다크 테마로 표시되는 문제 발생

### 원인
```
html.dark (next-themes가 관리)
└── body
    ├── #__next ✅ (테마 적용됨)
    └── Portal ❌ (테마 적용 안됨)
```

### 해결 방안
1. **단기**: CSS 변수 기반으로 모든 컴포넌트 수정
2. **장기**: 체계적인 Design Token System 구축

## 구현 우선순위

### High Priority (1주 내)
- [ ] GameGuideModal 테마 수정
- [ ] Portal Helper 구현
- [ ] 핵심 게임 컴포넌트 마이그레이션

### Medium Priority (2-3주)
- [ ] 전체 컴포넌트 마이그레이션
- [ ] TypeScript 타입 시스템 구축
- [ ] 테스트 및 문서화

### Low Priority (1개월 이후)
- [ ] 성능 최적화
- [ ] 자동화 도구 개발
- [ ] 디자인 시스템 확장

## 기대 효과
- ✅ 모든 컴포넌트에서 일관된 테마 적용
- ✅ Portal 문제 완전 해결
- ✅ 타입 안전성 확보
- ✅ 개발자 경험 개선
- ✅ 성능 향상 (리렌더링 감소)

## 참고 링크
- [Next.js Theming Best Practices](https://nextjs.org/docs/app/building-your-application/styling/css-variables)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [CSS Custom Properties Specification](https://www.w3.org/TR/css-variables-1/)

---

작성일: 2025-01-31
작성자: Claude (AI Assistant)
검토 필요: 프로젝트 리드 개발자