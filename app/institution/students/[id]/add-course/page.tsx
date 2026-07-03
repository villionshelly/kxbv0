'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, ChevronRight, Users, Clock, X, ShoppingCart, BookOpen, Plus, Wallet } from 'lucide-react'
import { students, courseCatalog, classSessions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const weekDayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function AddCoursePage() {
  const params = useParams()
  const router = useRouter()
  const student = students.find(s => s.id === params.id) || students[0]

  // step: 'course'（选课程）| 'session'（选班次）
  const [step, setStep] = useState<'course' | 'session'>('course')
  const [selectedCourse, setSelectedCourse] = useState<typeof courseCatalog[0] | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [showPurchase, setShowPurchase] = useState<typeof courseCatalog[0] | null>(null)
  const [purchaseClasses, setPurchaseClasses] = useState('12')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [done, setDone] = useState(false)

  // 判断课程是否已购买
  const isPurchased = (courseName: string) => student.courses.includes(courseName)

  // 已购买课程排前面
  const sortedCourses = [...courseCatalog].sort((a, b) => {
    const ap = isPurchased(a.name) ? 0 : 1
    const bp = isPurchased(b.name) ? 0 : 1
    return ap - bp
  })

  // 进入班次选择
  const goToSessions = (course: typeof courseCatalog[0]) => {
    setSelectedCourse(course)
    setSelectedSession(null)
    setStep('session')
  }

  // 该课程下的班次
  const courseSessions = selectedCourse
    ? classSessions.filter(s => s.courseId === selectedCourse.id)
    : []

  // 打开快速购买
  const openPurchase = (course: typeof courseCatalog[0]) => {
    setShowPurchase(course)
    setPurchaseClasses('12')
    setPurchaseAmount(String(course.price * 12))
  }

  // 完成快速购买后进入班次选择
  const handlePurchaseConfirm = () => {
    const course = showPurchase!
    setShowPurchase(null)
    // 模拟：购买后该课程视为已购买
    student.courses.push(course.name)
    goToSessions(course)
  }

  // 确认加入班级
  const handleJoinSession = () => {
    setDone(true)
  }

  // 完成页
  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">添加成功</h1>
        <p className="text-muted-foreground text-center mb-1">
          已将 {student.name} 加入
        </p>
        <p className="text-sm font-medium mb-8">
          {classSessions.find(s => s.id === selectedSession)?.name}
        </p>
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => router.push(`/institution/students/${params.id}`)}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            返回学员详情
          </button>
          <button
            onClick={() => { setDone(false); setStep('course'); setSelectedCourse(null); setSelectedSession(null) }}
            className="w-full h-12 bg-muted text-foreground rounded-xl font-medium"
          >
            继续添加其他课程
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => step === 'session' ? setStep('course') : router.back()}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">
            {step === 'course' ? '选择课程' : '选择班次'}
          </h1>
          <p className="text-xs text-muted-foreground">为 {student.name} 添加课程</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium',
            step === 'course' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
            {step === 'course' ? '1' : <CheckCircle className="w-3.5 h-3.5" />}
          </span>
          <span className={cn('text-xs', step === 'course' ? 'text-foreground font-medium' : 'text-muted-foreground')}>选择课程</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-1.5">
          <span className={cn('w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium',
            step === 'session' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>2</span>
          <span className={cn('text-xs', step === 'session' ? 'text-foreground font-medium' : 'text-muted-foreground')}>选择班次</span>
        </div>
      </div>

      {/* Step 1: Course selection */}
      {step === 'course' && (
        <div className="p-4 space-y-4">
          {/* 已购买课程 */}
          {sortedCourses.some(c => isPurchased(c.name)) && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                已购买课程 · 可直接加入班次
              </p>
              <div className="space-y-2">
                {sortedCourses.filter(c => isPurchased(c.name)).map(course => (
                  <button
                    key={course.id}
                    onClick={() => goToSessions(course)}
                    className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-left hover:bg-green-100 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${course.color}20` }}>
                      <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{course.name}</p>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium">已购买</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.category} · ¥{course.price}/课时 · 剩余{student.remainingClasses}课时
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 未购买课程 */}
          {sortedCourses.some(c => !isPurchased(c.name)) && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                其他课程 · 需先购买记账
              </p>
              <div className="space-y-2">
                {sortedCourses.filter(c => !isPurchased(c.name)).map(course => (
                  <div
                    key={course.id}
                    className="w-full flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl"
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${course.color}20` }}>
                      <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.category} · ¥{course.price}/课时
                      </p>
                    </div>
                    <button
                      onClick={() => openPurchase(course)}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      购买
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Session selection */}
      {step === 'session' && selectedCourse && (
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedCourse.color}20` }}>
              <BookOpen className="w-5 h-5" style={{ color: selectedCourse.color }} />
            </div>
            <div>
              <p className="font-medium text-sm">{selectedCourse.name}</p>
              <p className="text-xs text-muted-foreground">请选择要加入的班次</p>
            </div>
          </div>

          {courseSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">该课程暂无班次</p>
              <button
                onClick={() => router.push('/institution/schedule?create=1')}
                className="mt-3 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                去创建班次
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {courseSessions.map(session => {
                const isFull = session.studentIds.length >= session.maxStudents
                const alreadyIn = session.studentIds.includes(student.id)
                const schedule = session.sessions.map(s => `${weekDayLabels[s.dayOfWeek]} ${s.time}`).join('、')
                return (
                  <button
                    key={session.id}
                    onClick={() => !isFull && !alreadyIn && setSelectedSession(session.id)}
                    disabled={isFull || alreadyIn}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      selectedSession === session.id ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/30',
                      (isFull || alreadyIn) && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{session.name}</p>
                      {selectedSession === session.id && <CheckCircle className="w-4 h-4 text-primary" />}
                      {alreadyIn && <span className="text-xs text-green-600">已在班</span>}
                      {isFull && !alreadyIn && <span className="text-xs text-destructive">已满</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {schedule}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session.studentIds.length}/{session.maxStudents}人
                      </span>
                      <span>{session.classroom}</span>
                      <span>{session.teacher}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Confirm button */}
          {courseSessions.length > 0 && (
            <button
              onClick={handleJoinSession}
              disabled={!selectedSession}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium mt-4 disabled:opacity-40"
            >
              确认加入班级
            </button>
          )}
        </div>
      )}

      {/* Quick purchase modal */}
      {showPurchase && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">快速购买记账</h3>
              <button onClick={() => setShowPurchase(null)} className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${showPurchase.color}20` }}>
                <BookOpen className="w-5 h-5" style={{ color: showPurchase.color }} />
              </div>
              <div>
                <p className="font-medium text-sm">{showPurchase.name}</p>
                <p className="text-xs text-muted-foreground">{showPurchase.category} · ¥{showPurchase.price}/课时</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">购买课时数 *</label>
                <div className="flex gap-2">
                  {['12', '24', '48'].map(n => (
                    <button
                      key={n}
                      onClick={() => { setPurchaseClasses(n); setPurchaseAmount(String(showPurchase.price * Number(n))) }}
                      className={cn('flex-1 h-11 rounded-xl text-sm font-medium border-2 transition-all',
                        purchaseClasses === n ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-muted/40')}
                    >
                      {n}课时
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={purchaseClasses}
                  onChange={e => { setPurchaseClasses(e.target.value); setPurchaseAmount(String(showPurchase.price * Number(e.target.value || 0))) }}
                  placeholder="自定义课时数"
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none mt-2 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">实收金额（元）*</label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={e => setPurchaseAmount(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">可修改金额与课时，仅可选择已有课程</p>
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">购买 {purchaseClasses || 0} 课时</span>
                </div>
                <span className="text-lg font-bold text-green-600">¥{Number(purchaseAmount || 0).toLocaleString()}</span>
              </div>

              <button
                onClick={handlePurchaseConfirm}
                disabled={!purchaseClasses || !purchaseAmount}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40"
              >
                确认购买并选择班次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
