'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  Home, 
  Phone, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  UserCog, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Plus,
  MoreHorizontal
} from 'lucide-react'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string
  children?: NavigationItem[]
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'لوحة التحكم',
    href: '/dashboard',
    icon: Home,
    description: 'نظرة عامة على البيانات'
  },
  {
    title: 'جلسات تيليجرام',
    href: '/sessions',
    icon: Phone,
    description: 'إدارة جلسات تيليجرام'
  },
  {
    title: 'المجموعات',
    href: '/groups',
    icon: MessageSquare,
    description: 'إدارة مجموعات تيليجرام'
  },
  {
    title: 'الأعضاء',
    href: '/members',
    icon: UserCog,
    description: 'إدارة أعضاء المجموعات'
  },
  {
    title: 'الحملات',
    href: '/campaigns',
    icon: BarChart3,
    description: 'إنشاء وإدارة الحملات',
    children: [
      {
        title: 'إنشاء حملة',
        href: '/campaigns/create',
        icon: Plus
      },
      {
        title: 'سجل الحملات',
        href: '/campaigns/logs',
        icon: Activity
      }
    ]
  },
  {
    title: 'الفريق',
    href: '/team',
    icon: Users,
    description: 'إدارة أعضاء الفريق'
  },
  {
    title: 'التقارير',
    href: '/analytics',
    icon: Activity,
    description: 'تحليلات وتقارير شاملة'
  },
  {
    title: 'الإعدادات',
    href: '/settings',
    icon: Settings,
    description: 'إعدادات النظام'
  }
]

interface MobileNavigationProps {
  className?: string
  user?: {
    name?: string
    role?: string
    avatar?: string
  }
  notifications?: number
  onNotificationClick?: () => void
  onSearchClick?: () => void
}

export function MobileNavigation({
  className,
  user,
  notifications,
  onNotificationClick,
  onSearchClick
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setExpandedItems(new Set())
  }, [pathname])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(href)) {
        newSet.delete(href)
      } else {
        newSet.add(href)
      }
      return newSet
    })
  }

  const isActive = (href: string) => pathname === href
  const isChildActive = (children?: NavigationItem[]) => 
    children?.some(child => pathname === child.href)

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.href)
    const active = isActive(item.href)
    const childActive = hasChildren && isChildActive(item.children)

    return (
      <div key={item.href}>
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-lg transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
            childActive && 'bg-primary/10 text-primary',
            level > 0 && 'mr-4 border-r-2 border-border pr-2',
            level === 0 ? 'text-base' : 'text-sm'
          )}
        >
          <Link
            href={item.href}
            className="flex items-center flex-1 gap-3 min-w-0"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault()
                toggleExpanded(item.href)
              }
            }}
          >
            <item.icon 
              className={cn(
                'h-5 w-5 flex-shrink-0',
                level > 0 && 'h-4 w-4'
              )} 
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.title}</div>
              {item.description && level === 0 && (
                <div className="text-xs text-muted-foreground truncate">
                  {item.description}
                </div>
              )}
            </div>
            {item.badge && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </Link>

          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleExpanded(item.href)}
              className="h-8 w-8 flex-shrink-0"
            >
              <ChevronRight 
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )} 
              />
            </Button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className={cn('flex items-center gap-2', className)}>
        {/* Search Button - Mobile Only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Navigation Icons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          {navigationItems.slice(0, 5).map(item => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'relative',
                  isActive(item.href) && 'bg-primary text-primary-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
          
          {/* More Items */}
          <div className="relative group">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <div className="absolute left-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2 space-y-1">
                {navigationItems.slice(5).map(item => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3 h-auto p-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="text-right">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {notifications && notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
          </Button>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user.avatar || user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.role}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-background shadow-xl border-l overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <div>
                  <h2 className="font-bold">SocialPro</h2>
                  <p className="text-xs text-muted-foreground">نظام إدارة الحملات</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {user.avatar || user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.role}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <div className="p-4 space-y-2">
              {navigationItems.map(item => renderNavItem(item))}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-background border-t p-4 space-y-2">
              {/* Notifications */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  onNotificationClick?.()
                  setIsOpen(false)
                }}
              >
                <Bell className="h-4 w-4" />
                <span>الإشعارات</span>
                {notifications && notifications > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1 mr-auto">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Search */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  onSearchClick?.()
                  setIsOpen(false)
                }}
              >
                <Search className="h-4 w-4" />
                <span>البحث</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Bottom Navigation for Mobile Phones
export function BottomNavigation({ className }: { className?: string }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  const bottomNavItems = navigationItems.slice(0, 5)

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background border-t z-40 md:hidden',
      'safe-area-bottom',
      className
    )}>
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              'flex flex-col items-center justify-center gap-1 transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              isActive(item.href) && 'text-primary'
            )}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium truncate max-w-full">
                {item.title}
              </span>
              {item.badge && (
                <span className="absolute top-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}