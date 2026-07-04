'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ChevronRight, Users, BookOpen, Pencil, Trash2, X, CheckCircle } from 'lucide-react'
import { courseCatalog, classSessions, teachers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Course = typeof courseCatalog[0]

const categories = ['全部', '音乐', '美术', '舞蹈', 'STEM', '体育', '语言', '其他']
const categoryColors: Record<string, string> = {
  音乐: '#F87E31', 美术: '#EC4899', 舞蹈: '#8B5CF6',
  STEM: '#0E70C0', 体育: '#10B981', 语言: '#F59E0B', 其他: '#6B7280',
}
const durationOptions = [30, 45, 60, 90, 120]

function CourseFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Partial<Course>
  onClose: () => void
  onSave: (data: Partial<Course>) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '音乐')
  const [color, setColor] = useState(initial?.color ?? '#F87E31')
  const [teacher, setTeacher] = useState(initial?.teacher ?? '')
  const [totalPrice, setTotalPrice] = useState(String(initial?.price ? initial.price * 48 : ''))
  const [totalClasses, setTotalClasses] = useState(String(initial?.price ? 48 : ''))
  const [duration, setDuration] = useState(initial?.duration ?? 60)
  const [customDuration, setCustomDuration] = useState('')
  const [useCustomDuration, setUseCustomDuration] = useState(false)
  const [desc, setDesc] = useState(initial?.desc ?? '')
  const [done, setDone] = useState(false)

  // 计算单价
  const unitPrice = totalPrice && totalClasses && Number(totalClasses) > 0
    ? Math.round(Number(totalPrice) / Number(totalClasses))
    : 0

  const effectiveDuration = useCustomDuration && customDuration ? Number(customDuration) : duration

  const canSave = name.trim() && category && teacher && totalPrice && totalClasses && effectiveDuration > 0

  const handleSave = () => {
    setDone(true)
    setTimeout(() => {
      onSave({ name, category, color, teacher, price: unitPrice, duration: effectiveDuration, desc })
    }, 1200)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold">{initial?.id ? '编辑课程' : '新建课程'}</h2>
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
            {/* Name + color */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">课程名称 *</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const colors = Object.values(categoryColors)
                    setColor(colors[(colors.indexOf(color) + 1) % colors.length])
                  }}
                  className="w-10 h-10 rounded-xl shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="text"
                  placeholder="如：钢琴启蒙"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 h-10 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-0.5">点击色块切换颜色</p>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">课程分类 *</label>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== '全部').map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setColor(categoryColors[cat] ?? '#6B7280') }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm transition-colors',
                      category === cat ? 'institution-btn-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >{cat}</button>
                ))}
              </div>
            </div>

            {/* Teacher */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">主教老师 *</label>
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
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price + Classes + Duration */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">课程总价 *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                <input
                  type="number"
                  placeholder="如：7200"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">课时数量 *</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="48"
                    value={totalClasses}
                    onChange={e => setTotalClasses(e.target.value)}
                    className="w-full h-11 px-4 pr-10 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">标准课时长 *</label>
                {!useCustomDuration ? (
                  <select
                    value={duration}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setUseCustomDuration(true)
                      } else {
                        setDuration(Number(e.target.value))
                      }
                    }}
                    className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none"
                  >
                    {durationOptions.map(d => <option key={d} value={d}>{d}分钟</option>)}
                    <option value="custom">自定义</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="输入分钟数"
                      value={customDuration}
                      onChange={e => setCustomDuration(e.target.value)}
                      className="w-full h-11 px-4 pr-12 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => { setUseCustomDuration(false); setCustomDuration('') }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary"
                    >
                      标准
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Calculated unit price display */}
            {unitPrice > 0 && (
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">计算单价</span>
                  <span className="text-lg font-bold text-green-600">¥{unitPrice}/课时</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  总价 ¥{Number(totalPrice).toLocaleString()} ÷ {totalClasses}课时 = ¥{unitPrice}/课时
                </p>
              </div>
            )}

            {/* Desc */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">课程简介（选填）</label>
              <textarea
                placeholder="描述课程适合人群、教学目标等"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>

          <div className="px-4 py-4 border-t border-border bg-background">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full h-12 institution-btn-primary rounded-xl font-medium disabled:opacity-40"
            >
              保存课程
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function InstitutionCoursesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('全部')
  const [courses, setCourses] = useState(courseCatalog)
  const [showForm, setShowForm] = useState(false)
  const [editCourse, setEditCourse] = useState<Partial<Course> | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = filter === '全部' ? courses : courses.filter(c => c.category === filter)

  const handleSave = (data: Partial<Course>) => {
    if (editCourse?.id) {
      setCourses(prev => prev.map(c => c.id === editCourse.id ? { ...c, ...data } : c))
    } else {
      setCourses(prev => [...prev, { ...data, id: `c${Date.now()}`, classCount: 0, studentCount: 0 } as typeof courseCatalog[0]])
    }
    setTimeout(() => { setShowForm(false); setEditCourse(undefined) }, 1400)
  }

  const handleDelete = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    setDeleteId(null)
  }

  // Sessions for a course
  const sessionsForCourse = (courseId: string) =>
    classSessions.filter(cs => cs.courseId === courseId)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">课程管理</h1>
        <button
          onClick={() => { setEditCourse(undefined); setShowForm(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 institution-btn-primary rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          新建课程
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0',
              filter === cat ? 'institution-btn-primary' : 'bg-muted/50 text-muted-foreground'
            )}
          >{cat}</button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 flex gap-4 bg-muted/20 border-b border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{filtered.length}</p>
          <p className="text-[10px] text-muted-foreground">课程数</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{filtered.reduce((s, c) => s + c.classCount, 0)}</p>
          <p className="text-[10px] text-muted-foreground">班次数</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{filtered.reduce((s, c) => s + c.studentCount, 0)}</p>
          <p className="text-[10px] text-muted-foreground">在读学员</p>
        </div>
      </div>

      {/* Course list */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">暂无课程，点击右上角新建</p>
          </div>
        ) : (
          filtered.map(course => {
            const sessions = sessionsForCourse(course.id)
            return (
              <div key={course.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Course header */}
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{course.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {course.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{course.desc}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditCourse(course); setShowForm(true) }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteId(course.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-0 border-t border-border/50 divide-x divide-border/50">
                  <div className="py-2.5 text-center">
                    <p className="text-base font-bold" style={{ color: course.color }}>{course.studentCount}</p>
                    <p className="text-[10px] text-muted-foreground">学员</p>
                  </div>
                  <div className="py-2.5 text-center">
                    <p className="text-base font-bold text-foreground">{course.classCount}</p>
                    <p className="text-[10px] text-muted-foreground">班次</p>
                  </div>
                  <div className="py-2.5 text-center">
                    <p className="text-base font-bold text-foreground">¥{course.price}</p>
                    <p className="text-[10px] text-muted-foreground">单课时</p>
                  </div>
                </div>

                {/* Sessions preview */}
                {sessions.length > 0 && (
                  <div className="border-t border-border/50 px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-muted-foreground">班次安排</span>
                      <button
                        onClick={() => router.push(`/institution/classes?courseId=${course.id}`)}
                        className="text-[11px] text-primary flex items-center gap-0.5"
                      >
                        管理班次 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-foreground font-medium">{s.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {s.sessions.map(ss => ['周一','周二','周三','周四','周五','周六','周日'][ss.dayOfWeek] + ' ' + ss.time).join(' / ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Goto classes */}
                <button
                  onClick={() => router.push(`/institution/classes?courseId=${course.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border/50 text-xs text-secondary font-medium hover:bg-secondary/5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  查看班次与学员
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8 safe-area-bottom">
            <h3 className="text-base font-semibold mb-1">确认删除</h3>
            <p className="text-sm text-muted-foreground mb-6">删除后该课程及其班次记录将无法恢复，确认删除吗？</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-12 bg-muted text-foreground rounded-xl font-medium">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-xl font-medium">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Course form modal */}
      {showForm && (
        <CourseFormModal
          initial={editCourse}
          onClose={() => { setShowForm(false); setEditCourse(undefined) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
