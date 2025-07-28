'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Lightbulb, Target, Trophy, ArrowRight, Layers, Play, Activity } from 'lucide-react'

interface GameGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
  layoutType?: 'A' | 'A+' | 'B' | 'C' | 'D' | 'E'
  currentStage?: number
}

export function GameGuideModal({ isOpen, onClose, onStart, layoutType = 'A', currentStage = 1 }: GameGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTheory, setShowTheory] = useState(false)

  // 모달이 열릴 때마다 currentStep을 0으로 리셋
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setShowTheory(false)
    }
  }, [isOpen])

  // 난이도 결정
  const getDifficulty = () => {
    if (currentStage <= 8) return 'beginner'
    if (currentStage <= 16) return 'intermediate'
    return 'advanced'
  }

  // 난이도별 동적 가이드 컨텐츠 (클로저 동굴과 일관성)
  const getDifficultySpecificContent = () => {
    const difficulty = getDifficulty()
    
    switch (difficulty) {
      case 'beginner':
        return {
          title: "콜스택 도서관 기초",
          description: "JavaScript 실행 순서의 기본을 학습하는 초급 단계입니다.",
          concepts: ["콜스택(CallStack)", "LIFO 원칙", "함수 호출 순서", "실행 컨텍스트"],
          theory: "콜스택은 JavaScript 엔진이 함수 호출을 관리하는 자료구조입니다. Last In, First Out(LIFO) 방식으로 작동하여, 가장 나중에 호출된 함수가 가장 먼저 완료됩니다.",
          gameContext: {
            librarian: "사서(JavaScript 엔진)가 도서관에서 책을 관리하듯, JavaScript 엔진이 함수들을 관리합니다.",
            mainShelf: "메인 서가(콜스택)는 현재 실행 중인 함수들이 쌓이는 곳입니다. 책을 쌓듯이 함수가 차례로 쌓입니다.",
            books: "각 책은 하나의 함수 호출을 나타냅니다. 책의 색상은 함수의 종류를 구분합니다."
          },
          examples: [
            {
              concept: "기본 함수 호출",
              code: `function first() {
  console.log('첫 번째 함수 시작');
  second();
  console.log('첫 번째 함수 끝');
}

function second() {
  console.log('두 번째 함수');
}

first(); // 실행`,
              explanation: "first() 함수가 호출되면 콜스택에 쌓이고, second() 함수가 호출되어 그 위에 쌓입니다. second()가 완료되면 제거되고, first()가 완료됩니다."
            }
          ]
        }
      case 'intermediate':
        return {
          title: "콜스택 도서관 심화",
          description: "복잡한 함수 호출 패턴과 실행 추적을 학습하는 중급 단계입니다.",
          concepts: ["재귀 함수", "고차 함수", "클로저", "함수 시작/종료 추적"],
          theory: "중급에서는 콜스택의 동작을 더 깊이 이해합니다. 재귀는 함수가 자기 자신을 호출하여 스택이 깊어지고, 고차 함수는 함수를 인자로 받거나 반환하며, 클로저는 외부 스코프의 변수를 기억합니다.",
          gameContext: {
            librarian: "사서가 복잡한 참조 관계의 책들을 관리하듯, JavaScript 엔진이 중첩된 함수 호출을 관리합니다.",
            mainShelf: "메인 서가(콜스택)는 여전히 중심이지만, 이제 함수의 시작과 종료를 정확히 추적합니다.",
            books: "각 책은 함수 호출을 나타내며, 이제 '시작' 상태와 '종료' 상태를 구분하여 표시합니다.",
            tracking: "함수가 시작될 때와 끝날 때를 구분하여, 실행 흐름을 더 정확히 파악할 수 있습니다."
          },
          examples: [
            {
              concept: "재귀 함수와 콜스택",
              code: `function factorial(n) {
  console.log(\`factorial(\${n}) 시작\`);
  
  if (n <= 1) {
    console.log(\`factorial(\${n}) 종료\`);
    return 1;
  }
  
  const result = n * factorial(n - 1);
  console.log(\`factorial(\${n}) 종료\`);
  return result;
}

factorial(3);

// 실행 순서:
// factorial(3) 시작
// factorial(2) 시작  
// factorial(1) 시작
// factorial(1) 종료
// factorial(2) 종료
// factorial(3) 종료`,
              explanation: "재귀 함수는 자기 자신을 호출하여 콜스택이 깊어집니다. 각 함수의 시작과 종료 시점을 추적하면 실행 흐름을 명확히 이해할 수 있습니다."
            }
          ]
        }
      case 'advanced':
        // 스테이지별로 세분화된 내용 제공
        if (currentStage >= 17 && currentStage <= 21) {
          // 스냅샷 단계 (17-21)
          return {
            title: "콜스택 도서관 스냅샷 마스터",
            description: "실행 중인 프로그램의 각 순간을 정확히 기록하고 분석하는 스냅샷 시스템을 마스터하는 단계입니다.",
            concepts: ["스택 스냅샷", "실행 타임라인", "디버깅 기법", "상태 추적"],
            theory: "스냅샷은 프로그램 실행의 특정 순간을 사진처럼 기록하는 기술입니다. 각 함수 호출과 반환 시점에서 콜스택의 상태를 정확히 파악하여, 코드의 실행 흐름을 단계별로 분석할 수 있습니다.",
            gameContext: {
              librarian: "사서가 도서관에서 책의 배치와 이동을 정확히 기록합니다. 매 순간의 상태를 사진으로 남겨 나중에 검토할 수 있게 합니다.",
              mainShelf: "메인 서가(콜스택)의 상태를 매 순간 기록합니다. 어떤 책이 언제 들어오고 나가는지 정확히 추적합니다.",
              snapshot: "스냅샷 카메라는 특정 시점의 콜스택 상태를 사진처럼 기록합니다. 디버깅에 필수적인 기술입니다."
            },
            examples: [
              {
                concept: "스냅샷 기반 디버깅",
                code: `function outer() {
  console.log('Step 1: outer() 시작');
  const result = inner(10);
  console.log('Step 4: outer() 종료');
  return result;
}

function inner(x) {
  console.log('Step 2: inner() 시작');
  const value = x * 2;
  console.log('Step 3: inner() 종료');
  return value;
}

outer();

// 각 Step에서 스냅샷을 찍어
// 콜스택의 변화를 추적합니다.`,
                explanation: "각 단계에서 콜스택의 상태를 기록하여 함수 호출과 반환의 정확한 순서를 파악할 수 있습니다."
              }
            ]
          }
        } else {
          // 이벤트 루프 단계 (22-24)
          return {
            title: "콜스택 도서관 이벤트 루프 마스터",
            description: "JavaScript의 비동기 처리와 이벤트 루프를 완전히 마스터하는 최고급 단계입니다.",
            concepts: ["이벤트 루프", "마이크로태스크", "매크로태스크", "다중 큐 시스템"],
            theory: "이벤트 루프는 JavaScript의 비동기 처리 핵심입니다. 콜스택, 마이크로태스크 큐, 매크로태스크 큐 등이 협력하여 복잡한 비동기 작업을 순서대로 처리합니다.",
            gameContext: {
              librarian: "마스터 사서가 도서관의 모든 시스템을 총괄 관리합니다. 일반 업무와 긴급 업무를 동시에 처리합니다.",
              mainShelf: "메인 서가(콜스택)는 여전히 핵심이며, 다양한 처리대와 협력합니다.",
              urgentDesk: "긴급 처리대(마이크로태스크 큐)는 Promise, async/await 등 우선순위가 높은 비동기 작업을 처리합니다.",
              normalDesk: "일반 처리대(매크로태스크 큐)는 setTimeout, setInterval 등 일반적인 비동기 작업을 처리합니다.",
              specialDesks: "특수 처리대들(애니메이션, I/O, 워커)은 각각 특별한 용도의 작업을 처리합니다."
            },
            examples: [
              {
                concept: "복합 비동기 처리",
                code: `// 애니메이션 프레임
requestAnimationFrame(() => {
  console.log('Animation');
});

// 마이크로태스크
Promise.resolve().then(() => {
  console.log('Microtask');
});

// 매크로태스크
setTimeout(() => {
  console.log('Macrotask');
}, 0);

console.log('Sync');`,
                explanation: "각 큐의 우선순위에 따라 실행 순서가 결정됩니다. 동기 → 마이크로태스크 → 애니메이션 프레임 → 매크로태스크 순으로 실행됩니다."
              }
            ]
          }
        }
      default:
        return {
          title: "콜스택 도서관",
          description: "JavaScript 실행 흐름을 학습합니다.",
          concepts: ["기본 개념"],
          theory: "JavaScript의 실행 흐름을 학습합니다.",
          gameContext: {},
          examples: []
        }
    }
  }

  // 단계별 추가 컨텐츠
  const getStageSpecificContent = () => {
    switch (layoutType) {
      case 'A':
        return {
          stageTitle: "기본 콜스택 학습",
          stageDescription: "메인 서가(콜스택)만 사용하는 가장 기본적인 형태입니다."
        }
      case 'A+':
        return {
          stageTitle: "향상된 콜스택 학습",
          stageDescription: "기본 콜스택에 추가 기능이 포함된 형태입니다."
        }
      case 'B':
        return {
          stageTitle: "이벤트 루프 시스템",
          stageDescription: "메인 서가와 긴급 처리대(마이크로태스크)가 함께 작동합니다."
        }
      case 'C':
        return {
          stageTitle: "다중 큐 시스템",
          stageDescription: "5개의 큐가 동시에 작동하는 복잡한 시스템입니다."
        }
      case 'D':
        return {
          stageTitle: "완전한 이벤트 루프",
          stageDescription: "6개의 모든 큐가 작동하는 완전한 이벤트 루프 시스템입니다."
        }
      default:
        return {
          stageTitle: "기본 학습",
          stageDescription: "기본적인 콜스택 구조입니다."
        }
    }
  }

  const difficultyContent = getDifficultySpecificContent()
  const stageContent = getStageSpecificContent()

  // 난이도별 헤더 색상
  const getDifficultyHeaderStyle = () => {
    const difficulty = getDifficulty()
    switch (difficulty) {
      case 'beginner':
        return 'bg-gradient-to-r from-green-500 to-emerald-600'
      case 'intermediate': 
        return 'bg-gradient-to-r from-blue-500 to-indigo-600'
      case 'advanced':
        return 'bg-gradient-to-r from-purple-500 to-violet-600'
      default:
        return 'bg-gradient-to-r from-amber-600 to-orange-600'
    }
  }

  // 난이도별 아이콘 색상
  const getDifficultyIconStyle = () => {
    const difficulty = getDifficulty()
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      case 'intermediate': 
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      default:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    }
  }

  // 난이도별 진행 표시 색상
  const getDifficultyProgressStyle = (isActive: boolean, isCompleted: boolean) => {
    const difficulty = getDifficulty()
    const baseColors = {
      beginner: isActive ? 'bg-green-500' : isCompleted ? 'bg-green-300' : 'bg-slate-300 dark:bg-slate-600',
      intermediate: isActive ? 'bg-blue-500' : isCompleted ? 'bg-blue-300' : 'bg-slate-300 dark:bg-slate-600',
      advanced: isActive ? 'bg-purple-500' : isCompleted ? 'bg-purple-300' : 'bg-slate-300 dark:bg-slate-600'
    }
    return baseColors[difficulty] || (isActive ? 'bg-amber-500' : isCompleted ? 'bg-amber-300' : 'bg-slate-300 dark:bg-slate-600')
  }

  // 난이도별 버튼 색상
  const getDifficultyButtonStyle = () => {
    const difficulty = getDifficulty()
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500 hover:bg-green-600'
      case 'intermediate': 
        return 'bg-blue-500 hover:bg-blue-600'
      case 'advanced':
        return 'bg-purple-500 hover:bg-purple-600'
      default:
        return 'bg-amber-500 hover:bg-amber-600'
    }
  }

  // 코드 하이라이팅 컴포넌트 (안전한 버전)
  const CodeBlock = ({ code, language = 'javascript' }: { code: string, language?: string }) => {
    // 토큰화 함수 - 코드를 안전하게 파싱
    const tokenizeLine = (line: string) => {
      const tokens = []
      let current = 0
      
      while (current < line.length) {
        // 주석 확인
        if (line.slice(current, current + 2) === '//') {
          tokens.push({ type: 'comment', value: line.slice(current) })
          break
        }
        
        // 문자열 확인 (', ", `)
        if (line[current] === '"' || line[current] === "'" || line[current] === '`') {
          const quote = line[current]
          let value = quote
          current++
          while (current < line.length && line[current] !== quote) {
            if (line[current] === '\\' && current + 1 < line.length) {
              value += line[current] + line[current + 1]
              current += 2
            } else {
              value += line[current]
              current++
            }
          }
          if (current < line.length) {
            value += line[current]
            current++
          }
          tokens.push({ type: 'string', value })
          continue
        }
        
        // 숫자 확인
        if (/\d/.test(line[current])) {
          let value = ''
          while (current < line.length && /[\d.]/.test(line[current])) {
            value += line[current]
            current++
          }
          tokens.push({ type: 'number', value })
          continue
        }
        
        // 키워드/식별자 확인
        if (/[a-zA-Z_$]/.test(line[current])) {
          let value = ''
          while (current < line.length && /[a-zA-Z0-9_$]/.test(line[current])) {
            value += line[current]
            current++
          }
          
          // 키워드 분류
          const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'async', 'await', 'class', 'new', 'yield']
          const builtins = ['console', 'Promise', 'setTimeout', 'requestAnimationFrame', 'Worker', 'fetch']
          const methods = ['log', 'resolve', 'then', 'next', 'postMessage']
          const literals = ['true', 'false', 'null', 'undefined']
          
          if (keywords.includes(value)) {
            tokens.push({ type: 'keyword', value })
          } else if (builtins.includes(value)) {
            tokens.push({ type: 'builtin', value })
          } else if (methods.includes(value)) {
            tokens.push({ type: 'method', value })
          } else if (literals.includes(value)) {
            tokens.push({ type: 'literal', value })
          } else {
            tokens.push({ type: 'identifier', value })
          }
          continue
        }
        
        // 그 외 문자
        tokens.push({ type: 'plain', value: line[current] })
        current++
      }
      
      return tokens
    }
    
    // 토큰을 스타일이 적용된 span으로 변환
    const renderToken = (token: { type: string; value: string }, index: number) => {
      const styles = {
        comment: 'text-slate-400',
        string: 'text-yellow-400',
        number: 'text-orange-400',
        keyword: 'text-purple-400',
        builtin: 'text-blue-400',
        method: 'text-cyan-400',
        literal: 'text-red-400',
        identifier: 'text-slate-300',
        plain: 'text-slate-300'
      }
      
      return (
        <span key={index} className={styles[token.type] || 'text-slate-300'}>
          {token.value}
        </span>
      )
    }
    
    return (
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <span className="text-xs text-slate-400 font-medium ml-2">{language}</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono">
            <code>
              {code.split('\n').map((line, index) => (
                <div key={index} className="flex hover:bg-slate-800/50">
                  <span className="text-slate-500 select-none pr-4 text-right inline-block w-10">
                    {index + 1}
                  </span>
                  <span className="flex-1">
                    {tokenizeLine(line).map((token, tokenIndex) => renderToken(token, tokenIndex))}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    )
  }

  const guideSteps = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: `${difficultyContent.title}에 오신 것을 환영합니다!`,
      content: difficultyContent.description,
      showTheory: true,
      visual: (
        <div className="space-y-4">
          {/* 게임 컨셉 설명 */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">🏛️ 도서관 시스템 이해하기</h4>
            <div className="space-y-3 text-sm">
              {difficultyContent.gameContext.librarian && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">👩‍🏫</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">사서 (JavaScript 엔진):</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.librarian}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.mainShelf && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📚</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">메인 서가 (콜스택):</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.mainShelf}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.books && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📖</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">책 (함수 호출):</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.books}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.tracking && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🔍</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">실행 추적:</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.tracking}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.urgentDesk && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚡</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">긴급 처리대 (마이크로태스크 큐):</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.urgentDesk}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.normalDesk && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">일반 처리대 (매크로태스크 큐):</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.normalDesk}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.animationDesk && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎨</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">애니메이션 처리대:</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.animationDesk}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.ioDesk && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">💾</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">I/O 처리대:</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.ioDesk}</p>
                  </div>
                </div>
              )}
              {difficultyContent.gameContext.workerDesk && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">⚙️</span>
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">워커 처리대:</strong>
                    <p className="text-amber-600 dark:text-amber-400">{difficultyContent.gameContext.workerDesk}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 이론 설명 */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">📖 핵심 이론</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{difficultyContent.theory}</p>
          </div>

          {/* 예제 코드 */}
          {difficultyContent.examples.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">💡 {difficultyContent.examples[0].concept}</h4>
              <CodeBlock code={difficultyContent.examples[0].code} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{difficultyContent.examples[0].explanation}</p>
            </div>
          )}
        </div>
      )
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: `${stageContent.stageTitle}`,
      content: `${stageContent.stageDescription} 이 단계에서는 ${difficultyContent.concepts.join(', ')}을 학습합니다.`,
      visual: (
        <div className="space-y-4">
          {/* 게임 시각화 */}
          <div className="relative h-48 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-xl p-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-amber-600/20 rounded-xl" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl">🏛️</div>
                <div className="font-bold text-amber-800 dark:text-amber-200">{stageContent.stageTitle}</div>
                <div className="text-sm text-amber-600 dark:text-amber-400">{stageContent.stageDescription}</div>
              </div>
            </div>
          </div>

          {/* 실제 게임 UI 미리보기 */}
          <div className="space-y-4">
            {/* 도서관 전체 레이아웃 미리보기 */}
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                <span>🏛️</span>
                도서관 전체 레이아웃
              </div>
              
              {/* 3패널 레이아웃 시뮬레이션 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-24">
                {/* 코드 에디터 패널 */}
                <div className="bg-slate-900 rounded-lg p-2 border border-slate-700 flex flex-col">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <span>📝</span>
                    코드 에디터
                  </div>
                  <div className="flex-1 bg-slate-800 rounded text-xs font-mono p-1 overflow-hidden">
                    <div className="text-purple-400">function</div>
                    <div className="text-blue-400 ml-2">main()</div>
                    <div className="text-slate-500">...</div>
                  </div>
                </div>
                
                {/* 메인 서가 (콜스택) */}
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg p-2 border-2 border-amber-400">
                  <div className="text-xs text-amber-800 dark:text-amber-200 mb-1 flex items-center gap-1">
                    <span>📚</span>
                    메인 서가 (콜스택)
                  </div>
                  <div className="space-y-1">
                    <div className="bg-blue-200 dark:bg-blue-800 rounded px-2 py-1 text-xs">main()</div>
                    <div className="bg-green-200 dark:bg-green-800 rounded px-2 py-1 text-xs">calculate()</div>
                  </div>
                </div>
                
                {/* 함수 선택기 / 스냅샷 빌더 */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 border border-slate-300 dark:border-slate-600">
                  <div className="text-xs text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    {layoutType === 'E' ? (
                      <>
                        <span>📸</span>
                        스냅샷 빌더
                      </>
                    ) : (
                      <>
                        <span>🎯</span>
                        함수 선택기
                      </>
                    )}
                  </div>
                  <div className="space-y-1">
                    {layoutType === 'E' ? (
                      <>
                        <div className="bg-pink-200 dark:bg-pink-800 rounded px-2 py-1 text-xs">Step 1</div>
                        <div className="bg-pink-200 dark:bg-pink-800 rounded px-2 py-1 text-xs">Step 2</div>
                      </>
                    ) : layoutType === 'A+' ? (
                      <>
                        <div className="bg-blue-200 dark:bg-blue-800 rounded px-2 py-1 text-xs">시작: main()</div>
                        <div className="bg-red-200 dark:bg-red-800 rounded px-2 py-1 text-xs">종료: calc()</div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-xs">first()</div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-xs">second()</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 다중 큐 시스템 (고급 단계용) */}
              {(layoutType === 'B' || layoutType === 'C' || layoutType === 'D') && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">처리대 시스템</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 border border-blue-300 dark:border-blue-700">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">📚 메인 서가</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">콜스택</div>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 border border-green-300 dark:border-green-700">
                      <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">⚡ 긴급 처리대</div>
                      <div className="text-xs text-green-600 dark:text-green-400">마이크로태스크</div>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-2 border border-yellow-300 dark:border-yellow-700">
                      <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">📅 일반 처리대</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">매크로태스크</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 인터랙션 방식 안내 */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span>🎮</span>
                게임 조작 방법
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                      <span className="text-xs">🖱️</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      드래그앤드롭으로 함수 순서 조정
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                      <span className="text-xs">👆</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      클릭으로 함수 선택/해제
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                      <span className="text-xs">✅</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      검증 버튼으로 답안 확인
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center">
                      <span className="text-xs">💡</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      힌트 버튼으로 도움 받기
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "게임 목표",
      content: "올바른 함수 실행 순서를 예측하여 도서관 시스템이 정상적으로 작동하도록 도와주세요.",
      visual: (
        <div className="space-y-4">
          {/* 목표 설명 */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">🎯 달성해야 할 목표</h4>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>주어진 코드의 실행 순서를 정확히 예측하기</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>각 큐의 우선순위와 처리 방식 이해하기</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>이벤트 루프의 동작 원리 체득하기</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>실제 개발에서 활용할 수 있는 지식 습득하기</span>
              </li>
            </ul>
          </div>

          {/* 조작 방법 */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">🕹️ 게임 조작법</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border shadow text-xs">클릭</kbd>
                <span className="text-purple-700 dark:text-purple-300">함수 블록 선택/이동</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border shadow text-xs">드래그</kbd>
                <span className="text-purple-700 dark:text-purple-300">실행 순서 배치</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border shadow text-xs">확인</kbd>
                <span className="text-purple-700 dark:text-purple-300">답안 제출 및 검증</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded border shadow text-xs">힌트</kbd>
                <span className="text-purple-700 dark:text-purple-300">막힐 때 도움받기</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  // 고급 단계별 추가 스텝 생성
  const getAdvancedSteps = () => {
    const advancedSteps = []
    const difficulty = getDifficulty()
    
    if (difficulty === 'advanced' && currentStage >= 17 && currentStage <= 21) {
      // 고급 4단계 - 스냅샷 시스템 소개 (스테이지 17-21)
      advancedSteps.push({
        icon: <Activity className="h-8 w-8" />,
        title: "📸 스택 스냅샷 시스템 마스터!",
        content: "실행 중인 프로그램의 각 순간을 정확히 기록하고 분석하는 스냅샷 시스템을 학습합니다. 디버깅의 핵심 기술입니다.",
        visual: (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">스택 스냅샷의 특징</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📸</span>
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-300">스냅샷 카메라:</strong>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">특정 시점의 콜스택 상태를 사진처럼 기록합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">⏱️</span>
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-300">타임라인 추적:</strong>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">코드 실행의 각 단계별 상태 변화를 순서대로 기록합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🔍</span>
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-300">디버깅 도구:</strong>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">실제 개발에서 버그를 찾을 때 사용하는 핵심 기술입니다.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 실제 스냅샷 UI 미리보기 */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-emerald-600 text-white px-4 py-2 text-sm font-bold flex items-center gap-2">
                <span>📸</span>
                스택 스냅샷 시스템 미리보기
              </div>
              
              {/* 실제 게임과 동일한 3패널 레이아웃 */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-32">
                  {/* 향상된 코드 에디터 (브레이크포인트 포함) */}
                  <div className="bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
                    <div className="px-3 py-2 bg-slate-800 text-xs text-slate-300 font-medium border-b border-slate-700">
                      📝 코드 에디터 (브레이크포인트)
                    </div>
                    <div className="flex-1 p-2">
                      <div className="space-y-1 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-purple-400">function main()</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span className="text-blue-400 ml-2">calculate(5)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-slate-500 ml-2">return</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 타임라인 콜스택 */}
                  <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border-2 border-amber-400">
                    <div className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-xs text-amber-800 dark:text-amber-200 font-medium border-b border-amber-300 dark:border-amber-700">
                      📚 타임라인 콜스택
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="bg-amber-200 dark:bg-amber-800 rounded px-2 py-1 text-xs text-amber-900 dark:text-amber-100 flex items-center justify-between">
                        <span>main()</span>
                        <span className="text-xs opacity-60">#2</span>
                      </div>
                      <div className="bg-amber-300 dark:bg-amber-700 rounded px-2 py-1 text-xs text-amber-900 dark:text-amber-100 flex items-center justify-between">
                        <span>calculate()</span>
                        <span className="text-xs opacity-60">#1</span>
                      </div>
                      <div className="flex items-center justify-center pt-1">
                        <div className="flex gap-1">
                          <button className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">▶</span>
                          </button>
                          <button className="w-4 h-4 bg-gray-300 rounded-full"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 스택 스냅샷 빌더 */}
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
                    <div className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium border-b border-slate-300 dark:border-slate-600">
                      📸 스냅샷 빌더
                    </div>
                    <div className="p-2">
                      {/* 실행 단계 그리드 */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        <div className="w-4 h-4 bg-pink-400 rounded flex items-center justify-center text-xs text-white font-bold">1</div>
                        <div className="w-4 h-4 bg-pink-400 rounded flex items-center justify-center text-xs text-white font-bold">2</div>
                        <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">3</div>
                        <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">4</div>
                      </div>
                      {/* 함수 선택 영역 */}
                      <div className="space-y-1">
                        <div className="bg-blue-200 dark:bg-blue-800 rounded px-2 py-1 text-xs">main()</div>
                        <div className="bg-green-200 dark:bg-green-800 rounded px-2 py-1 text-xs">calculate()</div>
                      </div>
                      {/* 검증 버튼 */}
                      <div className="mt-2">
                        <button className="w-full bg-emerald-500 text-white rounded px-2 py-1 text-xs font-medium">
                          검증
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 하단 범례 */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">범례:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-slate-600 dark:text-slate-400">브레이크포인트</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      <span className="text-slate-600 dark:text-slate-400">현재 실행중</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-slate-600 dark:text-slate-400">실행 완료</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-pink-400 rounded"></span>
                      <span className="text-slate-600 dark:text-slate-400">체크포인트</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CodeBlock code={`// 스냅샷 대상 코드 예시
function main() {
  console.log('Step 1: main() 시작');
  const result = calculate(5);
  console.log('Step 4: main() 종료', result);
  return result;
}

function calculate(n) {
  console.log('Step 2: calculate() 시작');
  const value = n * 2;
  console.log('Step 3: calculate() 종료');
  return value;
}

main();

// 각 Step마다 스냅샷을 찍어서
// 콜스택의 상태 변화를 기록합니다.`} />
          </div>
        )
      })
    }
    
    if (difficulty === 'advanced' && currentStage === 22) {
      // 고급 6단계 - 다중 큐 시스템 소개
      advancedSteps.push({
        icon: <Layers className="h-8 w-8" />,
        title: "🚀 다중 큐 시스템 마스터!",
        content: "이제 5개의 큐가 동시에 작동하는 복잡한 시스템을 다룹니다. 각 큐의 특성과 우선순위를 정확히 파악해야 합니다.",
        visual: (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">다중 큐 시스템의 특징</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">콜스택 (최우선)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">마이크로태스크 큐 (Promise)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">애니메이션 프레임 큐</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">제너레이터 큐</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">매크로태스크 큐 (setTimeout)</span>
                </div>
              </div>
            </div>
            <CodeBlock code={`// 복합적인 시나리오 예시
console.log('시작');

setTimeout(() => console.log('매크로태스크'), 0);
Promise.resolve().then(() => console.log('마이크로태스크'));
requestAnimationFrame(() => console.log('애니메이션'));

function* generator() {
  yield console.log('제너레이터');
}
const gen = generator();
gen.next();

console.log('끝');`} />
          </div>
        )
      })
    }
    
    if (difficulty === 'advanced' && currentStage === 23) {
      // 고급 7단계 - 복잡한 비동기 패턴
      advancedSteps.push({
        icon: <Activity className="h-8 w-8" />,
        title: "⚡ 복잡한 이벤트 루프 마스터!",
        content: "5개의 큐가 동시에 작동하는 복잡한 시나리오입니다. 각 큐의 우선순위와 상호작용을 정확히 파악해야 합니다.",
        visual: (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <h4 className="font-semibold text-violet-800 dark:text-violet-200 mb-3">복잡한 비동기 패턴</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-violet-700 dark:text-violet-300">💡 실전 개발에서 자주 마주치는 복잡한 상황들</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-violet-700 dark:text-violet-300">🔄 여러 비동기 작업이 동시에 실행되는 시나리오</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-violet-700 dark:text-violet-300">⚖️ 큐 간 우선순위 경쟁과 실행 타이밍</span>
                </div>
              </div>
            </div>
            <CodeBlock code={`// 실전 복합 시나리오
async function complexScenario() {
  console.log('1: 시작');
  
  setTimeout(() => console.log('5: 매크로태스크'), 0);
  
  Promise.resolve().then(() => {
    console.log('3: 마이크로태스크 1');
    return Promise.resolve();
  }).then(() => console.log('4: 마이크로태스크 2'));
  
  requestAnimationFrame(() => console.log('6: 애니메이션'));
  
  console.log('2: 동기 코드');
}`} />
          </div>
        )
      })
    }
    
    if (difficulty === 'advanced' && currentStage === 24) {
      // 고급 8단계 - 완전한 이벤트 루프 시스템
      advancedSteps.push({
        icon: <Trophy className="h-8 w-8" />,
        title: "🏆 이벤트 루프 그랜드 마스터!",
        content: "모든 6개의 큐가 작동하는 완전한 이벤트 루프 시스템입니다. JavaScript의 비동기 처리를 완벽하게 이해하게 됩니다.",
        visual: (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-3">완전한 이벤트 루프 시스템</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">콜스택</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">마이크로태스크</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">애니메이션</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">제너레이터</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">I/O 큐</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-rose-700 dark:text-rose-300">워커 큐</span>
                </div>
              </div>
            </div>
            <CodeBlock code={`// 마스터 레벨 시나리오
console.log('시작');

// 워커 큐
new Worker('worker.js').postMessage('data');

// I/O 큐  
fetch('/api/data').then(() => console.log('I/O 완료'));

// 매크로태스크
setTimeout(() => console.log('매크로태스크'), 0);

// 마이크로태스크
Promise.resolve().then(() => console.log('마이크로태스크'));

// 애니메이션 프레임
requestAnimationFrame(() => console.log('애니메이션'));

// 제너레이터
function* gen() { yield console.log('제너레이터'); }
gen().next();

console.log('끝');`} />
          </div>
        )
      })
    }
    
    return advancedSteps
  }

  // 모든 스텝 합치기
  const allSteps = [...guideSteps, ...getAdvancedSteps()]

  const handleNext = () => {
    if (currentStep < allSteps.length - 1) {
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* 헤더 */}
              <div className={`relative ${getDifficultyHeaderStyle()} p-6 text-white`}>
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
                    <h2 className="text-2xl font-bold">{difficultyContent.title}</h2>
                    <p className="text-sm opacity-90">스테이지 {currentStage} - {difficultyContent.description}</p>
                  </div>
                </div>
              </div>
              
              {/* 진행 표시 */}
              <div className="flex justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800">
                {allSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      getDifficultyProgressStyle(index === currentStep, index < currentStep)
                    }`}
                  />
                ))}
              </div>
              
              {/* 컨텐츠 영역 */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* 아이콘과 제목 */}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getDifficultyIconStyle()}`}>
                      {allSteps[currentStep].icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {allSteps[currentStep].title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {allSteps[currentStep].content}
                      </p>
                    </div>
                  </div>

                  {/* 시각적 컨텐츠 */}
                  {allSteps[currentStep].visual}
                </motion.div>
              </div>
              
              {/* 하단 버튼 */}
              <div className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  이전
                </button>
                
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentStep + 1} / {allSteps.length}
                </span>
                
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-6 py-2 ${getDifficultyButtonStyle()} text-white rounded-lg transition-colors`}
                >
                  {currentStep === allSteps.length - 1 ? (
                    <>
                      <Play className="h-4 w-4" />
                      게임 시작
                    </>
                  ) : (
                    <>
                      다음
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}