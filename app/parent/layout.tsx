'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SubpageQuickNav } from '@/components/subpage-quick-nav'
import { ParentAiAssistantFab } from '@/components/parent-ai-assistant-fab'

function ParentChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const isAssistantEmbed = searchParams.get('assistantEmbed') === '1'

  return (
    <div className="mobile-frame bg-background flex flex-col">
      {!isAssistantEmbed && <SubpageQuickNav section="parent" />}
      {/* Content Area */}
      <div className="scrollbar-quiet flex-1 overflow-auto">
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
