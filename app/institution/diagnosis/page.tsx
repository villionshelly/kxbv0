'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Bell, ChevronRight, FileText, Medal, MessageSquare, Sparkles, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { diagnosisInsights } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const actionShortcuts = [
  {
    label: 'AI续费话术',
    desc: '给低续费意向家长生成个性化沟通话术',
    href: '/institution/ai/renewal',
    icon: MessageSquare,
    tone: 'bg-orange-100 text-orange-600',
  },
  {
    label: '流失预警',
    desc: '继续查看高风险学员和跟进原因',
    href: '/institution/ai/warning',
    icon: Bell,
    tone: 'bg-rose-100 text-rose-600',
  },
  {
    label: 'AI成长报告',
    desc: '生成阶段报告，增强续费和到课动力',
    href: '/institution/growth-report',
    icon: FileText,
    tone: 'bg-blue-100 text-blue-600',
  },
]

function ChangeText({ value }: { value: number }) {
  const positive = value >= 0
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', positive ? 'text-emerald-600' : 'text-rose-600')}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}{value}%
    </span>
  )
}

export default function DiagnosisPage() {
  const router = useRouter()
  const { consumption, recruitmentRenewal, marketingConversion } = diagnosisInsights

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
          <h1 className="font-semibold">经营诊断</h1>
          <p className="truncate text-xs text-muted-foreground">AI诊断机构增长、续费和课消问题</p>
        </div>
        <Sparkles className="h-5 w-5 text-primary" />
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 pb-8">
        <section className="mb-4 rounded-3xl bg-gradient-to-br from-blue-50 to-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">AI发现</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{consumption.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{consumption.summary}</p>
            </div>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-600">{consumption.level}</span>
          </div>

          <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">当前销课率</span>
              <span className="text-2xl font-bold text-blue-600">{consumption.rate}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${consumption.rate}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{consumption.benchmark}</p>
          </div>

          <div className="mt-3 space-y-2">
            {consumption.students.map(student => (
              <div key={student.name} className="rounded-2xl bg-white/80 px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-950">{student.name} · {student.course}</p>
                  <span className="text-sm font-bold text-rose-600">{student.rate}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{student.data}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push(consumption.recommendation.href)}
            className="mt-3 flex w-full items-center gap-3 rounded-3xl bg-slate-950 p-3 text-left text-white"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Medal className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">推荐使用 {consumption.recommendation.name}</span>
              <span className="mt-0.5 block text-xs text-white/70">{consumption.recommendation.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </section>

        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">{recruitmentRenewal.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{recruitmentRenewal.summary}</p>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              recruitmentRenewal.newStudents,
              recruitmentRenewal.renewals,
              recruitmentRenewal.revenue,
            ].map(item => (
              <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-[10px] text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold leading-none text-slate-950">
                  {item.label === '本月营收' ? `¥${(item.current / 10000).toFixed(1)}w` : item.current}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">同比</span>
                    <ChangeText value={item.yoy} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">环比</span>
                    <ChangeText value={item.mom} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">{marketingConversion.title}</h2>
            <BarChart3 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-3">
            {marketingConversion.tools.map(tool => (
              <div key={tool.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{tool.name}</span>
                  <span className="font-bold text-slate-950">{tool.rate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${tool.rate}%` }} />
                </div>
                <div className="mt-1 grid grid-cols-4 gap-1 text-[10px] text-slate-500">
                  <span>曝光 {tool.exposure}</span>
                  <span>线索 {tool.leads}</span>
                  <span>试听 {tool.trials}</span>
                  <span>转化 {tool.conversions}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-bold text-slate-950">保留的 AI 行动入口</h2>
          <div className="space-y-3">
            {actionShortcuts.map(action => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className="flex w-full items-center gap-3 rounded-3xl bg-slate-50 p-3 text-left"
              >
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', action.tone)}>
                  <action.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-950">{action.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{action.desc}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
