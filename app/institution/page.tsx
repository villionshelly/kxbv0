'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Bell, CheckCircle, ChevronRight, ClipboardCheck, FileText, Megaphone, MessageSquare, Target } from 'lucide-react'
import { diagnosisInsights, enrollmentOverview, leaveRequests, todayScheduleB, warningStudents } from '@/lib/mock-data'
import { getLessonStatus, useAttendanceStore } from '@/lib/attendance-store'
import Image from 'next/image'
import featurePhotoAttendance from '@/png_256/feature_photo_attendance.png'
import featureMoments from '@/png_256/feature_moments.png'
import growthBusinessDiagnosis from '@/png_256/growth_business_diagnosis_经营诊断.png'
import growthEnrollmentManager from '@/png_256/growth_enrollment_manager_招生管家.png'
import growthMyUpdates from '@/png_256/growth_my_updates_我的动态.png'
import growthTrialManagement from '@/png_256/growth_trial_management_试听管理.png'
import { cn } from '@/lib/utils'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

export default function InstitutionHomePage() {
  const router = useRouter()
  const { settings } = useInstitutionProfileSettings()
  const attendanceStore = useAttendanceStore()
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending')
  const revenue = diagnosisInsights.recruitmentRenewal.revenue.current
  const consumptionRate = diagnosisInsights.consumption.rate

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
    { label: '招生管家', desc: '活动获客', image: growthEnrollmentManager, href: '/institution/enrollment' },
    { label: '经营诊断', desc: 'AI建议', image: growthBusinessDiagnosis, href: '/institution/diagnosis' },
    { label: '试听管理', desc: '商机转化', image: growthTrialManagement, href: '/institution/trials' },
    { label: '我的动态', desc: '微官网', image: growthMyUpdates, href: '/institution/microsite' },
  ]

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-32">
        <header className="safe-area-top pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white/80 shadow-sm ring-1 ring-white">
              <Image
                src={settings.institutionLogo}
                alt={settings.institutionName}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-xl font-bold leading-tight text-foreground">{settings.institutionName}</h1>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100">
                  AI增长版
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-4 overflow-hidden rounded-[28px] border border-white bg-white card-dream">
          <div className="bg-gradient-to-br from-blue-50 via-white to-white px-4 pb-2.5 pt-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">本月销课</p>
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
              <div className="rounded-[22px] bg-blue-50 px-3 py-2 text-right shadow-sm">
                <p className="text-[11px] text-slate-500">销课率</p>
                <p className="mt-0.5 text-2xl font-bold leading-none text-blue-600">{consumptionRate}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 px-4 pb-4 pt-1.5">
            {warningStudents.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/institution/ai/warning')}
                className="flex min-h-[54px] w-full items-center gap-2 rounded-[22px] bg-rose-50/90 px-4 py-3.5 text-left"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                  {warningStudents.slice(0, 2).map(s => s.name).join('、')} 等 {warningStudents.length} 人待续费跟进
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            )}
            {pendingLeaves.length > 0 && (
              <button
                type="button"
                onClick={() => router.push('/institution/leave')}
                className="flex min-h-[54px] w-full items-center gap-2 rounded-[22px] bg-amber-50/90 px-4 py-3.5 text-left"
              >
                <FileText className="h-5 w-5 shrink-0 text-amber-500" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                  {pendingLeaves.slice(0, 2).map(l => l.studentName).join('、')} 提交了请假申请
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white bg-white p-4 card-dream">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">今日执行</h2>
            </div>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100"
              aria-label="通知"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {primaryActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => router.push(action.href)}
                className={cn('flex min-h-[76px] items-center gap-3 rounded-3xl bg-gradient-to-br p-3 text-left transition-transform active:scale-[0.98]', action.bg)}
              >
                <Image src={action.image} alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0 object-contain" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-950">{action.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-slate-500">{action.desc}</span>
                </span>
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

        <section className="mt-4 rounded-[28px] border border-white bg-white p-3.5 card-dream">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">增长工具</h2>
            </div>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mb-3 rounded-[24px] bg-blue-50/55 p-2">
            <div className="grid grid-cols-3 divide-x divide-blue-100/80">
              {businessStats.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="flex min-h-[58px] flex-col items-center justify-center gap-1 px-2 text-center transition-colors active:bg-white/60"
                >
                  <span className="flex items-center gap-1.5">
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    <span className="text-lg font-bold leading-none text-slate-900">{item.value}</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {growthTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => router.push(tool.href)}
                className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-slate-50/92 p-3 text-left transition-transform active:scale-[0.98]"
              >
                <Image src={tool.image} alt="" width={52} height={52} className="h-[52px] w-[52px] shrink-0 object-contain" aria-hidden="true" />
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
