/**
 * 접근성이 강화된 평가 패널 컴포넌트
 * WCAG 2.1 AA 준수, 폼 접근성 및 에러 처리 개선
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, HelpCircle, Play, RotateCcw, Send } from 'lucide-react';
import { cn, GamePanel } from '@penguinjs/ui';
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync';
import { useLiveRegion, useFocusTrap } from '@/games/callstack-library/hooks/useKeyboardNavigation';
import { 
  CALLSTACK_LIBRARY_ARIA_LABELS,
  createAlertAttributes,
  createDialogAttributes,
  srOnlyStyles
} from '@/games/callstack-library/utils/ariaUtils';
import { AccessibleButton, AccessibleButtonGroup } from './AccessibleButton';
import { EvaluationPanelProps, QueueValidationResult } from '@/games/callstack-library/types/layout';

interface AccessibleEvaluationPanelProps extends EvaluationPanelProps {
  onClose?: () => void;
  trapFocus?: boolean;
}

/**
 * 접근성 평가 패널 컴포넌트
 */
export const AccessibleEvaluationPanel: React.FC<AccessibleEvaluationPanelProps> = ({
  layoutType,
  evaluation,
  userAnswer,
  onSubmit,
  onHint,
  onSimulate,
  onReset,
  expectedCount,
  snapshotCheckpoints,
  validationResults,
  onClose,
  trapFocus = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDarkMode = useDarkModeDetection();
  const announce = useLiveRegion('assertive');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // 포커스 트랩 (모달 모드)
  useFocusTrap(containerRef, {
    enabled: trapFocus,
    onEscape: onClose
  });

  // 검증 결과 상태  
  const isCorrect = validationResults && Object.values(validationResults).some(v => v === true);
  const hasErrors = validationResults && Object.values(validationResults).some(v => v === false);
  
  // 제출 핸들러
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    announce('답안을 검증하고 있습니다...');
    
    try {
      await onSubmit();
      setShowResults(true);
      
      // 결과 알림
      if (isCorrect) {
        announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.success);
      } else {
        announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.incorrect);
      }
    } catch (error) {
      announce('제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 힌트 요청 핸들러
  const handleHint = () => {
    onHint?.();
    setHintsUsed(prev => prev + 1);
    announce(CALLSTACK_LIBRARY_ARIA_LABELS.status.hint(hintsUsed + 1));
  };

  // 시뮬레이션 실행 핸들러
  const handleSimulate = () => {
    onSimulate?.();
    announce('시뮬레이션을 실행합니다.');
  };

  // 초기화 핸들러
  const handleReset = () => {
    onReset?.();
    setShowResults(false);
    setHintsUsed(0);
    announce('게임이 초기화되었습니다.');
  };

  // 진행률 계산
  const progress = evaluation.checkSnapshots && snapshotCheckpoints
    ? (Object.values(snapshotCheckpoints).filter(Boolean).length / Object.keys(snapshotCheckpoints).length) * 100
    : 0;

  return (
    <div 
      ref={containerRef}
      className={cn('relative rounded-lg border', className)}
      style={{
        backgroundColor: 'rgb(var(--game-callstack-library-bg-main))',
        borderColor: 'rgb(var(--game-callstack-callstack-border))'
      }}
      {...(trapFocus && createDialogAttributes('평가 패널', 'evaluation-description'))}
    >
      <GamePanel
        title="📊 도서관 업무 평가"
        className="relative"
      >
      {/* 평가 설명 */}
      <div 
        id="evaluation-description"
        className="mb-4 p-4 rounded-lg"
        style={{
          backgroundColor: 'rgb(var(--game-callstack-callstack-light))',
          borderColor: 'rgb(var(--game-callstack-callstack-border))'
        }}
      >
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
          평가 방법
        </h3>
        <p className="text-sm">
          {evaluation.checkOrder && 
            '함수들의 실행 순서를 올바르게 배치하세요.'}
          {expectedCount && 
            `총 ${expectedCount}번의 실행이 필요합니다.`}
          {evaluation.checkSnapshots && 
            '각 단계별로 큐의 상태를 정확히 구성하세요.'}
          {evaluation.checkQueueStates && 
            '이벤트 루프의 각 큐 상태를 올바르게 구성하세요.'}
        </p>
      </div>

      {/* 진행률 표시 */}
      {evaluation.checkSnapshots && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm">{Math.round(progress)}%</span>
          </div>
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgb(var(--game-callstack-callstack-light))' }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="평가 진행률"
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: 'rgb(var(--game-callstack-callstack-button))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      <AnimatePresence>
        {hasErrors && showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: '#fee2e2',
              borderColor: '#fecaca',
              border: '1px solid'
            }}
            {...createAlertAttributes('검증 오류가 있습니다', true)}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 mb-1">검증 실패</p>
                <p className="text-sm text-red-700">
                  일부 단계에서 검증에 실패했습니다. 다시 확인해주세요.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성공 메시지 */}
      <AnimatePresence>
        {isCorrect && showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-4 rounded-lg"
            style={{
              backgroundColor: '#dcfce7',
              borderColor: '#bbf7d0',
              border: '1px solid'
            }}
            role="alert"
          >
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-900">
                  {CALLSTACK_LIBRARY_ARIA_LABELS.status.success}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  모든 큐의 상태가 정확합니다!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 액션 버튼들 */}
      <AccessibleButtonGroup
        orientation="horizontal"
        label="평가 액션"
        className="flex-wrap"
      >
        {/* 시뮬레이션 버튼 */}
        {onSimulate && (
          <AccessibleButton
            variant="secondary"
            size="md"
            leftIcon={<Play className="w-4 h-4" />}
            label="시뮬레이션 실행"
            description="코드를 실행하여 결과를 미리 확인합니다"
            onClick={handleSimulate}
            disabled={isSubmitting}
          >
            시뮬레이션
          </AccessibleButton>
        )}

        {/* 힌트 버튼 */}
        {onHint && (
          <AccessibleButton
            variant="secondary"
            size="md"
            leftIcon={<HelpCircle className="w-4 h-4" />}
            label="힌트 보기"
            description={`${hintsUsed}개의 힌트를 사용했습니다`}
            onClick={handleHint}
            disabled={isSubmitting || hintsUsed >= 3}
          >
            힌트 ({hintsUsed}/3)
          </AccessibleButton>
        )}

        {/* 초기화 버튼 */}
        {onReset && (
          <AccessibleButton
            variant="danger"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            label="게임 초기화"
            description="모든 답안을 초기화하고 처음부터 다시 시작합니다"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            초기화
          </AccessibleButton>
        )}

        {/* 제출 버튼 */}
        <AccessibleButton
          variant="primary"
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          label="답안 제출"
          description="작성한 답안을 검증하고 평가받습니다"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!userAnswer || Object.keys(userAnswer).length === 0}
          className="ml-auto"
        >
          제출
        </AccessibleButton>
      </AccessibleButtonGroup>

      {/* 힌트 사용 안내 (스크린 리더 전용) */}
      {hintsUsed > 0 && (
        <div style={srOnlyStyles} role="status">
          {hintsUsed}개의 힌트를 사용했습니다. 
          최대 3개까지 사용할 수 있습니다.
        </div>
      )}

      {/* 키보드 단축키 안내 (스크린 리더 전용) */}
      <div style={srOnlyStyles} role="region" aria-label="키보드 단축키">
        <h4>키보드 단축키:</h4>
        <ul>
          <li>Ctrl+Enter: 답안 제출</li>
          <li>Ctrl+H: 힌트 보기</li>
          <li>Ctrl+S: 시뮬레이션 실행</li>
          <li>Ctrl+R: 게임 초기화</li>
          {trapFocus && <li>Escape: 패널 닫기</li>}
        </ul>
      </div>
      </GamePanel>
    </div>
  );
};

/**
 * 검증 결과 표시 컴포넌트
 */
interface ValidationResultDisplayProps {
  result: any;
  queueType?: string;
}

export const ValidationResultDisplay: React.FC<ValidationResultDisplayProps> = ({
  result,
  queueType
}) => {
  const Icon = result.isValid ? Check : X;
  const colorClass = result.isValid ? 'text-green-600' : 'text-red-600';
  
  return (
    <div 
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg',
        result.isValid ? 'bg-green-50' : 'bg-red-50'
      )}
      role="status"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colorClass)} />
      <div className="flex-1">
        <p className={cn('font-medium', colorClass)}>
          {queueType ? `${queueType} 큐` : '검증'} 
          {result.isValid ? ' 통과' : ' 실패'}
        </p>
        {result.errors && result.errors.length > 0 && (
          <ul className="mt-1 text-sm space-y-0.5">
            {result.errors.map((error, index) => (
              <li key={index} className="text-gray-700">
                • {error}
              </li>
            ))}
          </ul>
        )}
        {result.hint && (
          <p className="mt-1 text-sm text-gray-600">
            💡 {result.hint}
          </p>
        )}
      </div>
    </div>
  );
};