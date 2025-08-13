'use client';

/**
 * Error Boundary Provider
 * 
 * Feature-Sliced Design app 레이어
 * 전역 에러 처리를 위한 프로바이더
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// 에러 상태 타입
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Props 타입
interface ErrorBoundaryProviderProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// 기본 에러 UI 컴포넌트
const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  onRetry?: () => void;
}> = ({ error, errorInfo, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--surface-primary))' }}>
    <div className="max-w-md w-full mx-auto">
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'rgb(var(--surface-elevated))' }}>
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6" style={{ color: 'rgb(var(--destructive))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium" style={{ color: 'rgb(var(--foreground))' }}>
              Something went wrong
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm mb-3" style={{ color: 'rgb(var(--muted-foreground))' }}>
            The CallStack Library Game encountered an unexpected error. This could be due to:
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'rgb(var(--muted-foreground))' }}>
            <li>A problem with the game simulation engine</li>
            <li>An issue with the user interface components</li>
            <li>A temporary network or browser issue</li>
          </ul>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4">
            <summary className="text-sm font-medium cursor-pointer transition-colors" style={{ color: 'rgb(var(--muted-foreground))' }}>
              Technical Details (Development Mode)
            </summary>
            <div className="mt-2 p-3 rounded text-xs font-mono overflow-auto max-h-40" style={{ backgroundColor: 'rgb(var(--muted))', color: 'rgb(var(--muted-foreground))' }}>
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
              <div>
                <strong>Component Stack:</strong>
                <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
              </div>
            </div>
          </details>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style={{
              backgroundColor: 'rgb(var(--primary))',
              color: 'rgb(var(--primary-foreground))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--primary-hover))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--primary))'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            style={{
              backgroundColor: 'rgb(var(--muted))',
              color: 'rgb(var(--muted-foreground))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--accent))'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgb(var(--muted))'
            }}
          >
            Reload Page
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: 'rgb(var(--muted-foreground))' }}>
            If this problem persists, please report it to the development team.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// 에러 바운더리 클래스 컴포넌트
export class ErrorBoundaryProvider extends Component<ErrorBoundaryProviderProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProviderProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 다음 렌더링에서 폴백 UI를 보여주도록 상태 업데이트
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 커스텀 에러 핸들러 실행
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 프로덕션에서는 에러 추적 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // 예: Sentry, LogRocket 등으로 에러 전송
      // reportErrorToService(error, errorInfo);
    }
  }

  // 에러 상태 리셋
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // 커스텀 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // 기본 에러 UI 표시
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    // 정상적인 경우 children 렌더링
    return this.props.children;
  }
}

// 에러 리포팅 유틸리티 (확장 가능)
export const reportError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error, context);
  
  // 여기에 외부 에러 추적 서비스 연동 코드 추가 가능
  // 예: Sentry.captureException(error, { extra: context });
};

// React Hook으로 에러 리포팅
export const useErrorReporting = () => {
  return {
    reportError: (error: Error, context?: Record<string, any>) => {
      reportError(error, context);
    }
  };
};