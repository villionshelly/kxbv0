'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, TrendingUp, Users, Bell, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'

const aiTools = [
  {
    id: 'renewal',
    name: 'AI续费话术',
    description: '根据学员情况生成个性化续费沟通话术',
    icon: MessageSquare,
    color: '#F87E31',
    badge: '热门',
  },
  {
    id: 'warning',
    name: '流失预警',
    description: '智能分析学员行为，提前预警流失风险',
    icon: Bell,
    color: '#EF4444',
    badge: '',
  },
  {
    id: 'referral',
    name: '转介绍话术',
    description: '激励老学员转介绍的智能沟通方案',
    icon: Users,
    color: '#10B981',
    badge: '',
  },
  {
    id: 'growth',
    name: '增长建议',
    description: '基于数据的机构运营优化建议',
    icon: TrendingUp,
    color: '#0E70C0',
    badge: 'Pro',
  },
]

export default function AIToolsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">AI工具箱</h1>
      </div>

      <div className="p-4">
        {/* AI Points */}
        <div className="bg-gradient-to-r from-primary to-orange-400 rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-80">AI积分余额</div>
              <div className="text-2xl font-bold">1,580</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              充值积分
            </button>
            <button className="flex-1 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              使用记录
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-3">
          {aiTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => router.push(`/institution/ai/${tool.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors text-left"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tool.color}15` }}
              >
                <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tool.name}</span>
                  {tool.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      tool.badge === 'Pro' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                    }`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{tool.description}</div>
              </div>
              <Sparkles className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-secondary/5 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <div className="font-medium text-secondary text-sm">AI增长版专属功能</div>
              <div className="text-xs text-muted-foreground mt-1">
                升级AI增长版，解锁全部AI工具，每月赠送2000积分
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
