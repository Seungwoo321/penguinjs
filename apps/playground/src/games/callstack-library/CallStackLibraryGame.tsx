'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { GamePanel, CodeEditor, Button, ThemeToggle } from '@penguinjs/ui'
import { Play, RotateCcw, Lightbulb, ChevronRight, ChevronLeft, Home, Globe, Lock, Star, Trophy, BookOpen, Layers, HelpCircle, Gauge } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { CallStackEngine } from './game-engine'
import { GameManager } from '@/games/shared/GameManager'
import { GameDifficulty } from '@/games/shared/types'
import { CallStackLevel, QueueItem, StackItem, QueueType, CallStackGameState } from './types'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useDarkModeDetection } from './hooks/useCSSThemeSync'
import { IntegratedCallStackBoard } from './IntegratedCallStackBoard'
import { EnhancedCallStackBoard } from './EnhancedCallStackBoard'
import { UniversalQueueBoard } from './UniversalQueueBoard'
import { GameGuideModal } from './GameGuideModal'
import { DebugInfoPanel } from './components/DebugInfoPanel'
import { useLayoutType } from './hooks/useLayoutType'
import { getDelay, AnimationSpeed } from './constants/animationConfig'
import { LayoutRenderer } from './components/layout/LayoutRenderer'
import { getLayoutType, getLayoutConfig } from './utils/layoutClassifier'
import { GameData, GameHandlers } from './types/layout'
import { useStageNavigation } from '@/games/shared/hooks/useStageNavigation'
import { CALLSTACK_STAGE_RANGES } from './game-config'
import { simulateExecution, interpolateFromSnapshots, SimulatorConfig } from './utils/executionSimulator'
import { simulateEventLoop, createEmptyQueueSnapshot } from './utils/queueSimulator'
import { QueueStatesSnapshot, EventLoopStep, QueueValidationResult } from './types/layout'
import { isValidLayoutType, isValidDifficulty, isValidStage, safeArray } from './utils/validation'
import { useCallStackLibraryContext, ActionType } from './contexts/CallStackLibraryContext'
import { getRelativeStageNumber, getAbsoluteStageNumber } from './utils/stageMapping'

interface CallStackLibraryGameProps {
  onScoreUpdate?: (score: number) => void
  searchParams?: {
    difficulty?: string
    stage?: string
  }
}

