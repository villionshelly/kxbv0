'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  GraduationCap,
  Phone,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { DraggablePageActionFab } from '@/components/draggable-page-action-fab'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'
import {
  getCurrentMember,
  hasPermission,
  setAdministrator,
  updateMember,
  useInstitutionMembers,
  type InstitutionMember,
} from '@/lib/institution-member-store'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'admin' | 'teacher'

function RoleTag({ role }: { role: 'admin' | 'teacher' }) {
  return (
    <span className={cn(
      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
      role === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700',
    )}>
      {role === 'admin' ? '管理员' : '教师'}
    </span>
  )
}

export default function StaffManagementPage() {
  const router = useRouter()
  const { settings } = useInstitutionProfileSettings()
  const state = useInstitutionMembers()
  const currentMember = getCurrentMember(state)
  const isOwner = state.currentUser.kind === 'owner'
  const canManageTeachers = hasPermission(state, 'manage_teachers')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<InstitutionMember | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSpecialty, setDraftSpecialty] = useState('')

  const activeMembers = state.members.filter((member) => member.status === 'active')
  const visibleMembers = useMemo(() => activeMembers.filter((member) => (
    filter === 'all' || member.roles.includes(filter)
  )), [activeMembers, filter])

  const adminCount = activeMembers.filter((member) => member.roles.includes('admin')).length
  const teacherCount = activeMembers.filter((member) => member.roles.includes('teacher')).length

  const openEdit = (member: InstitutionMember) => {
    setEditing(member)
    setDraftName(member.name)
    setDraftTitle(member.title || '')
    setDraftSpecialty(member.specialty || '')
  }

  const saveEdit = () => {
    if (!editing || !draftName.trim()) return
    updateMember(editing.id, {
      name: draftName.trim(),
      title: draftTitle.trim() || undefined,
      specialty: draftSpecialty.trim() || undefined,
    })
    setEditing(null)
  }

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-28 pt-4">
        <section className="overflow-hidden rounded-3xl bg-card card-dream">
          <div className="flex items-center gap-3 p-4">
            <img src={settings.accountAvatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold text-foreground">{settings.accountNickname}</p>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">主账号</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">全部权限 · 管理机构主体、资金与管理员</p>
            </div>
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div className="border-t border-border bg-amber-50/45 px-4 py-2.5 text-xs leading-5 text-amber-800">
            主账号不计入员工统计，管理员与教师权限由此账号统一维护。
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { value: activeMembers.length, label: '在职员工', icon: Users, color: 'text-slate-800' },
            { value: adminCount, label: '管理员', icon: ShieldCheck, color: 'text-blue-700' },
            { value: teacherCount, label: '教师', icon: GraduationCap, color: 'text-emerald-700' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-card px-2 py-3 text-center card-dream">
              <item.icon className={cn('mx-auto h-4 w-4', item.color)} />
              <p className={cn('mt-1 text-xl font-black', item.color)}>{item.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 flex rounded-2xl bg-white/72 p-1.5 shadow-sm ring-1 ring-white/80">
          {([
            ['all', '全部'],
            ['admin', '管理员'],
            ['teacher', '教师'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'h-9 flex-1 rounded-xl text-sm font-semibold transition-colors',
                filter === value ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="mt-4 space-y-3">
          {visibleMembers.map((member) => {
            const isAdmin = member.roles.includes('admin')
            const isTeacher = member.roles.includes('teacher')
            const isCurrentMember = currentMember?.id === member.id
            return (
              <article key={member.id} className="overflow-hidden rounded-3xl bg-card card-dream">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <img src={member.avatar} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-foreground">{member.name}</p>
                        {member.roles.map((role) => <RoleTag key={role} role={role} />)}
                        {isCurrentMember && <span className="text-[11px] text-muted-foreground">当前账号</span>}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5" />{member.phone}</p>
                      {isAdmin && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />机构经营权限，资金与管理员权限除外
                        </p>
                      )}
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 border-t border-border pt-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{member.title || '待完善教师资料'}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{member.specialty || '尚未填写授课方向'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-right text-xs text-muted-foreground">
                        <span><b className="text-foreground">{member.studentCount || 0}</b> 学员</span>
                        <span><b className="text-foreground">{member.weeklyClasses || 0}</b> 课时</span>
                      </div>
                    </div>
                  )}
                </div>

                {canManageTeachers && (
                  <div className="flex border-t border-border bg-muted/20">
                    <button type="button" onClick={() => openEdit(member)} className="flex h-11 flex-1 items-center justify-center gap-1.5 text-sm font-medium text-foreground">
                      <UserCog className="h-4 w-4" />编辑资料
                    </button>
                    {isTeacher && (
                      <button type="button" onClick={() => router.push(`/institution/staff/${member.id}/classes`)} className="flex h-11 flex-1 items-center justify-center gap-1.5 border-l border-border text-sm font-medium text-blue-700">
                        <CalendarDays className="h-4 w-4" />查看班次
                      </button>
                    )}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdmin && !isTeacher) {
                            updateMember(member.id, { status: 'resigned' })
                          } else {
                            setAdministrator(member.id, !isAdmin)
                          }
                        }}
                        className="flex h-11 flex-1 items-center justify-center gap-1.5 border-l border-border text-sm font-medium text-blue-700"
                      >
                        <ShieldCheck className="h-4 w-4" />{isAdmin ? (isTeacher ? '移除管理权' : '移出机构') : '设为管理员'}
                      </button>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </section>
      </main>

      <DraggablePageActionFab actionId="institution-staff-invite" label="新增员工" icon={Users} onClick={() => router.push('/institution/staff/invite')} />

      {editing && (
        <div className="absolute inset-0 z-[110] flex items-end bg-black/40" onClick={() => setEditing(null)}>
          <section className="safe-area-bottom w-full rounded-t-3xl bg-background px-5 pb-6 pt-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">编辑员工资料</h2>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-muted" aria-label="关闭"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3">
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="姓名" className="h-12 w-full rounded-xl bg-muted/50 px-4 text-sm outline-none" />
              {editing.roles.includes('teacher') && <>
                <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="教师职称，如：钢琴教师" className="h-12 w-full rounded-xl bg-muted/50 px-4 text-sm outline-none" />
                <input value={draftSpecialty} onChange={(event) => setDraftSpecialty(event.target.value)} placeholder="授课方向" className="h-12 w-full rounded-xl bg-muted/50 px-4 text-sm outline-none" />
              </>}
            </div>
            <button type="button" onClick={saveEdit} className="mt-5 h-12 w-full rounded-xl institution-btn-primary text-sm font-semibold">保存</button>
          </section>
        </div>
      )}
    </div>
  )
}
