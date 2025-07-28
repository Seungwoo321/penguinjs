'use client'

/**
 * CallStack Library 게임 전역 상태 관리
 * 구조적 개선을 위한 중앙화된 상태 관리 시스템
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { 
  QueueType, 
  QueueItem, 
  ExecutionStep
} from '../types';
import { QueueStatesSnapshot, EventLoopStep, QueueValidationResult } from '../types/layout';

// 액션 타입 정의
export enum ActionType {
  // 게임 상태
  SET_GAME_STATE = 'SET_GAME_STATE',
  SET_CURRENT_STAGE = 'SET_CURRENT_STAGE',
  SET_LAYOUT_TYPE = 'SET_LAYOUT_TYPE',
  
  // 큐 상태
  UPDATE_QUEUE = 'UPDATE_QUEUE',
  ADD_TO_QUEUE = 'ADD_TO_QUEUE',
  REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE',
  CLEAR_QUEUE = 'CLEAR_QUEUE',
  SET_QUEUE_STATES = 'SET_QUEUE_STATES',
  
  // 실행 상태
  SET_EXECUTION_STEP = 'SET_EXECUTION_STEP',
  SET_IS_EXECUTING = 'SET_IS_EXECUTING',
  SET_IS_PAUSED = 'SET_IS_PAUSED',
  SET_EXECUTION_SPEED = 'SET_EXECUTION_SPEED',
  
  // 사용자 답안
  SET_USER_ANSWER = 'SET_USER_ANSWER',
  UPDATE_USER_ANSWER = 'UPDATE_USER_ANSWER',
  CLEAR_USER_ANSWER = 'CLEAR_USER_ANSWER',
  
  // 검증 및 평가
  SET_VALIDATION_RESULTS = 'SET_VALIDATION_RESULTS',
  SET_SCORE = 'SET_SCORE',
  SET_HINTS_USED = 'SET_HINTS_USED',
  
  // UI 상태
  SET_HIGHLIGHTED_QUEUE = 'SET_HIGHLIGHTED_QUEUE',
  SET_SELECTED_FUNCTION = 'SET_SELECTED_FUNCTION',
  SET_SHOW_HINTS = 'SET_SHOW_HINTS',
  SET_SHOW_SOLUTION = 'SET_SHOW_SOLUTION',
  
  // 게임 진행
  RESET_GAME = 'RESET_GAME',
  COMPLETE_STAGE = 'COMPLETE_STAGE',
  UNLOCK_STAGE = 'UNLOCK_STAGE',
  
  // Layout B 전용 액션
  SET_QUEUE_STATES_HISTORY = 'SET_QUEUE_STATES_HISTORY',
  UPDATE_CURRENT_QUEUE_STATES = 'UPDATE_CURRENT_QUEUE_STATES',
  SET_EVENT_LOOP_STEPS = 'SET_EVENT_LOOP_STEPS',
  ADD_QUEUE_VALIDATION_RESULT = 'ADD_QUEUE_VALIDATION_RESULT'
}

// 액션 타입
type Action = 
  | { type: ActionType.SET_GAME_STATE; payload: 'idle' | 'playing' | 'paused' | 'completed' | 'loading' }
  | { type: ActionType.SET_CURRENT_STAGE; payload: number }
  | { type: ActionType.SET_LAYOUT_TYPE; payload: string }
  | { type: ActionType.SET_QUEUE_STATES; payload: CallStackLibraryState['queueStates'] }
  | { type: ActionType.SET_QUEUE_STATES_HISTORY; payload: Record<number, QueueStatesSnapshot> }
  | { type: ActionType.UPDATE_CURRENT_QUEUE_STATES; payload: QueueStatesSnapshot }
  | { type: ActionType.SET_EVENT_LOOP_STEPS; payload: EventLoopStep[] }
  | { type: ActionType.ADD_QUEUE_VALIDATION_RESULT; payload: { step: number; result: QueueValidationResult } }
  | { type: ActionType; payload?: any }; // fallback

// 상태 인터페이스
export interface CallStackLibraryState {
  // 게임 기본 정보
  gameState: 'idle' | 'playing' | 'paused' | 'completed' | 'loading';
  currentStage: number;
  layoutType: string;
  config: any;
  
  // 큐 상태
  queueStates: {
    callstack: QueueItem[];
    microtask: QueueItem[];
    macrotask: QueueItem[];
  };
  queueSnapshots: Record<number, any>;
  
  // Layout B 전용 상태
  queueStatesHistory: Record<number, QueueStatesSnapshot>;
  currentQueueStates: QueueStatesSnapshot | null;
  eventLoopSteps: EventLoopStep[];
  queueValidationResults: Record<number, QueueValidationResult>;
  
  // 실행 상태
  currentStep: number;
  executionSteps: ExecutionStep[];
  isExecuting: boolean;
  isPaused: boolean;
  executionSpeed: number;
  
  // 사용자 답안
  userAnswer: Record<string, any>;
  validationResults: Record<string, any>;
  
  // 점수 및 진행도
  score: number;
  hintsUsed: number;
  completedStages: number[];
  unlockedStages: number[];
  
  // UI 상태
  highlightedQueue: QueueType | null;
  selectedFunction: string | null;
  showHints: boolean;
  showSolution: boolean;
}

// 초기 상태
const initialState: CallStackLibraryState = {
  // 게임 기본 정보
  gameState: 'idle',
  currentStage: 1,
  layoutType: 'A',
  config: {
    maxCallStackSize: 10,
    maxQueueSize: 8,
    executionSpeed: 1000,
    enableAutoplay: false,
    enableHints: true,
    enableSolution: false
  },
  
  // 큐 상태
  queueStates: {
    callstack: [],
    microtask: [],
    macrotask: []
  },
  queueSnapshots: {},
  
  // Layout B 전용 상태
  queueStatesHistory: {},
  currentQueueStates: null,
  eventLoopSteps: [],
  queueValidationResults: {},
  
  // 실행 상태
  currentStep: 0,
  executionSteps: [],
  isExecuting: false,
  isPaused: false,
  executionSpeed: 1000,
  
  // 사용자 답안
  userAnswer: {},
  validationResults: {},
  
  // 점수 및 진행도
  score: 0,
  hintsUsed: 0,
  completedStages: [],
  unlockedStages: [1],
  
  // UI 상태
  highlightedQueue: null,
  selectedFunction: null,
  showHints: false,
  showSolution: false
};

// 리듀서
function callStackLibraryReducer(
  state: CallStackLibraryState,
  action: Action
): CallStackLibraryState {
  switch (action.type) {
    // 게임 상태
    case ActionType.SET_GAME_STATE:
      return { ...state, gameState: action.payload };
      
    case ActionType.SET_CURRENT_STAGE:
      return { ...state, currentStage: action.payload };
      
    case ActionType.SET_LAYOUT_TYPE:
      return { ...state, layoutType: action.payload };
    
    // 큐 상태
    case ActionType.UPDATE_QUEUE:
      const { queueType, items } = action.payload;
      return {
        ...state,
        queueStates: {
          ...state.queueStates,
          [queueType]: items
        }
      };
      
    case ActionType.ADD_TO_QUEUE:
      const { queue, item } = action.payload;
      return {
        ...state,
        queueStates: {
          ...state.queueStates,
          [queue]: [...state.queueStates[queue as QueueType], item]
        }
      };
      
    case ActionType.REMOVE_FROM_QUEUE:
      const { queue: removeQueue, index } = action.payload;
      return {
        ...state,
        queueStates: {
          ...state.queueStates,
          [removeQueue]: state.queueStates[removeQueue as QueueType].filter((_, i) => i !== index)
        }
      };
      
    case ActionType.CLEAR_QUEUE:
      return {
        ...state,
        queueStates: {
          ...state.queueStates,
          [action.payload]: []
        }
      };
      
    case ActionType.SET_QUEUE_STATES:
      return {
        ...state,
        queueStates: action.payload,
        queueSnapshots: {
          ...state.queueSnapshots,
          [state.currentStep]: action.payload
        }
      };
    
    // 실행 상태
    case ActionType.SET_EXECUTION_STEP:
      return { ...state, currentStep: action.payload };
      
    case ActionType.SET_IS_EXECUTING:
      return { ...state, isExecuting: action.payload };
      
    case ActionType.SET_IS_PAUSED:
      return { ...state, isPaused: action.payload };
      
    case ActionType.SET_EXECUTION_SPEED:
      return { ...state, executionSpeed: action.payload };
    
    // 사용자 답안
    case ActionType.SET_USER_ANSWER:
      return { ...state, userAnswer: action.payload };
      
    case ActionType.UPDATE_USER_ANSWER:
      const { key, value } = action.payload;
      return {
        ...state,
        userAnswer: {
          ...state.userAnswer,
          [key]: value
        }
      };
      
    case ActionType.CLEAR_USER_ANSWER:
      return { ...state, userAnswer: {} };
    
    // 검증 및 평가
    case ActionType.SET_VALIDATION_RESULTS:
      return { ...state, validationResults: action.payload };
      
    case ActionType.SET_SCORE:
      return { ...state, score: action.payload };
      
    case ActionType.SET_HINTS_USED:
      return { ...state, hintsUsed: action.payload };
    
    // UI 상태
    case ActionType.SET_HIGHLIGHTED_QUEUE:
      return { ...state, highlightedQueue: action.payload };
      
    case ActionType.SET_SELECTED_FUNCTION:
      return { ...state, selectedFunction: action.payload };
      
    case ActionType.SET_SHOW_HINTS:
      return { ...state, showHints: action.payload };
      
    case ActionType.SET_SHOW_SOLUTION:
      return { ...state, showSolution: action.payload };
    
    // 게임 진행
    case ActionType.RESET_GAME:
      return {
        ...initialState,
        currentStage: state.currentStage,
        completedStages: state.completedStages,
        unlockedStages: state.unlockedStages
      };
      
    case ActionType.COMPLETE_STAGE:
      const stageNumber = action.payload;
      return {
        ...state,
        completedStages: Array.from(new Set([...state.completedStages, stageNumber])),
        unlockedStages: Array.from(new Set([...state.unlockedStages, stageNumber + 1])),
        score: state.score + (100 - state.hintsUsed * 10)
      };
      
    case ActionType.UNLOCK_STAGE:
      return {
        ...state,
        unlockedStages: Array.from(new Set([...state.unlockedStages, action.payload]))
      };
    
    // Layout B 전용 액션
    case ActionType.SET_QUEUE_STATES_HISTORY:
      return {
        ...state,
        queueStatesHistory: action.payload
      };
      
    case ActionType.UPDATE_CURRENT_QUEUE_STATES:
      return {
        ...state,
        currentQueueStates: action.payload,
        queueStatesHistory: {
          ...state.queueStatesHistory,
          [action.payload.step]: action.payload
        }
      };
      
    case ActionType.SET_EVENT_LOOP_STEPS:
      return {
        ...state,
        eventLoopSteps: action.payload
      };
      
    case ActionType.ADD_QUEUE_VALIDATION_RESULT:
      const { step, result } = action.payload;
      return {
        ...state,
        queueValidationResults: {
          ...state.queueValidationResults,
          [step]: result
        }
      };
    
    default:
      return state;
  }
}

// Context 타입
interface CallStackLibraryContextType {
  state: CallStackLibraryState;
  dispatch: React.Dispatch<Action>;
  
  // 게임 제어 함수들
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  
  // 큐 제어 함수들
  addToQueue: (queue: QueueType, item: QueueItem) => void;
  removeFromQueue: (queue: QueueType, index: number) => void;
  clearQueue: (queue: QueueType) => void;
  updateQueueState: (queueType: QueueType, items: QueueItem[]) => void;
  
  // 실행 제어 함수들
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  setExecutionSpeed: (speed: number) => void;
  
  // 답안 관리 함수들
  updateAnswer: (key: string, value: any) => void;
  submitAnswer: () => Promise<any>;
  clearAnswer: () => void;
  
  // UI 제어 함수들
  highlightQueue: (queue: QueueType | null) => void;
  selectFunction: (functionName: string | null) => void;
  toggleHints: () => void;
  requestHint: () => void;
}

// Context 생성
const CallStackLibraryContext = createContext<CallStackLibraryContextType | null>(null);

// Provider Props
interface CallStackLibraryProviderProps {
  children: ReactNode;
  initialStage?: number;
  initialLayout?: string;
}

// Provider 컴포넌트
export const CallStackLibraryProvider: React.FC<CallStackLibraryProviderProps> = ({
  children,
  initialStage = 1,
  initialLayout = 'A'
}) => {
  const [state, dispatch] = useReducer(callStackLibraryReducer, {
    ...initialState,
    currentStage: initialStage,
    layoutType: initialLayout
  });

  // 게임 제어 함수들
  const startGame = useCallback(() => {
    dispatch({ type: ActionType.SET_GAME_STATE, payload: 'playing' });
    dispatch({ type: ActionType.SET_IS_EXECUTING, payload: true });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: ActionType.SET_IS_PAUSED, payload: true });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: ActionType.SET_IS_PAUSED, payload: false });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ActionType.RESET_GAME });
  }, []);

  // 큐 제어 함수들
  const addToQueue = useCallback((queue: QueueType, item: QueueItem) => {
    dispatch({ type: ActionType.ADD_TO_QUEUE, payload: { queue, item } });
  }, []);

  const removeFromQueue = useCallback((queue: QueueType, index: number) => {
    dispatch({ type: ActionType.REMOVE_FROM_QUEUE, payload: { queue, index } });
  }, []);

  const clearQueue = useCallback((queue: QueueType) => {
    dispatch({ type: ActionType.CLEAR_QUEUE, payload: queue });
  }, []);

  const updateQueueState = useCallback((queueType: QueueType, items: QueueItem[]) => {
    dispatch({ type: ActionType.UPDATE_QUEUE, payload: { queueType, items } });
  }, []);

  // 실행 제어 함수들
  const nextStep = useCallback(() => {
    if (state.currentStep < state.executionSteps.length - 1) {
      dispatch({ type: ActionType.SET_EXECUTION_STEP, payload: state.currentStep + 1 });
    }
  }, [state.currentStep, state.executionSteps.length]);

  const previousStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: ActionType.SET_EXECUTION_STEP, payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: ActionType.SET_EXECUTION_STEP, payload: step });
  }, []);

  const setExecutionSpeed = useCallback((speed: number) => {
    dispatch({ type: ActionType.SET_EXECUTION_SPEED, payload: speed });
  }, []);

  // 답안 관리 함수들
  const updateAnswer = useCallback((key: string, value: any) => {
    dispatch({ type: ActionType.UPDATE_USER_ANSWER, payload: { key, value } });
  }, []);

  const submitAnswer = useCallback(async (): Promise<any> => {
    // 여기서 실제 검증 로직 구현
    const result: any = {
      isValid: true,
      errors: [],
      score: 100 - state.hintsUsed * 10
    };
    
    dispatch({ type: ActionType.SET_VALIDATION_RESULTS, payload: { [state.currentStage]: result } });
    
    if (result.isValid) {
      dispatch({ type: ActionType.COMPLETE_STAGE, payload: state.currentStage });
    }
    
    return result;
  }, [state.currentStage, state.hintsUsed]);

  const clearAnswer = useCallback(() => {
    dispatch({ type: ActionType.CLEAR_USER_ANSWER });
  }, []);

  // UI 제어 함수들
  const highlightQueue = useCallback((queue: QueueType | null) => {
    dispatch({ type: ActionType.SET_HIGHLIGHTED_QUEUE, payload: queue });
  }, []);

  const selectFunction = useCallback((functionName: string | null) => {
    dispatch({ type: ActionType.SET_SELECTED_FUNCTION, payload: functionName });
  }, []);

  const toggleHints = useCallback(() => {
    dispatch({ type: ActionType.SET_SHOW_HINTS, payload: !state.showHints });
  }, [state.showHints]);

  const requestHint = useCallback(() => {
    dispatch({ type: ActionType.SET_HINTS_USED, payload: state.hintsUsed + 1 });
    dispatch({ type: ActionType.SET_SHOW_HINTS, payload: true });
  }, [state.hintsUsed]);

  // Context 값
  const value = useMemo(() => ({
    state,
    dispatch,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    addToQueue,
    removeFromQueue,
    clearQueue,
    updateQueueState,
    nextStep,
    previousStep,
    goToStep,
    setExecutionSpeed,
    updateAnswer,
    submitAnswer,
    clearAnswer,
    highlightQueue,
    selectFunction,
    toggleHints,
    requestHint
  }), [
    state,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    addToQueue,
    removeFromQueue,
    clearQueue,
    updateQueueState,
    nextStep,
    previousStep,
    goToStep,
    setExecutionSpeed,
    updateAnswer,
    submitAnswer,
    clearAnswer,
    highlightQueue,
    selectFunction,
    toggleHints,
    requestHint
  ]);

  return (
    <CallStackLibraryContext.Provider value={value}>
      {children}
    </CallStackLibraryContext.Provider>
  );
};

// Context Hook
export const useCallStackLibrary = () => {
  const context = useContext(CallStackLibraryContext);
  if (!context) {
    throw new Error('useCallStackLibrary must be used within CallStackLibraryProvider');
  }
  return context;
};

// Legacy alias for compatibility
export const useCallStackLibraryContext = useCallStackLibrary;

// 선택적 Hook들
export const useCallStackLibraryState = () => {
  const { state } = useCallStackLibrary();
  return state;
};

export const useCallStackLibraryActions = () => {
  const context = useCallStackLibrary();
  const { state, dispatch, ...actions } = context;
  return actions;
};

export const useQueueStates = () => {
  const { state } = useCallStackLibrary();
  return state.queueStates;
};

export const useExecutionState = () => {
  const { state } = useCallStackLibrary();
  return {
    currentStep: state.currentStep,
    isExecuting: state.isExecuting,
    isPaused: state.isPaused,
    executionSpeed: state.executionSpeed
  };
};