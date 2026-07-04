'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type WechatProfileIdentityEditorProps = {
  avatar: string
  nickname: string
  onAvatarChange: (avatar: string) => void
  onNicknameChange: (nickname: string) => void
  avatarChoices: string[]
  wechatAvatar: string
  wechatNickname: string
  variant?: 'cool' | 'warm'
  avatarAlt?: string
  children?: ReactNode
}

export function WechatProfileIdentityEditor({
  avatar,
  nickname,
  onAvatarChange,
  onNicknameChange,
  avatarChoices,
  wechatAvatar,
  wechatNickname,
  variant = 'cool',
  avatarAlt,
  children,
}: WechatProfileIdentityEditorProps) {
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false)
  const [nicknamePanelOpen, setNicknamePanelOpen] = useState(false)
  const [draftNickname, setDraftNickname] = useState(nickname)
  const nicknameInputRef = useRef<HTMLInputElement>(null)
  const isWarm = variant === 'warm'
  const albumAvatar = avatarChoices.find((choice) => choice !== avatar && choice !== wechatAvatar) || avatarChoices[0] || wechatAvatar
  const cameraAvatar = avatarChoices.find((choice) => choice !== avatar && choice !== wechatAvatar && choice !== albumAvatar) || albumAvatar

  useEffect(() => {
    if (!nicknamePanelOpen) return
    setDraftNickname(nickname || wechatNickname)
    requestAnimationFrame(() => nicknameInputRef.current?.focus())
  }, [nickname, nicknamePanelOpen, wechatNickname])

  const applyAvatar = (nextAvatar: string) => {
    onAvatarChange(nextAvatar)
    setAvatarSheetOpen(false)
  }

  const finishNickname = () => {
    onNicknameChange(draftNickname.trim() || wechatNickname)
    setNicknamePanelOpen(false)
  }

  return (
    <>
      <section
        className={cn(
          'overflow-hidden rounded-[22px] shadow-sm',
          isWarm ? 'bg-white/84 ring-1 ring-white/70' : 'bg-card ring-1 ring-border/60'
        )}
      >
        <button
          type="button"
          onClick={() => setAvatarSheetOpen(true)}
          className="flex h-20 w-full items-center border-b border-black/5 px-4 text-left"
        >
          <span className="text-base font-semibold text-foreground">头像</span>
          <span className="ml-auto flex items-center gap-3">
            <img
              src={avatar}
              alt={avatarAlt || nickname || '头像'}
              className="h-14 w-14 rounded-full object-cover"
            />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setNicknamePanelOpen(true)}
          className="flex h-16 w-full items-center px-4 text-left"
        >
          <span className="text-base font-semibold text-foreground">昵称</span>
          <span className="ml-auto flex min-w-0 items-center gap-2">
            <span className="max-w-[180px] truncate text-base font-semibold text-foreground">{nickname || '未设置'}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </span>
        </button>
        {children}
      </section>

      {avatarSheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/55">
          <div className="w-full overflow-hidden rounded-t-[12px] bg-white text-center text-[16px] text-[#111]">
            <button
              type="button"
              onClick={() => applyAvatar(wechatAvatar)}
              className="flex h-[92px] w-full flex-col items-center justify-center border-b border-[#eeeeee]"
            >
              <span>用微信头像</span>
              <img src={wechatAvatar} alt="" className="mt-2 h-6 w-6 rounded object-cover" />
            </button>
            <button
              type="button"
              onClick={() => applyAvatar(albumAvatar)}
              className="h-16 w-full border-b border-[#eeeeee]"
            >
              从相册选择
            </button>
            <button
              type="button"
              onClick={() => applyAvatar(cameraAvatar)}
              className="h-16 w-full"
            >
              拍照
            </button>
            <div className="h-2 bg-[#f3f3f3]" />
            <button type="button" onClick={() => setAvatarSheetOpen(false)} className="h-16 w-full">
              取消
            </button>
          </div>
        </div>
      )}

      {nicknamePanelOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[70] bg-[#e9eaef]">
          <div className="border-y border-[#dedfe3] bg-[#f8f8f8] px-2 py-2">
            <div className="flex min-h-[44px] items-center rounded-lg bg-white px-3 text-center">
              <input
                ref={nicknameInputRef}
                value={draftNickname}
                onChange={(event) => setDraftNickname(event.target.value)}
                autoComplete="nickname"
                placeholder="用微信昵称"
                className="min-w-0 flex-1 bg-transparent text-center text-sm font-semibold outline-none placeholder:text-[#8a8a8a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-2 pb-2 pt-3 text-center text-sm text-[#111]">
            {['的', '说', '呀', '咪', '打', '在'].map((word) => (
              <button key={word} type="button" className="h-11 rounded-md bg-white shadow-sm">
                {word}
              </button>
            ))}
          </div>

          <div className="flex gap-2 px-2 pb-[max(10px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setDraftNickname(wechatNickname)
                onNicknameChange(wechatNickname)
                setNicknamePanelOpen(false)
              }}
              className="h-11 flex-1 rounded-md bg-white text-sm"
            >
              用微信昵称
            </button>
            <button
              type="button"
              onClick={() => setNicknamePanelOpen(false)}
              className="h-11 w-20 rounded-md bg-white text-sm"
            >
              取消
            </button>
            <button
              type="button"
              onClick={finishNickname}
              className="h-11 w-20 rounded-md bg-[#ff7a1a] text-sm font-semibold text-white"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </>
  )
}
