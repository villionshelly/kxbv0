'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Building2, Users, FileText, Bell, HelpCircle, Settings, LogOut, Sparkles, BookOpen, CalendarDays, UserCog } from 'lucide-react'
import { institutionInfo, teachers, courseCatalog, classSessions } from '@/lib/mock-data'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'
import Image from 'next/image'

export default function InstitutionProfilePage() {
  const router = useRouter()
  const { settings } = useInstitutionProfileSettings()

  const menuItems = [
    {
      icon: BookOpen,
      label: '课程管理',
      description: `${courseCatalog.length}个课程`,
      href: '/institution/courses',
    },
    {
      icon: CalendarDays,
      label: '班次管理',
      description: `${classSessions.length}个班次`,
      href: '/institution/classes',
    },
    {
      icon: Building2,
      label: '机构信息',
      description: '编辑门店信息、联系方式',
      href: '/institution/profile/institution-info',
    },
    {
      icon: Users,
      label: '员工管理',
      description: `${teachers.length}位教师`,
      href: '/institution/staff',
    },
    {
      icon: Sparkles,
      label: 'AI积分',
      description: '剩余 2,580 积分',
      href: '/institution/payment?tab=points',
    },
    {
      icon: FileText,
      label: '合同管理',
      description: '发起签约、上传纸质合同',
      href: '/institution/contracts',
    },
    {
      icon: UserCog,
      label: '账号设置',
      description: '头像、昵称、手机号换绑',
      href: '/institution/profile/account',
    },
    {
      icon: Bell,
      label: '消息设置',
      description: '通知提醒配置',
      href: undefined,
    },
    {
      icon: HelpCircle,
      label: '帮助与反馈',
      description: '使用指南、联系客服',
      href: undefined,
    },
    {
      icon: Settings,
      label: '系统设置',
      description: '账号安全、数据备份',
      href: undefined,
    },
  ]

  const quickItems = menuItems.filter(item =>
    ['课程管理', '班次管理', '员工管理', '机构信息'].includes(item.label)
  )
  const settingItems = menuItems.filter(item =>
    !['课程管理', '班次管理', '员工管理', '机构信息'].includes(item.label)
  )

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-32">
        <header className="safe-area-top pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white/80 shadow-sm ring-1 ring-white">
              <Image 
                src={settings.accountAvatar}
                alt={settings.accountNickname}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-xl font-bold leading-tight">{settings.accountNickname}</h2>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{settings.institutionName}</p>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[28px] bg-card p-4 card-dream">
          <Image
            src={settings.institutionLogo}
            alt=""
            width={180}
            height={180}
            className="pointer-events-none absolute -right-10 -top-8 h-40 w-40 object-cover opacity-[0.06]"
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">AI积分余额</p>
              <p className="mt-1 text-4xl font-black leading-none text-slate-950">2,580</p>
            </div>
            <button
              onClick={() => router.push('/institution/payment?tab=points')}
              className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100"
            >
              充值
            </button>
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-3 rounded-3xl bg-muted/35 p-3 ring-1 ring-border/60">
            <div className="text-center">
              <p className="text-2xl font-black text-secondary">{institutionInfo.studentCount}</p>
              <p className="text-xs text-muted-foreground">学员</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-black text-primary">{institutionInfo.teacherCount}</p>
              <p className="text-xs text-muted-foreground">教师</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-foreground">{institutionInfo.classCount}</p>
              <p className="text-xs text-muted-foreground">班级</p>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <h3 className="mb-3 text-base font-bold text-slate-950">常用管理</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.href && router.push(item.href)}
                className="flex min-h-[92px] items-center gap-3 rounded-3xl bg-card p-3 text-left transition-transform active:scale-[0.98] card-dream"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">{item.label}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-card p-2 card-dream">
          {settingItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className="w-full flex items-center gap-4 p-3 hover:bg-muted/45 rounded-2xl transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </section>

        <div className="pb-8 pt-4">
          <button 
            onClick={() => router.push('/institution/login')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-card/70 p-3 text-muted-foreground shadow-sm transition-colors hover:bg-card"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}
