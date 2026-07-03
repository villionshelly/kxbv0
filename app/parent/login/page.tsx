'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Phone, MessageSquare, ChevronRight, Shield } from 'lucide-react'

type Step = 'phone' | 'verify' | 'profile'

export default function ParentLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)
  const [nickname, setNickname] = useState('')

  const sendCode = () => {
    if (phone.length !== 11) return
    // Simulate sending code
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
    // Simulate: check if new user
    const newUser = phone.endsWith('0') // demo: phone ending with 0 is new user
    if (newUser) {
      setIsNewUser(true)
      setStep('profile')
    } else {
      router.push('/parent')
    }
  }

  const completeProfile = () => {
    if (!nickname.trim()) return
    router.push('/parent')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center mb-4">
            <Image src="/logo.png" alt="课小宝" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">课小宝</h1>
          <p className="text-sm text-muted-foreground mt-1">家长管课更省心</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm">
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">手机号码</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="请输入手机号"
                    className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <button
                onClick={sendCode}
                disabled={phone.length !== 11}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
              >
                获取验证码
              </button>
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
                    className="w-full h-12 pl-12 pr-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <button onClick={() => setStep('phone')} className="text-muted-foreground">
                  更换手机号
                </button>
                {countdown > 0 ? (
                  <span className="text-muted-foreground">{countdown}秒后重发</span>
                ) : (
                  <button onClick={sendCode} className="text-primary font-medium">
                    重新获取
                  </button>
                )}
              </div>
              <button
                onClick={verifyCode}
                disabled={code.length !== 6}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
              >
                登录 / 注册
              </button>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👋</span>
                </div>
                <h2 className="text-lg font-semibold">欢迎加入课小宝</h2>
                <p className="text-sm text-muted-foreground mt-1">完善资料，开启智能管课之旅</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-2">您的昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="如：朵朵妈妈"
                  className="w-full h-12 px-4 bg-muted/50 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                onClick={completeProfile}
                disabled={!nickname.trim()}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-all"
              >
                完成注册
              </button>
              <button
                onClick={() => router.push('/parent')}
                className="w-full text-center text-sm text-muted-foreground"
              >
                跳过，稍后完善
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>登录即代表同意</span>
          <button className="text-primary">用户协议</button>
          <span>和</span>
          <button className="text-primary">隐私政策</button>
        </div>
      </div>
    </div>
  )
}
