'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeDebugger() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [cssVariables, setCssVariables] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setMounted(true)
    updateCssVariables()
  }, [])

  useEffect(() => {
    if (mounted) {
      updateCssVariables()
    }
  }, [theme, mounted])

  const updateCssVariables = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      
      setCssVariables({
        card: computedStyle.getPropertyValue('--card').trim(),
        cardForeground: computedStyle.getPropertyValue('--card-foreground').trim(),
        background: computedStyle.getPropertyValue('--background').trim(),
        foreground: computedStyle.getPropertyValue('--foreground').trim(),
      })
    }
  }

  if (!mounted) {
    return <div>Loading theme debugger...</div>
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Theme Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Current Theme:</strong> {theme}
        </div>
        <div>
          <strong>HTML Class:</strong> {document.documentElement.className}
        </div>
        <div>
          <strong>CSS Variables:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>--card: {cssVariables.card}</li>
            <li>--card-foreground: {cssVariables.cardForeground}</li>
            <li>--background: {cssVariables.background}</li>
            <li>--foreground: {cssVariables.foreground}</li>
          </ul>
        </div>
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => setTheme('light')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className="px-2 py-1 bg-slate-700 text-white rounded text-xs"
          >
            Dark
          </button>
        </div>
        
        {/* Test Card */}
        <div className="mt-4">
          <div className="bg-card text-card-foreground border border-gray-300 dark:border-slate-600 rounded p-2">
            <div className="text-xs">Test Card with bg-card class</div>
            <div className="text-xs">Should be white in light, dark slate in dark</div>
          </div>
        </div>
      </div>
    </div>
  )
}