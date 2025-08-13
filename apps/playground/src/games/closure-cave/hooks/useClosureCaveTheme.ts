/**
 * 클로저 동굴 전용 테마 훅
 * 공통 게임 테마 시스템을 사용하되, 클로저 동굴 특화 기능 제공
 */

import { useCompleteGameTheme } from '@/games/shared/hooks/useGameTheme'
import { closureCaveThemeConfig, closureCaveThemeUtils } from '@/games/closure-cave/theme/closureCaveTheme'

// 클로저 동굴 전용 테마 훅
export const useClosureCaveTheme = (forceDarkMode?: boolean) => {
  const baseTheme = useCompleteGameTheme(closureCaveThemeConfig, forceDarkMode)

  // 클로저 동굴 특화 기능 확장
  return {
    ...baseTheme,
    
    // 게임 보드 관련 메서드
    getCellStyle: (cellType: 'empty' | 'start' | 'target' | 'obstacle' | 'treasure') => 
      closureCaveThemeUtils.getCellStyle(cellType, baseTheme),
    
    getPenguinStyle: () => closureCaveThemeUtils.getPenguinStyle(baseTheme),
    
    getPathStyle: (pathType: 'active' | 'completed' | 'blocked') =>
      closureCaveThemeUtils.getPathStyle(pathType, baseTheme),
    
    getGuideStyle: () => closureCaveThemeUtils.getGuideStyle(baseTheme),

    // 클로저 동굴 특화 색상 접근
    getCaveColor: (type: 'wall' | 'floor' | 'shadow') =>
      baseTheme.getSpecialColor(`cave-${type}`),
    
    getTreasureColor: (type: 'gold' | 'silver' | 'emerald') =>
      baseTheme.getSpecialColor(`treasure-${type}`),
    
    getPositionColor: (type: 'start' | 'target' | 'obstacle') =>
      baseTheme.getSpecialColor(`${type}-position`),

    // 애니메이션 스타일
    getAnimationStyles: () => ({
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transformOrigin: 'center'
    }),

    // 호버 효과
    getHoverEffect: (baseColor: string) => ({
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: `0 4px 12px ${baseColor}30`
      }
    }),

    // 게임 상태별 스타일
    getGameStateStyle: (state: 'playing' | 'success' | 'error' | 'idle') => {
      switch (state) {
        case 'playing':
          return {
            borderColor: baseTheme.getPrimaryColor(),
            boxShadow: `0 0 0 2px ${baseTheme.getPrimaryColor()}20`
          }
        case 'success':
          return {
            borderColor: baseTheme.getSuccessColor(),
            boxShadow: `0 0 0 2px ${baseTheme.getSuccessColor()}20`
          }
        case 'error':
          return {
            borderColor: baseTheme.getErrorColor(),
            boxShadow: `0 0 0 2px ${baseTheme.getErrorColor()}20`
          }
        default:
          return {
            borderColor: baseTheme.getBorderColor(),
            boxShadow: 'none'
          }
      }
    },

    // 반응형 스타일
    getResponsiveStyles: () => ({
      mobile: {
        fontSize: '14px',
        padding: '8px',
        gap: '8px'
      },
      tablet: {
        fontSize: '16px',
        padding: '12px',
        gap: '12px'
      },
      desktop: {
        fontSize: '18px',
        padding: '16px',
        gap: '16px'
      }
    })
  }
}

// CSS 클래스명 생성 헬퍼
export const closureCaveClasses = {
  container: 'closure-cave-container',
  board: 'closure-cave-board',
  cell: 'closure-cave-cell',
  penguin: 'closure-cave-penguin',
  treasure: 'closure-cave-treasure',
  path: 'closure-cave-path',
  guide: 'closure-cave-guide'
}

// 스타일 상수
export const closureCaveConstants = {
  boardSize: {
    mobile: 280,
    tablet: 400,
    desktop: 480
  },
  cellSize: {
    mobile: 35,
    tablet: 50,
    desktop: 60
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}