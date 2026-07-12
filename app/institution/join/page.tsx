'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { acceptAdminInvite, getAdminInvite } from '@/lib/institution-member-store'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

function AdminJoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useInstitutionProfileSettings()
  const token = searchParams.get('token') || ''
  const invite = useMemo(() => getAdminInvite(token), [token])
  const [joined, setJoined] = useState(false)
  const valid = Boolean(invite && !invite.usedAt && invite.expiresAt > Date.now())

  const join = () => {
    if (!acceptAdminInvite(token)) return
    setJoined(true)
    window.setTimeout(() => router.push('/institution'), 900)
  }

  if (!valid && !joined) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center"><div><ShieldCheck className="mx-auto h-12 w-12 text-slate-400" /><h1 className="mt-4 text-lg font-bold">邀请二维码已失效</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">请联系机构主账号重新生成管理员邀请二维码。</p></div></main>
  }

  if (joined) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center"><div><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /><h1 className="mt-4 text-lg font-bold">已加入机构</h1><p className="mt-2 text-sm text-muted-foreground">正在进入机构工作台</p></div></main>
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <img src={settings.institutionLogo} alt="" className="mx-auto h-16 w-16 rounded-2xl object-cover" />
          <p className="mt-5 text-xl font-bold">{settings.institutionName}</p>
          <p className="mt-1 text-sm text-muted-foreground">邀请你成为机构管理员</p>
          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-left">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><p className="text-sm font-bold text-blue-900">机构经营权限</p><p className="mt-1 text-xs leading-5 text-blue-800">可处理学员、课程、班次、排课、合同、营销和教师管理；不含资金、订阅与管理员授权。</p></div></div>
          </div>
          <button type="button" onClick={join} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07C160] text-sm font-semibold text-white"><Building2 className="h-4 w-4" />微信授权登录并加入</button>
          <p className="mt-3 text-xs text-muted-foreground">确认后将自动绑定当前机构</p>
        </div>
      </div>
    </main>
  )
}

export default function InstitutionAdminJoinPage() {
  return <Suspense><AdminJoinContent /></Suspense>
}
