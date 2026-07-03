'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, User, Phone, CheckCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const institutionTypes = [
  '音乐培训',
  '美术培训', 
  '舞蹈培训',
  '体育培训',
  '学科辅导',
  '语言培训',
  '编程/科技',
  '综合素质',
  '其他',
]

export default function InstitutionRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'verify' | 'done'>('info')
  const [institutionName, setInstitutionName] = useState('')
  const [institutionType, setInstitutionType] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  const canProceed = institutionName.trim() && institutionType && contactName.trim() && phone.length === 11

  const handleSendCode = () => {
    if (countdown > 0) return
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
  }

  const handleSubmit = () => {
    if (step === 'info') {
      handleSendCode()
      setStep('verify')
    } else if (step === 'verify') {
      setStep('done')
      setTimeout(() => {
        router.push('/institution')
      }, 2000)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">注册成功</h2>
          <p className="text-muted-foreground">欢迎使用课小宝，正在进入管理后台...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/5 to-background flex flex-col">
      {/* Header */}
      <div className="safe-area-top px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <Image src="/logo.png" alt="课小宝" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold">课小宝</h1>
            <p className="text-sm text-muted-foreground">教培机构智能管理平台</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold">
          {step === 'info' ? '机构注册' : '验证手机号'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 'info' 
            ? '填写机构基本信息，开启智能管理之旅' 
            : `验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(-4)}`}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        {step === 'info' ? (
          <div className="space-y-4">
            {/* Institution Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">机构名称 *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="如：七彩音乐艺术中心"
                  value={institutionName}
                  onChange={e => setInstitutionName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>

            {/* Institution Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">机构类型 *</label>
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full h-12 px-4 bg-muted/40 rounded-xl text-sm text-left flex items-center justify-between"
                >
                  <span className={institutionType ? 'text-foreground' : 'text-muted-foreground'}>
                    {institutionType || '请选择机构类型'}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showTypeDropdown && 'rotate-180')} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
                    {institutionTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => { setInstitutionType(type); setShowTypeDropdown(false) }}
                        className={cn(
                          'w-full px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors',
                          institutionType === type && 'bg-secondary/10 text-secondary font-medium'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">联系人 *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="您的姓名"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium mb-2 block">手机号 *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="用于登录和接收通知"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full h-12 pl-11 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                小程序环境将自动获取微信绑定手机号
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">验证码</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="请输入6位验证码"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 h-12 px-4 bg-muted/40 rounded-xl text-sm text-center tracking-widest font-mono outline-none focus:ring-2 focus:ring-secondary/30"
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-4 h-12 bg-muted text-muted-foreground rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : '重新发送'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 safe-area-bottom">
        <button
          onClick={handleSubmit}
          disabled={step === 'info' ? !canProceed : verifyCode.length < 6}
          className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40 transition-opacity"
        >
          {step === 'info' ? '下一步' : '完成注册'}
        </button>
        
        {step === 'info' && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            注册即表示同意《服务协议》和《隐私政策》
          </p>
        )}

        {step === 'verify' && (
          <button
            onClick={() => setStep('info')}
            className="w-full mt-3 text-sm text-muted-foreground"
          >
            返回修改信息
          </button>
        )}
      </div>
    </div>
  )
}
