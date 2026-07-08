'use client'

import { useRouter } from 'next/navigation'
import { Building2, CheckCircle2, ChevronRight, Clock3, ReceiptText, WalletCards } from 'lucide-react'
import { cn } from '@/lib/utils'

const bills = [
  {
    id: 'b1',
    title: '钢琴启蒙 24 课时',
    institution: '七彩培训中心',
    child: '朵朵',
    amount: 3600,
    paidAt: '2026-03-18',
    status: 'paid',
  },
  {
    id: 'b2',
    title: '创意美术 春季课包',
    institution: '小画家美术工作室',
    child: '朵朵',
    amount: 2880,
    paidAt: '2026-02-26',
    status: 'paid',
  },
  {
    id: 'b3',
    title: '少儿编程 续费提醒',
    institution: '酷码编程',
    child: '小宝',
    amount: 3200,
    paidAt: '待确认',
    status: 'pending',
  },
]

export default function ParentBillsPage() {
  const router = useRouter()
  const paidTotal = bills.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
  const pendingTotal = bills.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-3 warm-header">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#fff,#fff1df)] p-4 ring-1 ring-white/75">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/12" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <WalletCards className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">已支付金额</p>
              <p className="text-2xl font-bold text-foreground">¥{paidTotal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">待确认</p>
              <p className="text-base font-bold text-primary">¥{pendingTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">账单记录</h2>
            <span className="text-xs text-muted-foreground">{bills.length} 笔</span>
          </div>
          <div className="space-y-3">
            {bills.map(item => {
              const isPaid = item.status === 'paid'

              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/65 px-3 py-3 text-left ring-1 ring-white/70"
                >
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>
                    {isPaid ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                        {isPaid ? '已支付' : '待确认'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.institution} · {item.child}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{item.paidAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">¥{item.amount.toLocaleString()}</p>
                    <ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="pt-5">
          <button
            type="button"
            onClick={() => router.push('/parent/institutions')}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/55 px-3 py-3 text-left ring-1 ring-white/70"
          >
            <Building2 className="h-4.5 w-4.5 text-muted-foreground" />
            <p className="min-w-0 flex-1 text-sm font-medium">查看机构课包与缴费状态</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>
      </main>
    </div>
  )
}
