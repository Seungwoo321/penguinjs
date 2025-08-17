import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./Button"
import { Globe, ChevronDown } from "lucide-react"

const languages = [
  { code: 'ko', name: '한국어', shortName: 'KO', flag: '🇰🇷' },
  { code: 'en', name: 'English', shortName: 'EN', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', shortName: 'JP', flag: '🇯🇵' },
  { code: 'zh', name: '中文', shortName: 'CN', flag: '🇨🇳' }
]

interface SimpleLanguageToggleProps {
  variant?: 'icon-text' | 'flag-only' | 'cycle' | 'dropdown'
  showIcon?: boolean
  className?: string
}

export function SimpleLanguageToggle({ 
  variant = 'cycle',
  showIcon = true,
  className = ''
}: SimpleLanguageToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-language-toggle-simple]')) {
        setIsOpen(false)
      }
    }

    if (isOpen && variant === 'dropdown') {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, variant])

  const updateButtonRect = React.useCallback(() => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    )
  }

  const currentLocale = pathname.split('/')[1] || 'ko'
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]
  const currentIndex = languages.findIndex(lang => lang.code === currentLocale)

  const changeLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const cycleLanguage = () => {
    const nextIndex = (currentIndex + 1) % languages.length
    changeLanguage(languages[nextIndex].code)
  }

  // Variant 1: 아이콘 + 텍스트 (현재 게임화면 스타일)
  if (variant === 'icon-text') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={cycleLanguage}
        className={className}
      >
        {showIcon && <Globe className="h-4 w-4 mr-1" />}
        {currentLanguage.shortName}
      </Button>
    )
  }

  // Variant 2: 국기만 표시 (컴팩트)
  if (variant === 'flag-only') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={cycleLanguage}
        className={className}
        title={currentLanguage.name}
      >
        <span className="text-base">{currentLanguage.flag}</span>
      </Button>
    )
  }

  // Variant 3: 순환 버튼 (국기 + 짧은 텍스트)
  if (variant === 'cycle') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={cycleLanguage}
        className={`flex items-center gap-1.5 ${className}`}
        title={`Change language (${languages[(currentIndex + 1) % languages.length].name})`}
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-xs font-semibold">{currentLanguage.shortName}</span>
      </Button>
    )
  }

  // Variant 4: 드롭다운 (4개 언어 선택)
  if (variant === 'dropdown') {
    return (
      <div className="relative inline-block text-left" data-language-toggle-simple style={{ zIndex: 999 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 min-w-[70px] ${className}`}
        >
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="text-xs font-semibold">{currentLanguage.shortName}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-1 min-w-[120px] w-max bg-background border border-input rounded-lg shadow-xl overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    changeLanguage(language.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left hover:bg-accent hover:text-accent-foreground
                    ${currentLocale === language.code 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-foreground'
                    }`}
                >
                  <span className="text-base">{language.flag}</span>
                  <span className="text-sm font-medium">{language.shortName}</span>
                  <span className="text-xs text-muted-foreground">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}