/**
 * 콜스택 도서관 게임 테마 설정
 * 공통 게임 테마 시스템을 사용하면서 콜스택 도서관 특화 기능 제공
 */

import { GameThemeConfig } from '@/games/shared/hooks/useGameTheme'

// 콜스택 도서관 테마 색상 (기존 스타일 기반)
export const callstackLibraryThemeConfig: GameThemeConfig = {
  gameId: 'callstack-library',
  namespace: 'callstack',
  colorScheme: {
    // 주요 색상: 중성적이고 깨끗한 회색 계열
    primary: '71 85 105',         // slate-600 - 중성적인 청회색
    secondary: '100 116 139',     // slate-500 - 부드러운 회색
    accent: '51 65 85',           // slate-700 - 진한 회색

    // 상태 색상
    success: '34 197 94',         // 에메랄드 (성공)
    warning: '251 146 60',        // orange-400 (경고)
    error: '239 68 68',           // 빨간색 (오류)

    // 배경 색상 (직접 RGB 값 사용)
    background: {
      main: '255 255 255',              // white (라이트 모드 기본)
      elevated: '255 255 255',          // white (카드 배경)
      secondary: '244 244 245'          // neutral-100 (보조 배경)
    },

    // 텍스트 색상 (직접 RGB 값 사용)
    text: {
      primary: '9 9 11',                // zinc-950 (주요 텍스트)
      secondary: '113 113 122',         // zinc-500 (보조 텍스트)
      muted: '161 161 170'              // zinc-400 (흐린 텍스트)
    },

    // 경계선 색상 (직접 RGB 값 사용)
    border: {
      default: '228 228 231',           // zinc-200 (기본 경계선)
      strong: '113 113 122',            // zinc-500 (강한 경계선)
      light: '244 244 245'              // zinc-100 (연한 경계선)
    }
  },

  // 콜스택 도서관 특수 색상
  specialColors: {
    // Queue별 색상 (중성적이고 깨끗한 색상)
    'queue-callstack': '71 85 105',      // slate-600 - 메인 콜스택
    'queue-callstack-light': '148 163 184', // slate-400 - 연한 회색
    'queue-microtask': '14 165 233',     // sky-500 - 마이크로태스크
    'queue-microtask-light': '125 211 252', // sky-300 - 연한 하늘색
    'queue-macrotask': '34 197 94',      // emerald-500 - 매크로태스크
    'queue-macrotask-light': '110 231 183', // emerald-300 - 연한 녹색

    // Library 테마 색상
    'library-wood': '100 116 139',       // slate-500 (도서관 선반)
    'library-paper': '248 250 252',      // slate-50 (책 페이지)
    'library-ink': '15 23 42',           // slate-900 (잉크)
    'library-gold': '100 116 139',       // slate-500 (장식)

    // Book 색상들 (중성적인 회색 계열)
    'book-red': '148 163 184',           // slate-400
    'book-blue': '100 116 139',          // slate-500
    'book-green': '71 85 105',           // slate-600
    'book-yellow': '51 65 85',           // slate-700
    'book-purple': '30 41 59',           // slate-800
    'book-pink': '148 163 184',          // slate-400
    'book-orange': '100 116 139',        // slate-500
    'book-teal': '71 85 105',            // slate-600

    // Shelf 색상
    'shelf-wood-light': '168 162 158',   // stone-400
    'shelf-wood-dark': '87 83 78',       // stone-600
    'shelf-shadow': '41 37 36',          // stone-800

    // Animation 색상
    'animation-highlight': '250 204 21',  // yellow-400
    'animation-success': '34 197 94',     // emerald-500
    'animation-error': '239 68 68',       // red-500

    // Stage별 색상
    'stage-beginner': '34 197 94',        // emerald-500
    'stage-intermediate': '14 165 233',   // sky-500
    'stage-advanced': '139 92 246',       // violet-500 (부드러운 보라색)

    // 함수별 색상 (스택 아이템용)
    'function-global': '92 51 23',        // global context - 갈색
    'function-main': '92 51 23',          // main function - 갈색
    'function-primary': '21 94 173',      // 주요 함수 - 파란색
    'function-secondary': '21 128 61',    // 보조 함수 - 녹색
    'function-tertiary': '139 92 246',    // 3차 함수 - 부드러운 보라색
    'function-quaternary': '245 158 11',  // 4차 함수 - 주황색

    // UI 요소 색상
    'button-primary': '71 85 105',        // slate-600
    'button-secondary': '100 116 139',    // slate-500
    'button-hover': '51 65 85',           // slate-700

    // Memory 관련 색상
    'memory-stack': '71 85 105',          // slate-600
    'memory-heap': '51 65 85',            // slate-700
    'memory-gc': '34 197 94',             // emerald-500

    // Code 하이라이트 색상
    'code-keyword': '71 85 105',          // slate-600
    'code-string': '34 197 94',           // emerald-500
    'code-number': '14 165 233',          // sky-500
    'code-comment': '148 163 184',        // slate-400

    // Layout별 색상
    'layout-a': '71 85 105',              // slate-600
    'layout-a-plus': '100 116 139',       // slate-500
    'layout-b': '51 65 85',               // slate-700

    // Accessibility 색상
    'focus-ring': '59 130 246',           // blue-500
    'high-contrast': '0 0 0',             // black
    'error-border': '239 68 68',          // red-500
    'success-border': '34 197 94'         // emerald-500
  }
}

