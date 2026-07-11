'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, CheckCircle, XCircle, RefreshCw, Zap, Users } from 'lucide-react'
import { classSessions, students, leaveRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { TeacherPageShell } from '@/components/teacher-page-shell'

const ME_ID = '1'
const todayDow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
const mySessions = classSessions.filter(cs => cs.teacherId === ME_ID)
const todaySessions = mySessions.filter(cs => cs.sessions.some(s => s.dayOfWeek === todayDow))

type AttendStatus = 'attended' | 'absent' | 'leave'

export default function TeacherPhotoAttendancePage() {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState(todaySessions[0]?.id ?? mySessions[0]?.id ?? null)
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, AttendStatus>>({})
  const [saved, setSaved] = useState(false)

  const session = mySessions.find(cs => cs.id === selectedSession)

  const handleScan = () => {
    setScanning(true)
    setScanDone(false)
    setTimeout(() => {
      // Simulate AI auto-detection: all attended except those on leave
      if (session) {
        const auto: Record<string, AttendStatus> = {}
        session.studentIds.forEach(sid => {
          const onLeave = leaveRecords.some(l => l.sessionId === session.id && l.studentId === sid && l.dayOfWeek === todayDow)
          auto[sid] = onLeave ? 'leave' : 'attended'
        })
        setStatuses(auto)
      }
      setScanning(false)
      setScanDone(true)
    }, 2200)
  }

  const handleSave = () => setSaved(true)

  const sessionStudents = session ? students.filter(s => session.studentIds.includes(s.id)) : []
  const attendedCount = Object.values(statuses).filter(v => v === 'attended').length
  const absentCount = Object.values(statuses).filter(v => v === 'absent').length
  const leaveCount = Object.values(statuses).filter(v => v === 'leave').length

  if (saved) {
    return (
      <TeacherPageShell className="flex h-full flex-col" variant="tool">
        <header className="hidden safe-area-top px-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/institution/teacher')} className="p-2 -ml-2 hover:bg-muted rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="font-semibold">拍照点名</p>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold">点名完成</p>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.name} · 共{sessionStudents.length}人
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center"><p className="text-xl font-bold text-green-600">{attendedCount}</p><p className="text-muted-foreground">到课</p></div>
            <div className="text-center"><p className="text-xl font-bold text-amber-600">{leaveCount}</p><p className="text-muted-foreground">请假</p></div>
            <div className="text-center"><p className="text-xl font-bold text-red-500">{absentCount}</p><p className="text-muted-foreground">缺勤</p></div>
          </div>
          <button onClick={() => router.push('/institution/teacher')}
            className="mt-4 px-8 h-12 institution-btn-primary rounded-2xl font-medium">
            返回首页
          </button>
        </div>
      </TeacherPageShell>
    )
  }

  return (
    <TeacherPageShell className="flex h-full flex-col" variant="tool">
      <header className="hidden safe-area-top px-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/institution/teacher')} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="font-semibold flex-1">拍照点名</p>
          {scanDone && (
            <span className="text-xs text-secondary font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />AI已识别
            </span>
          )}
        </div>
      </header>

      <div className="teacher-subpage-content flex-1 overflow-auto">
        {/* Session picker */}
        <div className="teacher-card p-3">
          <p className="text-xs text-muted-foreground mb-2">选择班次</p>
          <div className="flex gap-2 flex-wrap">
            {mySessions.map(cs => (
              <button key={cs.id} onClick={() => { setSelectedSession(cs.id); setScanDone(false); setStatuses({}) }}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2',
                  selectedSession === cs.id
                    ? 'border-secondary text-secondary bg-secondary/5'
                    : 'border-transparent bg-muted/40 text-muted-foreground')}>
                {cs.name}
              </button>
            ))}
          </div>
        </div>

        {/* Camera area */}
        <div className="teacher-card mt-4 aspect-[4/3] overflow-hidden bg-blue-50/60 relative flex flex-col items-center justify-center">
          {scanning ? (
            <div className="flex flex-col items-center gap-3 text-center px-8">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium">AI识别中...</p>
              <p className="text-xs text-muted-foreground">正在匹配学员面部信息</p>
            </div>
          ) : scanDone ? (
            <div className="flex flex-col items-center gap-2 text-center px-8">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <p className="text-sm font-medium text-green-700">识别完成</p>
              <p className="text-xs text-muted-foreground">已识别 {attendedCount}/{sessionStudents.length} 位学员</p>
            </div>
          ) : (
            <>
              <Camera className="w-16 h-16 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mt-2">点击下方按钮启动AI点名</p>
              <p className="text-xs text-muted-foreground/60 mt-1">将摄像头对准全班学员</p>
            </>
          )}
          {/* Corner guides */}
          {!scanning && !scanDone && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br" />
            </>
          )}
        </div>

        {/* Scan button */}
        <div className="mt-4">
          <button
            onClick={handleScan}
            disabled={scanning || !session}
            className={cn(
              'w-full h-12 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all',
              scanning ? 'bg-muted text-muted-foreground' : 'institution-btn-primary'
            )}
          >
            {scanDone ? (
              <><RefreshCw className="w-4 h-4" />重新识别</>
            ) : (
              <><Camera className="w-4 h-4" />启动AI点名</>
            )}
          </button>
        </div>

        {/* Student list with statuses */}
        {session && (
          <div className="mt-5 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">学员出勤情况</p>
              {scanDone && <span className="text-xs text-muted-foreground ml-auto">可手动修改</span>}
            </div>
            <div className="space-y-2">
              {sessionStudents.map(s => {
                const status = statuses[s.id]
                return (
                <div key={s.id} className="teacher-soft-card flex items-center gap-3 p-3 rounded-2xl">
                    <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.parentName}</p>
                    </div>
                    <div className="flex gap-1">
                      {(['attended', 'absent', 'leave'] as AttendStatus[]).map(st => (
                        <button key={st}
                          onClick={() => setStatuses(prev => ({ ...prev, [s.id]: st }))}
                          disabled={!scanDone}
                          className={cn('px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                            status === st
                              ? st === 'attended' ? 'bg-green-500 text-white'
                                : st === 'absent' ? 'bg-destructive text-white'
                                : 'bg-amber-400 text-white'
                              : 'bg-muted text-muted-foreground disabled:opacity-30'
                          )}>
                          {st === 'attended' ? '到课' : st === 'absent' ? '缺勤' : '请假'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      {scanDone && (
        <div className="border-t border-blue-100 bg-white/90 px-4 py-4 safe-area-bottom">
          <button onClick={handleSave}
            className="w-full h-12 institution-btn-primary rounded-2xl font-medium">
            确认提交点名（{attendedCount}人到课）
          </button>
        </div>
      )}
    </TeacherPageShell>
  )
}
