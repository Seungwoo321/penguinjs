/**
 * 학습 도우미 시스템
 * 적응형 힌트, 개념 설명, 학습 진행률 추적을 제공하는 AI 학습 도우미
 */

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Target, 
  TrendingUp,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Clock,
  HelpCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '@penguinjs/ui';
import { useDesignTokens } from '@/games/callstack-library/components/ui/DesignSystemProvider';
import { useCallStackLibraryContext } from '@/games/callstack-library/contexts/CallStackLibraryContext';
import { useDarkModeDetection } from '@/games/callstack-library/hooks/useCSSThemeSync';
import { gameEvents } from '@/games/callstack-library/utils/eventSystem';
import { AccessibleButton } from '@/games/callstack-library/components/ui/AccessibleButton';
import { ProgressIndicator } from '@/games/callstack-library/components/common/ProgressIndicator';

// 학습 컨셉 타입
export interface LearningConcept {
  id: string;
  name: string;
  category: 'basic' | 'intermediate' | 'advanced';
  description: string;
  examples: string[];
  relatedConcepts: string[];
  difficulty: number; // 1-10
  masteryThreshold: number; // 정확도 %
}

// 적응형 힌트 타입
export interface AdaptiveHint {
  id: string;
  conceptId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'concept' | 'strategy' | 'example' | 'encouragement';
  title: string;
  content: string;
  visualAid?: {
    type: 'diagram' | 'animation' | 'code';
    data: any;
  };
  prerequisites?: string[];
  followUp?: string[];
  effectiveness: number; // 0-1
}

// 학습 상태
export interface LearningState {
  conceptMastery: Record<string, number>; // 개념별 숙련도 (0-1)
  strugglingAreas: string[];
  strengths: string[];
  learningPath: string[];
  recommendedNext: string[];
  timeSpent: Record<string, number>; // 개념별 학습 시간 (분)
  attemptHistory: Array<{
    conceptId: string;
    success: boolean;
    timestamp: Date;
    hintsUsed: number;
  }>;
}

// 도우미 모드
export type AssistantMode = 'minimal' | 'helpful' | 'detailed' | 'coaching';

// 학습 도우미 Props
interface LearningAssistantProps {
  className?: string;
  mode?: AssistantMode;
  position?: 'bottom-right' | 'side-panel' | 'floating';
  showProgress?: boolean;
  personalizedHints?: boolean;
}

/**
 * 학습 도우미 컴포넌트
 */
