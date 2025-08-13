'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Map, Target, Layers, ArrowRight, Code, Play, Zap } from 'lucide-react'
import { useClosureCaveTheme } from '@/games/closure-cave/hooks/useClosureCaveTheme'

interface GameGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  currentLevel?: number
}

export function GameGuideModal({ isOpen, onClose, onStart, difficulty = 'beginner', currentLevel = 1 }: GameGuideModalProps) {
  const theme = useClosureCaveTheme()
  const [currentStep, setCurrentStep] = useState(0)

  // 난이도별 동적 컨텐츠
  const getDifficultySpecificContent = () => {
    switch (difficulty) {
      case 'beginner':
        return {
          title: "클로저 기초 동굴",
          description: "클로저의 기본 개념을 학습하는 초급 단계입니다.",
          concepts: ["함수 스코프", "렉시컬 스코핑", "외부 변수 접근"],
          theory: "클로저는 함수가 자신이 생성될 때의 환경(렉시컬 환경)을 기억하는 기능입니다. 내부 함수가 외부 함수의 변수에 접근할 수 있게 해줍니다.",
          examples: [
            {
              concept: "기본 클로저",
              code: "function outer() {\n  let secret = 'treasure';\n  return function() {\n    return secret;\n  };\n}",
              explanation: "outer 함수의 secret 변수를 내부 함수에서 접근할 수 있습니다."
            }
          ]
        }
      case 'intermediate':
        return {
          title: "클로저 심화 동굴",
          description: "클로저의 고급 패턴을 학습하는 중급 단계입니다.",
          concepts: ["클로저 패턴", "모듈 패턴", "팩토리 함수", "데이터 은닉"],
          theory: "클로저를 활용하면 프라이빗 변수를 만들고 모듈 패턴을 구현할 수 있습니다. 이는 캡슐화와 정보 은닉을 가능하게 합니다.",
          examples: [
            {
              concept: "모듈 패턴",
              code: "function createCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n}",
              explanation: "count 변수는 외부에서 직접 접근할 수 없고, 반환된 메서드를 통해서만 조작할 수 있습니다."
            }
          ]
        }
      case 'advanced':
        return {
          title: "클로저 마스터 동굴",
          description: "클로저의 복잡한 활용법을 학습하는 고급 단계입니다.",
          concepts: ["클로저 메모리", "성능 최적화", "함수형 프로그래밍", "고차 함수"],
          theory: "고급 클로저 활용에는 메모이제이션, 커링, 부분 적용 등이 있습니다. 메모리 누수를 방지하고 성능을 최적화하는 방법도 중요합니다.",
          examples: [
            {
              concept: "메모이제이션",
              code: "function memoize(fn) {\n  const cache = {};\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (!(key in cache)) {\n      cache[key] = fn(...args);\n    }\n    return cache[key];\n  };\n}",
              explanation: "클로저를 사용해 함수의 결과를 캐싱하여 성능을 향상시킵니다."
            }
          ]
        }
      default:
        return {
          title: "클로저 동굴",
          description: "클로저를 학습합니다.",
          concepts: ["기본 개념"],
          theory: "클로저의 기본 개념을 학습합니다.",
          examples: []
        }
    }
  }

  const difficultyContent = getDifficultySpecificContent()

  const guideSteps = [
    {
      icon: <Map className="h-8 w-8" />,
      title: "클로저 동굴에 오신 것을 환영합니다!",
      content: "신비로운 동굴에서 클로저의 마법을 배워보세요. 함수 스코프를 이해하고 숨겨진 보물을 찾아보세요.",
      visual: (
        <div className="relative h-48 bg-gradient-to-b from-amber-900 to-amber-800 rounded-xl p-4 overflow-hidden">
          {/* 동굴 배경 */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/30 to-amber-900/50 rounded-xl" />
          
          {/* 동굴 입구와 보물 시각화 */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 함수 스코프 (동굴) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-lg border-2 border-yellow-600"
              >
                <Code className="h-8 w-8 text-yellow-400" />
              </motion.div>
              
              {/* 화살표 */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <ArrowRight className="h-6 w-6 text-yellow-400" />
              </motion.div>
              
              {/* 보물 (변수) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-2xl">💎</span>
              </motion.div>
            </div>
          </div>
          
          {/* 반짝이는 효과 */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <div className="absolute top-8 right-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      )
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "이론적 배경",
      content: difficultyContent.theory,
      visual: (
        <div className="space-y-4">
          <div 
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.isDarkMode
                ? `rgba(251, 191, 36, 0.2)`
                : theme.getSpecialColor('guide-bg-light'),
              borderColor: theme.isDarkMode
                ? theme.getSpecialColor('guide-accent-dark')
                : theme.getSpecialColor('guide-border-light')
            }}
          >
            <h4 
              className="font-semibold mb-2"
              style={{
                color: theme.isDarkMode
                  ? theme.getSpecialColor('guide-accent-dark')
                  : theme.getSpecialColor('guide-text-light')
              }}
            >
              핵심 개념
            </h4>
            <div className="flex flex-wrap gap-2">
              {difficultyContent.concepts.map((concept, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: theme.isDarkMode
                      ? theme.getSpecialColor('guide-accent-dark')
                      : theme.getSpecialColor('guide-bg-light-secondary'),
                    color: theme.isDarkMode
                      ? 'white'
                      : theme.getSpecialColor('guide-text-light')
                  }}
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
          {difficultyContent.examples.length > 0 && (
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: theme.isDarkMode
                  ? theme.getBackgroundColor('elevated')
                  : theme.getSpecialColor('guide-bg-light'),
                borderColor: theme.isDarkMode
                  ? theme.getBorderColor('light')
                  : theme.getSpecialColor('guide-border-light-secondary')
              }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{
                  color: theme.isDarkMode
                    ? theme.getTextColor('primary')
                    : theme.getSpecialColor('guide-text-light')
                }}
              >
                예시: {difficultyContent.examples[0].concept}
              </h4>
              <div 
                className="rounded p-3 text-xs font-mono mb-2"
                style={{
                  backgroundColor: theme.isDarkMode
                    ? theme.getSpecialColor('code-bg-dark')
                    : theme.getSpecialColor('code-bg-light'),
                  color: theme.isDarkMode
                    ? theme.getSpecialColor('code-text-dark')
                    : theme.getSpecialColor('code-text-light')
                }}
              >
                <pre>{difficultyContent.examples[0].code}</pre>
              </div>
              <p 
                className="text-sm"
                style={{
                  color: theme.isDarkMode
                    ? theme.getTextColor('secondary')
                    : theme.getSpecialColor('guide-text-light-tertiary')
                }}
              >
                {difficultyContent.examples[0].explanation}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "게임 목표",
      content: `이 난이도에서는 ${difficultyContent.concepts.join(', ')}을 학습합니다. 코드 에디터에서 함수를 작성하고 실행하여 펭귄이 목표에 도달하도록 도와주세요.`,
      visual: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-3">
            <div className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-2">🎮 게임 보드</div>
            <div className="grid grid-cols-4 gap-1 h-20">
              <div className="bg-white dark:bg-slate-700 rounded flex items-center justify-center">
                <span className="text-lg">🐧</span>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded opacity-50" />
              <div className="bg-white dark:bg-slate-700 rounded opacity-50" />
              <div className="bg-yellow-300 dark:bg-yellow-600 rounded flex items-center justify-center">
                <span className="text-sm">💎</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
            <div className="text-xs font-bold text-slate-300 mb-2">💻 코드 에디터</div>
            <div className="bg-slate-800 rounded p-2 text-xs font-mono text-green-400">
              <div>function solution() {`{`}</div>
              <div className="ml-2 text-yellow-400">// 여기에 코드 작성</div>
              <div className="ml-2">return closureFunc;</div>
              <div>{`}`}</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onStart()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div 
                className="relative p-6 text-white"
                style={{
                  background: theme.isDarkMode
                    ? `linear-gradient(to right, ${theme.getSpecialColor('guide-header')}, ${theme.getSpecialColor('guide-header-end')})`
                    : `linear-gradient(to right, ${theme.getSpecialColor('guide-accent-light-secondary')}, ${theme.getSpecialColor('guide-header-end')})`
                }}
              >
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Map className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{difficultyContent.title}</h2>
                    <p className="text-sm opacity-90">레벨 {currentLevel} - {difficultyContent.description}</p>
                  </div>
                </div>
              </div>
              
              {/* 진행 표시 */}
              <div 
                className="flex justify-center gap-2 p-4"
                style={{
                  backgroundColor: theme.isDarkMode
                    ? theme.getBackgroundColor('elevated')
                    : theme.getSpecialColor('guide-bg-light')
                }}
              >
                {guideSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      width: index === currentStep ? '32px' : '8px',
                      backgroundColor: index === currentStep
                        ? theme.isDarkMode
                          ? theme.getSpecialColor('guide-accent-dark')
                          : theme.getSpecialColor('guide-accent-light')
                        : theme.isDarkMode
                          ? theme.getBorderColor('light')
                          : theme.getSpecialColor('guide-dot-inactive-light')
                    }}
                  />
                ))}
              </div>
              
              {/* 콘텐츠 */}
              <div 
                className="p-6"
                style={{
                  backgroundColor: theme.isDarkMode 
                    ? theme.getBackgroundColor('main')
                    : theme.getSpecialColor('guide-bg-light-tertiary')
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor: theme.isDarkMode
                            ? `rgba(251, 191, 36, 0.2)`
                            : theme.getSpecialColor('guide-bg-light-secondary'),
                          color: theme.isDarkMode
                            ? theme.getSpecialColor('guide-accent-dark')
                            : theme.getSpecialColor('guide-accent-light')
                        }}
                      >
                        {guideSteps[currentStep].icon}
                      </div>
                      <h3 
                        className="text-xl font-bold"
                        style={{
                          color: theme.isDarkMode
                            ? theme.getTextColor('primary')
                            : theme.getSpecialColor('guide-text-light')
                        }}
                      >
                        {guideSteps[currentStep].title}
                      </h3>
                    </div>
                    
                    <p 
                      style={{
                        color: theme.isDarkMode
                          ? theme.getTextColor('secondary')
                          : theme.getSpecialColor('guide-text-light-secondary')
                      }}
                    >
                      {guideSteps[currentStep].content}
                    </p>
                    
                    <div 
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor: theme.isDarkMode
                          ? theme.getBackgroundColor('elevated')
                          : theme.getSpecialColor('guide-bg-light')
                      }}
                    >
                      {guideSteps[currentStep].visual}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* 버튼 - 라이트 테마에서도 명확하게 보이도록 개선 */}
              <div 
                className="flex justify-between gap-4 p-6"
                style={{
                  backgroundColor: theme.isDarkMode
                    ? theme.getBackgroundColor('elevated')
                    : theme.getSpecialColor('guide-bg-light')
                }}
              >
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all"
                  style={{
                    borderColor: currentStep === 0
                      ? theme.isDarkMode
                        ? theme.getBorderColor('light')
                        : theme.getSpecialColor('guide-border-light-secondary')
                      : theme.isDarkMode
                        ? theme.getBorderColor('default')
                        : theme.getSpecialColor('guide-border-light'),
                    color: currentStep === 0
                      ? theme.isDarkMode
                        ? theme.getTextColor('muted')
                        : theme.getSpecialColor('guide-text-light-tertiary')
                      : theme.isDarkMode
                        ? theme.getTextColor('secondary')
                        : theme.getSpecialColor('guide-text-light'),
                    backgroundColor: currentStep === 0
                      ? theme.isDarkMode
                        ? theme.getBackgroundColor('secondary')
                        : theme.getSpecialColor('guide-bg-light-secondary')
                      : theme.isDarkMode
                        ? theme.getBackgroundColor('elevated')
                        : 'white',
                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  이전
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border-2 font-medium transition-all"
                    style={{
                      borderColor: theme.isDarkMode
                        ? theme.getBorderColor('default')
                        : theme.getSpecialColor('guide-border-light'),
                      color: theme.isDarkMode
                        ? theme.getTextColor('secondary')
                        : theme.getSpecialColor('guide-text-light'),
                      backgroundColor: theme.isDarkMode
                        ? theme.getBackgroundColor('elevated')
                        : 'white'
                    }}
                  >
                    나중에 하기
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    style={{
                      background: theme.isDarkMode
                        ? `linear-gradient(to right, ${theme.getSpecialColor('guide-header')}, ${theme.getSpecialColor('guide-header-end')})`
                        : `linear-gradient(to right, ${theme.getSpecialColor('guide-accent-light-secondary')}, ${theme.getSpecialColor('guide-header-end')})`,
                      color: 'white'
                    }}
                  >
                    {currentStep === guideSteps.length - 1 ? '게임 시작' : '다음'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}