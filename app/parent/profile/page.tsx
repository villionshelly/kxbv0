'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  BookOpenCheck,
  Building2,
  ChevronRight,
  FileSignature,
  FileText,
  GraduationCap,
  HelpCircle,
  Phone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react'
import { children, familyMembers } from '@/lib/mock-data'

export default function ParentProfilePage() {
  const router = useRouter()
  const accountNickname = '王女士'
  const accountPhone = ''

  const assetItems = [
    { icon: Building2, label: '我的机构', href: '/parent/institutions', tone: 'text-sky-600 bg-sky-100' },
    { icon: WalletCards, label: '课时账户', href: '/parent/assets', tone: 'text-emerald-600 bg-emerald-100' },
    { icon: ReceiptText, label: '我的账单', href: '/parent/bills', tone: 'text-orange-600 bg-orange-100' },
    { icon: FileSignature, label: '我的合同', href: '/parent/contracts', tone: 'text-violet-600 bg-violet-100' },
  ]

  const learningItems = [
    { icon: FileText, label: '请假记录', href: '/parent/leave', tone: 'text-amber-600 bg-amber-100' },
    { icon: GraduationCap, label: '成长档案', href: '/parent/growth', tone: 'text-rose-600 bg-rose-100' },
    { icon: BookOpenCheck, label: '课程反馈', href: '/parent/feedback', tone: 'text-teal-600 bg-teal-100' },
    { icon: Bell, label: '消息通知', href: '/parent/messages', tone: 'text-blue-600 bg-blue-100' },
  ]

  const settingItems = [
    { icon: ShieldCheck, label: '账号安全', href: '/parent/account' },
    { icon: HelpCircle, label: '帮助与反馈', href: '' },
    { icon: Settings, label: '设置', href: '' },
  ]

  const renderShortcut = (item: typeof assetItems[number]) => (
    <button
      key={item.label}
      type="button"
      onClick={() => router.push(item.href)}
      className="flex min-h-[78px] flex-col items-center justify-center rounded-2xl bg-white/68 px-2 py-3 text-center ring-1 ring-white/70 transition-transform active:scale-[0.98]"
    >
      <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}>
        <item.icon className="h-4.5 w-4.5" />
      </span>
      <span className="text-xs font-semibold leading-4 text-foreground">{item.label}</span>
    </button>
  )

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-2 warm-header">
        <div className="mb-1 flex items-center gap-2 py-1">
          <button
            onClick={() => router.push('/parent')}
            className="-ml-1.5 rounded-lg p-1.5 hover:bg-card/60"
            aria-label="返回首页"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">个人中心</h1>
        </div>

        <button
          type="button"
          onClick={() => router.push('/parent/account')}
          className="relative flex w-full items-center gap-3 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,240,222,0.76))] p-4 text-left shadow-[0_14px_30px_-24px_rgba(232,122,52,0.6)] ring-1 ring-white/70 transition-transform active:scale-[0.99]"
        >
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/12" />
          <img
            src="/images/avatars/parent-mom.jpg"
            alt={accountNickname}
            className="relative h-16 w-16 rounded-[24px] object-cover ring-4 ring-white/70"
          />
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">家庭管理员</span>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">购课家长</span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-foreground">{accountNickname}</h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {accountPhone || '未绑定手机号'}
            </p>
          </div>
          <ChevronRight className="relative h-4 w-4 text-muted-foreground" />
        </button>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">我的家庭</h2>
            <button onClick={() => router.push('/parent/family-sharing')} className="text-xs font-medium text-primary">管理</button>
          </div>
          <button
            type="button"
            onClick={() => router.push('/parent/family-sharing')}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/62 px-3 py-3 text-left ring-1 ring-white/70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">王女士的家庭</p>
              <p className="truncate text-xs text-muted-foreground">{children.length} 个孩子 · {familyMembers.length + 1} 位家庭成员</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <section className="pt-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">课程与资产</h2>
          <div className="grid grid-cols-4 gap-2">
            {assetItems.map(renderShortcut)}
          </div>
        </section>

        <section className="pt-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">学习事务</h2>
          <div className="grid grid-cols-4 gap-2">
            {learningItems.map(renderShortcut)}
          </div>
        </section>

        <section className="pt-5">
          <button
            type="button"
            onClick={() => router.push('/parent/invite')}
            className="relative w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#ff7a2f,#ffb15c_58%,#fff4e8)] p-4 text-left shadow-[0_18px_34px_-24px_rgba(248,126,49,0.55)] ring-1 ring-white/80"
          >
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/25" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white">邀请机构入驻</p>
                <p className="mt-0.5 text-xs leading-5 text-white/86">让机构同步课表、课时和成长记录</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </button>
        </section>

        <section className="pt-5">
          <h2 className="mb-2 text-sm font-semibold text-foreground">账号与支持</h2>
          <div className="overflow-hidden rounded-2xl bg-white/60 ring-1 ring-white/70">
            {settingItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.href && router.push(item.href)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/55"
              >
                <item.icon className="h-4.5 w-4.5 text-muted-foreground" />
                <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{item.label}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
