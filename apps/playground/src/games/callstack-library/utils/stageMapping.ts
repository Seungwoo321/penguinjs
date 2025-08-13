import { GameDifficulty } from '@/games/shared/types'
import { CALLSTACK_STAGE_RANGES } from '@/games/callstack-library/game-config'

/**
 * Converts an absolute stage number (1-22) to a relative stage number (1-8) within its difficulty
 */
export function getRelativeStageNumber(absoluteStageNumber: number): number {
  // Find which difficulty range this stage belongs to
  for (const difficulty of ['beginner', 'intermediate', 'advanced'] as GameDifficulty[]) {
    const range = CALLSTACK_STAGE_RANGES[difficulty]
    if (absoluteStageNumber >= range.min && absoluteStageNumber <= range.max) {
      // Return 1-based relative number within this difficulty
      return absoluteStageNumber - range.min + 1
    }
  }
  
  // Fallback - should not happen with valid stage numbers
  return absoluteStageNumber
}

/**
 * Converts a relative stage number (1-8) within a difficulty to an absolute stage number (1-22)
 */
export function getAbsoluteStageNumber(relativeStageNumber: number, difficulty: GameDifficulty): number {
  const range = CALLSTACK_STAGE_RANGES[difficulty]
  return range.min + relativeStageNumber - 1
}

/**
 * Gets the difficulty level for a given absolute stage number
 */
export function getDifficultyForStage(absoluteStageNumber: number): GameDifficulty | null {
  for (const difficulty of ['beginner', 'intermediate', 'advanced'] as GameDifficulty[]) {
    const range = CALLSTACK_STAGE_RANGES[difficulty]
    if (absoluteStageNumber >= range.min && absoluteStageNumber <= range.max) {
      return difficulty
    }
  }
  return null
}