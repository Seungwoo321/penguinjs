/**
 * 진행 상태 표시기 공통 컴포넌트
 * 게임 진행률, 단계별 상태 등을 표시하는 재사용 가능한 컴포넌트
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useCallStackLibraryTheme } from '../../hooks/useCallStackLibraryTheme';
import { createProgressAttributes } from '../../utils/ariaUtils';

// 진행 상태 타입
export type ProgressStatus = 'locked' | 'available' | 'current' | 'completed';

// 단계 정보 인터페이스
export interface StepInfo {
  id: string | number;
  label: string;
  description?: string;
  status: ProgressStatus;
  score?: number;
  hintsUsed?: number;
}

// 진행률 표시 변형
type ProgressVariant = 'linear' | 'circular' | 'steps' | 'dots';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  variant?: ProgressVariant;
  label?: string;
  showPercentage?: boolean;
  showSteps?: boolean;
  animated?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 진행률 표시기 컴포넌트
 */
export const ProgressIndicator = memo<ProgressIndicatorProps>(({
  current,
  total,
  variant = 'linear',
  label = '진행률',
  showPercentage = true,
  showSteps = false,
  animated = true,
  color = 'primary',
  size = 'md',
  className
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  const percentage = Math.round((current / total) * 100);
  
  // 색상 매핑
  const colorMap = {
    primary: libraryTheme.getQueueColor('callstack', 'button'),
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };
  
  const progressColor = colorMap[color];
  
  // 크기 매핑
  const sizeMap = {
    sm: { height: 4, fontSize: '12px' },
    md: { height: 8, fontSize: '14px' },
    lg: { height: 12, fontSize: '16px' }
  };
  
  const currentSize = sizeMap[size];

  switch (variant) {
    case 'linear':
      return (
        <div className={cn('w-full', className)}>
          {(label || showSteps || showPercentage) && (
            <div className="flex justify-between items-center mb-2">
              {label && (
                <span 
                  className="font-medium"
                  style={{ fontSize: currentSize.fontSize }}
                >
                  {label}
                </span>
              )}
              <div className="flex items-center gap-2">
                {showSteps && (
                  <span 
                    className="text-sm"
                    style={{ color: libraryTheme.getQueueText('callstack', 'secondary') }}
                  >
                    {current}/{total}
                  </span>
                )}
                {showPercentage && (
                  <span 
                    className="font-medium"
                    style={{ fontSize: currentSize.fontSize }}
                  >
                    {percentage}%
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div 
            className="w-full rounded-full overflow-hidden"
            style={{ 
              height: currentSize.height,
              backgroundColor: libraryTheme.getQueueColor('callstack', 'light') 
            }}
            {...createProgressAttributes(current, total, label)}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: progressColor }}
              initial={animated ? { width: 0 } : { width: `${percentage}%` }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      );
      
    case 'circular':
      const radius = size === 'sm' ? 30 : size === 'lg' ? 50 : 40;
      const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      
      return (
        <div 
          className={cn('relative inline-flex', className)}
          {...createProgressAttributes(current, total, label)}
        >
          <svg
            width={(radius + strokeWidth) * 2}
            height={(radius + strokeWidth) * 2}
            className="transform -rotate-90"
          >
            {/* 배경 원 */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={libraryTheme.getQueueColor('callstack', 'light')}
              fill="none"
            />
            {/* 진행 원 */}
            <motion.circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              strokeWidth={strokeWidth}
              stroke={progressColor}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="font-bold"
                style={{ fontSize: currentSize.fontSize }}
              >
                {percentage}%
              </span>
            </div>
          )}
        </div>
      );
      
    case 'dots':
      return (
        <div 
          className={cn('flex items-center gap-1', className)}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label}
        >
          {Array.from({ length: total }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'rounded-full',
                size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
              )}
              style={{
                backgroundColor: index < current
                  ? progressColor
                  : libraryTheme.getQueueColor('callstack', 'light')
              }}
              initial={animated ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>
      );
      
    default:
      return null;
  }
});

ProgressIndicator.displayName = 'ProgressIndicator';

/**
 * 단계별 진행 표시기 컴포넌트
 */
interface StepProgressIndicatorProps {
  steps: StepInfo[];
  currentStepId?: string | number;
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  showDescriptions?: boolean;
  onStepClick?: (step: StepInfo) => void;
  className?: string;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  steps,
  currentStepId,
  orientation = 'horizontal',
  showConnectors = true,
  showDescriptions = false,
  onStepClick,
  className
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  
  const getStepIcon = (status: ProgressStatus) => {
    switch (status) {
      case 'completed':
        return Check;
      case 'locked':
        return Lock;
      default:
        return Circle;
    }
  };
  
  const getStepColor = (status: ProgressStatus) => {
    switch (status) {
      case 'completed':
        return 'rgb(var(--game-callstack-library-success))';
      case 'current':
        return libraryTheme.getQueueColor('callstack', 'button');
      case 'available':
        return libraryTheme.getQueueColor('callstack', 'main');
      default:
        return libraryTheme.getQueueColor('callstack', 'light');
    }
  };

  return (
    <div 
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
        className
      )}
      role="navigation"
      aria-label="진행 단계"
    >
      {steps.map((step, index) => {
        const Icon = getStepIcon(step.status);
        const color = getStepColor(step.status);
        const isClickable = step.status !== 'locked' && onStepClick;
        const isCurrent = step.id === currentStepId;
        
        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex items-center',
                orientation === 'vertical' && 'flex-col',
                isClickable && 'cursor-pointer hover:opacity-80'
              )}
              onClick={() => isClickable && onStepClick(step)}
              role="button"
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${step.label} - ${step.status}`}
              tabIndex={isClickable ? 0 : -1}
            >
              {/* 단계 아이콘 */}
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-full',
                  'w-10 h-10 border-2',
                  isCurrent && 'ring-4 ring-opacity-30'
                )}
                style={{
                  borderColor: color,
                  backgroundColor: step.status === 'completed' ? color : 'transparent',
                  ['--tw-ring-color' as any]: color
                }}
                whileHover={isClickable ? { scale: 1.1 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
              >
                <Icon 
                  className="w-5 h-5"
                  style={{ 
                    color: step.status === 'completed' 
                      ? 'rgb(255, 255, 255)' 
                      : color 
                  }}
                />
              </motion.div>
              
              {/* 단계 정보 */}
              <div 
                className={cn(
                  'text-center',
                  orientation === 'horizontal' ? 'ml-2' : 'mt-2'
                )}
              >
                <div 
                  className="font-medium text-sm"
                  style={{ color }}
                >
                  {step.label}
                </div>
                {showDescriptions && step.description && (
                  <div 
                    className="text-xs mt-1"
                    style={{ 
                      color: libraryTheme.getQueueText('callstack', 'secondary') 
                    }}
                  >
                    {step.description}
                  </div>
                )}
                {step.score !== undefined && (
                  <div className="text-xs mt-1">
                    점수: {step.score}점
                  </div>
                )}
              </div>
            </div>
            
            {/* 연결선 */}
            {showConnectors && index < steps.length - 1 && (
              <div
                className={cn(
                  orientation === 'horizontal' 
                    ? 'flex-1 h-0.5 mx-2' 
                    : 'w-0.5 flex-1 my-2'
                )}
                style={{
                  backgroundColor: steps[index + 1].status !== 'locked'
                    ? color
                    : libraryTheme.getQueueColor('callstack', 'light')
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * 성취도 표시 컴포넌트
 */
interface AchievementIndicatorProps {
  title: string;
  current: number;
  total: number;
  icon?: React.ReactNode;
  showBadge?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const AchievementIndicator: React.FC<AchievementIndicatorProps> = ({
  title,
  current,
  total,
  icon,
  showBadge = true,
  variant = 'default',
  className
}) => {
  const libraryTheme = useCallStackLibraryTheme();
  const percentage = (current / total) * 100;
  const isComplete = current >= total;
  
  return (
    <div 
      className={cn(
        'flex items-center gap-3',
        variant === 'compact' ? 'p-2' : 'p-4',
        'rounded-lg border',
        className
      )}
      style={{
        backgroundColor: libraryTheme.getQueueColor('callstack', 'light'),
        borderColor: libraryTheme.getQueueBorder('callstack')
      }}
    >
      {/* 아이콘 */}
      {icon && (
        <div className={cn(
          'flex-shrink-0',
          variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12'
        )}>
          {icon}
        </div>
      )}
      
      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            'font-medium',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {title}
          </h4>
          {showBadge && isComplete && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              완료
            </span>
          )}
        </div>
        
        <div className="mt-1">
          <ProgressIndicator
            current={current}
            total={total}
            size="sm"
            showPercentage={false}
            showSteps={true}
            color={isComplete ? 'success' : 'primary'}
          />
        </div>
      </div>
      
      {/* 퍼센트 */}
      {variant === 'default' && (
        <div className="text-right">
          <div className="text-2xl font-bold">
            {Math.round(percentage)}%
          </div>
        </div>
      )}
    </div>
  );
};