'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, ChevronDown, Building2, MapPin, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSelectedChild } from '@/hooks/use-selected-child'
import { useParentCourseStore } from '@/lib/parent-course-store'

const courseCategories = ['音乐', '美术', '舞蹈', 'STEM', '体育', '语言', '学科补习', '其他']

const defaultInstitutions = [
  { id: 'self', name: '自主记账', desc: '不绑定机构，自己记录课时' },
  { id: '1', name: '七彩培训中心', desc: '已绑定' },
  { id: '2', name: '小画家美术工作室', desc: '已绑定' },
]

const colors = ['#F87E31', '#0E70C0', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#EF4444']

const weekDayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 },
]

const timeOptions = [
  '07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30','20:00',
]

const durationOptions = [
  { label: '30分', value: 30 },
  { label: '45分', value: 45 },
  { label: '60分', value: 60 },
  { label: '90分', value: 90 },
  { label: '120分', value: 120 },
]

type DaySession = { dayOfWeek: number; time: string; duration: number }

function AddCourseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedChild } = useSelectedChild()
  const { courses, addCourse, updateCourse, updateCourseNotes } = useParentCourseStore()
  const isEdit = searchParams.get('edit') === '1'
  const editId = searchParams.get('id') || ''
  const existingCourse = courses.find(course => course.id === editId)

  const [step, setStep] = useState<'info' | 'schedule' | 'done'>('info')
  const [courseName, setCourseName] = useState(isEdit ? '钢琴启蒙' : '')
  const [category, setCategory] = useState(isEdit ? '音乐' : '')
  const [institution, setInstitution] = useState(isEdit ? '1' : 'self')
  const [teacher, setTeacher] = useState(isEdit ? '李老师' : '')
  const [totalClasses, setTotalClasses] = useState(isEdit ? '48' : '')
  const [price, setPrice] = useState(isEdit ? '7200' : '')
  const [color, setColor] = useState(isEdit ? '#F87E31' : colors[0])
  const [className, setClassName] = useState(isEdit ? '钢琴启蒙班次' : '')
  const [classType, setClassType] = useState('1对1')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false)
  const [hydratedEdit, setHydratedEdit] = useState(false)

  // Per-day sessions
  const [daySessions, setDaySessions] = useState<DaySession[]>(
      isEdit
      ? [
          { dayOfWeek: 2, time: '10:00', duration: 60 },
          { dayOfWeek: 6, time: '10:00', duration: 60 },
        ]
      : []
  )

  const selectedInstitution = defaultInstitutions.find(i => i.id === institution) || (
    existingCourse?.courseType === 'institution'
      ? { id: existingCourse.institutionId || institution, name: existingCourse.institution }
      : undefined
  )
  const isInstitutionCourse = existingCourse?.courseType === 'institution'

  useEffect(() => {
    if (!isEdit || hydratedEdit || !existingCourse) return
    setCourseName(existingCourse.name)
    setCategory(existingCourse.sessions[0]?.type === '机构课程' ? '音乐' : category)
    setInstitution(existingCourse.courseType === 'self' ? 'self' : existingCourse.institutionId || '1')
    setTeacher(existingCourse.teacher)
    setTotalClasses(String(existingCourse.totalClasses))
    setPrice(String(existingCourse.price * existingCourse.totalClasses))
    setColor(existingCourse.color)
    setNotes(existingCourse.notes || '')
    setDaySessions(existingCourse.sessions.map(session => ({
      dayOfWeek: session.dayOfWeek,
      time: session.time,
      duration: session.duration,
    })))
    setClassName(existingCourse.sessions[0]?.className || `${existingCourse.name}班次`)
    setClassType(existingCourse.sessions[0]?.type === '个人安排' ? '1对1' : existingCourse.sessions[0]?.type || '1对1')
    setLocationName(existingCourse.sessions[0]?.locationName || existingCourse.sessions[0]?.classroom || '')
    setAddress(existingCourse.sessions[0]?.address || '')
    setHydratedEdit(true)
  }, [existingCourse, hydratedEdit, isEdit])

  const toggleDay = (val: number) => {
    if (daySessions.find(s => s.dayOfWeek === val)) {
      setDaySessions(prev => prev.filter(s => s.dayOfWeek !== val))
    } else {
      setDaySessions(prev => [...prev, { dayOfWeek: val, time: '10:00', duration: 60 }])
    }
  }

  const updateSession = (day: number, key: keyof DaySession, value: string | number) => {
    setDaySessions(prev => prev.map(s => s.dayOfWeek === day ? { ...s, [key]: value } : s))
  }

  const canProceedStep1 = courseName.trim() && category && totalClasses && price

  const sortedSessions = [...daySessions].sort((a, b) => {
    const order = (value: number) => value === 0 ? 7 : value
    return order(a.dayOfWeek) - order(b.dayOfWeek)
  })

  const handleComplete = () => {
    if (isEdit && isInstitutionCourse && editId) {
      updateCourseNotes(editId, notes.trim())
      setStep('done')
      return
    }

    if (sortedSessions.length === 0) return
    const sessionRules = sortedSessions.map(session => ({
      courseId: editId,
      classSessionId: existingCourse?.classSessionId,
      className: className.trim() || `${courseName.trim()}班次`,
      type: classType,
      teacher: teacher.trim(),
      classroom: locationName.trim(),
      locationName: locationName.trim(),
      address: address.trim(),
      dayOfWeek: session.dayOfWeek,
      time: session.time,
      duration: session.duration,
      source: institution === 'self' ? 'self' as const : 'institution' as const,
    }))
    const payload = {
      childId: existingCourse?.childId || selectedChild.id,
      name: courseName.trim(),
      institution: selectedInstitution?.name || '自主记账',
      teacher: teacher.trim(),
      color,
      totalClasses: Number(totalClasses),
      remainingClasses: existingCourse
        ? Math.max(Number(totalClasses) - Math.max(existingCourse.totalClasses - existingCourse.remainingClasses, 0), 0)
        : Number(totalClasses),
      price: Number(price) / Math.max(Number(totalClasses), 1),
      courseType: institution === 'self' ? 'self' as const : 'institution' as const,
      institutionId: institution === 'self' ? undefined : institution,
      institutionCourseId: existingCourse?.institutionCourseId,
      classSessionId: existingCourse?.classSessionId,
      notes: notes.trim(),
      sessions: sessionRules,
    }
    if (isEdit && editId) updateCourse(editId, payload)
    else addCourse(payload)
    setStep('done')
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => {
            if (step === 'schedule') setStep('info')
            else router.back()
          }}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">{isEdit ? '编辑课程' : '添加课程'}</h1>
        {step !== 'done' && (
          <div className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', step === 'info' ? 'bg-primary' : 'bg-primary/30')} />
            <div className={cn('w-2 h-2 rounded-full', step === 'schedule' ? 'bg-primary' : 'bg-primary/30')} />
          </div>
        )}
      </div>

      {step === 'done' ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{isEdit ? '修改成功' : '课程添加成功'}</h2>
          <p className="text-muted-foreground text-sm mb-8">
            {courseName} 已{isEdit ? '更新到' : '添加到'}{selectedInstitution?.id === 'self' ? '个人课表' : selectedInstitution?.name}
          </p>
          <button
            onClick={() => router.push('/parent/assets')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            查看课时
          </button>
          {!isEdit && (
            <button
              onClick={() => {
                setStep('info')
                setCourseName(''); setCategory(''); setTotalClasses('')
                setPrice(''); setTeacher(''); setDaySessions([])
              }}
              className="w-full h-12 mt-3 bg-muted text-foreground rounded-xl font-medium"
            >
              再添加一门
            </button>
          )}
        </div>
      ) : step === 'info' ? (
        <div className="flex-1 overflow-auto px-4 py-4 space-y-5">
          {/* Color & Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">课程名称</label>
            <div className="flex items-center gap-3">
              <button
                disabled={isInstitutionCourse}
                onClick={() => {
                  const idx = colors.indexOf(color)
                  setColor(colors[(idx + 1) % colors.length])
                }}
                className="w-10 h-10 rounded-xl shrink-0 border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                placeholder="如：钢琴启蒙、英语口语"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                disabled={isInstitutionCourse}
                className="flex-1 h-10 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 ml-0.5">点击色块可切换颜色</p>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">课程分类</label>
            <div className="flex flex-wrap gap-2">
              {courseCategories.map(cat => (
                  <button
                    key={cat}
                    disabled={isInstitutionCourse}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Institution */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">所属机构</label>
            <button
              disabled={isInstitutionCourse}
              onClick={() => setShowInstitutionPicker(!showInstitutionPicker)}
              className="w-full flex items-center justify-between h-11 px-4 bg-muted/40 rounded-xl text-sm"
            >
              <span className={institution ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedInstitution?.name || '选择机构'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {showInstitutionPicker && (
              <div className="mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                {defaultInstitutions.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => { setInstitution(inst.id); setShowInstitutionPicker(false) }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0',
                      institution === inst.id && 'bg-primary/5'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inst.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.desc}</p>
                    </div>
                    {institution === inst.id && <CheckCircle className="w-4 h-4 text-primary" />}
                  </button>
                ))}
                <button
                  onClick={() => setShowInstitutionPicker(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">邀请机构入驻</p>
                </button>
              </div>
            )}
          </div>

          {isInstitutionCourse && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">我的备注（选填）</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="记录接送、练习或其他提醒"
                className="w-full resize-none rounded-xl bg-muted/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* Classes & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">购买课时 *</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="48"
                  value={totalClasses}
                  onChange={e => setTotalClasses(e.target.value)}
                  disabled={isInstitutionCourse}
                  className="w-full h-11 px-4 pr-8 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">总价 *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                <input
                  type="number"
                  placeholder="7200"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  disabled={isInstitutionCourse}
                  className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Per-day schedule */
        <div className="flex-1 overflow-auto px-4 py-4 space-y-5">
          <p className="text-sm text-muted-foreground">
            {isInstitutionCourse ? '以下班次由机构分配，家长端仅可查看' : '设置个人班次，保存后会同步到课表和课程详情'}
          </p>

          <div className="space-y-4 rounded-2xl bg-muted/30 p-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">班次名称 *</label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                disabled={isInstitutionCourse}
                placeholder={`${courseName || '课程'}班次`}
                className="w-full h-11 px-4 bg-background rounded-xl text-sm outline-none disabled:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">班次类型</label>
              <div className="flex gap-2">
                {['1对1', '小班课', '大班课'].map(type => (
                  <button
                    key={type}
                    type="button"
                    disabled={isInstitutionCourse}
                    onClick={() => setClassType(type)}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-xs font-medium disabled:opacity-70',
                      classType === type ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">老师姓名（选填）</label>
              <input
                type="text"
                placeholder="如：李老师"
                value={teacher}
                onChange={e => setTeacher(e.target.value)}
                disabled={isInstitutionCourse}
                className="w-full h-11 px-4 bg-background rounded-xl text-sm outline-none disabled:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground block mb-2">上课地点</span>
                <input
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  disabled={isInstitutionCourse}
                  placeholder="如：琴房 / 线上"
                  className="w-full h-11 px-3 bg-background rounded-xl text-sm outline-none disabled:text-muted-foreground"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground block mb-2">详细地址</span>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  disabled={isInstitutionCourse}
                  placeholder="选填"
                  className="w-full h-11 px-3 bg-background rounded-xl text-sm outline-none disabled:text-muted-foreground"
                />
              </label>
            </div>
            {isInstitutionCourse && (
              <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700">
                机构课程的班次、老师、教室和地址由机构维护，如需调整请联系机构。
              </div>
            )}
          </div>

          {/* Day picker */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">选择上课日期</label>
            <div className="flex gap-1.5">
              {weekDayOptions.map(d => {
                const selected = daySessions.find(s => s.dayOfWeek === d.value)
                return (
                  <button
                    key={d.value}
                    disabled={isInstitutionCourse}
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      'flex-1 h-10 rounded-xl text-xs font-medium transition-colors',
                      selected ? 'text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                    style={selected ? { backgroundColor: color } : {}}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Per-day time config */}
          {sortedSessions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                各天上课时间 <span className="text-primary text-xs">（每天可独立设置）</span>
              </label>
              <div className="space-y-2">
                {sortedSessions.map(s => (
                  <div key={s.dayOfWeek} className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    {/* Day label */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {weekDayOptions.find(d => d.value === s.dayOfWeek)?.label}
                    </div>
                    {/* Time select */}
                      <select
                        value={s.time}
                        disabled={isInstitutionCourse}
                      onChange={e => updateSession(s.dayOfWeek, 'time', e.target.value)}
                      className="flex-1 h-9 px-3 bg-background rounded-lg text-sm outline-none border border-border"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {/* Duration select */}
                      <select
                        value={s.duration}
                        disabled={isInstitutionCourse}
                      onChange={e => updateSession(s.dayOfWeek, 'duration', Number(e.target.value))}
                      className="w-20 h-9 px-2 bg-background rounded-lg text-sm outline-none border border-border"
                    >
                      {durationOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <button disabled={isInstitutionCourse} onClick={() => toggleDay(s.dayOfWeek)} className="p-1.5 hover:bg-red-50 rounded-lg shrink-0 disabled:opacity-40">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {sortedSessions.length > 0 && (
            <div
              className="p-4 rounded-xl border-l-4"
              style={{ borderColor: color, backgroundColor: `${color}12` }}
            >
              <p className="font-semibold text-sm mb-2" style={{ color }}>{courseName}</p>
              {sortedSessions.map(s => (
                <p key={s.dayOfWeek} className="text-xs text-muted-foreground leading-5">
                  {weekDayOptions.find(d => d.value === s.dayOfWeek)?.label}{'  '}
                  {s.time} · {s.duration}分钟
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Button */}
      {step !== 'done' && (
        <div className="px-4 py-4 border-t border-border bg-background">
          {step === 'info' ? (
            <button
              onClick={() => setStep('schedule')}
              disabled={!canProceedStep1}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-opacity"
            >
              下一步，设置上课时间
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={sortedSessions.length === 0}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40"
            >
              {isEdit ? '保存修改' : '完成添加'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AddCoursePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AddCourseContent />
    </Suspense>
  )
}
