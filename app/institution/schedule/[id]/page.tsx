'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import { todayScheduleB, classSessions, students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useLessonRecord, saveCheckIn, saveFeedback, type FeedbackContent } from '@/lib/attendance-store'
import { FeedbackEditor } from '@/components/feedback-editor'

type Status = 'attended' | 'absent'

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const lesson = todayScheduleB.find(l => l.id === params.id) || todayScheduleB[0]

  // 通过班次名称匹配班级，获取全部学员（批量核销）
  const session = classSessions.find(s => s.name === lesson.className) || classSessions[0]
  const sessionStudents = students.filter(s => session.studentIds.includes(s.id))

  // 已有核销/反馈记录（再次进入时恢复）
  const record = useLessonRecord(lesson.id)
  const alreadyChecked = !!record?.checked

  // phase: 'checkin'（批量核销）| 'feedback'（逐一反馈）
  // 若已点名核销，直接进入反馈阶段
  const [phase, setPhase] = useState<'checkin' | 'feedback'>(alreadyChecked ? 'feedback' : 'checkin')
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
    if (record?.checked) {
      return Object.fromEntries(
        sessionStudents.map(s => [s.id, record.attendedIds.includes(s.id) ? 'attended' : 'absent' as Status])
      )
    }
    return Object.fromEntries(sessionStudents.map(s => [s.id, 'attended' as Status]))
  })
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackContent>>(() => record?.feedbacks ?? {})
  const [sentFeedbacks, setSentFeedbacks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.keys(record?.feedbacks ?? {}).map(id => [id, true]))
  )
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null)
  const [allDone, setAllDone] = useState(false)

  // 核销逻辑（与教师端一致）
  const setStatus = (studentId: string, status: Status) => {
    if (status === 'attended') {
      // 标记一人到课 → 其他人缺勤
      const next: Record<string, Status> = {}
      sessionStudents.forEach(s => {
        next[s.id] = s.id === studentId ? 'attended' : 'absent'
      })
      setStatuses(next)
    } else {
      // 标记一人缺勤 → 其他默认到课
      setStatuses(prev => {
        const next: Record<string, Status> = {}
        sessionStudents.forEach(s => {
          if (s.id === studentId) next[s.id] = 'absent'
          else next[s.id] = prev[s.id] === 'absent' ? 'absent' : 'attended'
        })
        return next
      })
    }
  }

  const attendedStudents = sessionStudents.filter(s => statuses[s.id] === 'attended')
  const attendedCount = attendedStudents.length

  const handleConfirmCheckIn = () => {
    // 保存核销记录 → 进入账单流转
    const attendedIds = sessionStudents.filter(s => statuses[s.id] === 'attended').map(s => s.id)
    const absentId = sessionStudents.filter(s => statuses[s.id] === 'absent').map(s => s.id)
    saveCheckIn(lesson.id, attendedIds, absentId)
    setPhase('feedback')
  }

  const handleSendFeedback = (studentId: string, text: string, images: string[]) => {
    saveFeedback(lesson.id, studentId, text, images)
    setFeedbacks(prev => ({ ...prev, [studentId]: { text, images } }))
    setSentFeedbacks(prev => ({ ...prev, [studentId]: true }))
    setActiveFeedback(null)
  }

  // 完成/暂离页
  if (allDone) {
    const pendingFeedback = attendedStudents.filter(s => !sentFeedbacks[s.id]).length
    const fullyDone = pendingFeedback === 0
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mb-6',
          fullyDone ? 'bg-green-100' : 'bg-amber-100')}>
          <CheckCircle className={cn('w-10 h-10', fullyDone ? 'text-green-500' : 'text-amber-500')} />
        </div>
        <h1 className="text-xl font-bold mb-2">{fullyDone ? '本节课已完成' : '已核销，反馈待补充'}</h1>
        <p className="text-muted-foreground text-center mb-8">
          {fullyDone
            ? `已核销 ${attendedCount} 人，反馈已全部发送给家长`
            : `已核销 ${attendedCount} 人并进入课程账单，还有 ${pendingFeedback} 人未反馈。下次进入可继续添加。`}
        </p>
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => router.push('/institution')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => phase === 'feedback' ? setPhase('checkin') : router.back()}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">
            {phase === 'checkin' ? '课堂批量核销' : '课堂反馈'}
          </h1>
          <p className="text-xs text-muted-foreground">{lesson.className}</p>
        </div>
      </div>

      {/* Lesson info */}
      <div className="px-4 py-3">
        <div className="bg-muted/20 rounded-xl p-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{lesson.time}</span>
          </div>
          <span className="text-sm text-muted-foreground">{lesson.classroom}</span>
          <span className="text-sm text-muted-foreground ml-auto">共 {sessionStudents.length} 人</span>
        </div>
      </div>

      {/* Phase 1: Batch check-in */}
      {phase === 'checkin' && (
        <div className="px-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-1">
            点击「到课」标记核销，点击「缺勤」标记缺席。标记一人到课后其余默认缺勤。
          </p>
          {sessionStudents.map(student => {
            const status = statuses[student.id]
            return (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">剩余 {student.remainingClasses} 课时</p>
                </div>
                <div className="flex gap-1.5">
                  {(['attended', 'absent'] as Status[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(student.id, s)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        status === s
                          ? s === 'attended' ? 'bg-green-500 text-white' : 'bg-destructive text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {s === 'attended' ? '到课' : '缺勤'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Phase 2: Per-student feedback */}
      {phase === 'feedback' && (
        <div className="px-4 space-y-2">
          <div className="p-3 bg-green-50 rounded-xl flex items-start gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">
              已生成核销记录并进入账单流转。可逐一为到课学员添加反馈，全部反馈完成后课程标记为「已完成」。
            </p>
          </div>
          {sessionStudents.map(student => {
            const attended = statuses[student.id] === 'attended'
            const sent = sentFeedbacks[student.id]
            return (
              <div key={student.id} className="p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{student.name}</p>
                      <span className={cn('px-1.5 py-0.5 text-[10px] rounded font-medium',
                        attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {attended ? '已核销' : '缺勤'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">家长：{student.parentName}</p>
                  </div>
                  {attended && (
                    sent ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        已发送
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveFeedback(student.id)}
                        className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        添加反馈
                      </button>
                    )
                  )}
                </div>
                {sent && feedbacks[student.id] && (
                  <div className="mt-2 bg-background rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">{feedbacks[student.id].text}</p>
                    {feedbacks[student.id].images?.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {feedbacks[student.id].images.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={url || "/placeholder.svg"} alt={`课堂照片 ${i + 1}`} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
        {phase === 'checkin' ? (
          <button
            onClick={handleConfirmCheckIn}
            className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium"
          >
            确认核销（到课 {attendedCount} 人）
          </button>
        ) : (
          (() => {
            const pendingFeedback = attendedStudents.filter(s => !sentFeedbacks[s.id]).length
            return (
              <button
                onClick={() => setAllDone(true)}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                {pendingFeedback > 0 ? `稍后反馈（还剩 ${pendingFeedback} 人未反馈）` : '完成'}
              </button>
            )
          })()
        )}
      </div>

      {/* Feedback editor (shared) */}
      {activeFeedback && (
        <FeedbackEditor
          studentName={students.find(s => s.id === activeFeedback)?.name ?? ''}
          initialText={feedbacks[activeFeedback]?.text ?? ''}
          initialImages={feedbacks[activeFeedback]?.images ?? []}
          onSend={(text, images) => handleSendFeedback(activeFeedback, text, images)}
          onClose={() => setActiveFeedback(null)}
        />
      )}
    </div>
  )
}
