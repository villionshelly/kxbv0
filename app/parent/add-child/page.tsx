'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const grades = ['小班', '中班', '大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级']

export default function AddChildPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      router.push('/parent/children')
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">添加成功</h2>
          <p className="text-muted-foreground">现在可以为宝贝添加课程了</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">添加宝贝</h1>
      </div>

      <div className="p-4">
        {/* Avatar */}
        <div className="flex justify-center mb-8 mt-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block font-medium mb-2">宝贝昵称</label>
          <Input
            placeholder="请输入宝贝昵称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 bg-muted/20 border-0"
          />
        </div>

        {/* Grade Selection */}
        <div className="mb-8">
          <label className="block font-medium mb-3">当前年级</label>
          <div className="grid grid-cols-3 gap-2">
            {grades.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedGrade === grade
                    ? 'bg-primary text-white'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          className="w-full h-12 text-base"
          onClick={handleSubmit}
          disabled={!name.trim() || !selectedGrade}
        >
          确认添加
        </Button>
      </div>
    </div>
  )
}
