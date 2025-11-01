'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Phone,
  LogOut,
  Building2,
  Activity,
  UserCog
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'جلسات تيليجرام',
    href: '/sessions',
    icon: Phone,
  },
  {
    title: 'المجموعات',
    href: '/groups',
    icon: MessageSquare,
  },
  {
    title: 'الأعضاء',
    href: '/members',
    icon: UserCog,
  },
  {
    title: 'الحملات',
    href: '/campaigns',
    icon: BarChart3,
  },
  {
    title: 'الفريق',
    href: '/team',
    icon: Users,
  },
  {
    title: 'التقارير',
    href: '/analytics',
    icon: Activity,
  },
  {
    title: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { user, signOut } = useAuth()

  // استخدام useRef لحفظ timeouts للـ prefetch
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Prefetch data عند hover على رابط (تحسين تجربة المستخدم)
  const handleLinkHover = (href: string) => {
    if (!user?.team_id || pathname === href) return
    
    // إلغاء timeout السابق إذا كان موجوداً
    const existingTimeout = prefetchTimeouts.current.get(href)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    // Debounce prefetch لمدة 300ms
    const timeout = setTimeout(() => {
      // Prefetch queries حسب الصفحة
      if (href === '/sessions') {
        queryClient.prefetchQuery({
          queryKey: ['sessions', user.team_id],
          queryFn: async () => {
            const supabase = (await import('@/lib/supabase/client')).createClient()
            const { data } = await supabase
              .from('telegram_sessions')
              .select('*')
              .eq('team_id', user.team_id)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
            return data || []
          },
          staleTime: 30 * 1000,
        })
      } else if (href === '/groups') {
        queryClient.prefetchQuery({
          queryKey: ['groups', user.team_id],
          queryFn: async () => {
            const supabase = (await import('@/lib/supabase/client')).createClient()
            const { data } = await supabase
              .from('groups')
              .select('*')
              .eq('team_id', user.team_id)
              .eq('is_active', true)
              .order('name', { ascending: true })
            return data || []
          },
          staleTime: 30 * 1000,
        })
      } else if (href === '/campaigns') {
        queryClient.prefetchQuery({
          queryKey: ['campaigns', user.team_id, 1, 20, 'all', undefined],
          queryFn: async () => {
            const response = await fetch(`/api/campaigns/list?page=1&pageSize=20`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            return data.data || data
          },
          staleTime: 30 * 1000,
        })
      } else if (href === '/team') {
        queryClient.prefetchQuery({
          queryKey: ['team'],
          queryFn: async () => {
            const response = await fetch('/api/team/list')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            return data.data || data
          },
          staleTime: 30 * 1000,
        })
      }
      
      prefetchTimeouts.current.delete(href)
    }, 300)
    
    prefetchTimeouts.current.set(href, timeout)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="mr-3 text-xl font-bold text-sidebar-foreground">SocialPro</span>
      </div>

      {/* User Info */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || 'المستخدم'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.team_name || 'فريقي'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => handleLinkHover(item.href)}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 ml-3 transition-transform',
                isActive && 'scale-110'
              )} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-sidebar-border p-4">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5 ml-3" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