export const LearningAssistant = memo<LearningAssistantProps>(({
  className,
  mode = 'helpful',
  position = 'bottom-right',
  showProgress = true,
  personalizedHints = true
}) => {
  const designTokens = useDesignTokens();
  const { state, dispatch } = useCallStackLibraryContext();
  const isDarkMode = useDarkModeDetection();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentHint, setCurrentHint] = useState<AdaptiveHint | null>(null);
  const [learningState, setLearningState] = useState<LearningState>({
    conceptMastery: {},
    strugglingAreas: [],
    strengths: [],
    learningPath: [],
    recommendedNext: [],
    timeSpent: {},
    attemptHistory: []
  });
  const [showConceptExplainer, setShowConceptExplainer] = useState(false);
  const [activeTab, setActiveTab] = useState<'hints' | 'progress' | 'concepts'>('hints');

  // 학습 컨셉 정의
  const concepts: LearningConcept[] = useMemo(() => [
    {
      id: 'callstack',
      name: '콜스택',
      category: 'basic',
      description: '함수 호출이 저장되는 LIFO(Last In First Out) 구조',
      examples: ['함수 호출', '실행 컨텍스트', '스택 오버플로우'],
      relatedConcepts: ['execution-context', 'scope'],
      difficulty: 3,
      masteryThreshold: 80
    },
    {
      id: 'event-loop',
      name: '이벤트 루프',
      category: 'intermediate',
      description: '비동기 작업을 처리하는 JavaScript의 핵심 메커니즘',
      examples: ['setTimeout', 'Promise', 'async/await'],
      relatedConcepts: ['microtask', 'macrotask', 'callstack'],
      difficulty: 7,
      masteryThreshold: 75
    },
    {
      id: 'microtask',
      name: '마이크로태스크',
      category: 'intermediate',
      description: 'Promise와 같은 높은 우선순위의 비동기 작업',
      examples: ['Promise.then', 'queueMicrotask', 'async/await'],
      relatedConcepts: ['event-loop', 'macrotask'],
      difficulty: 6,
      masteryThreshold: 75
    },
    {
      id: 'macrotask',
      name: '매크로태스크',
      category: 'basic',
      description: 'setTimeout과 같은 일반적인 비동기 작업',
      examples: ['setTimeout', 'setInterval', 'DOM events'],
      relatedConcepts: ['event-loop', 'microtask'],
      difficulty: 4,
      masteryThreshold: 80
    }
  ], []);

  // 적응형 힌트 생성
  const generateHint = useCallback((conceptId: string, userLevel: 'beginner' | 'intermediate' | 'advanced'): AdaptiveHint | null => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return null;

    const hintMap: Record<string, Record<string, AdaptiveHint>> = {
      'callstack': {
        'beginner': {
          id: 'callstack-basic',
          conceptId: 'callstack',
          level: 'beginner',
          type: 'concept',
          title: '콜스택 기초',
          content: '콜스택은 도서관의 책 더미와 같습니다. 새로운 책(함수)을 맨 위에 올리고, 읽을 때는 맨 위부터 가져갑니다.',
          effectiveness: 0.9
        },
        'intermediate': {
          id: 'callstack-intermediate',
          conceptId: 'callstack',
          level: 'intermediate',
          type: 'strategy',
          title: '콜스택 실행 순서',
          content: '함수 호출 시 새 실행 컨텍스트가 스택에 추가되고, 함수 완료 시 제거됩니다. 이는 LIFO 원칙을 따릅니다.',
          effectiveness: 0.8
        },
        'advanced': {
          id: 'callstack-advanced',
          conceptId: 'callstack',
          level: 'advanced',
          type: 'example',
          title: '콜스택과 스코프 체인',
          content: '각 실행 컨텍스트는 고유한 스코프를 가지며, 변수 조회 시 스코프 체인을 따라 상위 스코프로 이동합니다.',
          effectiveness: 0.7
        }
      },
      'event-loop': {
        'beginner': {
          id: 'eventloop-basic',
          conceptId: 'event-loop',
          level: 'beginner',
          type: 'concept',
          title: '이벤트 루프란?',
          content: '이벤트 루프는 도서관 사서와 같습니다. 메인 업무(콜스택)를 우선 처리하고, 예약된 업무들을 순서대로 처리합니다.',
          effectiveness: 0.9
        },
        'intermediate': {
          id: 'eventloop-intermediate',
          conceptId: 'event-loop',
          level: 'intermediate',
          type: 'strategy',
          title: '이벤트 루프 실행 단계',
          content: '1) 콜스택 확인 → 2) 마이크로태스크 큐 처리 → 3) 매크로태스크 큐에서 하나 처리 → 반복',
          effectiveness: 0.8
        }
      }
    };

    return hintMap[conceptId]?.[userLevel] || null;
  }, [concepts]);

  // 사용자 수준 분석
  const analyzeUserLevel = useCallback((conceptId: string): 'beginner' | 'intermediate' | 'advanced' => {
    const mastery = learningState.conceptMastery[conceptId] || 0;
    const timeSpent = learningState.timeSpent[conceptId] || 0;
    
    if (mastery < 0.3 || timeSpent < 5) return 'beginner';
    if (mastery < 0.7 || timeSpent < 15) return 'intermediate';
    return 'advanced';
  }, [learningState]);

  // 힌트 요청 처리
  const requestHint = useCallback((conceptId?: string) => {
    const targetConcept = conceptId || getCurrentConcept();
    if (!targetConcept) return;

    const userLevel = analyzeUserLevel(targetConcept);
    const hint = generateHint(targetConcept, userLevel);
    
    if (hint) {
      setCurrentHint(hint);
      setIsExpanded(true);
      
      // 힌트 사용 기록
      setLearningState(prev => ({
        ...prev,
        attemptHistory: [...prev.attemptHistory, {
          conceptId: targetConcept,
          success: false, // 힌트 요청은 실패로 간주
          timestamp: new Date(),
          hintsUsed: 1
        }]
      }));
      
      gameEvents.hintShown(hint.id, 0);
    }
  }, [analyzeUserLevel, generateHint]);

  // 현재 학습 중인 컨셉 감지
  const getCurrentConcept = useCallback((): string | null => {
    const currentStage = state.currentStage || 1;
    
    // 스테이지별 주요 컨셉 매핑
    if (currentStage <= 5) return 'callstack';
    if (currentStage <= 15) return 'macrotask';
    if (currentStage <= 20) return 'microtask';
    return 'event-loop';
  }, [state.currentStage]);

  // 학습 진행 상황 업데이트
  const updateLearningProgress = useCallback((conceptId: string, success: boolean) => {
    setLearningState(prev => {
      const currentMastery = prev.conceptMastery[conceptId] || 0;
      const newMastery = success 
        ? Math.min(1, currentMastery + 0.1)
        : Math.max(0, currentMastery - 0.05);

      const newStruggling = newMastery < 0.5 && !prev.strugglingAreas.includes(conceptId)
        ? [...prev.strugglingAreas, conceptId]
        : prev.strugglingAreas.filter(id => id !== conceptId || newMastery < 0.5);

      const newStrengths = newMastery > 0.8 && !prev.strengths.includes(conceptId)
        ? [...prev.strengths, conceptId]
        : prev.strengths.filter(id => id !== conceptId || newMastery > 0.8);

      return {
        ...prev,
        conceptMastery: {
          ...prev.conceptMastery,
          [conceptId]: newMastery
        },
        strugglingAreas: newStruggling,
        strengths: newStrengths,
        attemptHistory: [...prev.attemptHistory, {
          conceptId,
          success,
          timestamp: new Date(),
          hintsUsed: 0
        }]
      };
    });
  }, []);

  // 게임 이벤트 리스너 (단순화)
  useEffect(() => {
    // 기본 학습 진행 상황 업데이트
    const currentConcept = getCurrentConcept();
    if (currentConcept) {
      setLearningState(prev => ({
        ...prev,
        [currentConcept]: {
          ...prev[currentConcept],
          attempts: prev[currentConcept]?.attempts || 0
        }
      }));
    }
  }, [getCurrentConcept]);

  // 추천 다음 단계
  const getRecommendations = useCallback((): string[] => {
    const struggling = learningState.strugglingAreas;
    const strengths = learningState.strengths;
    
    if (struggling.length > 0) {
      return [`${struggling[0]} 개념을 더 연습해보세요`];
    }
    
    if (strengths.includes('callstack') && !strengths.includes('macrotask')) {
      return ['매크로태스크 개념으로 넘어가보세요'];
    }
    
    return ['현재 학습을 잘 진행하고 있습니다!'];
  }, [learningState]);

  // 위치별 스타일
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'side-panel':
        return 'fixed right-0 top-1/2 transform -translate-y-1/2 z-50';
      case 'floating':
        return 'fixed bottom-1/4 right-8 z-50';
      default:
        return 'fixed bottom-4 right-4 z-50';
    }
  };

  // 모드별 동작 - early return 제거
  const shouldShow = useMemo(() => {
    switch (mode) {
      case 'minimal': return false;
      case 'helpful': return true;
      case 'detailed': return true;
      case 'coaching': return true;
      default: return true;
    }
  }, [mode]);

  // Hook 규칙 준수를 위해 early return 대신 조건부 렌더링 사용
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={cn(getPositionStyles(), className)}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="rounded-lg shadow-xl border max-w-md w-80"
            style={{ backgroundColor: 'rgb(var(--game-callstack-library-bg-main))', borderColor: 'rgb(var(--game-callstack-library-border-default))' }}
          >
            {/* 헤더 */}
            <div className="p-4 border-b" style={{ 
              borderBottomColor: 'rgb(var(--game-callstack-library-border-default))',
              background: 'linear-gradient(to right, rgb(var(--game-callstack-library-bg-secondary)), rgb(var(--game-callstack-library-bg-secondary)))'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" style={{ color: 'rgb(var(--game-callstack-library-primary))' }} />
                  <h3 className="font-semibold" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>학습 도우미</h3>
                </div>
                <AccessibleButton
                  size="sm"
                  variant="ghost"
                  label="도우미 닫기"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="w-4 h-4" />
                </AccessibleButton>
              </div>
              
              {/* 탭 메뉴 */}
              <div className="flex mt-3 space-x-1">
                {(['hints', 'progress', 'concepts'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full transition-colors',
                      activeTab === tab
                        ? ''
                        : 'hover:opacity-80'
                    )}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      backgroundColor: activeTab === tab ? 'rgb(var(--game-callstack-library-primary))' : 'rgb(var(--game-callstack-library-bg-secondary))',
                      color: activeTab === tab ? 'white' : 'rgb(var(--game-callstack-library-text-secondary))'
                    }}
                  >
                    {tab === 'hints' && '힌트'}
                    {tab === 'progress' && '진행'}
                    {tab === 'concepts' && '개념'}
                  </button>
                ))}
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {activeTab === 'hints' && (
                <div className="space-y-3">
                  {currentHint ? (
                    <div className="border rounded-lg p-3" style={{ 
                      backgroundColor: 'rgba(var(--game-callstack-library-warning-rgb), 0.2)',
                      borderColor: 'rgba(var(--game-callstack-library-warning-rgb), 0.4)'
                    }}>
                      <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'rgb(var(--game-callstack-library-warning))' }} />
                        <div>
                          <h4 className="font-medium mb-1" style={{ color: 'rgb(var(--game-callstack-library-warning))' }}>
                            {currentHint.title}
                          </h4>
                          <p className="text-sm" style={{ color: 'rgb(var(--game-callstack-library-warning))' }}>
                            {currentHint.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgb(var(--game-callstack-library-text-muted))' }} />
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>
                        막히는 부분이 있으신가요?
                      </p>
                      <AccessibleButton
                        size="sm"
                        variant="primary"
                        label="힌트 요청하기"
                        onClick={() => requestHint()}
                      >
                        <Lightbulb className="w-4 h-4 mr-1" />
                        힌트 요청
                      </AccessibleButton>
                    </div>
                  )}
                  
                  {/* 추천 사항 */}
                  <div className="mt-4">
                    <h5 className="text-xs font-semibold mb-2 flex items-center" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      추천사항
                    </h5>
                    <div className="space-y-1">
                      {getRecommendations().map((rec, index) => (
                        <p key={index} className="text-xs p-2 rounded" style={{ 
                          color: 'rgb(var(--game-callstack-library-text-secondary))',
                          backgroundColor: 'rgba(var(--game-callstack-library-primary-rgb), 0.2)'
                        }}>
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-4">
                  {/* 현재 개념 진행률 */}
                  <div>
                    <h5 className="text-sm font-semibold mb-2" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
                      현재 학습 개념
                    </h5>
                    {Object.entries(learningState.conceptMastery).map(([conceptId, mastery]) => {
                      const concept = concepts.find(c => c.id === conceptId);
                      if (!concept) return null;
                      
                      return (
                        <div key={conceptId} className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{concept.name}</span>
                            <span className="text-xs" style={{ color: 'rgb(var(--game-callstack-library-text-muted))' }}>
                              {Math.round(mastery * 100)}%
                            </span>
                          </div>
                          <ProgressIndicator
                            current={mastery * 100}
                            total={100}
                            size="sm"
                            showPercentage={false}
                            color={mastery > 0.8 ? 'success' : mastery > 0.5 ? 'primary' : 'warning'}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* 강점과 약점 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h6 className="text-xs font-semibold mb-1 flex items-center" style={{ color: 'rgb(var(--game-callstack-library-success))' }}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        강점
                      </h6>
                      <div className="space-y-1">
                        {learningState.strengths.map(conceptId => {
                          const concept = concepts.find(c => c.id === conceptId);
                          return concept ? (
                            <span key={conceptId} className="text-xs px-2 py-1 rounded block" style={{ 
                              backgroundColor: 'rgba(var(--game-callstack-library-success-rgb), 0.2)',
                              color: 'rgb(var(--game-callstack-library-success))'
                            }}>
                              {concept.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-xs font-semibold mb-1 flex items-center" style={{ color: 'rgb(var(--game-callstack-library-error))' }}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        개선 필요
                      </h6>
                      <div className="space-y-1">
                        {learningState.strugglingAreas.map(conceptId => {
                          const concept = concepts.find(c => c.id === conceptId);
                          return concept ? (
                            <span key={conceptId} className="text-xs px-2 py-1 rounded block" style={{ 
                              backgroundColor: 'rgba(var(--game-callstack-library-error-rgb), 0.2)',
                              color: 'rgb(var(--game-callstack-library-error))'
                            }}>
                              {concept.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'concepts' && (
                <div className="space-y-3">
                  {concepts.map(concept => (
                    <div
                      key={concept.id}
                      className="border rounded-lg p-3 cursor-pointer hover:opacity-80"
                      style={{ 
                        borderColor: 'rgb(var(--game-callstack-library-border-default))',
                        backgroundColor: 'rgba(var(--game-callstack-library-bg-secondary-rgb), 0.5)'
                      }}
                      onClick={() => setShowConceptExplainer(true)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm mb-1" style={{ color: 'rgb(var(--game-callstack-library-text-primary))' }}>
                            {concept.name}
                          </h5>
                          <p className="text-xs mb-2" style={{ color: 'rgb(var(--game-callstack-library-text-secondary))' }}>
                            {concept.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded',
                              ''
                            )}
                            style={{
                              backgroundColor: concept.category === 'basic' ? 'rgba(var(--game-callstack-library-success-rgb), 0.2)' :
                                             concept.category === 'intermediate' ? 'rgba(var(--game-callstack-library-warning-rgb), 0.2)' :
                                             'rgba(var(--game-callstack-library-error-rgb), 0.2)',
                              color: concept.category === 'basic' ? 'rgb(var(--game-callstack-library-success))' :
                                     concept.category === 'intermediate' ? 'rgb(var(--game-callstack-library-warning))' :
                                     'rgb(var(--game-callstack-library-error))'
                            }}>
                              {concept.category}
                            </span>
                            <div className="flex">
                              {Array.from({ length: Math.ceil(concept.difficulty / 2) }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" style={{ color: 'rgb(var(--game-callstack-library-warning))' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <BookOpen className="w-4 h-4" style={{ color: 'rgb(var(--game-callstack-library-text-muted))' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="p-3 rounded-full shadow-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: 'rgb(var(--game-callstack-library-primary))', color: 'white' }}
            aria-label="학습 도우미 열기"
          >
            <Brain className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

LearningAssistant.displayName = 'LearningAssistant';

// 타입 내보내기 제거 - 중복 선언 해결