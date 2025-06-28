import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./Button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-5 w-5" />
      </Button>
    )
  }

  const currentLocale = pathname.split('/')[1]
  const isKorean = currentLocale === 'ko'

  const toggleLanguage = () => {
    const newLocale = isKorean ? 'en' : 'ko'
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="hover:bg-penguin-50 dark:hover:bg-slate-800"
      title={isKorean ? "Switch to English" : "한국어로 변경"}
    >
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {isKorean ? 'EN' : 'KO'}
        </span>
      </div>
    </Button>
  )
}