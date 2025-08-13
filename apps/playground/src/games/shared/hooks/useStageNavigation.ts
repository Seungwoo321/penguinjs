import { DifficultyStageRanges, GameDifficulty } from '@/games/shared/types'

export interface StageNavigationHook {
  handleStageChange: (direction: 'prev' | 'next') => void
  canGoPrev: boolean
  canGoNext: boolean
  isFirstStage: boolean
  isLastStage: boolean
  currentRange: { min: number; max: number }
}

/**
 * 재사용 가능한 스테이지 네비게이션 훅
 * 난이도별로 다른 스테이지 범위를 지원합니다.
 * 
 * @param stageRanges 게임별 스테이지 범위 설정
 * @param currentStage 현재 스테이지 번호
 * @param selectedDifficulty 선택된 난이도
 * @param onStageChange 스테이지 변경 시 호출될 콜백
 * @returns 스테이지 네비게이션 관련 함수와 상태
 */
export function useStageNavigation(
  stageRanges: DifficultyStageRanges,
  currentStage: number,
  selectedDifficulty: GameDifficulty,
  onStageChange: (stage: number) => void
): StageNavigationHook {
  const currentRange = stageRanges[selectedDifficulty]
  
  const handleStageChange = (direction: 'prev' | 'next') => {
    const newStage = direction === 'prev' ? currentStage - 1 : currentStage + 1
    
    if (newStage >= currentRange.min && newStage <= currentRange.max) {
      onStageChange(newStage)
    }
  }

  const canGoPrev = currentStage > currentRange.min
  const canGoNext = currentStage < currentRange.max
  const isFirstStage = currentStage === currentRange.min
  const isLastStage = currentStage === currentRange.max

  return {
    handleStageChange,
    canGoPrev,
    canGoNext,
    isFirstStage,
    isLastStage,
    currentRange
  }
}