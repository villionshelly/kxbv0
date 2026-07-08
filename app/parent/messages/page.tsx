'use client'

import { useMemo, useState } from 'react'
import { Bell, Building2, CheckCheck, Inbox, MessageSquare, Wallet } from 'lucide-react'
import { parentMessages } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Message = typeof parentMessages[number]
type MessageTab = 'unread' | 'read'

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  class: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
  feedback: { icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-100' },
  institution: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
}

export default function ParentMessagesPage() {
  const [activeTab, setActiveTab] = useState<MessageTab>('unread')
  const [messages, setMessages] = useState<Message[]>(() => parentMessages.map(message => ({ ...message })))

  const unreadCount = messages.filter(message => message.unread).length
  const readCount = messages.length - unreadCount
  const filteredMessages = useMemo(
    () => messages.filter(message => activeTab === 'unread' ? message.unread : !message.unread),
    [activeTab, messages]
  )

  const markAllAsRead = () => {
    setMessages(prev => prev.map(message => message.unread ? { ...message, unread: false } : message))
    setActiveTab('read')
  }

  return (
    <div className="flex flex-col h-full warm-bg">
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 rounded-2xl bg-card/70 p-1 card-warm">
            {([
              { id: 'unread', label: '未读', count: unreadCount },
              { id: 'read', label: '已读', count: readCount },
            ] as const).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 rounded-xl py-2 text-sm font-semibold transition-colors',
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1 text-xs',
                  activeTab === tab.id ? 'text-primary-foreground/85' : 'text-muted-foreground/75'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={cn(
              'flex h-10 shrink-0 items-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-colors active:scale-[0.98]',
              unreadCount > 0
                ? 'bg-primary text-primary-foreground shadow-[0_12px_20px_-16px_rgba(248,126,49,0.9)]'
                : 'bg-muted text-muted-foreground/60'
            )}
          >
            <CheckCheck className="h-4 w-4" />
            全部已读
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        {filteredMessages.length > 0 ? (
          <div className="space-y-2.5">
            {filteredMessages.map((msg) => {
              const cfg = typeConfig[msg.type] ?? { icon: Wallet, color: 'text-muted-foreground', bg: 'bg-muted' }
              const Icon = cfg.icon

              return (
                <div key={msg.id} className="flex gap-3 rounded-2xl bg-card p-3.5 card-warm">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', cfg.bg)}>
                    <Icon className={cn('h-5 w-5', cfg.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{msg.title}</h3>
                      {msg.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />}
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{msg.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] bg-card/70 px-6 text-center card-warm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {activeTab === 'unread' ? '暂无未读消息' : '暂无已读消息'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === 'unread' ? '新的课程提醒和机构通知会出现在这里' : '标记已读后的消息会保留在这里'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
