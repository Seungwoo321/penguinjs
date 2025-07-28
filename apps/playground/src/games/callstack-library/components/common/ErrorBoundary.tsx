/**
 * Error Boundary 컴포넌트
 * React 컴포넌트 트리의 오류를 포착하고 처리하는 경계
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { AccessibleButton } from '../ui/AccessibleButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * CallStack Library 게임 전용 Error Boundary
 * 게임 내 오류를 우아하게 처리하고 사용자에게 복구 옵션 제공
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 상태 업데이트
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // 부모 컴포넌트에 에러 전달
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 개발 환경에서 상세 정보 로깅
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${this.props.componentName || 'Unknown Component'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // resetKeys가 변경되면 에러 상태 초기화
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary();
      }
    }
    
    // props 변경 시 리셋 옵션
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, isolate } = this.props;

    if (hasError && error) {
      // 커스텀 폴백이 제공된 경우
      if (fallback) {
        return <>{fallback}</>;
      }

      // 기본 에러 UI
      return (
        <div className={`
          ${isolate ? 'relative' : 'min-h-screen'} 
          flex items-center justify-center p-4
          bg-gradient-to-br from-red-50 to-orange-50
        `}>
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 space-y-4">
            {/* 에러 헤더 */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isolate ? '컴포넌트 오류' : '애플리케이션 오류'}
                </h2>
                <p className="text-sm text-gray-600">
                  예기치 않은 오류가 발생했습니다
                </p>
              </div>
            </div>

            {/* 에러 상세 정보 (개발 환경) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <p className="text-sm font-mono text-gray-800">
                  {error.toString()}
                </p>
                {this.props.componentName && (
                  <p className="text-xs text-gray-600">
                    컴포넌트: {this.props.componentName}
                  </p>
                )}
                {errorCount > 1 && (
                  <p className="text-xs text-orange-600">
                    오류 발생 횟수: {errorCount}회
                  </p>
                )}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <AccessibleButton
                variant="primary"
                size="sm"
                onClick={this.resetErrorBoundary}
                label="다시 시도"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </AccessibleButton>
              
              {!isolate && (
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                  label="홈으로 이동"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로
                </AccessibleButton>
              )}
            </div>

            {/* 도움말 */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 문제가 계속되면 페이지를 새로고침해주세요</p>
              <p>• 브라우저 캐시를 삭제하면 도움이 될 수 있습니다</p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * 함수형 컴포넌트를 위한 useErrorHandler Hook
 */
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    throw error; // Error Boundary가 포착하도록 다시 throw
  };
};

/**
 * 특정 컴포넌트를 Error Boundary로 감싸는 HOC
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;