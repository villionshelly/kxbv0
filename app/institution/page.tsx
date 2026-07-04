'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, BarChart3, Bell, CheckCircle, ChevronRight, ClipboardCheck, FileText, Globe2, Megaphone, MessageSquare, Target } from 'lucide-react'
import { diagnosisInsights, enrollmentOverview, institutionInfo, leaveRequests, todayScheduleB, warningStudents } from '@/lib/mock-data'
import { getLessonStatus, useAttendanceStore } from '@/lib/attendance-store'
import Image from 'next/image'
import featurePhotoAttendance from '@/png_256/feature_photo_attendance.png'
import featureMoments from '@/png_256/feature_moments.png'
import { cn } from '@/lib/utils'

export default function InstitutionHomePage() {
  const router = useRouter()
  const attendanceStore = useAttendanceStore()
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending')
  const revenue = diagnosisInsights.recruitmentRenewal.revenue.current
  const consumptionRate = diagnosisInsights.consumption.rate
  const lessonStats = todayScheduleB.reduce(
    (acc, item) => {
      const status = getLessonStatus(attendanceStore[item.id])
      acc[status] += 1
      return acc
    },
    { pending: 0, checked: 0, completed: 0 } as Record<'pending' | 'checked' | 'completed', number>
  )

  const businessStats = [
    { label: '新增商机', value: enrollmentOverview.newLeads, icon: Megaphone, color: 'text-sky-600', href: '/institution/enrollment' },
    { label: '报名试听', value: enrollmentOverview.trialBookings, icon: ClipboardCheck, color: 'text-blue-600', href: '/institution/trials' },
    { label: '待转正', value: enrollmentOverview.pendingConversions, icon: CheckCircle, color: 'text-emerald-600', href: '/institution/trials' },
  ]

  const primaryActions = [
    {
      label: '拍照点名',
      desc: 'AI识别自动销课',
      image: featurePhotoAttendance,
      href: '/institution/photo-attendance',
      bg: 'from-blue-50 to-slate-50',
    },
    {
      label: '精彩瞬间',
      desc: '生成内容发给家长',
      image: featureMoments,
      href: '/institution/highlights',
      bg: 'from-sky-50 to-slate-50',
    },
  ]

  const growthTools = [
    { label: '招生管家', desc: '活动获客', icon: Megaphone, href: '/institution/enrollment', color: 'text-sky-600', bg: 'bg-sky-100' },
    { label: '经营诊断', desc: 'AI建议', icon: BarChart3, href: '/institution/diagnosis', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '试听管理', desc: '商机转化', icon: ClipboardCheck, href: '/institution/trials', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: '我的动态', desc: '微官网', icon: Globe2, href: '/institution/microsite', color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <header className="safe-area-top px-4 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm ring-2 ring-white/80">
              <Image
                src={institutionInfo.logo}
                alt={institutionInfo.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold leading-tight text-foreground">{institutionInfo.name}</h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">AI增长版 · 今日经营看板</p>
            </div>
          </div>
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="通知"
          >
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </header>

      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-32">
        <section className="mb-4 overflow-hidden rounded-[28px] border border-white bg-white card-dream">
          <div className="bg-gradient-to-br from-blue-50 via-white to-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">今日经营</p>
                <button
                  type="button"
                  onClick={() => router.push('/institution/finance')}
                  className="mt-1 flex items-center gap-1 text-left"
                >
                  <span className="text-[34px] font-bold leading-none tracking-tight text-slate-950">
                    ¥{(revenue / 10000).toFixed(1)}w
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="rounded-3xl bg-blue-50 px-4 py-3 text-right shadow-sm">
                <p className="text-xs text-slate-500">销课率</p>
                <p className="mt-1 text-3xl font-bold leading-none text-blue-600">{consumptionRate}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 px-4 py-3">
            {businessStats.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex items-center justify-center gap-2 px-2 text-left transition-colors active:bg-slate-50"
              >
                <item.icon className={cn('h-4 w-4', item.color)} />
                <div>
                  <p className="text-lg font-bold leading-none text-slate-900">{item.value}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{item.label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 px-4 py-3">
            {warningStudents.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/institution/ai/warning')}
                className="flex w-full items-center gap-2 rounded-2xl bg-rose-50/90 px-3 py-2.5 text-left"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                  {warningStudents.slice(0, 2).map(s => s.name).join('、')} 等 {warningStudents.length} 人待续费跟进
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
            {pendingLeaves.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/institution/leave')}
                className="flex w-full items-center gap-2 rounded-2xl bg-amber-50/90 px-3 py-2.5 text-left"
              >
                <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                  {pendingLeaves.slice(0, 2).map(l => l.studentName).join('、')} 提交了请假申请
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white bg-white p-4 card-dream">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">今日执行</h2>
              <p className="mt-0.5 text-xs text-slate-500">{lessonStats.pending} 待点名 · {lessonStats.checked} 待反馈</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/institution/schedule')}
              className="flex items-center gap-0.5 text-xs font-medium text-slate-500"
            >
              排课
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {primaryActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className={cn('rounded-3xl bg-gradient-to-br p-3 text-left transition-transform active:scale-[0.98]', action.bg)}
              >
                <Image src={action.image} alt="" width={48} height={48} className="h-12 w-12 object-contain" aria-hidden="true" />
                <p className="mt-2 text-sm font-bold text-slate-950">{action.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{action.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {todayScheduleB.map((item) => {
              const status = getLessonStatus(attendanceStore[item.id])
              const [startTime, endTime] = item.time.split('-')
              return (
                <div key={item.id} className="rounded-2xl bg-slate-50/92 p-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-[56px] text-center">
                      <p className="text-sm font-bold text-blue-600">{startTime}</p>
                      <p className="text-[10px] text-slate-400">{endTime}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-slate-950">{item.className}</p>
                        {status === 'completed' && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">已完成</span>
                        )}
                        {status === 'checked' && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">待反馈</span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.student} · {item.classroom}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/institution/schedule/${item.id}`)}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                        status === 'pending' && 'institution-btn-primary',
                        status === 'checked' && 'institution-btn-primary',
                        status === 'completed' && 'bg-white text-slate-500 shadow-sm'
                      )}
                    >
                      {status === 'pending' && '点名'}
                      {status === 'checked' && (
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />反馈</span>
                      )}
                      {status === 'completed' && (
                        <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-600" />查看</span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </section>

        <section className="mt-4 rounded-[28px] border border-white bg-white p-4 card-dream">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">增长工具</h2>
              <p className="mt-0.5 text-xs text-slate-500">招生、诊断、试听、微官网</p>
            </div>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {growthTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => router.push(tool.href)}
                className="flex items-center gap-3 rounded-3xl bg-slate-50/92 p-3 text-left transition-transform active:scale-[0.98]"
              >
                <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', tool.bg)}>
                  <tool.icon className={cn('h-6 w-6', tool.color)} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-950">{tool.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{tool.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
