'use client';

/**
 * Game Layout Page
 * 
 * Feature-Sliced Design pages 레이어
 * 게임 레이아웃을 렌더링하는 페이지 컴포넌트
 */

import React, { memo, useEffect, useState } from 'react';
import { cn } from '@penguinjs/ui';

import { useCurrentStage, useGameData, useGameHandlers } from '../../../features/game-progression';
import { EventLoopVisualizerWidget } from '../../../widgets/event-loop-visualizer';
import { GameProgressTrackerWidget } from '../../../widgets/game-progress-tracker';

// 기존 레이아웃 컴포넌트들 (마이그레이션 중)
import { LayoutRenderer } from '../../../components/layout/LayoutRenderer';

// 페이지 Props
export interface GameLayoutPageProps {
  className?: string;
  enableNewWidgets?: boolean; // 새로운 위젯 시스템 활성화 여부
}

// FSD 기반 새로운 레이아웃 컴포넌트
const NewGameLayout: React.FC<{
  currentStage: any;
  gameData: any;
  gameHandlers: any;
}> = memo(({ currentStage, gameData, gameHandlers }) => {
  if (!currentStage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No stage selected</div>
          <div className="text-sm text-gray-400">
            Please select a stage from the progress tracker
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 스테이지 헤더 */}
      <div className="bg-white rounded-lg border p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {currentStage.title}
        </h1>
        <p className="text-gray-600 mb-3">
          {currentStage.description}
        </p>
        <div className="flex items-center gap-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            currentStage.difficulty === 'beginner' && "bg-green-100 text-green-700",
            currentStage.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700",
            currentStage.difficulty === 'advanced' && "bg-orange-100 text-orange-700",
            currentStage.difficulty === 'expert' && "bg-red-100 text-red-700"
          )}>
            {currentStage.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Layout {currentStage.layoutType}
          </span>
          <span className="text-sm text-gray-500">
            Estimated time: {currentStage.estimatedTime} minutes
          </span>
        </div>
      </div>

      {/* 학습 개념 표시 */}
      {currentStage.concepts && currentStage.concepts.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Learning Concepts</h3>
          <div className="flex flex-wrap gap-2">
            {currentStage.concepts.map((concept: string) => (
              <span
                key={concept}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {concept.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 메인 게임 영역 */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 왼쪽: 이벤트 루프 시각화 (3/4) */}
        <div className="xl:col-span-3">
          <EventLoopVisualizerWidget 
            className="h-full"
            showControls={true}
            autoInitialize={true}
          />
        </div>
        
        {/* 오른쪽: 진행상황 추적 (1/4) */}
        <div className="xl:col-span-1">
          <GameProgressTrackerWidget
            className="h-full"
            showSessionStats={true}
            showStageList={true}
          />
        </div>
      </div>
    </div>
  );
});

// 메인 페이지 컴포넌트
export const GameLayoutPage: React.FC<GameLayoutPageProps> = memo(({
  className,
  enableNewWidgets = false
}) => {
  const currentStage = useCurrentStage();
  const gameData = useGameData();
  const gameHandlers = useGameHandlers();
  
  // 새로운 위젯 시스템 사용 여부를 관리
  const [useNewLayout, setUseNewLayout] = useState(enableNewWidgets);

  // 레이아웃 타입에 따라 새로운 시스템 사용 결정
  useEffect(() => {
    if (currentStage) {
      // Layout B는 새로운 위젯 시스템이 더 적합
      setUseNewLayout(currentStage.layoutType === 'B' || enableNewWidgets);
    }
  }, [currentStage, enableNewWidgets]);

  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {/* 개발 모드: 레이아웃 전환 버튼 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> Layout System Toggle
            </div>
            <button
              onClick={() => setUseNewLayout(!useNewLayout)}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium transition-colors",
                useNewLayout 
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              )}
            >
              {useNewLayout ? 'New FSD Layout' : 'Legacy Layout'}
            </button>
          </div>
        </div>
      )}

      {/* 레이아웃 렌더링 */}
      {useNewLayout ? (
        <NewGameLayout
          currentStage={currentStage}
          gameData={gameData}
          gameHandlers={gameHandlers}
        />
      ) : (
        // 기존 레거시 레이아웃 (마이그레이션 중)
        currentStage && gameData && gameHandlers ? (
          <LayoutRenderer
            layoutType={currentStage.layoutType}
            gameData={gameData}
            gameHandlers={gameHandlers}
            className={className}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-500 mb-2">Loading game...</div>
              <div className="text-sm text-gray-400">
                Initializing game components
              </div>
            </div>
          </div>
        )
      )}
      
      {/* 마이그레이션 상태 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Migration Status:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>✅ Domain Models (entities layer)</li>
              <li>✅ CQRS Infrastructure (shared layer)</li>
              <li>✅ Business Features (features layer)</li>
              <li>✅ UI Widgets (widgets layer)</li>
              <li>🔄 Page Components (pages layer) - In Progress</li>
              <li>⏳ App Configuration (app layer) - Pending</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

GameLayoutPage.displayName = 'GameLayoutPage';