/**
 * Module Federation Setup
 * 
 * Phase 4: 확장성 확보 - 마이크로 프론트엔드 준비
 * Module Federation을 위한 설정과 유틸리티
 */

import React from 'react';

// Module Federation 타입 정의
export interface RemoteModule {
  name: string;
  url: string;
  scope: string;
  module: string;
  version?: string;
  fallback?: React.ComponentType<any>;
}

export interface FederatedComponent {
  remoteName: string;
  moduleName: string;
  componentName: string;
  fallback?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface ModuleFederationConfig {
  name: string;
  remotes: Record<string, string>;
  exposes: Record<string, string>;
  shared: Record<string, any>;
}

// 런타임 모듈 로더
export class ModuleFederationLoader {
  private static instance: ModuleFederationLoader;
  private loadedModules = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  static getInstance(): ModuleFederationLoader {
    if (!ModuleFederationLoader.instance) {
      ModuleFederationLoader.instance = new ModuleFederationLoader();
    }
    return ModuleFederationLoader.instance;
  }

  // 원격 모듈 동적 로드
  async loadRemoteModule(remote: RemoteModule): Promise<any> {
    const { name, url, scope, module } = remote;
    const key = `${name}-${scope}-${module}`;

    // 이미 로드된 모듈이 있으면 반환
    if (this.loadedModules.has(key)) {
      return this.loadedModules.get(key);
    }

    // 로딩 중인 모듈이 있으면 해당 Promise 반환
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // 새로운 모듈 로드 시작
    const loadPromise = this.loadModuleFromUrl(url, scope, module);
    this.loadingPromises.set(key, loadPromise);

    try {
      const loadedModule = await loadPromise;
      this.loadedModules.set(key, loadedModule);
      this.loadingPromises.delete(key);
      return loadedModule;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  // URL에서 모듈 로드
  private async loadModuleFromUrl(url: string, scope: string, module: string): Promise<any> {
    try {
      // 스크립트 동적 로드
      await this.loadScript(url);

      // 전역 스코프에서 컨테이너 찾기
      const container = (window as any)[scope];
      if (!container) {
        throw new Error(`Container ${scope} not found`);
      }

      // 컨테이너 초기화
      // @ts-ignore
      const shareScope = typeof __webpack_share_scopes__ !== 'undefined' ? __webpack_share_scopes__.default : {};
      await container.init(shareScope);

      // 모듈 팩토리 가져오기
      const factory = await container.get(module);
      if (!factory) {
        throw new Error(`Module ${module} not found in container ${scope}`);
      }

      // 모듈 실행
      const Module = factory();
      return Module;

    } catch (error) {
      console.error(`Failed to load module ${module} from ${scope}:`, error);
      throw error;
    }
  }

  // 스크립트 동적 로드
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이미 로드된 스크립트인지 확인
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

      document.head.appendChild(script);
    });
  }

  // 모듈 캐시 클리어
  clearCache(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
  }

  // 로드된 모듈 목록
  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }
}

// 모듈 레지스트리
export class RemoteModuleRegistry {
  private modules = new Map<string, RemoteModule>();
  private loader = ModuleFederationLoader.getInstance();

  // 원격 모듈 등록
  registerModule(module: RemoteModule): void {
    this.modules.set(module.name, module);
  }

  // 원격 모듈 제거
  unregisterModule(name: string): void {
    this.modules.delete(name);
  }

  // 등록된 모듈 조회
  getModule(name: string): RemoteModule | undefined {
    return this.modules.get(name);
  }

  // 모든 등록된 모듈 조회
  getAllModules(): RemoteModule[] {
    return Array.from(this.modules.values());
  }

