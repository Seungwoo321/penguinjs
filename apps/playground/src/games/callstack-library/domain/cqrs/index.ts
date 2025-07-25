/**
 * CQRS 패턴 통합 인덱스
 * 
 * Command Query Responsibility Segregation 패턴의 모든 구성 요소를 통합
 * 명령과 쿼리의 완전한 분리를 통한 확장성과 성능 최적화 제공
 */

// Commands
export * from './Commands';
export * from './CommandHandler';

// Queries  
export * from './Queries';
export * from './QueryHandler';

// CQRS 애플리케이션 서비스
export { 
  CQRSEventLoopService,
  createCQRSEventLoopService,
  getDefaultCQRSService,
  destroyDefaultCQRSService 
} from './CQRSEventLoopService';