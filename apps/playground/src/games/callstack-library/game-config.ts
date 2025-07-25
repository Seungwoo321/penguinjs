import { GameConfig, DifficultyStageRanges } from '../shared/types'

export const callstackLibraryConfig: GameConfig = {
  id: 'callstack-library',
  title: 'CallStack Library',
  koreanTitle: '콜스택 도서관',
  description: 'Master the call stack by organizing books in the library',
  koreanDescription: '도서관에서 책을 정리하며 콜스택을 마스터하세요',
  icon: '📚',
  difficulties: ['beginner', 'intermediate', 'advanced'],
  concepts: ['functions', 'recursion', 'stack overflow', 'execution context'],
  stagesPerDifficulty: 8,
  totalStagesPerDifficulty: 8,
  requiredScore: 70
}

// 콜스택 도서관의 난이도별 스테이지 범위
export const CALLSTACK_STAGE_RANGES: DifficultyStageRanges = {
  beginner: { min: 1, max: 8 },
  intermediate: { min: 9, max: 16 },
  advanced: { min: 17, max: 24 }
}