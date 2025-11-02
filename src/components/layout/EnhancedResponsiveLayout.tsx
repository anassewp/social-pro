'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MobileNavigation, BottomNavigation } from './MobileNavigation'
import { ResponsiveTable } from './ResponsiveTable'
import { ResponsiveForm } from './ResponsiveForm'
import { TouchOptimizedButton } from './TouchOptimizedComponents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Grid3X3,
  List,
  Filter,
  Download,
  Plus,
  ChevronDown,
  MoreVertical
} from 'lucide-react'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  user?: {
    name?: string
    email?: string
    role?: string
    avatar?: string
  }
  notifications?: number
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  user,
  notifications = 0,
  title,
  breadcrumbs,
  actions,
  sidebar,
  className
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const handleSearchClick = () => {
    setSearchOpen(!searchOpen)
  }

  // Responsive breadcrumbs
  const Breadcrumb = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null

    return (
      <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground mb-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
            )}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    )
  }

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <TouchOptimizedButton
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </TouchOptimizedButton>
            
            <div>
              <h1 className="font-bold text-lg">{title || 'لوحة التحكم'}</h1>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {breadcrumbs[breadcrumbs.length - 1]?.label}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TouchOptimizedButton
              variant="ghost"
              size="icon"
              onClick={handleSearchClick}
              tooltip="البحث"
            >
              <Search className="h-5 w-5" />
            </TouchOptimizedButton>

            <TouchOptimizedButton
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              tooltip="الإشعارات"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </TouchOptimizedButton>

            <TouchOptimizedButton
              variant="ghost"
              size="icon"
              tooltip="القائمة"
            >
              <MoreVertical className="h-5 w-5" />
            </TouchOptimizedButton>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SocialPro</span>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb />
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في النظام..."
                className="pr-10"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <TouchOptimizedButton
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                tooltip={`التبديل إلى عرض ${viewMode === 'grid' ? 'القائمة' : 'الشبكة'}`}
              >
                {viewMode === 'grid' ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
              </TouchOptimizedButton>

              {actions}

              {/* Notifications */}
              <TouchOptimizedButton
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                tooltip="الإشعارات"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </TouchOptimizedButton>

              {/* User Menu */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.avatar || user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-64 border-l bg-muted/30 min-h-screen sticky top-16">
            {sidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Page Title & Actions - Mobile */}
            {title && (
              <div className="md:hidden">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb />}
              </div>
            )}

            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-background shadow-xl border-l overflow-y-auto">
            {sidebar}
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-background border-b p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث..."
                className="pr-10"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notificationsOpen && (
        <div className="fixed top-16 left-4 right-4 md:left-auto md:w-96 z-40">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">الإشعارات</h3>
              <TouchOptimizedButton
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(false)}
              >
                ×
              </TouchOptimizedButton>
            </div>
            <div className="space-y-3">
              {notifications > 0 ? (
                Array.from({ length: Math.min(notifications, 5) }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Bell className="h-4 w-4 mt-0.5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm">إشعار جديد #{i + 1}</p>
                      <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد إشعارات جديدة
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Layout Components
export function ResponsivePageHeader({
  title,
  description,
  actions,
  breadcrumbs
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <div className="space-y-4 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
              )}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function ResponsiveContentGrid({
  children,
  columns = 'auto',
  gap = 'md'
}: {
  children: React.ReactNode
  columns?: number | 'auto'
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }

  return (
    <div className={cn('grid', gridClasses[columns], gapClasses[gap])}>
      {children}
    </div>
  )
}

export function ResponsiveCard({
  children,
  padding = 'md',
  hover = true,
  className
}: {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
  className?: string
}) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <Card className={cn(
      'bg-card border transition-all duration-200',
      paddingClasses[padding],
      hover && 'hover:shadow-md hover:border-border/50',
      className
    )}>
      {children}
    </Card>
  )
}