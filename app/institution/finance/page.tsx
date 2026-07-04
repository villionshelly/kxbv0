'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Receipt, Users, ChevronRight, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { teachers } from '@/lib/mock-data'

// Mock financial data
const monthlyIncome = [
  { id: '1', studentName: '朵朵', studentAvatar: '/images/avatars/child-duoduo.jpg', packageName: '钢琴启蒙', amount: 7200, classes: 48, date: '2026-05-15', type: 'new' },
  { id: '2', studentName: '小宝', studentAvatar: '/images/avatars/child-xiaobao.jpg', packageName: '钢琴进阶', amount: 9600, classes: 48, date: '2026-05-12', type: 'renew' },
  { id: '3', studentName: '乐乐', studentAvatar: '/images/avatars/child-lele.jpg', packageName: '乐理基础', amount: 2880, classes: 24, date: '2026-05-08', type: 'new' },
  { id: '4', studentName: '小明', studentAvatar: '/images/avatars/child-xiaoming.jpg', packageName: '小提琴入门', amount: 7200, classes: 36, date: '2026-05-03', type: 'renew' },
]

// 本月消课明细 - 每个学员的单价可能不同
const monthlyConsumption = [
  { id: 'c1', studentName: '朵朵', courseName: '钢琴启蒙', classes: 8, unitPrice: 150, totalAmount: 1200, teacherId: '1', teacherName: '李雪' },
  { id: 'c2', studentName: '小宝', courseName: '钢琴进阶', classes: 6, unitPrice: 200, totalAmount: 1200, teacherId: '1', teacherName: '李雪' },
  { id: 'c3', studentName: '乐乐', courseName: '乐理基础', classes: 4, unitPrice: 120, totalAmount: 480, teacherId: '1', teacherName: '李雪' },
  { id: 'c4', studentName: '小明', courseName: '小提琴入门', classes: 5, unitPrice: 200, totalAmount: 1000, teacherId: '2', teacherName: '王明' },
  { id: 'c5', studentName: '小红', courseName: '小提琴入门', classes: 4, unitPrice: 180, totalAmount: 720, teacherId: '2', teacherName: '王明' },
  { id: 'c6', studentName: '天天', courseName: '钢琴启蒙', classes: 6, unitPrice: 150, totalAmount: 900, teacherId: '1', teacherName: '李雪' },
]

// 剩余未消课残值统计
const remainingValue = [
  { studentName: '朵朵', courseName: '钢琴启蒙', remainingClasses: 32, unitPrice: 150, value: 4800 },
  { studentName: '小宝', courseName: '钢琴进阶', remainingClasses: 40, unitPrice: 200, value: 8000 },
  { studentName: '乐乐', courseName: '乐理基础', remainingClasses: 18, unitPrice: 120, value: 2160 },
  { studentName: '小明', courseName: '小提琴入门', remainingClasses: 28, unitPrice: 200, value: 5600 },
  { studentName: '小红', courseName: '小提琴入门', remainingClasses: 24, unitPrice: 180, value: 4320 },
  { studentName: '天天', courseName: '钢琴启蒙', remainingClasses: 36, unitPrice: 150, value: 5400 },
]

