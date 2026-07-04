'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Camera, LogOut, Phone, UserRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
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

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="safe-area-top flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-muted" aria-label="返回">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">账号设置</h1>
      </header>

      <main className="scrollbar-quiet flex-1 overflow-auto px-4 py-5">
        <section className="rounded-3xl bg-card p-4 text-center card-dream">
          <div className="relative mx-auto h-24 w-24">
            <Image
              src={settings.accountAvatar}
              alt={settings.accountNickname}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-sm"
            />
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Camera className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-sm font-bold">{settings.accountNickname}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{settings.accountPhone || '未绑定手机号'}</p>
        </section>

        <section className="mt-4 space-y-4 rounded-3xl bg-card p-4 card-dream">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <UserRound className="h-3.5 w-3.5" />
              昵称
            </label>
            <Input
              value={settings.accountNickname}
              onChange={(event) => updateSettings({ accountNickname: event.target.value })}
              className="h-11 rounded-xl bg-muted/35"
              placeholder="请输入昵称"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              手机号换绑
            </label>
            <Input
              value={settings.accountPhone}
              onChange={(event) => updateSettings({ accountPhone: event.target.value.replace(/[^\d*]/g, '').slice(0, 11) })}
              className="h-11 rounded-xl bg-muted/35"
              placeholder="请输入新手机号"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">头像</label>
            <div className="grid grid-cols-4 gap-3">
              {avatarPresets.map((avatar) => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => updateSettings({ accountAvatar: avatar })}
                  className={`overflow-hidden rounded-2xl ring-2 transition-all ${
                    settings.accountAvatar === avatar ? 'ring-primary' : 'ring-transparent'
                  }`}
                >
                  <Image src={avatar} alt="" width={64} height={64} className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>
            <Input
              value={settings.accountAvatar}
              onChange={(event) => updateSettings({ accountAvatar: event.target.value })}
              className="mt-3 h-11 rounded-xl bg-muted/35"
              placeholder="/images/avatars/parent-mom.jpg"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() => router.push('/institution/login')}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-card text-destructive shadow-sm ring-1 ring-border"
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </button>
      </main>
    </div>
  )
}
