'use client';

/**
 * Game Progress Tracker Widget
 * 
 * Feature-Sliced Design widgets 레이어
 * 게임 진행상황을 표시하는 독립적인 위젯
 */

import React, { memo, useEffect } from 'react';
import { cn, GamePanel } from '@penguinjs/ui';

import { 
  useGameProgressionStore,
  useCurrentStage,
  useUnlockedStages,
  useSessionStats
} from '../../../features/game-progression';

// 위젯 Props
export interface GameProgressTrackerWidgetProps {
  className?: string;
  showSessionStats?: boolean;
  showStageList?: boolean;
  onStageSelect?: (stageId: string) => void;
}

// 진행률 바 컴포넌트
const ProgressBar: React.FC<{ 
  current: number; 
  total: number; 
  label: string;
  color?: string;
}> = memo(({ current, total, label, color = 'blue' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-gray-600">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            color === 'blue' && "bg-blue-500",
            color === 'green' && "bg-green-500",
            color === 'yellow' && "bg-yellow-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
});

// 스테이지 항목 컴포넌트
const StageItem: React.FC<{
  stage: any;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onSelect: (stageId: string) => void;
}> = memo(({ stage, isUnlocked, isCompleted, isCurrent, onSelect }) => {
  const handleClick = () => {
    if (isUnlocked) {
      onSelect(stage.id);
    }
  };
  
  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all",
        isCurrent && "ring-2 ring-blue-500",
        isCompleted && "bg-green-50 border-green-200",
        isUnlocked && !isCompleted && "bg-white border-gray-200 hover:bg-gray-50",
        !isUnlocked && "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={cn(
            "font-semibold text-sm",
            !isUnlocked && "text-gray-400"
          )}>
            {stage.title}
          </h4>
          <p className={cn(
            "text-xs mt-1",
            isUnlocked ? "text-gray-600" : "text-gray-400"
          )}>
            {stage.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "px-2 py-1 rounded text-xs",
              stage.difficulty === 'beginner' && "bg-green-100 text-green-700",
              stage.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-700",
              stage.difficulty === 'advanced' && "bg-orange-100 text-orange-700",
              stage.difficulty === 'expert' && "bg-red-100 text-red-700"
            )}>
              {stage.difficulty}
            </span>
            <span className="text-xs text-gray-500">
              ~{stage.estimatedTime}min
            </span>
          </div>
        </div>
        <div className="ml-3 flex flex-col items-center">
          {isCompleted ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : isUnlocked ? (
            <div className="w-6 h-6 border-2 border-blue-500 rounded-full" />
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full bg-gray-100" />
          )}
        </div>
      </div>
    </div>
  );
});

// 세션 통계 컴포넌트
const SessionStats: React.FC<{ stats: any }> = memo(({ stats }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-sm">Session Statistics</h4>
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-2 bg-blue-50 rounded">
        <div className="text-lg font-bold text-blue-600">{stats.stagesCompleted}</div>
        <div className="text-xs text-gray-600">Stages Completed</div>
      </div>
      <div className="text-center p-2 bg-green-50 rounded">
        <div className="text-lg font-bold text-green-600">{stats.totalScore}</div>
        <div className="text-xs text-gray-600">Total Score</div>
      </div>
      <div className="text-center p-2 bg-yellow-50 rounded">
        <div className="text-lg font-bold text-yellow-600">{stats.totalHintsUsed}</div>
        <div className="text-xs text-gray-600">Hints Used</div>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded">
        <div className="text-lg font-bold text-purple-600">{stats.conceptsLearned.length}</div>
        <div className="text-xs text-gray-600">Concepts Learned</div>
      </div>
    </div>
    
    {stats.conceptsLearned.length > 0 && (
      <div className="space-y-2">
        <div className="text-xs text-gray-600">Recent Concepts</div>
        <div className="flex flex-wrap gap-1">
          {stats.conceptsLearned.slice(-5).map((concept: string) => (
            <span
              key={concept}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
));

// 메인 위젯 컴포넌트
export const GameProgressTrackerWidget: React.FC<GameProgressTrackerWidgetProps> = memo(({
  className,
  showSessionStats = true,
  showStageList = true,
  onStageSelect
}) => {
  const currentStage = useCurrentStage();
  const unlockedStages = useUnlockedStages();
  const sessionStats = useSessionStats();
  
  const allStages = useGameProgressionStore(state => state.allStages);
  const learningProgress = useGameProgressionStore(state => state.learningProgress);
  const getOverallProgress = useGameProgressionStore(state => state.getOverallProgress);
  const loadStage = useGameProgressionStore(state => state.loadStage);
  const initialize = useGameProgressionStore(state => state.initialize);
  
  // 자동 초기화
  useEffect(() => {
    if (allStages.length === 0) {
      initialize();
    }
  }, [allStages.length, initialize]);
  
  // 전체 진행상황 계산
  const overallProgress = getOverallProgress();
  
  // 스테이지 선택 핸들러
  const handleStageSelect = async (stageId: string) => {
    try {
      await loadStage(stageId);
      onStageSelect?.(stageId);
    } catch (error) {
      console.error('Failed to load stage:', error);
    }
  };
  
  return (
    <GamePanel title="📊 Progress Tracker" className={className}>
      <div className="space-y-6">
        {/* 전체 진행률 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Overall Progress</h4>
          <ProgressBar
            current={overallProgress.completedStages}
            total={overallProgress.totalStages}
            label="Stages Completed"
            color="blue"
          />
          
          {overallProgress.completedStages > 0 && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Average Score:</span>
                <span className="ml-2 font-semibold">
                  {overallProgress.averageScore.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Time Spent:</span>
                <span className="ml-2 font-semibold">
                  {Math.round(overallProgress.totalTimeSpent / 60000)}min
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* 현재 스테이지 */}
        {currentStage && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Current Stage</h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-sm text-blue-800">
                {currentStage.title}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {currentStage.description}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Layout {currentStage.layoutType}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {currentStage.difficulty}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* 세션 통계 */}
        {showSessionStats && <SessionStats stats={sessionStats} />}
        
        {/* 스테이지 목록 */}
        {showStageList && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Available Stages</h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {allStages.map((stage) => {
                const isUnlocked = unlockedStages.includes(stage.id);
                const isCompleted = Boolean(learningProgress[stage.id]?.completedAt);
                const isCurrent = currentStage?.id === stage.id;
                
                return (
                  <StageItem
                    key={stage.id}
                    stage={stage}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    onSelect={handleStageSelect}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GamePanel>
  );
});

GameProgressTrackerWidget.displayName = 'GameProgressTrackerWidget';