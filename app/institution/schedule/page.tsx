'use client'

import { useState, useMemo, useRef, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, Plus, Sparkles, Users, Clock, X, CheckCircle, ArrowLeft } from 'lucide-react'
import { classSessions, courseCatalog, students, teachers, leaveRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import floatAiSchedule from '@/png_256/float_ai_schedule.png'
import floatShift from '@/png_256/float_shift.png'

const timeSlots = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
const weekDays = ['周一','周二','周三','周四','周五','周六','周日']

// Get pixel offset for a time string within the grid (each slot = 52px)
function timeToOffset(time: string) {
  const idx = timeSlots.indexOf(time)
  return idx >= 0 ? idx * 52 : 0
}

function durationToHeight(minutes: number) {
  // 60 min = 52px
  return (minutes / 60) * 52
}

type ClassSessionItem = typeof classSessions[0]

// Sheet: click a block on the calendar to view/edit
function SessionDetailSheet({
  session,
  dayOfWeek,
  onClose,
  onEdit,
}: {
  session: ClassSessionItem
  dayOfWeek: number
  onClose: () => void
  onEdit: () => void
}) {
  const [addingStudents, setAddingStudents] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>(session.studentIds)
  const [saved, setSaved] = useState(false)

  const leaves = leaveRecords.filter(l => l.sessionId === session.id && l.dayOfWeek === dayOfWeek)
  const presentCount = session.studentIds.length - leaves.length
  const availableSlots = session.maxStudents - session.studentIds.length
  const sessionTime = session.sessions.find(s => s.dayOfWeek === dayOfWeek)
  const enrolledStudents = students.filter(s => session.studentIds.includes(s.id))
  const unenrolledStudents = students.filter(s => !session.studentIds.includes(s.id))

  const toggleStudent = (id: string) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSaveStudents = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); setAddingStudents(false) }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="bg-background w-full rounded-t-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {saved ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="font-medium">学员已更新</p>
          </div>
        ) : addingStudents ? (
          <>
            <div className="px-4 pb-3 flex items-center gap-3 border-b border-border shrink-0">
              <button onClick={() => setAddingStudents(false)} className="p-1.5 hover:bg-muted rounded-lg">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-sm flex-1">添加/调整学员</h3>
              <button
                onClick={handleSaveStudents}
                className="px-3 py-1.5 institution-btn-primary rounded-lg text-xs font-medium"
              >
                保存
              </button>
            </div>
            <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
              {students.map(s => {
                const inSession = selectedStudents.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      inSession ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.parentName}</p>
                    </div>
                    {inSession && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: session.color }} />
                <h3 className="font-semibold">{session.name}</h3>
                <span className={cn(
                  'ml-auto text-xs px-2 py-0.5 rounded-full',
                  session.type === '1对1' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                )}>{session.type}</span>
              </div>
              {sessionTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{weekDays[dayOfWeek]} {sessionTime.time} · {sessionTime.duration}分钟</span>
                  {session.classroom && <span className="ml-auto">📍 {session.classroom}</span>}
                </div>
              )}

              {/* Attendance stats */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-green-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-green-600">{presentCount}</p>
                  <p className="text-[10px] text-green-600/70">预计出勤</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-600">{leaves.length}</p>
                  <p className="text-[10px] text-amber-600/70">已请假</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-600">{availableSlots}</p>
                  <p className="text-[10px] text-blue-600/70">可调课名额</p>
                </div>
              </div>
            </div>

            {/* Student list */}
            <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">班级学员 ({session.studentIds.length}/{session.maxStudents})</p>
                <button
                  onClick={() => setAddingStudents(true)}
                  className="text-xs text-primary font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加学员 / 调课
                </button>
              </div>
              {enrolledStudents.map(s => {
                const onLeave = leaves.find(l => l.studentId === s.id)
                return (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-xl">
                    <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.parentName}</p>
                    </div>
                    {onLeave ? (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">
                        请假中
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                        预计出勤
                      </span>
                    )}
                  </div>
                )
              })}
              {enrolledStudents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">暂无学员，点击上方添加</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-6 pt-2 border-t border-border shrink-0 space-y-2">
              <button
                onClick={onEdit}
                className="w-full h-11 bg-muted text-foreground rounded-xl text-sm font-medium"
              >
                编辑班次设置
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要取消本次班次吗？取消后将通知所有学员，课时不扣除。')) {
                    onClose()
                  }
                }}
                className="w-full h-11 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-200"
              >
                取消本次班次
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// AI 排课说明弹窗
function AIScheduleModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'intro' | 'processing' | 'done'>('intro')
  const unassigned = students.filter(s =>
    !classSessions.some(cs => cs.studentIds.includes(s.id))
  )

  const handleStart = () => {
    setStep('processing')
    setTimeout(() => setStep('done'), 2500)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold">AI智能排课</h2>
        </div>
      </div>

      {step === 'intro' && (
        <div className="flex-1 overflow-auto px-4 py-5 space-y-5">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-2 text-primary">AI排课逻辑</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                读取已购买课程但未排入班次的学员
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                结合学员登记的时间偏好（工作日/周末/上午/下午）
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                匹配班次类型（1对1/小班/大班）与剩余名额
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                生成推荐排课方案，由老师确认后生效
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs text-muted-foreground font-medium mb-2">待排课学员 ({unassigned.length}人)</p>
            {unassigned.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                所有学员均已排入班次
              </div>
            ) : unassigned.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-2">
                <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full bg-muted" />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.parentName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h3 className="text-lg font-bold">AI正在分析排课...</h3>
          <p className="text-sm text-muted-foreground">正在结合学员时间偏好和班次规则自动匹配</p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex-1 overflow-auto px-4 py-5">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-bold text-lg">排课方案已生成</h3>
            <p className="text-sm text-muted-foreground mt-1">共为 {Math.min(unassigned.length, 3)} 位学员推荐了班次，请确认后生效</p>
          </div>
          {classSessions.slice(0, 3).map((cs, i) => (
            <div key={cs.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cs.color }} />
              <div className="flex-1">
                <p className="text-sm font-medium">{cs.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cs.sessions.map(s => weekDays[s.dayOfWeek] + ' ' + s.time).join(' / ')}
                </p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {step === 'intro' && (
        <div className="px-4 py-4 border-t border-border bg-background">
          <button
            onClick={handleStart}
            className="w-full h-12 institution-btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            开始AI排课
          </button>
        </div>
      )}
      {step === 'done' && (
        <div className="px-4 py-4 border-t border-border bg-background flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 bg-muted rounded-xl text-sm font-medium">稍后确认</button>
          <button onClick={onClose} className="flex-1 h-12 institution-btn-primary rounded-xl text-sm font-medium">确认生效</button>
        </div>
      )}
    </div>
  )
}

export default function InstitutionSchedulePage() {
  const router = useRouter()
  const [currentWeek, setCurrentWeek] = useState(0)
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [showAI, setShowAI] = useState(false)
  const [activeBlock, setActiveBlock] = useState<{ session: ClassSessionItem; day: number } | null>(null)
  const [floatPosition, setFloatPosition] = useState({ right: 16, bottom: 8 })
  const dragStateRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null
    dragging: boolean
    pointerId: number | null
    startX: number
    startY: number
    startRight: number
    startBottom: number
  }>({
    timer: null,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startRight: 16,
    startBottom: 8,
  })
  const suppressClickRef = useRef(false)

  const clearFloatDragTimer = () => {
    if (dragStateRef.current.timer) {
      clearTimeout(dragStateRef.current.timer)
      dragStateRef.current.timer = null
    }
  }

  const handleFloatPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    clearFloatDragTimer()
    const target = event.currentTarget
    const state = dragStateRef.current
    state.pointerId = event.pointerId
    state.startX = event.clientX
    state.startY = event.clientY
    state.startRight = floatPosition.right
    state.startBottom = floatPosition.bottom
    state.dragging = false
    state.timer = setTimeout(() => {
      state.dragging = true
      suppressClickRef.current = true
      target.setPointerCapture(event.pointerId)
    }, 320)
  }

  const handleFloatPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (!state.dragging || state.pointerId !== event.pointerId) return

    const frame = event.currentTarget.closest('.mobile-frame')
    const frameRect = frame?.getBoundingClientRect()
    const maxRight = frameRect ? frameRect.width - 72 : 318
    const maxBottom = frameRect ? frameRect.height - 180 : 664
    const nextRight = state.startRight - (event.clientX - state.startX)
    const nextBottom = state.startBottom - (event.clientY - state.startY)

    setFloatPosition({
      right: Math.min(Math.max(nextRight, 10), maxRight),
      bottom: Math.min(Math.max(nextBottom, 8), maxBottom),
    })
  }

  const handleFloatPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    clearFloatDragTimer()
    const state = dragStateRef.current
    if (state.dragging && state.pointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {}
    }
    state.dragging = false
    state.pointerId = null
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }

  // Filter sessions by selected course tab
  const filteredSessions = useMemo(() =>
    courseFilter === 'all'
      ? classSessions
      : classSessions.filter(cs => cs.courseId === courseFilter),
    [courseFilter]
  )

  // Derive week grid from filtered sessions
  const weekSchedule = useMemo(() =>
    filteredSessions.flatMap(cs =>
      cs.sessions.map(s => ({
        day: s.dayOfWeek,
        time: s.time,
        duration: s.duration,
        name: cs.name,
        teacher: cs.teacher,
        color: cs.color,
        sessionId: cs.id,
        session: cs,
      }))
    ),
    [filteredSessions]
  )

  return (
    <div className="flex h-full flex-col institution-dream-bg relative">
      {/* Header */}
      <header className="safe-area-top px-4 pb-2">
        <div className="flex items-center py-2">
          <div>
            <h1 className="text-xl font-bold leading-tight">排课管理</h1>
          </div>
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <button
            onClick={() => setCourseFilter('all')}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors',
              courseFilter === 'all' ? 'institution-btn-primary' : 'bg-card/82 text-muted-foreground'
            )}
          >全部</button>
          {courseCatalog.map(c => (
            <button
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors',
                courseFilter === c.id ? 'text-white' : 'bg-card/82 text-muted-foreground'
              )}
              style={courseFilter === c.id ? { backgroundColor: c.color } : {}}
            >{c.name}</button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-32">
        {viewMode === 'week' ? (
          <div className="overflow-hidden rounded-3xl bg-card card-dream">
            <div className="sticky top-0 z-20 bg-card border-b border-border">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex flex-1 items-center gap-1">
                  <button onClick={() => setCurrentWeek(w => w - 1)} className="rounded-full p-1.5 transition-colors hover:bg-muted">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="min-w-[4rem] text-center text-sm font-medium">
                    {currentWeek === 0 ? '本周' : currentWeek > 0 ? `${currentWeek}周后` : `${-currentWeek}周前`}
                  </span>
                  <button onClick={() => setCurrentWeek(w => w + 1)} className="rounded-full p-1.5 transition-colors hover:bg-muted">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex rounded-full bg-muted/50 p-0.5">
                  {(['week', 'list'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setViewMode(m)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        viewMode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                      )}
                    >{m === 'week' ? '周视图' : '列表'}</button>
                  ))}
                </div>
              </div>
              <div className="flex border-t border-border/50">
                <div className="w-11 shrink-0" />
                {weekDays.map((day, idx) => (
                  <div key={day} className="flex-1 text-center py-2">
                    <span className={cn(
                      'text-[11px] font-medium',
                      idx >= 5 ? 'text-primary' : 'text-muted-foreground'
                    )}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time grid */}
            <div className="relative bg-card">
              {timeSlots.map((time) => (
                <div key={time} className="flex h-[52px] border-b border-border/40">
                  <div className="w-11 shrink-0 text-[10px] text-muted-foreground pt-1 text-center leading-tight">
                    {time}
                  </div>
                  {weekDays.map((_, dayIdx) => (
                    <div key={dayIdx} className="flex-1 border-l border-border/30 relative">
                      {weekSchedule
                        .filter(s => s.day === dayIdx && s.time === time)
                        .map((item, sIdx) => {
                          const leaves = leaveRecords.filter(l => l.sessionId === item.sessionId && l.dayOfWeek === dayIdx)
                          const presentCount = item.session.studentIds.length - leaves.length
                          const availableSlots = item.session.maxStudents - item.session.studentIds.length
                          const h = durationToHeight(item.duration)
                          return (
                            <button
                              key={sIdx}
                              onClick={() => setActiveBlock({ session: item.session, day: dayIdx })}
                              className="absolute inset-x-0.5 rounded-lg text-white overflow-hidden text-left active:opacity-80"
                              style={{
                                backgroundColor: item.color,
                                height: `${h - 3}px`,
                                top: '2px',
                              }}
                            >
                              <div className="px-1 pt-0.5">
                                <p className="text-[9px] font-semibold leading-tight truncate">{item.name}</p>
                                {h >= 40 && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    <Users className="w-2 h-2 opacity-80 shrink-0" />
                                    <span className="text-[8px] opacity-90">
                                      {presentCount}出勤
                                      {leaves.length > 0 && <span className="opacity-70"> ·{leaves.length}假</span>}
                                      {availableSlots > 0 && <span className="opacity-70"> ·{availableSlots}位</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="sticky top-0 z-20 rounded-3xl bg-card p-3 card-dream">
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center gap-1">
                  <button onClick={() => setCurrentWeek(w => w - 1)} className="rounded-full p-1.5 transition-colors hover:bg-muted">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="min-w-[4rem] text-center text-sm font-medium">
                    {currentWeek === 0 ? '本周' : currentWeek > 0 ? `${currentWeek}周后` : `${-currentWeek}周前`}
                  </span>
                  <button onClick={() => setCurrentWeek(w => w + 1)} className="rounded-full p-1.5 transition-colors hover:bg-muted">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex rounded-full bg-muted/50 p-0.5">
                  {(['week', 'list'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setViewMode(m)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        viewMode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                      )}
                    >{m === 'week' ? '周视图' : '列表'}</button>
                  ))}
                </div>
              </div>
            </div>
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted-foreground card-dream">
                <Users className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">该课程暂无班次</p>
              </div>
            ) : filteredSessions.map((cls) => {
              const leaves = leaveRecords.filter(l => l.sessionId === cls.id)
              const leaveDays = [...new Set(leaves.map(l => l.dayOfWeek))]
              return (
                <button
                  key={cls.id}
                  onClick={() => setActiveBlock({ session: cls, day: cls.sessions[0]?.dayOfWeek ?? 0 })}
                  className="w-full p-4 bg-card rounded-3xl text-left active:bg-muted/50 transition-colors card-dream"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cls.color }} />
                      <div>
                        <h4 className="font-medium text-sm">{cls.name}</h4>
                        <p className="text-xs text-muted-foreground">{cls.courseName}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      cls.type === '1对1' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    )}>{cls.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {cls.studentIds.length}/{cls.maxStudents}人
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {cls.sessions.map(s => weekDays[s.dayOfWeek] + ' ' + s.time).join(' / ')}
                    </span>
                  </div>
                  {/* Attendance row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-green-600">{cls.studentIds.length - leaves.length}</p>
                      <p className="text-[10px] text-green-600/70">预计出勤</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-amber-600">{leaves.length}</p>
                      <p className="text-[10px] text-amber-600/70">请假</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold text-blue-600">{cls.maxStudents - cls.studentIds.length}</p>
                      <p className="text-[10px] text-blue-600/70">可调课</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div
        className="absolute z-30 flex touch-none select-none flex-col items-center gap-1.5"
        style={{ right: floatPosition.right, bottom: floatPosition.bottom }}
        onPointerDown={handleFloatPointerDown}
        onPointerMove={handleFloatPointerMove}
        onPointerUp={handleFloatPointerEnd}
        onPointerCancel={handleFloatPointerEnd}
      >
        <button
          onClick={() => {
            if (suppressClickRef.current) return
            setShowAI(true)
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-transparent p-0 transition-transform active:scale-95"
          aria-label="AI排课"
        >
          <Image src={floatAiSchedule} alt="" width={56} height={56} className="h-14 w-14 object-contain" aria-hidden="true" />
        </button>
        <button
          onClick={() => {
            if (suppressClickRef.current) return
            router.push('/institution/classes')
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-transparent p-0 transition-transform active:scale-95"
          aria-label="班次管理"
        >
          <Image src={floatShift} alt="" width={56} height={56} className="h-14 w-14 object-contain" aria-hidden="true" />
        </button>
      </div>

      {/* Session detail sheet */}
      {activeBlock && (
        <SessionDetailSheet
          session={activeBlock.session}
          dayOfWeek={activeBlock.day}
          onClose={() => setActiveBlock(null)}
          onEdit={() => {
            setActiveBlock(null)
            router.push(`/institution/classes?courseId=${activeBlock.session.courseId}`)
          }}
        />
      )}

      {/* AI schedule modal */}
      {showAI && <AIScheduleModal onClose={() => setShowAI(false)} />}
    </div>
  )
}
