'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, ArrowRight, CheckCircle, Building2, Users, Sparkles, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeacherPageShell } from '@/components/teacher-page-shell'

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const inviteCode = searchParams.get('code') || ''
  const orgName = searchParams.get('org') || '未知机构'
  
  const [step, setStep] = useState<'welcome' | 'login' | 'verifying'>('welcome')
  const [phone, setPhone] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = () => {
    if (phone.length === 11 && countdown === 0) {
      setCountdown(60)
      // 模拟：检查是否新用户
      setIsNewUser(Math.random() > 0.5)
    }
  }

  const handleVerify = () => {
    if (verifyCode.length === 6) {
      setStep('verifying')
      setTimeout(() => {
        // 跳转到填写信息页面
        router.push(`/teacher/join/info?code=${inviteCode}&org=${encodeURIComponent(orgName)}&phone=${phone}&isNew=${isNewUser}`)
      }, 1500)
    }
  }

  if (step === 'verifying') {
    return (
      <TeacherPageShell variant="onboarding" className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium">正在验证...</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isNewUser ? '正在为您创建账号' : '正在获取您的信息'}
          </p>
        </div>
      </TeacherPageShell>
    )
  }

  if (step === 'login') {
    return (
      <TeacherPageShell variant="onboarding" className="flex flex-col">
        {/* Header */}
        <div className="teacher-brand-header px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold">手机号登录</h1>
          <p className="text-muted-foreground mt-1">首次使用将自动注册账号</p>
        </div>

        <div className="flex-1 px-6">
          {/* Phone input */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">手机号</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full h-14 pl-12 pr-4 bg-muted/40 rounded-2xl text-base outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Verify code */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="请输入验证码"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 h-14 px-4 bg-muted/40 rounded-2xl text-base outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSendCode}
                disabled={phone.length !== 11 || countdown > 0}
                className={cn(
                  'px-4 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors',
                  phone.length === 11 && countdown === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifyCode.length !== 6}
            className="w-full h-14 institution-btn-primary font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isNewUser ? '注册并加入' : '登录并加入'}
            <ArrowRight className="w-5 h-5" />
          </button>

          {phone.length === 11 && countdown > 0 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              {isNewUser ? '检测到您是新用户，将自动为您创建账号' : '欢迎回来，验证后将同步您的信息'}
            </p>
          )}
        </div>

        <div className="px-6 py-6">
          <p className="text-xs text-muted-foreground text-center">
            登录即表示同意《用户协议》和《隐私政策》
          </p>
        </div>
      </TeacherPageShell>
    )
  }

  // Welcome step
  return (
    <TeacherPageShell variant="onboarding" className="flex flex-col">
      {/* Header illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-xl mb-6">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">
          {orgName}
        </h1>
        <p className="text-muted-foreground text-center">邀请您加入教师团队</p>

        {/* Invite code display */}
        <div className="mt-6 px-6 py-3 bg-primary/10 rounded-2xl">
          <p className="text-xs text-muted-foreground text-center mb-1">邀请码</p>
          <p className="text-xl font-bold text-primary tracking-widest">{inviteCode}</p>
        </div>

        {/* Benefits */}
        <div className="mt-8 w-full max-w-xs space-y-3">
          {[
            { icon: Users, title: '智能学员管理', desc: '轻松管理班级和学员信息' },
            { icon: Sparkles, title: 'AI辅助教学', desc: '智能点名、成长报告生成' },
            { icon: Shield, title: '薪资透明结算', desc: '清晰查看课时和收入明细' },
          ].map(item => (
            <div key={item.title} className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="px-6 py-8 space-y-3">
        <button
          onClick={() => {
            // 模拟微信授权获取手机号，直接进入信息填写
            router.push(`/teacher/join/info?code=${inviteCode}&org=${encodeURIComponent(orgName)}&phone=13800138001&isNew=false`)
          }}
          className="w-full h-14 institution-btn-primary font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.407-.032zM13.12 12.653c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982zm4.844 0c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982z"/>
          </svg>
          微信授权快捷加入
        </button>
        <button
          onClick={() => setStep('login')}
          className="w-full h-14 institution-btn-primary font-semibold flex items-center justify-center gap-2"
        >
          手机号登录加入
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          点击加入即表示您同意《用户协议》《隐私政策》，授权获取手机号成为该机构的教师成员
        </p>
      </div>
    </TeacherPageShell>
  )
}

export default function TeacherJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  )
}
