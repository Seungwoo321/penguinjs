'use client';

/**
 * Game Progression Provider
 * 
 * Feature-Sliced Design app 레이어
 * 게임 진행상황 관리를 위한 프로바이더
 */

import React, { memo, ReactNode, useEffect } from 'react';

import { useGameProgressionStore } from '@/games/callstack-library/features/game-progression';

// Props 타입
export interface GameProgressionProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
}

// 게임 진행상황 프로바이더
export const GameProgressionProvider: React.FC<GameProgressionProviderProps> = memo(({
  children,
  autoInitialize = true
}) => {
  const initialize = useGameProgressionStore(state => state.initialize);
  const isInitialized = useGameProgressionStore(state => state.allStages.length > 0);

  // 자동 초기화
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  return <>{children}</>;
});

GameProgressionProvider.displayName = 'GameProgressionProvider';