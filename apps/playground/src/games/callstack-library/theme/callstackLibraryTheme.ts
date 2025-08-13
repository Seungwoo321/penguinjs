/**
 * 콜스택 도서관 게임 전용 테마 시스템
 * CallStack Library Game에서만 사용되는 도서관 테마
 */
import { QueueType } from '@/games/callstack-library/types'

export type CallStackQueueType = 'callstack' | 'microtask' | 'macrotask' | 'animation' | 'generator' | 'io' | 'worker'

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
  colors: Record<QueueType, CallStackQueueTheme>
  semantic: {
    success: string      // 성공적인 대출/반납
    error: string        // 연체/분실
    warning: string      // 예약 마감 임박
    info: string         // 도서관 안내
    processing: string   // 처리 중 상태
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
  backgrounds: {
    level1: string      // 기본 배경
    level2: string      // 보조 배경
    level3: string      // 강조 배경
    level4: string      // 섬션 배경
  }
}

/**
 * 콜스택 도서관 게임 전용 테마 정의
 * WCAG AA 접근성 기준 충족 (4.5:1 대비비)
 */
export const CALLSTACK_LIBRARY_THEME: CallStackLibraryTheme = {
  name: 'callstack-library',
  colors: {
    callstack: {
      primary: 'rgb(74, 74, 74)',       // 중립적 그레이 (WCAG AA 충족)
      secondary: 'rgb(97, 97, 97)',     // 밝은 그레이
      accent: 'rgb(137, 116, 92)',      // 따뜻한 회갈색 (나무색)
      background: {
        light: 'rgb(210, 180, 140)',    // 더 어두운 탄 색상 (텍스트 대비 개선)
        main: 'rgb(205, 175, 130)',     // 중간 브라운
        dark: 'rgb(190, 160, 115)'      // 진한 브라운
      },
      text: {
        primary: 'rgb(74, 74, 74)',     // 중립 그레이 (충분한 대비)
        secondary: 'rgb(97, 97, 97)',   // 밝은 그레이
        contrast: 'rgb(255, 255, 255)'  // 흰색
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(74, 74, 74), rgb(97, 97, 97))',
        light: 'linear-gradient(to right, rgb(210, 180, 140), rgb(205, 175, 130))',
        button: 'linear-gradient(to right, rgb(97, 97, 97), rgb(137, 116, 92))',
        hover: 'linear-gradient(to right, rgb(74, 74, 74), rgb(97, 97, 97))'
      },
      border: {
        main: 'rgb(137, 116, 92)',       
        light: 'rgb(181, 163, 143)',     
        focus: 'rgb(115, 92, 69)'      
      }
    },
    microtask: {
      primary: 'rgb(21, 94, 117)',      // 차분한 청록 (WCAG AA 충족)
      secondary: 'rgb(31, 120, 139)',   // 중간 청록
      accent: 'rgb(64, 158, 171)',      // 밝은 청록
      background: {
        light: 'rgb(243, 251, 252)',    // 매우 연한 청록
        main: 'rgb(225, 244, 246)',     // 연한 청록
        dark: 'rgb(203, 235, 238)'      // 파스텔 청록
      },
      text: {
        primary: 'rgb(21, 94, 117)',    // 차분한 청록
        secondary: 'rgb(31, 120, 139)', // 중간 청록
        contrast: 'rgb(255, 255, 255)'  // 흰색
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(21, 94, 117), rgb(31, 120, 139))',
        light: 'linear-gradient(to right, rgb(243, 251, 252), rgb(225, 244, 246))',
        button: 'linear-gradient(to right, rgb(31, 120, 139), rgb(64, 158, 171))',
        hover: 'linear-gradient(to right, rgb(21, 94, 117), rgb(31, 120, 139))'
      },
      border: {
        main: 'rgb(64, 158, 171)',       
        light: 'rgb(147, 205, 212)',     
        focus: 'rgb(15, 71, 88)'      
      }
    },
    macrotask: {
      primary: 'rgb(171, 71, 73)',      // 따뜻한 코럴 (WCAG AA 충족)
      secondary: 'rgb(194, 94, 94)',    // 중간 코럴
      accent: 'rgb(229, 127, 116)',     // 밝은 코럴
      background: {
        light: 'rgb(255, 248, 246)',    // 매우 연한 코럴
        main: 'rgb(254, 236, 231)',     // 연한 코럴
        dark: 'rgb(252, 217, 209)'      // 파스텔 코럴
      },
      text: {
        primary: 'rgb(171, 71, 73)',    // 따뜻한 코럴
        secondary: 'rgb(194, 94, 94)',  // 중간 코럴
        contrast: 'rgb(255, 255, 255)'  // 흰색
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(171, 71, 73), rgb(194, 94, 94))',
        light: 'linear-gradient(to right, rgb(255, 248, 246), rgb(254, 236, 231))',
        button: 'linear-gradient(to right, rgb(194, 94, 94), rgb(229, 127, 116))',
        hover: 'linear-gradient(to right, rgb(171, 71, 73), rgb(194, 94, 94))'
      },
      border: {
        main: 'rgb(229, 127, 116)',       
        light: 'rgb(244, 182, 174)',     
        focus: 'rgb(136, 52, 54)'      
      }
    },
    priority: {
      primary: 'rgb(239, 68, 68)',      // 빨간색 - 우선순위
      secondary: 'rgb(248, 113, 113)',   
      accent: 'rgb(252, 165, 165)',      
      background: {
        light: 'rgb(254, 242, 242)',    
        main: 'rgb(254, 226, 226)',     
        dark: 'rgb(252, 165, 165)'      
      },
      text: {
        primary: 'rgb(239, 68, 68)',    
        secondary: 'rgb(248, 113, 113)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(239, 68, 68), rgb(248, 113, 113))',
        light: 'linear-gradient(to right, rgb(254, 242, 242), rgb(254, 226, 226))',
        button: 'linear-gradient(to right, rgb(248, 113, 113), rgb(252, 165, 165))',
        hover: 'linear-gradient(to right, rgb(239, 68, 68), rgb(248, 113, 113))'
      },
      border: {
        main: 'rgb(252, 165, 165)',       
        light: 'rgb(254, 202, 202)',     
        focus: 'rgb(185, 28, 28)'      
      }
    },
    circular: {
      primary: 'rgb(139, 92, 246)',      // 보라색 - 순환
      secondary: 'rgb(167, 139, 250)',   
      accent: 'rgb(196, 181, 253)',      
      background: {
        light: 'rgb(245, 243, 255)',    
        main: 'rgb(237, 233, 254)',     
        dark: 'rgb(221, 214, 254)'      
      },
      text: {
        primary: 'rgb(139, 92, 246)',    
        secondary: 'rgb(167, 139, 250)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(139, 92, 246), rgb(167, 139, 250))',
        light: 'linear-gradient(to right, rgb(245, 243, 255), rgb(237, 233, 254))',
        button: 'linear-gradient(to right, rgb(167, 139, 250), rgb(196, 181, 253))',
        hover: 'linear-gradient(to right, rgb(139, 92, 246), rgb(167, 139, 250))'
      },
      border: {
        main: 'rgb(196, 181, 253)',       
        light: 'rgb(221, 214, 254)',     
        focus: 'rgb(109, 40, 217)'      
      }
    },
    animation: {
      primary: 'rgb(139, 92, 246)',      // 보라색
      secondary: 'rgb(167, 139, 250)',   
      accent: 'rgb(196, 181, 253)',      
      background: {
        light: 'rgb(245, 243, 255)',    
        main: 'rgb(237, 233, 254)',     
        dark: 'rgb(221, 214, 254)'      
      },
      text: {
        primary: 'rgb(139, 92, 246)',    
        secondary: 'rgb(167, 139, 250)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(139, 92, 246), rgb(167, 139, 250))',
        light: 'linear-gradient(to right, rgb(245, 243, 255), rgb(237, 233, 254))',
        button: 'linear-gradient(to right, rgb(167, 139, 250), rgb(196, 181, 253))',
        hover: 'linear-gradient(to right, rgb(139, 92, 246), rgb(167, 139, 250))'
      },
      border: {
        main: 'rgb(196, 181, 253)',       
        light: 'rgb(221, 214, 254)',     
        focus: 'rgb(109, 40, 217)'      
      }
    },
    generator: {
      primary: 'rgb(20, 184, 166)',      // 청록색
      secondary: 'rgb(45, 212, 191)',   
      accent: 'rgb(94, 234, 212)',      
      background: {
        light: 'rgb(240, 253, 250)',    
        main: 'rgb(204, 251, 241)',     
        dark: 'rgb(153, 246, 228)'      
      },
      text: {
        primary: 'rgb(20, 184, 166)',    
        secondary: 'rgb(45, 212, 191)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(20, 184, 166), rgb(45, 212, 191))',
        light: 'linear-gradient(to right, rgb(240, 253, 250), rgb(204, 251, 241))',
        button: 'linear-gradient(to right, rgb(45, 212, 191), rgb(94, 234, 212))',
        hover: 'linear-gradient(to right, rgb(20, 184, 166), rgb(45, 212, 191))'
      },
      border: {
        main: 'rgb(94, 234, 212)',       
        light: 'rgb(153, 246, 228)',     
        focus: 'rgb(13, 148, 136)'      
      }
    },
    io: {
      primary: 'rgb(79, 70, 229)',       // 인디고
      secondary: 'rgb(99, 102, 241)',   
      accent: 'rgb(129, 140, 248)',      
      background: {
        light: 'rgb(238, 242, 255)',    
        main: 'rgb(224, 231, 255)',     
        dark: 'rgb(199, 210, 254)'      
      },
      text: {
        primary: 'rgb(79, 70, 229)',    
        secondary: 'rgb(99, 102, 241)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(79, 70, 229), rgb(99, 102, 241))',
        light: 'linear-gradient(to right, rgb(238, 242, 255), rgb(224, 231, 255))',
        button: 'linear-gradient(to right, rgb(99, 102, 241), rgb(129, 140, 248))',
        hover: 'linear-gradient(to right, rgb(79, 70, 229), rgb(99, 102, 241))'
      },
      border: {
        main: 'rgb(129, 140, 248)',       
        light: 'rgb(199, 210, 254)',     
        focus: 'rgb(55, 48, 163)'      
      }
    },
    worker: {
      primary: 'rgb(217, 119, 6)',       // 앰버
      secondary: 'rgb(245, 158, 11)',   
      accent: 'rgb(251, 191, 36)',      
      background: {
        light: 'rgb(255, 251, 235)',    
        main: 'rgb(254, 243, 199)',     
        dark: 'rgb(253, 230, 138)'      
      },
      text: {
        primary: 'rgb(217, 119, 6)',    
        secondary: 'rgb(245, 158, 11)', 
        contrast: 'rgb(255, 255, 255)'  
      },
      gradients: {
        main: 'linear-gradient(to bottom, rgb(217, 119, 6), rgb(245, 158, 11))',
        light: 'linear-gradient(to right, rgb(255, 251, 235), rgb(254, 243, 199))',
        button: 'linear-gradient(to right, rgb(245, 158, 11), rgb(251, 191, 36))',
        hover: 'linear-gradient(to right, rgb(217, 119, 6), rgb(245, 158, 11))'
      },
      border: {
        main: 'rgb(251, 191, 36)',       
        light: 'rgb(253, 230, 138)',     
        focus: 'rgb(180, 83, 9)'      
      }
    }
  },
  library: {
    textures: {
      wood: `repeating-linear-gradient(
        90deg,
        transparent,
        transparent 40px,
        rgba(137, 116, 92, 0.1) 40px,
        rgba(137, 116, 92, 0.1) 41px
      ), repeating-linear-gradient(
        0deg,
        transparent,
        transparent 80px,
        rgba(137, 116, 92, 0.05) 80px,
        rgba(137, 116, 92, 0.05) 81px
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
        rgb(115, 92, 69) 0%,
        rgb(137, 116, 92) 30%,
        rgb(161, 138, 108) 100%
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
      libraryBackground: 'linear-gradient(to bottom, rgb(210, 180, 140), rgb(205, 175, 130))'
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
  },
  semantic: {
    success: 'rgb(34, 139, 34)',     // 포리스트 그린 (대출 성공)
    error: 'rgb(178, 34, 34)',       // 파이어브릭 레드 (연체/분실)
    warning: 'rgb(218, 165, 32)',    // 골든로드 (예약 마감)
    info: 'rgb(70, 130, 180)',       // 스틸 블루 (도서관 안내)
    processing: 'rgb(64, 158, 171)'  // 라이트 씨 그린 (처리 중)
  },
  backgrounds: {
    level1: 'rgb(255, 255, 255)',    // 기본 흰색 배경
    level2: 'rgb(210, 180, 140)',    // 어두운 탄 색상 배경
    level3: 'rgb(247, 245, 242)',    // 회베이지 배경
    level4: 'rgb(237, 233, 228)'     // 진한 회베이지 배경
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