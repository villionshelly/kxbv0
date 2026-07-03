'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, Calendar, Users, Receipt, Download, Send, AlertCircle, X, Edit3, Eye, CreditCard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { teachers } from '@/lib/mock-data'

// 教师消课明细
const teacherConsumptionDetails: Record<string, Array<{
  id: string
  date: string
  studentName: string
  studentAvatar: string
  courseName: string
  sessionName: string
  classes: number
  unitPrice: number
  amount: number
  status: 'settled' | 'pending' | 'confirming' | 'paid'
  settlementId?: string
}>> = {
  '1': [
    { id: 'd1', date: '2026-05-20', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'pending' },
    { id: 'd2', date: '2026-05-18', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'pending' },
    { id: 'd3', date: '2026-05-16', studentName: '小宝', studentAvatar: '/images/avatars/child-xiaobao.jpg', courseName: '钢琴进阶', sessionName: 'B班', classes: 1, unitPrice: 200, amount: 200, status: 'pending' },
    { id: 'd4', date: '2026-05-15', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'pending' },
    { id: 'd5', date: '2026-05-13', studentName: '小宝', studentAvatar: '/images/avatars/child-xiaobao.jpg', courseName: '钢琴进阶', sessionName: 'B班', classes: 1, unitPrice: 200, amount: 200, status: 'pending' },
    { id: 'd6', date: '2026-05-11', studentName: '乐乐', studentAvatar: '/images/avatars/child-lele.jpg', courseName: '乐理基础', sessionName: 'C班', classes: 1, unitPrice: 120, amount: 120, status: 'pending' },
    { id: 'd7', date: '2026-05-10', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'pending' },
    { id: 'd8', date: '2026-05-08', studentName: '天天', studentAvatar: '/images/avatars/child-tiantian.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'pending' },
    { id: 'd9', date: '2026-04-28', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', courseName: '钢琴启蒙', sessionName: 'A班', classes: 1, unitPrice: 150, amount: 150, status: 'paid', settlementId: 'S001' },
    { id: 'd10', date: '2026-04-25', studentName: '小宝', studentAvatar: '/images/avatars/child-xiaobao.jpg', courseName: '钢琴进阶', sessionName: 'B班', classes: 1, unitPrice: 200, amount: 200, status: 'paid', settlementId: 'S001' },
  ],
  '2': [
    { id: 'd11', date: '2026-05-19', studentName: '小明', studentAvatar: '/images/avatars/child-xiaoming.jpg', courseName: '小提琴入门', sessionName: '周六班', classes: 1, unitPrice: 200, amount: 200, status: 'pending' },
    { id: 'd12', date: '2026-05-17', studentName: '小红', studentAvatar: '/images/avatars/child-xiaohong.jpg', courseName: '小提琴入门', sessionName: '周六班', classes: 1, unitPrice: 180, amount: 180, status: 'pending' },
    { id: 'd13', date: '2026-05-12', studentName: '小明', studentAvatar: '/images/avatars/child-xiaoming.jpg', courseName: '小提琴入门', sessionName: '周六班', classes: 1, unitPrice: 200, amount: 200, status: 'confirming' },
    { id: 'd14', date: '2026-05-10', studentName: '小红', studentAvatar: '/images/avatars/child-xiaohong.jpg', courseName: '小提琴入门', sessionName: '周六班', classes: 1, unitPrice: 180, amount: 180, status: 'confirming' },
    { id: 'd15', date: '2026-05-05', studentName: '小明', studentAvatar: '/images/avatars/child-xiaoming.jpg', courseName: '小提琴入门', sessionName: '周六班', classes: 1, unitPrice: 200, amount: 200, status: 'confirming' },
  ],
}

// Settlement rules
const settlementRules: Record<string, { type: string; rate: number; desc: string }> = {
  '1': { type: 'per_class', rate: 80, desc: '按课时 ¥80/节' },
  '2': { type: 'per_session', rate: 150, desc: '按班次 ¥150/节' },
  '3': { type: 'commission', rate: 40, desc: '按提成 40%' },
}

export default function TeacherSettlementPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string
  const teacher = teachers.find(t => t.id === teacherId) || teachers[0]
  const details = teacherConsumptionDetails[teacherId] || []
  const rule = settlementRules[teacherId] || { type: 'per_class', rate: 80, desc: '按课时 ¥80/节' }

  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [showSettleModal, setShowSettleModal] = useState(false)
  const [settleStep, setSettleStep] = useState<'adjust' | 'confirm' | 'sent' | 'paid'>('adjust')
  
  // Adjust settlement
  const [adjustedRuleType, setAdjustedRuleType] = useState(rule.type)
  const [adjustedRate, setAdjustedRate] = useState(String(rule.rate))
  const [adjustedAmount, setAdjustedAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  
  // Preview
  const [showPreview, setShowPreview] = useState(false)
  
  // Mark paid confirm
  const [showMarkPaid, setShowMarkPaid] = useState<string | null>(null)

  // Filter by month
  const filteredDetails = details.filter(d => d.date.startsWith(selectedMonth))
  const pendingDetails = filteredDetails.filter(d => d.status === 'pending')
  const confirmingDetails = filteredDetails.filter(d => d.status === 'confirming')
  const settledDetails = filteredDetails.filter(d => d.status === 'settled' || d.status === 'paid')
  const paidDetails = filteredDetails.filter(d => d.status === 'paid')

  const pendingClasses = pendingDetails.reduce((sum, d) => sum + d.classes, 0)
  const confirmingClasses = confirmingDetails.reduce((sum, d) => sum + d.classes, 0)
  
  // Calculate based on rule
  const calculateAmount = (classes: number, ruleType: string, rate: number) => {
    if (ruleType === 'per_class') return classes * rate
    if (ruleType === 'per_session') {
      // Unique sessions
      const sessions = new Set(pendingDetails.map(d => d.date + d.sessionName))
      return sessions.size * rate
    }
    if (ruleType === 'commission') {
      const totalConsumption = pendingDetails.reduce((sum, d) => sum + d.amount, 0)
      return Math.round(totalConsumption * rate / 100)
    }
    return 0
  }
  
  const baseAmount = calculateAmount(pendingClasses, rule.type, rule.rate)
  const finalAmount = adjustedAmount ? Number(adjustedAmount) : calculateAmount(pendingClasses, adjustedRuleType, Number(adjustedRate))
  const confirmingAmount = confirmingDetails.reduce((sum, d) => sum + d.amount, 0) // This would be recalculated based on rule
  const settledAmount = settledDetails.reduce((sum, d) => sum + d.amount, 0)

  const handleOpenSettle = () => {
    setAdjustedRuleType(rule.type)
    setAdjustedRate(String(rule.rate))
    setAdjustedAmount('')
    setAdjustReason('')
    setSettleStep('adjust')
    setShowSettleModal(true)
  }

  const handleSendConfirmation = () => {
    setSettleStep('sent')
  }
  
  const handleMarkAsPaid = () => {
    setShowMarkPaid(null)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">教师消课对账</h1>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            预览结算单
          </button>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="text-sm bg-muted/50 rounded-lg px-3 py-1.5 outline-none"
          >
            <option value="2026-05">2026年5月</option>
            <option value="2026-04">2026年4月</option>
            <option value="2026-03">2026年3月</option>
          </select>
        </div>
      </header>

      {/* Teacher Info */}
      <div className="px-4 py-4 bg-gradient-to-br from-purple-500/10 to-blue-500/5">
        <div className="flex items-center gap-4">
          <img src={teacher.avatar} alt={teacher.name} className="w-16 h-16 rounded-full bg-muted ring-2 ring-purple-200" />
          <div className="flex-1">
            <p className="text-lg font-bold">{teacher.name}</p>
            <p className="text-sm text-muted-foreground">{teacher.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                结算规则: {rule.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-background rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-purple-600">{pendingClasses}</p>
            <p className="text-[10px] text-muted-foreground">待结算</p>
          </div>
          <div className="bg-background rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-amber-600">{confirmingClasses}</p>
            <p className="text-[10px] text-muted-foreground">确认中</p>
          </div>
          <div className="bg-background rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-blue-600">¥{baseAmount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">预计金额</p>
          </div>
          <div className="bg-background rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-green-600">¥{settledAmount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">已支付</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {/* Confirming - waiting teacher confirmation */}
        {confirmingDetails.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                待教师确认
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">24h后自动确认</span>
              </h3>
              <span className="text-xs text-muted-foreground">{confirmingDetails.length}条</span>
            </div>
            <div className="space-y-2">
              {confirmingDetails.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <img src={item.studentAvatar} alt={item.studentName} className="w-9 h-9 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.studentName}</p>
                    <p className="text-xs text-muted-foreground">{item.courseName} · {item.sessionName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">¥{item.amount}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMarkPaid('confirming')}
              className="w-full mt-3 h-10 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              标记已支付
            </button>
          </div>
        )}
        
        {/* Pending */}
        {pendingDetails.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-500" />
                待结算明细
              </h3>
              <span className="text-xs text-muted-foreground">{pendingDetails.length}条</span>
            </div>
            <div className="space-y-2">
              {pendingDetails.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <img src={item.studentAvatar} alt={item.studentName} className="w-9 h-9 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.studentName}</p>
                    <p className="text-xs text-muted-foreground">{item.courseName} · {item.sessionName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">¥{item.amount}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid */}
        {paidDetails.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                已支付
              </h3>
              <span className="text-xs text-muted-foreground">{paidDetails.length}条</span>
            </div>
            <div className="space-y-2">
              {paidDetails.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl opacity-60">
                  <img src={item.studentAvatar} alt={item.studentName} className="w-9 h-9 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.studentName}</p>
                    <p className="text-xs text-muted-foreground">{item.courseName} · {item.sessionName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">¥{item.amount}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredDetails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="w-12 h-12 opacity-30 mb-3" />
            <p className="text-sm">暂无消课记录</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {pendingDetails.length > 0 && (
        <div className="px-4 py-4 border-t border-border bg-background safe-area-bottom">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm text-muted-foreground">预计结算金额</span>
              <p className="text-xs text-muted-foreground mt-0.5">{rule.desc}</p>
            </div>
            <span className="text-xl font-bold text-purple-600">¥{baseAmount.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-11 border border-border rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              导出明细
            </button>
            <button
              onClick={handleOpenSettle}
              className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              发起结算
            </button>
          </div>
        </div>
      )}

      {/* Settle Modal - with adjustment support */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[90vh] overflow-auto">
            {settleStep === 'sent' ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <Send className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold">结算已发送确认</p>
                <p className="text-sm text-muted-foreground">已发送给 {teacher.name}，24小时内无异议将自动确认</p>
                <button
                  onClick={() => setShowSettleModal(false)}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
                >
                  关闭
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">发起结算</h3>
                  <button onClick={() => setShowSettleModal(false)} className="p-1.5 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Teacher info */}
                <div className="p-3 bg-muted/30 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{pendingClasses}课时</p>
                      <p className="text-xs text-muted-foreground">{selectedMonth}</p>
                    </div>
                  </div>
                </div>
                
                {/* Rule adjustment */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">结算规则调整</p>
                    <span className="text-xs text-muted-foreground">当前: {rule.desc}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { type: 'per_class', label: '按课时' },
                      { type: 'per_session', label: '按班次' },
                      { type: 'commission', label: '按提成' },
                    ].map(opt => (
                      <button
                        key={opt.type}
                        onClick={() => setAdjustedRuleType(opt.type)}
                        className={cn(
                          'py-2 rounded-lg text-xs font-medium transition-colors',
                          adjustedRuleType === opt.type
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {adjustedRuleType === 'commission' ? '' : '¥'}
                    </span>
                    <input
                      type="number"
                      value={adjustedRate}
                      onChange={e => setAdjustedRate(e.target.value)}
                      className={cn(
                        'w-full h-11 pr-16 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200',
                        adjustedRuleType === 'commission' ? 'px-4' : 'pl-7'
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {adjustedRuleType === 'per_class' && '/学员课时'}
                      {adjustedRuleType === 'per_session' && '/班次'}
                      {adjustedRuleType === 'commission' && '%'}
                    </span>
                  </div>
                </div>
                
                {/* Direct amount adjustment */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">或直接调整结算金额</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                    <input
                      type="number"
                      value={adjustedAmount}
                      onChange={e => setAdjustedAmount(e.target.value)}
                      placeholder={String(calculateAmount(pendingClasses, adjustedRuleType, Number(adjustedRate)))}
                      className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">留空则按规则自动计算</p>
                </div>
                
                {/* Adjustment reason */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">调整说明（选填）</p>
                  <textarea
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="如有金额调整请说明原因..."
                    rows={2}
                    className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                  />
                </div>
                
                {/* Summary */}
                <div className="p-4 bg-purple-50 rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">结算课时</span>
                    <span className="font-medium">{pendingClasses} 课时</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">结算规则</span>
                    <span className="font-medium">
                      {adjustedRuleType === 'per_class' && `按课时 ¥${adjustedRate}/节`}
                      {adjustedRuleType === 'per_session' && `按班次 ¥${adjustedRate}/节`}
                      {adjustedRuleType === 'commission' && `按提成 ${adjustedRate}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                    <span className="font-medium">结算金额</span>
                    <span className="text-xl font-bold text-purple-600">¥{finalAmount.toLocaleString()}</span>
                  </div>
                  {(baseAmount !== finalAmount) && (
                    <p className="text-xs text-purple-600 mt-1 text-right">
                      原计算金额: ¥{baseAmount.toLocaleString()}，调整差额: {finalAmount > baseAmount ? '+' : ''}¥{(finalAmount - baseAmount).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl mb-4 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    结算信息将发送给教师确认。教师24小时内未提异议将自动确认结算。确认后可标记已支付。
                  </p>
                </div>

                <button
                  onClick={handleSendConfirmation}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  发送结算确认给教师
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Settlement Statement (Teacher View) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-sm rounded-2xl overflow-hidden max-h-[85vh] overflow-auto">
            {/* Header - looks like a receipt */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white px-4 py-6 text-center">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-80" />
              <h3 className="text-lg font-bold">结算单预览</h3>
              <p className="text-sm opacity-80">教师视角</p>
            </div>
            
            <div className="px-4 py-4">
              {/* Teacher info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dashed border-border">
                <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-full bg-muted" />
                <div>
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.title}</p>
                </div>
              </div>
              
              {/* Period */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">结算周期</span>
                <span className="font-medium">{selectedMonth.replace('-', '年')}月</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">结算规则</span>
                <span className="font-medium">{rule.desc}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted-foreground">消课课时</span>
                <span className="font-medium">{pendingClasses} 课时</span>
              </div>
              
              {/* Details */}
              <div className="bg-muted/30 rounded-xl p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-2">消课明细</p>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {pendingDetails.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span>{item.date} · {item.studentName}</span>
                      <span className="text-muted-foreground">1课时</span>
                    </div>
                  ))}
                  {pendingDetails.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">... 等共 {pendingDetails.length} 条记录</p>
                  )}
                </div>
              </div>
              
              {/* Total */}
              <div className="bg-purple-50 rounded-xl p-4 text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">应结金额</p>
                <p className="text-3xl font-bold text-purple-600">¥{baseAmount.toLocaleString()}</p>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mb-4">
                此为预览，实际结算以最终确认为准
              </p>
              
              <button
                onClick={() => setShowPreview(false)}
                className="w-full h-11 bg-muted rounded-xl font-medium"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Paid Confirmation */}
      {showMarkPaid && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8">
            <h3 className="text-base font-semibold mb-1">确认标记已支付</h3>
            <p className="text-sm text-muted-foreground mb-6">
              确认已向 {teacher.name} 支付本期结算款项？标记后状态将变更为已支付。
            </p>
            <div className="p-3 bg-green-50 rounded-xl mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">支付金额</span>
                <span className="text-xl font-bold text-green-600">
                  ¥{(showMarkPaid === 'confirming' ? confirmingAmount : 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowMarkPaid(null)} className="flex-1 h-12 bg-muted rounded-xl font-medium">取消</button>
              <button onClick={handleMarkAsPaid} className="flex-1 h-12 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                确认已支付
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
