/**
 * 콜스택 도서관 게임 전용 테마 시스템
 * CallStack Library Game에서만 사용되는 도서관 테마
 */

export type CallStackQueueType = 'callstack' | 'microtask' | 'macrotask'

export interface CallStackQueueTheme {
  primary: string
  secondary: string
  accent: string
  background: {
    light: string
    main: string
    dark: string
  }
  text: {
    primary: string
    secondary: string
    contrast: string
  }
  gradients: {
    main: string
    light: string
    button: string
    hover: string
  }
  border: {
    main: string
    light: string
    focus: string
  }
}

export interface CallStackLibraryTheme {
  name: 'callstack-library'
  colors: {
    callstack: CallStackQueueTheme
    microtask: CallStackQueueTheme
    macrotask: CallStackQueueTheme
  }
  library: {
    textures: {
      wood: string
      bookSpine: string
      paper: string
      leather: string
      shelf: string
    }
    elements: {
      bookWidth: {
        sm: string
        md: string
        lg: string
      }
      bookHeight: {
        sm: string
        md: string
        lg: string
      }
      shelfDepth: string
      shelfThickness: string
      libraryBackground: string
    }
  }
  spacing: {
    bookGap: {
      sm: string
      md: string
      lg: string
    }
    shelfGap: {
      sm: string
      md: string
      lg: string
    }
    sectionPadding: {
      xs: string
      sm: string
      md: string
      lg: string
    }
  }
  borderRadius: {
    book: string
    shelf: string
    panel: string
    button: string
  }
  shadows: {
    book: string
    shelf: string
    panel: string
    button: string
    focus: string
    libraryAmbient: string
  }
  animations: {
    bookDrop: {
      stiffness: number
      damping: number
      mass: number
    }
    shelfSlide: {
      stiffness: number
      damping: number
      mass: number
    }
    timing: {
      bookFlip: number
      shelfLoad: number
      libraryTransition: number
    }
  }
  breakpoints: {
    sm: number
    md: number
    lg: number
    xl: number
  }
  icons: {
    callstack: string
    microtask: string
    macrotask: string
    librarian: string
    book: string
  }
}

/**
 * 콜스택 도서관 게임 전용 테마 정의
 */
