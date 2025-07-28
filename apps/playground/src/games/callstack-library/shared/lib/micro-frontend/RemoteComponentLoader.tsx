/**
 * Remote Component Loader
 * 
 * Phase 4: 확장성 확보 - 마이크로 프론트엔드 준비
 * 원격 컴포넌트 동적 로딩과 관리를 위한 React 컴포넌트들
 */

import React, { 
  Suspense, 
  lazy, 
  memo, 
  useEffect, 
  useState, 
  useRef,
  createContext,
  useContext,
  ReactNode,
  ComponentType,
  ErrorInfo
} from 'react';

import { 
  RemoteModule, 
  FederatedComponent,
  moduleRegistry,
  ModuleFederationLoader,
  validateRemoteComponent
} from './ModuleFederationSetup';

// 원격 컴포넌트 컨텍스트
interface RemoteComponentContextValue {
  loadComponent: (config: FederatedComponent) => Promise<ComponentType<any>>;
  unloadComponent: (key: string) => void;
  getLoadedComponents: () => string[];
  isLoading: (key: string) => boolean;
}

const RemoteComponentContext = createContext<RemoteComponentContextValue | null>(null);

// 컴포넌트 로딩 상태
interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  component: ComponentType<any> | null;
}

// 원격 컴포넌트 프로바이더
export const RemoteComponentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());
  const loaderRef = useRef(ModuleFederationLoader.getInstance());

  const loadComponent = async (config: FederatedComponent): Promise<ComponentType<any>> => {
    const { remoteName, moduleName, componentName, fallback } = config;
    const key = `${remoteName}-${moduleName}-${componentName}`;

    // 이미 로드된 컴포넌트가 있으면 반환
    const currentState = loadingStates.get(key);
    if (currentState?.component) {
      return currentState.component;
    }

    // 로딩 상태 설정
    setLoadingStates(prev => new Map(prev).set(key, {
      isLoading: true,
      error: null,
      component: null
    }));

    try {
      // 원격 모듈 정보 조회
      const remoteModule = moduleRegistry.getModule(remoteName);
      if (!remoteModule) {
        throw new Error(`Remote module ${remoteName} not registered`);
      }

      // 모듈 로드
      const loadedModule = await loaderRef.current.loadRemoteModule(remoteModule);
      
      // 컴포넌트 추출
      const component = loadedModule[componentName];
      if (!component) {
        throw new Error(`Component ${componentName} not found in module ${moduleName}`);
      }

      // 컴포넌트 유효성 검증
      if (!validateRemoteComponent(component, 'component')) {
        throw new Error(`Invalid component: ${componentName}`);
      }

      // 성공 상태 설정
      setLoadingStates(prev => new Map(prev).set(key, {
        isLoading: false,
        error: null,
        component: component as ComponentType<any>
      }));

      return component as ComponentType<any>;

    } catch (error) {
      const errorObj = error as Error;
      
      // 에러 상태 설정
      setLoadingStates(prev => new Map(prev).set(key, {
        isLoading: false,
        error: errorObj,
        component: fallback || null
      }));

      throw error;
    }
  };

  const unloadComponent = (key: string): void => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const getLoadedComponents = (): string[] => {
    return Array.from(loadingStates.keys()).filter(key => 
      loadingStates.get(key)?.component
    );
  };

  const isLoading = (key: string): boolean => {
    return loadingStates.get(key)?.isLoading || false;
  };

  const contextValue: RemoteComponentContextValue = {
    loadComponent,
    unloadComponent,
    getLoadedComponents,
    isLoading
  };

  return (
    <RemoteComponentContext.Provider value={contextValue}>
      {children}
    </RemoteComponentContext.Provider>
  );
};

// 원격 컴포넌트 컨텍스트 훅
export const useRemoteComponent = () => {
  const context = useContext(RemoteComponentContext);
  if (!context) {
    throw new Error('useRemoteComponent must be used within RemoteComponentProvider');
  }
  return context;
};

