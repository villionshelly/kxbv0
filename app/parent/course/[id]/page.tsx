'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, FileText, Camera, ChevronRight,
  Pencil, Trash2, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, RotateCcw, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { courses, schedule, classRecords, growthPhotos } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type RecordStatus = 'attended' | 'absent' | 'leave' | 'makeup'

const STATUS_CONFIG: Record<RecordStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  attended: { label: '已消课', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  absent:   { label: '未上课', color: 'text-red-500 bg-red-50',    icon: XCircle },
  leave:    { label: '已请假', color: 'text-orange-500 bg-orange-50', icon: AlertCircle },
  makeup:   { label: '调休补课', color: 'text-blue-500 bg-blue-50', icon: RefreshCw },
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const course = courses.find(c => c.id === params.id) || courses[0]

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // local override: recordId -> new status (simulate correction)
  const [corrections, setCorrections] = useState<Record<string, RecordStatus>>({})
  const [correctingId, setCorrectingId] = useState<string | null>(null)

  const courseSchedule = schedule.filter(s => s.courseId === course.id)
  const coursePhotos = growthPhotos.filter(p => p.course === course.name)

  // Build records: merge classRecords + auto-generate self records from past schedule
  const baseRecords = classRecords.filter(r => r.courseId === course.id)

  // For self-accounting past schedule items not already in classRecords → auto "attended"
  const today = new Date().toISOString().slice(0, 10)
  const existingDates = new Set(baseRecords.map(r => r.date))
  const autoRecords = courseSchedule
    .filter(s => s.courseType === 'self' && s.date < today && !existingDates.has(s.date))
    .map(s => ({
      id: `auto_${s.id}`,
      courseId: s.courseId,
      courseName: s.courseName,
      date: s.date,
      startTime: s.startTime,
      deduction: 1,
      source: 'self' as const,
      note: '',
      status: 'attended' as RecordStatus,
      makeupFromId: null,
    }))

  const allRecords = [...baseRecords, ...autoRecords].sort((a, b) => b.date.localeCompare(a.date))

  const getStatus = (rec: typeof allRecords[0]): RecordStatus =>
    (corrections[rec.id] as RecordStatus) ?? (rec.status as RecordStatus)

  const handleCorrect = (id: string, newStatus: RecordStatus) => {
    setCorrections(prev => ({ ...prev, [id]: newStatus }))
    setCorrectingId(null)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(false)
    router.push('/parent/assets')
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">课程详情</h1>
        <button
          onClick={() => router.push(`/parent/add-course?edit=1&id=${course.id}`)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Course hero */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
            style={{ backgroundColor: course.color }}
          >
            {course.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{course.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{course.institution}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '剩余课时', value: course.remainingClasses, color: 'text-primary' },
            { label: '已上课时', value: course.totalClasses - course.remainingClasses, color: 'text-foreground' },
            { label: '单课时价', value: `${course.price}元`, color: 'text-foreground' },
          ].map(item => (
            <div key={item.label} className="text-center p-3 bg-muted/30 rounded-xl">
              <div className={cn('text-2xl font-bold', item.color)}>{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <User className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">授课教师</span>
            <span className="ml-auto font-medium text-sm">{course.teacher}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">上课地点</span>
            <span className="ml-auto font-medium text-sm text-right">{course.institution}</span>
          </div>
        </div>

        {/* Upcoming classes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">近期课程</h3>
            <button className="text-xs text-primary flex items-center gap-0.5">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {courseSchedule.filter(s => s.date >= today).slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary leading-none">
                    {item.date.slice(5, 7)}/{item.date.slice(8, 10)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.startTime}–{item.endTime}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.classroom}</div>
                </div>
                {item.courseType === 'institution' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 shrink-0"
                    onClick={() => router.push(`/parent/leave/${item.id}`)}
                  >
                    请假/调休
                  </Button>
                )}
                {item.courseType === 'self' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 shrink-0"
                    onClick={() => router.push(`/parent/leave/${item.id}?type=self`)}
                  >
                    请假/调休
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Class records */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">消课记录</h3>
          </div>
          {allRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">暂无消课记录</div>
          ) : (
            <div className="space-y-2">
              {allRecords.map(record => {
                const status = getStatus(record)
                const cfg = STATUS_CONFIG[status]
                const Icon = cfg.icon
                const isSelf = record.source === 'self'
                const canCorrect = isSelf && status === 'attended'
                const isLeave = status === 'leave'

                // 仅消课记录（到课/调休补课）可进入反馈详情
                const canViewFeedback = status === 'attended' || status === 'makeup'
                return (
                  <div key={record.id}>
                    <div
                      className={cn('flex items-center gap-3 p-3 bg-muted/20 rounded-xl', canViewFeedback && 'cursor-pointer hover:bg-muted/40 transition-colors')}
                      onClick={canViewFeedback ? () => router.push(`/parent/feedback/${record.id}`) : undefined}
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.color.split(' ')[1])}>
                        <Icon className={cn('w-5 h-5', cfg.color.split(' ')[0])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{record.date}</span>
                          <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', cfg.color)}>
                            {cfg.label}
                          </span>
                          {isSelf && (
                            <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">
                              自主记账
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {record.note || (isLeave ? '课时暂不扣除' : `扣除 ${record.deduction} 课时`)}
                        </div>
                      </div>
                      {canCorrect && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setCorrectingId(correctingId === record.id ? null : record.id) }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0"
                          title="修正记录"
                        >
                          <RotateCcw className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      {canViewFeedback && !canCorrect && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>

                    {/* Correction panel */}
                    {correctingId === record.id && (
                      <div className="mx-2 mt-1 p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <p className="text-xs text-orange-700 mb-2 font-medium">修正为未上课（课时将退还）</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCorrect(record.id, 'absent')}
                            className="flex-1 h-9 bg-orange-500 text-white rounded-lg text-sm font-medium"
                          >
                            确认修正
                          </button>
                          <button
                            onClick={() => setCorrectingId(null)}
                            className="flex-1 h-9 bg-muted text-muted-foreground rounded-lg text-sm"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">课堂相册</h3>
            <button className="text-xs text-primary flex items-center gap-0.5">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {coursePhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {coursePhotos.map(photo => (
                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                  <img src={photo.url} alt={photo.description} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 opacity-30" />
              <span>暂无课堂照片</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm bottom sheet */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-10 safe-area-bottom">
            <h3 className="text-base font-semibold mb-1">确认删除课程</h3>
            <p className="text-sm text-muted-foreground mb-6">
              删除后该课程的课时记录和上课时间将一并移除，确认删除「{course.name}」吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-12 bg-muted text-foreground rounded-xl font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-xl font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
