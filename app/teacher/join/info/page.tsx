'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Camera, User, Briefcase, GraduationCap, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeacherPageShell } from '@/components/teacher-page-shell'

// 模拟已有用户数据（如果用户之前在个人中心填过）
const existingUserData = {
  '13800138001': {
    name: '李雪',
    title: '高级钢琴教师',
    specialty: '古典钢琴',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
  },
  '13900139002': {
    name: '王明',
    title: '声乐教师',
    specialty: '美声唱法',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
  },
}

function InfoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const inviteCode = searchParams.get('code') || ''
  const orgName = decodeURIComponent(searchParams.get('org') || '未知机构')
  const phone = searchParams.get('phone') || ''
  const isNew = searchParams.get('isNew') === 'true'
  
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // 如果是老用户，自动回填数据
  useEffect(() => {
    const userData = existingUserData[phone as keyof typeof existingUserData]
    if (userData) {
      setName(userData.name)
      setTitle(userData.title)
      setSpecialty(userData.specialty)
    }
  }, [phone])

  const handleSubmit = () => {
    if (!name.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
    }, 1500)
  }

  if (success) {
    return (
      <TeacherPageShell variant="onboarding" className="flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">加入成功</h1>
        <p className="text-muted-foreground text-center mb-2">
          您已成功加入「{orgName}」
        </p>
        <p className="text-sm text-muted-foreground text-center mb-8">
          您的信息已同步到机构员工列表
        </p>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => router.push('/institution/teacher')}
            className="w-full h-12 institution-btn-primary font-medium"
          >
            进入教师工作台
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full h-12 bg-muted text-foreground rounded-xl font-medium"
          >
            返回首页
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          您可以在「我的」页面切换或加入其他机构
        </p>
      </TeacherPageShell>
    )
  }

  const hasExistingData = !!existingUserData[phone as keyof typeof existingUserData]

  return (
    <TeacherPageShell variant="onboarding" className="flex flex-col">
      {/* Header */}
      <div className="teacher-brand-header px-6 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">正在加入</p>
            <p className="font-semibold">{orgName}</p>
          </div>
        </div>
        
        <h1 className="text-xl font-bold">完善个人信息</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {hasExistingData 
            ? '已自动回填您的信息，可直接提交或修改' 
            : '请填写您的教师信息，用于机构管理'}
        </p>
      </div>

      <div className="flex-1 px-6 py-5">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <button className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {hasExistingData ? (
                <img 
                  src={existingUserData[phone as keyof typeof existingUserData]?.avatar} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="teacher-card space-y-4 p-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              手机号 <span className="text-xs text-green-600">(已验证)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                disabled
                className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              姓名 <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="请输入您的姓名"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">职称</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="如：高级钢琴教师"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2">专业方向</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="如：古典钢琴、声乐"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700">
            <strong>提示：</strong>您在此填写的信息将作为机构员工初始信息。
            此信息与您个人中心的信息相互独立，机构可能会根据需要进行调整。
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="border-t border-blue-100 bg-white/95 px-6 py-6">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className="w-full h-12 institution-btn-primary font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              提交中...
            </>
          ) : (
            '确认加入'
          )}
        </button>
      </div>
    </TeacherPageShell>
  )
}

export default function TeacherJoinInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <InfoContent />
    </Suspense>
  )
}
