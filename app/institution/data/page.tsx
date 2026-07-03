'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Wallet, BookOpen, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const statsData = {
  revenue: { value: 89600, change: 12.5, label: '本月营收', unit: '¥' },
  consumption: { value: 324, change: 8.2, label: '本月课消', unit: '课时' },
  newStudents: { value: 12, change: 20, label: '新增学员', unit: '人' },
  attendance: { value: 94.5, change: 2.1, label: '出勤率', unit: '%' },
}

const chartData = [
  { month: '10月', revenue: 72000, consumption: 280 },
  { month: '11月', revenue: 78500, consumption: 295 },
  { month: '12月', revenue: 85000, consumption: 310 },
  { month: '1月', revenue: 68000, consumption: 245 },
  { month: '2月', revenue: 75000, consumption: 268 },
  { month: '3月', revenue: 89600, consumption: 324 },
]

const teacherStats = [
  { name: '李雪', classes: 48, revenue: 45600, rate: 95.2 },
  { name: '王明', classes: 36, revenue: 32400, rate: 92.8 },
  { name: '张芳', classes: 28, revenue: 25200, rate: 96.5 },
]

export default function InstitutionDataPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const maxRevenue = Math.max(...chartData.map(d => d.revenue))

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">经营数据</h1>
          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  period === p ? 'bg-background shadow-sm' : 'text-muted-foreground'
                )}
              >
                {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-2 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(statsData).map(([key, stat]) => (
            <div key={key} className="p-4 bg-muted/30 rounded-xl">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">
                {key === 'revenue' ? `¥${(stat.value / 10000).toFixed(1)}w` : 
                 key === 'attendance' ? `${stat.value}%` : stat.value}
              </p>
              <div className={cn(
                'flex items-center gap-1 mt-1 text-xs',
                stat.change >= 0 ? 'text-green-600' : 'text-destructive'
              )}>
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                <span className="text-muted-foreground">较上月</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="p-4 bg-muted/30 rounded-xl">
          <h3 className="font-medium mb-4">营收趋势</h3>
          <div className="flex items-end gap-2 h-32">
            {chartData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    'w-full rounded-t-sm transition-all',
                    idx === chartData.length - 1 ? 'bg-primary' : 'bg-primary/30'
                  )}
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Performance */}
        <div>
          <h3 className="font-medium mb-3">教师课酬统计</h3>
          <div className="space-y-2">
            {teacherStats.map((teacher, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-medium">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{teacher.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        本月 {teacher.classes} 节课
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">¥{teacher.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">课酬</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">出勤率</span>
                  <span className="text-green-600 font-medium">{teacher.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button className="p-4 bg-secondary/10 rounded-xl text-left">
            <Calendar className="w-5 h-5 text-secondary mb-2" />
            <p className="text-sm font-medium">导出报表</p>
            <p className="text-xs text-muted-foreground">生成Excel报表</p>
          </button>
          <button className="p-4 bg-primary/10 rounded-xl text-left">
            <Wallet className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium">课酬结算</p>
            <p className="text-xs text-muted-foreground">批量发放课酬</p>
          </button>
        </div>
      </div>
    </div>
  )
}
