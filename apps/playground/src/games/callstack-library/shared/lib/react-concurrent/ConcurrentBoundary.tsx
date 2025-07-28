'use client';

/**
 * Concurrent Boundary
 * 
 * Phase 3: React Concurrent Features 적용
 * Suspense, Error Boundary와 Concurrent Mode 통합
 */

import React, { 
  Component, 
  ErrorInfo, 
  ReactNode, 
  Suspense,
  lazy,
  startTransition,
  useTransition,
  useDeferredValue,
  memo
} from 'react';

// === Error Boundary for Concurrent Features ===

interface ConcurrentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ConcurrentErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void, retryCount: number) => ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ConcurrentErrorBoundary extends Component<ConcurrentErrorBoundaryProps, ConcurrentErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ConcurrentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ConcurrentErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ConcurrentErrorBoundary caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    // Concurrent transition을 사용한 재시도
    startTransition(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    });
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.state.retryCount);
      }

      // 기본 에러 UI
      return (
        <ConcurrentErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
        />
      );
    }

    return this.props.children;
  }
}

// === Concurrent Error Fallback Component ===

interface ConcurrentErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
}

const ConcurrentErrorFallback: React.FC<ConcurrentErrorFallbackProps> = memo(({
  error,
  onRetry,
  retryCount,
  maxRetries
}) => {
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(() => {
      onRetry();
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-red-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Simulation Error
              </h3>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              An error occurred during the event loop simulation:
            </p>
            <div className="bg-gray-100 rounded p-3 text-sm font-mono text-gray-800">
              {error.message}
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <span>Retry attempts: {retryCount} / {maxRetries}</span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              disabled={isPending || retryCount >= maxRetries}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// === Suspense Loading Component ===

const SuspenseLoading: React.FC<{ 
  message?: string;
  showProgress?: boolean;
  progress?: number;
}> = memo(({ 
  message = 'Loading simulation...', 
  showProgress = false,
  progress = 0 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">{message}</p>
        {showProgress && (
          <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

// === Main Concurrent Boundary Component ===

export interface ConcurrentBoundaryProps {
  children: ReactNode;
  
  // Suspense 설정
  fallback?: ReactNode;
  
  // Error Boundary 설정
  errorFallback?: (error: Error, retry: () => void, retryCount: number) => ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  // 성능 설정
  enableDeferredUpdates?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export const ConcurrentBoundary: React.FC<ConcurrentBoundaryProps> = memo(({
  children,
  fallback,
  errorFallback,
  maxRetries = 3,
  onError,
  enableDeferredUpdates = true,
  priority = 'normal'
}) => {
  const defaultFallback = fallback || <SuspenseLoading />;

  return (
    <ConcurrentErrorBoundary
      fallback={errorFallback}
      maxRetries={maxRetries}
      onError={onError}
    >
      <Suspense fallback={defaultFallback}>
        {enableDeferredUpdates ? (
          <DeferredWrapper priority={priority}>
            {children}
          </DeferredWrapper>
        ) : (
          children
        )}
      </Suspense>
    </ConcurrentErrorBoundary>
  );
});

// === Deferred Wrapper for Performance ===

const DeferredWrapper: React.FC<{
  children: ReactNode;
  priority: 'high' | 'normal' | 'low';
}> = memo(({ children, priority }) => {
  // 우선순위에 따라 다른 지연 전략 사용
  if (priority === 'high') {
    // 고우선순위는 즉시 렌더링
    return <>{children}</>;
  }

  // 일반/낮은 우선순위는 지연된 값 사용
  return <DeferredChildren>{children}</DeferredChildren>;
});

const DeferredChildren: React.FC<{ children: ReactNode }> = memo(({ children }) => {
  const deferredChildren = useDeferredValue(children);
  return <>{deferredChildren}</>;
});

// === Lazy Loading Helpers ===

// 컴포넌트 지연 로딩을 위한 헬퍼
export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  loadingComponent?: ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props: T) => (
    <Suspense fallback={loadingComponent || <SuspenseLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// === Performance Monitor Component ===

export const ConcurrentPerformanceMonitor: React.FC<{
  children: ReactNode;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}> = memo(({ children, onPerformanceUpdate }) => {
  const [isPending] = useTransition();
  const [renderCount, setRenderCount] = React.useState(0);
  const [lastRenderTime, setLastRenderTime] = React.useState(Date.now());

  React.useEffect(() => {
    const now = Date.now();
    const renderTime = now - lastRenderTime;
    
    setRenderCount(prev => prev + 1);
    setLastRenderTime(now);

    onPerformanceUpdate?.({
      renderCount,
      renderTime,
      isPending,
      timestamp: now
    });
  });

  return <>{children}</>;
});

// === Types ===

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  isPending: boolean;
  timestamp: number;
}

// === Exports ===

export {
  ConcurrentErrorBoundary,
  SuspenseLoading
};