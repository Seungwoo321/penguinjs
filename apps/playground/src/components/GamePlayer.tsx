'use client'

import { useState, useEffect } from 'react'
import { useGameStore, CodeExecutor, ScoringSystem, AchievementSystem, Score } from '@penguinjs/game-engine'
import { GameLayout, GamePanel, CodeEditor, Button, ThemeToggle } from '@penguinjs/ui'
import { Play, RotateCcw, Lightbulb, CheckCircle, XCircle, Star, Trophy, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { initializeGames, gameRegistry } from '@/lib/games'
import { ClosureCaveGame } from './games/ClosureCaveGame'

interface GamePlayerProps {
  gameId: string
  locale: string
}

export function GamePlayer({ gameId, locale }: GamePlayerProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [attempts, setAttempts] = useState(1)
  const [hintsViewed, setHintsViewed] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [score, setScore] = useState<Score | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([])
  
  const {
    userCode,
    setUserCode,
    isExecuting,
    setExecuting,
    executionResult,
    setExecutionResult,
    completeStage
  } = useGameStore()

  const router = useRouter()
  const achievementSystem = new AchievementSystem()
  
  // 게임 초기화
  initializeGames()
  
  const game = gameRegistry.getGame(gameId)
  const currentStage = game?.stages[currentStageIndex]
  const executor = CodeExecutor.getInstance()

  useEffect(() => {
    if (currentStage && !userCode) {
      setUserCode(currentStage.initialCode)
    }
  }, [currentStage, userCode, setUserCode])

  if (!game || !currentStage) {
    return <div>게임을 찾을 수 없습니다.</div>
  }

  const handleRunCode = async () => {
    if (!currentStage || isExecuting) return

    setExecuting(true)
    setTestResults(null)
    const executionStartTime = Date.now()

    try {
      const results = await executor.runTestCases(userCode, currentStage.testCases)
      setTestResults(results)
      
      if (results.passed === results.total) {
        // Calculate score
        const executionTime = Date.now() - startTime
        const calculatedScore = ScoringSystem.calculateScore(
          true,
          executionTime,
          hintsViewed,
          attempts
        )
        setScore(calculatedScore)
        
        // Check achievements
        const newAchievements = achievementSystem.checkAndUnlockAchievements(
          gameId,
          currentStage.id,
          calculatedScore,
          executionTime
        )
        if (newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements)
        }
        
        completeStage(gameId, currentStage.id, calculatedScore.points)
      } else {
        setAttempts(attempts + 1)
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: null,
        error: '코드 실행 중 오류가 발생했습니다',
        executionTime: 0
      })
      setAttempts(attempts + 1)
    } finally {
      setExecuting(false)
    }
  }

  const handleReset = () => {
    setUserCode(currentStage.initialCode)
    setTestResults(null)
    setExecutionResult(null)
  }

  const handleNextStage = () => {
    if (currentStageIndex < game.stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1)
      setUserCode('')
      setTestResults(null)
      setExecutionResult(null)
      setScore(null)
      setAttempts(1)
      setHintsViewed(0)
      setStartTime(Date.now())
      setUnlockedAchievements([])
    }
  }

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1)
      setUserCode('')
      setTestResults(null)
      setExecutionResult(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/${locale}`)}>
            <Home className="h-4 w-4 mr-1" />
            홈으로
          </Button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {game.metadata.title} {game.metadata.icon}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              스테이지 {currentStageIndex + 1} / {game.stages.length}
            </span>
            <div className="flex gap-1">
              {game.stages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < currentStageIndex
                      ? 'bg-green-500'
                      : index === currentStageIndex
                      ? 'bg-blue-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-4">
        {/* 왼쪽: 문제 설명 */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-4 lg:max-h-full lg:overflow-hidden">
          {/* 게임 비주얼 (Closure Cave만) */}
          {gameId === 'closure-cave' && (
            <div className="mb-4">
              <ClosureCaveGame 
                stage={currentStage as any}
                onComplete={handleNextStage}
                testResults={testResults}
              />
            </div>
          )}
          
          <GamePanel title={`🎯 ${currentStage.title}`} className="flex-1 flex flex-col">
            <div className="space-y-4">
              <p className="text-[rgb(var(--text-primary))]">{currentStage.description}</p>
              
              <div className="bg-[rgb(var(--surface-secondary))] border border-[rgb(var(--border-primary))] p-4 rounded-lg">
                <h4 className="font-medium text-[rgb(var(--text-primary))] mb-2">💡 개념</h4>
                <p className="text-sm text-[rgb(var(--text-tertiary))]">
                  {currentStage.explanation}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowHints(!showHints)
                    if (!showHints) setHintsViewed(hintsViewed + 1)
                  }}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  힌트 {showHints ? '숨기기' : '보기'}
                </Button>
              </div>

              {showHints && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 힌트</h4>
                  <ul className="space-y-1">
                    {currentStage.hints.map((hint, index) => (
                      <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                        • {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GamePanel>

          {/* 테스트 결과 */}
          {testResults && (
            <GamePanel title="테스트 결과">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-medium ${
                    testResults.passed === testResults.total 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {testResults.passed}/{testResults.total} 통과
                  </span>
                  {testResults.passed === testResults.total && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                {testResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    <span className="text-[rgb(var(--text-tertiary))]">
                      {result.testCase.description}
                    </span>
                  </div>
                ))}

                {testResults.passed === testResults.total && (
                  <div className="mt-4 pt-4 border-t">
                    <Button onClick={handleNextStage} className="w-full">
                      다음 단계로 →
                    </Button>
                  </div>
                )}
              </div>
            </GamePanel>
          )}

          {/* 점수 및 업적 */}
          {score && (
            <GamePanel title="🏆 결과">
              <div className="space-y-4">
                {/* 점수 */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-lg">총점</h4>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {score.points}점
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-2xl">
                    {ScoringSystem.getStarEmoji(score.stars)}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <p>시간 보너스: +{score.timeBonus}점</p>
                    <p>힌트 사용: -{score.hintsUsed * 10}점</p>
                    <p>시도 횟수: {score.attempts}회</p>
                  </div>
                </div>

                {/* 업적 */}
                {unlockedAchievements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      새로운 업적!
                    </h4>
                    {unlockedAchievements.map(achievement => (
                      <div key={achievement.id} className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GamePanel>
          )}
        </div>

        {/* 오른쪽: 코드 에디터 */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-4">
          <GamePanel title="코드 에디터" className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              <CodeEditor
                value={userCode}
                onChange={setUserCode}
                language="javascript"
                placeholder="여기에 코드를 작성하세요..."
                className="flex-1 min-h-[300px] lg:min-h-[400px]"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleRunCode} 
                  disabled={isExecuting}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isExecuting ? '실행 중...' : '코드 실행'}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  초기화
                </Button>
              </div>
            </div>
          </GamePanel>
        </div>
      </div>
    </div>
  )
}