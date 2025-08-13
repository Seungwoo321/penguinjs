'use client';

/**
 * App Providers
 * 
 * Feature-Sliced Design app 레이어
 * 전체 애플리케이션의 공급자(Provider) 설정
 */

import React, { memo, ReactNode } from 'react';

// 기존 프로바이더들 (마이그레이션 중)
import { DesignSystemProvider } from '@/games/callstack-library/components/ui/DesignSystemProvider';
import { CallStackLibraryProvider } from '@/games/callstack-library/contexts/CallStackLibraryContext';

// 새로운 FSD 프로바이더들
import { GameProgressionProvider } from './GameProgressionProvider';
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';

// Props 타입
export interface AppProvidersProps {
  children: ReactNode;
  enableLegacyProviders?: boolean; // 기존 프로바이더 호환성
}

// 메인 프로바이더 컴포넌트
export const AppProviders: React.FC<AppProvidersProps> = memo(({
  children,
  enableLegacyProviders = true
}) => {
  // FSD 기반 새로운 프로바이더 체인
  const NewProviderChain = memo(({ children }: { children: ReactNode }) => (
    <ErrorBoundaryProvider>
      <GameProgressionProvider>
        {children}
      </GameProgressionProvider>
    </ErrorBoundaryProvider>
  ));

  // 기존 레거시 프로바이더 체인 (마이그레이션 중)
  const LegacyProviderChain = memo(({ children }: { children: ReactNode }) => (
    <DesignSystemProvider>
      <CallStackLibraryProvider>
        {children}
      </CallStackLibraryProvider>
    </DesignSystemProvider>
  ));

  // 하이브리드 모드: 새로운 프로바이더 + 기존 프로바이더
  if (enableLegacyProviders) {
    return (
      <NewProviderChain>
        <LegacyProviderChain>
          {children}
        </LegacyProviderChain>
      </NewProviderChain>
    );
  }

  // 순수 FSD 모드: 새로운 프로바이더만
  return (
    <NewProviderChain>
      {children}
    </NewProviderChain>
  );
});

AppProviders.displayName = 'AppProviders';