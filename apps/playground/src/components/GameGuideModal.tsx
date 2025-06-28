'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Target, Lightbulb, Trophy, ChevronRight } from 'lucide-react'
import { Button } from '@penguinjs/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface GameGuideModalProps {
  isOpen: boolean
  onClose: () => void
  gameId: string
  gameTitle: string
}

interface GuideContent {
  overview: string
  howToPlay: string[]
  objectives: string[]
  tips: string[]
  controls?: { action: string; description: string }[]
}

const guideContents: Record<string, GuideContent> = {
  'closure-cave': {
    overview: '클로저 동굴은 JavaScript의 클로저(Closure) 개념을 퍼즐로 배우는 게임입니다. 변수의 스코프와 클로저가 어떻게 작동하는지 직접 코드를 작성하며 이해할 수 있습니다.',
    howToPlay: [
      '주어진 문제와 목표를 읽고 이해합니다',
      '코드 에디터에 JavaScript 코드를 작성합니다',
      '실행 버튼을 클릭하여 코드를 테스트합니다',
      '모든 테스트를 통과하면 다음 스테이지로 진행됩니다'
    ],
    objectives: [
      '클로저의 개념 이해하기',
      '변수 스코프 파악하기',
      '함수와 환경의 관계 학습하기'
    ],
    tips: [
      '힌트 버튼을 활용하세요 (점수는 감소합니다)',
      '콘솔 출력을 확인하여 디버깅하세요',
      '이전 스테이지의 개념을 다음 스테이지에 적용해보세요'
    ],
    controls: [
      { action: 'Ctrl/Cmd + Enter', description: '코드 실행' },
      { action: 'Ctrl/Cmd + S', description: '코드 저장' },
      { action: 'Tab', description: '들여쓰기' }
    ]
  },
  'callstack-library': {
    overview: '콜스택 도서관은 JavaScript의 함수 호출 스택을 시각적으로 이해하는 게임입니다. 함수가 호출되고 반환되는 과정을 책이 쌓이고 제거되는 애니메이션으로 학습합니다.',
    howToPlay: [
      '제공된 코드를 읽고 함수 호출 순서를 예측합니다',
      '시뮬레이션 실행 버튼을 클릭합니다',
      '왼쪽 화면에서 함수가 스택에 쌓이는 과정을 관찰합니다',
      '실행 순서를 이해했다면 정답 확인을 클릭합니다'
    ],
    objectives: [
      '콜스택의 LIFO(Last In First Out) 원리 이해',
      '함수 호출과 반환 과정 학습',
      '재귀 함수의 스택 동작 파악'
    ],
    tips: [
      '각 함수는 다른 색상의 책으로 표현됩니다',
      '스택이 가득 차면 Stack Overflow가 발생합니다',
      '실행 순서를 종이에 그려보며 예측해보세요'
    ]
  },
  'promise-battle': {
    overview: 'Promise 배틀은 비동기 프로그래밍의 핵심인 Promise를 카드 게임으로 배우는 게임입니다. Promise의 상태 변화와 체이닝을 전투를 통해 익힐 수 있습니다.',
    howToPlay: [
      '상대와 번갈아가며 Promise 카드를 사용합니다',
      'Pending, Fulfilled, Rejected 상태를 전략적으로 활용합니다',
      'then/catch 체인을 구성하여 콤보를 만듭니다',
      '상대의 HP를 0으로 만들면 승리합니다'
    ],
    objectives: [
      'Promise의 3가지 상태 이해',
      'then/catch 체이닝 학습',
      '비동기 에러 처리 방법 익히기'
    ],
    tips: [
      'Rejected 상태는 catch로만 처리할 수 있습니다',
      '연속된 then 체인으로 강력한 콤보를 만들어보세요',
      'Promise.all과 Promise.race의 차이를 활용하세요'
    ]
  }
}

export function GameGuideModal({ isOpen, onClose, gameId, gameTitle }: GameGuideModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  const guide = guideContents[gameId] || guideContents['closure-cave']
  
  const tabs = [
    { icon: BookOpen, label: '개요' },
    { icon: Target, label: '플레이 방법' },
    { icon: Trophy, label: '학습 목표' },
    { icon: Lightbulb, label: '팁' }
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] bg-[rgb(var(--surface-elevated))] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary))]/80 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{gameTitle} 가이드</h2>
                  <p className="text-white/80 text-sm">게임을 시작하기 전에 읽어보세요</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* 탭 */}
            <div className="flex border-b border-[rgb(var(--border))]">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                return (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all ${
                      activeTab === index
                        ? 'bg-[rgb(var(--surface-secondary))] border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                        : 'hover:bg-[rgb(var(--surface-secondary))]/50 text-[rgb(var(--text-secondary))]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
            
            {/* 콘텐츠 */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              <AnimatePresence mode="wait">
                {activeTab === 0 && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <p className="text-[rgb(var(--text-primary))] leading-relaxed">
                      {guide.overview}
                    </p>
                    {guide.controls && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--text-primary))]">
                          키보드 단축키
                        </h3>
                        <div className="space-y-2">
                          {guide.controls.map((control, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-[rgb(var(--surface-secondary))] rounded-lg">
                              <kbd className="px-2 py-1 bg-[rgb(var(--surface-primary))] rounded text-sm font-mono">
                                {control.action}
                              </kbd>
                              <span className="text-sm text-[rgb(var(--text-secondary))]">
                                {control.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {activeTab === 1 && (
                  <motion.div
                    key="howto"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {guide.howToPlay.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--primary))]/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-[rgb(var(--primary))]">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-[rgb(var(--text-primary))] leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === 2 && (
                  <motion.div
                    key="objectives"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {guide.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-[rgb(var(--surface-secondary))] rounded-lg">
                        <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[rgb(var(--text-primary))]">{objective}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
                
                {activeTab === 3 && (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {guide.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[rgb(var(--text-primary))]">{tip}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* 푸터 */}
            <div className="p-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface-secondary))]/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  준비되셨나요? 게임을 시작해보세요!
                </p>
                <Button
                  onClick={onClose}
                  className="bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90"
                >
                  시작하기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}