export function CallStackLibraryGame({ onScoreUpdate, searchParams }: CallStackLibraryGameProps) {
  // 다크모드 감지
  const isDarkMode = useDarkModeDetection()
  
  // 마운트 상태 먼저 확인
  const [mounted, setMounted] = useState(false)
  
  // CSS 변수는 이미 동기화됨
  
  // URL 파라미터로부터 초기 값 설정 (검증 포함)
  const rawDifficulty = searchParams?.difficulty
  const urlDifficulty = isValidDifficulty(rawDifficulty) ? rawDifficulty : null
  const rawStage = searchParams?.stage ? parseInt(searchParams.stage, 10) : null
  const urlStage = isValidStage(rawStage) ? rawStage : null
  
  // 난이도에 맞는 기본 스테이지 설정
  const getDefaultStage = (difficulty: GameDifficulty) => {
    return CALLSTACK_STAGE_RANGES[difficulty].min
  }
  
  // URL에서 difficulty만 있고 stage가 없는 경우, 해당 difficulty의 기본 스테이지 사용
  const initialDifficulty = urlDifficulty || 'beginner'
  const initialStage = urlStage || getDefaultStage(initialDifficulty)
  
  // console.log 제거 (프로덕션 빌드 경고 방지)
  
  // 통합된 게임 설정 상태
  const [gameConfig, setGameConfig] = useState({
    difficulty: initialDifficulty,
    stage: initialStage
  })
  const [userOrder, setUserOrder] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)
  const [seenStages, setSeenStages] = useState<Set<number>>(new Set())
  const abortControllerRef = useRef<AbortController | null>(null)
  const [microtaskQueue, setMicrotaskQueue] = useState<QueueItem[]>([])
  const [macrotaskQueue, setMacrotaskQueue] = useState<QueueItem[]>([])
  const [simulationSpeed, setSimulationSpeed] = useState<AnimationSpeed>('normal')
  
  // 타입 E 전용 상태
  const [userSnapshots, setUserSnapshots] = useState<Record<number, StackItem[]>>({})
  const [callstackHistory, setCallstackHistory] = useState<StackItem[][]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false)
  const [breakpoints, setBreakpoints] = useState<number[]>([])
  const [executionPath, setExecutionPath] = useState<number[]>([])
  const [validationResults, setValidationResults] = useState<Record<number, boolean>>({})
  
  // Layout B 전용 상태
  const [queueStates, setQueueStates] = useState<Record<number, QueueStatesSnapshot>>({})
  const [currentQueueStates, setCurrentQueueStates] = useState<QueueStatesSnapshot>()
  const [eventLoopSteps, setEventLoopSteps] = useState<EventLoopStep[]>([])
  const [queueValidationResults, setQueueValidationResults] = useState<Record<number, QueueValidationResult>>({})
  const [highlightedQueue, setHighlightedQueue] = useState<string | undefined>()
  
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  
  // 모든 실행 단계의 정확한 스택 상태 계산
  const calculateAllStackStates = (level: CallStackLevel): StackItem[][] => {
    // simulationSteps가 있으면 시뮬레이터 사용
    if (level.simulationSteps && level.simulationSteps.length > 0) {
      // 레이아웃별 시뮬레이터 설정
      const layoutType = getLayoutType(level.difficulty, level.stageNumber)
      const config: SimulatorConfig = {
        mappingStrategy: 'flexible',
        // 필요시 레이아웃별 커스터마이징 가능
        stackItemFactory: layoutType === 'B' || layoutType === 'C' || layoutType === 'D' 
          ? (funcName, index) => ({
              // 큐 타입별 추가 속성
              queueType: getQueueTypeForFunction(funcName)
            })
          : undefined
      }
      
      const result = simulateExecution(level, config)
      return result
    }
    
    // simulationSteps가 없는 경우 expectedSnapshots 기반 보간
    const result = interpolateFromSnapshots(level)
    
    // Fallback: 결과가 비어있거나 문제가 있으면 expectedSnapshots로 직접 생성
    if (result.length === 0 || result.every(stack => stack.length === 0) || result.length < (level.executionSteps?.length || 0)) {
      const executionStepsLength = level.executionSteps?.length || 0
      const fallbackResult: StackItem[][] = []
      
      for (let i = 0; i < executionStepsLength; i++) {
        if (level.expectedSnapshots && level.expectedSnapshots[i]) {
          // expectedSnapshots에 해당 단계가 있으면 사용
          fallbackResult[i] = level.expectedSnapshots[i].map((item, idx) => ({
            ...item,
            id: item.id || `${item.functionName}-fallback-${i}-${idx}`,
            height: item.height || 40,
            color: item.color || 'rgb(var(--game-callstack-queue-secondary))',
            isGlobalContext: item.isGlobalContext || item.functionName === '<global>'
          }))
        } else {
          // 없으면 가장 가까운 이전 체크포인트의 스택 상태 사용
          const previousCheckpoint = level.snapshotCheckpoints?.slice().reverse().find(cp => cp < i)
          if (previousCheckpoint !== undefined && level.expectedSnapshots && level.expectedSnapshots[previousCheckpoint]) {
            fallbackResult[i] = level.expectedSnapshots[previousCheckpoint].map((item, idx) => ({
              ...item,
              id: item.id || `${item.functionName}-fallback-${i}-${idx}`,
              height: item.height || 40,
              color: item.color || 'rgb(var(--game-callstack-queue-secondary))',
              isGlobalContext: item.isGlobalContext || item.functionName === '<global>'
            }))
          } else {
            // 전역 컨텍스트만 있는 기본 상태
            fallbackResult[i] = [{ 
              id: `global-fallback-${i}`, 
              functionName: '<global>', 
              isGlobalContext: true, 
              color: 'rgb(var(--game-callstack-queue-secondary))', 
              height: 40 
            }]
          }
        }
      }
      
      return fallbackResult
    }
    
    return result
  }

  // 현재 표시할 스택 계산 (Type E 전용)
  const getCurrentDisplayStack = (): StackItem[] => {
    if (!currentLevel || currentLayoutType !== 'E') return []
    
    const checkpoints = currentLevel.snapshotCheckpoints || []
    const isCheckpoint = checkpoints.includes(currentStep)
    
    const computedStack = callstackHistory[currentStep] || []
    const userStack = userSnapshots[currentStep] || []
    
    
    if (isCheckpoint) {
      // 체크포인트인 경우 사용자가 구성한 스택 표시
      return userStack
    } else {
      // 체크포인트가 아닌 경우 계산된 스택 상태 표시
      return computedStack
    }
  }
  
  // 함수별 큐 타입 결정 (Layout B, C, D용)
  const getQueueTypeForFunction = (functionName: string): QueueType | undefined => {
    if (functionName.includes('setTimeout')) return 'macrotask'
    if (functionName.includes('Promise') || functionName.includes('queueMicrotask')) return 'microtask'
    if (functionName.includes('requestAnimationFrame')) return 'animation'
    return 'callstack'
  }
  
  // 게임 엔진과 매니저 초기화
  const [gameEngine] = useState(() => new CallStackEngine())
  const [gameManager] = useState(() => GameManager.getInstance())
  const [gameState, setGameState] = useState(gameEngine.getGameState())
  
  const [currentLevel, setCurrentLevel] = useState<CallStackLevel | null>(null)
  const [availableFunctions, setAvailableFunctions] = useState<{name: string, queueType?: QueueType}[]>([])
  
  // Context 사용 - 모든 useState 이후에 위치
  const { state: contextState, dispatch } = useCallStackLibraryContext();
  
  // 레이아웃 타입 결정 - custom hook은 다른 hooks와 함께 위치
  const layoutInfo = useLayoutType(gameConfig.difficulty, gameConfig.stage)
  
  // 스테이지 네비게이션 훅 사용 - 다른 hooks와 함께 위치
  const { handleStageChange, canGoPrev, canGoNext } = useStageNavigation(
    CALLSTACK_STAGE_RANGES,
    gameConfig.stage,
    gameConfig.difficulty,
    (newStage) => {
      setGameConfig(prev => ({
        ...prev,
        stage: newStage
      }))
    }
  )
  
  // 기존 코드 호환성을 위한 변수
  const selectedDifficulty = gameConfig.difficulty
  const currentStage = gameConfig.stage
  const currentLayoutType = getLayoutType(selectedDifficulty, currentStage)
  const layoutConfig = getLayoutConfig(currentLayoutType)
  
  // URL 파라미터 변경 감지 및 상태 동기화
  useEffect(() => {
    if (urlDifficulty && urlDifficulty !== gameConfig.difficulty) {
      const newStage = urlStage || getDefaultStage(urlDifficulty)
      setGameConfig({
        difficulty: urlDifficulty,
        stage: newStage
      })
    }
  }, [urlDifficulty, urlStage, gameConfig.difficulty])
  
  // 난이도 전환 시점에 가이드 표시
  useEffect(() => {
    // 이미 본 스테이지인지 확인
    if (!seenStages.has(currentStage)) {
      // 처음 보는 스테이지면 추가
      setSeenStages(prev => new Set(prev).add(currentStage))
      
      // 난이도 전환 시점(중급 시작: 9, 고급 시작: 17, 고급 새로운 큐 도입: 22, 고급 7: 23, 고급 8: 24)에 가이드 표시
      if (currentStage === 9 || currentStage === 17 || currentStage === 22 || currentStage === 23 || currentStage === 24) {
        setShowGuide(true)
      }
    }
  }, [currentStage, seenStages])
  
  // 현재 레벨 변경 추적
  useEffect(() => {
    // console.log('🎮 currentLevel changed:', currentLevel ? { 
    //   id: currentLevel.id, 
    //   title: currentLevel.title, 
    //   stageNumber: currentLevel.stageNumber,
    //   difficulty: currentLevel.difficulty 
    // } : 'null')
  }, [currentLevel])
  
  // 디버그 로깅
  useEffect(() => {
    // console.log('CallStackLibraryGame Debug:', {
    //   selectedDifficulty,
    //   currentStage,
    //   currentLayoutType,
    //   currentLevel: !!currentLevel,
    //   layoutConfig
    // })
  }, [selectedDifficulty, currentStage, currentLayoutType, currentLevel])
  

  // 새로운 레이아웃 시스템을 위한 핸들러 함수들
  const handleFunctionSelect = (functionName: string) => {
    if (isExecuting) return
    // 중복 체크: 이미 추가된 함수는 무시
    setUserOrder(prev => {
      if (prev.includes(functionName)) {
        return prev // 이미 있으면 추가하지 않음
      }
      return [...prev, functionName]
    })
  }

  const handleFunctionRemove = (index: number) => {
    if (isExecuting) return
    setUserOrder(prev => prev.filter((_, i) => i !== index))
  }

  // Layout E 전용 제출 함수
  const handleSubmitForLayoutE = () => {
    if (!currentLevel || currentLayoutType !== 'E') return
    
    const checkpoints = currentLevel.snapshotCheckpoints || []
    const correctCount = checkpoints.filter(cp => validationResults[cp] === true).length
    const totalCount = checkpoints.length
    const score = Math.round((correctCount / totalCount) * 100)
    
    setAttempts(attempts + 1)
    
    try {
      gameManager.startGameSession('callstack-library', selectedDifficulty, currentStage)
      gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
      
      if (correctCount === totalCount) {
        setMessage({ 
          type: 'success', 
          text: `🎉 완벽합니다! 모든 스냅샷이 정확합니다. (점수: ${score}점)` 
        })
        
        if (onScoreUpdate) {
          onScoreUpdate(score)
        }
        
        gameManager.completeStage(score)
        
        // 다음 스테이지 안내
        const progress = gameManager.getGameProgress('callstack-library', selectedDifficulty)
        if (progress && currentStage < gameEngine.getTotalStages(selectedDifficulty)) {
          setTimeout(() => {
            setMessage({ 
              type: 'success', 
              text: `모든 스냅샷을 완료했습니다! 우측 하단의 "다음 스테이지" 버튼으로 계속 진행할 수 있습니다.` 
            })
          }, 2000)
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: `${totalCount}개 중 ${correctCount}개만 정답입니다. 다시 확인해보세요.` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      })
    }
  }

  // 답안 확인
  const handleCheckAnswer = () => {
    // console.log('handleCheckAnswer called', { currentLevel, userOrder, currentLayoutType })
    if (!currentLevel) return
    
    // Layout E는 별도 처리
    if (currentLayoutType === 'E') {
      const checkpoints = currentLevel.snapshotCheckpoints || []
      const validatedCount = checkpoints.filter(cp => validationResults[cp] !== undefined).length
      
      if (validatedCount === 0) {
        setMessage({ 
          type: 'error', 
          text: '먼저 각 체크포인트에서 스냅샷을 검증해주세요!' 
        })
        return
      }
      
      if (validatedCount < checkpoints.length) {
        setMessage({ 
          type: 'info', 
          text: `${checkpoints.length}개 중 ${validatedCount}개의 체크포인트만 검증했습니다. 모든 체크포인트를 검증해주세요.` 
        })
        return
      }
      
      handleSubmitForLayoutE()
      return
    }
    
    // Layout B 전용 제출 로직
    if (currentLayoutType === 'B') {
      handleSubmitForLayoutB()
      return
    }
    
    // 기존 로직 (Layout A, A+, C, D)
    if (userOrder.length === 0) {
      setMessage({ 
        type: 'error', 
        text: '함수를 배치한 후 정답을 확인해주세요! 🎯' 
      })
      return
    }
    
    setAttempts(attempts + 1)
    
    try {
      gameManager.startGameSession('callstack-library', selectedDifficulty, currentStage)
      gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
      
      const result = gameEngine.validateAnswer(currentLevel, userOrder, currentLayoutType)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        
        if (result.score && onScoreUpdate) {
          onScoreUpdate(result.score)
        }
        
        gameManager.completeStage(result.score || 100)
        
        // 다음 스테이지 안내 메시지 (자동 이동하지 않음)
        const progress = gameManager.getGameProgress('callstack-library', selectedDifficulty)
        if (progress && currentStage < gameEngine.getTotalStages(selectedDifficulty)) {
          setTimeout(() => {
            setMessage({ 
              type: 'success', 
              text: `🎉 정답입니다! 코드 실행으로 확인해보세요. 우측 하단의 "다음 스테이지" 버튼으로 계속 진행할 수 있습니다.` 
            })
          }, 1500)
        }
      } else {
        setMessage({ type: 'error', text: result.message })
        if (result.hint) {
          setTimeout(() => {
            setMessage({ type: 'info', text: `힌트: ${result.hint}` })
          }, 2000)
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      })
    }
  }

  // 힌트 표시
  const handleShowHint = () => {
    setShowHints(!showHints)
    if (!showHints) {
      setHintsUsed(hintsUsed + 1)
    }
  }

  // 코드 실행 시뮬레이션 함수는 아래에서 정의됨 (타입 E 핸들러들 이후)
  
  // 타입 E 전용 핸들러들을 먼저 정의
  const handleReorderSnapshot = useCallback((step: number, newOrder: StackItem[]) => {
    setUserSnapshots(prev => ({
      ...prev,
      [step]: newOrder
    }))
  }, [])
  
  const handleAddToSnapshot = useCallback((funcName: string) => {
    const newItem: StackItem = {
      id: `${funcName}-${Date.now()}`,
      functionName: funcName,
      height: 40,
      color: 'rgb(var(--game-callstack-queue-primary))' // 글로벌 CSS 변수 사용
    }
    
    setUserSnapshots(prev => ({
      ...prev,
      [currentStep]: [...(prev[currentStep] || []), newItem]
    }))
  }, [currentStep])
  
  const handleRemoveFromSnapshot = useCallback((index: number) => {
    setUserSnapshots(prev => ({
      ...prev,
      [currentStep]: (prev[currentStep] || []).filter((_, i) => i !== index)
    }))
  }, [currentStep])
  
  const handleStepChange = useCallback((step: number) => {
    // console.log('handleStepChange called with step:', step)
    setCurrentStep(step)
  }, [])
  
  const handlePlayPause = useCallback(() => {
    setIsTimelinePlaying(prev => !prev)
  }, [])
  
  const handleValidateSnapshot = useCallback(() => {
    if (!currentLevel) return
    
    // 현재 스텝이 실제로 체크포인트인지 확인
    const checkpoints = currentLevel.snapshotCheckpoints || []
    if (!checkpoints.includes(currentStep)) {
      setMessage({
        type: 'info',
        text: '이 단계는 검증이 필요하지 않은 단계입니다.'
      })
      setTimeout(() => setMessage(null), 2000)
      return
    }
    
    const currentSnapshot = userSnapshots[currentStep] || []
    const expectedSnapshot = currentLevel.expectedSnapshots?.[currentStep] || []
    
    // 이미 검증이 실패한 상태에서 다시 시도 버튼을 클릭한 경우
    if (validationResults[currentStep] === false) {
      // 현재 스냅샷을 초기화
      setUserSnapshots(prev => ({
        ...prev,
        [currentStep]: []
      }))
      // 검증 결과도 초기화
      setValidationResults(prev => {
        const newResults = { ...prev }
        delete newResults[currentStep]
        return newResults
      })
      setMessage({
        type: 'info',
        text: '스냅샷을 초기화했습니다. 다시 구성해보세요.'
      })
      setTimeout(() => setMessage(null), 2000)
      return
    }
    
    // 스냅샷 검증 로직
    const isValid = gameEngine.validateSnapshot(currentSnapshot, expectedSnapshot)
    
    setValidationResults(prev => ({
      ...prev,
      [currentStep]: isValid
    }))
    
    setMessage({
      type: isValid ? 'success' : 'error',
      text: isValid ? '정답입니다! 스택 상태가 올바릅니다.' : '틀렸습니다. 스택 상태를 다시 확인해보세요.'
    })
    
    // 메시지 자동 숨김
    setTimeout(() => setMessage(null), 3000)
    
    // 모든 체크포인트 검증 완료 확인
    const allValidated = checkpoints.every(checkpoint => 
      validationResults[checkpoint] === true || (checkpoint === currentStep && isValid)
    )
    
    if (allValidated && isValid) {
      // 모든 검증 완료 시 자동으로 점수 계산
      setTimeout(() => {
        const correctCount = checkpoints.filter(cp => 
          validationResults[cp] === true || (cp === currentStep && isValid)
        ).length
        const totalCount = checkpoints.length
        const score = Math.round((correctCount / totalCount) * 100)
        
        setAttempts(prev => prev + 1)
        
        try {
          gameManager.startGameSession('callstack-library', selectedDifficulty, currentStage)
          gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
          
          setMessage({ 
            type: 'success', 
            text: `🎉 완벽합니다! 모든 스냅샷이 정확합니다. (점수: ${score}점)` 
          })
          
          if (onScoreUpdate) {
            onScoreUpdate(score)
          }
          
          gameManager.completeStage(score)
          
          // 다음 스테이지 안내
          const progress = gameManager.getGameProgress('callstack-library', selectedDifficulty)
          if (progress && currentStage < gameEngine.getTotalStages(selectedDifficulty)) {
            setTimeout(() => {
              setMessage({ 
                type: 'success', 
                text: `모든 스냅샷을 완료했습니다! 우측 하단의 "다음 스테이지" 버튼으로 계속 진행할 수 있습니다.` 
              })
            }, 2000)
          }
        } catch (error) {
          setMessage({ 
            type: 'error', 
            text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
          })
        }
      }, 1500)
    }
  }, [currentLevel, currentStep, userSnapshots, gameEngine, validationResults, attempts, hintsUsed, gameManager, selectedDifficulty, currentStage, onScoreUpdate])

  // Layout B 전용 핸들러들
  const handleQueueStateChange = useCallback((step: number, newQueueStates: QueueStatesSnapshot) => {
    setQueueStates(prev => ({
      ...prev,
      [step]: newQueueStates
    }))
    
    // Context에 큐 상태 업데이트
    dispatch({ type: ActionType.UPDATE_CURRENT_QUEUE_STATES, payload: newQueueStates })
    
    // 현재 단계인 경우 현재 큐 상태도 업데이트
    if (step === currentStep) {
      setCurrentQueueStates(newQueueStates)
    }
  }, [currentStep, dispatch])

  const handleValidateQueueStep = useCallback((step: number) => {
    if (!currentLevel || !eventLoopSteps[step]) {
      return
    }

    const userQueueStates = queueStates[step]

    if (!userQueueStates) {
      setMessage({
        type: 'error',
        text: '먼저 큐 상태를 구성해주세요.'
      })
      setTimeout(() => setMessage(null), 2000)
      return
    }

    // 실제 검증: eventLoopStep의 beforeState 또는 afterState와 비교
    const expectedStep = eventLoopSteps[step]
    const expectedState = expectedStep.afterState || expectedStep.beforeState
    
    if (!expectedState) {
      // 예상 상태가 없으면 기본 검증
      const isValid = true
      const feedbackMessage = '✅ 정답입니다!'
      
      const validationResult: QueueValidationResult = {
        callstack: true,
        microtask: true,
        macrotask: true,
        isValid,
        message: feedbackMessage
      }
      
      setQueueValidationResults(prev => ({
        ...prev,
        [step]: validationResult
      }))
      
      dispatch({ type: ActionType.ADD_QUEUE_VALIDATION_RESULT, payload: { step, result: validationResult } })
      
      setMessage({
        type: 'success',
        text: feedbackMessage
      })
      
      setTimeout(() => setMessage(null), 3000)
      return
    }
    
    // 각 큐별로 검증
    const validateQueue = (queueName: string, userQueue: any[], expectedQueue: any[]) => {
      if (userQueue.length !== expectedQueue.length) {
        return false
      }
      
      return userQueue.every((item, index) => {
        const expected = expectedQueue[index]
        // 함수 이름 비교 (functionName 또는 name 필드)
        return (item.functionName || item.name) === (expected.functionName || expected.name || expected)
      })
    }
    
    // 사용자가 설정한 큐 상태와 예상 상태 비교
    const callStackValid = validateQueue('callstack', 
      userQueueStates.callstack || [], 
      expectedState.callstack || []
    )
    const microtaskValid = validateQueue('microtask',
      userQueueStates.microtask || [],
      expectedState.microtask || []
    )
    const macrotaskValid = validateQueue('macrotask',
      userQueueStates.macrotask || [],
      expectedState.macrotask || []
    )
    
    // 추가 큐 타입 검증 (Layout C, D)
    let animationValid = true
    let generatorValid = true
    let ioValid = true
    let workerValid = true
    let priorityValid = true
    
    if (expectedState.animation !== undefined) {
      animationValid = validateQueue('animation',
        userQueueStates.animation || [],
        expectedState.animation || []
      )
    }
    
    if (expectedState.generator !== undefined) {
      generatorValid = validateQueue('generator',
        userQueueStates.generator || [],
        expectedState.generator || []
      )
    }
    
    if (expectedState.io !== undefined) {
      ioValid = validateQueue('io',
        userQueueStates.io || [],
        expectedState.io || []
      )
    }
    
    if (expectedState.worker !== undefined) {
      workerValid = validateQueue('worker',
        userQueueStates.worker || [],
        expectedState.worker || []
      )
    }
    
    if (expectedState.priority !== undefined) {
      priorityValid = validateQueue('priority',
        userQueueStates.priority || [],
        expectedState.priority || []
      )
    }

    const isValid = callStackValid && microtaskValid && macrotaskValid && 
                   animationValid && generatorValid && ioValid && 
                   workerValid && priorityValid

    // 구체적인 피드백 메시지 생성
    const errorMessages: string[] = []
    if (!callStackValid) errorMessages.push('콜스택')
    if (!microtaskValid) errorMessages.push('마이크로태스크')
    if (!macrotaskValid) errorMessages.push('매크로태스크')
    if (!animationValid) errorMessages.push('애니메이션')
    if (!generatorValid) errorMessages.push('제너레이터')
    if (!ioValid) errorMessages.push('I/O')
    if (!workerValid) errorMessages.push('워커')
    if (!priorityValid) errorMessages.push('우선순위')
    
    const feedbackMessage = isValid 
      ? '✅ 정답입니다! 모든 큐가 올바르게 구성되었습니다.' 
      : `❌ ${errorMessages.join(', ')} 큐의 상태를 다시 확인해주세요.`

    const validationResult: QueueValidationResult = {
      callstack: callStackValid,
      microtask: microtaskValid,
      macrotask: macrotaskValid,
      isValid,
      message: feedbackMessage
    }

    setQueueValidationResults(prev => ({
      ...prev,
      [step]: validationResult
    }))
    
    // Context에 검증 결과 저장
    dispatch({ type: ActionType.ADD_QUEUE_VALIDATION_RESULT, payload: { step, result: validationResult } })

    setMessage({
      type: isValid ? 'success' : 'error',
      text: validationResult.message || (isValid ? '정답입니다!' : '틀렸습니다.')
    })

    setTimeout(() => setMessage(null), 3000)

    // 모든 단계 검증 완료 확인
    const allStepsValidated = eventLoopSteps.every((_, index) => 
      queueValidationResults[index]?.isValid === true || (index === step && isValid)
    )

    if (allStepsValidated && isValid) {
      // 모든 검증 완료 시 점수 계산
      setTimeout(() => {
        const score = 100 // Layout B는 100점 만점
        setAttempts(prev => prev + 1)
        
        try {
          gameManager.startGameSession('callstack-library', selectedDifficulty, currentStage)
          gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
          gameManager.completeStage(score)
          
          setMessage({ 
            type: 'success', 
            text: `모든 큐 상태를 완료했습니다! 다음 스테이지로 진행할 수 있습니다.` 
          })
        } catch (error) {
          setMessage({ 
            type: 'error', 
            text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
          })
        }
      }, 1500)
    }
  }, [currentLevel, eventLoopSteps, queueStates, queueValidationResults, attempts, hintsUsed, gameManager, selectedDifficulty, currentStage])

  // Layout B 전용 제출 함수
  const handleSubmitForLayoutB = useCallback(() => {
    if (!currentLevel || !eventLoopSteps.length) {
      setMessage({ 
        type: 'error', 
        text: '큐 상태를 먼저 구성해주세요! 🎯' 
      })
      return
    }

    setAttempts(attempts + 1)
    
    try {
      gameManager.startGameSession('callstack-library', selectedDifficulty, currentStage)
      gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
      
      // 모든 단계가 검증되었는지 확인
      const totalSteps = eventLoopSteps.length
      const validatedSteps = Object.values(queueValidationResults).filter(result => result.isValid === true).length
      const completionRate = (validatedSteps / totalSteps) * 100
      
      if (validatedSteps === totalSteps) {
        // 완전 정답
        const finalScore = Math.max(100 - (attempts * 10) - (hintsUsed * 5), 70)
        
        setMessage({ 
          type: 'success', 
          text: `🎉 완벽합니다! 모든 큐 상태를 정확히 구성했습니다! (${validatedSteps}/${totalSteps} 정답)` 
        })
        
        if (onScoreUpdate) {
          onScoreUpdate(finalScore)
        }
        
        gameManager.completeStage(finalScore)
        
        // 다음 스테이지 안내
        const progress = gameManager.getGameProgress('callstack-library', selectedDifficulty)
        if (progress && currentStage < gameEngine.getTotalStages(selectedDifficulty)) {
          setTimeout(() => {
            setMessage({ 
              type: 'success', 
              text: `🎉 정답입니다! 우측 하단의 "다음 스테이지" 버튼으로 계속 진행할 수 있습니다.` 
            })
          }, 1500)
        }
      } else if (completionRate >= 70) {
        // 부분 정답
        const partialScore = Math.max((completionRate / 100) * 80 - (attempts * 5) - (hintsUsed * 3), 50)
        
        setMessage({ 
          type: 'error', 
          text: `부분 정답입니다. ${validatedSteps}/${totalSteps} 단계 정답 (${Math.round(completionRate)}%). 나머지 단계를 확인해보세요.` 
        })
        
        if (onScoreUpdate) {
          onScoreUpdate(Math.round(partialScore))
        }
      } else {
        // 오답
        setMessage({ 
          type: 'error', 
          text: `더 많은 단계를 정확히 구성해보세요. 현재 ${validatedSteps}/${totalSteps} 단계 정답 (${Math.round(completionRate)}%)` 
        })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      })
    }
  }, [currentLevel, eventLoopSteps, queueValidationResults, attempts, hintsUsed, gameManager, selectedDifficulty, currentStage, onScoreUpdate])

  const handleQueueItemClick = useCallback((queueType: string, item: any) => {
    setHighlightedQueue(queueType)
    setTimeout(() => setHighlightedQueue(undefined), 1000)
  }, [])


  // 새로운 레이아웃 시스템을 위한 데이터 준비
  const gameData: GameData = {
    currentCode: currentLevel?.code || '',
    currentLine: currentLevel?.executionSteps?.[currentStep]?.currentLine,
    callstack: gameState.currentStack,
    availableFunctions: availableFunctions.map(f => f.name),
    userAnswer: userOrder,
    executionSteps: currentLayoutType === 'E' ? (currentLevel?.executionSteps || []) : (currentLevel?.executionSteps || []),
    currentStep: currentStep,
    expectedCount: currentLevel?.expectedOrder?.length || 0,
    hints: currentLevel?.hints || [],
    showHints: showHints,
    hintsUsed: hintsUsed,
    isExecuting: isExecuting,
    // 타입 E 전용 데이터
    callstackHistory: callstackHistory,
    currentDisplayStack: getCurrentDisplayStack(), // 현재 표시할 스택
    isTimelinePlaying: isTimelinePlaying,
    breakpoints: breakpoints,
    executionPath: executionPath,
    userSnapshots: userSnapshots,
    snapshotCheckpoints: currentLevel?.snapshotCheckpoints || [],
    validationResults: validationResults,
    // Layout B 전용 데이터
    queueStates: queueStates,
    currentQueueStates: currentQueueStates,
    eventLoopSteps: eventLoopSteps,
    queueValidationResults: queueValidationResults,
    highlightedQueue: highlightedQueue
  }

  const gameHandlers: GameHandlers = {
    onFunctionSelect: handleFunctionSelect,
    onSnapshotChange: (step: number, snapshot: any) => {
      // console.log('Snapshot change:', step, snapshot)
    },
    onSubmit: handleCheckAnswer,
    onReset: () => setUserOrder([]),
    onHint: handleShowHint,
    onSimulate: () => {
      if (handleRunSimulation) {
        handleRunSimulation()
      }
    },
    onReorderFunctions: (newOrder: string[]) => setUserOrder(newOrder),
    onRemoveFunction: (index: number) => handleFunctionRemove(index),
    // 타입 E 전용 핸들러들
    onStepChange: handleStepChange,
    onPlayPause: handlePlayPause,
    onAddToSnapshot: handleAddToSnapshot,
    onRemoveFromSnapshot: handleRemoveFromSnapshot,
    onValidateSnapshot: handleValidateSnapshot,
    onReorderSnapshot: handleReorderSnapshot,
    // Layout B 전용 핸들러들
    onQueueStateChange: handleQueueStateChange,
    onValidateQueueStep: handleValidateQueueStep,
    onQueueItemClick: handleQueueItemClick
  }
  
  // updateLevelFunctions - 레벨의 함수 목록만 업데이트 (순수 함수)
  const updateLevelFunctions = useCallback((level: CallStackLevel, difficulty: GameDifficulty, stage: number) => {
    // 레이아웃 타입에 따라 함수 목록 생성
    const layoutType = getLayoutType(difficulty, stage)
    
    if (layoutType === 'E') {
      // 타입 E: 실행 과정에서 스택에 올라가는 모든 함수들을 추출
      const stackableFunctions = new Set<string>()
      
      // 1. expectedSnapshots에서 함수 추출 (브레이크포인트 시점의 함수들)
      if (level.expectedSnapshots) {
        Object.values(level.expectedSnapshots).forEach(snapshot => {
          snapshot.forEach(item => {
            const funcName = typeof item === 'string' ? item : item.functionName
            stackableFunctions.add(funcName)
          })
        })
      }
      
      // 2. functionCalls에서 모든 호출된 함수 추출 (console.log 포함)
      const extractFunctionsFromCalls = (calls: any[]) => {
        calls?.forEach(call => {
          if (call.name) {
            stackableFunctions.add(call.name)
          }
          if (call.calls) {
            extractFunctionsFromCalls(call.calls)
          }
        })
      }
      
      if (level.functionCalls) {
        extractFunctionsFromCalls(level.functionCalls)
      }
      
      // 스택에 올라갈 수 있는 모든 함수들을 표시
      const orderedFunctions = Array.from(stackableFunctions).sort((a, b) => {
        // <global>을 항상 첫 번째로
        if (a === '<global>') return -1
        if (b === '<global>') return 1
        // 나머지는 알파벳 순서
        return a.localeCompare(b)
      })
      
      setAvailableFunctions(orderedFunctions.map(name => ({ name })))
    } else if (layoutType === 'A+' && level.simulationSteps) {
      // 타입 A+: 시작/종료 추적을 위한 함수 분리
      const functionStarts = new Set<string>()
      const functionEnds = new Set<string>()
      
      level.simulationSteps.forEach(step => {
        if (step !== 'main' && step !== 'main-return') {
          if (step.endsWith('-return')) {
            // 종료 함수는 '함수명 종료' 형식으로 표시
            const funcName = step.replace('-return', '')
            functionEnds.add(`${funcName} 종료`)
          } else {
            // 시작 함수는 그대로 표시
            functionStarts.add(step)
          }
        }
      })
      
      // 시작 함수들 먼저, 그 다음 종료 함수들
      const allFunctions = Array.from(functionStarts).concat(Array.from(functionEnds))
      
      setAvailableFunctions(allFunctions.map(name => ({ name })))
    } else if (layoutType === 'B' || layoutType === 'C' || layoutType === 'D') {
      // Layout B, C, D: 큐 타입 정보 포함
      if (level.functionCalls) {
        const funcsWithQueue: {name: string, queueType?: QueueType}[] = []
        const seen = new Set<string>()
        
        level.functionCalls.forEach(call => {
          if (!seen.has(call.name)) {
            funcsWithQueue.push({ name: call.name, queueType: call.queueType })
            seen.add(call.name)
          }
          call.calls?.forEach(subCall => {
            if (!seen.has(subCall.name)) {
              funcsWithQueue.push({ name: subCall.name, queueType: subCall.queueType })
              seen.add(subCall.name)
            }
          })
        })
        
        setAvailableFunctions(funcsWithQueue)
      } else {
        // functionCalls가 없는 경우 expectedOrder에서 기본 함수 목록 생성
        const uniqueFunctions = Array.from(new Set(level.expectedOrder || []))
        const defaultFunctions = uniqueFunctions.map(name => ({
          name,
          queueType: getQueueTypeForFunction(name)
        }))
        setAvailableFunctions(defaultFunctions)
      }
    } else {
      // 기본: 중복 제거한 함수 목록만 표시
      const uniqueFunctions = Array.from(new Set(level.expectedOrder))
      setAvailableFunctions(uniqueFunctions.map(name => ({ name })))
    }
  }, []) // 의존성 없음 - 순수한 함수 업데이트 로직

  // initializeLevel - 새로운 레벨 진입 시 모든 상태 초기화
  const initializeLevel = useCallback((difficulty: GameDifficulty, stage: number) => {
    const level = gameEngine.getLevelByStage(difficulty, stage)
    
    if (level) {
      // 실행 중이면 중단
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      setIsExecuting(false)
      
      // 모든 게임 상태 초기화
      setCurrentLevel(level)
      setUserOrder([])
      setShowHints(false)
      setHintsUsed(0)
      setAttempts(0)
      setMessage(null)
      setMicrotaskQueue([])
      setMacrotaskQueue([])
      gameEngine.resetGameState()
      setGameState(gameEngine.getGameState())
      
      // 타입 E 상태 완전 초기화
      setUserSnapshots({})
      setCurrentStep(0)
      setValidationResults({})
      setIsTimelinePlaying(false)
      setCallstackHistory([])
      setBreakpoints([])
      setExecutionPath([])
      
      // Layout B 상태 완전 초기화
      setQueueStates({})
      setCurrentQueueStates(createEmptyQueueSnapshot(0))
      setEventLoopSteps([])
      setQueueValidationResults({})
      setHighlightedQueue(undefined)
      
      // 레이아웃별 초기화
      const layoutType = getLayoutType(difficulty, stage)
      
      // 타입 E인 경우 추가 초기화
      if (layoutType === 'E' && level.snapshotCheckpoints && level.executionSteps) {
        // 이중 스택 시스템: 계산된 스택 + 사용자 스택
        const computedHistory = calculateAllStackStates(level)
        
        
        // 사용자 스냅샷은 체크포인트만 빈 상태로 초기화
        const initialUserSnapshots: Record<number, StackItem[]> = {}
        level.snapshotCheckpoints.forEach(checkpoint => {
          initialUserSnapshots[checkpoint] = []
        })
        
        
        setCallstackHistory(computedHistory) // 계산된 전체 스택 상태
        setUserSnapshots(initialUserSnapshots) // 사용자가 구성할 체크포인트만
        
        // 브레이크포인트와 실행 경로 설정
        setBreakpoints(level.breakpoints || [])
        // executionPath는 실제 코드 라인 번호들이어야 함 (executionSteps의 currentLine 필드 사용)
        const executionLineNumbers = level.executionSteps?.map(step => step.currentLine).filter(line => line !== undefined) || []
        setExecutionPath(executionLineNumbers)
      }
      
      // Layout B인 경우 이벤트 루프 시뮬레이션 초기화
      if (layoutType === 'B' && level.simulationSteps && level.executionSteps) {
        // 이벤트 루프 단계들 생성
        const loopSteps = simulateEventLoop(level, {
          includeConsoleLog: false, // Layout B에서는 console.log를 큐에 포함하지 않음
          maxQueueSize: 10
        })
        setEventLoopSteps(loopSteps)
        
        // Context에 이벤트 루프 단계 설정
        dispatch({ type: ActionType.SET_EVENT_LOOP_STEPS, payload: loopSteps })
        
        // 초기 큐 상태들 설정
        const initialQueueStates: Record<number, QueueStatesSnapshot> = {}
        loopSteps.forEach((step, index) => {
          initialQueueStates[index] = step.afterState
        })
        setQueueStates(initialQueueStates)
        
        // Context에 큐 상태 히스토리 설정
        dispatch({ type: ActionType.SET_QUEUE_STATES_HISTORY, payload: initialQueueStates })
        
        // 첫 번째 단계의 큐 상태를 현재 상태로 설정
        if (loopSteps.length > 0) {
          setCurrentQueueStates(loopSteps[0].beforeState)
          // Context에 현재 큐 상태 설정
          dispatch({ type: ActionType.UPDATE_CURRENT_QUEUE_STATES, payload: loopSteps[0].beforeState })
        }
      }
      
      // 함수 목록 업데이트
      updateLevelFunctions(level, difficulty, stage)
    }
  }, [gameEngine, updateLevelFunctions])
  
  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // 게임 등록 (한 번만)
  useEffect(() => {
    if (!mounted) return
    
    const config = gameEngine.getGameConfig()
    gameManager.registerGame(config)
    
    // 처음 방문 시 가이드 표시
    if (!hasSeenGuide) {
      setShowGuide(true)
      setHasSeenGuide(true)
    }
  }, [mounted])
  
  // 레벨 로드
  useEffect(() => {
    // console.log('🔄 Level load useEffect triggered:', { mounted, gameConfig })
    if (!mounted) return
    
    // 유효한 difficulty-stage 조합인지 검증
    const stageRange = CALLSTACK_STAGE_RANGES[gameConfig.difficulty]
    const isValidStage = gameConfig.stage >= stageRange.min && gameConfig.stage <= stageRange.max
    
    if (!isValidStage) {
      // console.warn('⚠️ Invalid stage for difficulty:', { 
      //   difficulty: gameConfig.difficulty, 
      //   stage: gameConfig.stage, 
      //   validRange: stageRange 
      // })
      // 유효한 스테이지로 자동 보정
      const correctedStage = stageRange.min
      setGameConfig(prev => ({
        ...prev,
        stage: correctedStage
      }))
      return // 다음 useEffect 사이클에서 올바른 값으로 실행
    }
    
    initializeLevel(gameConfig.difficulty, gameConfig.stage)
  }, [mounted, gameConfig, initializeLevel])
  
  // 난이도 변경 - useCallback으로 메모이제이션하고 원자적 상태 업데이트
  const handleDifficultyChange = useCallback((difficulty: GameDifficulty) => {
    // console.log('🎚️ handleDifficultyChange called:', { difficulty, currentDifficulty: selectedDifficulty, currentStage })
    
    const progress = gameManager.getGameProgress('callstack-library', difficulty)
    // console.log('📈 Progress for', difficulty + ':', progress)
    
    if (!progress?.isUnlocked) {
      setMessage({ 
        type: 'error', 
        text: `${difficulty === 'intermediate' ? '중급' : '고급'} 난이도는 이전 난이도를 완료해야 잠금 해제됩니다.` 
      })
      return
    }
    
    // 난이도별 시작 스테이지 계산
    const startStage = CALLSTACK_STAGE_RANGES[difficulty].min
    const targetStage = progress.currentStage || startStage
    // console.log('🎯 Setting new stage:', { startStage, targetStage, range: CALLSTACK_STAGE_RANGES[difficulty] })
    
    // 원자적 상태 업데이트 - React 18의 자동 배치 활용
    setGameConfig({ 
      difficulty, 
      stage: targetStage 
    })
    
    // initializeLevel은 useEffect에서 자동으로 호출됨
  }, [gameManager, selectedDifficulty, currentStage])
  
  // 코드 실행 시뮬레이션
  const handleRunSimulation = () => {
    if (!currentLevel || isExecuting) return
    
    if (userOrder.length === 0) {
      setMessage({ 
        type: 'error', 
        text: '함수를 배치한 후 코드 실행을 확인해주세요! 🚀' 
      })
      return
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsExecuting(true)
    setMicrotaskQueue([])
    setMacrotaskQueue([])
    gameEngine.resetGameState()
    setGameState(gameEngine.getGameState())
    
    // 고급 스테이지 시뮬레이션
    if (selectedDifficulty === 'advanced' && currentLevel.queueTypes) {
      // 고급 스테이지 2: 마이크로태스크 vs 매크로태스크
      if (currentStage === 2) {
      const simulateEventLoop = async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const simulationStack: StackItem[] = []
        const simulationOrder: string[] = []
        let microQueue: QueueItem[] = []
        let macroQueue: QueueItem[] = []
        
        // 1. 동기 코드 실행
        // console.log('1. 동기 코드 실행 시작')
        
        // 전역 실행 컨텍스트 시작
        simulationStack.push({
          id: `global-${Date.now()}`,
          functionName: '<global>',
          height: 40,
          color: 'rgb(var(--game-callstack-queue-primary))',
          isGlobalContext: true
        })
        simulationOrder.push('<global>')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: '<global>',
          stackOverflow: false
        }))
        setMicrotaskQueue([...microQueue])
        setMacrotaskQueue([...macroQueue])
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPop', simulationSpeed)))
        
        // console.log("시작")
        simulationStack.push({
          id: `console.log-start-${Date.now()}`,
          functionName: 'console.log("시작")',
          height: 40,
          color: 'rgb(var(--game-callstack-urgent-primary))'
        })
        simulationOrder.push('console.log("시작")')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: 'console.log("시작")',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // console.log 완료
        simulationStack.pop()
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: '<global>',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('queueMove', simulationSpeed)))
        
        // setTimeout 호출
        simulationStack.push({
          id: `setTimeout-${Date.now()}`,
          functionName: 'setTimeout',
          height: 40,
          color: 'rgb(var(--game-callstack-scheduled-primary))'
        })
        simulationOrder.push('setTimeout')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: 'setTimeout',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // setTimeout 완료 - 콜백을 매크로태스크 큐에 추가
        simulationStack.pop()
        macroQueue.push({
          id: `timeout-callback-${Date.now()}`,
          functionName: 'console.log("타임아웃")',
          height: 40,
          color: 'rgb(var(--text-secondary))',
          queueType: 'macrotask',
          returnValue: undefined
        })
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: '<global>',
          stackOverflow: false
        }))
        setMacrotaskQueue([...macroQueue])
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // Promise.resolve() 호출
        simulationStack.push({
          id: `promise-resolve-${Date.now()}`,
          functionName: 'Promise.resolve',
          height: 40,
          color: 'rgb(var(--primary))'
        })
        simulationOrder.push('Promise.resolve')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: 'Promise.resolve',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // Promise.resolve 완료
        simulationStack.pop()
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: '<global>',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('queueMove', simulationSpeed)))
        
        // .then() 호출
        simulationStack.push({
          id: `then-${Date.now()}`,
          functionName: 'then',
          height: 40,
          color: 'rgb(var(--accent))'
        })
        simulationOrder.push('then')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: 'then',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // then 완료 - 콜백을 마이크로태스크 큐에 추가
        simulationStack.pop()
        microQueue.push({
          id: `promise-callback-${Date.now()}`,
          functionName: 'console.log("프로미스")',
          height: 40,
          color: 'rgb(var(--game-callstack-queue-primary))',
          queueType: 'microtask',
          returnValue: undefined
        })
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: '<global>',
          stackOverflow: false
        }))
        setMicrotaskQueue([...microQueue])
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // console.log("끝")
        simulationStack.push({
          id: `console.log-end-${Date.now()}`,
          functionName: 'console.log("끝")',
          height: 40,
          color: 'rgb(var(--game-callstack-urgent-primary))'
        })
        simulationOrder.push('console.log("끝")')
        
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: 'console.log("끝")',
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // console.log 완료
        simulationStack.pop()
        
        // 전역 실행 컨텍스트 완료
        simulationStack.pop()
        setGameState(prev => ({
          ...prev,
          currentStack: [...simulationStack],
          executionOrder: [...simulationOrder],
          isExecuting: true,
          currentFunction: null,
          stackOverflow: false
        }))
        await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        
        // console.log('2. 콜스택이 비었음 - 마이크로태스크 처리')
        
        // 2. 마이크로태스크 큐 처리
        while (microQueue.length > 0) {
          const microTask = microQueue.shift()!
          simulationStack.push(microTask)
          simulationOrder.push('microtask')
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: microTask.functionName,
            stackOverflow: false
          }))
          setMicrotaskQueue([...microQueue])
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPop', simulationSpeed)))
          
          // 마이크로태스크 실행
          simulationStack.push({
            id: `console.log-promise-${Date.now()}`,
            functionName: 'console.log("프로미스")',
              height: 40,
            color: 'rgb(var(--game-callstack-urgent-primary))'
          })
          simulationOrder.push('console.log("프로미스")')
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: 'console.log("프로미스")',
            stackOverflow: false
          }))
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
          
          // console.log 완료
          simulationStack.pop()
          // 마이크로태스크 완료
          simulationStack.pop()
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: null,
            stackOverflow: false
          }))
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        }
        
        // console.log('3. 마이크로태스크 큐가 비었음 - 매크로태스크 처리')
        
        // 3. 매크로태스크 큐 처리 (하나만)
        if (macroQueue.length > 0) {
          const macroTask = macroQueue.shift()!
          simulationStack.push(macroTask)
          simulationOrder.push('macrotask')
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: macroTask.functionName,
            stackOverflow: false
          }))
          setMacrotaskQueue([...macroQueue])
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPop', simulationSpeed)))
          
          // 매크로태스크 실행
          simulationStack.push({
            id: `console.log-timeout-${Date.now()}`,
            functionName: 'console.log("타임아웃")',
              height: 40,
            color: 'rgb(var(--game-callstack-urgent-primary))'
          })
          simulationOrder.push('console.log("타임아웃")')
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: 'console.log("타임아웃")',
            stackOverflow: false
          }))
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
          
          // console.log 완료
          simulationStack.pop()
          // 매크로태스크 완료
          simulationStack.pop()
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: null,
            stackOverflow: false
          }))
          setMacrotaskQueue([...macroQueue])
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        }
        
        // 완료
        await new Promise(resolve => setTimeout(resolve, getDelay('queueMove', simulationSpeed)))
        setIsExecuting(false)
        setGameState(prev => ({
          ...prev,
          currentStack: [],
          executionOrder: simulationOrder,
          isExecuting: false,
          currentFunction: null,
          stackOverflow: false
        }))
      }
      
      simulateEventLoop()
      return
      }
      
      // 고급 스테이지 6-9: 다른 큐 시스템들
      else {
        const simulateAdvancedQueues = async () => {
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // 게임 상태 초기화
          const updatedState = {
            ...gameState,
            queues: {
              callstack: [],
              microtask: [],
              macrotask: [],
              priority: [],
              circular: [],
              animation: [],
              generator: [],
              io: [],
              worker: []
            },
            executionOrder: []
          }
          
          // 각 스테이지별 큐 시뮬레이션
          for (const funcCall of currentLevel.functionCalls) {
            if (funcCall.queueType === 'callstack') {
              // 콜스택에 추가
              const stackItem: StackItem = {
                id: `${funcCall.name}-${Date.now()}`,
                functionName: funcCall.name,
                color: 'rgb(var(--game-callstack-queue-primary))',
                height: 40,
                returnValue: funcCall.returns
              }
              updatedState.queues.callstack.push(stackItem)
              updatedState.currentStack = [...updatedState.queues.callstack]
              updatedState.currentFunction = funcCall.name
              updatedState.executionOrder.push(funcCall.name)
            } else if (funcCall.queueType) {
              // 다른 큐에 추가
              const queueItem: QueueItem = {
                id: `${funcCall.queueType}-${funcCall.name}-${Date.now()}`,
                functionName: funcCall.name,
                queueType: funcCall.queueType,
                priority: funcCall.priority,
                color: gameEngine.getQueueColor(funcCall.queueType),
                height: 40,
                returnValue: funcCall.returns
              }
              updatedState.queues[funcCall.queueType].push(queueItem)
            }
            
            setGameState(prev => ({...prev, ...updatedState}))
            await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
          }
          
          setIsExecuting(false)
        }
        
        simulateAdvancedQueues()
        return
      }
    }
    
    // 기본 콜스택 시뮬레이션 (다른 스테이지들)
    const simulateExecution = async () => {
      await new Promise(resolve => setTimeout(resolve, getDelay('initial', simulationSpeed))) // 초기 대기
      
      const simulationStack: any[] = []
      const simulationOrder: string[] = []
      
      // simulationSteps가 있으면 사용, 없으면 expectedOrder 사용
      const steps = currentLevel.simulationSteps || currentLevel.expectedOrder.flatMap(func => [func, `${func}-return`])
      
      // 각 단계를 순차적으로 처리
      for (const step of steps) {
        // return이 포함된 경우 pop
        if (step.includes('-return')) {
          const lastItem = simulationStack.pop()
          const currentFunc = simulationStack[simulationStack.length - 1]?.functionName || null
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: currentFunc,
            stackOverflow: false
          }))
          
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPush', simulationSpeed)))
        } else {
          // push 액션 (함수 호출)
          const funcName = step
          simulationStack.push({
            id: `${funcName}-${Date.now()}-${Math.random()}`,
            functionName: funcName,
              height: 40,
            color: [
              'rgb(var(--game-callstack-queue-primary))',   // callstack primary
              'rgb(var(--game-callstack-urgent-primary))',   // microtask primary  
              'rgb(var(--game-callstack-scheduled-primary))', // macrotask primary
              'rgb(var(--text-secondary))',    // text secondary
              'rgb(var(--primary))',   // accent
              'rgb(var(--muted))'    // muted
            ][simulationStack.length % 6]
          })
          
          // expectedOrder에 있는 함수만 실행 순서에 추가
          if (currentLevel.expectedOrder.includes(funcName)) {
            simulationOrder.push(funcName)
          }
          
          setGameState(prev => ({
            ...prev,
            currentStack: [...simulationStack],
            executionOrder: [...simulationOrder],
            isExecuting: true,
            currentFunction: funcName,
            stackOverflow: false
          }))
          
          await new Promise(resolve => setTimeout(resolve, getDelay('stackPop', simulationSpeed)))
        }
      }
      
      // 완료 후 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsExecuting(false)
      setGameState(prev => ({
        ...prev,
        currentStack: [],
        executionOrder: simulationOrder,
        isExecuting: false,
        currentFunction: null,
        stackOverflow: false
      }))
    }
    
    simulateExecution()
  }
  
  // 코드 초기화
  const handleReset = () => {
    setUserOrder([])
    setMessage(null)
    gameEngine.resetGameState()
    setGameState(gameEngine.getGameState())
    setIsExecuting(false)
    // 타입 E 상태 초기화
    setUserSnapshots({})
    setCurrentStep(0)
    setValidationResults({})
  }
  
  // 진행 상황 데이터
  const progress = gameManager.getGameProgress('callstack-library', selectedDifficulty)
  
  // 타입 E 타임라인 재생 효과
  useEffect(() => {
    if (!isTimelinePlaying || currentLayoutType !== 'E') return
    
    const totalSteps = currentLevel?.executionSteps?.length || 0
    if (currentStep >= totalSteps - 1) {
      setIsTimelinePlaying(false)
      return
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    }, 1000) // 1초마다 다음 스텝
    
    return () => clearTimeout(timer)
  }, [isTimelinePlaying, currentStep, currentLayoutType, currentLevel])
  
  // 모든 훅을 조건문 전에 실행 - Hook 에러 방지
  return (
    <React.Fragment>
      <GameGuideModal 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onStart={() => setShowGuide(false)}
        layoutType={currentLayoutType}
        currentStage={currentStage}
      />
      <div 
        className="min-h-screen"
        style={{
          backgroundColor: 'rgb(var(--background))',
          color: 'rgb(var(--text-primary))'
        }}
      >
        <div className="w-full p-4">
          {!mounted || !currentLevel ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            </div>
          ) : (
            <React.Fragment>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/${currentLocale}`}>
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-1" />
                홈으로
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              콜스택 도서관
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuide(true)}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              게임 가이드
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLocale = currentLocale === 'ko' ? 'en' : 'ko'
                  const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
                  router.push(newPath)
                }}
              >
                <Globe className="h-4 w-4 mr-1" />
                {currentLocale === 'ko' ? 'EN' : 'KO'}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* 난이도 선택 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-foreground">난이도 선택</h2>
          <div className="flex gap-3">
            {(['beginner', 'intermediate', 'advanced'] as GameDifficulty[]).map((difficulty) => {
              const difficultyProgress = gameManager.getGameProgress('callstack-library', difficulty)
              const isUnlocked = difficultyProgress?.isUnlocked || false
              const completedStages = difficultyProgress?.completedStages.size || 0
              const isSelected = selectedDifficulty === difficulty
              
              const difficultyLabels = {
                beginner: '초급',
                intermediate: '중급', 
                advanced: '고급'
              }
              
              const getDifficultyTheme = (diff: string) => {
                switch (diff) {
                  case 'beginner':
                    return {
                      bg: 'rgb(var(--game-callstack-stage-beginner) / 0.1)',
                      border: '1px solid rgb(var(--game-callstack-stage-beginner))'
                    }
                  case 'intermediate':
                    return {
                      bg: 'rgb(var(--game-callstack-stage-intermediate) / 0.1)',
                      border: '1px solid rgb(var(--game-callstack-stage-intermediate))'
                    }
                  case 'advanced':
                    return {
                      bg: 'rgb(var(--game-callstack-stage-advanced) / 0.1)',
                      border: '1px solid rgb(var(--game-callstack-stage-advanced))'
                    }
                  default:
                    return {
                      bg: 'rgb(var(--game-callstack-queue-callstack-light))',
                      border: '1px solid rgb(var(--game-callstack-queue-callstack))'
                    }
                }
              }
              
              const difficultyTheme = getDifficultyTheme(difficulty)

              return (
                <Button
                  key={difficulty}
                  variant={isSelected ? "default" : "outline"}
                  className={`relative ${!isUnlocked ? 'opacity-50' : ''}`}
                  onClick={() => handleDifficultyChange(difficulty)}
                  disabled={!isUnlocked}
                  style={!isSelected ? {
                    background: difficultyTheme.bg,
                    borderColor: difficultyTheme.border,
                    color: 'rgb(var(--text-primary))'
                  } : undefined}
                >
                  <div className="flex items-center gap-2">
                    {!isUnlocked && <Lock className="h-4 w-4" />}
                    <span>{difficultyLabels[difficulty]}</span>
                    {completedStages === gameEngine.getTotalStages(difficulty) && (
                      <Trophy 
                        className="h-4 w-4" 
                        style={{ color: `rgb(var(--game-callstack-library-success))` }}
                      />
                    )}
                    <span className="text-xs">({completedStages}/{gameEngine.getTotalStages(difficulty)})</span>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
        
        {/* 스테이지 진행 상황 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedDifficulty === 'beginner' ? '초급' : selectedDifficulty === 'intermediate' ? '중급' : '고급'} - 
              스테이지 {currentStage - CALLSTACK_STAGE_RANGES[selectedDifficulty].min + 1} / {gameEngine.getTotalStages(selectedDifficulty)}
            </h3>
            <div className="text-sm text-muted-foreground">
              총 점수: {progress?.totalScore || 0}점
            </div>
          </div>
          <div className="flex gap-2">
            {(() => {
              // 난이도별 스테이지 범위 계산
              const stageRange = selectedDifficulty === 'beginner' 
                ? Array.from({ length: 8 }, (_, i) => i + 1)
                : selectedDifficulty === 'intermediate'
                ? Array.from({ length: 8 }, (_, i) => i + 9)
                : Array.from({ length: 8 }, (_, i) => i + 17)
              
              return stageRange.map((stageNumber, index) => (
                <div
                  key={stageNumber}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    background: progress?.completedStages.has(stageNumber)
                      ? `rgb(var(--game-callstack-library-success))`
                      : stageNumber === currentStage
                      ? `rgb(var(--primary))`
                      : `rgb(var(--muted))`,
                    color: progress?.completedStages.has(stageNumber) || stageNumber === currentStage
                      ? `rgb(var(--primary-foreground))`
                      : `rgb(var(--muted-foreground))`
                  }}
                >
                  {progress?.completedStages.has(stageNumber) ? <Star className="h-4 w-4" /> : getRelativeStageNumber(stageNumber)}
                </div>
              ))
            })()}
          </div>
          
        </div>
        
        {(currentLayoutType === 'A' || currentLayoutType === 'A+' || currentLayoutType === 'B' || currentLayoutType === 'C' || currentLayoutType === 'D' || currentLayoutType === 'E') ? (
          // 새로운 레이아웃 시스템 (A, A+, B, C, D, E)
          <>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">
                🎯 {layoutConfig.description} | {layoutConfig.playMode}
              </div>
            </div>
            
            {/* 함수 목록이 로드될 때까지 대기 (타입 B, C, D, E는 함수 목록 불필요) */}
            {(['B', 'C', 'D', 'E'].includes(currentLayoutType)) || availableFunctions.length > 0 ? (
              <LayoutRenderer
                layoutType={currentLayoutType}
                gameData={gameData}
                gameHandlers={gameHandlers}
                className="mb-6"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                레벨 데이터 로딩 중...
              </div>
            )}
            
            {/* 메시지 표시 영역 */}
            {message && (
              <div 
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: message.type === 'success' 
                    ? `rgb(var(--game-callstack-library-success) / 0.1)`
                    : message.type === 'error' 
                      ? `rgb(var(--game-callstack-library-overdue) / 0.1)`
                      : 'rgb(var(--game-callstack-queue-microtask-light))',
                  color: message.type === 'success'
                    ? `rgb(var(--game-callstack-library-success))`
                    : message.type === 'error'
                      ? `rgb(var(--game-callstack-library-overdue))`
                      : 'rgb(var(--text-primary))',
                  border: `1px solid ${
                    message.type === 'success'
                      ? `rgb(var(--game-callstack-library-success))`
                      : message.type === 'error'
                        ? `rgb(var(--game-callstack-library-overdue))`
                        : '1px solid rgb(var(--game-callstack-queue-microtask))'
                  }`
                }}
              >
                {message.text}
              </div>
            )}
            
            {/* 스테이지 네비게이션 */}
            <div className="flex justify-between pt-4 mt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleStageChange('prev')}
                disabled={!canGoPrev || isExecuting}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전 스테이지
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStageChange('next')}
                disabled={!canGoNext || isExecuting}
              >
                다음 스테이지
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : layoutInfo.isBasicCallStack ? (
          // 기존 타입 A 레이아웃 (하위 호환)
          <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 왼쪽 50%: 게임 보드 및 게임 방법 */}
            <GamePanel title="📚 콜스택 시뮬레이션" className="flex flex-col">
              {/* 콜스택 시각화 영역 */}
              <div className="flex-1 w-full">
                <IntegratedCallStackBoard
                  stack={gameState.currentStack}
                  maxStackSize={currentLevel.maxStackSize}
                  isExecuting={isExecuting}
                  stackOverflow={gameState.stackOverflow}
                  currentFunction={gameState.currentFunction}
                  availableFunctions={[]}
                  userOrder={[]}
                  onOrderChange={() => {}}
                  mode="simulation"
                  showEventLoop={false}
                />
              </div>
              
              {/* 게임 방법 설명 */}
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{
                  background: 'rgb(var(--game-callstack-queue-microtask-light))',
                  border: '1px solid rgb(var(--game-callstack-queue-microtask))',
                  borderRadius: '8px'
                }}
              >
                <h3 
                  className="text-sm font-semibold mb-2 flex items-center gap-1"
                  style={{ color: 'rgb(var(--text-primary))' }}
                >
                  🎯 게임 방법:
                </h3>
                <ul 
                  className="text-xs space-y-1"
                  style={{ color: 'rgb(var(--text-secondary))' }}
                >
                  <li><strong>1️⃣</strong> 코드를 읽고 함수 호출 순서를 파악하세요</li>
                  <li><strong>2️⃣</strong> 우측의 함수 칩을 클릭하여 순서대로 배치하세요</li>
                  <li><strong>3️⃣</strong> 드래그로 순서를 조정할 수 있습니다</li>
                  <li><strong>4️⃣</strong> "코드 실행 보기"로 애니메이션을 확인하세요</li>
                  <li><strong>5️⃣</strong> "정답 확인"으로 결과를 검증하세요</li>
                </ul>
              </div>
            </GamePanel>
            
            {/* 오른쪽 50%: 코드 에디터와 예상 실행 순서를 하나의 패널로 통합 */}
            <GamePanel title="📝 코드 분석 및 실행 순서" className="flex flex-col h-full">
              <div className="flex-1 flex flex-col space-y-4">
                {/* 코드 에디터 섹션 */}
                <div>
                  <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2">코드 보기</h4>
                  <div className="h-[300px]">
                    <CodeEditor
                      value={currentLevel.code}
                      onChange={() => {}}
                      language="javascript"
                      readOnly
                    />
                  </div>
                </div>
                
                {/* 예상 실행 순서 섹션 */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">🎯 예상 실행 순서</h4>
                  
                  {/* 사용 가능한 함수 */}
                  <div className="mb-3">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">사용 가능한 함수 (클릭하여 추가)</p>
                    <div className="flex flex-wrap gap-2">
                      {availableFunctions.map((func, index) => {
                        const funcObj = typeof func === 'string' ? { name: func } : func
                        return (
                          <button
                            key={`${funcObj.name}-${index}`}
                            onClick={() => handleFunctionSelect(funcObj.name)}
                            disabled={isExecuting}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                              background: funcObj.queueType === 'microtask'
                                ? 'rgb(var(--game-callstack-queue-microtask-light))'
                                : funcObj.queueType === 'macrotask'
                                ? 'rgb(var(--game-callstack-queue-macrotask-light))'
                                : 'rgb(var(--game-callstack-queue-callstack-light))',
                              color: funcObj.queueType === 'microtask'
                                ? 'rgb(var(--text-primary))'
                                : funcObj.queueType === 'macrotask'
                                ? 'rgb(var(--text-primary))'
                                : 'rgb(var(--text-primary))',
                              border: `1px solid ${
                                funcObj.queueType === 'microtask'
                                  ? 'rgb(var(--game-callstack-queue-microtask))'
                                  : funcObj.queueType === 'macrotask'
                                  ? 'rgb(var(--game-callstack-queue-macrotask))'
                                  : 'rgb(var(--game-callstack-queue-callstack))'
                              }`
                            }}
                            onMouseEnter={(e) => {
                              const queueType = funcObj.queueType === 'microtask' ? 'microtask' : 
                                              funcObj.queueType === 'macrotask' ? 'macrotask' : 'callstack'
                              e.currentTarget.style.background = queueType === 'microtask' ? 'rgb(var(--game-callstack-queue-microtask))' : queueType === 'macrotask' ? 'rgb(var(--game-callstack-queue-macrotask))' : 'rgb(var(--game-callstack-queue-callstack))'
                            }}
                            onMouseLeave={(e) => {
                              const queueType = funcObj.queueType === 'microtask' ? 'microtask' : 
                                              funcObj.queueType === 'macrotask' ? 'macrotask' : 'callstack'
                              e.currentTarget.style.background = queueType === 'microtask' ? 'rgb(var(--game-callstack-queue-microtask-light))' : queueType === 'macrotask' ? 'rgb(var(--game-callstack-queue-macrotask-light))' : 'rgb(var(--game-callstack-queue-callstack-light))'
                            }}
                          >
                            {funcObj.name}
                            {funcObj.queueType && (
                              <span className="ml-1 text-xs opacity-70">
                                ({funcObj.queueType === 'microtask' ? '긴급' : '일반'})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* 드래그 가능한 순서 목록 */}
                  <div className="flex-1 min-h-0">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">실행 순서 (드래그하여 정렬)</p>
                    {userOrder.length === 0 ? (
                      <div className="h-full bg-[rgb(var(--card))] rounded-lg p-4 border-2 border-dashed border-[rgb(var(--border))]">
                        <div className="flex items-center justify-center h-full text-[rgb(var(--muted-foreground))] text-sm">
                          위의 함수를 클릭하여 추가하세요
                        </div>
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={userOrder}
                        onReorder={setUserOrder}
                        className="space-y-2 h-full overflow-y-auto bg-[rgb(var(--card))] rounded-lg p-3"
                      >
                        {userOrder.map((funcName, index) => {
                          const funcObj = availableFunctions.find(f => 
                            typeof f === 'string' ? f === funcName : f.name === funcName
                          )
                          const queueType = typeof funcObj === 'object' ? funcObj.queueType : undefined
                          
                          return (
                            <Reorder.Item
                              key={`${funcName}-${index}`}
                              value={funcName}
                              className="flex items-center justify-between p-2.5 rounded-lg cursor-move"
                              style={{
                                background: queueType === 'microtask'
                                  ? 'rgb(var(--game-callstack-queue-microtask-light))'
                                  : queueType === 'macrotask'
                                  ? 'rgb(var(--game-callstack-queue-macrotask-light))'
                                  : 'rgb(var(--game-callstack-queue-callstack-light))',
                                border: `1px solid ${
                                  queueType === 'microtask'
                                    ? 'rgb(var(--game-callstack-queue-microtask))'
                                    : queueType === 'macrotask'
                                    ? 'rgb(var(--game-callstack-queue-macrotask))'
                                    : 'rgb(var(--game-callstack-queue-callstack))'
                                }`
                              }}
                              whileDrag={{ scale: 1.05, boxShadow: "0px 5px 20px rgba(0,0,0,0.1)" }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[rgb(var(--muted-foreground))]">
                                  <svg width="10" height="16" viewBox="0 0 12 20" fill="currentColor">
                                    <circle cx="3" cy="5" r="1.5" />
                                    <circle cx="9" cy="5" r="1.5" />
                                    <circle cx="3" cy="10" r="1.5" />
                                    <circle cx="9" cy="10" r="1.5" />
                                    <circle cx="3" cy="15" r="1.5" />
                                    <circle cx="9" cy="15" r="1.5" />
                                  </svg>
                                </span>
                                <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                                  {index + 1}.
                                </span>
                                <span className="font-medium text-sm">
                                  {funcName}
                                </span>
                                {queueType && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-[rgb(var(--surface-secondary))]/10">
                                    {queueType === 'microtask' ? '긴급' : '일반'}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setUserOrder(userOrder.filter(f => f !== funcName))}
                                className="text-sm transition-colors"
                                style={{
                                  color: `rgb(var(--game-callstack-library-overdue))`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = `rgb(var(--game-callstack-library-overdue) / 0.8)`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = `rgb(var(--game-callstack-library-overdue))`
                                }}
                                disabled={isExecuting}
                              >
                                ✕
                              </button>
                            </Reorder.Item>
                          )
                        })}
                      </Reorder.Group>
                    )}
                  </div>
                  
                  {/* 버튼들 */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleRunSimulation}
                      disabled={isExecuting}
                      className="min-w-[120px]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      코드 실행 보기
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCheckAnswer}
                      disabled={isExecuting}
                      className="min-w-[120px]"
                    >
                      정답 확인
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={isExecuting}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      초기화
                    </Button>
                    
                    {/* 속도 조절 버튼 */}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">속도:</span>
                      <Button
                        variant={simulationSpeed === 'fast' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSimulationSpeed('fast')}
                        disabled={isExecuting}
                        className="px-3"
                      >
                        <Gauge className="h-3 w-3 mr-1" />
                        빠름
                      </Button>
                      <Button
                        variant={simulationSpeed === 'normal' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSimulationSpeed('normal')}
                        disabled={isExecuting}
                        className="px-3"
                      >
                        <Gauge className="h-3 w-3 mr-1" />
                        보통
                      </Button>
                      <Button
                        variant={simulationSpeed === 'slow' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSimulationSpeed('slow')}
                        disabled={isExecuting}
                        className="px-3"
                      >
                        <Gauge className="h-3 w-3 mr-1" />
                        느림
                      </Button>
                    </div>
                  </div>
                  
                  {/* 메시지 표시 - 버튼들 바로 아래 */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 rounded-lg text-sm font-medium shadow-lg"
                        style={{
                          background: message.type === 'success'
                            ? `rgb(var(--game-callstack-library-success) / 0.1)`
                            : message.type === 'error'
                            ? `rgb(var(--game-callstack-library-overdue) / 0.1)`
                            : 'rgb(var(--game-callstack-queue-microtask-light))',
                          color: message.type === 'success'
                            ? `rgb(var(--game-callstack-library-success))`
                            : message.type === 'error'
                            ? `rgb(var(--game-callstack-library-overdue))`
                            : 'rgb(var(--text-primary))',
                          border: `1px solid ${
                            message.type === 'success'
                              ? `rgb(var(--game-callstack-library-success))`
                              : message.type === 'error'
                              ? `rgb(var(--game-callstack-library-overdue))`
                              : '1px solid rgb(var(--game-callstack-queue-microtask))'
                          }`
                        }}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* 스테이지 네비게이션 */}
                  <div className="flex justify-between pt-4 mt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleStageChange('prev')}
                      disabled={!canGoPrev || isExecuting}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전 스테이지
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStageChange('next')}
                      disabled={!canGoNext || isExecuting}
                    >
                      다음 스테이지
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
            </GamePanel>
          </div>
        </>
        ) : selectedDifficulty === 'advanced' && currentStage === 2 ? (
          // 고급2 스테이지: 전체 화면을 활용하는 특별 레이아웃
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 콜스택과 반납대들 */}
            <div className="space-y-4">
              <GamePanel title={currentLevel.title}>
                <div className="space-y-4">
                  {/* 콜스택 책장 */}
                  <IntegratedCallStackBoard
                    stack={gameState.currentStack}
                    maxStackSize={currentLevel.maxStackSize}
                    isExecuting={isExecuting}
                    stackOverflow={gameState.stackOverflow}
                    currentFunction={gameState.currentFunction}
                    availableFunctions={availableFunctions}
                    userOrder={userOrder}
                    onOrderChange={setUserOrder}
                    mode="prediction"
                    showEventLoop={false}
                  />
                  
                  {/* 반납대들 - 세로 배치 */}
                  <div className="space-y-3">
                    <UniversalQueueBoard
                      queueType="microtask"
                      items={microtaskQueue}
                      isExecuting={isExecuting && gameState.currentlyExecutingQueue === 'microtask'}
                      showHeader={true}
                      className="h-32"
                    />
                    <UniversalQueueBoard
                      queueType="macrotask"
                      items={macrotaskQueue}
                      isExecuting={isExecuting && gameState.currentlyExecutingQueue === 'macrotask'}
                      showHeader={true}
                      className="h-32"
                    />
                  </div>
                </div>
              </GamePanel>
              
              {/* 설명과 힌트 */}
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  {currentLevel.description}
                </p>
                
                <div className="bg-accent/10 border border-accent rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-accent-foreground mb-1">
                    <Layers className="inline h-4 w-4 mr-1" />
                    개념
                  </h4>
                  <p className="text-xs text-accent-foreground/90">
                    {currentLevel.explanation}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleShowHint}
                    className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    style={{
                      backgroundColor: 'rgb(var(--destructive))',
                      color: 'white',
                      border: '1px solid rgb(var(--destructive))',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Lightbulb className="h-3 w-3" />
                    힌트 {showHints ? '숨기기' : '보기'}
                  </button>
                  <span className="text-xs text-muted-foreground font-medium self-center">
                    {hintsUsed}개 사용됨
                  </span>
                </div>
                
                <AnimatePresence>
                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {currentLevel.hints.map((hint, index) => (
                        <div
                          key={index}
                          className="rounded p-2"
                          style={{
                            background: `rgb(var(--game-callstack-library-warning) / 0.1)`,
                            border: `1px solid rgb(var(--game-callstack-library-warning))`
                          }}
                        >
                          <p 
                            className="text-xs"
                            style={{ color: `rgb(var(--game-callstack-library-warning))` }}
                          >
                            💡 힌트 {index + 1}: {hint}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* 오른쪽: 예상 실행 순서와 코드 에디터 */}
            <div className="space-y-4">
              <GamePanel title="🎯 예상 실행 순서">
                <div className="space-y-4">
                  {/* 사용 가능한 함수 */}
                  <div>
                    <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">
                      사용 가능한 함수 (클릭하여 추가)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFunctions.map((func, index) => {
                        const funcObj = typeof func === 'string' ? { name: func } : func
                        return (
                          <button
                            key={`${funcObj.name}-${index}`}
                            onClick={() => handleFunctionSelect(funcObj.name)}
                            disabled={isExecuting}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                              background: funcObj.queueType === 'microtask'
                                ? 'rgb(var(--game-callstack-queue-microtask-light))'
                                : funcObj.queueType === 'macrotask'
                                ? 'rgb(var(--game-callstack-queue-macrotask-light))'
                                : 'rgb(var(--game-callstack-queue-callstack-light))',
                              color: funcObj.queueType === 'microtask'
                                ? 'rgb(var(--text-primary))'
                                : funcObj.queueType === 'macrotask'
                                ? 'rgb(var(--text-primary))'
                                : 'rgb(var(--text-primary))',
                              border: `1px solid ${
                                funcObj.queueType === 'microtask'
                                  ? 'rgb(var(--game-callstack-queue-microtask))'
                                  : funcObj.queueType === 'macrotask'
                                  ? 'rgb(var(--game-callstack-queue-macrotask))'
                                  : 'rgb(var(--game-callstack-queue-callstack))'
                              }`
                            }}
                            onMouseEnter={(e) => {
                              const queueType = funcObj.queueType === 'microtask' ? 'microtask' : 
                                              funcObj.queueType === 'macrotask' ? 'macrotask' : 'callstack'
                              e.currentTarget.style.background = queueType === 'microtask' ? 'rgb(var(--game-callstack-queue-microtask))' : queueType === 'macrotask' ? 'rgb(var(--game-callstack-queue-macrotask))' : 'rgb(var(--game-callstack-queue-callstack))'
                            }}
                            onMouseLeave={(e) => {
                              const queueType = funcObj.queueType === 'microtask' ? 'microtask' : 
                                              funcObj.queueType === 'macrotask' ? 'macrotask' : 'callstack'
                              e.currentTarget.style.background = queueType === 'microtask' ? 'rgb(var(--game-callstack-queue-microtask-light))' : queueType === 'macrotask' ? 'rgb(var(--game-callstack-queue-macrotask-light))' : 'rgb(var(--game-callstack-queue-callstack-light))'
                            }}
                          >
                            {funcObj.name}
                            {funcObj.queueType && (
                              <span className="ml-2 text-xs opacity-70">
                                ({funcObj.queueType === 'microtask' ? '긴급' : '일반'})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* 드래그 가능한 순서 목록 */}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">
                      실행 순서 (드래그하여 정렬)
                    </h4>
                    {userOrder.length === 0 ? (
                      <div className="min-h-[200px] bg-[rgb(var(--card))] rounded-lg p-4">
                        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                          위의 함수를 클릭하여 추가하세요
                        </div>
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={userOrder}
                        onReorder={setUserOrder}
                        className="space-y-2 min-h-[200px] bg-[rgb(var(--card))] rounded-lg p-4"
                      >
                        {userOrder.map((funcName, index) => {
                          const funcObj = availableFunctions.find(f => 
                            typeof f === 'string' ? f === funcName : f.name === funcName
                          )
                          const queueType = typeof funcObj === 'object' ? funcObj.queueType : undefined
                          
                          return (
                            <Reorder.Item
                              key={`${funcName}-${index}`}
                              value={funcName}
                              className="flex items-center justify-between p-3 rounded-lg cursor-move"
                              style={{
                                background: queueType === 'microtask'
                                  ? 'rgb(var(--game-callstack-queue-microtask-light))'
                                  : queueType === 'macrotask'
                                  ? 'rgb(var(--game-callstack-queue-macrotask-light))'
                                  : 'rgb(var(--game-callstack-queue-callstack-light))',
                                border: `1px solid ${
                                  queueType === 'microtask'
                                    ? 'rgb(var(--game-callstack-queue-microtask))'
                                    : queueType === 'macrotask'
                                    ? 'rgb(var(--game-callstack-queue-macrotask))'
                                    : 'rgb(var(--game-callstack-queue-callstack))'
                                }`
                              }}
                              whileDrag={{ scale: 1.05, boxShadow: "0px 5px 20px rgba(0,0,0,0.1)" }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[rgb(var(--muted-foreground))]">
                                  <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                                    <circle cx="3" cy="5" r="1.5" />
                                    <circle cx="9" cy="5" r="1.5" />
                                    <circle cx="3" cy="10" r="1.5" />
                                    <circle cx="9" cy="10" r="1.5" />
                                    <circle cx="3" cy="15" r="1.5" />
                                    <circle cx="9" cy="15" r="1.5" />
                                  </svg>
                                </span>
                                <span className="text-sm font-medium text-[rgb(var(--muted-foreground))]">
                                  {index + 1}.
                                </span>
                                <span className="font-medium">
                                  {funcName}
                                </span>
                                {queueType && (
                                  <span className="text-xs px-2 py-1 rounded bg-[rgb(var(--surface-secondary))]/10">
                                    {queueType === 'microtask' ? '긴급' : '일반'}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setUserOrder(userOrder.filter(f => f !== funcName))}
                                className="transition-colors"
                                style={{
                                  color: `rgb(var(--game-callstack-library-overdue))`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = `rgb(var(--game-callstack-library-overdue) / 0.8)`
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = `rgb(var(--game-callstack-library-overdue))`
                                }}
                                disabled={isExecuting}
                              >
                                ✕
                              </button>
                            </Reorder.Item>
                          )
                        })}
                      </Reorder.Group>
                    )}
                  </div>
                </div>
              </GamePanel>
              
              {/* 코드 에디터 */}
              <GamePanel title="코드 보기">
                <CodeEditor
                  value={currentLevel.code}
                  onChange={() => {}}
                  language="javascript"
                  readOnly
                />
              </GamePanel>
              
              {/* 메시지 표시 */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg text-sm font-medium"
                    style={{
                      background: message.type === 'success'
                        ? `rgb(var(--game-callstack-library-success) / 0.1)`
                        : message.type === 'error'
                        ? `rgb(var(--game-callstack-library-overdue) / 0.1)`
                        : 'rgb(var(--game-callstack-queue-microtask-light))',
                      color: message.type === 'success'
                        ? `rgb(var(--game-callstack-library-success))`
                        : message.type === 'error'
                        ? `rgb(var(--game-callstack-library-overdue))`
                        : 'rgb(var(--text-primary))',
                      border: `1px solid ${
                        message.type === 'success'
                          ? `rgb(var(--game-callstack-library-success))`
                          : message.type === 'error'
                          ? `rgb(var(--game-callstack-library-overdue))`
                          : '1px solid rgb(var(--game-callstack-queue-microtask))'
                      }`
                    }}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 버튼들 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleRunSimulation}
                  disabled={isExecuting}
                  className="min-w-[120px]"
                >
                  <Play className="h-4 w-4 mr-2" />
                  코드 실행
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCheckAnswer}
                  disabled={isExecuting}
                  className="min-w-[120px]"
                >
                  정답 확인
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isExecuting}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  초기화
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 다른 스테이지들의 기본 레이아웃
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 왼쪽: 게임 보드 및 설명 */}
            <div className="space-y-4">
              <GamePanel title={currentLevel.title}>
                <div className="space-y-4">
                  {selectedDifficulty === 'advanced' && currentLevel.queueTypes ? (
                  <EnhancedCallStackBoard
                    gameState={{
                      ...gameState,
                      queues: {
                        ...gameState.queues,
                        callstack: gameState.currentStack.map(item => ({
                          ...item,
                          queueType: 'callstack' as QueueType
                        })),
                        microtask: microtaskQueue,
                        macrotask: macrotaskQueue
                      },
                      executionOrder: gameState.executionOrder || []
                    }}
                    activeQueueTypes={currentLevel.queueTypes}
                    isExecuting={isExecuting}
                    showExecutionFlow={true}
                  />
                ) : (
                  <IntegratedCallStackBoard
                    stack={gameState.currentStack}
                    maxStackSize={currentLevel.maxStackSize}
                    isExecuting={isExecuting}
                    stackOverflow={gameState.stackOverflow}
                    currentFunction={gameState.currentFunction}
                    availableFunctions={availableFunctions}
                    userOrder={userOrder}
                    onOrderChange={setUserOrder}
                    mode="prediction"
                    showEventLoop={selectedDifficulty === 'intermediate' && currentStage === 5}
                    microtaskQueue={microtaskQueue}
                    macrotaskQueue={macrotaskQueue}
                  />
                )}
                
                {/* 설명과 힌트 */}
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    {currentLevel.description}
                  </p>
                  
                  <div className="bg-accent/10 border border-accent rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-accent-foreground mb-1">
                      <Layers className="inline h-4 w-4 mr-1" />
                      개념
                    </h4>
                    <p className="text-xs text-accent-foreground/90">
                      {currentLevel.explanation}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleShowHint}
                      className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                      style={{
                        backgroundColor: 'rgb(var(--destructive))',
                        color: 'white',
                        border: '1px solid rgb(var(--destructive))',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Lightbulb className="h-3 w-3" />
                      힌트 {showHints ? '숨기기' : '보기'}
                    </button>
                    <span className="text-xs text-muted-foreground font-medium self-center">
                      {hintsUsed}개 사용됨
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {showHints && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {currentLevel.hints.map((hint, index) => (
                          <div
                            key={index}
                            className="rounded p-2"
                          style={{
                            background: `rgb(var(--game-callstack-library-warning) / 0.1)`,
                            border: `1px solid rgb(var(--game-callstack-library-warning))`
                          }}
                          >
                            <p 
                              className="text-xs"
                              style={{ color: `rgb(var(--game-callstack-library-warning))` }}
                            >
                              힌트 {index + 1}: {hint}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </GamePanel>
          </div>
          
          {/* 오른쪽: 코드 보기 */}
          <div className="space-y-4">
            <GamePanel title="📝 코드" className="h-full">
              <div className="space-y-4 h-full flex flex-col">
                <CodeEditor
                  value={currentLevel.code}
                  onChange={() => {}} // 읽기 전용
                  language="javascript"
                  className="flex-1 min-h-64"
                  readOnly
                />
                
                {/* 메시지 표시 */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg"
                      style={{
                        background: message.type === 'success'
                          ? `rgb(var(--game-callstack-library-success) / 0.1)`
                          : message.type === 'error'
                          ? `rgb(var(--game-callstack-library-overdue) / 0.1)`
                          : 'rgb(var(--game-callstack-queue-microtask-light))',
                        color: message.type === 'success'
                          ? `rgb(var(--game-callstack-library-success))`
                          : message.type === 'error'
                          ? `rgb(var(--game-callstack-library-overdue))`
                          : 'rgb(var(--text-primary))',
                        border: `1px solid ${
                          message.type === 'success'
                            ? `rgb(var(--game-callstack-library-success))`
                            : message.type === 'error'
                            ? `rgb(var(--game-callstack-library-overdue))`
                            : '1px solid rgb(var(--game-callstack-queue-microtask))'
                        }`
                      }}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 버튼들 */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleRunSimulation}
                    disabled={isExecuting}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isExecuting ? '실행 중...' : '코드 실행 보기'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCheckAnswer}
                  >
                    정답 확인
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isExecuting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    초기화
                  </Button>
                </div>
                
                {/* 스테이지 네비게이션 */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleStageChange('prev')}
                    disabled={!canGoPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    이전 스테이지
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStageChange('next')}
                    disabled={!canGoNext}
                  >
                    다음 스테이지
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </GamePanel>
          </div>
        </div>
        )}
            </React.Fragment>
          )}
        </div>
      </div>
      
      {/* 디버그 정보 패널 */}
      <DebugInfoPanel
        layoutType={currentLayoutType}
        breakpoint={
          typeof window !== 'undefined' 
            ? window.innerWidth >= 1280 ? 'xl' 
            : window.innerWidth >= 1024 ? 'lg' 
            : window.innerWidth >= 768 ? 'md' 
            : window.innerWidth >= 640 ? 'sm' 
            : 'xs'
            : 'lg'
        }
        queueItems={
          (currentQueueStates?.callstack?.length || 0) +
          (currentQueueStates?.microtask?.length || 0) +
          (currentQueueStates?.macrotask?.length || 0) +
          (currentQueueStates?.animation?.length || 0) +
          (currentQueueStates?.generator?.length || 0) +
          (currentQueueStates?.io?.length || 0) +
          (currentQueueStates?.worker?.length || 0) +
          gameState.currentStack.length +
          microtaskQueue.length +
          macrotaskQueue.length
        }
        currentStep={currentStep}
        totalSteps={
          eventLoopSteps?.length || 
          currentLevel?.executionSteps?.length || 
          currentLevel?.simulationSteps?.length || 
          0
        }
        memoryPressure={false}
      />
    </React.Fragment>
  )
}