'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Crown, Sparkles, Check, Zap, Users, FileText, TrendingUp, Gift, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Plan = 'trial' | 'growth' | 'enterprise'
type PlanConfig = {
  name: string
  icon: typeof Sparkles
  color: string
  bgColor: string
  features: string[]
  price: number
  popular?: boolean
}

const plans: Record<Plan, PlanConfig> = {
  trial: {
    name: '体验版',
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    features: [
      '学员管理（限3人）',
      '老师管理（限1人）',
      '班级/排课管理',
      '消课记录',
      '基础统计报表',
    ],
    price: 0,
  },
  growth: {
    name: 'AI增长版',
    icon: Zap,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    popular: true,
    features: [
      '体验版全部功能',
      '学员/老师不限人数',
      '线索广场 + AI智能获客',
      'AI续费话术生成',
      'AI成长报告',
      '精彩瞬间视频生成',
      '拍照考勤',
      '老带新活动',
      'AI积分 2000点/月',
    ],
    price: 2399,
  },
  enterprise: {
    name: '旗舰版',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    features: [
      'AI增长版全部功能',
      '多门店管理',
      '员工权限管理',
      '高级数据分析',
      'API对接',
      '专属客户经理',
      'AI积分 10000点/月',
    ],
    price: 5999,
  },
}

const aiPointsPackages = [
  { points: 500, price: 49, popular: false },
  { points: 1000, price: 89, popular: false },
  { points: 3000, price: 239, popular: true },
  { points: 5000, price: 369, popular: false },
  { points: 10000, price: 699, popular: false },
]

export default function InstitutionPaymentPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'subscription' | 'points'>('subscription')
  const [selectedPlan, setSelectedPlan] = useState<Plan>('growth')
  const [selectedPoints, setSelectedPoints] = useState(3000)
  const [showPayment, setShowPayment] = useState(false)

  const currentPlan = plans[selectedPlan]
  const price = currentPlan.price

  const handlePay = () => {
    setShowPayment(true)
    // Simulate payment
    setTimeout(() => {
      setShowPayment(false)
      router.push('/institution/profile')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">订阅与充值</h1>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setTab('subscription')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === 'subscription' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            )}
          >
            套餐订阅
          </button>
          <button
            onClick={() => setTab('points')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === 'points' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            )}
          >
            AI积分充值
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {tab === 'subscription' ? (
          <div className="space-y-4">
            {/* Current Status */}
            <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">当前：AI增长版</p>
                    <p className="text-xs text-muted-foreground">有效期至 2027-06-01</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                  已开通
                </span>
              </div>
            </div>

            {/* Plans - Year only */}
            <div className="space-y-3">
              {(Object.keys(plans) as Plan[]).map(planKey => {
                const plan = plans[planKey]
                const Icon = plan.icon
                const planPrice = plan.price
                const isSelected = selectedPlan === planKey

                return (
                  <button
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey)}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all border-2',
                      isSelected
                        ? 'border-secondary bg-secondary/5'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.bgColor)}>
                          <Icon className={cn('w-5 h-5', plan.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{plan.name}</span>
                            {plan.popular && (
                              <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">
                                推荐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {planPrice === 0 ? '永久免费' : `¥${planPrice}/年`}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        isSelected ? 'border-secondary bg-secondary' : 'border-muted-foreground/30'
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-secondary-foreground" />}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {plan.features.slice(0, 5).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 5 && (
                        <p className="text-xs text-muted-foreground pl-5">
                          还有 {plan.features.length - 5} 项功能...
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Points Info */}
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">当前AI积分</p>
                  <p className="text-2xl font-bold text-purple-600">2,580</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI积分用于：线索抢单、AI续费话术、AI成长报告、精彩瞬间视频生成等
              </p>
            </div>

            {/* Points Packages */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">选择充值套餐</h3>
              <div className="grid grid-cols-2 gap-3">
                {aiPointsPackages.map(pkg => (
                  <button
                    key={pkg.points}
                    onClick={() => setSelectedPoints(pkg.points)}
                    className={cn(
                      'p-4 rounded-xl text-left transition-all border-2 relative',
                      selectedPoints === pkg.points
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">
                        热门
                      </span>
                    )}
                    <p className="text-lg font-bold">{pkg.points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">积分</p>
                    <p className="mt-2 text-purple-600 font-semibold">¥{pkg.price}</p>
                    <p className="text-xs text-muted-foreground">
                      约 ¥{(pkg.price / pkg.points * 100).toFixed(1)}/100点
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Examples */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <h4 className="text-sm font-medium mb-3">积分消耗参考</h4>
              <div className="space-y-2 text-sm">
                {[
                  { action: '抢一条线索', points: 50 },
                  { action: 'AI续费话术生成', points: 20 },
                  { action: 'AI成长报告', points: 30 },
                  { action: '精彩瞬间视频', points: 100 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.action}</span>
                    <span className="font-medium">{item.points} 积分</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 py-4 border-t border-border bg-background">
        {tab === 'subscription' ? (
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedPlan === 'trial' ? '体验版（永久免费）' : `${plans[selectedPlan].name} · 年付`}
              </p>
              <p className="text-2xl font-bold">
                {price === 0 ? '免费' : `¥${price}`}
              </p>
            </div>
            <button
              onClick={handlePay}
              disabled={selectedPlan === 'trial'}
              className="px-8 h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40"
            >
              {selectedPlan === 'trial' ? '免费使用' : '立即订阅'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">充值 {selectedPoints.toLocaleString()} 积分</p>
              <p className="text-2xl font-bold">
                ¥{aiPointsPackages.find(p => p.points === selectedPoints)?.price}
              </p>
            </div>
            <button
              onClick={handlePay}
              className="px-8 h-12 bg-purple-500 text-white rounded-xl font-medium"
            >
              立即充值
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-background rounded-2xl p-8 mx-4 text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium">正在处理支付...</p>
            <p className="text-sm text-muted-foreground mt-1">请稍候</p>
          </div>
        </div>
      )}
    </div>
  )
}