// 원격 컴포넌트 로더 훅
export const useRemoteComponentLoader = (config: FederatedComponent) => {
  const { loadComponent } = useRemoteComponent();
  const [state, setState] = useState<{
    component: ComponentType<any> | null;
    loading: boolean;
    error: Error | null;
  }>({
    component: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const component = await loadComponent(config);
        
        if (!cancelled) {
          setState({
            component,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            component: config.fallback || null,
            loading: false,
            error: error as Error
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadComponent, config.remoteName, config.moduleName, config.componentName]);

  return state;
};

// 동적 원격 컴포넌트
export const DynamicRemoteComponent: React.FC<{
  config: FederatedComponent;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  onLoad?: (component: ComponentType<any>) => void;
}> = memo(({ config, fallback, onError, onLoad }) => {
  const { component, loading, error } = useRemoteComponentLoader(config);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (component && onLoad) {
      onLoad(component);
    }
  }, [component, onLoad]);

  if (loading) {
    return <>{fallback || <RemoteComponentSkeleton />}</>;
  }

  if (error || !component) {
    return <RemoteComponentError error={error} config={config} />;
  }

  const Component = component;
  return <Component {...config.props} />;
});

// Lazy 원격 컴포넌트 생성
export const createLazyRemoteComponent = (config: FederatedComponent) => {
  return lazy(async () => {
    try {
      const remoteModule = moduleRegistry.getModule(config.remoteName);
      if (!remoteModule) {
        throw new Error(`Remote module ${config.remoteName} not registered`);
      }

      const loader = ModuleFederationLoader.getInstance();
      const loadedModule = await loader.loadRemoteModule(remoteModule);
      
      const component = loadedModule[config.componentName];
      if (!component) {
        throw new Error(`Component ${config.componentName} not found`);
      }

      return { default: component };
    } catch (error) {
      console.error('Lazy remote component loading failed:', error);
      
      if (config.fallback) {
        return { default: config.fallback };
      }
      
      return { 
        default: () => (
          <RemoteComponentError 
            error={error as Error} 
            config={config} 
          />
        )
      };
    }
  });
};

// 원격 컴포넌트 에러 표시
const RemoteComponentError: React.FC<{
  error: Error | null;
  config: FederatedComponent;
}> = memo(({ error, config }) => (
  <div className="p-4 border border-red-300 bg-red-50 rounded">
    <h3 className="text-red-800 font-semibold mb-2">
      Failed to load remote component
    </h3>
    <div className="text-sm text-red-600 mb-2">
      <strong>Component:</strong> {config.remoteName}/{config.componentName}
    </div>
    {error && (
      <div className="text-sm text-red-600">
        <strong>Error:</strong> {error.message}
      </div>
    )}
    <button
      onClick={() => window.location.reload()}
      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
    >
      Reload Page
    </button>
  </div>
));

// 원격 컴포넌트 로딩 스켈레톤
const RemoteComponentSkeleton: React.FC = memo(() => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded h-32 mb-4"></div>
    <div className="space-y-2">
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  </div>
));

// 원격 컴포넌트 에러 바운더리
interface RemoteComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RemoteComponentErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  RemoteComponentErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RemoteComponentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Remote component error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded">
          <h3 className="text-red-800 font-semibold mb-2">
            Remote Component Error
          </h3>
          <p className="text-red-600 text-sm">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 원격 컴포넌트 래퍼 (Suspense + Error Boundary)
export const RemoteComponentWrapper: React.FC<{
  config: FederatedComponent;
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error }>;
  onError?: (error: Error) => void;
  onLoad?: (component: ComponentType<any>) => void;
}> = memo(({ config, fallback, errorFallback, onError, onLoad }) => {
  return (
    <RemoteComponentErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || <RemoteComponentSkeleton />}>
        <DynamicRemoteComponent
          config={config}
          fallback={fallback}
          onError={onError}
          onLoad={onLoad}
        />
      </Suspense>
    </RemoteComponentErrorBoundary>
  );
});

// 미리 로드된 원격 컴포넌트 매니저
export class PreloadedComponentManager {
  private static instance: PreloadedComponentManager;
  private preloadedComponents = new Map<string, ComponentType<any>>();

  static getInstance(): PreloadedComponentManager {
    if (!PreloadedComponentManager.instance) {
      PreloadedComponentManager.instance = new PreloadedComponentManager();
    }
    return PreloadedComponentManager.instance;
  }

  async preloadComponent(config: FederatedComponent): Promise<void> {
    const key = `${config.remoteName}-${config.componentName}`;
    
    if (this.preloadedComponents.has(key)) {
      return; // 이미 로드됨
    }

    try {
      const remoteModule = moduleRegistry.getModule(config.remoteName);
      if (!remoteModule) {
        throw new Error(`Remote module ${config.remoteName} not registered`);
      }

      const loader = ModuleFederationLoader.getInstance();
      const loadedModule = await loader.loadRemoteModule(remoteModule);
      
      const component = loadedModule[config.componentName];
      if (component && validateRemoteComponent(component, 'component')) {
        this.preloadedComponents.set(key, component);
        console.log(`Preloaded component: ${key}`);
      }
    } catch (error) {
      console.warn(`Failed to preload component ${key}:`, error);
    }
  }

  getPreloadedComponent(config: FederatedComponent): ComponentType<any> | null {
    const key = `${config.remoteName}-${config.componentName}`;
    return this.preloadedComponents.get(key) || null;
  }

  async preloadMultipleComponents(configs: FederatedComponent[]): Promise<void> {
    await Promise.all(configs.map(config => this.preloadComponent(config)));
  }

  clearPreloadedComponents(): void {
    this.preloadedComponents.clear();
  }
}

// 컴포넌트 이름들
DynamicRemoteComponent.displayName = 'DynamicRemoteComponent';
RemoteComponentError.displayName = 'RemoteComponentError';
RemoteComponentSkeleton.displayName = 'RemoteComponentSkeleton';
RemoteComponentWrapper.displayName = 'RemoteComponentWrapper';