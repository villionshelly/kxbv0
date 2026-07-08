'use client'

import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileImage,
  FileSignature,
  PenLine,
  ShieldCheck,
  X,
} from 'lucide-react'
import { ContractTemplatePreview } from '@/components/contract-template-preview'
import { cn } from '@/lib/utils'
import { type ContractRecord, useContractStore } from '@/lib/contract-store'

function getStatusText(contract: ContractRecord) {
  if (contract.type === 'paper') return '可查看'
  if (contract.status === 'pending') return '待签约'
  if (contract.status === 'sealed') return '已盖章回传'
  return '已签约'
}

function getStatusClass(contract: ContractRecord) {
  if (contract.type === 'template' && contract.status === 'pending') return 'bg-amber-100 text-amber-700'
  if (contract.type === 'template' && contract.status === 'sealed') return 'bg-blue-100 text-blue-700'
  return 'bg-emerald-100 text-emerald-700'
}

export default function ParentContractsPage() {
  const { contracts, signContract } = useContractStore()
  const [activeContract, setActiveContract] = useState<ContractRecord | null>(null)
  const visibleContracts = contracts.filter(item => !item.archivedAt)
  const signedCount = visibleContracts.filter(item => item.type === 'paper' || item.status === 'signed' || item.status === 'sealed').length
  const pendingCount = visibleContracts.filter(item => item.type === 'template' && item.status === 'pending').length

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-3 warm-header">
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#fff,#eef8ff)] p-4 ring-1 ring-white/75">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-secondary/12" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <FileSignature className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">课程合同</p>
              <p className="text-2xl font-bold text-foreground">{visibleContracts.length} 份</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-base font-bold text-emerald-600">{signedCount}</p>
                <p className="text-[10px] text-muted-foreground">可用</p>
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
            <span className="text-xs text-muted-foreground">纸质合同 / 电子合同</span>
          </div>
          <div className="space-y-3">
            {visibleContracts.map(item => {
              const isPending = item.type === 'template' && item.status === 'pending'
              const Icon = item.type === 'paper' ? FileImage : isPending ? Clock3 : CheckCircle2

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveContract(item)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/65 px-3 py-3 text-left ring-1 ring-white/70"
                >
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', isPending ? 'bg-amber-100 text-amber-600' : item.type === 'paper' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', getStatusClass(item))}>
                        {getStatusText(item)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.type === 'paper' ? '纸质合同' : '电子合同'} · {item.institutionName} · {item.studentName}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {item.type === 'template' && item.signedAt ? item.signedAt : item.createdAt}
                    </p>
                  </div>
                  {item.type === 'paper' ? <Download className="h-4.5 w-4.5 text-muted-foreground" /> : <ChevronRight className="h-4.5 w-4.5 text-primary" />}
                </button>
              )
            })}
          </div>
        </section>

        <section className="pt-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
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
              <span className="text-sm font-medium">签约记录</span>
            </button>
          </div>
        </section>
      </main>

      {activeContract && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40">
          <div className="max-h-[88vh] w-full overflow-auto rounded-t-[26px] bg-background px-4 pb-8 pt-4 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">{activeContract.type === 'paper' ? '纸质合同照片' : '系统模板电子合同'}</p>
                <h2 className="mt-1 truncate text-lg font-bold">{activeContract.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{activeContract.institutionName} · {activeContract.studentName}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveContract(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeContract.type === 'paper' ? (
              <div className="space-y-3">
                {activeContract.photos.map((photo, index) => (
                  <img
                    key={photo}
                    src={photo}
                    alt={`合同照片${index + 1}`}
                    className="w-full rounded-2xl bg-white object-cover shadow-sm ring-1 ring-border"
                  />
                ))}
                <a
                  href={activeContract.photos[0]}
                  download={`${activeContract.studentName}-${activeContract.title}.png`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-primary shadow-sm ring-1 ring-border"
                >
                  <Download className="h-4 w-4" />
                  下载照片
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <ContractTemplatePreview contract={activeContract} />

                {activeContract.sealedPhoto && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">机构盖章回传</p>
                    <img src={activeContract.sealedPhoto} alt="盖章合同回传" className="w-full rounded-2xl bg-white object-cover ring-1 ring-border" />
                  </div>
                )}

                {activeContract.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      signContract(activeContract.id)
                      setActiveContract(null)
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
                  >
                    <PenLine className="h-4 w-4" />
                    确认签约
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
