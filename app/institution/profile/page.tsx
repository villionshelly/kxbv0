'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, Building2, Users, CreditCard, FileText, Bell, HelpCircle, Settings, LogOut, Crown, Sparkles, BookOpen, CalendarDays } from 'lucide-react'
import { institutionInfo, teachers, courseCatalog, classSessions } from '@/lib/mock-data'
import Image from 'next/image'

export default function InstitutionProfilePage() {
  const router = useRouter()

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
      href: undefined,
    },
    {
      icon: Users,
      label: '员工管理',
      description: `${teachers.length}位教师`,
      href: '/institution/staff',
    },
    {
      icon: CreditCard,
      label: '订阅管理',
      description: 'AI增长版 | 有效期至2027-06-01',
      highlight: true,
      href: '/institution/payment',
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
      description: '查看学员合同',
      href: undefined,
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-6 bg-gradient-to-br from-secondary/10 to-primary/5">
        {/* Institution Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-sm">
            <Image 
              src="/logo.png" 
              alt="课小宝" 
              width={48} 
              height={48}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate">{institutionInfo.name}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                <Crown className="w-3 h-3" />
                AI增长版
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-background rounded-xl shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{institutionInfo.studentCount}</p>
            <p className="text-xs text-muted-foreground">学员</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold text-primary">{institutionInfo.teacherCount}</p>
            <p className="text-xs text-muted-foreground">教师</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{institutionInfo.classCount}</p>
            <p className="text-xs text-muted-foreground">班级</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* AI Points Card */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/70 text-sm">AI积分余额</p>
              <p className="text-3xl font-bold mt-1">2,580</p>
            </div>
            <button 
              onClick={() => router.push('/institution/payment?tab=points')}
              className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              充值
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-sm">
            <span className="text-primary-foreground/70">本月已消耗 420 积分</span>
            <span className="text-primary-foreground/70">查看明细</span>
          </div>
        </div>

        {/* Menu List */}
        <div className="px-4 py-4 space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.href && router.push(item.href)}
              className="w-full flex items-center gap-4 p-3 hover:bg-muted/50 rounded-xl transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.highlight 
                  ? 'bg-secondary/10 text-secondary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${item.highlight ? 'text-secondary' : ''}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="px-4 pb-8">
          <button 
            onClick={() => router.push('/institution/login')}
            className="w-full flex items-center justify-center gap-2 p-3 text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}
