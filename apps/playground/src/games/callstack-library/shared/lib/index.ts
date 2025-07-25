/**
 * Shared Library - Public API
 * 
 * Feature-Sliced Design shared 레이어의 통합 진입점
 */

// Event Sourcing Infrastructure
export * from './event-sourcing';

// CQRS Infrastructure  
export * from './cqrs';

// React Integration
export * from './react-integration';

// Web Workers (Phase 3)
export * from '../workers';

// React Concurrent Features (Phase 3)
export * from './react-concurrent';

// Virtualization and Memoization (Phase 3)
export * from './virtualization';