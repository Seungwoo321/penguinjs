/**
 * CallStack Library Game - FSD Architecture Entry Point
 * 
 * Feature-Sliced Design 아키텍처를 적용한 CallStack Library Game
 * 
 * Layer Structure:
 * - app/       - Application initialization and providers
 * - pages/     - Page components and routing
 * - widgets/   - Independent UI blocks
 * - features/  - Business features and use cases
 * - entities/  - Business entities and domain models
 * - shared/    - Reusable infrastructure and utilities
 */

// Legacy exports (마이그레이션 중)
export { CallStackLibraryGame } from './CallStackLibraryGame'
export { callstackLibraryConfig } from './game-config'
export { callstackLibraryGame } from './game-data'

// FSD Architecture exports
// App Layer - 애플리케이션 설정
export * from './app';

// Pages Layer - 페이지 컴포넌트
export * from './pages';

// Widgets Layer - 독립적인 UI 블록
export * from './widgets';

// Features Layer - 비즈니스 기능
export * from './features';

// Entities Layer - 도메인 엔티티
export * from './entities';

// Shared Layer - 공통 인프라
export * from './shared/lib';