/**
 * Game Progression Store
 * 
 * Feature-Sliced Design features 레이어
 * 게임 진행상황과 학습 경로 관리
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { GameData, GameHandlers } from '@/games/callstack-library/entities/game-state';

// 스테이지 정보
export interface StageInfo {
  id: string;
  title: string;
  description: string;
  layoutType: 'A' | 'A+' | 'B' | 'C' | 'D' | 'E';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  concepts: string[];
  prerequisites: string[];
  estimatedTime: number; // 분
}

// 학습 진행 상태
export interface LearningProgress {
  stageId: string;
  startedAt: number;
  completedAt?: number;
  attempts: number;
  score: number;
  hintsUsed: number;
  timeSpent: number; // 밀리초
  bestScore?: number;
  conceptsMastered: string[];
}

// 게임 진행 상태
export interface GameProgressionState {
  // 현재 게임
  currentStage: StageInfo | null;
  currentGameData: GameData | null;
  currentGameHandlers: GameHandlers | null;
  
  // 전체 진행상황
  allStages: StageInfo[];
  learningProgress: Record<string, LearningProgress>;
  unlockedStages: string[];
  
  // 현재 세션
  sessionStartTime: number;
  sessionStats: {
    stagesCompleted: number;
    totalScore: number;
    totalHintsUsed: number;
    conceptsLearned: string[];
  };
  
  // 설정
  settings: {
    autoProgress: boolean;
    showHints: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
    soundEnabled: boolean;
  };
  
  // 상태
  loading: boolean;
  error: string | null;
}

// 게임 진행 액션
export interface GameProgressionActions {
  // 초기화
  initialize: () => Promise<void>;
  
  // 스테이지 관리
  loadStage: (stageId: string) => Promise<void>;
  completeStage: (score: number, hintsUsed: number) => Promise<void>;
  unlockStage: (stageId: string) => void;
  
  // 게임 데이터 관리
  updateGameData: (gameData: Partial<GameData>) => void;
  setGameHandlers: (handlers: GameHandlers) => void;
  
  // 진행상황 추적
  startStageAttempt: (stageId: string) => void;
  recordStageCompletion: (stageId: string, score: number, hintsUsed: number) => void;
  updateLearningProgress: (stageId: string, progress: Partial<LearningProgress>) => void;
  
  // 설정
  updateSettings: (settings: Partial<typeof initialState.settings>) => void;
  
  // 통계
  getOverallProgress: () => {
    totalStages: number;
    completedStages: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
  };
  
  getStageProgress: (stageId: string) => LearningProgress | null;
  getRecommendedNextStage: () => StageInfo | null;
  
  // 데이터 영속성
  saveProgress: () => void;
  loadProgress: () => void;
  resetProgress: () => void;
}

// 초기 상태
const initialState: GameProgressionState = {
  currentStage: null,
  currentGameData: null,
  currentGameHandlers: null,
  allStages: [],
  learningProgress: {},
  unlockedStages: [],
  sessionStartTime: Date.now(),
  sessionStats: {
    stagesCompleted: 0,
    totalScore: 0,
    totalHintsUsed: 0,
    conceptsLearned: []
  },
  settings: {
    autoProgress: true,
    showHints: true,
    difficulty: 'normal',
    soundEnabled: true
  },
  loading: false,
  error: null
};

// 기본 스테이지 정의
const DEFAULT_STAGES: StageInfo[] = [
  {
    id: 'basic-callstack-1',
    title: '기본 콜스택 이해',
    description: '함수 호출과 콜스택의 기본 개념을 학습합니다',
    layoutType: 'A',
    difficulty: 'beginner',
    concepts: ['callstack', 'function-call', 'execution-context'],
    prerequisites: [],
    estimatedTime: 10
  },
  {
    id: 'basic-callstack-2',
    title: '중첩 함수 호출',
    description: '중첩된 함수 호출과 콜스택의 변화를 이해합니다',
    layoutType: 'A+',
    difficulty: 'beginner',
    concepts: ['nested-calls', 'stack-frames', 'return-values'],
    prerequisites: ['basic-callstack-1'],
    estimatedTime: 15
  },
  {
    id: 'eventloop-basic-1',
    title: '이벤트 루프 기초',
    description: '이벤트 루프의 기본 동작을 학습합니다',
    layoutType: 'B',
    difficulty: 'intermediate',
    concepts: ['event-loop', 'microtask-queue', 'macrotask-queue'],
    prerequisites: ['basic-callstack-2'],
    estimatedTime: 20
  },
  {
    id: 'advanced-eventloop-1',
    title: '고급 이벤트 루프',
    description: '복잡한 이벤트 루프 시나리오를 분석합니다',
    layoutType: 'E',
    difficulty: 'advanced',
    concepts: ['promise-microtasks', 'timer-macrotasks', 'execution-phases'],
    prerequisites: ['eventloop-basic-1'],
    estimatedTime: 30
  }
];

// Zustand 스토어 생성
export const useGameProgressionStore = create<GameProgressionState & GameProgressionActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // 초기화
      initialize: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // 저장된 진행상황 로드
          get().loadProgress();
          
          // 기본 스테이지 설정
          set((state) => {
            state.allStages = DEFAULT_STAGES;
            // 첫 번째 스테이지는 항상 해금
            if (!state.unlockedStages.includes(DEFAULT_STAGES[0].id)) {
              state.unlockedStages.push(DEFAULT_STAGES[0].id);
            }
            state.loading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.loading = false;
          });
        }
      },

      // 스테이지 로드
      loadStage: async (stageId: string) => {
        const { allStages, unlockedStages } = get();
        
        const stage = allStages.find(s => s.id === stageId);
        if (!stage) {
          throw new Error(`Stage not found: ${stageId}`);
        }
        
        if (!unlockedStages.includes(stageId)) {
          throw new Error(`Stage not unlocked: ${stageId}`);
        }

        set((state) => {
          state.currentStage = stage;
          state.loading = false;
          state.error = null;
        });

        // 스테이지 시도 시작
        get().startStageAttempt(stageId);
      },

      // 스테이지 완료
      completeStage: async (score: number, hintsUsed: number) => {
        const { currentStage } = get();
        if (!currentStage) return;

        // 진행상황 기록
        get().recordStageCompletion(currentStage.id, score, hintsUsed);

        // 다음 스테이지 해금 확인
        const { allStages, learningProgress } = get();
        const currentIndex = allStages.findIndex(s => s.id === currentStage.id);
        
        if (currentIndex >= 0 && currentIndex < allStages.length - 1) {
          const nextStage = allStages[currentIndex + 1];
          
          // 전제조건 확인
          const prerequisitesMet = nextStage.prerequisites.every(prereq => 
            learningProgress[prereq]?.completedAt
          );
          
          if (prerequisitesMet) {
            get().unlockStage(nextStage.id);
          }
        }

        // 자동 진행 설정이면 다음 스테이지로
        if (get().settings.autoProgress) {
          const nextStage = get().getRecommendedNextStage();
          if (nextStage) {
            await get().loadStage(nextStage.id);
          }
        }
      },

      // 스테이지 해금
      unlockStage: (stageId: string) => {
        set((state) => {
          if (!state.unlockedStages.includes(stageId)) {
            state.unlockedStages.push(stageId);
          }
        });
        
        get().saveProgress();
      },

      // 게임 데이터 업데이트
      updateGameData: (gameData: Partial<GameData>) => {
        set((state) => {
          state.currentGameData = {
            ...state.currentGameData,
            ...gameData
          } as GameData;
        });
      },

      // 게임 핸들러 설정
      setGameHandlers: (handlers: GameHandlers) => {
        set((state) => {
          state.currentGameHandlers = handlers;
        });
      },

      // 스테이지 시도 시작
      startStageAttempt: (stageId: string) => {
        const now = Date.now();
        
        set((state) => {
          if (!state.learningProgress[stageId]) {
            state.learningProgress[stageId] = {
              stageId,
              startedAt: now,
              attempts: 0,
              score: 0,
              hintsUsed: 0,
              timeSpent: 0,
              conceptsMastered: []
            };
          }
          
          state.learningProgress[stageId].attempts += 1;
          state.learningProgress[stageId].startedAt = now;
        });
      },

      // 스테이지 완료 기록
      recordStageCompletion: (stageId: string, score: number, hintsUsed: number) => {
        const now = Date.now();
        
        set((state) => {
          const progress = state.learningProgress[stageId];
          if (!progress) return;
          
          const timeSpent = now - progress.startedAt;
          
          progress.completedAt = now;
          progress.score = score;
          progress.hintsUsed = hintsUsed;
          progress.timeSpent += timeSpent;
          
          if (!progress.bestScore || score > progress.bestScore) {
            progress.bestScore = score;
          }
          
          // 세션 통계 업데이트
          state.sessionStats.stagesCompleted += 1;
          state.sessionStats.totalScore += score;
          state.sessionStats.totalHintsUsed += hintsUsed;
          
          // 새로운 개념 학습 확인
          const stage = state.allStages.find(s => s.id === stageId);
          if (stage) {
            stage.concepts.forEach(concept => {
              if (!progress.conceptsMastered.includes(concept)) {
                progress.conceptsMastered.push(concept);
                
                if (!state.sessionStats.conceptsLearned.includes(concept)) {
                  state.sessionStats.conceptsLearned.push(concept);
                }
              }
            });
          }
        });
        
        get().saveProgress();
      },

      // 학습 진행상황 업데이트
      updateLearningProgress: (stageId: string, progress: Partial<LearningProgress>) => {
        set((state) => {
          if (state.learningProgress[stageId]) {
            Object.assign(state.learningProgress[stageId], progress);
          }
        });
      },

      // 설정 업데이트
      updateSettings: (newSettings) => {
        set((state) => {
          Object.assign(state.settings, newSettings);
        });
        
        get().saveProgress();
      },

      // 전체 진행상황 조회
      getOverallProgress: () => {
        const { allStages, learningProgress } = get();
        
        const completedStages = Object.values(learningProgress)
          .filter(p => p.completedAt).length;
        
        const totalScore = Object.values(learningProgress)
          .reduce((sum, p) => sum + (p.bestScore || p.score), 0);
        
        const totalTimeSpent = Object.values(learningProgress)
          .reduce((sum, p) => sum + p.timeSpent, 0);
        
        return {
          totalStages: allStages.length,
          completedStages,
          completionRate: completedStages / allStages.length,
          averageScore: completedStages > 0 ? totalScore / completedStages : 0,
          totalTimeSpent
        };
      },

      // 스테이지 진행상황 조회
      getStageProgress: (stageId: string) => {
        return get().learningProgress[stageId] || null;
      },

      // 추천 다음 스테이지
      getRecommendedNextStage: () => {
        const { allStages, unlockedStages, learningProgress } = get();
        
        // 해금되었지만 완료되지 않은 스테이지 찾기
        const incompleteStages = allStages.filter(stage => 
          unlockedStages.includes(stage.id) && 
          !learningProgress[stage.id]?.completedAt
        );
        
        if (incompleteStages.length > 0) {
          return incompleteStages[0];
        }
        
        return null;
      },

      // 진행상황 저장
      saveProgress: () => {
        try {
          const { learningProgress, unlockedStages, settings, sessionStats } = get();
          
          const saveData = {
            learningProgress,
            unlockedStages,
            settings,
            sessionStats,
            savedAt: Date.now()
          };
          
          localStorage.setItem('callstack-library-progress', JSON.stringify(saveData));
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      },

      // 진행상황 로드
      loadProgress: () => {
        try {
          const saved = localStorage.getItem('callstack-library-progress');
          if (!saved) return;
          
          const saveData = JSON.parse(saved);
          
          set((state) => {
            state.learningProgress = saveData.learningProgress || {};
            state.unlockedStages = saveData.unlockedStages || [];
            state.settings = { ...state.settings, ...saveData.settings };
            state.sessionStats = { ...state.sessionStats, ...saveData.sessionStats };
          });
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      },

      // 진행상황 리셋
      resetProgress: () => {
        set((state) => {
          state.learningProgress = {};
          state.unlockedStages = [DEFAULT_STAGES[0].id];
          state.sessionStats = {
            stagesCompleted: 0,
            totalScore: 0,
            totalHintsUsed: 0,
            conceptsLearned: []
          };
        });
        
        get().saveProgress();
      }
    }))
  )
);

// 선택자들
export const useCurrentStage = () => useGameProgressionStore(state => state.currentStage);
export const useGameData = () => useGameProgressionStore(state => state.currentGameData);
export const useGameHandlers = () => useGameProgressionStore(state => state.currentGameHandlers);
export const useUnlockedStages = () => useGameProgressionStore(state => state.unlockedStages);
export const useSessionStats = () => useGameProgressionStore(state => state.sessionStats);
export const useProgressionSettings = () => useGameProgressionStore(state => state.settings);