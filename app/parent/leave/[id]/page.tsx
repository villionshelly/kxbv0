'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, MapPin, AlertCircle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { schedule } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

// Future sessions available for makeup (any upcoming slot of the same course)
function getMakeupOptions(lesson: typeof schedule[0]) {
  return schedule
    .filter(s => s.courseId === lesson.courseId && s.date > lesson.date && s.status === 'upcoming')
    .slice(0, 5)
}

export default function LeaveRequestPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const lesson = schedule.find(s => s.id === params.id) || schedule[0]
  const makeupOptions = getMakeupOptions(lesson)
  
  // Check if this is a self-accounting course (auto-approve)
  const isSelfAccounting = searchParams.get('type') === 'self' || lesson.courseType === 'self'
  // Check if bound to institution (no makeup allowed, leave auto-approved)
  const isBoundToInstitution = searchParams.get('bound') === '1' || lesson.courseType === 'institution'

  const [tab, setTab] = useState<'leave' | 'makeup'>('leave')
  const [reason, setReason] = useState('')
  const [selectedMakeup, setSelectedMakeup] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // If bound to institution, only leave is available (no makeup tab)
  const showMakeupTab = isSelfAccounting && !isBoundToInstitution

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => router.back(), 1800)
  }

  const canSubmitLeave = reason.trim().length > 0
  const canSubmitMakeup = selectedMakeup !== null

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold mb-1">
            {tab === 'leave' 
              ? (isSelfAccounting || isBoundToInstitution ? '请假已生效' : '请假申请已提交')
              : (isSelfAccounting ? '调休已生效' : '调休申请已提交')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tab === 'leave'
              ? (isSelfAccounting 
                  ? '自主记账课程，系统已自动同意，课时暂不扣除' 
                  : isBoundToInstitution
                  ? '请假已自动通过，课时暂不扣除。请务必与老师提前沟通！'
                  : '机构老师会尽快确认，课时暂不扣除')
              : (isSelfAccounting
                  ? `自主记账课程，系统已自动同意，将补课到 ${makeupOptions.find(m => m.id === selectedMakeup)?.date ?? ''}`
                  : `将补课到 ${makeupOptions.find(m => m.id === selectedMakeup)?.date ?? ''} 的课次`)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">
          {showMakeupTab ? '申请请假 / 调休' : '申请请假'}
        </h1>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Lesson card */}
        <div className="mx-4 mt-4 p-4 rounded-2xl border border-border bg-muted/20">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base"
              style={{ backgroundColor: lesson.color }}
            >
              {lesson.courseName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{lesson.courseName}</p>
              <p className="text-xs text-muted-foreground">{lesson.institution}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{lesson.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{lesson.startTime}–{lesson.endTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />{lesson.classroom}
            </span>
          </div>
        </div>

        {/* Tab switcher - only show if makeup is available */}
        {showMakeupTab && (
          <div className="flex mx-4 mt-4 bg-muted/40 rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('leave')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium transition-colors',
                tab === 'leave' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              <AlertCircle className="w-4 h-4" />
              请假
            </button>
            <button
              onClick={() => setTab('makeup')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium transition-colors',
                tab === 'makeup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              申请调休
            </button>
          </div>
        )}

        <div className="px-4 mt-4">
          {tab === 'leave' ? (
            <>
              <label className="block text-sm font-medium mb-2">请假原因</label>
              <textarea
                placeholder="请填写请假原因，如：孩子感冒发烧、临时外出..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div className="mt-4 p-3 bg-orange-50 rounded-xl flex gap-3">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSelfAccounting 
                    ? '自主记账课程，提交后系统将自动同意，课时本次暂不扣除。' 
                    : isBoundToInstitution
                    ? '机构课程请假将自动通过，课时本次暂不扣除。请务必与老师提前沟通！'
                    : '请提前24小时申请，课时本次暂不扣除。老师确认后方可生效，后续可申请调休补课。'}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                选择一个未来班次进行补课，支持调休到同课程的其他时段，也可调休到已过期班次之后的任意班次。
              </p>
              {makeupOptions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  暂无可调休的班次，请联系老师安排
                </div>
              ) : (
                <div className="space-y-2">
                  {makeupOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedMakeup(opt.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                        selectedMakeup === opt.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-xl shrink-0 flex flex-col items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: opt.color }}
                      >
                        <span>{opt.date.slice(5, 7)}/{opt.date.slice(8, 10)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{opt.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.startTime}–{opt.endTime} · {opt.classroom}
                        </p>
                      </div>
                      <ArrowRight className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        selectedMakeup === opt.id ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 rounded-xl flex gap-3">
                <RefreshCw className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSelfAccounting
                    ? '自主记账课程，提交后系统将自动同意调休，本节课将标记为请假。'
                    : '调休成功后本节课将标记为请假，补课班次将单独计课时并消课。'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-4 py-4 border-t border-border bg-background safe-area-bottom">
        <button
          onClick={handleSubmit}
          disabled={tab === 'leave' ? !canSubmitLeave : !canSubmitMakeup}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-opacity"
        >
          {tab === 'leave' ? '提交请假申请' : '确认调休'}
        </button>
      </div>
    </div>
  )
}
