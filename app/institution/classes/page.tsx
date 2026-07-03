'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Users, Clock, Pencil, Trash2, X, CheckCircle, ChevronDown } from 'lucide-react'
import { classSessions, courseCatalog, students, teachers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Session = { dayOfWeek: number; time: string; duration: number }
type ClassSession = typeof classSessions[0]

const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const timeOptions = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
const durationOptions = [30, 45, 60, 90, 120]
const typeOptions = ['1对1', '小班课', '大班课']


// Per-day-time session editor
function SessionEditor({
  sessions,
  onChange,
}: {
  sessions: Session[]
  onChange: (s: Session[]) => void
}) {
  const addDay = (day: number) => {
    if (sessions.find(s => s.dayOfWeek === day)) return
    onChange([...sessions, { dayOfWeek: day, time: '10:00', duration: 60 }])
  }
  const removeDay = (day: number) => onChange(sessions.filter(s => s.dayOfWeek !== day))
  const updateSession = (day: number, key: keyof Session, value: string | number) => {
    onChange(sessions.map(s => s.dayOfWeek === day ? { ...s, [key]: value } : s))
  }
  const sorted = [...sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-2">上课日期与时间 * <span className="text-primary">（每天可独立设置时间）</span></label>
      {/* Day selector */}
      <div className="flex gap-1.5 mb-3">
        {weekDayNames.map((d, i) => {
          const selected = sessions.find(s => s.dayOfWeek === i)
          return (
            <button
              key={d}
              onClick={() => selected ? removeDay(i) : addDay(i)}
              className={cn(
                'flex-1 h-9 rounded-lg text-xs font-medium transition-colors',
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >{d}</button>
          )
        })}
      </div>
      {/* Per-day time config */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map(s => (
            <div key={s.dayOfWeek} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-xl">
              <span className="text-xs font-medium w-8 text-center text-primary">{weekDayNames[s.dayOfWeek]}</span>
              <select
                value={s.time}
                onChange={e => updateSession(s.dayOfWeek, 'time', e.target.value)}
                className="flex-1 h-8 px-2 bg-background rounded-lg text-xs outline-none border border-border"
              >
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={s.duration}
                onChange={e => updateSession(s.dayOfWeek, 'duration', Number(e.target.value))}
                className="w-20 h-8 px-2 bg-background rounded-lg text-xs outline-none border border-border"
              >
                {durationOptions.map(d => <option key={d} value={d}>{d}分钟</option>)}
              </select>
              <button onClick={() => removeDay(s.dayOfWeek)} className="p-1 hover:bg-red-50 rounded-lg">
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ClassFormModal({
  initial,
  courseId,
  onClose,
  onSave,
}: {
  initial?: Partial<ClassSession>
  courseId?: string
  onClose: () => void
  onSave: (data: Partial<ClassSession>) => void
}) {
  const defaultCourse = courseCatalog.find(c => c.id === (initial?.courseId ?? courseId))
  const [selectedCourseId, setSelectedCourseId] = useState(initial?.courseId ?? courseId ?? 'c1')
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? '小班课')
  const [teacher, setTeacher] = useState(initial?.teacher ?? defaultCourse?.teacher ?? '')
  const [classroom, setClassroom] = useState(initial?.classroom ?? '')
  const [maxStudents, setMaxStudents] = useState(String(initial?.maxStudents ?? 6))
  const [sessions, setSessions] = useState<Session[]>(initial?.sessions ?? [])
  const [selectedStudents, setSelectedStudents] = useState<string[]>(initial?.studentIds ?? [])
  const [showCoursePicker, setShowCoursePicker] = useState(false)
  const [done, setDone] = useState(false)

  const selectedCourse = courseCatalog.find(c => c.id === selectedCourseId)
  const canSave = name.trim() && teacher && sessions.length > 0

  const toggleStudent = (id: string) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleSave = () => {
    setDone(true)
    setTimeout(() => {
      onSave({
        courseId: selectedCourseId,
        courseName: selectedCourse?.name ?? '',
        name, type, teacher, classroom,
        maxStudents: Number(maxStudents),
        sessions, studentIds: selectedStudents,
        color: selectedCourse?.color ?? '#F87E31',
        status: 'active',
      })
    }, 1200)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold">{initial?.id ? '编辑班次' : '新建班次'}</h2>
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-bold mb-1">保存成功</h3>
          <p className="text-sm text-muted-foreground">{name} 已更新</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto px-4 py-4 space-y-5">
            {/* Course selector */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">所属课程 *</label>
              <button
                onClick={() => setShowCoursePicker(!showCoursePicker)}
                className="w-full flex items-center justify-between h-11 px-4 bg-muted/40 rounded-xl text-sm"
              >
                <div className="flex items-center gap-2">
                  {selectedCourse && (
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCourse.color }} />
                  )}
                  <span>{selectedCourse?.name ?? '选择课程'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {showCoursePicker && (
                <div className="mt-1 border border-border rounded-xl overflow-hidden shadow-md bg-background">
                  {courseCatalog.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCourseId(c.id); setTeacher(c.teacher); setShowCoursePicker(false) }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 border-b border-border/50 last:border-0 text-left',
                        selectedCourseId === c.id && 'bg-primary/5'
                      )}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-sm font-medium flex-1">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.teacher}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class name */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">班次名称 *</label>
              <input
                type="text"
                placeholder={`如：${selectedCourse?.name ?? ''}A班`}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">班级类型</label>
              <div className="flex gap-2">
                {typeOptions.map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); if (t === '1对1') setMaxStudents('1') }}
                    className={cn(
                      'flex-1 h-10 rounded-xl text-sm font-medium transition-colors',
                      type === t ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                    )}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Teacher */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">授课老师 *</label>
              <div className="flex gap-2">
                {teachers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTeacher(t.name)}
                    className={cn(
                      'flex-1 flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all',
                      teacher === t.name ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40'
                    )}
                  >
                    <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full bg-muted" />
                    <div className="text-left">
                      <p className="text-xs font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Classroom - manual input */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">上课教室</label>
              <input
                type="text"
                placeholder="如：1号琴房、2楼舞蹈室"
                value={classroom}
                onChange={e => setClassroom(e.target.value)}
                className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Sessions - per day time */}
            <SessionEditor sessions={sessions} onChange={setSessions} />

            {/* Max students */}
            {type !== '1对1' && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">最大人数</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={e => setMaxStudents(e.target.value)}
                  min="2" max="30"
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none"
                />
              </div>
            )}

            {/* Add students */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">
                添加学员（选填，{selectedStudents.length}人已选）
              </label>
              <div className="space-y-2">
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleStudent(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                      selectedStudents.includes(s.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.parentName}</p>
                    </div>
                    {selectedStudents.includes(s.id) && <CheckCircle className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-border bg-background">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40"
            >
              保存班次
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function InstitutionClassesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterCourseId = searchParams.get('courseId')

  const [sessions, setSessions] = useState(classSessions)
  const [showForm, setShowForm] = useState(false)
  const [editSession, setEditSession] = useState<Partial<ClassSession> | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState(filterCourseId ?? 'all')

  const filtered = courseFilter === 'all' ? sessions : sessions.filter(s => s.courseId === courseFilter)

  const handleSave = (data: Partial<ClassSession>) => {
    if (editSession?.id) {
      setSessions(prev => prev.map(s => s.id === editSession.id ? { ...s, ...data } : s))
    } else {
      setSessions(prev => [...prev, {
        ...data,
        id: `cs${Date.now()}`,
        studentCount: (data.studentIds ?? []).length,
        teacherId: teachers.find(t => t.name === data.teacher)?.id ?? '1',
      } as ClassSession])
    }
    setTimeout(() => { setShowForm(false); setEditSession(undefined) }, 1400)
  }

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    setDeleteId(null)
  }

  const filterCourse = courseCatalog.find(c => c.id === courseFilter)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">
          {filterCourse ? `${filterCourse.name} - 班次管理` : '班次管理'}
        </h1>
        <button
          onClick={() => { setEditSession(undefined); setShowForm(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新建班次
        </button>
      </div>

      {/* Course filter tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border shrink-0">
        <button
          onClick={() => setCourseFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0',
            courseFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
          )}
        >全部</button>
        {courseCatalog.map(c => (
          <button
            key={c.id}
            onClick={() => setCourseFilter(c.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5',
              courseFilter === c.id ? 'text-white' : 'bg-muted/50 text-muted-foreground'
            )}
            style={courseFilter === c.id ? { backgroundColor: c.color } : {}}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">暂无班次，点击右上角新建</p>
          </div>
        ) : filtered.map(cs => {
          const course = courseCatalog.find(c => c.id === cs.courseId)
          const enrolledStudents = students.filter(s => cs.studentIds.includes(s.id))
          return (
            <div key={cs.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-2 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: cs.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{cs.name}</h3>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      cs.type === '1对1' ? 'bg-primary/10 text-primary' :
                        cs.type === '小班课' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'
                    )}>{cs.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{course?.name} · {cs.teacher}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditSession(cs); setShowForm(true) }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteId(cs.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Sessions schedule */}
              <div className="px-4 pb-3 space-y-1.5">
                {cs.sessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">{weekDayNames[s.dayOfWeek]}</span>
                    <span className="text-muted-foreground">{s.time}</span>
                    <span className="text-muted-foreground">· {s.duration}分钟</span>
                    {cs.classroom && <span className="ml-auto text-muted-foreground">{cs.classroom}</span>}
                  </div>
                ))}
              </div>

              {/* Students */}
              <div className="border-t border-border/50 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cs.studentIds.length}/{cs.maxStudents} 人
                  </span>
                  <button
                    onClick={() => { setEditSession(cs); setShowForm(true) }}
                    className="text-xs text-primary"
                  >
                    + 添加学员
                  </button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {enrolledStudents.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-full">
                      <img src={s.avatar} alt={s.name} className="w-4 h-4 rounded-full bg-muted" />
                      <span className="text-xs">{s.name}</span>
                    </div>
                  ))}
                  {cs.studentIds.length === 0 && (
                    <span className="text-xs text-muted-foreground">暂无学员</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8 safe-area-bottom">
            <h3 className="text-base font-semibold mb-1">确认删除班次</h3>
            <p className="text-sm text-muted-foreground mb-6">删除后该班次的排课和学员关联将会解除，确认删除吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-12 bg-muted text-foreground rounded-xl font-medium">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-xl font-medium">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Class form modal */}
      {showForm && (
        <ClassFormModal
          initial={editSession}
          courseId={filterCourseId ?? undefined}
          onClose={() => { setShowForm(false); setEditSession(undefined) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default function InstitutionClassesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <InstitutionClassesContent />
    </Suspense>
  )
}
