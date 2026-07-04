'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, Phone, MessageSquare, Filter, ChevronRight } from 'lucide-react'
import { leadsSquare } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function LeadsSquarePage() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [grabbing, setGrabbing] = useState<string | null>(null)
  const [grabbedLeads, setGrabbedLeads] = useState<string[]>([])

  const filteredLeads = leadsSquare.filter(lead => {
    if (filter === 'all') return true
    if (filter === 'music') return lead.category === '音乐培训'
    if (filter === 'art') return lead.category === '美术培训'
    if (filter === 'stem') return lead.category === 'STEM教育'
    return true
  })

  const handleGrab = (leadId: string) => {
    setGrabbing(leadId)
    setTimeout(() => {
      setGrabbedLeads(prev => [...prev, leadId])
      setGrabbing(null)
    }, 1500)
  }

  const getStatusText = (lead: typeof leadsSquare[0]) => {
    if (grabbedLeads.includes(lead.id)) return '已抢'
    if (lead.status === 'grabbed') return '已被抢'
    if (lead.status === 'contacted') return '已联系'
    return '抢线索'
  }

  const isGrabbable = (lead: typeof leadsSquare[0]) => {
    return lead.status === 'new' && !grabbedLeads.includes(lead.id)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => router.push('/institution')}
          className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">线索广场</h1>
          <p className="text-xs text-muted-foreground">周边3km内的找课需求</p>
        </div>
      </header>

      {/* Filter */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {[
          { id: 'all', label: '全部' },
          { id: 'music', label: '音乐培训' },
          { id: 'art', label: '美术培训' },
          { id: 'stem', label: 'STEM教育' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === item.id
                ? 'institution-btn-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className={cn(
                'p-4 bg-muted/30 rounded-xl',
                !isGrabbable(lead) && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lead.parentName}</span>
                    <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                      {lead.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    孩子{lead.childAge}岁 | 预算 {lead.budget}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{lead.distance}km</span>
                </div>
              </div>

              <p className="text-sm mb-3">{lead.demand}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{lead.submitTime.split(' ')[0]}</span>
                </div>
                
                {isGrabbable(lead) ? (
                  <button
                    onClick={() => handleGrab(lead.id)}
                    disabled={grabbing === lead.id}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                      grabbing === lead.id
                        ? 'bg-secondary/50 text-secondary-foreground'
                        : 'institution-btn-primary'
                    )}
                  >
                    {grabbing === lead.id ? '抢单中...' : '抢线索'}
                  </button>
                ) : (
                  <span className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium',
                    grabbedLeads.includes(lead.id)
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {getStatusText(lead)}
                  </span>
                )}
              </div>

              {/* Contact buttons for grabbed leads */}
              {grabbedLeads.includes(lead.id) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    拨打电话
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
                    </svg>
                    微信沟通
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Points Info */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">抢线索消耗AI积分</span>
          <span className="text-secondary font-medium">5积分/条</span>
        </div>
      </div>
    </div>
  )
}
