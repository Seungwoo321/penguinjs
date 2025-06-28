import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "./Button"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { ThemeToggle } from "./ThemeToggle"
import { ArrowLeft, Home, HelpCircle } from "lucide-react"

interface GameLayoutProps {
  children: React.ReactNode
  title: string
  currentStage: number
  totalStages: number
  onHome?: () => void
  onPrevious?: () => void
  onHelp?: () => void
  className?: string
}

export const GameLayout = React.forwardRef<HTMLDivElement, GameLayoutProps>(
  ({ 
    children, 
    title, 
    currentStage, 
    totalStages, 
    onHome, 
    onPrevious, 
    onHelp,
    className,
    ...props 
  }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("min-h-screen bg-gradient-to-br from-penguin-50 to-penguin-100 dark:from-slate-900 dark:to-slate-800", className)}
        {...props}
      >
        {/* Header */}
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-penguin-100 dark:border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onPrevious && (
                  <Button variant="ghost" size="icon" onClick={onPrevious} className="hover:bg-penguin-50 dark:hover:bg-slate-800">
                    <ArrowLeft className="h-5 w-5 text-penguin-700 dark:text-slate-300" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-penguin-900 dark:text-slate-100 flex items-center gap-2">
                    {title}
                  </h1>
                  <p className="text-sm font-medium text-penguin-700 dark:text-slate-300">
                    Stage {currentStage} of {totalStages}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {onHelp && (
                  <Button variant="outline" size="icon" onClick={onHelp} className="border-penguin-200 hover:bg-penguin-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <HelpCircle className="h-5 w-5 text-penguin-600 dark:text-slate-400" />
                  </Button>
                )}
                {onHome && (
                  <Button variant="outline" size="icon" onClick={onHome} className="border-penguin-200 hover:bg-penguin-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <Home className="h-5 w-5 text-penguin-600 dark:text-slate-400" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-penguin-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-penguin-400 to-penguin-600 dark:from-penguin-500 dark:to-penguin-400 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStage / totalStages) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    )
  }
)
GameLayout.displayName = "GameLayout"

interface GamePanelProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export const GamePanel = React.forwardRef<HTMLDivElement, GamePanelProps>(
  ({ children, title, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("h-full", className)} {...props}>
        {title && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex-1">
          {children}
        </CardContent>
      </Card>
    )
  }
)
GamePanel.displayName = "GamePanel"