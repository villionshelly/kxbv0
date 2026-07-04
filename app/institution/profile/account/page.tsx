'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { WechatProfileIdentityEditor } from '@/components/wechat-profile-identity-editor'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

const avatarPresets = [
  '/images/avatars/sea-sailboat-avatar.png',
  '/images/avatars/parent-mom.jpg',
  '/images/avatars/parent-dad.jpg',
  '/images/avatars/teacher-lixue-photo.jpg',
  '/images/avatars/teacher-chenmei-photo.jpg',
]

export default function InstitutionAccountPage() {
  const router = useRouter()
  const { settings, updateSettings } = useInstitutionProfileSettings()
  const [phoneWarningOpen, setPhoneWarningOpen] = useState(false)
  const [phoneWarningShown, setPhoneWarningShown] = useState(false)

  const handlePhoneChange = (value: string) => {
    const nextPhone = value.replace(/\D/g, '').slice(0, 11)
    if (!phoneWarningShown && nextPhone !== settings.accountPhone) {
      setPhoneWarningOpen(true)
      setPhoneWarningShown(true)
    }
    updateSettings({ accountPhone: nextPhone })
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-3">
        <WechatProfileIdentityEditor
          avatar={settings.accountAvatar}
          nickname={settings.accountNickname}
          onAvatarChange={(accountAvatar) => updateSettings({ accountAvatar })}
          onNicknameChange={(accountNickname) => updateSettings({ accountNickname })}
          avatarChoices={avatarPresets}
          wechatAvatar="/images/avatars/sea-sailboat-avatar.png"
          wechatNickname="李道一"
          avatarAlt={settings.accountNickname}
        >
          <div className="flex min-h-16 items-center border-t border-black/5 px-4">
            <span className="text-base font-semibold text-foreground">手机号</span>
            <input
              value={settings.accountPhone}
              onChange={(event) => handlePhoneChange(event.target.value)}
              placeholder="请输入手机号"
              className="ml-auto min-w-0 flex-1 bg-transparent text-right text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </WechatProfileIdentityEditor>

        <button
          type="button"
          onClick={() => router.push('/institution/login')}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card text-destructive shadow-sm ring-1 ring-border"
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </button>
      </main>

      {phoneWarningOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-8">
          <div className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-white text-center shadow-2xl">
            <div className="px-5 pb-4 pt-5">
              <p className="text-base font-bold text-foreground">手机号更改提醒</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                请确保输入的手机号正确，否则将导致账号无法正常登录。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPhoneWarningOpen(false)}
              className="h-12 w-full border-t border-border text-sm font-semibold text-primary"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
