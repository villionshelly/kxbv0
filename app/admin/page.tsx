'use client'

import { TrendingUp, TrendingDown, Users, Building2, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { platformStats, pendingInstitutions, recentOrders } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const statCards = [
  {
    title: '注册家长',
    value: platformStats.totalParents.toLocaleString(),
    change: platformStats.parentGrowth,
    icon: Users,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: '入驻机构',
    value: platformStats.totalInstitutions.toLocaleString(),
    change: platformStats.institutionGrowth,
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: '付费机构',
    value: platformStats.paidInstitutions.toLocaleString(),
    subValue: `转化率 ${platformStats.conversionRate}%`,
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-500/10',
  },
  {
    title: '本月营收',
    value: `¥${(platformStats.monthlyRevenue / 10000).toFixed(0)}万`,
    change: platformStats.revenueGrowth,
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
]

const activityData = [
  { hour: '00:00', dau: 1200, parents: 980, institutions: 220 },
  { hour: '02:00', dau: 650, parents: 520, institutions: 130 },
  { hour: '04:00', dau: 380, parents: 310, institutions: 70 },
  { hour: '06:00', dau: 1850, parents: 1520, institutions: 330 },
  { hour: '08:00', dau: 12500, parents: 10200, institutions: 2300 },
  { hour: '10:00', dau: 28600, parents: 23500, institutions: 5100 },
  { hour: '12:00', dau: 32000, parents: 26200, institutions: 5800 },
  { hour: '14:00', dau: 35800, parents: 29400, institutions: 6400 },
  { hour: '16:00', dau: 38500, parents: 31600, institutions: 6900 },
  { hour: '18:00', dau: 42300, parents: 34700, institutions: 7600 },
  { hour: '20:00', dau: 45600, parents: 37400, institutions: 8200 },
  { hour: '22:00', dau: 38000, parents: 31200, institutions: 6800 },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">数据大盘</h1>
        <p className="text-muted-foreground mt-1">平台运营核心指标概览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-background rounded-xl p-5 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                {stat.change !== undefined ? (
                  <div className={cn(
                    'flex items-center gap-1 mt-2 text-sm',
                    stat.change >= 0 ? 'text-green-600' : 'text-destructive'
                  )}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                    <span className="text-muted-foreground">较上月</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">{stat.subValue}</p>
                )}
              </div>
              <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DAU Chart */}
        <div className="lg:col-span-2 bg-background rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">用户活跃度</h3>
              <p className="text-sm text-muted-foreground">今日实时DAU趋势</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{platformStats.dailyActiveUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 justify-end">
                <TrendingUp className="w-4 h-4" />
                +{platformStats.dauGrowth}%
              </p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="parentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'dau' ? '总活跃' : name === 'parents' ? '家长用户' : '机构用户'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="parents" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  fill="url(#parentsGradient)" 
                  name="parents"
                />
                <Area 
                  type="monotone" 
                  dataKey="dau" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#dauGradient)" 
                  name="dau"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">总活跃用户</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs text-muted-foreground">家长用户</span>
            </div>
            <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
              峰值时段: 20:00 ({activityData[10].dau.toLocaleString()})
            </div>
          </div>
        </div>

        {/* MAU Stats */}
        <div className="bg-background rounded-xl p-5 border border-border">
          <h3 className="font-semibold mb-4">月度活跃</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">MAU</span>
                <span className="text-sm font-medium">{platformStats.monthlyActiveUsers.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">DAU/MAU</span>
                <span className="text-sm font-medium">46.3%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '46.3%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">次日留存</span>
                <span className="text-sm font-medium">68.5%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '68.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">7日留存</span>
                <span className="text-sm font-medium">42.1%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '42.1%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Institutions */}
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-semibold">待审���机构</h3>
              <p className="text-sm text-muted-foreground">{pendingInstitutions.length}家机构等待审核</p>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">
              查看全部
            </button>
          </div>
          <div className="divide-y divide-border">
            {pendingInstitutions.map((inst) => (
              <div key={inst.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inst.contact} | {inst.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors">
                    通过
                  </button>
                  <button className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-semibold">最新订单</h3>
              <p className="text-sm text-muted-foreground">近期付费订单</p>
            </div>
            <button className="text-sm text-primary font-medium hover:underline">
              查看全部
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    order.amount > 0 ? 'bg-green-500/10' : 'bg-muted'
                  )}>
                    <CreditCard className={cn(
                      'w-5 h-5',
                      order.amount > 0 ? 'text-green-600' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">{order.institution}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.product}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-semibold',
                    order.amount > 0 ? 'text-green-600' : 'text-muted-foreground'
                  )}>
                    {order.amount > 0 ? `+¥${order.amount.toLocaleString()}` : '免费'}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.payTime.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
