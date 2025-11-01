'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NavigationHandler } from './NavigationHandler'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background transition-colors">
      {/* Navigation Handler - لتحسين التنقل */}
      <NavigationHandler />
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-64 md:hidden shadow-xl">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
