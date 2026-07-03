'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, BarChart3, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubpageQuickNav } from '@/components/subpage-quick-nav'

const tabs = [
  { id: 'home', label: '工作台', icon: LayoutDashboard, href: '/institution' },
  { id: 'students', label: '学员', icon: Users, href: '/institution/students' },
  { id: 'assistant', label: 'AI助理', icon: Sparkles, href: '/institution/assistant', highlight: true },
  { id: 'schedule', label: '排课', icon: Calendar, href: '/institution/schedule' },
  { id: 'profile', label: '我的', icon: User, href: '/institution/profile' },
]

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === '/institution') return 'home'
    if (pathname.includes('/students')) return 'students'
    if (pathname.includes('/assistant')) return 'assistant'
    if (pathname.includes('/schedule')) return 'schedule'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }

  // Hide tab bar on all sub-detail pages and assistant page
  const rootPaths = ['/institution', '/institution/students', '/institution/schedule', '/institution/profile']
  const hideTabBar = pathname.includes('/login') || pathname.includes('/payment') || pathname.includes('/assistant') || !rootPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <div className="mobile-frame bg-background flex flex-col">
        <SubpageQuickNav section="institution" />
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Tab Bar - Hidden on detail pages */}
        {!hideTabBar && (
        <div className="tab-bar border-t border-border safe-area-bottom">
          <nav className="flex items-center justify-around h-14">
            {tabs.map((tab) => {
              const isActive = getActiveTab() === tab.id
              const isHighlight = 'highlight' in tab && tab.highlight
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-colors',
                    isActive 
                      ? isHighlight ? 'text-secondary' : 'text-secondary' 
                      : isHighlight ? 'text-secondary/70' : 'text-muted-foreground'
                  )}
                >
                  {isHighlight ? (
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center -mt-3',
                      isActive ? 'bg-secondary' : 'bg-secondary/80'
                    )}>
                      <tab.icon className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <tab.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                  )}
                  <span className={cn(
                    'text-[10px] font-medium',
                    isHighlight && '-mt-0.5'
                  )}>{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        )}
      </div>
    </div>
  )
}
