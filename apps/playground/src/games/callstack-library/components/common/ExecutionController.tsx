/**
 * 실행 컨트롤러 공통 컴포넌트
 * 게임 실행 제어를 위한 재사용 가능한 컨트롤 패널
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack,
  FastForward,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useCallStackLibraryTheme } from '../../hooks/useCallStackLibraryTheme';
import { AccessibleButton, AccessibleButtonGroup } from '../ui/AccessibleButton';
import { useLiveRegion } from '../../hooks/useKeyboardNavigation';
import { CALLSTACK_LIBRARY_ARIA_LABELS } from '../../utils/ariaUtils';

// 실행 속도 옵션
export const EXECUTION_SPEEDS = [
  { value: 0.5, label: '0.5x', description: '느리게' },
  { value: 1, label: '1x', description: '보통' },
  { value: 1.5, label: '1.5x', description: '빠르게' },
  { value: 2, label: '2x', description: '매우 빠르게' }
] as const;

export type ExecutionSpeed = typeof EXECUTION_SPEEDS[number]['value'];

interface ExecutionControllerProps {
  // 상태
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  executionSpeed: ExecutionSpeed;
  soundEnabled?: boolean;
  
  // 핸들러
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: ExecutionSpeed) => void;
  onSoundToggle?: () => void;
  
  // 옵션
  variant?: 'default' | 'compact' | 'minimal';
  showStepControls?: boolean;
  showSpeedControl?: boolean;
  showSoundControl?: boolean;
  showProgress?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 실행 컨트롤러 컴포넌트
 */
