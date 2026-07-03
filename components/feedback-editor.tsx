'use client'

import { useRef, useState } from 'react'
import { X, Send, Sparkles, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEFAULT_SUGGESTIONS = [
  '今天课堂表现非常专注，新学的内容掌握得很快，继续保持！',
  '今日练习认真，手型有明显进步，回家可多巩固音阶练习。',
  '上课积极互动，节奏感越来越好，给孩子点个赞！',
]

export interface FeedbackEditorProps {
  studentName: string
  initialText?: string
  initialImages?: string[]
  suggestions?: string[]
  onSend: (text: string, images: string[]) => void
  onClose: () => void
}

export function FeedbackEditor({
  studentName,
  initialText = '',
  initialImages = [],
  suggestions = DEFAULT_SUGGESTIONS,
  onSend,
  onClose,
}: FeedbackEditorProps) {
  const [text, setText] = useState(initialText)
  const [images, setImages] = useState<string[]>(initialImages)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddImages = (files: FileList | null) => {
    if (!files) return
    const urls = Array.from(files).map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...urls].slice(0, 6))
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[88vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">给 {studentName} 的反馈</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="记录今天的课堂表现，家长可以看到..."
          rows={4}
          className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />

        {/* Image upload */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <ImagePlus className="w-3.5 h-3.5 text-primary" />
            添加课堂照片（最多 6 张）
          </p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url || "/placeholder.svg"} alt={`课堂照片 ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleAddImages(e.target.files)}
          />
        </div>

        {/* AI suggestions */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI推荐反馈语
          </p>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setText(s)}
                className="w-full text-left text-xs text-muted-foreground p-2.5 bg-muted/40 rounded-lg hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSend(text, images)}
          disabled={!text.trim()}
          className={cn(
            'w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium mt-4 flex items-center justify-center gap-2',
            !text.trim() && 'opacity-40'
          )}
        >
          <Send className="w-4 h-4" />
          发送给家长
        </button>
      </div>
    </div>
  )
}
