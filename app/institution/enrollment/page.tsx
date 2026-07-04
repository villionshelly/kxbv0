'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BadgePercent, CalendarCheck, CheckCircle, ChevronRight, Gift, Megaphone, Plus, TrendingUp, UserPlus, Users, Zap } from 'lucide-react'
import { enrollmentOverview, marketingActivities, trialProspects } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const activityIcon = {
  referral: Gift,
  groupon: Users,
  trial: CalendarCheck,
  exposure: Megaphone,
} as const

const activityTone = {
  referral: 'bg-emerald-100 text-emerald-600',
  groupon: 'bg-blue-100 text-blue-600',
  trial: 'bg-orange-100 text-orange-600',
  exposure: 'bg-sky-100 text-sky-600',
} as const

const trialStageLabels = {
  intent: '意向人员',
  registered: '已报名',
  attended: '已到课',
} as const

type TrialStage = keyof typeof trialStageLabels

export default function EnrollmentPage() {
  const router = useRouter()
  const [activeStage, setActiveStage] = useState<TrialStage>('intent')
  const [convertedIds, setConvertedIds] = useState<string[]>([])
  const [notice, setNotice] = useState('')

  const stageCounts = useMemo(() => ({
    intent: trialProspects.filter(item => item.status === 'intent').length,
    registered: trialProspects.filter(item => item.status === 'registered').length,
    attended: trialProspects.filter(item => item.status === 'attended').length,
  }), [])

  const visibleTrialProspects = trialProspects.filter(item => item.status === activeStage)

  const handleActivityAction = (activity: typeof marketingActivities[0]) => {
    if (activity.id === 'referral' || activity.id === 'trial') {
      router.push(activity.href)
      return
    }
    if (activity.id === 'exposure') {
      setNotice('已为试听营销课预留 3,000 次本地曝光，等待支付确认')
      return
    }
    setNotice('拼团活动草稿已创建，可继续配置成团人数和优惠')
  }

  const handleConvert = (id: string) => {
    setConvertedIds(prev => prev.includes(id) ? prev : [...prev, id])
    setNotice('已添加为正式学员，后续可在学员列表分班排课')
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
          <h1 className="font-semibold">招生管家</h1>
          <p className="truncate text-xs text-muted-foreground">营销活动工具列表与试课转化</p>
        </div>
        <button
          type="button"
          onClick={() => setNotice('试课活动草稿已创建，可继续补充课程、名额和海报')}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          创建活动
        </button>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 pb-8">
        {notice && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{notice}</span>
          </div>
        )}

        <section className="mb-4 rounded-3xl bg-gradient-to-br from-sky-50 to-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">本月招生概览</p>
              <p className="mt-1 text-3xl font-bold leading-none text-slate-950">{enrollmentOverview.newLeads}</p>
              <p className="mt-1 text-xs text-slate-500">新增商机 · {enrollmentOverview.pendingConversions} 人待转正</p>
            </div>
            <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
              <p className="text-xs text-slate-500">平均转化</p>
              <p className="text-xl font-bold text-sky-600">{enrollmentOverview.avgConversionRate}%</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: '活动曝光', value: enrollmentOverview.exposure.toLocaleString(), icon: Zap },
              { label: '报名试听', value: enrollmentOverview.trialBookings, icon: CalendarCheck },
              { label: '成交学员', value: enrollmentOverview.convertedStudents, icon: UserPlus },
            ].map(item => (
              <div key={item.label} className="rounded-2xl bg-white/80 px-3 py-2">
                <item.icon className="mb-1 h-4 w-4 text-sky-600" />
                <p className="text-sm font-bold text-slate-950">{item.value}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950">营销活动工具</h2>
            <BadgePercent className="h-5 w-5 text-sky-600" />
          </div>
          <div className="space-y-3">
            {marketingActivities.map(activity => {
              const Icon = activityIcon[activity.type as keyof typeof activityIcon]
              return (
                <div key={activity.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', activityTone[activity.type as keyof typeof activityTone])}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-950">{activity.name}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{activity.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{activity.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-slate-50 px-2 py-2">
                      <p className="text-sm font-bold text-slate-950">{activity.primaryMetric}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">核心数据</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-2 py-2">
                      <p className="text-sm font-bold text-slate-950">{activity.secondaryMetric}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">补充指标</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-2 py-2">
                      <p className="text-sm font-bold text-slate-950">{activity.conversionRate}%</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">转化率</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleActivityAction(activity)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-slate-950 py-2.5 text-sm font-medium text-white"
                  >
                    {activity.cta}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">试课活动看板</h2>
              <p className="mt-0.5 text-xs text-slate-500">意向、已报名、已到课名单统一跟进，已到课可一键添加为正式学员</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            {(Object.keys(trialStageLabels) as TrialStage[]).map(stage => (
              <button
                key={stage}
                type="button"
                onClick={() => setActiveStage(stage)}
                className={cn(
                  'rounded-2xl px-2 py-2 text-center transition-colors',
                  activeStage === stage ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <p className="text-lg font-bold leading-none">{stageCounts[stage]}</p>
                <p className="mt-1 text-[10px]">{trialStageLabels[stage]}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleTrialProspects.map(prospect => {
              const converted = convertedIds.includes(prospect.id)
              return (
                <div key={prospect.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{prospect.childName}</p>
                      <p className="mt-1 text-xs text-slate-500">{prospect.parentName} · {prospect.parentPhone}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-emerald-600">
                      {prospect.intentLevel}意向
                    </span>
                  </div>
                  <div className="mt-3 rounded-2xl bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">{prospect.interestedCourse}</p>
                    <p className="mt-1 text-xs text-slate-500">{prospect.trialDate} · {prospect.teacher}</p>
                    <p className="mt-2 text-xs text-slate-500">{prospect.nextAction}</p>
                  </div>
                  {activeStage === 'attended' && (
                    <button
                      type="button"
                      onClick={() => handleConvert(prospect.id)}
                      disabled={converted}
                      className={cn(
                        'mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-medium',
                        converted ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'
                      )}
                    >
                      <UserPlus className="h-4 w-4" />
                      {converted ? '已添加为正式学员' : '一键添加为正式学员'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
