import { useMemo } from 'react'
import { GameDifficulty } from '@/games/shared/types'
import { getLayoutType, getStageQueues, getLayoutDescription } from '@/games/callstack-library/utils/layoutClassifier'
import { LayoutType } from '@/games/callstack-library/types'

export interface UseLayoutTypeResult {
  layoutType: LayoutType
  requiredQueues: string[]
  layoutDescription: string
  isBasicCallStack: boolean
  isEventLoop: boolean
  isMultiQueue: boolean
  isComplexQueue: boolean
}

export function useLayoutType(difficulty: GameDifficulty, stage: number): UseLayoutTypeResult {
  return useMemo(() => {
    const layoutType = getLayoutType(difficulty, stage)
    const requiredQueues = getStageQueues(difficulty, stage)
    const layoutDescription = getLayoutDescription(layoutType)
    
    return {
      layoutType,
      requiredQueues,
      layoutDescription,
      isBasicCallStack: layoutType === 'A',
      isEventLoop: layoutType === 'B', 
      isMultiQueue: layoutType === 'C',
      isComplexQueue: layoutType === 'D'
    }
  }, [difficulty, stage])
}