'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Lightbulb, Target, Trophy, ArrowRight, Layers, Play } from 'lucide-react'

interface GameGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

export function GameGuideModal({ isOpen, onClose, onStart }: GameGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const guideSteps = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "콜스택 도서관에 오신 것을 환영합니다!",
      content: "함수들이 책처럼 쌓이고 사라지는 콜스택의 세계를 탐험해보세요.",
      visual: (
        <div className="relative h-48 rounded-lg p-3" style={{
          background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)'
        }}>
          <div className="relative rounded-lg p-4 h-full" style={{
            background: 'linear-gradient(180deg, rgb(160, 82, 45) 0%, rgb(139, 69, 19) 100%)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="text-xs font-bold text-white mb-2">📚 콜스택 데스크</div>
            <div className="relative h-32">
              <AnimatePresence>
                {/* 첫 번째 책 */}
                <motion.div
                  key="book-1"
                  initial={{ y: -100, opacity: 0, rotate: -10 }}
                  animate={{ y: 0, opacity: 1, rotate: -2 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="absolute"
                  style={{ 
                    bottom: '0px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(-2deg)',
                    width: '100px',
                    height: '35px'
                  }}
                >
                  <div 
                    className="h-full rounded shadow-2xl flex items-center px-3 relative overflow-hidden"
                    style={{ 
                      backgroundColor: '#3b82f6',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/50 to-black/20" />
                    <span className="text-white text-xs font-mono font-bold ml-1">main()</span>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-gray-100 to-white rounded-r" />
                  </div>
                </motion.div>
                
                {/* 두 번째 책 */}
                <motion.div
                  key="book-2"
                  initial={{ y: -100, opacity: 0, rotate: 10 }}
                  animate={{ y: 0, opacity: 1, rotate: 3 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="absolute"
                  style={{ 
                    bottom: '35px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(3deg)',
                    width: '90px',
                    height: '30px'
                  }}
                >
                  <div 
                    className="h-full rounded shadow-2xl flex items-center px-3 relative overflow-hidden"
                    style={{ 
                      backgroundColor: '#10b981',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/50 to-black/20" />
                    <span className="text-white text-xs font-mono font-bold ml-1">func1()</span>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-gray-100 to-white rounded-r" />
                  </div>
                </motion.div>
                
                {/* 세 번째 책 */}
                <motion.div
                  key="book-3"
                  initial={{ y: -100, opacity: 0, rotate: -15 }}
                  animate={{ y: 0, opacity: 1, rotate: -1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                  className="absolute"
                  style={{ 
                    bottom: '65px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(-1deg)',
                    width: '95px',
                    height: '32px'
                  }}
                >
                  <div 
                    className="h-full rounded shadow-2xl flex items-center px-3 relative overflow-hidden"
                    style={{ 
                      backgroundColor: '#8b5cf6',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                      boxShadow: '0 14px 28px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/50 to-black/20" />
                    <span className="text-white text-xs font-mono font-bold ml-1">func2()</span>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-gray-100 to-white rounded-r" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "게임 목표",
      content: "코드를 보고 함수들이 실행되는 순서를 정확히 예측하세요!",
      visual: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">코드를 읽고 실행 흐름을 파악하세요</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">함수 호출 순서를 예측해보세요</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">드래그해서 순서를 만들고 정답을 확인하세요</span>
          </div>
        </div>
      )
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: "게임 방법",
      content: "함수를 클릭하거나 드래그해서 실행 순서를 만들어보세요.",
      visual: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 미니 책상 */}
          <div className="relative h-32 rounded-lg p-2" style={{
            background: 'linear-gradient(145deg, #f5f5f5, #e0e0e0)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="relative rounded-md p-3 h-full" style={{
              background: 'linear-gradient(180deg, rgb(160, 82, 45) 0%, rgb(139, 69, 19) 100%)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <div className="text-xs font-bold text-white mb-1">📚 데스크</div>
              <div className="relative h-20">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="absolute"
                  style={{ 
                    bottom: '0px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '50px',
                    height: '20px'
                  }}
                >
                  <div className="h-full bg-blue-500 rounded shadow-lg flex items-center justify-center text-white font-mono" style={{ fontSize: '9px' }}>
                    A
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="absolute"
                  style={{ 
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(2deg)',
                    width: '45px',
                    height: '18px'
                  }}
                >
                  <div className="h-full bg-green-500 rounded shadow-lg flex items-center justify-center text-white font-mono" style={{ fontSize: '9px' }}>
                    B
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* 예상 순서 영역 */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-300 dark:border-slate-600">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">🎯 예상 순서</div>
            <div className="space-y-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs"
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</div>
                <span className="font-mono text-slate-800 dark:text-slate-200">funcA()</span>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded text-xs"
              >
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                <span className="font-mono text-slate-800 dark:text-slate-200">funcB()</span>
              </motion.div>
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
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* 모달 */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">콜스택 도서관</h2>
                    <p className="text-sm opacity-90">함수 호출 스택 학습 게임</p>
                  </div>
                </div>
              </div>
              
              {/* 진행 표시 */}
              <div className="flex justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800">
                {guideSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-blue-500' 
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
              
              {/* 콘텐츠 */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        {guideSteps[currentStep].icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {guideSteps[currentStep].title}
                      </h3>
                    </div>
                    
                    <p className="text-slate-800 dark:text-slate-300">
                      {guideSteps[currentStep].content}
                    </p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                      {guideSteps[currentStep].visual}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* 버튼 - 라이트 테마에서도 명확하게 보이도록 개선 */}
              <div className="flex justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    currentStep === 0 
                      ? 'border-slate-300 text-slate-400 bg-slate-100 cursor-not-allowed dark:border-slate-600 dark:text-slate-500 dark:bg-slate-700' 
                      : 'border-slate-400 text-slate-700 bg-white hover:border-slate-500 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-300 dark:bg-slate-800 dark:hover:border-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  이전
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border-2 border-slate-400 text-slate-700 bg-white hover:border-slate-500 hover:bg-slate-50 font-medium transition-all dark:border-slate-500 dark:text-slate-300 dark:bg-slate-800 dark:hover:border-slate-400 dark:hover:bg-slate-700"
                  >
                    나중에 하기
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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