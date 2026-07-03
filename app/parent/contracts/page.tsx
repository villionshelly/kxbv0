'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, CheckCircle2, ChevronRight, Clock3, Download, FileSignature, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const contracts = [
  {
    id: 'c1',
    title: '钢琴启蒙课程服务协议',
    institution: '七彩音乐艺术中心',
    child: '朵朵',
    signedAt: '2026-03-18',
    status: 'signed',
  },
  {
    id: 'c2',
    title: '创意美术春季班报名协议',
    institution: '小画家美术工作室',
    child: '朵朵',
    signedAt: '2026-02-26',
    status: 'signed',
  },
  {
    id: 'c3',
    title: '少儿编程续费确认单',
    institution: '酷码编程',
    child: '小宝',
    signedAt: '待签署',
    status: 'pending',
  },
]

export default function ParentContractsPage() {
  const router = useRouter()
  const signedCount = contracts.filter(item => item.status === 'signed').length
  const pendingCount = contracts.length - signedCount

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-3 warm-header">
        <div className="flex items-center gap-2 py-2">
          <button onClick={() => router.back()} className="-ml-1.5 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">我的合同</h1>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#fff,#eef8ff)] p-4 ring-1 ring-white/75">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-secondary/12" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <FileSignature className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">课程合同</p>
              <p className="text-2xl font-bold text-foreground">{contracts.length} 份</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-emerald-600">{signedCount}</p>
                <p className="text-[10px] text-muted-foreground">已签</p>
              </div>
              <div>
                <p className="text-base font-bold text-primary">{pendingCount}</p>
                <p className="text-[10px] text-muted-foreground">待签</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">合同列表</h2>
            <span className="text-xs text-muted-foreground">报名与续费</span>
          </div>
          <div className="space-y-3">
            {contracts.map(item => {
              const isSigned = item.status === 'signed'

              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/65 px-3 py-3 text-left ring-1 ring-white/70"
                >
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', isSigned ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>
                    {isSigned ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                        {isSigned ? '已签署' : '待签署'}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.institution} · {item.child}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{item.signedAt}</p>
                  </div>
                  {isSigned ? <Download className="h-4.5 w-4.5 text-muted-foreground" /> : <ChevronRight className="h-4.5 w-4.5 text-primary" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="pt-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => router.push('/parent/institutions')}
              className="flex items-center gap-2 rounded-2xl bg-white/55 px-3 py-3 text-left ring-1 ring-white/70"
            >
              <Building2 className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm font-medium">按机构查看</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-white/55 px-3 py-3 text-left ring-1 ring-white/70"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm font-medium">签署记录</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
