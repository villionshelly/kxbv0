'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarCheck, CheckCircle, ChevronRight, Filter, MessageSquare, Phone, Target, UserPlus } from 'lucide-react'
import { trialProspects } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusLabels = {
  all: '全部',
  intent: '意向',
  registered: '已报名',
  attended: '已到课',
  converted: '已转正',
} as const

type StatusFilter = keyof typeof statusLabels

const funnelSteps = [
  { key: 'intent', label: '意向人员' },
  { key: 'registered', label: '已报名' },
  { key: 'attended', label: '已到课' },
  { key: 'converted', label: '已转正' },
] as const

export default function TrialsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [convertedIds, setConvertedIds] = useState<string[]>([])

  const computedProspects = trialProspects.map(item => (
    convertedIds.includes(item.id) ? { ...item, status: 'converted' as const, probability: 100 } : item
  ))

  const maxStepCount = Math.max(...funnelSteps.map(step => computedProspects.filter(item => item.status === step.key).length), 1)
  const visibleProspects = filter === 'all'
    ? computedProspects
    : computedProspects.filter(item => item.status === filter)

  const urgentCount = useMemo(
    () => computedProspects.filter(item => item.status === 'attended' && item.probability >= 80).length,
    [computedProspects]
  )

  const handleConvert = (id: string) => {
    setConvertedIds(prev => prev.includes(id) ? prev : [...prev, id])
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="safe-area-top flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => router.push('/institution')}
          className="rounded-xl p-2 -ml-2 transition-colors hover:bg-muted"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold">试听管理</h1>
          <p className="truncate text-xs text-muted-foreground">非正式学员商机转化漏斗</p>
        </div>
        <Target className="h-5 w-5 text-emerald-600" />
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 pb-8">
        <section className="mb-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">本周逼单重点</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{urgentCount} 位高意向已到课</h2>
              <p className="mt-2 text-sm text-slate-600">优先发送课堂反馈、限时优惠和正式报名方案。</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">转化中</span>
          </div>
        </section>

        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">商机转化漏斗</h2>
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-3">
            {funnelSteps.map((step, index) => {
              const count = computedProspects.filter(item => item.status === step.key).length
              const width = Math.max((count / maxStepCount) * 100, count ? 22 : 8)
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setFilter(step.key)}
                  className="w-full text-left"
                >
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{index + 1}. {step.label}</span>
                    <span className="font-bold text-slate-950">{count}人</span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-full bg-slate-100">
                    <div className="flex h-full items-center justify-end rounded-full bg-emerald-500 pr-3 text-xs font-medium text-white" style={{ width: `${width}%` }}>
                      {count > 0 ? `${count}` : ''}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(statusLabels) as StatusFilter[]).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                filter === status ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              )}
            >
              {status === 'all' && <Filter className="h-3.5 w-3.5" />}
              {statusLabels[status]}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {visibleProspects.map(prospect => {
            const canConvert = prospect.status === 'attended' || prospect.status === 'registered'
            const converted = prospect.status === 'converted'
            return (
              <div key={prospect.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-950">{prospect.childName}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {statusLabels[prospect.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{prospect.parentName} · {prospect.parentPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold leading-none text-emerald-600">{prospect.probability}%</p>
                    <p className="mt-1 text-[10px] text-slate-500">成交概率</p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-950">{prospect.interestedCourse}</p>
                  <p className="mt-1 text-xs text-slate-500">{prospect.source} · {prospect.trialDate}</p>
                  <p className="mt-2 text-xs text-slate-600">{prospect.latestNote}</p>
                </div>

                <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2">
                  <p className="text-xs font-medium text-amber-700">下一步逼单建议</p>
                  <p className="mt-1 text-xs text-amber-700/80">{prospect.nextAction}</p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-2 text-sm font-medium text-slate-600">
                    <Phone className="h-4 w-4" />
                    电话
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-blue-50 py-2 text-sm font-medium text-blue-600">
                    <MessageSquare className="h-4 w-4" />
                    微信
                  </button>
                  {canConvert || converted ? (
                    <button
                      type="button"
                      onClick={() => handleConvert(prospect.id)}
                      disabled={converted}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2 text-sm font-medium',
                        converted ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'
                      )}
                    >
                      {converted ? <CheckCircle className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {converted ? '已转正' : '转正'}
                    </button>
                  ) : (
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-slate-950 py-2 text-sm font-medium text-white">
                      跟进
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
