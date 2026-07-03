'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, RefreshCw, Clock, MapPin, User, Camera, MessageSquare } from 'lucide-react'
import { classRecords, growthPhotos, courseCatalog, courses } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function FeedbackDetailPage() {
  const params = useParams()
  const router = useRouter()

  const record = classRecords.find(r => r.id === params.id) || classRecords[0]
  const isMakeup = record.status === 'makeup'

  // 关联教师信息
  const catalog = courseCatalog.find(c => c.name === record.courseName)
  const course = courses.find(c => c.name === record.courseName)
  const teacherName = catalog?.teacher || course?.teacher || '任课老师'
  const institution = course?.institution || '七彩培训中心'

  // 课堂照片（按课程匹配）
  const photos = growthPhotos.filter(p => p.course === record.courseName)

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-muted rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">课程反馈详情</h1>
      </div>

      <div className="p-4 space-y-5">
        {/* Status hero */}
        <div className="flex items-center gap-4">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
            isMakeup ? 'bg-blue-50' : 'bg-green-50')}>
            {isMakeup ? <RefreshCw className="w-7 h-7 text-blue-500" /> : <CheckCircle className="w-7 h-7 text-green-500" />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{record.courseName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium',
                isMakeup ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600')}>
                {isMakeup ? '调休补课' : '已消课'}
              </span>
              <span className="text-xs text-muted-foreground">扣除 {record.deduction} 课时</span>
            </div>
          </div>
        </div>

        {/* Class info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">上课时间</span>
            <span className="ml-auto font-medium text-sm">{record.date} {record.startTime}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <User className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">任课老师</span>
            <span className="ml-auto font-medium text-sm">{teacherName}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-muted-foreground">上课地点</span>
            <span className="ml-auto font-medium text-sm text-right">{institution}</span>
          </div>
        </div>

        {/* Teacher feedback */}
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-secondary" />
            老师课程反馈
          </h3>
          {record.note ? (
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-secondary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-secondary">{teacherName.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium">{teacherName}</span>
                <span className="ml-auto text-xs text-muted-foreground">{record.date}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{record.note}</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span>老师暂未填写本节课反馈</span>
            </div>
          )}
        </div>

        {/* Class photos */}
        <div>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            课堂照片
          </h3>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {photos.map(photo => (
                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url || "/placeholder.svg"} alt={photo.description} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 opacity-30" />
              <span>本节课暂无课堂照片</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
