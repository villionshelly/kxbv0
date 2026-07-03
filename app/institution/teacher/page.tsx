'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut, CheckCircle, XCircle, Clock, ChevronRight,
  Users, CalendarDays, BookOpen, CheckSquare, Home,
  Camera, Video, Sparkles, FileText, RefreshCw, UserCheck,
  MessageCircle, ChevronDown, Plus, AlertCircle, Building2, QrCode, UserX,
} from 'lucide-react'
import { teachers, classSessions, students, teacherCheckIns, leaveRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { FeedbackEditor } from '@/components/feedback-editor'
import { useFeedbackStore, saveRecordFeedback } from '@/lib/feedback-store'

const ME = teachers[0] // 模拟：李雪（管理员兼教师）登录
const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const today = new Date()
const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1

type CheckInStatus = 'attended' | 'absent'
type Tab = 'home' | 'classes' | 'students' | 'mine'

interface CheckInState {
  [studentId: string]: CheckInStatus
}

// —— 取消班次弹窗 ——
function CancelSessionSheet({ session, onClose }: { session: typeof classSessions[0]; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const handleSubmit = () => { if (reason) setDone(true) }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8">
        {done ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-amber-500" />
            </div>
            <p className="font-semibold">班次已取消</p>
            <p className="text-sm text-muted-foreground">已通知所有学员，课时不扣除</p>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">关闭</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">取消班次</h3>
              <button onClick={onClose} className="text-muted-foreground text-sm">取消</button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{session.name} · 共{session.studentIds.length}人</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">取消原因</label>
                <input type="text" placeholder="如：老师临时有事、天气原因等" value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none" />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                取消后将通知所有学员，本节课所有人不扣课时
              </div>
              <button onClick={handleSubmit} disabled={!reason}
                className="w-full h-12 bg-amber-500 text-white rounded-xl font-medium disabled:opacity-40">
                确认取消班次
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TeacherHomePage() {
  const router = useRouter()

  const mySessions = classSessions.filter(cs => cs.teacherId === ME.id)
  const todaySessions = mySessions.filter(cs => cs.sessions.some(s => s.dayOfWeek === todayDow))
  const myStudentIds = [...new Set(mySessions.flatMap(cs => cs.studentIds))]
  const myStudents = students.filter(s => myStudentIds.includes(s.id))
  const recentCheckIns = teacherCheckIns.filter(c => c.teacherId === ME.id)

  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [activeCheckInSession, setActiveCheckInSession] = useState<string | null>(null)
  const [checkInStates, setCheckInStates] = useState<{ [sessionId: string]: CheckInState }>({})
  const [savedSessions, setSavedSessions] = useState<string[]>([])
  const [cancelSession, setCancelSession] = useState<typeof classSessions[0] | null>(null)
  const [activeFeedbackCheckIn, setActiveFeedbackCheckIn] = useState<typeof teacherCheckIns[0] | null>(null)
  const recordFeedbacks = useFeedbackStore()

  const openCheckIn = (sessionId: string) => {
    const session = mySessions.find(s => s.id === sessionId)!
    if (!checkInStates[sessionId]) {
      const initial: CheckInState = {}
      // 家长请假的学生显示为"已请假"但不参与核销操作，其他默认为到课
      session.studentIds.forEach(sid => {
        initial[sid] = 'attended'
      })
      setCheckInStates(prev => ({ ...prev, [sessionId]: initial }))
    }
    setActiveCheckInSession(prev => prev === sessionId ? null : sessionId)
  }

  const setStudentStatus = (sessionId: string, studentId: string, status: CheckInStatus) => {
    const session = mySessions.find(s => s.id === sessionId)!
    const currentStates = checkInStates[sessionId] || {}
    
    if (status === 'attended') {
      // 标记一人到课核销 -> 完成这节课，其他人标记缺勤
      const newStates: CheckInState = {}
      session.studentIds.forEach(sid => {
        // 已请假的学生保持请假状态
        const hasLeave = leaveRecords.some(l => l.sessionId === sessionId && l.studentId === sid && l.dayOfWeek === todayDow)
        if (hasLeave) {
          newStates[sid] = 'absent' // 请假视为缺勤（不扣课时）
        } else {
          newStates[sid] = sid === studentId ? 'attended' : 'absent'
        }
      })
      setCheckInStates(prev => ({ ...prev, [sessionId]: newStates }))
    } else {
      // 标记一人缺勤 -> 其他默认到课
      const newStates: CheckInState = {}
      session.studentIds.forEach(sid => {
        const hasLeave = leaveRecords.some(l => l.sessionId === sessionId && l.studentId === sid && l.dayOfWeek === todayDow)
        if (hasLeave) {
          newStates[sid] = 'absent'
        } else if (sid === studentId) {
          newStates[sid] = 'absent'
        } else {
          newStates[sid] = currentStates[sid] === 'absent' ? 'absent' : 'attended'
        }
      })
      setCheckInStates(prev => ({ ...prev, [sessionId]: newStates }))
    }
  }

  const saveCheckIn = (sessionId: string) => {
    setSavedSessions(prev => [...prev, sessionId])
    setActiveCheckInSession(null)
  }

  // —— HOME TAB ——
  const HomeTab = () => (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="safe-area-top px-4 pb-4 bg-gradient-to-br from-primary/8 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ME.avatar} alt={ME.name} className="w-10 h-10 rounded-full bg-muted ring-2 ring-primary/20" />
            <div>
              <p className="font-semibold">{ME.name}</p>
              <p className="text-xs text-muted-foreground">{ME.title} · 七彩培训中心</p>
            </div>
          </div>
          <button onClick={() => router.push('/institution/login')} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: '我的班次', value: mySessions.length, color: 'text-primary' },
            { label: '我的学员', value: myStudents.length, color: 'text-secondary' },
            { label: '今日课程', value: todaySessions.length, color: 'text-foreground' },
          ].map(stat => (
            <div key={stat.label} className="bg-background rounded-xl p-3 shadow-sm text-center">
              <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Quick Actions */}
        <div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Camera, label: '拍照点名', color: 'bg-secondary/10 text-secondary', onClick: () => router.push('/institution/teacher/photo-attendance') },
              { icon: Video, label: '精彩瞬间', color: 'bg-primary/10 text-primary', onClick: () => router.push('/institution/teacher/highlights') },
              { icon: Sparkles, label: 'AI助理', color: 'bg-amber-500/10 text-amber-600', onClick: () => router.push('/institution/teacher/assistant') },
              { icon: FileText, label: '成长报告', color: 'bg-purple-500/10 text-purple-600', onClick: () => router.push('/institution/teacher/growth-report') },
            ].map(action => (
              <button key={action.label} onClick={action.onClick}
                className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors"
              >
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-muted-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's check-in */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-secondary" />
            今日核销
            <span className="text-xs text-muted-foreground font-normal">{weekDayNames[todayDow]}</span>
          </h2>
          {todaySessions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm bg-muted/30 rounded-2xl">今日暂无课程</div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map(session => {
                const todaySlot = session.sessions.find(s => s.dayOfWeek === todayDow)!
                const isSaved = savedSessions.includes(session.id)
                const isOpen = activeCheckInSession === session.id
                const states = checkInStates[session.id] || {}
                const attendedCount = Object.values(states).filter(v => v === 'attended').length
                const leaveCount = leaveRecords.filter(l => l.sessionId === session.id && l.dayOfWeek === todayDow).length

                return (
                  <div key={session.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${session.color}20` }}>
                            <BookOpen className="w-5 h-5" style={{ color: session.color }} />
                          </div>
                          <div>
                            <p className="font-semibold">{session.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {todaySlot.time} · {todaySlot.duration}分钟 · {session.classroom}
                            </p>
                          </div>
                        </div>
                        {isSaved ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {attendedCount}/{session.studentIds.length}已核销
                          </span>
                        ) : (
                          <button onClick={() => openCheckIn(session.id)}
                            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">
                            {isOpen ? '收起' : '开始核销'}
                          </button>
                        )}
                      </div>

                      {/* Stats row */}
                      {!isOpen && !isSaved && (
                        <div className="flex gap-3 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            共{session.studentIds.length}人
                          </div>
                          {leaveCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {leaveCount}人请假
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-blue-500">
                            <UserCheck className="w-3.5 h-3.5" />
                            预计{session.studentIds.length - leaveCount}人到课
                          </div>
                        </div>
                      )}

                      {/* Check-in list */}
                      {isOpen && !isSaved && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs text-muted-foreground mb-2">点击「到课」标记核销，点击「缺勤」标记缺席。已请假学员自动显示。</p>
                          {session.studentIds.map(sid => {
                            const student = students.find(s => s.id === sid)
                            if (!student) return null
                            const status = states[sid] || 'attended'
                            const hasLeave = leaveRecords.some(l => l.sessionId === session.id && l.studentId === sid && l.dayOfWeek === todayDow)
                            return (
                              <div key={sid} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full bg-muted" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{student.name}</p>
                                    {hasLeave && (
                                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-medium">已请假</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{student.parentName}</p>
                                </div>
                                {!hasLeave && (
                                  <div className="flex gap-1">
                                    {(['attended', 'absent'] as CheckInStatus[]).map(s => (
                                      <button key={s} onClick={() => setStudentStatus(session.id, sid, s)}
                                        className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                          status === s
                                            ? s === 'attended' ? 'bg-green-500 text-white'
                                              : 'bg-destructive text-white'
                                            : 'bg-muted text-muted-foreground'
                                        )}>
                                        {s === 'attended' ? '到课' : '缺勤'}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => setCancelSession(session)}
                              className="flex-1 h-10 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-200">
                              取消班次
                            </button>
                            <button onClick={() => saveCheckIn(session.id)}
                              className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm">
                              确认核销
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent records */}
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            近期核销记录
          </h2>
          <div className="space-y-2">
            {recentCheckIns.slice(0, 4).map(record => {
              const fb = recordFeedbacks[record.id]
              return (
                <div key={record.id} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      record.status === 'attended' ? 'bg-green-50' : record.status === 'absent' ? 'bg-red-50' : 'bg-amber-50')}>
                      {record.status === 'attended' ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : record.status === 'absent' ? <XCircle className="w-4 h-4 text-red-400" />
                        : <Clock className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{record.studentName} · {record.sessionName}</p>
                      <p className="text-xs text-muted-foreground">{record.date} {record.startTime}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                      record.status === 'attended' ? 'bg-green-50 text-green-600'
                        : record.status === 'absent' ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600')}>
                      {record.status === 'attended' ? '已到课' : record.status === 'absent' ? '缺勤' : '请假'}
                    </span>
                  </div>
                  {/* 仅到课记录可添加反馈 */}
                  {record.status === 'attended' && (
                    fb ? (
                      <div className="mt-2 bg-background rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex-1">{fb.text}</p>
                          <button
                            onClick={() => setActiveFeedbackCheckIn(record)}
                            className="text-xs text-secondary font-medium shrink-0 ml-2"
                          >
                            编辑
                          </button>
                        </div>
                        {fb.images?.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {fb.images.map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url || "/placeholder.svg"} alt={`课堂照片 ${i + 1}`} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveFeedbackCheckIn(record)}
                        className="mt-2 w-full h-9 bg-secondary/10 text-secondary rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        添加课程反馈
                      </button>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  // —— CLASSES TAB — 7-column week calendar + list toggle ——
  const ClassesTab = () => {
    const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
    const [currentWeek, setCurrentWeek] = useState(0)
    const [detailSession, setDetailSession] = useState<{ session: typeof classSessions[0]; day: number } | null>(null)

    const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
    const SLOT_H = 52

    function timeToOffset(time: string) {
      const idx = TIME_SLOTS.indexOf(time)
      return idx >= 0 ? idx * SLOT_H : 0
    }
    function durationToHeight(minutes: number) {
      return (minutes / 60) * SLOT_H
    }

    // all week events for my sessions
    const weekSchedule = mySessions.flatMap(cs =>
      cs.sessions.map(s => ({
        day: s.dayOfWeek,
        time: s.time,
        duration: s.duration,
        session: cs,
        color: cs.color,
      }))
    )

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-0 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-semibold">我的课表</h1>
            <div className="flex bg-muted/50 rounded-lg p-0.5">
              {(['week', 'list'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    viewMode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                  )}
                >{m === 'week' ? '周视图' : '列表'}</button>
              ))}
            </div>
          </div>
          {/* Week navigator */}
          <div className="flex items-center gap-1 pb-3">
            <button onClick={() => setCurrentWeek(w => w - 1)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4 text-muted-foreground rotate-90" />
            </button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {currentWeek === 0 ? '本周' : currentWeek > 0 ? `${currentWeek}周后` : `${-currentWeek}周前`}
            </span>
            <button onClick={() => setCurrentWeek(w => w + 1)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {viewMode === 'week' ? (
            <div className="px-1">
              {/* Day header row */}
              <div className="flex sticky top-0 bg-background z-10 border-b border-border">
                <div className="w-11 shrink-0" />
                {weekDayNames.map((day, idx) => (
                  <div key={day} className="flex-1 text-center py-2">
                    <span className={cn(
                      'text-[11px] font-medium',
                      idx === todayDow ? 'text-primary font-bold' : idx >= 5 ? 'text-secondary' : 'text-muted-foreground'
                    )}>{day}</span>
                    {idx === todayDow && currentWeek === 0 && (
                      <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />
                    )}
                  </div>
                ))}
              </div>

              {/* Time grid */}
              <div className="relative">
                {TIME_SLOTS.map(time => (
                  <div key={time} className="flex h-[52px] border-b border-border/40">
                    <div className="w-11 shrink-0 text-[10px] text-muted-foreground pt-1 text-center leading-tight">
                      {time}
                    </div>
                    {weekDayNames.map((_, dayIdx) => (
                      <div key={dayIdx} className="flex-1 border-l border-border/30 relative">
                        {weekSchedule
                          .filter(s => s.day === dayIdx && s.time === time)
                          .map((item, sIdx) => {
                            const leaves = leaveRecords.filter(l => l.sessionId === item.session.id && l.dayOfWeek === dayIdx)
                            const presentCount = item.session.studentIds.length - leaves.length
                            const h = durationToHeight(item.duration)
                            return (
                              <button
                                key={sIdx}
                                onClick={() => setDetailSession({ session: item.session, day: dayIdx })}
                                className="absolute inset-x-0.5 rounded-lg text-white overflow-hidden text-left active:opacity-80"
                                style={{
                                  backgroundColor: item.color,
                                  height: `${h - 3}px`,
                                  top: '2px',
                                }}
                              >
                                <div className="px-1 pt-0.5">
                                  <p className="text-[9px] font-semibold leading-tight truncate">{item.session.name}</p>
                                  {h >= 40 && (
                                    <div className="flex items-center gap-0.5 mt-0.5">
                                      <Users className="w-2 h-2 opacity-80 shrink-0" />
                                      <span className="text-[8px] opacity-90">
                                        {presentCount}出勤
                                        {leaves.length > 0 && <span className="opacity-70"> ·{leaves.length}假</span>}
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
            // List view
            <div className="px-4 py-3 space-y-3">
              {mySessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">暂无班次</p>
                </div>
              ) : mySessions.map(cs => {
                const leaves = leaveRecords.filter(l => l.sessionId === cs.id)
                return (
                  <button
                    key={cs.id}
                    onClick={() => setDetailSession({ session: cs, day: cs.sessions[0]?.dayOfWeek ?? 0 })}
                    className="w-full p-4 bg-muted/30 rounded-2xl text-left active:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cs.color }} />
                        <div>
                          <h4 className="font-medium text-sm">{cs.name}</h4>
                          <p className="text-xs text-muted-foreground">{cs.courseName}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        cs.type === '1对1' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                      )}>{cs.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cs.studentIds.length}/{cs.maxStudents}人
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {cs.sessions.map(s => weekDayNames[s.dayOfWeek] + ' ' + s.time).join(' / ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-green-600">{cs.studentIds.length - leaves.length}</p>
                        <p className="text-[10px] text-green-600/70">预计出勤</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-bold text-amber-600">{leaves.length}</p>
                        <p className="text-[10px] text-amber-600/70">已请假</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Session detail sheet */}
        {detailSession && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setDetailSession(null)}>
            <div className="bg-background w-full rounded-t-2xl px-4 pt-4 pb-8 max-h-[75vh] overflow-auto"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${detailSession.session.color}22` }}>
                  <BookOpen className="w-5 h-5" style={{ color: detailSession.session.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{detailSession.session.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {detailSession.session.sessions.find(s => s.dayOfWeek === detailSession.day)?.time}
                    {' · '}{detailSession.session.classroom}
                  </p>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-green-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-green-600">
                    {detailSession.session.studentIds.length - leaveRecords.filter(l => l.sessionId === detailSession.session.id && l.dayOfWeek === detailSession.day).length}
                  </p>
                  <p className="text-[10px] text-green-600/70">预计出勤</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-600">
                    {leaveRecords.filter(l => l.sessionId === detailSession.session.id && l.dayOfWeek === detailSession.day).length}
                  </p>
                  <p className="text-[10px] text-amber-600/70">已请假</p>
                </div>
              </div>
              {/* Student list */}
              <p className="text-xs text-muted-foreground mb-2">班级学员 ({detailSession.session.studentIds.length}人)</p>
              <div className="space-y-2 mb-4">
                {students.filter(s => detailSession.session.studentIds.includes(s.id)).map(s => {
                  const onLeave = leaveRecords.some(l => l.sessionId === detailSession.session.id && l.studentId === s.id && l.dayOfWeek === detailSession.day)
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-xl">
                      <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.remainingClasses} 课时剩余</p>
                      </div>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full',
                        onLeave ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      )}>{onLeave ? '请假中' : '预计出勤'}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCancelSession(detailSession.session); setDetailSession(null) }}
                  className="flex-1 h-10 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-200">
                  取消班次
                </button>
                <button onClick={() => { router.push('/institution/teacher/photo-attendance'); setDetailSession(null) }}
                  className="flex-1 h-10 bg-secondary/10 text-secondary rounded-xl text-sm font-medium border border-secondary/20">
                  拍照点名
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // —— STUDENTS TAB ——
  const StudentsTab = () => (
    <div className="flex-1 overflow-auto px-4 py-4">
      <h1 className="text-base font-semibold mb-4">我的学员 <span className="text-muted-foreground font-normal text-sm">({myStudents.length}人)</span></h1>
      <div className="space-y-3">
        {myStudents.map(student => {
          const studentSessions = mySessions.filter(cs => cs.studentIds.includes(student.id))
          return (
            <div key={student.id} className="p-4 bg-background border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={student.avatar} alt={student.name} className="w-11 h-11 rounded-full bg-muted" />
                <div className="flex-1">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.parentName}</p>
                </div>
                <div className="text-right">
                  <p className={cn('text-base font-bold', student.remainingClasses <= 4 ? 'text-destructive' : 'text-foreground')}>
                    {student.remainingClasses}
                  </p>
                  <p className="text-xs text-muted-foreground">剩余课时</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {studentSessions.map(cs => (
                  <span key={cs.id} className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${cs.color}20`, color: cs.color }}>
                    {cs.name}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push('/institution/teacher/growth-report')}
                  className="flex-1 h-8 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium border border-purple-100">
                  成长报告
                </button>
                <button onClick={() => router.push('/institution/teacher/highlights')}
                  className="flex-1 h-8 bg-primary/5 text-primary rounded-lg text-xs font-medium border border-primary/10">
                  精彩瞬间
                </button>
                <button onClick={() => router.push('/institution/teacher/assistant')}
                  className="flex-1 h-8 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium border border-amber-100">
                  AI助理
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // —— MINE TAB ——
  const MineTab = () => {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(ME.name)
    const [phone, setPhone] = useState(ME.phone)
    const [title, setTitle] = useState(ME.title)
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState(['儿童钢琴', '音乐启蒙', '考级辅导'])
    const [saved, setSaved] = useState(false)
    const [showOrgSheet, setShowOrgSheet] = useState(false)
    const [showJoinSheet, setShowJoinSheet] = useState(false)
    const [showUnbindConfirm, setShowUnbindConfirm] = useState<typeof boundOrgs[0] | null>(null)
    const [joinCode, setJoinCode] = useState('')
    const [joinSuccess, setJoinSuccess] = useState(false)
    const [unbindSuccess, setUnbindSuccess] = useState(false)

    // 模拟已绑定的机构
    const [boundOrgs, setBoundOrgs] = useState([
      { id: '1', name: '七彩培训中心', role: 'admin' as const, isDefault: true },
    ])

    const handleSave = () => {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2000)
    }
    const addTag = () => {
      const t = tagInput.trim()
      if (t && !tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
    const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t))
    
    const handleJoinOrg = () => {
      if (joinCode.trim()) {
        setJoinSuccess(true)
        setTimeout(() => {
          setShowJoinSheet(false)
          setJoinSuccess(false)
          setJoinCode('')
        }, 2000)
      }
    }

    const handleUnbindOrg = (org: typeof boundOrgs[0]) => {
      setBoundOrgs(prev => prev.filter(o => o.id !== org.id))
      setUnbindSuccess(true)
      setShowUnbindConfirm(null)
      setTimeout(() => {
        setUnbindSuccess(false)
        setShowOrgSheet(false)
      }, 2000)
    }

    return (
      <div className="flex-1 overflow-auto">
        {/* Profile header */}
        <div className="px-4 pt-6 pb-5 bg-gradient-to-br from-primary/8 to-secondary/5">
          <div className="flex items-center gap-4">
            <img src={ME.avatar} alt={ME.name} className="w-16 h-16 rounded-full bg-muted ring-2 ring-primary/20" />
            <div className="flex-1">
              <p className="text-lg font-bold">{name}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                {ME.role === 'admin' ? '管理员' : '教师'}
              </span>
            </div>
            <button
              onClick={() => setEditing(e => !e)}
              className="p-2 rounded-xl bg-background/80 hover:bg-background transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {saved && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 text-green-700 text-xs rounded-xl px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5" />
              个人信息已保存
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Current organization */}
          <button
            onClick={() => setShowOrgSheet(true)}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-muted-foreground">当前机构</p>
              <p className="font-medium">{boundOrgs[0]?.name || '未绑定机构'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Edit form */}
          {editing && (
            <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">编辑个人信息</p>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">姓名</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-background rounded-xl text-sm outline-none border border-border focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">手机号</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-background rounded-xl text-sm outline-none border border-border focus:border-primary transition-colors"
                  placeholder="更换手机号"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">职称/标签</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-background rounded-xl text-sm outline-none border border-border focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">教师标签</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-primary/60 hover:text-primary">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="添加标签，按回车确认"
                    className="flex-1 h-9 px-3 bg-background rounded-xl text-xs outline-none border border-border focus:border-primary transition-colors"
                  />
                  <button onClick={addTag} className="px-3 h-9 bg-primary/10 text-primary rounded-xl text-xs font-medium">
                    添加
                  </button>
                </div>
              </div>
              <button onClick={handleSave}
                className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-medium text-sm">
                保存修改
              </button>
            </div>
          )}

          {/* Tags display when not editing */}
          {!editing && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">教师标签</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Function shortcuts */}
          <div className="space-y-2">
            {[
              { icon: Camera, label: '拍照点名', desc: 'AI识别自动核销', href: '/institution/teacher/photo-attendance', color: 'text-secondary', bg: 'bg-secondary/10' },
              { icon: Video, label: '精彩瞬间', desc: 'AI生成课堂精彩视频', href: '/institution/teacher/highlights', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Sparkles, label: 'AI助理', desc: '智能回复、内容生成', href: '/institution/teacher/assistant', color: 'text-amber-600', bg: 'bg-amber-500/10' },
              { icon: FileText, label: 'AI成长报告', desc: '为学员生成月度报告', href: '/institution/teacher/growth-report', color: 'text-purple-600', bg: 'bg-purple-500/10' },
              { icon: CheckSquare, label: '消课记录', desc: '查看历史核销记录', href: '/institution/teacher', color: 'text-green-600', bg: 'bg-green-500/10' },
            ].map(item => (
              <button key={item.label} onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                  <item.icon className={cn('w-5 h-5', item.color)} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          <button onClick={() => router.push('/institution/login')}
            className="w-full flex items-center justify-center gap-2 p-3 text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出登录</span>
          </button>
        </div>

        {/* Organization switch sheet */}
        {showOrgSheet && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowOrgSheet(false)}>
            <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-semibold mb-4">我的机构</h3>

              {unbindSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">已成功解除绑定</span>
                </div>
              )}

              {/* Bound orgs */}
              <div className="space-y-2 mb-4">
                {boundOrgs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">您还未绑定任何机构</p>
                    <p className="text-xs mt-1">请输入邀请码加入机构</p>
                  </div>
                ) : (
                  boundOrgs.map(org => (
                    <div
                      key={org.id}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        org.isDefault ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {org.role === 'admin' ? '管理员' : '教师'}
                          </p>
                        </div>
                        {org.isDefault && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                            当前
                          </span>
                        )}
                      </div>
                      {/* Unbind button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowUnbindConfirm(org) }}
                        className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        解除绑定
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add new org */}
              <button
                onClick={() => { setShowOrgSheet(false); setShowJoinSheet(true) }}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">加入新机构</span>
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                您可以同时加入多个机构，在此切换当前工作机构
              </p>
            </div>
          </div>
        )}

        {/* Unbind Confirm Modal */}
        {showUnbindConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={() => setShowUnbindConfirm(null)}>
            <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8" onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-semibold mb-1">确认解除绑定</h3>
              <p className="text-sm text-muted-foreground mb-4">
                确定要解除与「{showUnbindConfirm.name}」的绑定关系吗？
              </p>
              <div className="bg-amber-50 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>解绑后您将无法登录该机构、无法查看机构数据</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>未结算的账单将无法结算，请先与机构确认</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>解绑后可通过邀请码重新加入该机构</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUnbindConfirm(null)} className="flex-1 h-12 bg-muted rounded-xl font-medium">取消</button>
                <button onClick={() => handleUnbindOrg(showUnbindConfirm)} className="flex-1 h-12 bg-gray-700 text-white rounded-xl font-medium">确认解绑</button>
              </div>
            </div>
          </div>
        )}

        {/* Join new org sheet */}
        {showJoinSheet && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowJoinSheet(false)}>
            <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8" onClick={e => e.stopPropagation()}>
              {joinSuccess ? (
                <div className="py-8 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-semibold">加入成功</p>
                  <p className="text-sm text-muted-foreground">您已成功加入新机构</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">加入新机构</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    输入机构提供的邀请码，或通过机构分享的链接加入
                  </p>

                  <div className="mb-4">
                    <label className="text-xs text-muted-foreground block mb-2">邀请码</label>
                    <input
                      type="text"
                      placeholder="请输入机构邀请码"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full h-12 px-4 bg-muted/40 rounded-xl text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    onClick={handleJoinOrg}
                    disabled={!joinCode.trim()}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40"
                  >
                    确认加入
                  </button>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">或</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <button
                    onClick={() => {/* 扫码功能 */}}
                    className="w-full flex items-center justify-center gap-2 mt-4 p-4 bg-muted/30 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-sm font-medium">扫描邀请二维码</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const tabConfig = [
    { id: 'home' as Tab, label: '���页', icon: Home },
    { id: 'classes' as Tab, label: '班级', icon: CalendarDays },
    { id: 'students' as Tab, label: '学员', icon: Users },
    { id: 'mine' as Tab, label: '我的', icon: UserCheck },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tab Content */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'classes' && <ClassesTab />}
      {activeTab === 'students' && <StudentsTab />}
      {activeTab === 'mine' && <MineTab />}

      {/* Bottom Tab Bar */}
      <nav className="shrink-0 border-t border-border bg-background safe-area-bottom">
        <div className="flex">
          {tabConfig.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground')}>
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sheets */}
      {cancelSession && <CancelSessionSheet session={cancelSession} onClose={() => setCancelSession(null)} />}

      {/* 课程反馈编辑器（与机构端一致） */}
      {activeFeedbackCheckIn && (
        <FeedbackEditor
          studentName={activeFeedbackCheckIn.studentName}
          initialText={recordFeedbacks[activeFeedbackCheckIn.id]?.text ?? ''}
          initialImages={recordFeedbacks[activeFeedbackCheckIn.id]?.images ?? []}
          onSend={(text, images) => {
            saveRecordFeedback(activeFeedbackCheckIn.id, text, images)
            setActiveFeedbackCheckIn(null)
          }}
          onClose={() => setActiveFeedbackCheckIn(null)}
        />
      )}
    </div>
  )
}
