/**
 * CallStack Library 게임의 큐별 스타일을 관리하는 컴포넌트
 * Tailwind v4 CSS 변수 기반 스타일링
 */

import { cn } from '@penguinjs/ui'

export type QueueType = 'callstack' | 'microtask' | 'macrotask'

// CSS 변수 기반 동적 스타일 생성
export const getQueueStyles = (queueType: QueueType, variant: 'container' | 'header' | 'item' = 'container') => {
  const baseStyles = {
    callstack: {
      container: 'bg-[rgb(var(--game-callstack-queue-bg-light))] border-[rgb(var(--game-callstack-queue-accent))]',
      header: 'bg-gradient-to-r from-[rgb(var(--game-callstack-queue-bg-main))] to-[rgb(var(--game-callstack-queue-bg-dark))]',
      item: 'bg-[rgb(var(--game-callstack-queue-accent))] text-white',
      text: 'text-[rgb(var(--game-callstack-queue-primary))]',
      hover: 'hover:bg-[rgb(var(--game-callstack-queue-bg-main))]'
    },
    microtask: {
      container: 'bg-[rgb(var(--game-callstack-urgent-bg-light))] border-[rgb(var(--game-callstack-urgent-accent))]',
      header: 'bg-gradient-to-r from-[rgb(var(--game-callstack-urgent-bg-main))] to-[rgb(var(--game-callstack-urgent-bg-dark))]',
      item: 'bg-[rgb(var(--game-callstack-urgent-accent))] text-white',
      text: 'text-[rgb(var(--game-callstack-urgent-primary))]',
      hover: 'hover:bg-[rgb(var(--game-callstack-urgent-bg-main))]'
    },
    macrotask: {
      container: 'bg-[rgb(var(--game-callstack-scheduled-bg-light))] border-[rgb(var(--game-callstack-scheduled-accent))]',
      header: 'bg-gradient-to-r from-[rgb(var(--game-callstack-scheduled-bg-main))] to-[rgb(var(--game-callstack-scheduled-bg-dark))]',
      item: 'bg-[rgb(var(--game-callstack-scheduled-accent))] text-white',
      text: 'text-[rgb(var(--game-callstack-scheduled-primary))]',
      hover: 'hover:bg-[rgb(var(--game-callstack-scheduled-bg-main))]'
    }
  }

  const styles = baseStyles[queueType]
  
  switch (variant) {
    case 'container':
      return cn(styles.container, 'rounded-xl shadow-lg overflow-hidden')
    case 'header':
      return cn(styles.header, styles.text, 'p-3 border-b')
    case 'item':
      return cn(styles.item, styles.hover, 'rounded-lg p-3 transition-all cursor-pointer')
    default:
      return styles.container
  }
}

// 큐별 그라디언트 배경
export const getQueueGradient = (queueType: QueueType) => {
  const gradients = {
    callstack: 'bg-gradient-to-br from-[rgb(var(--game-callstack-queue-bg-light))] to-[rgb(var(--game-callstack-queue-bg-main))]',
    microtask: 'bg-gradient-to-br from-[rgb(var(--game-callstack-urgent-bg-light))] to-[rgb(var(--game-callstack-urgent-bg-main))]',
    macrotask: 'bg-gradient-to-br from-[rgb(var(--game-callstack-scheduled-bg-light))] to-[rgb(var(--game-callstack-scheduled-bg-main))]'
  }
  
  return gradients[queueType]
}

// 다크 모드 지원
export const getQueueDarkStyles = (queueType: QueueType) => {
  const darkStyles = {
    callstack: 'dark:bg-[rgb(var(--game-callstack-queue-bg-dark))] dark:text-gray-200',
    microtask: 'dark:bg-[rgb(var(--game-callstack-urgent-bg-dark))] dark:text-cyan-200',
    macrotask: 'dark:bg-[rgb(var(--game-callstack-scheduled-bg-dark))] dark:text-coral-200'
  }
  
  return darkStyles[queueType]
}

// 도서관 테마 텍스처 스타일
export const libraryTextures = {
  wood: `bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgb(var(--game-callstack-library-wood)/10)_40px,rgb(var(--game-callstack-library-wood)/10)_41px)]`,
  paper: 'bg-[rgb(var(--game-callstack-library-paper))]',
  leather: 'bg-[rgb(var(--game-callstack-library-leather))]'
}

// 의미론적 색상 클래스
export const semanticColors = {
  success: 'bg-[rgb(var(--game-callstack-library-success))] text-white',
  error: 'bg-[rgb(var(--game-callstack-library-overdue))] text-white',
  processing: 'bg-[rgb(var(--game-callstack-urgent-accent))] text-white'
}