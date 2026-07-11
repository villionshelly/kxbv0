import Link from 'next/link'
import { BookOpen, CalendarDays, CheckCircle, Clock, MessageCircle, UserCheck, XCircle } from 'lucide-react'
import { TeacherPageShell } from '@/components/teacher-page-shell'
import { classSessions, students, teacherCheckIns } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ME_ID = '1'

const myRecords = teacherCheckIns
  .filter(record => record.teacherId === ME_ID)
  .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`))

const attendedRecords = myRecords.filter(record => record.status === 'attended')
const absentRecords = myRecords.filter(record => record.status === 'absent')
const totalMinutes = attendedRecords.reduce((sum, record) => sum + record.duration, 0)

function getStatusMeta(status: string) {
  if (status === 'attended') {
    return {
      label: '已销课',
      icon: CheckCircle,
      badgeClass: 'bg-green-50 text-green-600',
      iconClass: 'bg-green-50 text-green-500',
    }
  }

  if (status === 'absent') {
    return {
      label: '缺勤',
      icon: XCircle,
      badgeClass: 'bg-red-50 text-red-500',
      iconClass: 'bg-red-50 text-red-400',
    }
  }

  return {
    label: '请假',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-600',
    iconClass: 'bg-amber-50 text-amber-500',
  }
}

export default function TeacherConsumptionRecordsPage() {
  return (
    <TeacherPageShell className="flex h-full flex-col" variant="tool">
      <div className="teacher-subpage-content scrollbar-quiet flex-1 overflow-auto space-y-4">
        <section className="teacher-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">销课总览</p>
              <p className="text-xs text-slate-500">李雪 · 七彩培训中心</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="teacher-soft-card p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{attendedRecords.length}</p>
              <p className="text-[11px] text-slate-500">已销课</p>
            </div>
            <div className="teacher-soft-card p-3 text-center">
              <p className="text-xl font-bold text-slate-900">{Math.round(totalMinutes / 60)}</p>
              <p className="text-[11px] text-slate-500">课时</p>
            </div>
            <div className="teacher-soft-card p-3 text-center">
              <p className="text-xl font-bold text-red-500">{absentRecords.length}</p>
              <p className="text-[11px] text-slate-500">缺勤</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-900">历史记录</h2>
            <Link
              href="/institution/teacher/photo-attendance"
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              拍照点名
            </Link>
          </div>

          {myRecords.map(record => {
            const status = getStatusMeta(record.status)
            const StatusIcon = status.icon
            const student = students.find(item => item.id === record.studentId)
            const session = classSessions.find(item => item.id === record.sessionId)

            return (
              <article key={record.id} className="teacher-card p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', status.iconClass)}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {record.studentName} · {record.sessionName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.date} {record.startTime} · {record.duration}分钟
                        </p>
                      </div>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', status.badgeClass)}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{session?.courseName ?? record.sessionName}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{session?.classroom ?? '琴房'}</span>
                      </div>
                    </div>

                    {record.note && (
                      <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        {record.note}
                      </div>
                    )}

                    {record.status === 'attended' && (
                      <div className="mt-3 flex items-center justify-between rounded-2xl bg-blue-50/70 px-3 py-2 text-xs text-blue-700">
                        <span>{student?.parentName ?? '家长'} 可查看课堂反馈</span>
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </TeacherPageShell>
  )
}
