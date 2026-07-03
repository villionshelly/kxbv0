'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Phone, MapPin, Clock, User, Send, CheckCircle } from 'lucide-react'
import { leadPool } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function AdminLeadsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'assigned'>('all')

  const filteredLeads = leadPool.filter((lead) => {
    const matchesSearch = lead.parentName.includes(searchQuery) || lead.demand.includes(searchQuery)
    const matchesTab = activeTab === 'all' || lead.status === activeTab
    return matchesSearch && matchesTab
  })

  const statusCounts = {
    all: leadPool.length,
    new: leadPool.filter(l => l.status === 'new').length,
    contacted: leadPool.filter(l => l.status === 'contacted').length,
    assigned: leadPool.filter(l => l.status === 'assigned').length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">线索池</h1>
        <p className="text-muted-foreground mt-1">管理家长找课需求，精准派发给机构</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">今日新增线索</p>
          <p className="text-2xl font-bold mt-1">23</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">待回访</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{statusCounts.new}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">已派发</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{statusCounts.assigned}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">本周转化</p>
          <p className="text-2xl font-bold mt-1 text-primary">12</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索家长姓名、需求..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex bg-muted/50 rounded-lg p-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'new', label: '待回访' },
            { key: 'contacted', label: '已回访' },
            { key: 'assigned', label: '已派发' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-70">
                {statusCounts[tab.key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-background rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  lead.status === 'new' ? 'bg-yellow-500/10' :
                  lead.status === 'contacted' ? 'bg-secondary/10' : 'bg-green-500/10'
                )}>
                  <User className={cn(
                    'w-6 h-6',
                    lead.status === 'new' ? 'text-yellow-600' :
                    lead.status === 'contacted' ? 'text-secondary' : 'text-green-600'
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{lead.parentName}</h4>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      lead.status === 'new' ? 'bg-yellow-500/10 text-yellow-600' :
                      lead.status === 'contacted' ? 'bg-secondary/10 text-secondary' : 'bg-green-500/10 text-green-600'
                    )}>
                      {lead.status === 'new' ? '待回访' :
                       lead.status === 'contacted' ? '已回访' : '已派发'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {lead.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lead.submitTime}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">
                      <span className="text-muted-foreground">需求描述：</span>
                      {lead.demand}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">孩子年龄：</span>
                      {lead.childAge}岁
                    </p>
                  </div>
                  {lead.assignedTo && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      已派发给：{lead.assignedTo}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.status === 'new' && (
                  <>
                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                      标记已回访
                    </button>
                    <button 
                      onClick={() => router.push(`/admin/leads/${lead.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      派发线索
                    </button>
                  </>
                )}
                {lead.status === 'contacted' && (
                  <button 
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    派发线索
                  </button>
                )}
                {lead.status === 'assigned' && (
                  <button 
                    onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    查看详情
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-background rounded-xl border border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">没有找到符合条件的线索</p>
        </div>
      )}
    </div>
  )
}
