/**
 * 사용자 피드백 시스템
 * 성공, 실패, 힌트, 진행 상황 등 다양한 피드백을 사용자에게 제공
 */

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  TrendingUp,
  X,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useDesignTokens } from '../ui/DesignSystemProvider';
import { useCallStackLibraryContext } from '../../contexts/CallStackLibraryContext';
import { gameEvents } from '../../utils/eventSystem';
import { AccessibleButton } from '../ui/AccessibleButton';
import { ProgressIndicator } from '../common/ProgressIndicator';

// 피드백 타입
export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'hint' | 'progress';

// 피드백 심각도
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';

// 피드백 항목 인터페이스
export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  severity: FeedbackSeverity;
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    handler: () => void;
  };
  autoHide?: number; // 자동 숨김 시간 (ms)
  dismissible?: boolean;
  timestamp: number;
}

// 피드백 시스템 Props
export interface UserFeedbackSystemProps {
  className?: string;
  maxItems?: number; // 최대 표시 개수
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  enableSound?: boolean; // 사운드 피드백
  compactMode?: boolean; // 컴팩트 모드
}

/**
 * 사용자 피드백 시스템 컴포넌트
 */
export const UserFeedbackSystem: React.FC<UserFeedbackSystemProps> = memo(({
  className,
  maxItems = 5,
  position = 'top-right',
  enableSound = false,
  compactMode = false
}) => {
  const tokens = useDesignTokens();
  const { state } = useCallStackLibraryContext();
  
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  
  // 피드백 추가 함수
  const addFeedback = useCallback((feedback: Omit<FeedbackItem, 'id' | 'timestamp'>) => {
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setFeedbackItems(prev => {
      const updatedItems = [newFeedback, ...prev].slice(0, maxItems);
      
      // 자동 숨김 처리
      if (newFeedback.autoHide && newFeedback.autoHide > 0) {
        setTimeout(() => {
          removeFeedback(newFeedback.id);
        }, newFeedback.autoHide);
      }
      
      return updatedItems;
    });
    
    // 접근성 공지
    gameEvents.accessibilityAnnounce(
      `${feedback.title}: ${feedback.message}`,
      feedback.severity === 'critical' ? 'assertive' : 'polite'
    );
    
    // 사운드 피드백 (선택적)
    if (soundEnabled) {
      // 실제 프로덕션에서는 적절한 사운드 파일을 사용
      console.log(`Sound: ${feedback.type}`);
    }
  }, [maxItems, soundEnabled]);
  
  // 피드백 제거 함수
  const removeFeedback = useCallback((id: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // 모든 피드백 제거
  const clearAllFeedback = useCallback(() => {
    setFeedbackItems([]);
  }, []);

  // 게임 이벤트 리스너 (간소화)
  useEffect(() => {
    // 기본 피드백 설정
    const welcomeMessage = {
      type: 'info' as const,
      severity: 'medium' as const,
      title: '게임 시작',
      message: '콜스택 도서관에 오신 것을 환영합니다!',
      autoHide: 3000,
      dismissible: true
    };
    
    // 초기 환영 메시지 추가
    addFeedback(welcomeMessage);
  }, [addFeedback]);

  // 피드백 아이콘 매핑
  const feedbackIcons = useMemo(() => ({
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    hint: Lightbulb,
    progress: TrendingUp
  }), []);

  // 피드백 색상 매핑
  const feedbackColors = useMemo(() => ({
    success: {
      bg: 'bg-green-50 dark:bg-green-950',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200'
    },
    hint: {
      bg: 'bg-purple-50 dark:bg-purple-950',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-800 dark:text-purple-200'
    },
    progress: {
      bg: 'bg-indigo-50 dark:bg-indigo-950',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: 'text-indigo-600 dark:text-indigo-400',
      text: 'text-indigo-800 dark:text-indigo-200'
    }
  }), []);

  // 위치 스타일
  const positionStyles = useMemo(() => {
    const baseStyles = 'fixed z-50 pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  }, [position]);

  // 피드백 항목 렌더링
  const renderFeedbackItem = useCallback((item: FeedbackItem) => {
    const IconComponent = feedbackIcons[item.type];
    const colors = feedbackColors[item.type];
    
    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.3 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ 
          opacity: 0, 
          x: position.includes('right') ? 300 : -300, 
          scale: 0.3,
          transition: { duration: 0.2 }
        }}
        className={cn(
          'pointer-events-auto mb-3 max-w-sm overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm',
          colors.bg,
          colors.border,
          compactMode ? 'p-3' : 'p-4'
        )}
        style={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex items-start">
          {/* 아이콘 */}
          <div className={cn('flex-shrink-0', compactMode ? 'mr-2' : 'mr-3')}>
            <IconComponent 
              className={cn(
                colors.icon,
                compactMode ? 'h-4 w-4' : 'h-5 w-5'
              )} 
            />
          </div>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cn(
                  'font-medium',
                  colors.text,
                  compactMode ? 'text-sm' : 'text-sm'
                )}>
                  {item.title}
                </h4>
                <p className={cn(
                  'mt-1',
                  colors.text,
                  compactMode ? 'text-xs' : 'text-sm',
                  'opacity-90'
                )}>
                  {item.message}
                </p>
                
                {/* 추가 세부사항 */}
                {item.details && (
                  <p className={cn(
                    'mt-1 text-xs opacity-75',
                    colors.text
                  )}>
                    {item.details}
                  </p>
                )}
              </div>
              
              {/* 닫기 버튼 */}
              {item.dismissible && (
                <AccessibleButton
                  variant="ghost"
                  size="sm"
                  label={`${item.title} 피드백 닫기`}
                  onClick={() => removeFeedback(item.id)}
                  className={cn(
                    'ml-2 p-1 opacity-60 hover:opacity-100',
                    colors.text
                  )}
                >
                  <X className="h-3 w-3" />
                </AccessibleButton>
              )}
            </div>
            
            {/* 액션 버튼 */}
            {item.action && (
              <div className="mt-3">
                <AccessibleButton
                  variant="secondary"
                  size="sm"
                  label={item.action.label}
                  onClick={item.action.handler}
                  className={cn(
                    'text-xs',
                    colors.text
                  )}
                >
                  {item.action.label}
                </AccessibleButton>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [feedbackIcons, feedbackColors, position, compactMode, removeFeedback]);

  return (
    <div 
      className={cn(positionStyles, className)}
      role="region"
      aria-label="게임 피드백"
    >
      {/* 컨트롤 패널 */}
      {feedbackItems.length > 0 && (
        <div className="mb-3 flex items-center justify-end space-x-2 pointer-events-auto">
          {/* 사운드 토글 */}
          <AccessibleButton
            variant="ghost"
            size="sm"
            label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm"
          >
            {soundEnabled ? 
              <Volume2 className="h-4 w-4" /> : 
              <VolumeX className="h-4 w-4" />
            }
          </AccessibleButton>
          
          {/* 모두 닫기 */}
          <AccessibleButton
            variant="ghost"
            size="sm"
            label="모든 피드백 닫기"
            onClick={clearAllFeedback}
            className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm"
          >
            <Bell className="h-4 w-4" />
          </AccessibleButton>
        </div>
      )}
      
      {/* 피드백 항목들 */}
      <AnimatePresence mode="popLayout">
        {feedbackItems.map(renderFeedbackItem)}
      </AnimatePresence>
    </div>
  );
});

UserFeedbackSystem.displayName = 'UserFeedbackSystem';

// 피드백 시스템 훅
export const useFeedbackSystem = () => {
  return {
    addSuccessFeedback: (title: string, message: string, details?: string) => {
      // 성공 피드백 추가 로직
    },
    addErrorFeedback: (title: string, message: string, details?: string) => {
      // 에러 피드백 추가 로직
    },
    addHintFeedback: (title: string, message: string, details?: string) => {
      // 힌트 피드백 추가 로직
    },
    addProgressFeedback: (title: string, message: string, details?: string) => {
      // 진행 상황 피드백 추가 로직
    }
  };
};

// 타입 내보내기 제거 - 중복 선언 해결