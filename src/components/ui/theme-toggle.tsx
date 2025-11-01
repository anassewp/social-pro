'use client'

import { useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '@/lib/hooks/useTheme'

// Toggle بسيط (بدون dropdown) - يدور بين 3 أوضاع
export function ThemeToggleSimple() {
  const { theme, setTheme, actualTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5 text-foreground" />
    } else if (actualTheme === 'dark') {
      return <Moon className="h-5 w-5 text-foreground" />
    } else {
      return <Sun className="h-5 w-5 text-foreground" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative"
      aria-label="تبديل الوضع"
      title={`الوضع الحالي: ${theme === 'system' ? 'نظام' : theme === 'dark' ? 'داكن' : 'فاتح'}`}
    >
      {getIcon()}
    </Button>
  )
}

// Toggle مع قائمة منسدلة بسيطة (بدون Radix)
export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="تبديل الوضع"
      >
        {theme === 'system' ? (
          <Monitor className="h-5 w-5 text-foreground" />
        ) : actualTheme === 'dark' ? (
          <Moon className="h-5 w-5 text-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-foreground" />
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop - خلفية شفافة مع blur */}
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu - خلفية واضحة مع حدود واضحة */}
          <div className="absolute left-0 top-full mt-2 z-50 w-44 rounded-lg border-2 border-border/80 bg-card/95 dark:bg-card backdrop-blur-md shadow-xl dark:shadow-2xl ring-1 ring-border/50">
            <div className="p-2 space-y-1">
              {/* فاتح */}
              <button
                onClick={() => {
                  setTheme('light')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20' // خلفية زرقاء مع نص أبيض واضح
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80' // نص داكن على خلفية فاتحة، نص فاتح على خلفية داكنة
                }`}
              >
                <div className="flex items-center">
                  <Sun className={`h-4 w-4 ml-2 ${theme === 'light' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>فاتح</span>
                </div>
                {theme === 'light' && (
                  <span className="text-primary-foreground font-bold">✓</span>
                )}
              </button>
              
              {/* داكن */}
              <button
                onClick={() => {
                  setTheme('dark')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20' // خلفية زرقاء مع نص أبيض واضح
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80' // نص داكن على خلفية فاتحة، نص فاتح على خلفية داكنة
                }`}
              >
                <div className="flex items-center">
                  <Moon className={`h-4 w-4 ml-2 ${theme === 'dark' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>داكن</span>
                </div>
                {theme === 'dark' && (
                  <span className="text-primary-foreground font-bold">✓</span>
                )}
              </button>
              
              {/* نظام */}
              <button
                onClick={() => {
                  setTheme('system')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  theme === 'system'
                    ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20' // خلفية زرقاء مع نص أبيض واضح
                    : 'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/80' // نص داكن على خلفية فاتحة، نص فاتح على خلفية داكنة
                }`}
              >
                <div className="flex items-center">
                  <Monitor className={`h-4 w-4 ml-2 ${theme === 'system' ? 'text-primary-foreground' : 'text-foreground'}`} />
                  <span>نظام</span>
                </div>
                {theme === 'system' && (
                  <span className="text-primary-foreground font-bold">✓</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

