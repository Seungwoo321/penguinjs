/**
 * 클로저 동굴 게임 테마 설정
 * 기존 스타일을 유지하면서 체계적인 테마 시스템으로 전환
 */

import { GameThemeConfig } from '@/games/shared/hooks/useGameTheme'

// 클로저 동굴 테마 색상 (기존 스타일 기반)
export const closureCaveThemeConfig: GameThemeConfig = {
  gameId: 'closure-cave',
  namespace: 'closure',
  colorScheme: {
    // 주요 색상: 동굴의 신비로운 느낌을 위한 보라-파랑 계열
    primary: '99 102 241',      // 보라색 (indigo-500)
    secondary: '168 85 247',    // 자주색 (purple-500) 
    accent: '34 197 94',        // 에메랄드 (emerald-500) - 보물 색상

    // 상태 색상
    success: '34 197 94',       // 에메랄드 (성공)
    warning: '245 158 11',      // 주황색 (경고)
    error: '239 68 68',         // 빨간색 (오류)

    // 배경 색상 (기존 글로벌 변수 활용)
    background: {
      main: 'var(--background)',        // 메인 배경
      elevated: 'var(--card)',          // 카드 배경
      secondary: 'var(--muted)'         // 보조 배경
    },

    // 텍스트 색상 (기존 글로벌 변수 활용)
    text: {
      primary: 'var(--foreground)',     // 주요 텍스트
      secondary: 'var(--muted-foreground)', // 보조 텍스트
      muted: 'var(--muted-foreground)'  // 흐린 텍스트
    },

    // 경계선 색상 (기존 글로벌 변수 활용)
    border: {
      default: 'var(--border)',         // 기본 경계선
      strong: 'var(--foreground)',      // 강한 경계선
      light: 'var(--muted)'             // 연한 경계선
    }
  },

  // 클로저 동굴 특수 색상
  specialColors: {
    // 동굴 환경 색상
    'cave-wall': '120 113 108',        // 동굴 벽 (stone-500)
    'cave-floor': '168 162 158',       // 동굴 바닥 (stone-400)
    'cave-shadow': '68 64 60',         // 동굴 그림자 (stone-700)
    
    // 보물 관련 색상
    'treasure-gold': '245 158 11',     // 황금 보물 (amber-500)
    'treasure-silver': '148 163 184',  // 은 보물 (slate-400)
    'treasure-emerald': '34 197 94',   // 에메랄드 보물 (emerald-500)
    
    // 캐릭터 색상
    'penguin-body': '51 65 85',        // 펭귄 몸통 (slate-700)
    'penguin-belly': '248 250 252',    // 펭귄 배 (slate-50)
    'penguin-beak': '251 146 60',      // 펭귄 부리 (orange-400)

    // 경로 표시 색상
    'path-active': '34 197 94',        // 활성 경로 (emerald-500)
    'path-completed': '107 114 128',   // 완료된 경로 (slate-500)
    'path-blocked': '239 68 68',       // 차단된 경로 (red-500)

    // 게임 상태 색상
    'start-position': '59 130 246',    // 시작 위치 (blue-500)
    'target-position': '34 197 94',    // 목표 위치 (emerald-500)
    'obstacle': '120 113 108',         // 장애물 (stone-500)
    'position-text': '255 255 255',    // 위치 텍스트 (white)

    // 가이드 모달 라이트 테마 색상 (amber 계열)
    'guide-bg-light': '254 243 199',         // amber-100
    'guide-bg-light-secondary': '253 230 138', // amber-200
    'guide-bg-light-tertiary': '254 251 235', // amber-50
    'guide-bg-light-code': '254 249 195',    // amber-50
    'guide-border-light': '251 191 36',      // amber-400
    'guide-border-light-secondary': '252 211 77', // amber-300
    'guide-text-light': '146 64 14',         // amber-800
    'guide-text-light-secondary': '120 53 15', // amber-900
    'guide-text-light-tertiary': '180 83 9',  // amber-700
    'guide-accent-light': '245 158 11',      // amber-500
    'guide-accent-light-secondary': '217 119 6', // amber-600
    'guide-icon-bg-light': '245 158 11',     // amber-500
    'guide-dot-active-light': '245 158 11',   // amber-500
    'guide-dot-inactive-light': '254 240 138', // amber-200
    
    // 가이드 모달 다크 테마 색상 (기존 유지)
    'guide-bg-dark': 'var(--background)',
    'guide-bg-dark-secondary': 'var(--card)',
    'guide-bg-dark-elevated': 'var(--muted)',
    'guide-border-dark': 'var(--border)',
    'guide-text-dark': 'var(--foreground)',
    'guide-text-dark-secondary': 'var(--muted-foreground)',
    'guide-accent-dark': '251 191 36',       // amber-400
    'guide-header': '217 119 6',             // amber-600
    'guide-header-end': '234 88 12',         // orange-600

    // 난이도별 색상 - 라이트 모드
    'difficulty-beginner-bg-light': '240 253 244',      // green-50
    'difficulty-beginner-border-light': '134 239 172',  // green-300
    'difficulty-beginner-text-light': '22 101 52',      // green-800
    'difficulty-intermediate-bg-light': '254 249 195',  // yellow-50
    'difficulty-intermediate-border-light': '253 224 71', // yellow-300
    'difficulty-intermediate-text-light': '133 77 14',  // yellow-900
    'difficulty-advanced-bg-light': '254 242 242',      // red-50
    'difficulty-advanced-border-light': '252 165 165',  // red-300
    'difficulty-advanced-text-light': '153 27 27',      // red-800
    
    // 난이도별 색상 - 다크 모드
    'difficulty-beginner-bg-dark': '6 78 59',         // green-950 with opacity
    'difficulty-beginner-border-dark': '34 197 94',   // green-500
    'difficulty-beginner-text-dark': '134 239 172',   // green-300
    'difficulty-intermediate-bg-dark': '66 32 6',     // yellow-950 with opacity
    'difficulty-intermediate-border-dark': '245 158 11', // amber-500
    'difficulty-intermediate-text-dark': '253 224 71', // yellow-300
    'difficulty-advanced-bg-dark': '69 10 10',        // red-950 with opacity
    'difficulty-advanced-border-dark': '239 68 68',   // red-500
    'difficulty-advanced-text-dark': '252 165 165',   // red-300

    // 힌트 색상
    'hint-bg': '254 249 195',          // yellow-50
    'hint-border': '254 240 138',      // yellow-200
    'hint-text': '133 77 14',          // yellow-900

    // 메시지 색상
    'message-success-bg': '240 253 244',   // green-50
    'message-success-text': '22 101 52',   // green-800
    'message-error-bg': '254 242 242',     // red-50
    'message-error-text': '153 27 27',     // red-800
    'message-info-bg': '239 246 255',      // blue-50
    'message-info-text': '30 64 175',      // blue-800
    
    // 코드 블록 색상
    'code-bg-light': '243 244 246',        // gray-100
    'code-bg-dark': '17 24 39',            // gray-900
    'code-text-light': '22 101 52',        // green-800
    'code-text-dark': '134 239 172',       // green-300
    'code-border-light': '34 197 94',      // green-500 with opacity
    'code-border-dark': '134 239 172',     // green-300 with opacity
    
    // 아이콘 배경 색상
    'icon-bg-light': '0 0 0',              // black with opacity
    'icon-bg-dark': '255 255 255',         // white with opacity

    // 장애물별 색상
    'obstacle-rock-bg': '156 163 175',     // gray-400
    'obstacle-rock-border': '107 114 128', // gray-500
    'obstacle-ice-bg': '224 242 254',      // cyan-100
    'obstacle-ice-border': '165 243 252',  // cyan-300
    'obstacle-water-bg': '191 219 254',    // blue-200 with opacity
    'obstacle-water-border': '96 165 250'  // blue-400
  }
}