  // 모듈 로드
  async loadModule(name: string): Promise<any> {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} not registered`);
    }

    return this.loader.loadRemoteModule(module);
  }

  // 여러 모듈 동시 로드
  async loadModules(names: string[]): Promise<Record<string, any>> {
    const loadPromises = names.map(async name => {
      const module = await this.loadModule(name);
      return { name, module };
    });

    const results = await Promise.all(loadPromises);
    return results.reduce((acc, { name, module }) => {
      acc[name] = module;
      return acc;
    }, {} as Record<string, any>);
  }
}

// 기본 설정 생성
export const createModuleFederationConfig = (config: Partial<ModuleFederationConfig>): ModuleFederationConfig => {
  return {
    name: 'callstack-library',
    remotes: {},
    exposes: {
      './EventLoopEngine': './src/games/callstack-library/domain/event-loop/EventLoopEngine',
      './CQRSService': './src/games/callstack-library/domain/cqrs/CQRSEventLoopService',
      './EventLoopVisualizer': './src/games/callstack-library/widgets/event-loop-visualizer',
      './GameProgressTracker': './src/games/callstack-library/widgets/game-progress-tracker',
      './PluginSystem': './src/games/callstack-library/shared/lib/plugin-system'
    },
    shared: {
      'react': {
        singleton: true,
        requiredVersion: '^18.0.0'
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0'
      },
      'zustand': {
        singleton: true,
        requiredVersion: '^4.0.0'
      }
    },
    ...config
  };
};

// 노출된 컴포넌트들의 매니페스트
export const EXPOSED_COMPONENTS = {
  // 도메인 모델
  EventLoopEngine: {
    path: './EventLoopEngine',
    description: 'Core event loop simulation engine',
    version: '1.0.0',
    dependencies: ['react'] as string[]
  },
  
  // 서비스
  CQRSService: {
    path: './CQRSService',
    description: 'CQRS-based event loop service',
    version: '1.0.0',
    dependencies: ['react', 'zustand'] as string[]
  },
  
  // 위젯들
  EventLoopVisualizer: {
    path: './EventLoopVisualizer',
    description: 'Event loop visualization widget',
    version: '1.0.0',
    dependencies: ['react', 'react-dom'] as string[]
  },
  
  GameProgressTracker: {
    path: './GameProgressTracker',
    description: 'Game progress tracking widget',
    version: '1.0.0',
    dependencies: ['react', 'react-dom', 'zustand'] as string[]
  },
  
  // 플러그인 시스템
  PluginSystem: {
    path: './PluginSystem',
    description: 'Extensible plugin system',
    version: '1.0.0',
    dependencies: [] as string[]
  }
} as const;

// 원격 컴포넌트 매니페스트 타입
export type ExposedComponentKey = keyof typeof EXPOSED_COMPONENTS;

// 컴포넌트 메타데이터
export interface ComponentMetadata {
  path: string;
  description: string;
  version: string;
  dependencies: string[];
}

// 마이크로 프론트엔드 매니페스트
export interface MicrofrontendManifest {
  name: string;
  version: string;
  components: Record<string, ComponentMetadata>;
  remoteEntry: string;
  shared: Record<string, any>;
}

// 매니페스트 생성
export const createManifest = (): MicrofrontendManifest => {
  return {
    name: 'callstack-library',
    version: '1.0.0',
    components: EXPOSED_COMPONENTS as Record<string, ComponentMetadata>,
    remoteEntry: 'remoteEntry.js',
    shared: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      'zustand': '^4.0.0'
    }
  };
};

// 런타임 타입 검증
export const validateRemoteComponent = (component: any, expectedType: string): boolean => {
  if (!component) {
    return false;
  }

  // React 컴포넌트 검증
  if (expectedType === 'component') {
    return typeof component === 'function' || 
           (typeof component === 'object' && component.$$typeof);
  }

  // 서비스 클래스 검증
  if (expectedType === 'service') {
    return typeof component === 'function' && 
           component.prototype && 
           component.prototype.constructor === component;
  }

  // 일반 모듈 검증
  return typeof component === 'object' || typeof component === 'function';
};

// 컴포넌트 래퍼 (에러 바운더리 포함)
export const createSafeRemoteComponent = <T extends React.ComponentType<any>>(
  component: T,
  fallback?: React.ComponentType<any>
): React.LazyExoticComponent<React.ComponentType<any>> => {
  return React.lazy(async () => {
    try {
      // 컴포넌트 유효성 검증
      if (!validateRemoteComponent(component, 'component')) {
        throw new Error('Invalid remote component');
      }

      return { default: component };
    } catch (error) {
      console.error('Remote component loading failed:', error);
      
      if (fallback) {
        return { default: fallback };
      }
      
      // 기본 에러 컴포넌트
      return {
        default: () => React.createElement('div', {
          style: { 
            padding: '20px', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c66'
          }
        }, 'Failed to load remote component')
      };
    }
  });
};

// 전역 인스턴스
export const moduleRegistry = new RemoteModuleRegistry();

// 유틸리티 함수들
export const isModuleFederationSupported = (): boolean => {
  // @ts-ignore
  return typeof __webpack_require__ !== 'undefined' && 
         // @ts-ignore
         typeof __webpack_share_scopes__ !== 'undefined';
};

export const preloadRemoteModule = async (module: RemoteModule): Promise<void> => {
  const loader = ModuleFederationLoader.getInstance();
  try {
    await loader.loadRemoteModule(module);
    console.log(`Preloaded module: ${module.name}`);
  } catch (error) {
    console.warn(`Failed to preload module ${module.name}:`, error);
  }
};

// 개발 모드 헬퍼
export const setupDevelopmentMode = (): void => {
  if (process.env.NODE_ENV === 'development') {
    // 전역 디버그 객체 노출
    (window as any).__CALLSTACK_LIBRARY_MF__ = {
      moduleRegistry,
      loader: ModuleFederationLoader.getInstance(),
      manifest: createManifest(),
      config: createModuleFederationConfig({})
    };
    
    console.log('CallStack Library Micro Frontend debug tools available at window.__CALLSTACK_LIBRARY_MF__');
  }
};