'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, GraduationCap, QrCode, ShieldCheck } from 'lucide-react'
import { useInstitutionMembers } from '@/lib/institution-member-store'

export default function StaffInvitePage() {
  const router = useRouter()
  const state = useInstitutionMembers()
  const isOwner = state.currentUser.kind === 'owner'

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-4">
        <section className="rounded-3xl bg-card p-4 card-dream">
          <p className="text-base font-bold text-foreground">邀请新同事加入</p>
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">请按对方的工作职责选择身份：协助处理机构日常事务的同事邀请为管理员，负责授课和班级的老师邀请为教师。</p>
        </section>

        <section className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => isOwner && router.push('/institution/staff/invite/admin')}
            disabled={!isOwner}
            className="w-full overflow-hidden rounded-3xl bg-card p-4 text-left card-dream disabled:opacity-60"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ShieldCheck className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="font-bold text-foreground">邀请管理员</p><span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">仅主账号</span></div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">适合与你共同处理机构日常事务的同事。建议在对方在场时生成二维码。</p>
              </div>
              <ChevronRight className="mt-2 h-5 w-5 text-muted-foreground" />
            </div>
            {!isOwner && <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">管理员不能新增或调整其他管理员。</p>}
          </button>

          <button type="button" onClick={() => router.push('/institution/staff/invite/teacher')} className="w-full overflow-hidden rounded-3xl bg-card p-4 text-left card-dream">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><GraduationCap className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="font-bold text-foreground">邀请教师</p><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">教师工作台</span></div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">适合负责授课、点名和课程反馈的老师。可将邀请海报直接发送给对方。</p>
              </div>
              <ChevronRight className="mt-2 h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        </section>

        <section className="mt-4 rounded-2xl bg-blue-50/80 px-4 py-3 text-xs leading-5 text-blue-800">
          <QrCode className="mr-1 inline h-4 w-4 align-text-bottom" />
          管理员权限较高，请在对方在场时再生成二维码；二维码仅有效 1 分钟，失效后可由你重新生成。
        </section>
      </main>
    </div>
  )
}
