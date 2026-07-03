'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, RefreshCw, MessageSquare, ChevronRight, Camera } from 'lucide-react'
import { classRecords, growthPhotos } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ParentFeedbackListPage() {
  const router = useRouter()

  // 学习课时：到课 + 调休补课的消课记录
  const lessonRecords = classRecords
    .filter(r => r.status === 'attended' || r.status === 'makeup')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen warm-bg pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 warm-header px-4 py-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-card/60 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold flex-1">学习课时</h1>
      </div>

      {/* Summary */}
      <div className="p-4">
        <div className="p-5 bg-card rounded-3xl card-warm text-center">
          <p className="text-4xl font-bold text-primary">{lessonRecords.length}</p>
          <p className="text-xs text-muted-foreground mt-1">累计学习课时（每节课记 1 课时）</p>
        </div>
      </div>

      {/* Records */}
      <div className="px-4">
        <h2 className="text-sm font-semibold mb-3">消课与反馈记录</h2>
        <div className="space-y-2">
          {lessonRecords.map(record => {
            const isMakeup = record.status === 'makeup'
            const hasPhotos = growthPhotos.some(p => p.course === record.courseName)
            return (
              <button
                key={record.id}
                onClick={() => router.push(`/parent/feedback/${record.id}`)}
                className="w-full flex items-center gap-3 p-3.5 bg-card rounded-2xl card-warm text-left hover:bg-primary/5 transition-colors"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isMakeup ? 'bg-blue-50' : 'bg-green-50')}>
                  {isMakeup ? <RefreshCw className="w-5 h-5 text-blue-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{record.courseName}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
                      isMakeup ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600')}>
                      {isMakeup ? '调休补课' : '已消课'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{record.date}</span>
                    {record.note && (
                      <span className="text-xs text-primary flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" />
                        有反馈
                      </span>
                    )}
                    {hasPhotos && (
                      <span className="text-xs text-primary flex items-center gap-0.5">
                        <Camera className="w-3 h-3" />
                        有照片
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