export default function FinanceDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'consumption' | 'remaining' | 'teachers'>('overview')
  const [selectedMonth, setSelectedMonth] = useState('2026-05')

  // 计算汇总数据
  const totalIncome = monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
  const totalConsumption = monthlyConsumption.reduce((sum, item) => sum + item.totalAmount, 0)
  const totalRemaining = remainingValue.reduce((sum, item) => sum + item.value, 0)
  const totalConsumptionClasses = monthlyConsumption.reduce((sum, item) => sum + item.classes, 0)

  // 按教师汇总消课
  const teacherSummary = teachers.filter(t => t.status === 'active').map(teacher => {
    const records = monthlyConsumption.filter(c => c.teacherId === teacher.id)
    const totalClasses = records.reduce((sum, r) => sum + r.classes, 0)
    const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0)
    return {
      ...teacher,
      consumptionClasses: totalClasses,
      consumptionAmount: totalAmount,
      studentCount: new Set(records.map(r => r.studentName)).size,
    }
  })

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">财务数据看板</h1>
            <p className="text-xs text-muted-foreground">收入、消课、残值一目了然</p>
          </div>
          {/* Month selector */}
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

      {/* Summary Cards */}
      <div className="px-4 py-4 bg-gradient-to-br from-secondary/10 to-primary/5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs">本月收入</span>
            </div>
            <p className="text-xl font-bold text-green-600">¥{totalIncome.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyIncome.length}笔账单</p>
          </div>
          <div className="bg-background rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Receipt className="w-4 h-4 text-blue-500" />
              <span className="text-xs">本月消课</span>
            </div>
            <p className="text-xl font-bold text-blue-600">¥{totalConsumption.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalConsumptionClasses}课时</p>
          </div>
          <div className="bg-background rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-xs">剩余残值</span>
            </div>
            <p className="text-xl font-bold text-amber-600">¥{totalRemaining.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">未消课价值</p>
          </div>
          <div className="bg-background rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs">教师结算</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{teacherSummary.filter(t => t.consumptionClasses > 0).length}人</p>
            <p className="text-xs text-muted-foreground mt-1">待结算</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-2 border-b border-border bg-background overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {[
            { key: 'overview', label: '概览' },
            { key: 'income', label: '收入明细' },
            { key: 'consumption', label: '消课明细' },
            { key: 'remaining', label: '剩余残值' },
            { key: 'teachers', label: '教师结算' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'institution-btn-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="px-4 py-4 space-y-4">
            {/* Quick summary */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                本月经营概况
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">新签收入</span>
                  <span className="font-semibold text-green-600">
                    ¥{monthlyIncome.filter(i => i.type === 'new').reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">续费收入</span>
                  <span className="font-semibold text-blue-600">
                    ¥{monthlyIncome.filter(i => i.type === 'renew').reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">消课转化</span>
                  <span className="font-semibold">¥{totalConsumption.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">平均课单价</span>
                  <span className="font-semibold">¥{Math.round(totalConsumption / totalConsumptionClasses)}/课时</span>
                </div>
              </div>
            </div>

            {/* Teacher quick view */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">教师消课排行</h3>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="text-xs text-primary flex items-center gap-0.5"
                >
                  查看全部 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {teacherSummary.slice(0, 3).map((teacher, idx) => (
                  <div key={teacher.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'
                    )}>{idx + 1}</span>
                    <img src={teacher.avatar} alt={teacher.name} className="w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.consumptionClasses}课时 · {teacher.studentCount}学员</p>
                    </div>
                    <p className="font-semibold text-primary">¥{teacher.consumptionAmount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Income Detail */}
        {activeTab === 'income' && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">共{monthlyIncome.length}笔收入</p>
              <p className="text-sm font-semibold text-green-600">合计 ¥{totalIncome.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {monthlyIncome.map(item => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={item.studentAvatar} alt={item.studentName} className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.studentName}</p>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full',
                          item.type === 'new' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        )}>
                          {item.type === 'new' ? '新签' : '续费'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.packageName} · {item.classes}课时</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+¥{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consumption Detail */}
        {activeTab === 'consumption' && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">共{totalConsumptionClasses}课时消课</p>
              <p className="text-sm font-semibold text-blue-600">合计 ¥{totalConsumption.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {monthlyConsumption.map(item => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.studentName}</p>
                      <span className="text-xs text-muted-foreground">· {item.courseName}</span>
                    </div>
                    <p className="font-semibold text-blue-600">¥{item.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.classes}课时 × ¥{item.unitPrice}/课时</span>
                    <span>授课: {item.teacherName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                消课金额按各学员实际课时单价计算，每个学员的单价可能不同
              </p>
            </div>
          </div>
        )}

        {/* Remaining Value */}
        {activeTab === 'remaining' && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">共{remainingValue.length}位学员</p>
              <p className="text-sm font-semibold text-amber-600">残值 ¥{totalRemaining.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              {remainingValue.map((item, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.studentName}</p>
                      <span className="text-xs text-muted-foreground">· {item.courseName}</span>
                    </div>
                    <p className="font-semibold text-amber-600">¥{item.value.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>剩余 {item.remainingClasses}课时</span>
                    <span>单价 ¥{item.unitPrice}/课时</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (item.remainingClasses / 48) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                残值 = 剩余课时 × 各学员课时单价，反映未消耗的预收款价值
              </p>
            </div>
          </div>
        )}

        {/* Teacher Settlement */}
        {activeTab === 'teachers' && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">教师消课汇总</p>
              <p className="text-sm font-semibold text-purple-600">合计 ¥{totalConsumption.toLocaleString()}</p>
            </div>
            <div className="space-y-3">
              {teacherSummary.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => router.push(`/institution/finance/teacher/${teacher.id}`)}
                  className="w-full p-4 bg-muted/30 rounded-xl text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <p className="font-semibold">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-purple-600">{teacher.consumptionClasses}</p>
                      <p className="text-[10px] text-muted-foreground">课时</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-blue-600">{teacher.studentCount}</p>
                      <p className="text-[10px] text-muted-foreground">学员</p>
                    </div>
                    <div className="bg-background rounded-lg p-2 text-center">
                      <p className="text-lg font-bold text-green-600">¥{teacher.consumptionAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">金额</p>
                    </div>
                  </div>
                  {teacher.consumptionAmount > 0 && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">结算状态</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        待结算
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
