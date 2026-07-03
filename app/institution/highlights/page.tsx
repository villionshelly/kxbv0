'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Video, Upload, X, Play, Sparkles, Send, CheckCircle, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { todayScheduleB, students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function HighlightsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'generating' | 'preview' | 'sending' | 'done'>('upload')
  const [selectedClass, setSelectedClass] = useState<typeof todayScheduleB[0] | null>(todayScheduleB[0])
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    id: string
    type: 'image' | 'video'
    url: string
  }>>([])
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['1', '2', '4'])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const isVideo = file.type.startsWith('video/')
          setUploadedMedia(prev => [...prev, {
            id: `${Date.now()}-${index}`,
            type: isVideo ? 'video' : 'image',
            url: event.target?.result as string || 
              (isVideo 
                ? 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400' 
                : 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400')
          }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeMedia = (id: string) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== id))
  }

  const handleGenerate = () => {
    setStep('generating')
    
    // 模拟AI生成视频
    setTimeout(() => {
      setGeneratedVideo('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800')
      setStep('preview')
    }, 3000)
  }

  const handleSend = () => {
    setStep('sending')
    
    // 模拟发送
    setTimeout(() => {
      setStep('done')
    }, 2000)
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // 添加模拟上传的演示数据
  const addDemoMedia = () => {
    const demoImages = [
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
      'https://images.unsplash.com/photo-1555436169-20e93ea9a7ff?w=400',
    ]
    
    setUploadedMedia(demoImages.map((url, index) => ({
      id: `demo-${index}`,
      type: 'image' as const,
      url
    })))
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {step === 'upload' && '今日精彩瞬间'}
          {step === 'generating' && 'AI生成中'}
          {step === 'preview' && '预览视频'}
          {step === 'sending' && '发送中'}
          {step === 'done' && '发送完成'}
        </h1>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="px-4 space-y-4">
            {/* Feature Info */}
            <div className="p-4 bg-primary/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">AI智能剪辑</span>
              </div>
              <p className="text-sm text-muted-foreground">
                上传今日课堂照片和视频，AI自动生成精彩瞬间集锦，一键发送给家长
              </p>
            </div>

            {/* Class Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">选择课程</label>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {todayScheduleB.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedClass(item)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      selectedClass?.id === item.id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {item.className}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  上传素材 ({uploadedMedia.length}/9)
                </label>
                {uploadedMedia.length === 0 && (
                  <button
                    onClick={addDemoMedia}
                    className="text-xs text-secondary"
                  >
                    添加演示素材
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {uploadedMedia.map((media) => (
                  <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden">
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {media.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(media.id)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                {uploadedMedia.length < 9 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">添加</span>
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={uploadedMedia.length === 0}
              className={cn(
                'w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2',
                uploadedMedia.length > 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Sparkles className="w-5 h-5" />
              AI一键生成精彩视频
            </button>
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Video className="w-10 h-10 text-primary" />
              </div>
            </div>
            <p className="text-lg font-medium">AI正在生成精彩视频...</p>
            <p className="text-sm text-muted-foreground mt-2">正在智能识别和剪辑素材</p>
            
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>分析素材内容</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>智能剪辑中...</span>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <span className="w-4 h-4 border-2 border-muted rounded-full" />
                <span>添加背景音乐</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && generatedVideo && (
          <div className="px-4 space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden max-h-[50vh] mx-auto">
              <img
                src={generatedVideo}
                alt="Generated video"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white text-sm">
                  <img src="/logo.png" alt="课小宝" className="w-6 h-6 object-contain" />
                  <span>今日精彩瞬间 | {selectedClass?.className}</span>
                </div>
              </div>
            </div>

            {/* Select Recipients */}
            <div>
              <h3 className="font-medium mb-2">选择发送对象</h3>
              <div className="space-y-2">
                {students.slice(0, 4).map((student) => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                      selectedStudents.includes(student.id)
                        ? 'bg-secondary/10 border border-secondary/30'
                        : 'bg-muted/30'
                    )}
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full bg-muted"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.parentName}</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selectedStudents.includes(student.id)
                        ? 'border-secondary bg-secondary'
                        : 'border-muted-foreground'
                    )}>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('upload')
                  setGeneratedVideo(null)
                }}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium"
              >
                重新生成
              </button>
              <button
                onClick={handleSend}
                disabled={selectedStudents.length === 0}
                className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                发送给家长
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Sending */}
        {step === 'sending' && (
          <div className="px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin mb-6" />
            <p className="text-lg font-medium">正在发送给家长...</p>
            <p className="text-sm text-muted-foreground mt-2">
              已选择 {selectedStudents.length} 位学员的家长
            </p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 'done' && (
          <div className="px-4 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-semibold">发送成功</p>
            <p className="text-sm text-muted-foreground mt-2">
              已发送给 {selectedStudents.length} 位学员的家长
            </p>
            
            <div className="mt-8 space-y-3 w-full">
              <button
                onClick={() => {
                  setStep('upload')
                  setUploadedMedia([])
                  setGeneratedVideo(null)
                }}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium"
              >
                继续发送其他班级
              </button>
              <button
                onClick={() => router.push('/institution')}
                className="w-full py-3 bg-muted text-foreground rounded-xl font-medium"
              >
                返回工作台
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
