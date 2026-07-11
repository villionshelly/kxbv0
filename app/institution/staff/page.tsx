'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Copy, CheckCircle, Phone, GraduationCap,
  Crown, MoreVertical, UserX, Shield, ChevronRight, Share2,
  Edit3, Calculator, X, DollarSign, Users, BookOpen, Percent,
  Download, QrCode, Link2, Image as ImageIcon,
} from 'lucide-react'
import { teachers, classSessions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { DraggablePageActionFab } from '@/components/draggable-page-action-fab'

type Teacher = typeof teachers[0]

type SettlementRule = {
  type: 'per_session' | 'per_class' | 'commission'
  // per_session: 固定班次单价 * 已上课班次
  sessionRate?: number
  // per_class: 固定课时单价 * 消课记录
  classRate?: number
  // commission: 学员消课金额 * 提成比例
  commissionRate?: number
}

const defaultRules: Record<string, SettlementRule> = {
  '1': { type: 'per_class', classRate: 80 },
  '2': { type: 'per_session', sessionRate: 150 },
  '3': { type: 'commission', commissionRate: 40 },
}

export default function StaffManagementPage() {
  const router = useRouter()
  const [staffList, setStaffList] = useState(teachers)
  // The former invite sheet is retained only for backwards-safe state restoration;
  // all entry points now route to /institution/staff/invite.
  const [showInviteSheet, setShowInviteSheet] = useState(false)
  const [showMenuFor, setShowMenuFor] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<Teacher | null>(null)
  const [showUnbindConfirm, setShowUnbindConfirm] = useState<Teacher | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)
  
  // Edit teacher
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [editName, setEditName] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [editPhone, setEditPhone] = useState('')
  
  // Settlement rules
  const [showRuleSheet, setShowRuleSheet] = useState<Teacher | null>(null)
  const [settlementRules, setSettlementRules] = useState<Record<string, SettlementRule>>(defaultRules)
  const [ruleType, setRuleType] = useState<'per_session' | 'per_class' | 'commission'>('per_class')
  const [ruleSessionRate, setRuleSessionRate] = useState('')
  const [ruleClassRate, setRuleClassRate] = useState('')
  const [ruleCommissionRate, setRuleCommissionRate] = useState('')
  const [ruleSaved, setRuleSaved] = useState(false)

  const inviteCode = '73918426'
  const orgNameForInvite = '七彩培训中心'
  const joinPath = `/teacher/join?code=${inviteCode}&org=${encodeURIComponent(orgNameForInvite)}`
  const inviteLink = `https://kxb.app${joinPath}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(inviteLink)}`

  const handleCopyCode = () => {
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleRemove = (teacher: Teacher) => {
    setStaffList(prev => prev.filter(t => t.id !== teacher.id))
    setShowRemoveConfirm(null)
    setShowMenuFor(null)
  }

  const handleUnbind = (teacher: Teacher) => {
    // 将教师状态改为已离职
    setStaffList(prev => prev.map(t =>
      t.id === teacher.id ? { ...t, status: 'resigned' as const } : t
    ))
    setShowUnbindConfirm(null)
    setShowMenuFor(null)
  }

  const toggleRole = (id: string) => {
    setStaffList(prev => prev.map(t =>
      t.id === id ? { ...t, role: t.role === 'admin' ? 'teacher' : 'admin' } : t
    ))
    setShowMenuFor(null)
  }

  const getTeacherSessions = (teacherId: string) =>
    classSessions.filter(cs => cs.teacherId === teacherId)
  
  const openEditSheet = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setEditName(teacher.name)
    setEditTitle(teacher.title)
    setEditSpecialty(teacher.specialty)
    setEditPhone(teacher.phone)
    setShowMenuFor(null)
  }
  
  const handleSaveEdit = () => {
    if (!editingTeacher) return
    setStaffList(prev => prev.map(t =>
      t.id === editingTeacher.id
        ? { ...t, name: editName, title: editTitle, specialty: editSpecialty, phone: editPhone }
        : t
    ))
    setEditingTeacher(null)
  }
  
  const openRuleSheet = (teacher: Teacher) => {
    const currentRule = settlementRules[teacher.id] || { type: 'per_class', classRate: 80 }
    setShowRuleSheet(teacher)
    setRuleType(currentRule.type)
    setRuleSessionRate(currentRule.sessionRate?.toString() || '')
    setRuleClassRate(currentRule.classRate?.toString() || '')
    setRuleCommissionRate(currentRule.commissionRate?.toString() || '')
    setShowMenuFor(null)
  }
  
  const handleSaveRule = () => {
    if (!showRuleSheet) return
    const newRule: SettlementRule = { type: ruleType }
    if (ruleType === 'per_session') newRule.sessionRate = Number(ruleSessionRate) || 0
    if (ruleType === 'per_class') newRule.classRate = Number(ruleClassRate) || 0
    if (ruleType === 'commission') newRule.commissionRate = Number(ruleCommissionRate) || 0
    
    setSettlementRules(prev => ({ ...prev, [showRuleSheet.id]: newRule }))
    setRuleSaved(true)
    setTimeout(() => {
      setRuleSaved(false)
      setShowRuleSheet(null)
    }, 1500)
  }
  
  const getRuleDescription = (teacherId: string) => {
    const rule = settlementRules[teacherId]
    if (!rule) return '未设置'
    switch (rule.type) {
      case 'per_session': return `按班次 ¥${rule.sessionRate}/节`
      case 'per_class': return `按课时 ¥${rule.classRate}/节`
      case 'commission': return `按提成 ${rule.commissionRate}%`
      default: return '未设置'
    }
  }

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-3 text-center card-dream">
            <p className="text-xl font-bold">{staffList.filter(t => t.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">在职教师</p>
          </div>
          <div className="rounded-2xl bg-card p-3 text-center card-dream">
            <p className="text-xl font-bold">{staffList.filter(t => t.role === 'admin').length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">管理员</p>
          </div>
          <div className="rounded-2xl bg-slate-100/85 p-3 text-center ring-1 ring-white/70">
            <p className="text-xl font-bold text-gray-500">{staffList.filter(t => t.status === 'resigned').length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">已离职</p>
          </div>
        </div>

        {/* Teacher List */}
        {staffList.map(teacher => {
          const mySessions = getTeacherSessions(teacher.id)
          return (
            <div key={teacher.id} className="overflow-hidden rounded-3xl bg-card card-dream">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img src={teacher.avatar} alt={teacher.name} className="h-12 w-12 rounded-2xl bg-muted" />
                    {teacher.role === 'admin' && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-secondary-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{teacher.name}</span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-xs font-medium',
                        teacher.status === 'resigned'
                          ? 'bg-gray-100 text-gray-500'
                          : teacher.role === 'admin'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {teacher.status === 'resigned' ? '已离职' : teacher.role === 'admin' ? '管理员' : '教师'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{teacher.title} · {teacher.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {teacher.phone}
                    </p>
                    {/* Settlement rule badge */}
                    {teacher.status === 'active' && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Calculator className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-600 font-medium">结算规则: {getRuleDescription(teacher.id)}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowMenuFor(showMenuFor === teacher.id ? null : teacher.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Dropdown menu */}
                {showMenuFor === teacher.id && (
                  <div className="mt-3 border-t border-border pt-3">
                    {teacher.status === 'active' ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => { openEditSheet(teacher); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-left transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-muted-foreground" />
                          编辑信息
                        </button>
                        <button
                          onClick={() => { openRuleSheet(teacher); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-left transition-colors"
                        >
                          <Calculator className="w-4 h-4 text-purple-500" />
                          结算规则
                        </button>
                        <button
                          onClick={() => { toggleRole(teacher.id); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-left transition-colors"
                        >
                          <Shield className="w-4 h-4 text-secondary" />
                          {teacher.role === 'admin' ? '取消管理员' : '设为管理员'}
                        </button>
                        <div className="my-2 border-t border-border" />
                        <button
                          onClick={() => { setShowUnbindConfirm(teacher); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-sm text-left transition-colors text-gray-600"
                        >
                          <UserX className="w-4 h-4" />
                          解除绑定
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button
                          onClick={() => { router.push(`/institution/finance/teacher/${teacher.id}`); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted rounded-lg text-sm text-left transition-colors"
                        >
                          <Calculator className="w-4 h-4 text-muted-foreground" />
                          查看历史数据
                        </button>
                        <div className="my-2 border-t border-border" />
                        <button
                          onClick={() => { setShowRemoveConfirm(teacher); setShowMenuFor(null) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-red-50 rounded-lg text-sm text-left transition-colors text-red-500"
                        >
                          <UserX className="w-4 h-4" />
                          移除教师
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sessions */}
                {teacher.status === 'active' && mySessions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">负责班次（{mySessions.length}个）</p>
                    <div className="flex flex-wrap gap-2">
                      {mySessions.map(s => (
                        <span
                          key={s.id}
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${s.color}18`, color: s.color }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats row */}
              {teacher.status === 'active' && (
                <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
                  <button
                    onClick={() => router.push(`/institution/staff/${teacher.id}/students`)}
                    className="py-2.5 text-center hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-semibold">{teacher.studentCount}</p>
                    <p className="text-xs text-muted-foreground">学员数</p>
                  </button>
                  <button
                    onClick={() => router.push(`/institution/staff/${teacher.id}/classes`)}
                    className="py-2.5 text-center hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-semibold">{teacher.weeklyClasses}</p>
                    <p className="text-xs text-muted-foreground">周课时</p>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <DraggablePageActionFab
        actionId="institution-staff-invite"
        label="新增员工"
        icon={Plus}
        onClick={() => router.push('/institution/staff/invite')}
      />

      {/* Edit Teacher Sheet */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8 max-h-[85vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">编辑教师信息</h3>
              <button onClick={() => setEditingTeacher(null)} className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <img src={editingTeacher.avatar} alt={editingTeacher.name} className="w-16 h-16 rounded-full bg-muted" />
              <div>
                <p className="font-medium">{editingTeacher.name}</p>
                <p className="text-sm text-muted-foreground">{editingTeacher.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">姓名</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">职称</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="如：高级���琴教师"
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">专业方向</label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={e => setEditSpecialty(e.target.value)}
                  placeholder="如：古典钢琴"
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">手机号</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <button
              onClick={handleSaveEdit}
              className="w-full h-12 institution-btn-primary rounded-xl font-medium mt-6"
            >
              保存修改
            </button>
          </div>
        </div>
      )}

      {/* Settlement Rule Sheet */}
      {showRuleSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8 max-h-[85vh] overflow-auto">
            {ruleSaved ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold">结算规则已保存</p>
                <p className="text-sm text-muted-foreground">新规则将应用于未结算的账单</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">设置结算规则</h3>
                  <button onClick={() => setShowRuleSheet(null)} className="p-1.5 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-6 p-3 bg-muted/30 rounded-xl">
                  <img src={showRuleSheet.avatar} alt={showRuleSheet.name} className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-medium">{showRuleSheet.name}</p>
                    <p className="text-xs text-muted-foreground">{showRuleSheet.title}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium">选择结算方式</p>
                  
                  {/* Per Session */}
                  <button
                    onClick={() => setRuleType('per_session')}
                    className={cn(
                      'w-full p-4 rounded-xl text-left border-2 transition-all',
                      ruleType === 'per_session' ? 'border-purple-500 bg-purple-50' : 'border-transparent bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        ruleType === 'per_session' ? 'bg-purple-100' : 'bg-muted'
                      )}>
                        <BookOpen className={cn('w-5 h-5', ruleType === 'per_session' ? 'text-purple-600' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">按班次结算</p>
                        <p className="text-xs text-muted-foreground">固定班次单价 x 已上课班次数</p>
                      </div>
                      {ruleType === 'per_session' && <CheckCircle className="w-5 h-5 text-purple-500" />}
                    </div>
                    {ruleType === 'per_session' && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <label className="text-xs text-purple-600 block mb-1.5">每班次单价</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                          <input
                            type="number"
                            value={ruleSessionRate}
                            onChange={e => setRuleSessionRate(e.target.value)}
                            placeholder="150"
                            className="w-full h-10 pl-7 pr-12 bg-white rounded-lg text-sm outline-none border border-purple-200 focus:border-purple-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/节班</span>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {/* Per Class */}
                  <button
                    onClick={() => setRuleType('per_class')}
                    className={cn(
                      'w-full p-4 rounded-xl text-left border-2 transition-all',
                      ruleType === 'per_class' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        ruleType === 'per_class' ? 'bg-blue-100' : 'bg-muted'
                      )}>
                        <Users className={cn('w-5 h-5', ruleType === 'per_class' ? 'text-blue-600' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">按课时结算</p>
                        <p className="text-xs text-muted-foreground">固定课时单价 x 消课学员人次</p>
                      </div>
                      {ruleType === 'per_class' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    {ruleType === 'per_class' && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <label className="text-xs text-blue-600 block mb-1.5">每课时单价</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                          <input
                            type="number"
                            value={ruleClassRate}
                            onChange={e => setRuleClassRate(e.target.value)}
                            placeholder="80"
                            className="w-full h-10 pl-7 pr-16 bg-white rounded-lg text-sm outline-none border border-blue-200 focus:border-blue-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/学员课时</span>
                        </div>
                      </div>
                    )}
                  </button>
                  
                  {/* Commission */}
                  <button
                    onClick={() => setRuleType('commission')}
                    className={cn(
                      'w-full p-4 rounded-xl text-left border-2 transition-all',
                      ruleType === 'commission' ? 'border-green-500 bg-green-50' : 'border-transparent bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        ruleType === 'commission' ? 'bg-green-100' : 'bg-muted'
                      )}>
                        <Percent className={cn('w-5 h-5', ruleType === 'commission' ? 'text-green-600' : 'text-muted-foreground')} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">按提成结算</p>
                        <p className="text-xs text-muted-foreground">学员消课金额 x 提成比例</p>
                      </div>
                      {ruleType === 'commission' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    {ruleType === 'commission' && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <label className="text-xs text-green-600 block mb-1.5">提成比例</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={ruleCommissionRate}
                            onChange={e => setRuleCommissionRate(e.target.value)}
                            placeholder="40"
                            className="w-full h-10 px-4 pr-8 bg-white rounded-lg text-sm outline-none border border-green-200 focus:border-green-400"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1.5">教师获得学员每次消课金额的 {ruleCommissionRate || 0}%</p>
                      </div>
                    )}
                  </button>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-xl mb-4 flex gap-2">
                  <Calculator className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    规则调整后，仅影响未结算的账单。已结算账单不会重新计算。
                  </p>
                </div>
                
                <button
                  onClick={handleSaveRule}
                  className="w-full h-12 institution-btn-primary rounded-xl font-medium"
                >
                  保存结算规则
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invite Sheet */}
      {showInviteSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold">邀请教师加入机构</h3>
              <button onClick={() => setShowInviteSheet(false)} className="text-muted-foreground text-sm">关闭</button>
            </div>

            {/* Invite code */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">专属邀请码</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold tracking-widest text-primary">{inviteCode}</span>
                <button
                  onClick={handleCopyCode}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    copiedCode ? 'bg-green-100 text-green-600' : 'bg-secondary/10 text-secondary'
                  )}
                >
                  {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? '已复制' : '复制'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">有效期：30天 · 可无限次使用</p>
            </div>

            {/* Invite methods */}
            <p className="text-sm font-medium mb-3">选择邀请方式</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowQrCode(true)}
                className="flex flex-col items-center gap-2 p-4 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm font-medium text-secondary">生成二维码</span>
                <span className="text-xs text-secondary/70">教师扫码授权加入</span>
              </button>

              <button
                onClick={() => router.push(joinPath)}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.407-.032zM13.12 12.653c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982zm4.844 0c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-700">发送微信好友</span>
                <span className="text-xs text-green-600/70">分享授权链接</span>
              </button>

              <button
                onClick={() => {
                  try {
                    navigator.clipboard?.writeText(inviteLink)
                  } catch {
                    // Clipboard API may be blocked
                  }
                  setCopiedCode(true)
                  setTimeout(() => setCopiedCode(false), 2000)
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-700">复制邀请链接</span>
                <span className="text-xs text-blue-600/70">发送到微信/短信</span>
              </button>

              <button
                onClick={() => router.push('/institution/staff/invite')}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-700">下载邀请海报</span>
                <span className="text-xs text-purple-600/70">保存图片分享</span>
              </button>
            </div>

            {/* Share link preview */}
            <div className="bg-muted/40 rounded-xl p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-1">邀请链接</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs text-foreground truncate font-mono bg-background rounded-lg px-2 py-1.5">
                  {inviteLink}
                </div>
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard?.writeText(inviteLink)
                    } catch {
                      // Clipboard API may be blocked
                    }
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                  className="p-2 institution-btn-primary rounded-lg shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-sm font-medium text-primary mb-3">教师加入流程</p>
              <div className="space-y-3">
                {[
                  { step: 1, title: '打开邀请链接', desc: '教师点击链接进入邀请页面' },
                  { step: 2, title: '手机号登录', desc: '首次使用自动注册账号' },
                  { step: 3, title: '填写个人信息', desc: '录入姓名、职称等信息（手机号自动回填）' },
                  { step: 4, title: '绑定成功', desc: '加入机构，信息同步到员工列表' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full institution-btn-primary text-xs flex items-center justify-center shrink-0 font-medium">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              教师填写的信息将作为机构员工初始信息，您可随时在员工管理中修改
            </p>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrCode && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-6" onClick={() => setShowQrCode(false)}>
          <div className="bg-background w-full max-w-xs rounded-2xl p-6 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-4">
              <h3 className="font-semibold">教师邀请二维码</h3>
              <button onClick={() => setShowQrCode(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-48 h-48 bg-white rounded-2xl border border-border p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="教师邀请二维码" className="w-full h-full object-contain" crossOrigin="anonymous" />
            </div>
            <p className="text-sm font-medium mt-4">{orgNameForInvite}</p>
            <p className="text-xs text-muted-foreground mt-1">邀请码：{inviteCode}</p>
            <div className="mt-4 p-3 bg-primary/5 rounded-xl w-full">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                教师使用微信扫一扫，即可进入注册授权页面，验证手机号后加入机构
              </p>
            </div>
            <button
              onClick={() => { setShowQrCode(false); router.push(joinPath) }}
              className="w-full h-11 institution-btn-primary rounded-xl text-sm font-medium mt-4"
            >
              预览教师授权页面
            </button>
          </div>
        </div>
      )}

      {/* Remove Confirm */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8">
            <h3 className="text-base font-semibold mb-1">确认移除教师</h3>
            <p className="text-sm text-muted-foreground mb-6">
              移除后「{showRemoveConfirm.name}」将从员工列表中删除，其负责的班次需重新分配老师。此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveConfirm(null)} className="flex-1 h-12 bg-muted rounded-xl font-medium">取消</button>
              <button onClick={() => handleRemove(showRemoveConfirm)} className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-xl font-medium">确认移除</button>
            </div>
          </div>
        </div>
      )}

      {/* Unbind Confirm */}
      {showUnbindConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8">
            <h3 className="text-base font-semibold mb-1">确认解除绑定</h3>
            <p className="text-sm text-muted-foreground mb-4">
              解除绑定后「{showUnbindConfirm.name}」将标记为已离职状态：
            </p>
            <div className="bg-amber-50 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>教师将无法登录本机构、无法查看机构数据</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>教师将无法进行结算，未结算账单需先处理</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>机构仍可查看该教师的历史消课和结算数据</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>教师可通过邀请码重新绑定本机构</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUnbindConfirm(null)} className="flex-1 h-12 bg-muted rounded-xl font-medium">取消</button>
              <button onClick={() => handleUnbind(showUnbindConfirm)} className="flex-1 h-12 bg-gray-700 text-white rounded-xl font-medium">确认解绑</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
