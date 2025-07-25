/**
 * 오류 복구 시스템
 * 사용자가 실수했을 때 쉽게 복구할 수 있는 시스템
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Undo2, 
  Redo2, 
  AlertTriangle, 
  RefreshCw,
  HelpCircle,
  Lightbulb,
  Save,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useDesignTokens } from '../ui/DesignSystemProvider';
import { useCallStackLibraryContext, ActionType } from '../../contexts/CallStackLibraryContext';
import { gameEvents } from '../../utils/eventSystem';
import { AccessibleButton } from '../ui/AccessibleButton';

// 실행 취소 가능한 액션 타입
export type UndoableActionType = 
  | 'queue_item_add'
  | 'queue_item_remove'
  | 'queue_item_move'
  | 'function_select'
  | 'function_deselect'
  | 'step_forward'
  | 'step_backward'
  | 'state_change';

// 실행 취소 가능한 액션
export interface UndoableAction {
  id: string;
  type: UndoableActionType;
  timestamp: Date;
  description: string;
  undo: () => void;
  redo: () => void;
  data?: any;
}

// 오류 정보
export interface ErrorInfo {
  id: string;
  type: 'validation' | 'execution' | 'system' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  cause?: string;
  suggestions: string[];
  timestamp: Date;
  context?: {
    stage?: number;
    step?: number;
    queueState?: any;
    userAction?: string;
  };
}

// 자동 저장 상태
export interface AutoSaveState {
  lastSaved: Date;
  interval: number; // ms
  enabled: boolean;
  data?: any;
}

// 오류 복구 시스템 Props
interface ErrorRecoverySystemProps {
  className?: string;
  maxUndoHistory?: number;
  autoSaveInterval?: number;
  showQuickActions?: boolean;
}

/**
 * 오류 복구 시스템 컴포넌트
 */
