'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, BookOpen, Clock, MessageCircle, AlertTriangle, Edit3, X, Send, CreditCard, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { students, classRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const student = students.find(s => s.id === params.id) || students[0]
  
  const [showCorrection, setShowCorrection] = useState(false)
  const [newRemainingClasses, setNewRemainingClasses] = useState(String(student.remainingClasses))
  const [newTotalClasses, setNewTotalClasses] = useState(String(student.totalClasses))
  const [correctionReason, setCorrectionReason] = useState('')
  const [correctionSent, setCorrectionSent] = useState(false)
  const [correctionPending, setCorrectionPending] = useState(false)
  
  const progressPercent = (student.remainingClasses / student.totalClasses) * 100
  const isWarning = progressPercent < 20

  // Mock calculated values (in real app, these would come from purchase records)
  const totalRemainingValue = student.remainingClasses * 100 // Assuming ¥100/class average

  const handleSubmitCorrection = () => {
    setCorrectionSent(true)
    setCorrectionPending(true)
    setTimeout(() => {
      setShowCorrection(false)
      setCorrectionSent(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">学员详情</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Student Info with Purchase Records Entry */}
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={student.avatar} 
            alt={student.name}
            className="w-16 h-16 rounded-full bg-muted"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{student.name}</h2>
              {student.status === 'warning' && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">待续费</span>
              )}
              {student.status === 'expired' && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">已过期</span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{student.courses.join('、')}</p>
          </div>
          {/* Purchase Records Entry */}
          <button
            onClick={() => router.push(`/institution/students/${params.id}/purchase-records`)}
            className="flex flex-col items-center gap-1 p-2 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] text-muted-foreground">购买记录</span>
          </button>
        </div>

        {/* Warning Banner */}
        {isWarning && (
          <div className="bg-orange-50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-primary">课时即将耗尽</div>
              <div className="text-sm text-muted-foreground mt-1">
                剩余{student.remainingClasses}课时，建议尽快联系家长续费
              </div>
            </div>
          </div>
        )}

        {/* Course Progress & Value */}
        <div className="bg-muted/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">课时进度</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                剩余 <span className={isWarning ? 'text-primary font-bold' : 'font-bold'}>{student.remainingClasses}</span> / {student.totalClasses} 课时
              </span>
              <button
                onClick={() => setShowCorrection(true)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                title="矫正课时"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full rounded-full transition-all ${isWarning ? 'bg-primary' : 'bg-secondary'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Value display */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">剩余价值</span>
            </div>
            <span className="text-lg font-bold text-green-600">¥{totalRemainingValue.toLocaleString()}</span>
          </div>
          
          {correctionPending && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
              <Clock className="w-3 h-3" />
              <span>课时矫正已发送家长确认，24小时内未回复将自动生效</span>
            </div>
          )}
        </div>

        {/* Parent Info */}
        <div className="bg-muted/20 rounded-xl p-4 mb-4">
          <h3 className="font-medium mb-3">家长信息</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{student.parentName}</div>
              <div className="text-sm text-muted-foreground">{student.parentPhone}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1">
                <Phone className="w-4 h-4" />
                电话
              </Button>
              <Button size="sm" variant="outline" className="gap-1">
                <MessageCircle className="w-4 h-4" />
                消息
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{student.totalClasses - student.remainingClasses}</div>
            <div className="text-xs text-muted-foreground mt-1">已上课时</div>
          </div>
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-xs text-muted-foreground mt-1">请假次数</div>
          </div>
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-foreground">98%</div>
            <div className="text-xs text-muted-foreground mt-1">出勤率</div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">上课记录</h3>
          <div className="space-y-2">
            {classRecords.slice(0, 3).map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{record.courseName}</div>
                  <div className="text-xs text-muted-foreground">{record.date}</div>
                </div>
                <div className="text-sm text-muted-foreground">-{record.deduction}课时</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Button variant="outline" className="h-12" onClick={() => router.push(`/institution/students/${params.id}/renew`)}>
            续费登记
          </Button>
          <Button className="h-12" onClick={() => router.push(`/institution/ai/renewal?student=${params.id}`)}>
            AI续费话术
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full h-12 gap-2"
          onClick={() => router.push(`/institution/students/${params.id}/add-course`)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          为该学员添加课程 / 加入班级
        </Button>
      </div>

      {/* Correction Modal */}
      {showCorrection && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8 max-h-[85vh] overflow-auto">
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
                  <h3 className="font-semibold text-lg">课时矫正</h3>
                  <button onClick={() => setShowCorrection(false)} className="p-1.5 hover:bg-muted rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current status */}
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-2">当前课时状态</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">剩余课时</span>
                      <span className="font-bold">{student.remainingClasses} 节</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">总课时</span>
                      <span className="font-bold">{student.totalClasses} 节</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">已消耗</span>
                      <span className="font-bold">{student.totalClasses - student.remainingClasses} 节</span>
                    </div>
                  </div>

                  {/* New values */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">矫正后数值</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">剩余课时</label>
                        <input
                          type="number"
                          value={newRemainingClasses}
                          onChange={e => setNewRemainingClasses(e.target.value)}
                          className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">总课时</label>
                        <input
                          type="number"
                          value={newTotalClasses}
                          onChange={e => setNewTotalClasses(e.target.value)}
                          className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Change preview */}
                  {(newRemainingClasses !== String(student.remainingClasses) || newTotalClasses !== String(student.totalClasses)) && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-600 mb-2">变更预览</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">剩余:</span>
                        <span className="line-through text-muted-foreground">{student.remainingClasses}</span>
                        <span className="text-blue-600">→</span>
                        <span className="font-bold text-blue-600">{newRemainingClasses}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          Number(newRemainingClasses) > student.remainingClasses 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        )}>
                          {Number(newRemainingClasses) > student.remainingClasses ? '+' : ''}{Number(newRemainingClasses) - student.remainingClasses}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-muted-foreground">总计:</span>
                        <span className="line-through text-muted-foreground">{student.totalClasses}</span>
                        <span className="text-blue-600">→</span>
                        <span className="font-bold text-blue-600">{newTotalClasses}</span>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">矫正原因（选填）</label>
                    <textarea
                      value={correctionReason}
                      onChange={e => setCorrectionReason(e.target.value)}
                      placeholder="如：系统数据有误，根据实际上课记录核对后矫正"
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
                    disabled={newRemainingClasses === String(student.remainingClasses) && newTotalClasses === String(student.totalClasses)}
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
    </div>
  )
}
