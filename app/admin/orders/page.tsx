'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react'
import { recentOrders } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const allOrders = [
  ...recentOrders,
  {
    id: 'ORD202603260004',
    institution: '龙武跆拳道馆',
    product: 'AI增长版年费',
    amount: 9800,
    payTime: '2026-03-26 16:20',
    payMethod: '微信支付',
    status: 'paid',
  },
  {
    id: 'ORD202603250005',
    institution: '智慧树早教中心',
    product: 'AI积分包-1000点',
    amount: 980,
    payTime: '2026-03-25 11:30',
    payMethod: '支付宝',
    status: 'paid',
  },
  {
    id: 'ORD202603240006',
    institution: '星光舞蹈艺术中心',
    product: 'AI增长版年费',
    amount: 9800,
    payTime: '2026-03-24 09:15',
    payMethod: '对公转账',
    status: 'pending',
  },
]

export default function AdminOrdersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all')

  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = order.institution.includes(searchQuery) || order.id.includes(searchQuery)
    const matchesTab = activeTab === 'all' || order.status === activeTab
    return matchesSearch && matchesTab
  })

  const totalRevenue = allOrders.filter(o => o.status === 'paid').reduce((acc, o) => acc + o.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">订单管理</h1>
          <p className="text-muted-foreground mt-1">SaaS订阅与AI积分购买订单</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">本月订单数</p>
          <p className="text-2xl font-bold mt-1">{allOrders.length}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">本月营收</p>
          <p className="text-2xl font-bold mt-1 text-green-600">¥{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">待确认</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">
            {allOrders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">平均客单价</p>
          <p className="text-2xl font-bold mt-1">¥{Math.round(totalRevenue / allOrders.filter(o => o.status === 'paid' && o.amount > 0).length).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索订单号、机构名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex bg-muted/50 rounded-lg p-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'paid', label: '已支付' },
            { key: 'pending', label: '待确认' },
            { key: 'refunded', label: '已退款' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">订单号</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">机构</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">商品</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">金额</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">支付方式</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">支付时间</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">状态</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-sm">{order.id}</span>
                </td>
                <td className="p-4">
                  <p className="font-medium">{order.institution}</p>
                </td>
                <td className="p-4">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    order.product.includes('AI增长版') ? 'bg-primary/10 text-primary' :
                    order.product.includes('AI积分') ? 'bg-secondary/10 text-secondary' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {order.product}
                  </span>
                </td>
                <td className="p-4">
                  <span className={cn(
                    'font-semibold',
                    order.amount > 0 ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {order.amount > 0 ? `¥${order.amount.toLocaleString()}` : '免费'}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{order.payMethod}</td>
                <td className="p-4 text-sm text-muted-foreground">{order.payTime}</td>
                <td className="p-4">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    order.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-destructive/10 text-destructive'
                  )}>
                    {order.status === 'paid' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        已支付
                      </>
                    ) : order.status === 'pending' ? (
                      <>
                        <Clock className="w-3 h-3" />
                        待确认
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        已退款
                      </>
                    )}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {order.status === 'pending' ? (
                    <button className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                      确认到账
                    </button>
                  ) : (
                    <button 
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      详情
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