export const ExecutionController = memo<ExecutionControllerProps>(({
  isPlaying,
  isPaused,
  currentStep,
  totalSteps,
  executionSpeed,
  soundEnabled = true,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onSoundToggle,
  variant = 'default',
  showStepControls = true,
  showSpeedControl = true,
  showSoundControl = false,
  showProgress = true,
  disabled = false,
  className
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  const announce = useLiveRegion('polite');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // 상태에 따른 메인 액션
  const mainAction = isPlaying && !isPaused ? 'pause' : 'play';
  
  // 진행률 계산
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  
  // 핸들러
  const handleMainAction = () => {
    if (mainAction === 'play') {
      onPlay();
      announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.executing);
    } else {
      onPause();
      announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.paused);
    }
  };
  
  const handleReset = () => {
    onReset();
    announce(CALLSTACK_LIBRARY_ARIA_LABELS.controls.reset);
  };
  
  const handleStepForward = () => {
    onStepForward();
    announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.stepChange(currentStep + 1, totalSteps));
  };
  
  const handleStepBackward = () => {
    onStepBackward();
    announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.stepChange(currentStep - 1, totalSteps));
  };
  
  const handleSpeedChange = (speed: ExecutionSpeed) => {
    onSpeedChange(speed);
    setShowSpeedMenu(false);
    announce(`실행 속도 ${speed}x로 변경됨`);
  };
  
  const handleSoundToggle = () => {
    onSoundToggle?.();
    announce(soundEnabled ? '소리 끔' : '소리 켬');
  };

  // 컴팩트 변형
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <AccessibleButton
          size="sm"
          variant={mainAction === 'play' ? 'primary' : 'secondary'}
          label={mainAction === 'play' ? '재생' : '일시정지'}
          onClick={handleMainAction}
          disabled={disabled}
        >
          {mainAction === 'play' ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </AccessibleButton>
        
        <AccessibleButton
          size="sm"
          variant="ghost"
          label="초기화"
          onClick={handleReset}
          disabled={disabled || isPlaying}
        >
          <RotateCcw className="w-4 h-4" />
        </AccessibleButton>
        
        {showProgress && (
          <div className="text-xs">
            {currentStep}/{totalSteps}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'rounded-lg border p-4',
        variant === 'compact' && 'p-3',
        className
      )}
      style={{
        backgroundColor: libraryTheme.getLibraryBackground(),
        borderColor: libraryTheme.getQueueBorder('callstack')
      }}
    >
      {/* 진행률 표시 */}
      {showProgress && variant === 'default' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">실행 진행률</span>
            <span className="text-sm">
              {currentStep}/{totalSteps} ({Math.round(progress)}%)
            </span>
          </div>
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: libraryTheme.getQueueColor('callstack', 'light') }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: libraryTheme.getQueueColor('callstack', 'button') }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      
      {/* 컨트롤 버튼들 */}
      <AccessibleButtonGroup
        orientation="horizontal"
        label="실행 컨트롤"
        className={cn(
          'flex-wrap',
          variant === 'compact' ? 'gap-1' : 'gap-2'
        )}
      >
        {/* 스텝 뒤로 */}
        {showStepControls && (
          <AccessibleButton
            size={variant === 'compact' ? 'sm' : 'md'}
            variant="secondary"
            label="이전 단계"
            onClick={handleStepBackward}
            disabled={disabled || currentStep === 0}
          >
            <SkipBack className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
          </AccessibleButton>
        )}
        
        {/* 메인 액션 (재생/일시정지) */}
        <AccessibleButton
          size={variant === 'compact' ? 'sm' : 'md'}
          variant="primary"
          label={mainAction === 'play' ? '재생' : '일시정지'}
          onClick={handleMainAction}
          disabled={disabled}
          className={variant === 'default' ? 'px-6' : undefined}
        >
          {mainAction === 'play' ? (
            <Play className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
          ) : (
            <Pause className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
          )}
          {variant === 'default' && (
            <span className="ml-2">
              {mainAction === 'play' ? '재생' : '일시정지'}
            </span>
          )}
        </AccessibleButton>
        
        {/* 스텝 앞으로 */}
        {showStepControls && (
          <AccessibleButton
            size={variant === 'compact' ? 'sm' : 'md'}
            variant="secondary"
            label="다음 단계"
            onClick={handleStepForward}
            disabled={disabled || currentStep >= totalSteps - 1}
          >
            <SkipForward className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
          </AccessibleButton>
        )}
        
        {/* 초기화 */}
        <AccessibleButton
          size={variant === 'compact' ? 'sm' : 'md'}
          variant="danger"
          label="초기화"
          onClick={handleReset}
          disabled={disabled || isPlaying}
        >
          <RotateCcw className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
          {variant === 'default' && <span className="ml-2">초기화</span>}
        </AccessibleButton>
        
        {/* 속도 조절 */}
        {showSpeedControl && (
          <div className="relative">
            <AccessibleButton
              size={variant === 'compact' ? 'sm' : 'md'}
              variant="secondary"
              label={`실행 속도: ${executionSpeed}x`}
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              disabled={disabled}
            >
              <FastForward className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
              {variant === 'default' && <span className="ml-2">{executionSpeed}x</span>}
            </AccessibleButton>
            
            {/* 속도 메뉴 */}
            <AnimatePresence>
              {showSpeedMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-2 left-0 z-10"
                  style={{
                    backgroundColor: libraryTheme.getLibraryBackground(),
                    border: `1px solid ${libraryTheme.getQueueBorder('callstack')}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(var(--foreground), 0.1)'
                  }}
                >
                  <div className="p-2 space-y-1">
                    {EXECUTION_SPEEDS.map((speed) => (
                      <button
                        key={speed.value}
                        className={cn(
                          'w-full px-3 py-2 text-left rounded transition-colors text-sm'
                        )}
                        style={{
                          backgroundColor: executionSpeed === speed.value 
                            ? 'rgb(var(--muted))' 
                            : 'transparent'
                        }}
                        onClick={() => handleSpeedChange(speed.value)}
                      >
                        <div className="font-medium">{speed.label}</div>
                        <div className="text-xs opacity-75">{speed.description}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* 소리 켜기/끄기 */}
        {showSoundControl && onSoundToggle && (
          <AccessibleButton
            size={variant === 'compact' ? 'sm' : 'md'}
            variant="ghost"
            label={soundEnabled ? '소리 끄기' : '소리 켜기'}
            onClick={handleSoundToggle}
            disabled={disabled}
          >
            {soundEnabled ? (
              <Volume2 className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : (
              <VolumeX className={variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
            )}
          </AccessibleButton>
        )}
      </AccessibleButtonGroup>
      
      {/* 현재 단계 정보 (컴팩트 모드) */}
      {showProgress && variant === 'compact' && (
        <div className="mt-2 text-center text-sm">
          단계: {currentStep}/{totalSteps}
        </div>
      )}
    </div>
  );
});

ExecutionController.displayName = 'ExecutionController';

/**
 * 단계별 네비게이션 컴포넌트
 */
interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  onStepSelect: (step: number) => void;
  disabled?: boolean;
  className?: string;
}

export const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  onStepSelect,
  disabled = false,
  className
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  
  return (
    <div 
      className={cn('flex items-center gap-2 overflow-x-auto', className)}
      role="navigation"
      aria-label="단계 네비게이션"
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;
        const label = stepLabels?.[index] || `단계 ${index + 1}`;
        
        return (
          <button
            key={index}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium',
              'transition-all focus:outline-none focus:ring-2',
              isActive && 'ring-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              backgroundColor: isActive
                ? libraryTheme.getQueueColor('callstack', 'button')
                : isPast
                ? libraryTheme.getQueueTheme('callstack').secondary
                : libraryTheme.getQueueColor('callstack', 'light'),
              color: isActive || isPast
                ? libraryTheme.getQueueText('callstack', 'contrast')
                : libraryTheme.getQueueText('callstack', 'primary'),
              ['--tw-ring-color' as any]: libraryTheme.getQueueColor('callstack', 'button')
            }}
            onClick={() => onStepSelect(index)}
            disabled={disabled}
            aria-current={isActive ? 'step' : undefined}
            aria-label={label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};