export const ErrorRecoverySystem = memo<ErrorRecoverySystemProps>(({
  className,
  maxUndoHistory = 20,
  autoSaveInterval = 30000, // 30초
  showQuickActions = true
}) => {
  const designTokens = useDesignTokens();
  const { state, dispatch } = useCallStackLibraryContext();
  
  const [undoHistory, setUndoHistory] = useState<UndoableAction[]>([]);
  const [redoHistory, setRedoHistory] = useState<UndoableAction[]>([]);
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    lastSaved: new Date(),
    interval: autoSaveInterval,
    enabled: true
  });
  const [showUndoPanel, setShowUndoPanel] = useState(false);

  // 실행 취소 가능한 액션 추가
  const addUndoableAction = useCallback((action: Omit<UndoableAction, 'id' | 'timestamp'>) => {
    const newAction: UndoableAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setUndoHistory(prev => {
      const updated = [newAction, ...prev];
      return updated.slice(0, maxUndoHistory);
    });

    // 새 액션이 추가되면 redo 히스토리 클리어
    setRedoHistory([]);

    // 접근성 알림
    gameEvents.accessibilityAnnounce(
      `액션 추가됨: ${action.description}`,
      'polite'
    );
  }, [maxUndoHistory]);

  // 실행 취소
  const undo = useCallback(() => {
    if (undoHistory.length === 0) return;

    const [lastAction, ...restUndo] = undoHistory;
    
    try {
      lastAction.undo();
      setUndoHistory(restUndo);
      setRedoHistory(prev => [lastAction, ...prev]);
      
      // 이벤트 발생
      gameEvents.accessibilityAnnounce(
        `실행 취소: ${lastAction.description}`,
        'polite'
      );
    } catch (error) {
      console.error('Undo failed:', error);
      showError({
        type: 'system',
        severity: 'medium',
        title: '실행 취소 실패',
        message: '이전 상태로 되돌릴 수 없습니다.',
        cause: '시스템 오류',
        suggestions: ['페이지를 새로고침해보세요.', '다른 방법으로 수정해보세요.']
      });
    }
  }, [undoHistory]);

  // 다시 실행
  const redo = useCallback(() => {
    if (redoHistory.length === 0) return;

    const [lastRedo, ...restRedo] = redoHistory;
    
    try {
      lastRedo.redo();
      setRedoHistory(restRedo);
      setUndoHistory(prev => [lastRedo, ...prev]);
      
      // 이벤트 발생
      gameEvents.accessibilityAnnounce(
        `다시 실행: ${lastRedo.description}`,
        'polite'
      );
    } catch (error) {
      console.error('Redo failed:', error);
      showError({
        type: 'system',
        severity: 'medium',
        title: '다시 실행 실패',
        message: '액션을 다시 실행할 수 없습니다.',
        cause: '시스템 오류',
        suggestions: ['수동으로 다시 시도해보세요.']
      });
    }
  }, [redoHistory]);

  // 전체 초기화
  const resetToInitial = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATE' as any, payload: 'waiting' as any });
    setUndoHistory([]);
    setRedoHistory([]);
    setCurrentError(null);
    
    gameEvents.gameReset(state.currentStage || 1);
    gameEvents.accessibilityAnnounce('게임이 초기 상태로 재설정되었습니다.', 'polite');
  }, [dispatch, state.currentStage]);

  // 오류 표시
  const showError = useCallback((errorInfo: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
    const error: ErrorInfo = {
      ...errorInfo,
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      context: {
        stage: state.currentStage,
        step: 0, // 현재 스텝 정보가 상태에 없음
        queueState: state.queueStates,
        ...errorInfo.context
      }
    };

    setCurrentError(error);
    
    // 이벤트 발생
    gameEvents.debugLog('error', error.title, error);
  }, [state]);

  // 자동 저장
  const autoSave = useCallback(() => {
    if (!autoSaveState.enabled) return;

    const saveData = {
      queueStates: state.queueStates,
      currentStep: 0, // execution 상태 없음
      userAnswer: null, // game.userAnswer 상태 없음
      timestamp: new Date()
    };

    try {
      localStorage.setItem('callstack-library-autosave', JSON.stringify(saveData));
      setAutoSaveState(prev => ({
        ...prev,
        lastSaved: new Date(),
        data: saveData
      }));
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }, [state, autoSaveState.enabled]);

  // 자동 저장 간격 설정
  useEffect(() => {
    if (!autoSaveState.enabled) return;

    const interval = setInterval(autoSave, autoSaveState.interval);
    return () => clearInterval(interval);
  }, [autoSave, autoSaveState.enabled, autoSaveState.interval]);

  // 저장된 상태 복원
  const restoreFromAutoSave = useCallback(() => {
    try {
      const saved = localStorage.getItem('callstack-library-autosave');
      if (!saved) return false;

      const saveData = JSON.parse(saved);
      
      // 데이터 유효성 검사
      if (!saveData.timestamp || !saveData.queueStates) return false;

      // 상태 복원
      dispatch({ type: ActionType.SET_EXECUTION_STEP, payload: saveData.currentStep || 0 });
      dispatch({ type: ActionType.SET_QUEUE_STATES, payload: saveData.queueStates });
      dispatch({ type: ActionType.SET_USER_ANSWER, payload: saveData.userAnswer });

      gameEvents.accessibilityAnnounce('자동 저장된 상태로 복원되었습니다.', 'polite');
      return true;
    } catch (error) {
      console.error('Failed to restore from auto-save:', error);
      return false;
    }
  }, [dispatch]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              redo();
            } else {
              event.preventDefault();
              undo();
            }
            break;
          case 'r':
            if (event.shiftKey) {
              event.preventDefault();
              resetToInitial();
            }
            break;
          case 's':
            event.preventDefault();
            autoSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, resetToInitial, autoSave]);

  // 오류 심각도별 색상
  const getErrorColor = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'low': return designTokens.getSemanticColor('info');
      case 'medium': return designTokens.getSemanticColor('warning');
      case 'high': return designTokens.getSemanticColor('error');
      case 'critical': return '#dc2626';
      default: return designTokens.getSemanticColor('info');
    }
  };

  return (
    <div className={cn('fixed bottom-4 left-4 z-40', className)}>
      {/* 오류 알림 */}
      <AnimatePresence>
        {currentError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="mb-4 max-w-md"
          >
            <div
              className="rounded-lg border-l-4 bg-white shadow-lg p-4"
              style={{ borderLeftColor: getErrorColor(currentError.severity) }}
            >
              <div className="flex items-start">
                <AlertTriangle 
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                  style={{ color: getErrorColor(currentError.severity) }}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {currentError.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {currentError.message}
                  </p>
                  
                  {currentError.cause && (
                    <p className="text-xs text-gray-500 mb-2">
                      원인: {currentError.cause}
                    </p>
                  )}
                  
                  {currentError.suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                      <h5 className="text-xs font-semibold text-blue-900 mb-1 flex items-center">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        해결 방법:
                      </h5>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {currentError.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <AccessibleButton
                      size="sm"
                      variant="primary"
                      label="오류 해결 시도"
                      onClick={() => setCurrentError(null)}
                    >
                      확인
                    </AccessibleButton>
                    
                    {undoHistory.length > 0 && (
                      <AccessibleButton
                        size="sm"
                        variant="secondary"
                        label="이전 단계로 되돌리기"
                        onClick={() => {
                          undo();
                          setCurrentError(null);
                        }}
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        되돌리기
                      </AccessibleButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 실행 취소/다시 실행 패널 */}
      <AnimatePresence>
        {showUndoPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white rounded-lg shadow-lg border p-4 max-w-md"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              작업 히스토리
            </h3>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {undoHistory.slice(0, 5).map((action, index) => (
                <div
                  key={action.id}
                  className="flex items-center text-xs text-gray-600 p-2 bg-gray-50 rounded"
                >
                  <Clock className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="flex-1">{action.description}</span>
                  <span className="text-xs text-gray-400">
                    {action.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {undoHistory.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  아직 수행된 작업이 없습니다.
                </p>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t flex justify-between">
              <AccessibleButton
                size="sm"
                variant="ghost"
                label="패널 닫기"
                onClick={() => setShowUndoPanel(false)}
              >
                닫기
              </AccessibleButton>
              
              {undoHistory.length > 0 && (
                <AccessibleButton
                  size="sm"
                  variant="danger"
                  label="모든 히스토리 지우기"
                  onClick={() => {
                    setUndoHistory([]);
                    setRedoHistory([]);
                    setShowUndoPanel(false);
                  }}
                >
                  모두 지우기
                </AccessibleButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 빠른 액션 버튼들 */}
      {showQuickActions && (
        <div className="flex space-x-2">
          <AccessibleButton
            size="sm"
            variant="secondary"
            label={`실행 취소 (${undoHistory.length}개 가능)`}
            onClick={undo}
            disabled={undoHistory.length === 0}
            className="shadow-lg"
          >
            <Undo2 className="w-4 h-4" />
          </AccessibleButton>
          
          <AccessibleButton
            size="sm"
            variant="secondary"
            label={`다시 실행 (${redoHistory.length}개 가능)`}
            onClick={redo}
            disabled={redoHistory.length === 0}
            className="shadow-lg"
          >
            <Redo2 className="w-4 h-4" />
          </AccessibleButton>
          
          <AccessibleButton
            size="sm"
            variant="secondary"
            label="작업 히스토리 보기"
            onClick={() => setShowUndoPanel(!showUndoPanel)}
            className="shadow-lg"
          >
            <Clock className="w-4 h-4" />
          </AccessibleButton>
          
          <AccessibleButton
            size="sm"
            variant="secondary"
            label="수동 저장"
            onClick={autoSave}
            className="shadow-lg"
          >
            <Save className="w-4 h-4" />
          </AccessibleButton>
          
          <AccessibleButton
            size="sm"
            variant="danger"
            label="전체 초기화"
            onClick={resetToInitial}
            className="shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </AccessibleButton>
        </div>
      )}

      {/* 자동 저장 상태 표시 */}
      {autoSaveState.enabled && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
          마지막 저장: {autoSaveState.lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
});

ErrorRecoverySystem.displayName = 'ErrorRecoverySystem';

/**
 * 오류 복구 시스템 Hook
 */
export const useErrorRecovery = () => {
  const [recoveryRef, setRecoveryRef] = useState<{
    addUndoableAction: (action: Omit<UndoableAction, 'id' | 'timestamp'>) => void;
    showError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => void;
    undo: () => void;
    redo: () => void;
    resetToInitial: () => void;
  } | null>(null);

  const addAction = useCallback((action: Omit<UndoableAction, 'id' | 'timestamp'>) => {
    recoveryRef?.addUndoableAction(action);
  }, [recoveryRef]);

  const reportError = useCallback((error: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
    recoveryRef?.showError(error);
  }, [recoveryRef]);

  return {
    setRecoveryRef,
    addAction,
    reportError,
    undo: () => recoveryRef?.undo(),
    redo: () => recoveryRef?.redo(),
    reset: () => recoveryRef?.resetToInitial()
  };
};

// 타입 내보내기 제거 - 중복 선언 해결