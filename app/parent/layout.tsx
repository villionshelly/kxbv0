'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SubpageQuickNav } from '@/components/subpage-quick-nav'
import { ParentAiAssistantFab } from '@/components/parent-ai-assistant-fab'

function ParentChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const isAssistantEmbed = searchParams.get('assistantEmbed') === '1'
  const showSubpageNav = !isAssistantEmbed && pathname !== '/parent'

  return (
    <div className="mobile-frame bg-background flex flex-col" style={{ transform: 'translateZ(0)', contain: 'paint' }}>
      {!isAssistantEmbed && <SubpageQuickNav section="parent" />}
      {/* Content Area */}
      <div
        className="mobile-content-area scrollbar-quiet flex-1 overflow-auto"
        style={showSubpageNav ? { paddingTop: 'var(--kxb-mp-total-nav-height)', minHeight: 0 } : { minHeight: 0 }}
      >
        {children}
      </div>
      {!isAssistantEmbed && <ParentAiAssistantFab />}
    </div>
  )
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <Suspense fallback={<div className="mobile-frame bg-background" />}>
        <ParentChrome>{children}</ParentChrome>
      </Suspense>
    </div>
  )
}
