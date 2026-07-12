'use client'

import { LockKeyhole, ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentMember, useInstitutionMembers } from '@/lib/institution-member-store'

const ownerOnlyRoutes = [
  '/institution/payment',
  '/institution/finance',
  '/institution/profile/account',
  '/institution/profile/institution-info/verification',
  '/institution/staff/invite/admin',
  '/institution/students/',
]

export function InstitutionAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const state = useInstitutionMembers()
  const member = getCurrentMember(state)
  const isTeacherOnly = state.currentUser.kind === 'member' && !member?.roles.includes('admin')
  const isOwnerOnly = ownerOnlyRoutes.some((route) =>
    route === '/institution/students/'
      ? /^\/institution\/students\/[^/]+\/purchase-records(?:\/|$)/.test(pathname)
      : pathname === route || pathname.startsWith(`${route}/`),
  )
  const blocked = (isTeacherOnly && !pathname.startsWith('/institution/teacher')) || (state.currentUser.kind === 'member' && isOwnerOnly)

  if (!blocked) return <>{children}</>

  return (
    <div className="flex h-full flex-col items-center justify-center px-7 text-center institution-dream-bg">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-lg font-bold text-foreground">仅主账号可操作</h1>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        {isTeacherOnly ? '教师账号仅可进入教师工作台处理授课事务。' : '订阅、资金、机构主体和管理员授权仅限主账号处理。'}
      </p>
      <button
        type="button"
        onClick={() => router.push(isTeacherOnly ? '/institution/teacher' : '/institution')}
        className="mt-6 flex h-11 items-center gap-2 rounded-xl institution-btn-primary px-5 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        返回工作台
      </button>
    </div>
  )
}