export const CALLSTACK_LIBRARY_THEME: CallStackLibraryTheme = {
  name: 'callstack-library',
  colors: {
    callstack: {
      primary: 'rgb(146, 64, 14)',      // amber-800 - 메인 서가용
      secondary: 'rgb(217, 119, 6)',    // amber-600
      accent: 'rgb(251, 191, 36)',      // amber-400
      background: {
        light: 'rgb(254, 243, 199)',    // amber-100 - 밝은 나무
        main: 'rgb(253, 230, 138)',     // amber-200 - 일반 나무
        dark: 'rgb(146, 64, 14)'        // amber-800 - 어두운 나무
      },
      text: {
        primary: 'rgb(146, 64, 14)',    
        secondary: 'rgb(180, 83, 9)',   
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(146, 64, 14), rgb(120, 53, 15))',
        light: 'linear-gradient(to right, rgb(254, 243, 199), rgb(253, 230, 138))',
        button: 'linear-gradient(to right, rgb(217, 119, 6), rgb(245, 158, 11))',
        hover: 'linear-gradient(to right, rgb(180, 83, 9), rgb(217, 119, 6))'
      },
      border: {
        main: 'rgb(217, 119, 6)',       
        light: 'rgb(251, 191, 36)',     
        focus: 'rgb(245, 158, 11)'      
      }
    },
    microtask: {
      primary: 'rgb(30, 64, 175)',      // blue-800 - 긴급 처리대용
      secondary: 'rgb(37, 99, 235)',    // blue-600
      accent: 'rgb(59, 130, 246)',      // blue-500
      background: {
        light: 'rgb(219, 234, 254)',    // blue-100
        main: 'rgb(191, 219, 254)',     // blue-200
        dark: 'rgb(30, 64, 175)'        // blue-800
      },
      text: {
        primary: 'rgb(30, 64, 175)',    
        secondary: 'rgb(29, 78, 216)',  
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(30, 64, 175), rgb(30, 58, 138))',
        light: 'linear-gradient(to right, rgb(219, 234, 254), rgb(191, 219, 254))',
        button: 'linear-gradient(to right, rgb(37, 99, 235), rgb(59, 130, 246))',
        hover: 'linear-gradient(to right, rgb(29, 78, 216), rgb(37, 99, 235))'
      },
      border: {
        main: 'rgb(37, 99, 235)',       
        light: 'rgb(59, 130, 246)',     
        focus: 'rgb(96, 165, 250)'      
      }
    },
    macrotask: {
      primary: 'rgb(194, 65, 12)',      // orange-800 - 예약 처리대용
      secondary: 'rgb(234, 88, 12)',    // orange-600
      accent: 'rgb(249, 115, 22)',      // orange-500
      background: {
        light: 'rgb(254, 215, 170)',    // orange-100
        main: 'rgb(253, 186, 116)',     // orange-200
        dark: 'rgb(194, 65, 12)'        // orange-800
      },
      text: {
        primary: 'rgb(194, 65, 12)',    
        secondary: 'rgb(215, 67, 6)',   
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(194, 65, 12), rgb(154, 52, 18))',
        light: 'linear-gradient(to right, rgb(254, 215, 170), rgb(253, 186, 116))',
        button: 'linear-gradient(to right, rgb(234, 88, 12), rgb(249, 115, 22))',
        hover: 'linear-gradient(to right, rgb(215, 67, 6), rgb(234, 88, 12))'
      },
      border: {
        main: 'rgb(234, 88, 12)',       
        light: 'rgb(249, 115, 22)',     
        focus: 'rgb(251, 146, 60)'      
      }
    }
  },
  library: {
    textures: {
      wood: `repeating-linear-gradient(
        90deg,
        transparent,
        transparent 40px,
        rgba(139, 69, 19, 0.1) 40px,
        rgba(139, 69, 19, 0.1) 41px
      ), repeating-linear-gradient(
        0deg,
        transparent,
        transparent 80px,
        rgba(139, 69, 19, 0.05) 80px,
        rgba(139, 69, 19, 0.05) 81px
      )`,
      bookSpine: `linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.1) 100%
      ), linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%
      )`,
      paper: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.1) 2px,
        rgba(255, 255, 255, 0.1) 4px
      )`,
      leather: `radial-gradient(
        circle at 20% 80%,
        rgba(139, 69, 19, 0.1) 0%,
        transparent 50%
      )`,
      shelf: `linear-gradient(
        to bottom,
        rgb(120, 53, 15) 0%,
        rgb(146, 64, 14) 30%,
        rgb(180, 83, 9) 100%
      )`
    },
    elements: {
      bookWidth: {
        sm: 'clamp(35px, 5vw, 45px)',
        md: 'clamp(45px, 6vw, 60px)',
        lg: 'clamp(60px, 8vw, 80px)'
      },
      bookHeight: {
        sm: 'clamp(40px, 6vh, 50px)',
        md: 'clamp(50px, 8vh, 65px)',
        lg: 'clamp(60px, 10vh, 80px)'
      },
      shelfDepth: '20px',
      shelfThickness: '8px',
      libraryBackground: 'linear-gradient(to bottom, #fefbf7, #fef3e7)'
    }
  },
  spacing: {
    bookGap: {
      sm: 'clamp(2px, 0.3vw, 4px)',
      md: 'clamp(4px, 0.5vw, 6px)',
      lg: 'clamp(6px, 0.8vw, 8px)'
    },
    shelfGap: {
      sm: 'clamp(6px, 1vh, 8px)',
      md: 'clamp(8px, 1.5vh, 12px)',
      lg: 'clamp(12px, 2vh, 16px)'
    },
    sectionPadding: {
      xs: 'clamp(4px, 0.5vw, 6px)',
      sm: 'clamp(8px, 1vw, 12px)',
      md: 'clamp(12px, 1.5vw, 16px)',
      lg: 'clamp(16px, 2vw, 24px)'
    }
  },
  borderRadius: {
    book: '4px',
    shelf: '8px',
    panel: '12px',
    button: '6px'
  },
  shadows: {
    book: `
      0 8px 16px rgba(0, 0, 0, 0.2),
      inset 2px 0 4px rgba(255, 255, 255, 0.3),
      inset -2px 0 4px rgba(0, 0, 0, 0.2)
    `,
    shelf: `
      0 4px 8px rgba(139, 69, 19, 0.3),
      inset 0 2px 0 rgba(255, 255, 255, 0.2)
    `,
    panel: '0 2px 8px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    libraryAmbient: '0 20px 40px rgba(139, 69, 19, 0.1)'
  },
  animations: {
    bookDrop: {
      stiffness: 200,
      damping: 25,
      mass: 0.8
    },
    shelfSlide: {
      stiffness: 150,
      damping: 20,
      mass: 1.0
    },
    timing: {
      bookFlip: 250,
      shelfLoad: 400,
      libraryTransition: 300
    }
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  icons: {
    callstack: '📚',
    microtask: '⚡',
    macrotask: '📅',
    librarian: '👩‍🏫',
    book: '📖'
  }
}

/**
 * 콜스택 도서관 테마 헬퍼 함수들
 */
export const getCallStackQueueTheme = (queueType: CallStackQueueType): CallStackQueueTheme => {
  return CALLSTACK_LIBRARY_THEME.colors[queueType]
}

export const getCallStackQueueColor = (
  queueType: CallStackQueueType, 
  variant: keyof CallStackQueueTheme['gradients'] = 'main'
): string => {
  return CALLSTACK_LIBRARY_THEME.colors[queueType].gradients[variant]
}

export const getCallStackQueueBorder = (
  queueType: CallStackQueueType, 
  variant: keyof CallStackQueueTheme['border'] = 'main'
): string => {
  return CALLSTACK_LIBRARY_THEME.colors[queueType].border[variant]
}

export const getCallStackQueueText = (
  queueType: CallStackQueueType, 
  variant: keyof CallStackQueueTheme['text'] = 'primary'
): string => {
  return CALLSTACK_LIBRARY_THEME.colors[queueType].text[variant]
}

/**
 * 도서관 특화 스타일 생성 헬퍼
 */
export const createLibraryBookStyles = (queueType: CallStackQueueType, isOpen = false) => {
  const theme = getCallStackQueueTheme(queueType)
  
  return {
    book: {
      background: theme.gradients.button,
      backgroundImage: CALLSTACK_LIBRARY_THEME.library.textures.bookSpine,
      color: theme.text.contrast,
      border: `1px solid ${theme.border.main}`,
      borderRadius: CALLSTACK_LIBRARY_THEME.borderRadius.book,
      boxShadow: CALLSTACK_LIBRARY_THEME.shadows.book,
      transform: isOpen ? 'rotateY(-15deg)' : 'rotateY(0deg)',
      transition: `all ${CALLSTACK_LIBRARY_THEME.animations.timing.bookFlip}ms ease`
    },
    spine: {
      background: `linear-gradient(to left, ${theme.border.main}, ${theme.primary})`,
      width: '8px',
      height: '100%',
      borderRadius: '2px 0 0 2px'
    },
    pages: {
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0 2px 2px 0',
      backgroundImage: CALLSTACK_LIBRARY_THEME.library.textures.paper
    }
  }
}

export const createLibraryShelfStyles = (queueType: CallStackQueueType) => {
  const theme = getCallStackQueueTheme(queueType)
  
  return {
    shelf: {
      background: CALLSTACK_LIBRARY_THEME.library.textures.shelf,
      backgroundImage: CALLSTACK_LIBRARY_THEME.library.textures.wood,
      border: `2px solid ${theme.border.main}`,
      borderRadius: CALLSTACK_LIBRARY_THEME.borderRadius.shelf,
      boxShadow: CALLSTACK_LIBRARY_THEME.shadows.shelf,
      minHeight: CALLSTACK_LIBRARY_THEME.library.elements.shelfDepth
    },
    shelfLabel: {
      background: theme.gradients.main,
      color: theme.text.contrast,
      padding: CALLSTACK_LIBRARY_THEME.spacing.sectionPadding.sm,
      borderRadius: CALLSTACK_LIBRARY_THEME.borderRadius.button,
      fontWeight: 'bold',
      textAlign: 'center' as const
    }
  }
}

/**
 * 반응형 콜스택 도서관 유틸리티
 */
export const getLibraryResponsiveValue = <T>(
  values: { sm: T; md: T; lg: T },
  currentWidth: number
): T => {
  if (currentWidth >= CALLSTACK_LIBRARY_THEME.breakpoints.lg) return values.lg
  if (currentWidth >= CALLSTACK_LIBRARY_THEME.breakpoints.md) return values.md
  return values.sm
}

export const getLibraryBreakpoint = (width: number): 'sm' | 'md' | 'lg' | 'xl' => {
  if (width >= CALLSTACK_LIBRARY_THEME.breakpoints.xl) return 'xl'
  if (width >= CALLSTACK_LIBRARY_THEME.breakpoints.lg) return 'lg'
  if (width >= CALLSTACK_LIBRARY_THEME.breakpoints.md) return 'md'
  return 'sm'
}

export default CALLSTACK_LIBRARY_THEME