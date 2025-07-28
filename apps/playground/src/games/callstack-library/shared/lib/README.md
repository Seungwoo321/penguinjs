# Feature-Sliced Design (FSD) Architecture

## Overview

Feature-Sliced Design을 적용한 CallStack Library Game의 새로운 아키텍처입니다.

## Layer Structure

```
src/
├── app/           # Application layer - 앱 초기화, 프로바이더, 라우팅
├── pages/         # Pages layer - 페이지 컴포넌트와 라우트
├── widgets/       # Widgets layer - 독립적인 UI 블록들
├── features/      # Features layer - 비즈니스 기능들
├── entities/      # Entities layer - 비즈니스 엔티티들
└── shared/        # Shared layer - 재사용 가능한 코드

```

## Design Principles

1. **Layer Isolation**: 각 레이어는 독립적이며 하위 레이어만 참조 가능
2. **Slice Independence**: 같은 레이어 내 슬라이스들은 서로 독립적
3. **Public API**: 각 슬라이스는 명확한 Public API 제공

## Import Rules

- ✅ **Allowed**: `shared` ← `entities` ← `features` ← `widgets` ← `pages` ← `app`
- ❌ **Forbidden**: 상위 레이어에서 하위 레이어로의 직접 import
- ❌ **Forbidden**: 같은 레이어 내 슬라이스 간 직접 import

## Migration Progress

- [x] Domain Models (entities)
- [x] CQRS Infrastructure (shared/lib)
- [ ] Business Features (features)
- [ ] UI Widgets (widgets)
- [ ] Page Components (pages)
- [ ] App Configuration (app)