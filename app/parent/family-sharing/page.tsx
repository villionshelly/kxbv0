'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Crown,
  Edit3,
  Plus,
  Save,
  Share2,
  Shield,
  UserMinus,
} from 'lucide-react'
import { children, familyMembers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Member = typeof familyMembers[0]

const RELATIONS = ['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '其他']

export default function FamilySharingPage() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState('王女士的家庭')
  const [editingFamilyName, setEditingFamilyName] = useState(false)
  const [members, setMembers] = useState(familyMembers)
  const [memberRelations, setMemberRelations] = useState<Record<string, string>>(
    () => Object.fromEntries(familyMembers.map(member => [member.id, member.relation]))
  )
  const [selfRelation, setSelfRelation] = useState('妈妈')
  const [showInviteSheet, setShowInviteSheet] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<Member | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [selectedRelation, setSelectedRelation] = useState('爸爸')
  const [invitePhone, setInvitePhone] = useState('')
  const [permissionLevel, setPermissionLevel] = useState<'full' | 'readonly'>('full')
  const [inviteSent, setInviteSent] = useState(false)

  const inviteLink = 'https://kxb.app/family?token=WX-8888-ABCD'
  const memberCount = members.length + 1
  const childNames = useMemo(() => children.map(child => child.name).join('、'), [])

  const handleCopy = () => {
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSendInvite = () => {
    if (!invitePhone.trim()) return
    setInviteSent(true)
    setTimeout(() => {
      setInviteSent(false)
      setShowInviteSheet(false)
      setInvitePhone('')
    }, 1500)
  }

  const handleRemove = (member: Member) => {
    setMembers(prev => prev.filter(item => item.id !== member.id))
    setShowRemoveConfirm(null)
  }

  const togglePermission = (id: string) => {
    setMembers(prev => prev.map(member =>
      member.id === id ? { ...member, permission: member.permission === 'full' ? 'readonly' : 'full' } : member
    ))
  }

  const updateMemberRelation = (id: string, relation: string) => {
    setMemberRelations(prev => ({ ...prev, [id]: relation }))
  }

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-3 warm-header">
        <div className="flex items-center gap-2 py-2">
          <button onClick={() => router.back()} className="-ml-1.5 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-lg font-semibold">家庭共享</h1>
          <button
            onClick={() => setShowInviteSheet(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            邀请
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-2">
          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,239,222,0.74))] p-4 shadow-[0_14px_30px_-24px_rgba(232,122,52,0.58)] ring-1 ring-white/75">
            <div className="absolute -right-12 -top-14 h-32 w-32 rounded-full bg-primary/12" />
            <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-secondary/10" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-primary">家庭名称</p>
                <button
                  type="button"
                  onClick={() => setEditingFamilyName(prev => !prev)}
                  className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-primary"
                >
                  {editingFamilyName ? <Save className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                  {editingFamilyName ? '保存' : '修改'}
                </button>
              </div>

              {editingFamilyName ? (
                <input
                  value={familyName}
                  onChange={(event) => setFamilyName(event.target.value)}
                  className="w-full rounded-2xl bg-white/70 px-3 py-2 text-xl font-bold outline-none ring-1 ring-primary/15 focus:ring-primary/30"
                />
              ) : (
                <h2 className="text-2xl font-bold text-foreground">{familyName}</h2>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/75 pt-3">
                <div>
                  <p className="text-lg font-bold">{children.length}</p>
                  <p className="text-[10px] text-muted-foreground">孩子</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{memberCount}</p>
                  <p className="text-[10px] text-muted-foreground">家庭成员</p>
                </div>
                <div>
                  <p className="text-lg font-bold">1</p>
                  <p className="text-[10px] text-muted-foreground">管理员</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">孩子</h2>
            <span className="text-xs text-muted-foreground">{childNames}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-3 rounded-2xl bg-white/65 px-3 py-3 ring-1 ring-white/70">
                <img src={child.avatar} alt={child.name} className="h-11 w-11 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{child.name}</p>
                  <p className="text-xs text-muted-foreground">学习日常共享中</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">家庭成员</h2>
            <span className="text-xs text-muted-foreground">管理员置顶</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] bg-white/70 p-3 ring-1 ring-primary/15">
              <div className="flex items-center gap-3">
                <img src="/images/avatars/parent-mom.jpg" alt="王女士" className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">王女士</p>
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <Crown className="h-3 w-3" />
                      管理员
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{selfRelation}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">未绑定手机号</p>
                </div>
              </div>

              <div className="mt-3 border-t border-white/75 pt-3">
                <p className="mb-2 text-xs text-muted-foreground">我的称谓</p>
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {RELATIONS.map(relation => (
                    <button
                      key={relation}
                      type="button"
                      onClick={() => setSelfRelation(relation)}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                        selfRelation === relation ? 'bg-primary text-primary-foreground' : 'bg-white/75 text-muted-foreground'
                      )}
                    >
                      {relation}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {members.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowInviteSheet(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/60 py-8 text-sm font-medium text-muted-foreground ring-1 ring-white/70"
              >
                <Plus className="h-4 w-4" />
                邀请家人加入
              </button>
            ) : (
              members.map(member => {
                const relation = memberRelations[member.id] || member.relation

                return (
                  <div key={member.id} className="rounded-[24px] bg-white/65 p-3 ring-1 ring-white/70">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="h-12 w-12 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{member.name}</p>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{relation}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{member.phone} · {member.joinDate} 加入</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRemoveConfirm(member)}
                        className="rounded-xl p-2 text-red-400 hover:bg-red-50"
                        aria-label="移除成员"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 border-t border-white/75 pt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">成员称谓</p>
                        <button
                          type="button"
                          onClick={() => togglePermission(member.id)}
                          className="flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {member.permission === 'full' ? '可操作' : '仅查看'}
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-0.5">
                        {RELATIONS.map(option => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateMemberRelation(member.id, option)}
                            className={cn(
                              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                              relation === option ? 'bg-primary text-primary-foreground' : 'bg-white/75 text-muted-foreground'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section className="pt-5">
          <div className="rounded-2xl bg-white/55 px-3 py-3 ring-1 ring-white/70">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">邀请链接</p>
              <button
                type="button"
                onClick={() => setShowInviteSheet(true)}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                邀请家人
              </button>
            </div>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate rounded-xl bg-white/65 px-3 py-2 text-xs text-muted-foreground">{inviteLink}</p>
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                  copiedLink ? 'bg-green-100 text-green-600' : 'bg-secondary/10 text-secondary'
                )}
              >
                {copiedLink ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? '已复制' : '复制'}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">链接 7 天内有效，仅限一位家人使用</p>
          </div>
        </section>
      </main>

      {showInviteSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[28px] bg-background px-4 pb-8 pt-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold">邀请家人</h3>
              <button onClick={() => setShowInviteSheet(false)} className="text-sm text-muted-foreground">取消</button>
            </div>

            {inviteSent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-semibold">邀请已发送</p>
                <p className="mt-1 text-sm text-muted-foreground">对方接受后将加入「{familyName}」</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">家人手机号</label>
                  <input
                    type="tel"
                    value={invitePhone}
                    onChange={event => setInvitePhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="请输入家人的手机号"
                    className="h-11 w-full rounded-xl bg-muted/40 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">称谓</label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONS.map(relation => (
                      <button
                        key={relation}
                        type="button"
                        onClick={() => setSelectedRelation(relation)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-sm transition-colors',
                          selectedRelation === relation
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {relation}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">操作权限</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['full', 'readonly'] as const).map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPermissionLevel(level)}
                        className={cn(
                          'rounded-xl border-2 p-3 text-left transition-colors',
                          permissionLevel === level ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40'
                        )}
                      >
                        <p className="text-sm font-medium">{level === 'full' ? '可操作' : '仅查看'}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {level === 'full' ? '可申请请假、调课' : '只能查看课表信息'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-muted text-sm font-medium text-foreground"
                  >
                    <Share2 className="h-4 w-4" />
                    分享链接
                  </button>
                  <button
                    type="button"
                    onClick={handleSendInvite}
                    disabled={invitePhone.length !== 11}
                    className="h-12 flex-1 rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-40"
                  >
                    发送邀请短信
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="w-full rounded-t-[28px] bg-background px-4 pb-8 pt-6">
            <h3 className="mb-1 text-base font-semibold">确认移除</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              移除后「{showRemoveConfirm.name}」将无法查看孩子的课程信息。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRemoveConfirm(null)} className="h-12 flex-1 rounded-xl bg-muted font-medium">取消</button>
              <button onClick={() => handleRemove(showRemoveConfirm)} className="h-12 flex-1 rounded-xl bg-destructive font-medium text-destructive-foreground">确认移除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
