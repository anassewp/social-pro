'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { SimpleThemeToggle, DropdownThemeToggle } from '@/components/theme'
import { memo, useCallback } from 'react'
import { DebouncedInput } from '@/components/performance/DebouncedInput'

interface HeaderProps {
  onMenuClick?: () => void
  onSearch?: (query: string) => void
}

const Header = memo(({ onMenuClick, onSearch }: HeaderProps) => {
  const { user } = useAuth()

  // تحسين الأداء باستخدام useCallback
  const handleMenuClick = useCallback(() => {
    onMenuClick?.()
  }, [onMenuClick])

  const handleSearchChange = useCallback((query: string) => {
    onSearch?.(query)
  }, [onSearch])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm transition-colors">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-foreground hover:bg-accent"
        onClick={handleMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            placeholder="البحث..."
            className="pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            onChange={handleSearchChange}
            delay={300}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Enhanced Theme Toggle */}
        <SimpleThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User info */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.user_metadata?.full_name || 'المستخدم'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'admin' ? 'مدير' : user?.role === 'manager' ? 'مدير فريق' : 'مشغل'}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export { Header }