// 클로저 동굴 전용 테마 훅
export const useClosureCaveTheme = (forceDarkMode?: boolean) => {
  // 공통 게임 테마 훅 사용
  const { useCompleteGameTheme } = require('../../shared/hooks/useGameTheme')
  return useCompleteGameTheme(closureCaveThemeConfig, forceDarkMode)
}

// 클로저 동굴 특화 유틸리티
export const closureCaveThemeUtils = {
  // 게임 보드 셀 스타일
  getCellStyle: (cellType: 'empty' | 'start' | 'target' | 'obstacle' | 'treasure', theme: any) => {
    const baseStyle = {
      border: `1px solid ${theme.getBorderColor('light')}`,
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    }

    switch (cellType) {
      case 'start':
        return {
          ...baseStyle,
          background: theme.getSpecialColor('start-position'),
          color: 'white'
        }
      case 'target':
        return {
          ...baseStyle,
          background: theme.getSpecialColor('target-position'),
          color: 'white'
        }
      case 'obstacle':
        return {
          ...baseStyle,
          background: theme.getSpecialColor('obstacle'),
          color: 'white'
        }
      case 'treasure':
        return {
          ...baseStyle,
          background: theme.getSpecialColor('treasure-gold'),
          color: 'white'
        }
      default:
        return {
          ...baseStyle,
          background: theme.getBackgroundColor('elevated'),
          color: theme.getTextColor('primary')
        }
    }
  },

  // 펭귄 캐릭터 스타일
  getPenguinStyle: (theme: any) => ({
    body: theme.getSpecialColor('penguin-body'),
    belly: theme.getSpecialColor('penguin-belly'),
    beak: theme.getSpecialColor('penguin-beak')
  }),

  // 경로 표시 스타일
  getPathStyle: (pathType: 'active' | 'completed' | 'blocked', theme: any) => ({
    backgroundColor: theme.getSpecialColor(`path-${pathType}`),
    opacity: pathType === 'completed' ? 0.6 : 1
  }),

  // 가이드 모달 스타일 (기존 amber 계열 유지)
  getGuideStyle: (theme: any) => ({
    background: `linear-gradient(to bottom, rgb(${theme.getSpecialColor('guide-bg')}), rgb(${theme.getSpecialColor('guide-bg-dark')}))`,
    borderColor: theme.getSpecialColor('guide-border'),
    textColor: theme.getSpecialColor('guide-text')
  })
}