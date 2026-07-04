'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Video, Sparkles, Upload, CheckCircle, Play, Share2, Camera } from 'lucide-react'
import { classSessions, students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ME_ID = '1'
const mySessions = classSessions.filter(cs => cs.teacherId === ME_ID)

type GenStep = 'idle' | 'uploading' | 'generating' | 'done'

const sampleHighlights = [
  { id: '1', session: '钢琴启蒙A班', date: '2026-04-01', cover: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80', duration: '0:32', views: 12 },
  { id: '2', session: '钢琴进阶班', date: '2026-03-28', cover: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400&q=80', duration: '0:45', views: 8 },
]

export default function TeacherHighlightsPage() {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState(mySessions[0]?.id ?? '')
  const [genStep, setGenStep] = useState<GenStep>('idle')
  const [uploadCount, setUploadCount] = useState(0)
  const [progress, setProgress] = useState(0)

  const session = mySessions.find(cs => cs.id === selectedSession)

  const handleGenerate = () => {
    setGenStep('uploading')
    setProgress(0)
    const steps = [
      { step: 'uploading' as GenStep, duration: 1200, endProgress: 40 },
      { step: 'generating' as GenStep, duration: 2000, endProgress: 95 },
      { step: 'done' as GenStep, duration: 600, endProgress: 100 },
    ]
    let delay = 0
    steps.forEach(({ step, duration, endProgress }) => {
      delay += duration
      setTimeout(() => { setGenStep(step); setProgress(endProgress) }, delay)
    })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="safe-area-top px-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/institution/teacher')}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold">精彩瞬间</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-5">
        {/* Generate card */}
        <div className="bg-gradient-to-br from-primary/8 to-secondary/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-secondary" />
            <p className="font-semibold text-sm">AI生成精彩视频</p>
          </div>
          <p className="text-xs text-muted-foreground mb-4">上传课堂照片，AI自动剪辑成精彩短视频发送给家长</p>

          {/* Session picker */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1.5">选择班次</p>
            <div className="flex flex-wrap gap-2">
              {mySessions.map(cs => (
                <button key={cs.id} onClick={() => setSelectedSession(cs.id)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border-2',
                    selectedSession === cs.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent bg-background/70 text-muted-foreground')}>
                  {cs.name}
                </button>
              ))}
            </div>
          </div>

          {genStep === 'idle' && (
            <div className="space-y-3">
              {/* Upload zone */}
              <button
                onClick={() => setUploadCount(c => c + 3)}
                className="w-full h-24 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/5 transition-all"
              >
                <Camera className="w-7 h-7 text-primary/40" />
                <p className="text-xs text-muted-foreground">点击添加照片</p>
              </button>
              {uploadCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  已选 {uploadCount} 张照片
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={uploadCount === 0}
                className="w-full h-11 institution-btn-primary rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                开始AI生成
              </button>
            </div>
          )}

          {(genStep === 'uploading' || genStep === 'generating') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{genStep === 'uploading' ? '正在上传照片...' : 'AI剪辑中...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {genStep === 'uploading' ? '上传照片中，请稍候...' : 'AI正在识别精彩镜头并配乐...'}
              </p>
            </div>
          )}

          {genStep === 'done' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                视频生成完成！
              </div>
              <div className="aspect-video bg-muted rounded-xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80"
                  alt="video preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">0:38</div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h-10 institution-btn-primary rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
                  <Share2 className="w-4 h-4" />发送给家长
                </button>
                <button onClick={() => { setGenStep('idle'); setUploadCount(0); setProgress(0) }}
                  className="flex-1 h-10 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
                  重新生成
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <p className="text-sm font-semibold mb-3">历史精彩视频</p>
          <div className="space-y-3">
            {sampleHighlights.map(h => (
              <div key={h.id} className="flex gap-3 p-3 bg-muted/30 rounded-2xl">
                <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={h.cover} alt={h.session} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">{h.duration}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{h.session}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.date}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.views} 次查看</p>
                  <button className="mt-1.5 flex items-center gap-1 text-xs text-primary font-medium">
                    <Share2 className="w-3 h-3" />重新发送
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
