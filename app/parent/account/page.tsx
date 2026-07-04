'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { WechatProfileIdentityEditor } from '@/components/wechat-profile-identity-editor'
import { useParentProfileSettings } from '@/lib/parent-profile-store'

const relations = ['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '其他']
const avatarChoices = [
  '/images/avatars/parent-mom.jpg',
  '/images/avatars/parent-dad.jpg',
  '/images/avatars/sea-sailboat-avatar.png',
  '/images/avatars/teacher-chenmei-photo.jpg',
]

export default function ParentAccountPage() {
  const router = useRouter()
  const { settings, updateSettings } = useParentProfileSettings()

  return (
    <div className="flex h-full flex-col warm-bg">
      <main className="flex-1 overflow-auto px-4 pb-24 pt-3">
        <WechatProfileIdentityEditor
          avatar={settings.avatar}
          nickname={settings.nickname}
          onAvatarChange={(avatar) => updateSettings({ avatar })}
          onNicknameChange={(nickname) => updateSettings({ nickname })}
          avatarChoices={avatarChoices}
          wechatAvatar="/images/avatars/parent-mom.jpg"
          wechatNickname="王女士"
          variant="warm"
          avatarAlt={settings.nickname}
        >
          <div className="flex min-h-16 items-center border-t border-black/5 px-4">
            <span className="text-base font-semibold text-foreground">手机号</span>
            <input
              value={settings.phone}
              onChange={(event) => updateSettings({ phone: event.target.value.replace(/\D/g, '').slice(0, 11) })}
              placeholder="未绑定手机号"
              className="ml-auto min-w-0 flex-1 bg-transparent text-right text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="border-t border-black/5 px-4 py-4">
            <p className="mb-3 text-base font-semibold text-foreground">家庭称谓</p>
            <div className="flex flex-wrap gap-2">
              {relations.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateSettings({ relation: item })}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    settings.relation === item ? 'bg-primary text-primary-foreground' : 'bg-white/70 text-muted-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            {settings.relation === '其他' && (
              <input
                value={settings.customRelation}
                onChange={(event) => updateSettings({ customRelation: event.target.value.slice(0, 8) })}
                placeholder="请输入具体称谓"
                className="mt-3 h-11 w-full rounded-xl bg-white/70 px-3 text-sm font-medium outline-none ring-1 ring-white/70"
              />
            )}
          </div>
        </WechatProfileIdentityEditor>

        <button
          type="button"
          onClick={() => router.push('/parent/login')}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/80 text-destructive shadow-sm ring-1 ring-white/70"
        >
          <LogOut className="h-5 w-5" />
          退出登录
        </button>
      </main>
    </div>
  )
}
