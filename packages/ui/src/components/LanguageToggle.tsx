import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./Button"
import { Globe, ChevronDown } from "lucide-react"

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-language-toggle]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-5 w-5" />
      </Button>
    )
  }

  const currentLocale = pathname.split('/')[1] || 'ko'
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  const changeLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative" data-language-toggle>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-slate-100 dark:hover:bg-slate-800 px-2 border border-slate-200 dark:border-slate-700"
        title="Change Language"
      >
        <div className="flex items-center gap-1">
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
            {currentLanguage.code.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-800 dark:text-slate-300" />
        </div>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-36">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors ${
                currentLocale === language.code 
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold' 
                  : 'text-slate-800 dark:text-slate-300'
              }`}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}