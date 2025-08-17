'use client'

import { useState, useEffect } from 'react'
import { GamePanel, CodeEditor, Button, ThemeToggle, SimpleLanguageToggle } from '@penguinjs/ui'
import { Play, RotateCcw, Lightbulb, ChevronRight, ChevronLeft, Home, Lock, Star, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ClosureCaveBoard } from '@/games/closure-cave/ClosureCaveBoard'
import { ClosureCaveEngine } from '@/games/closure-cave/enhanced-game-engine'
import { GameManager } from '@/games/shared/GameManager'
import { GameDifficulty, GameLevel, GameStagePosition } from '@/games/shared/types'
import { motion, AnimatePresence } from 'framer-motion'
import { levels } from '@/games/closure-cave/levels'
import { GameGuideModal } from '@/games/closure-cave/GameGuideModal'
import { useClosureCaveTheme } from '@/games/closure-cave/hooks/useClosureCaveTheme'

// 난이도별 스테이지 범위 정의
const CLOSURE_STAGE_RANGES = {
  beginner: { min: 1, max: 5 },
  intermediate: { min: 6, max: 10 },
  advanced: { min: 11, max: 15 }
}

interface EnhancedClosureCaveGameProps {
  onScoreUpdate?: (score: number) => void
}

export function EnhancedClosureCaveGame({ onScoreUpdate }: EnhancedClosureCaveGameProps) {
  // 테마 훅 사용
  const theme = useClosureCaveTheme()
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('beginner')
  const [currentStage, setCurrentStage] = useState(1) // 초급은 절대 스테이지도 1부터 시작
  const [userCode, setUserCode] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [characterPath, setCharacterPath] = useState<GameStagePosition[] | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'ko'
  
  // 게임 엔진과 매니저 초기화
  const [gameEngine] = useState(() => new ClosureCaveEngine())
  const [gameManager] = useState(() => GameManager.getInstance())
  
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null)
  
  // loadLevel 함수를 먼저 정의
  const loadLevel = (difficulty: GameDifficulty, stage: number) => {
    // 난이도별 상대적 스테이지 번호 계산 (1-5)
    const relativeStage = stage - CLOSURE_STAGE_RANGES[difficulty].min + 1
    const level = gameEngine.getLevelByStage(difficulty, relativeStage)
    if (level) {
      setCurrentLevel(level)
      setUserCode(level.codeTemplate)
      setShowHints(false)
      setHintsUsed(0)
      setAttempts(0)
      setMessage(null)
      setCharacterPath(null)
    } else {
      console.error('Level not found:', difficulty, stage)
    }
  }
  
  // 게임 등록 및 초기화
  useEffect(() => {
    const config = gameEngine.getGameConfig()
    gameManager.registerGame(config)
    
    // 초기 레벨 로드
    loadLevel(selectedDifficulty, currentStage)
    
    // 최초 방문 시 자동으로 가이드 표시
    if (!hasSeenGuide) {
      setShowGuide(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // 난이도 변경
  const handleDifficultyChange = (difficulty: GameDifficulty) => {
    const progress = gameManager.getGameProgress('closure-cave', difficulty)
    if (!progress?.isUnlocked) {
      setMessage({ 
        type: 'error', 
        text: `${difficulty === 'intermediate' ? '중급' : '고급'} 난이도는 이전 난이도를 완료해야 잠금 해제됩니다.` 
      })
      return
    }
    
    setSelectedDifficulty(difficulty)
    // progress.currentStage는 절대 스테이지 번호이므로 그대로 사용
    const targetStage = progress.currentStage
    setCurrentStage(targetStage)
    loadLevel(difficulty, targetStage)
  }
  
  // 코드 실행
  const handleRunCode = () => {
    if (isAnimating || !currentLevel) return
    
    setAttempts(attempts + 1)
    
    try {
      gameManager.startGameSession('closure-cave', selectedDifficulty, currentStage)
      gameManager.updateCurrentSession({ attempts: attempts + 1, hintsUsed })
      
      const result = gameEngine.validateSolution(currentLevel, userCode)
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setCharacterPath(result.characterPath || null)
        setIsAnimating(true)
        
        // 점수 업데이트
        if (result.score && onScoreUpdate) {
          onScoreUpdate(result.score)
        }
        
        // 진행 상황 업데이트
        gameManager.completeStage(result.score || 100)
        
      } else {
        setMessage({ type: 'error', text: result.message })
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `실행 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      })
    }
  }
  
  // 코드 초기화
  const handleReset = () => {
    if (currentLevel) {
      setUserCode(currentLevel.codeTemplate)
      setMessage(null)
      setCharacterPath(null)
      setIsAnimating(false)
    }
  }
  
  // 애니메이션 완료
  const handleAnimationComplete = () => {
    setIsAnimating(false)
    
    // 성공했고 마지막 스테이지가 아니라면 다음 스테이지로
    const progress = gameManager.getGameProgress('closure-cave', selectedDifficulty)
    const relativeCurrentStage = currentStage - CLOSURE_STAGE_RANGES[selectedDifficulty].min + 1
    if (progress && message?.type === 'success' && relativeCurrentStage < 5) {
      setTimeout(() => {
        const nextStage = currentStage + 1
        setCurrentStage(nextStage)
        loadLevel(selectedDifficulty, nextStage)
        const relativeNextStage = nextStage - CLOSURE_STAGE_RANGES[selectedDifficulty].min + 1
        setMessage({ type: 'info', text: `스테이지 ${relativeNextStage}로 이동합니다! 🎯` })
      }, 2000)
    }
  }
  
  // 힌트 표시
  const handleShowHint = () => {
    setShowHints(!showHints)
    if (!showHints) {
      setHintsUsed(hintsUsed + 1)
    }
  }

  // 게임 가이드 핸들러
  const handleGuideStart = () => {
    setShowGuide(false)
    setHasSeenGuide(true)
  }
  
  // 스테이지 이동
  const handleStageChange = (direction: 'prev' | 'next') => {
    const newStage = direction === 'prev' ? currentStage - 1 : currentStage + 1
    const minStage = CLOSURE_STAGE_RANGES[selectedDifficulty].min
    const maxStage = CLOSURE_STAGE_RANGES[selectedDifficulty].max
    
    if (newStage >= minStage && newStage <= maxStage) {
      setCurrentStage(newStage)
      loadLevel(selectedDifficulty, newStage)
    }
  }
  
  // 진행 상황 데이터
  const progress = gameManager.getGameProgress('closure-cave', selectedDifficulty)
  const beginnerProgress = gameManager.getGameProgress('closure-cave', 'beginner')
  const intermediateProgress = gameManager.getGameProgress('closure-cave', 'intermediate')
  const advancedProgress = gameManager.getGameProgress('closure-cave', 'advanced')
  
  if (!currentLevel) {
    return <div className="flex items-center justify-center h-96">로딩 중...</div>
  }
  
  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={theme.getGameStyles()}
    >
      {/* 게임 가이드 모달 */}
      <GameGuideModal 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onStart={handleGuideStart}
      />
      
      <div className="w-full p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6 relative z-50">
          <div className="flex items-center gap-4">
            <Link href={`/${currentLocale}`}>
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-1" />
                홈으로
              </Button>
            </Link>
            <h1 
              className="text-3xl font-bold"
              style={{ color: 'rgb(var(--foreground))' }}
            >
              클로저 동굴 🕳️
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowGuide(true)}
              variant="outline"
              size="sm"
            >
              게임 가이드
            </Button>
            <div className="flex items-center gap-2">
              <SimpleLanguageToggle variant="dropdown" />
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* 난이도 선택 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-foreground">난이도 선택</h2>
        <div className="flex gap-3">
          {(['beginner', 'intermediate', 'advanced'] as GameDifficulty[]).map((difficulty) => {
            const difficultyProgress = gameManager.getGameProgress('closure-cave', difficulty)
            const isUnlocked = difficultyProgress?.isUnlocked || false
            const completedStages = difficultyProgress?.completedStages.size || 0
            const isSelected = selectedDifficulty === difficulty
            
            const difficultyLabels = {
              beginner: '초급',
              intermediate: '중급', 
              advanced: '고급'
            }
            
            const getDifficultyClasses = (difficulty: GameDifficulty, isSelected: boolean) => {
              const baseClasses = 'transition-all duration-200'
              
              if (isSelected) {
                return `${baseClasses} bg-primary border-primary text-primary-foreground hover:opacity-90`
              }
              
              switch (difficulty) {
                case 'beginner':
                  return `${baseClasses} bg-background border-muted-foreground/20 text-muted-foreground hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/30`
                  
                case 'intermediate':
                  return `${baseClasses} bg-background border-muted-foreground/20 text-muted-foreground hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 dark:hover:border-purple-500 dark:hover:text-purple-400 dark:hover:bg-purple-950/30`
                  
                case 'advanced':
                  return `${baseClasses} bg-background border-muted-foreground/20 text-muted-foreground hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/30 dark:hover:border-rose-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/30`
                  
                default:
                  return baseClasses
              }
            }
            
            return (
              <Button
                key={difficulty}
                variant="outline"
                className={`relative border-2 ${!isUnlocked ? 'opacity-50' : ''} ${getDifficultyClasses(difficulty, isSelected)}`}
                onClick={() => handleDifficultyChange(difficulty)}
                disabled={!isUnlocked}
              >
                <div className="flex items-center gap-2">
                  {!isUnlocked && <Lock className="h-4 w-4" />}
                  <span>{difficultyLabels[difficulty]}</span>
                  {completedStages === 5 && (
                    <Trophy 
                      className="h-4 w-4" 
                      style={{ color: 'rgb(var(--yellow-500))' }}
                    />
                  )}
                  <span className="text-xs">({completedStages}/5)</span>
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
            스테이지 {currentStage - CLOSURE_STAGE_RANGES[selectedDifficulty].min + 1} / 5
          </h3>
          <div className="text-sm text-muted-foreground">
            총 점수: {progress?.totalScore || 0}점
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((stage) => {
            const absoluteStage = CLOSURE_STAGE_RANGES[selectedDifficulty].min + stage - 1
            const relativeCurrentStage = currentStage - CLOSURE_STAGE_RANGES[selectedDifficulty].min + 1
            const isCompleted = progress?.completedStages.has(absoluteStage)
            const isCurrent = stage === relativeCurrentStage
            
            return (
            <button
              key={stage}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                ...(isCompleted
                  ? { backgroundColor: 'rgb(var(--green-500))', color: 'white' }
                  : isCurrent
                  ? { backgroundColor: 'rgb(var(--primary))', color: 'white' }
                  : { backgroundColor: 'rgb(var(--muted))', color: 'rgb(var(--muted-foreground))' }
                ),
                cursor: 'pointer'
              } as React.CSSProperties}
              onClick={() => {
                const targetStage = CLOSURE_STAGE_RANGES[selectedDifficulty].min + stage - 1
                setCurrentStage(targetStage)
                loadLevel(selectedDifficulty, targetStage)
              }}
              title={`스테이지 ${stage}로 이동`}
            >
              {isCompleted ? <Star className="h-4 w-4" /> : stage}
            </button>
            )
          })}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽: 게임 보드 및 설명 */}
        <div className="space-y-4">
          {/* 게임 보드 */}
          <GamePanel title={currentLevel.title}>
            <div className="space-y-4">
              <ClosureCaveBoard
                level={currentLevel}
                penguinPath={characterPath}
                isAnimating={isAnimating}
                onAnimationComplete={handleAnimationComplete}
              />
              
              {/* 설명과 힌트 */}
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  {currentLevel.description}
                </p>
                
                <div className="bg-accent/10 border border-accent rounded-lg p-3">
                  <h4 className="font-semibold text-sm text-accent-foreground mb-1">
                    💡 개념
                  </h4>
                  <p className="text-xs text-accent-foreground/90">
                    {currentLevel.explanation}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowHint}
                    className="text-xs"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    힌트 {showHints ? '숨기기' : '보기'}
                  </Button>
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
                          className="rounded p-2 border"
                          style={{
                            backgroundColor: 'rgb(var(--accent))',
                            borderColor: 'rgb(var(--border))'
                          }}
                        >
                          <p 
                            className="text-xs"
                            style={{ color: 'rgb(var(--accent-foreground))' }}
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
        
        {/* 오른쪽: 코드 에디터 */}
        <div className="space-y-4">
          <GamePanel title="💻 코드 에디터" className="h-full">
            <div className="space-y-4">
              <CodeEditor
                value={userCode}
                onChange={setUserCode}
                language="javascript"
                className="h-96"
              />
              
              {/* 메시지 표시 */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: message.type === 'success'
                        ? 'rgb(var(--green-50))'
                        : message.type === 'error'
                        ? 'rgb(var(--red-50))'
                        : 'rgb(var(--blue-50))',
                      borderColor: message.type === 'success'
                        ? 'rgb(var(--green-200))'
                        : message.type === 'error'
                        ? 'rgb(var(--red-200))'
                        : 'rgb(var(--blue-200))',
                      color: message.type === 'success'
                        ? 'rgb(var(--green-700))'
                        : message.type === 'error'
                        ? 'rgb(var(--red-700))'
                        : 'rgb(var(--blue-700))'
                    }}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 버튼들 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleRunCode}
                  disabled={isAnimating}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isAnimating ? '실행 중...' : '코드 실행'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isAnimating}
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
                  disabled={currentStage === CLOSURE_STAGE_RANGES[selectedDifficulty].min}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  이전 스테이지
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStageChange('next')}
                  disabled={currentStage === CLOSURE_STAGE_RANGES[selectedDifficulty].max}
                >
                  다음 스테이지
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </GamePanel>
        </div>
        </div>
      </div>
    </div>
  )
}