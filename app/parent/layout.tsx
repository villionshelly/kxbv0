import { SubpageQuickNav } from '@/components/subpage-quick-nav'
import { ParentAiAssistantFab } from '@/components/parent-ai-assistant-fab'

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center">
      <div className="mobile-frame bg-background flex flex-col">
        <SubpageQuickNav section="parent" />
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        <ParentAiAssistantFab />
      </div>
    </div>
  )
}
