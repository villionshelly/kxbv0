'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Phone, MessageSquare, Building2, MapPin, User, Shield, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'role' | 'phone' | 'verify' | 'register'
type Role = 'admin' | 'teacher'

export default function InstitutionLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<Role>('admin')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)

  // Register form
  const [institutionName, setInstitutionName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState('')

  const categories = ['音乐培训', '美术培训', 'STEM/编程', '体育培训', '语言培训', '学科辅导', '舞蹈培训', '其他']

  const sendCode = () => {
    if (phone.length !== 11) return
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setStep('verify')
  }

  const verifyCode = () => {
    if (code.length !== 6) return
    if (role === 'teacher') {
      // Teachers go directly to teacher view
      router.push('/institution/teacher')
      return
    }
    // Admin: check if new user
    const newUser = phone.endsWith('0')
    if (newUser) {
      setIsNewUser(true)
      setStep('register')
    } else {
      router.push('/institution')
    }
  }

  const completeRegister = () => {
    if (!institutionName.trim() || !ownerName.trim()) return
    router.push('/institution')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col items-center px-8 py-12">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center mb-4">
              <Image src="/logo.png" alt="课小宝" width={64} height={64} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">课小宝机构版</h1>
            <p className="text-sm text-muted-foreground mt-1">AI驱动的教培机构增长平台</p>
          </div>

          {/* Form */}
          <div className="w-full max-w-sm">
            {step === 'role' && (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground mb-6">请选择您的登录身份</p>
                <button
                  onClick={() => { setRole('admin'); setStep('phone') }}
                  className="w-full flex items-center gap-4 p-5 bg-muted/40 rounded-2xl hover:bg-secondary/5 hover:border-secondary border-2 border-transparent transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base">机构管理员</p>
                    <p className="text-sm text-muted-foreground mt-0.5">管理机构、学员、课程及数据</p>
                  </div>
                </button>
                <button
                  onClick={() => { setRole('teacher'); setStep('phone') }}
                  className="w-full flex items-center gap-4 p-5 bg-muted/40 rounded-2xl hover:bg-primary/5 hover:border-primary border-2 border-transparent transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base">教师</p>
                    <p className="text-sm text-muted-foreground mt-0.5">查看我的课程、核销考勤</p>
                  </div>
                </button>
              </div>
            )}

            {step === 'phone' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-sm text-muted-foreground mb-2 -mt-2"
                >
                  <span className="text-lg leading-none">←</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    role === 'admin' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                  )}>
                    {role === 'admin' ? '机构管理员' : '教师'}
                  </span>
                  <span>切换身份</span>
                </button>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">手机号码</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="请输入手机号"
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>
                <button
                  onClick={sendCode}
                  disabled={phone.length !== 11}
                  className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
                >
                  获取验证码
                </button>

                {/* Features */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-4">为什么选择课小宝</p>
                  <div className="space-y-3">
                    {[
                      { label: 'AI智能获客', desc: '线索广场 + 智能话术' },
                      { label: '学员全周期管理', desc: '从引流到续费一站式' },
                      { label: 'AI成长报告', desc: '自动生成家长满意度报告' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <span className="text-secondary font-bold text-sm">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">验证码已发送至</p>
                  <p className="font-medium text-lg mt-1">{phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">验证码</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="请输入6位验证码"
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => setStep('phone')} className="text-muted-foreground text-sm">
                    更换手机号
                  </button>
                  {countdown > 0 ? (
                    <span className="text-muted-foreground">{countdown}秒后重发</span>
                  ) : (
                    <button onClick={sendCode} className="text-secondary font-medium">
                      重新获取
                    </button>
                  )}
                </div>
                <button
                  onClick={verifyCode}
                  disabled={code.length !== 6}
                  className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
                >
                  登录 / 注册
                </button>
              </div>
            )}

            {step === 'register' && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-lg font-semibold">创建您的机构</h2>
                  <p className="text-sm text-muted-foreground mt-1">填写基本信息，快速开始使用</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">机构名称 *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="如：七彩培训中心"
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">负责人姓名 *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="请输入您的姓名"
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">培训类型</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          category === c
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground block mb-2">机构地址</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="选填，方便家长找到您"
                      className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </div>

                <button
                  onClick={completeRegister}
                  disabled={!institutionName.trim() || !ownerName.trim()}
                  className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
                >
                  完成注册，开始使用
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  注册即享 7 天 AI 增长版免费试用
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>登录即代表同意</span>
          <button className="text-secondary">用户协议</button>
          <span>和</span>
          <button className="text-secondary">隐私政策</button>
        </div>
      </div>
    </div>
  )
}
