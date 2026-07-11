'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, CheckCircle, XCircle, X, Edit3, Send, Clock, AlertTriangle, Wallet, ChevronDown } from 'lucide-react'
import { students, courseCatalog } from '@/lib/mock-data'
import { type PurchaseRecord, type PurchaseRecordStatus, useStudentPurchaseRecords } from '@/lib/purchase-record-store'
import { cn } from '@/lib/utils'
import { DraggablePageActionFab } from '@/components/draggable-page-action-fab'

export default function PurchaseRecordsPage() {
  const params = useParams()
  const router = useRouter()
  const student = students.find(s => s.id === params.id) || students[0]
  const studentId = String(params.id || student.id)

  const { records: purchaseRecords, setPurchaseRecords } = useStudentPurchaseRecords(studentId)
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [showRefund, setShowRefund] = useState<PurchaseRecord | null>(null)
  const [showConfirmComplete, setShowConfirmComplete] = useState<PurchaseRecord | null>(null)
  const [showCorrection, setShowCorrection] = useState<PurchaseRecord | null>(null)
  const [correctionSent, setCorrectionSent] = useState(false)
  const [pendingCorrections, setPendingCorrections] = useState<string[]>([])

  // Add purchase form
  const [newPurchaseDate, setNewPurchaseDate] = useState('')
  const [newPackageName, setNewPackageName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newTotalClassesInput, setNewTotalClassesInput] = useState('')
  const [newUsedClasses, setNewUsedClasses] = useState('')
  const [newValidFrom, setNewValidFrom] = useState('')
  const [newValidTo, setNewValidTo] = useState('')
  const [newNote, setNewNote] = useState('')
  const [newStatus, setNewStatus] = useState<PurchaseRecordStatus>('active')

  // Refund form
  const [refundReason, setRefundReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')

  // Correction form
  const [correctedAmount, setCorrectedAmount] = useState('')
  const [correctedTotalClasses, setCorrectedTotalClasses] = useState('')
  const [correctedUsedClasses, setCorrectedUsedClasses] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')

  // Calculate totals
  const activeRecords = purchaseRecords.filter(r => r.status === 'active')
  const totalRemainingClasses = activeRecords.reduce((sum, r) => sum + r.remainingClasses, 0)
  const totalRemainingValue = activeRecords.reduce((sum, r) => sum + r.remainingClasses * r.unitPrice, 0)
  const totalPaid = purchaseRecords.filter(r => r.status !== 'refunded').reduce((sum, r) => sum + r.amount, 0)
  const totalRefunded = purchaseRecords.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.amount, 0)

  const getCourseNameFromPackage = (packageName: string) => {
    const matchedCourse = courseCatalog.find(course => packageName.includes(course.name))
    return matchedCourse?.name || packageName.replace(/(课包|续费|课程)$/g, '') || packageName
  }

  const handleAddPurchase = () => {
    if (!newPurchaseDate || !newPackageName || !newAmount || !newTotalClassesInput || !newValidFrom || !newValidTo) return
    if (newValidTo < newValidFrom) return

    const totalCls = Number(newTotalClassesInput)
    const usedCls = Number(newUsedClasses) || 0
    const remainingCls = totalCls - usedCls
    const unitPrice = Math.round(Number(newAmount) / totalCls)

    const newRecord: PurchaseRecord = {
      id: `pr${Date.now()}`,
      studentId,
      date: newPurchaseDate,
      courseName: getCourseNameFromPackage(newPackageName),
      packageName: newPackageName,
      amount: Number(newAmount),
      totalClasses: totalCls,
      usedClasses: usedCls,
      remainingClasses: remainingCls,
      unitPrice,
      validFrom: newValidFrom,
      validTo: newValidTo,
      validPeriod: `${newValidFrom} 至 ${newValidTo}`,
      status: remainingCls === 0 ? 'completed' : newStatus,
      note: newNote,
      source: 'manual',
    }

    setPurchaseRecords(prev => [newRecord, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    setShowAddPurchase(false)
    resetPurchaseForm()
  }

  const resetPurchaseForm = () => {
    setNewPurchaseDate('')
    setNewPackageName('')
    setNewAmount('')
    setNewTotalClassesInput('')
    setNewUsedClasses('')
    setNewValidFrom('')
    setNewValidTo('')
    setNewNote('')
    setNewStatus('active')
    setShowCourseDropdown(false)
  }

  const handleRefund = () => {
    if (!showRefund) return
    setPurchaseRecords(prev => prev.map(r =>
      r.id === showRefund.id
        ? { ...r, status: 'refunded' as const, note: r.note + (refundReason ? ` | 退课原因: ${refundReason}, 退款: ¥${refundAmount}` : '') }
        : r
    ))
    setShowRefund(null)
    setRefundReason('')
    setRefundAmount('')
  }

  const confirmMarkComplete = () => {
    if (!showConfirmComplete) return
    setPurchaseRecords(prev => prev.map(r =>
      r.id === showConfirmComplete.id
        ? { ...r, status: 'completed' as const, usedClasses: r.totalClasses, remainingClasses: 0 }
        : r
    ))
    setShowConfirmComplete(null)
  }

  const handleSubmitCorrection = () => {
    if (!showCorrection) return
    
    const newTotalCls = Number(correctedTotalClasses) || showCorrection.totalClasses
    const newUsedCls = Number(correctedUsedClasses) || showCorrection.usedClasses
    const newAmt = Number(correctedAmount) || showCorrection.amount
    
    setPurchaseRecords(prev => prev.map(r =>
      r.id === showCorrection.id
        ? {
            ...r,
            amount: newAmt,
            totalClasses: newTotalCls,
            usedClasses: newUsedCls,
            remainingClasses: newTotalCls - newUsedCls,
            unitPrice: Math.round(newAmt / newTotalCls),
            note: r.note + (correctionReason ? ` | 矫正: ${correctionReason}` : ' | 已矫正'),
          }
        : r
    ))
    
    setPendingCorrections(prev => [...prev, showCorrection.id])
    setCorrectionSent(true)
    
    setTimeout(() => {
      setShowCorrection(null)
      setCorrectionSent(false)
      setCorrectedAmount('')
      setCorrectedTotalClasses('')
      setCorrectedUsedClasses('')
      setCorrectionReason('')
    }, 2000)
  }

  const openCorrection = (record: PurchaseRecord) => {
    setShowCorrection(record)
    setCorrectedAmount(String(record.amount))
    setCorrectedTotalClasses(String(record.totalClasses))
    setCorrectedUsedClasses(String(record.usedClasses))
    setCorrectionReason('')
  }

  const getStatusBadge = (status: PurchaseRecordStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">进行中</span>
      case 'completed':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">已完成</span>
      case 'refunded':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已退课</span>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">购买记录</h1>
            <p className="text-xs text-muted-foreground">{student.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">剩余价值</span>
            </div>
            <p className="text-2xl font-bold text-green-600">¥{totalRemainingValue.toLocaleString()}</p>
            <p className="text-xs text-green-600/70 mt-0.5">{totalRemainingClasses} 课时</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-blue-700">累计付费</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">¥{totalPaid.toLocaleString()}</p>
            {totalRefunded > 0 && (
              <p className="text-xs text-red-500 mt-0.5">已退 ¥{totalRefunded}</p>
            )}
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3">
          {purchaseRecords.map(record => (
            <div key={record.id} className={cn(
              'p-4 rounded-xl border',
              record.status === 'refunded' ? 'bg-red-50/50 border-red-100' :
              record.status === 'completed' ? 'bg-gray-50 border-gray-100' :
              'bg-white border-border shadow-sm'
            )}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{record.packageName}</span>
                    {getStatusBadge(record.status)}
                    {pendingCorrections.includes(record.id) && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        待确认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{record.date}</p>
                  <p className="mt-1 text-xs text-muted-foreground">有效期：{record.validPeriod}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-xl font-bold',
                    record.status === 'refunded' ? 'text-red-500 line-through' : 'text-foreground'
                  )}>¥{record.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold">{record.totalClasses}</p>
                  <p className="text-[10px] text-muted-foreground">总课时</p>
                </div>
                <div className="text-center border-x border-border/50">
                  <p className="text-lg font-bold">{record.usedClasses}</p>
                  <p className="text-[10px] text-muted-foreground">已使用</p>
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-lg font-bold',
                    record.remainingClasses > 0 && record.status === 'active' ? 'text-green-600' : ''
                  )}>{record.remainingClasses}</p>
                  <p className="text-[10px] text-muted-foreground">剩余</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">¥{record.unitPrice}/课时</span>
                  {record.source === 'manual' && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">手动录入</span>
                  )}
                  {record.source === 'system' && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">系统</span>
                  )}
                </div>

                {record.status !== 'refunded' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openCorrection(record)}
                      className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-blue-600 transition-colors"
                      title="矫正记录"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {record.status === 'active' && (
                      <>
                        <button
                          onClick={() => setShowConfirmComplete(record)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-green-600 transition-colors"
                          title="标记完成"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowRefund(record)
                            setRefundAmount(String(record.remainingClasses * record.unitPrice))
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                          title="退课退款"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {record.note && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 italic">{record.note}</p>
              )}

              {pendingCorrections.includes(record.id) && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center gap-2 text-xs text-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>矫正已发送家长确认，24小时内未回复将自动生效</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddPurchase && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">添加购买记录</h3>
              <button onClick={() => { setShowAddPurchase(false); resetPurchaseForm() }} className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">购买日期 *</label>
                <input
                  type="date"
                  value={newPurchaseDate}
                  onChange={e => {
                    setNewPurchaseDate(e.target.value)
                    if (!newValidFrom) setNewValidFrom(e.target.value)
                  }}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">支持录入历史日期（如去年的付款记录）</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">选择课程 *</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                    className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm text-left flex items-center justify-between"
                  >
                    <span className={newPackageName ? 'text-foreground' : 'text-muted-foreground'}>
                      {newPackageName || '请选择课程'}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showCourseDropdown && 'rotate-180')} />
                  </button>
                  {showCourseDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-auto">
                      {courseCatalog.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setNewPackageName(`${c.name}课包`); setShowCourseDropdown(false) }}
                          className={cn(
                            'w-full px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors flex items-center justify-between',
                            newPackageName === `${c.name}课包` && 'bg-secondary/10'
                          )}
                        >
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.category} · ¥{c.price}/课时</p>
                          </div>
                          {newPackageName === `${c.name}课包` && <CheckCircle className="w-4 h-4 text-secondary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">只能选择已有课程，不支持自定义课程名称</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">付款金额 *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                    <input
                      type="number"
                      placeholder="3000"
                      value={newAmount}
                      onChange={e => setNewAmount(e.target.value)}
                      className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">课时数量 *</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="34"
                      value={newTotalClassesInput}
                      onChange={e => setNewTotalClassesInput(e.target.value)}
                      className="w-full h-11 px-4 pr-10 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                  </div>
                </div>
              </div>

              {/* Unit price calculation */}
              {newAmount && newTotalClassesInput && Number(newTotalClassesInput) > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">计算单价</span>
                    <span className="text-lg font-bold text-green-600">
                      ¥{Math.round(Number(newAmount) / Number(newTotalClassesInput))}/课时
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">已使用课时（旧学员转移）</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    value={newUsedClasses}
                    onChange={e => setNewUsedClasses(e.target.value)}
                    className="w-full h-11 px-4 pr-10 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {newTotalClassesInput && (
                    <>剩余: {Number(newTotalClassesInput) - (Number(newUsedClasses) || 0)} 节</>
                  )}
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">课包有效期 *</label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="date"
                    value={newValidFrom}
                    onChange={e => setNewValidFrom(e.target.value)}
                    className="h-11 min-w-0 rounded-xl bg-muted/40 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs text-muted-foreground">至</span>
                  <input
                    type="date"
                    value={newValidTo}
                    min={newValidFrom || undefined}
                    onChange={e => setNewValidTo(e.target.value)}
                    className="h-11 min-w-0 rounded-xl bg-muted/40 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {newValidFrom && newValidTo && newValidTo < newValidFrom && (
                  <p className="mt-1 text-xs text-red-500">结束日期不能早于开始日期</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">创建模板合同时会自动作为服务周期带入。</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">记录状态</label>
                <div className="flex gap-2">
                  {[
                    { value: 'active', label: '进行中', color: 'bg-green-100 text-green-700 border-green-200' },
                    { value: 'completed', label: '已完成', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewStatus(opt.value as PurchaseRecordStatus)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm border-2 transition-all',
                        newStatus === opt.value ? opt.color + ' border-current' : 'bg-muted/30 text-muted-foreground border-transparent'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">备注</label>
                <textarea
                  placeholder="如：首次购买，9月消费完成"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                onClick={handleAddPurchase}
                disabled={!newPurchaseDate || !newPackageName || !newAmount || !newTotalClassesInput || !newValidFrom || !newValidTo || newValidTo < newValidFrom}
                className="w-full h-12 institution-btn-primary rounded-xl font-medium disabled:opacity-40"
              >
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Complete Modal */}
      {showConfirmComplete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-sm rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg">确认标记完成？</h3>
              <p className="text-sm text-muted-foreground mt-2">
                将「{showConfirmComplete.packageName}」标记为已完成，剩余 {showConfirmComplete.remainingClasses} 课时将清零。
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-xl mb-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">此操作不可撤销，请确认该课包课时确已使用完毕。</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmComplete(null)}
                className="flex-1 h-11 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmMarkComplete}
                className="flex-1 h-11 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefund && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">退课退款</h3>
              <button onClick={() => { setShowRefund(null); setRefundReason(''); setRefundAmount('') }} className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm font-medium text-red-800 mb-2">{showRefund.packageName}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-600/70">剩余课时</span>
                    <p className="font-bold text-red-700">{showRefund.remainingClasses} 节</p>
                  </div>
                  <div>
                    <span className="text-red-600/70">剩余价值</span>
                    <p className="font-bold text-red-700">¥{(showRefund.remainingClasses * showRefund.unitPrice).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">实际退款金额</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">退课原因</label>
                <textarea
                  placeholder="如：学员转学、时间冲突等"
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                onClick={handleRefund}
                className="w-full h-12 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                确认退课退款
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correction Modal */}
      {showCorrection && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[90vh] overflow-auto">
            {correctionSent ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <Send className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold">矫正通知已发送</p>
                <p className="text-sm text-muted-foreground">已发送给家长 {student.parentName}，24小时内未回复将自动生效</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">矫正记录</h3>
                  <button onClick={() => setShowCorrection(null)} className="p-1.5 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current values */}
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-2">当前记录 - {showCorrection.packageName}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">金额</span>
                        <p className="font-medium">¥{showCorrection.amount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">总课时</span>
                        <p className="font-medium">{showCorrection.totalClasses}节</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">已使用</span>
                        <p className="font-medium">{showCorrection.usedClasses}节</p>
                      </div>
                    </div>
                  </div>

                  {/* New values */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">矫正后数值</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">付款金额</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                          <input
                            type="number"
                            value={correctedAmount}
                            onChange={e => setCorrectedAmount(e.target.value)}
                            className="w-full h-11 pl-7 pr-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">总课时</label>
                          <input
                            type="number"
                            value={correctedTotalClasses}
                            onChange={e => setCorrectedTotalClasses(e.target.value)}
                            className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">已使用</label>
                          <input
                            type="number"
                            value={correctedUsedClasses}
                            onChange={e => setCorrectedUsedClasses(e.target.value)}
                            className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview changes */}
                  {(correctedAmount !== String(showCorrection.amount) || 
                    correctedTotalClasses !== String(showCorrection.totalClasses) ||
                    correctedUsedClasses !== String(showCorrection.usedClasses)) && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 mb-2">变更预览</p>
                      <div className="space-y-1 text-sm">
                        {correctedAmount !== String(showCorrection.amount) && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">金额:</span>
                            <span className="line-through text-muted-foreground">¥{showCorrection.amount}</span>
                            <span className="text-blue-600">→</span>
                            <span className="font-bold text-blue-600">¥{correctedAmount}</span>
                          </div>
                        )}
                        {correctedTotalClasses !== String(showCorrection.totalClasses) && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">总课时:</span>
                            <span className="line-through text-muted-foreground">{showCorrection.totalClasses}</span>
                            <span className="text-blue-600">→</span>
                            <span className="font-bold text-blue-600">{correctedTotalClasses}</span>
                          </div>
                        )}
                        {correctedUsedClasses !== String(showCorrection.usedClasses) && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">已使用:</span>
                            <span className="line-through text-muted-foreground">{showCorrection.usedClasses}</span>
                            <span className="text-blue-600">→</span>
                            <span className="font-bold text-blue-600">{correctedUsedClasses}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1 border-t border-blue-200 mt-1">
                          <span className="text-muted-foreground">剩余课时:</span>
                          <span className="font-bold text-blue-600">
                            {(Number(correctedTotalClasses) || showCorrection.totalClasses) - (Number(correctedUsedClasses) || showCorrection.usedClasses)} 节
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">矫正原因（选填）</label>
                    <textarea
                      value={correctionReason}
                      onChange={e => setCorrectionReason(e.target.value)}
                      placeholder="如：核对实际上课记录后调整"
                      rows={2}
                      className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Notice */}
                  <div className="p-3 bg-amber-50 rounded-xl flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      <p className="font-medium mb-1">矫正流程说明</p>
                      <p>1. 提交后将发送通知给家长 {student.parentName}</p>
                      <p>2. 家长可在24小时内确认或提出异议</p>
                      <p>3. 24小时未回复将视为默认同意，自动生效</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitCorrection}
                    disabled={
                      correctedAmount === String(showCorrection.amount) &&
                      correctedTotalClasses === String(showCorrection.totalClasses) &&
                      correctedUsedClasses === String(showCorrection.usedClasses)
                    }
                    className="w-full h-12 institution-btn-primary rounded-xl font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    发送矫正通知给家长
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <DraggablePageActionFab
        actionId="institution-purchase-record-create"
        label="添加购买记录"
        icon={Plus}
        onClick={() => setShowAddPurchase(true)}
      />
    </div>
  )
}
