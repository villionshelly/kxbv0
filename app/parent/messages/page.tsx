'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, MessageSquare, Building2, Wallet } from 'lucide-react'
import { parentMessages } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  class: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
  feedback: { icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-100' },
  institution: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
}

export default function ParentMessagesPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full warm-bg">
      <header className="safe-area-top px-4 pb-3">
        <div className="flex items-center gap-3 py-2">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-card/60 rounded-lg" aria-label="返回">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">消息</h1>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-2 space-y-2.5">
        {parentMessages.map((msg) => {
          const cfg = typeConfig[msg.type] ?? { icon: Wallet, color: 'text-muted-foreground', bg: 'bg-muted' }
          const Icon = cfg.icon
          return (
            <div key={msg.id} className="flex gap-3 p-3.5 bg-card rounded-2xl card-warm">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
                <Icon className={cn('w-5 h-5', cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{msg.title}</h3>
                  {msg.unread && <span className="w-2 h-2 bg-destructive rounded-full shrink-0" />}
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{msg.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{msg.content}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
