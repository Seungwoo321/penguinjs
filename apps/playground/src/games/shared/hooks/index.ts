/**
 * 공유 게임 훅 인덱스
 */

export { 
  useGameTheme, 
  useThemeMode, 
  useCSSThemeVariables, 
  useCompleteGameTheme 
} from './useGameTheme'

export type { 
  GameThemeConfig, 
  ColorIntensity 
} from './useGameTheme'

export { useStageNavigation } from './useStageNavigation'

// 게임별 테마 훅들
export { useClosureCaveTheme } from '../../closure-cave/hooks/useClosureCaveTheme'
export { useCallStackLibraryGameTheme } from '../../callstack-library/hooks/useCallStackLibraryGameTheme'