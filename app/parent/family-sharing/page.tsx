'use client'

import { useState } from 'react'
import {
  CheckCircle,
  Crown,
  Edit3,
  ImageDown,
  MessageCircle,
  Plus,
  Save,
  UserMinus,
  X,
} from 'lucide-react'
import { children, familyMembers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Member = typeof familyMembers[0]

const RELATIONS = ['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '其他']
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const familyInvitePosterSrc = '/images/posters/invite-home-home-visual-v3-half.png'
const familyInviteQrSrc = '/images/posters/invite-institution-qr.svg'

function generateInviteCode() {
  return Array.from(
    { length: 6 },
    () => INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)],
  ).join('')
}

export default function FamilySharingPage() {
  const [familyName, setFamilyName] = useState('王女士的家庭')
  const [editingFamilyName, setEditingFamilyName] = useState(false)
  const [members, setMembers] = useState(familyMembers)
  const [memberRelations, setMemberRelations] = useState<Record<string, string>>(
    () => Object.fromEntries(familyMembers.map(member => [member.id, member.relation || '']))
  )
  const [selfRelation, setSelfRelation] = useState('妈妈')
  const [editingRelationTarget, setEditingRelationTarget] = useState<string | null>(null)
  const [showInviteSheet, setShowInviteSheet] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<Member | null>(null)
  const [shareHint, setShareHint] = useState<'wechat' | 'poster' | null>(null)
  const [inviteCode] = useState(generateInviteCode)

  const inviteLink = `https://kxb.app/family?token=${inviteCode}`
  const inviteExpireText = '邀请链接7天有效'
  const shareMessage = `我邀请你加入「${familyName}」，一起查看孩子课程和成长记录。邀请码 ${inviteCode}，${inviteExpireText}。`

  const handleMiniProgramShare = () => {
    setShareHint('wechat')
    setTimeout(() => setShareHint(null), 2200)
  }

  const handleSavePoster = () => {
    setShareHint('poster')
    setTimeout(() => setShareHint(null), 2200)
  }

  const handleRemove = (member: Member) => {
    setMembers(prev => prev.filter(item => item.id !== member.id))
    setShowRemoveConfirm(null)
  }

  const toggleRelationEditor = (target: string) => {
    setEditingRelationTarget(prev => prev === target ? null : target)
  }

  const updateMemberRelation = (id: string, relation: string) => {
    setMemberRelations(prev => ({ ...prev, [id]: relation }))
    setEditingRelationTarget(null)
  }

  const renderRelationPicker = (selected: string, onSelect: (relation: string) => void) => (
    <div className="mt-3 border-t border-white/75 pt-3">
      <p className="mb-2 text-xs text-muted-foreground">选择称谓</p>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {RELATIONS.map(relation => (
          <button
            key={relation}
            type="button"
            onClick={() => onSelect(relation)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              selected === relation ? 'bg-primary text-primary-foreground' : 'bg-white/75 text-muted-foreground'
            )}
          >
            {relation}
          </button>
        ))}
      </div>
    </div>
  )

  const FamilyInvitePoster = () => (
    <div className="relative mx-auto aspect-[1147/1372] w-full max-w-[360px] overflow-hidden rounded-[20px] bg-white shadow-[0_22px_42px_-28px_rgba(69,86,116,0.45)] ring-1 ring-white/90">
      <img
        src={familyInvitePosterSrc}
        alt="家庭邀请海报"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute left-[50.1%] top-[74.25%] flex h-[8.5%] w-[10.1%] items-center justify-center">
        <img
          src={familyInviteQrSrc}
          alt="家庭邀请二维码"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="absolute left-[63.1%] top-[77.6%] w-[30.2%] text-left">
        <p className="whitespace-nowrap text-[12px] font-extrabold leading-none tracking-normal text-[#ff6b1a]">
          {familyName}
        </p>
      </div>
      <div className="absolute left-[63.1%] top-[81.1%] w-[30.2%] text-left">
        <p className="whitespace-nowrap text-[8px] font-bold leading-none tracking-normal text-[#f58a3a]">7天有效</p>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-full flex-col warm-bg">
      <main className="flex-1 overflow-auto px-4 pb-36">
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

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/75 pt-3">
                {children.map(child => (
                  <div key={child.id} className="flex items-center gap-3 rounded-2xl bg-white/62 px-3 py-3 ring-1 ring-white/70">
                    <img src={child.avatar} alt={child.name} className="h-11 w-11 rounded-2xl object-cover" />
                    <p className="min-w-0 truncate text-sm font-semibold">{child.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">家庭成员</h2>
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
                    <button
                      type="button"
                      onClick={() => toggleRelationEditor('self')}
                      className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 transition-colors active:scale-[0.98]"
                    >
                      {selfRelation || '修改称谓'}
                    </button>
                  </div>
                </div>
              </div>

              {editingRelationTarget === 'self' && renderRelationPicker(selfRelation, (relation) => {
                setSelfRelation(relation)
                setEditingRelationTarget(null)
              })}
            </div>

            {members.length === 0 ? (
              <div className="flex w-full items-center justify-center rounded-2xl bg-white/60 py-8 text-sm font-medium text-muted-foreground ring-1 ring-white/70">
                暂无其他家人加入
              </div>
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
                          <button
                            type="button"
                            onClick={() => toggleRelationEditor(member.id)}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors active:scale-[0.98]',
                              relation ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                            )}
                          >
                            {relation || '修改称谓'}
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{member.joinDate} 加入</p>
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

                    {editingRelationTarget === member.id && renderRelationPicker(relation, (option) => updateMemberRelation(member.id, option))}
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      <div className="safe-area-bottom pointer-events-none absolute inset-x-0 bottom-0 z-[85] bg-[linear-gradient(180deg,rgba(255,253,251,0),rgba(255,253,251,0.96)_34%)] px-4 pb-3 pt-8">
        <button
          type="button"
          onClick={() => setShowInviteSheet(true)}
          className="pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-primary text-sm font-bold text-primary-foreground shadow-[0_18px_34px_-22px_rgba(248,126,49,0.8)] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          邀请家人加入
        </button>
      </div>

      {showInviteSheet && (
        <div className="fixed inset-0 z-[220] flex items-end bg-black/46">
          <div className="max-h-[92vh] w-full overflow-auto rounded-t-[28px] bg-background px-4 pb-8 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">邀请家人加入</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">邀请码 {inviteCode} · {inviteExpireText}</p>
              </div>
              <button onClick={() => setShowInviteSheet(false)} className="rounded-full bg-muted p-2" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            <FamilyInvitePoster />

            {shareHint && (
              <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-white/70 px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-white/80">
                <CheckCircle className="h-4 w-4 text-primary" />
                {shareHint === 'wechat' ? '微信邀请已带上邀请码，邀请链接7天有效' : '图片已保存，海报包含邀请码和7天有效说明'}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleMiniProgramShare}
                data-share-message={shareMessage}
                data-share-link={inviteLink}
                className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#07C160] text-sm font-bold text-white shadow-[0_14px_24px_-18px_rgba(7,193,96,0.8)] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                发送微信邀请
              </button>
              <button
                type="button"
                onClick={handleSavePoster}
                className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground shadow-[0_14px_24px_-18px_rgba(248,126,49,0.8)] active:scale-[0.98]"
              >
                <ImageDown className="h-5 w-5" />
                保存图片
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[220] flex items-end bg-black/40">
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
