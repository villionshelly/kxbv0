'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, BookOpenCheck, CheckCircle2, MessageCircle, Shield, Sparkles } from 'lucide-react'
import { parentInviteCardSrc } from '@/lib/invite-assets'
import { cn } from '@/lib/utils'

function ParentJoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentName = searchParams.get('studentName') || '孩子'
  const orgName = searchParams.get('orgName') || '机构'
  const inviteCode = searchParams.get('inviteCode') || 'KXB-0000'
  const [status, setStatus] = useState<'ready' | 'authorizing' | 'bound'>('ready')

  const handleWechatAuth = () => {
    setStatus('authorizing')
    setTimeout(() => setStatus('bound'), 1200)
  }

  if (status === 'bound') {
    return (
      <div className="flex min-h-screen flex-col bg-background px-6 py-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">绑定成功</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            已通过微信授权完成登录，{studentName} 的课程信息将同步到您的家长端。
          </p>
          <button
            type="button"
            onClick={() => router.push('/parent')}
            className="mt-8 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground"
          >
            进入家长端
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_48%,#f5fbff_100%)]">
      <main className="flex-1 overflow-auto px-5 pb-8 pt-7">
        <section className="pt-3">
          <div className="mb-5 flex items-center gap-3">
            <img src="/logo.png" alt="课小宝" className="h-11 w-11 rounded-[14px] bg-white object-contain shadow-sm" />
            <div>
              <p className="text-sm font-semibold text-muted-foreground">课小宝家校服务</p>
              <h1 className="text-xl font-black leading-tight">邀请绑定课程</h1>
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_20px_42px_-30px_rgba(20,35,58,0.5)] ring-1 ring-white">
            <img
              src={parentInviteCardSrc}
              alt="家长注册邀请卡片"
              className="aspect-[941/1672] w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-5 rounded-[22px] bg-white/82 p-4 shadow-[0_18px_36px_-30px_rgba(20,35,58,0.5)] ring-1 ring-white">
          <p className="text-xs font-semibold text-primary">{orgName}</p>
          <h2 className="mt-1 text-lg font-black leading-snug">
            邀请您绑定 {studentName} 的课程信息
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: BookOpenCheck, label: '查看课表' },
              { icon: Sparkles, label: '成长反馈' },
              { icon: Shield, label: '课时同步' },
            ].map(item => (
              <div key={item.label} className="rounded-[16px] bg-muted/35 px-2 py-3 text-center">
                <item.icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1.5 text-xs font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[16px] bg-primary/10 px-3 py-2">
            <p className="text-xs text-muted-foreground">邀请码</p>
            <p className="font-mono text-lg font-black tracking-[0.08em] text-primary">{inviteCode}</p>
          </div>
        </section>
      </main>

      <div className="border-t border-white/70 bg-background/92 px-5 pb-8 pt-4">
        <button
          type="button"
          onClick={handleWechatAuth}
          disabled={status === 'authorizing'}
          className={cn(
            'flex h-12 w-full items-center justify-center gap-2 rounded-[16px] text-sm font-bold text-white shadow-[0_14px_24px_-18px_rgba(7,193,96,0.8)]',
            status === 'authorizing' ? 'bg-[#07C160]/70' : 'bg-[#07C160]',
          )}
        >
          {status === 'authorizing' ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/45 border-t-white animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          {status === 'authorizing' ? '正在授权绑定...' : '微信授权登录并绑定'}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          点击即表示同意《用户协议》《隐私政策》，并授权获取微信身份用于完成家长账号登录。
        </p>
      </div>
    </div>
  )
}

export default function ParentJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ParentJoinContent />
    </Suspense>
  )
}
