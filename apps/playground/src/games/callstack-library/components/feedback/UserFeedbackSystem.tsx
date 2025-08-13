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
import { useDesignTokens } from '@/games/callstack-library/components/ui/DesignSystemProvider';
import { useCallStackLibraryContext } from '@/games/callstack-library/contexts/CallStackLibraryContext';
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync';
import { gameEvents } from '@/games/callstack-library/utils/eventSystem';
import { AccessibleButton } from '@/games/callstack-library/components/ui/AccessibleButton';
import { ProgressIndicator } from '@/games/callstack-library/components/common/ProgressIndicator';

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
  const isDarkMode = useDarkModeDetection();
  
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

  // 피드백 색상 매핑 - CSS 변수 사용
  const feedbackStyles = useMemo(() => ({
    success: {
      bg: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgb(240, 253, 244)',
      border: '2px solid rgb(var(--game-callstack-library-success))',
      icon: 'rgb(var(--game-callstack-library-success))',
      text: isDarkMode ? 'rgb(var(--game-callstack-library-success))' : 'rgb(22, 101, 52)'
    },
    error: {
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgb(254, 242, 242)',
      border: '2px solid rgb(var(--game-callstack-library-error))',
      icon: 'rgb(var(--game-callstack-library-error))',
      text: isDarkMode ? 'rgb(var(--game-callstack-library-error))' : 'rgb(153, 27, 27)'
    },
    warning: {
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgb(254, 243, 199)',
      border: '2px solid rgb(var(--game-callstack-library-warning))',
      icon: 'rgb(var(--game-callstack-library-warning))',
      text: isDarkMode ? 'rgb(var(--game-callstack-library-warning))' : 'rgb(146, 64, 14)'
    },
    info: {
      bg: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgb(219, 234, 254)',
      border: '2px solid rgb(var(--game-callstack-library-primary))',
      icon: 'rgb(var(--game-callstack-library-primary))',
      text: isDarkMode ? 'rgb(var(--game-callstack-library-primary))' : 'rgb(29, 78, 216)'
    },
    hint: {
      bg: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgb(237, 233, 254)',
      border: '2px solid rgb(var(--game-callstack-library-stage-advanced))',
      icon: 'rgb(var(--game-callstack-library-stage-advanced))',
      text: isDarkMode ? 'rgb(var(--game-callstack-library-stage-advanced))' : 'rgb(109, 40, 217)'
    },
    progress: {
      bg: isDarkMode ? 'rgba(79, 70, 229, 0.1)' : 'rgb(238, 242, 255)',
      border: '2px solid rgb(79, 70, 229)',
      icon: 'rgb(79, 70, 229)',
      text: isDarkMode ? 'rgb(129, 140, 248)' : 'rgb(67, 56, 202)'
    }
  }), [isDarkMode]);

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
    const styles = feedbackStyles[item.type];
    
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
          'pointer-events-auto mb-3 max-w-sm overflow-hidden rounded-lg shadow-lg backdrop-blur-sm',
          compactMode ? 'p-3' : 'p-4'
        )}
        style={{
          backgroundColor: styles.bg,
          border: styles.border,
          boxShadow: 'var(--game-callstack-library-shadow-card)'
        }}
      >
        <div className="flex items-start">
          {/* 아이콘 */}
          <div className={cn('flex-shrink-0', compactMode ? 'mr-2' : 'mr-3')}>
            <IconComponent 
              className={cn(
                compactMode ? 'h-4 w-4' : 'h-5 w-5'
              )}
              style={{ color: styles.icon }}
            />
          </div>
          
          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 
                  className={cn(
                    'font-medium',
                    compactMode ? 'text-sm' : 'text-sm'
                  )}
                  style={{ color: styles.text }}
                >
                  {item.title}
                </h4>
                <p 
                  className={cn(
                    'mt-1',
                    compactMode ? 'text-xs' : 'text-sm'
                  )}
                  style={{ 
                    color: styles.text,
                    opacity: 0.9
                  }}
                >
                  {item.message}
                </p>
                
                {/* 추가 세부사항 */}
                {item.details && (
                  <p 
                    className="mt-1 text-xs"
                    style={{ 
                      color: styles.text,
                      opacity: 0.75
                    }}
                  >
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
                  className="ml-2 p-1 opacity-60 hover:opacity-100"
                  style={{ color: styles.text }}
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
                  className="text-xs"
                  style={{ color: styles.text }}
                >
                  {item.action.label}
                </AccessibleButton>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [feedbackIcons, feedbackStyles, position, compactMode, removeFeedback]);

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
            className="p-2 backdrop-blur-sm rounded-lg shadow-sm"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }}
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
            className="p-2 backdrop-blur-sm rounded-lg shadow-sm"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }}
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