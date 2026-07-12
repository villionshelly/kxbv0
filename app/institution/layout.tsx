'use client'

import Link from 'next/link'
import Image, { type StaticImageData } from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SubpageQuickNav } from '@/components/subpage-quick-nav'
import { InstitutionAccessGuard } from '@/components/institution-access-guard'
import navWorkbenchSelected from '@/png_256/nav_workbench_selected.png'
import navWorkbenchUnselected from '@/png_256/nav_workbench_unselected.png'
import navStudentsSelected from '@/png_256/nav_students_selected.png'
import navStudentsUnselected from '@/png_256/nav_students_unselected.png'
import navScheduleSelected from '@/png_256/nav_schedule_selected.png'
import navScheduleUnselected from '@/png_256/nav_schedule_unselected.png'
import navProfileSelected from '@/png_256/nav_profile_selected.png'
import navProfileUnselected from '@/png_256/nav_profile_unselected.png'

const aiAssistantIcon = '/images/ai/ai_crab_加油加油.gif'
const tabIconSize = 37
const aiAssistantIconSize = 53

type TabItem = {
  id: 'home' | 'students' | 'assistant' | 'schedule' | 'profile'
  label: string
  href: string
} & (
  | {
      iconSrc: string
      selectedIcon?: never
      unselectedIcon?: never
    }
  | {
      iconSrc?: never
      selectedIcon: StaticImageData
      unselectedIcon: StaticImageData
    }
)

const tabs: TabItem[] = [
  { id: 'home', label: '工作台', href: '/institution', selectedIcon: navWorkbenchSelected, unselectedIcon: navWorkbenchUnselected },
  { id: 'students', label: '学员', href: '/institution/students', selectedIcon: navStudentsSelected, unselectedIcon: navStudentsUnselected },
  { id: 'assistant', label: 'AI助理', href: '/institution/assistant', iconSrc: aiAssistantIcon },
  { id: 'schedule', label: '排课', href: '/institution/schedule', selectedIcon: navScheduleSelected, unselectedIcon: navScheduleUnselected },
  { id: 'profile', label: '我的', href: '/institution/profile', selectedIcon: navProfileSelected, unselectedIcon: navProfileUnselected },
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
  const rootPaths = ['/institution', '/institution/students', '/institution/schedule', '/institution/profile', '/institution/teacher']
  const isRootTabPath = rootPaths.includes(pathname)
  const showSubpageNav = !rootPaths.includes(pathname)
  const isTeacherWorkspace = pathname.startsWith('/institution/teacher')
  const hideTabBar = pathname.includes('/login') || pathname.includes('/payment') || pathname.includes('/assistant') || isTeacherWorkspace || !rootPaths.includes(pathname)

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <div
        className="mobile-frame institution-frame bg-background flex flex-col"
        data-root-tab-page={isRootTabPath ? 'true' : undefined}
        style={{ transform: 'translateZ(0)', contain: 'paint' }}
      >
        <SubpageQuickNav section="institution" />
        {/* Content Area */}
        <div
          className={cn(
            'mobile-content-area scrollbar-quiet flex-1 overflow-auto',
            isTeacherWorkspace && 'flex min-h-0 flex-col overflow-hidden',
          )}
          style={showSubpageNav ? { paddingTop: 'var(--kxb-mp-total-nav-height)', minHeight: 0 } : { minHeight: 0 }}
        >
          <InstitutionAccessGuard>{children}</InstitutionAccessGuard>
        </div>

        {/* Tab Bar - Hidden on detail pages */}
        {!hideTabBar && (
        <div className="tab-bar border-t border-white/70 safe-area-bottom shadow-[0_-14px_34px_-24px_rgba(232,122,52,0.58)]">
          <nav className="flex items-center justify-around h-[72px]">
            {tabs.map((tab) => {
              const isActive = getActiveTab() === tab.id
              const iconSize = tab.iconSrc ? aiAssistantIconSize : tabIconSize
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-colors',
                    isActive ? 'text-secondary' : 'text-muted-foreground'
                  )}
                >
                  <Image
                    src={tab.iconSrc ?? (isActive ? tab.selectedIcon : tab.unselectedIcon)}
                    alt=""
                    width={iconSize}
                    height={iconSize}
                    unoptimized={Boolean(tab.iconSrc)}
                    className={cn(
                      'object-contain',
                      tab.iconSrc ? 'h-[53px] w-[53px]' : 'h-[37px] w-[37px]'
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-medium">{tab.label}</span>
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