// 콜스택 도서관 특화 유틸리티
export const callstackLibraryThemeUtils = {
  // Queue 스타일 생성
  getQueueStyle: (queueType: 'callstack' | 'microtask' | 'macrotask', theme: any) => {
    const baseStyle = {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }

    switch (queueType) {
      case 'callstack':
        return {
          ...baseStyle,
          backgroundColor: `rgb(${theme.getSpecialColor('queue-callstack')})`,
          color: 'white'
        }
      case 'microtask':
        return {
          ...baseStyle,
          backgroundColor: `rgb(${theme.getSpecialColor('queue-microtask')})`,
          color: 'white'
        }
      case 'macrotask':
        return {
          ...baseStyle,
          backgroundColor: `rgb(${theme.getSpecialColor('queue-macrotask')})`,
          color: 'white'
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.getBackgroundColor('elevated'),
          color: theme.getTextColor('primary')
        }
    }
  },

  // 책 스타일 생성
  getBookStyle: (bookColor: string, theme: any, isOpen: boolean = false) => {
    const baseColor = theme.getSpecialColor(`book-${bookColor}`) || theme.getPrimaryColor()
    
    return {
      backgroundColor: `rgb(${baseColor})`,
      color: 'white',
      borderRadius: '4px',
      boxShadow: isOpen 
        ? `0 4px 12px rgba(${baseColor}, 0.3)`
        : `0 2px 6px rgba(${baseColor}, 0.2)`,
      transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.3s ease'
    }
  },

  // 선반 스타일 생성
  getShelfStyle: (theme: any) => ({
    backgroundColor: `rgb(${theme.getSpecialColor('shelf-wood-light')})`,
    borderColor: `rgb(${theme.getSpecialColor('shelf-wood-dark')})`,
    boxShadow: `inset 0 2px 4px rgba(${theme.getSpecialColor('shelf-shadow')}, 0.1)`
  }),

  // 라이브러리안 스타일
  getLibrarianStyle: (theme: any) => ({
    backgroundColor: theme.getBackgroundColor('elevated'),
    borderColor: theme.getBorderColor(),
    color: theme.getTextColor('primary')
  }),

  // 애니메이션 스타일
  getAnimationStyle: (type: 'highlight' | 'success' | 'error', theme: any) => ({
    backgroundColor: `rgb(${theme.getSpecialColor(`animation-${type}`)})`,
    animation: `${type}Glow 0.6s ease-in-out`,
    borderRadius: '4px'
  }),

  // 레이아웃별 스타일
  getLayoutStyle: (layoutType: 'A' | 'A+' | 'B', theme: any) => {
    const layoutKey = layoutType === 'A+' ? 'layout-a-plus' : `layout-${layoutType.toLowerCase()}`
    
    return {
      borderColor: `rgb(${theme.getSpecialColor(layoutKey)})`,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '8px'
    }
  },

  // 메모리 표시 스타일
  getMemoryStyle: (memoryType: 'stack' | 'heap' | 'gc', theme: any) => ({
    backgroundColor: `rgb(${theme.getSpecialColor(`memory-${memoryType}`)})`,
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  }),

  // 코드 하이라이트 스타일
  getCodeHighlightStyle: (tokenType: 'keyword' | 'string' | 'number' | 'comment', theme: any) => ({
    color: `rgb(${theme.getSpecialColor(`code-${tokenType}`)})`,
    fontWeight: tokenType === 'keyword' ? 'bold' : 'normal'
  })
}