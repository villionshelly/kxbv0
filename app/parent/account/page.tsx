'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, ChevronRight, Crown, LogOut, Phone, Save, Users } from 'lucide-react'

const relations = ['妈妈', '爸爸', '爷爷', '奶奶', '外公', '外婆', '其他']

export default function ParentAccountPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('王女士')
  const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState('妈妈')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-3 warm-header">
        <div className="flex items-center gap-2 py-2">
          <button onClick={() => router.back()} className="rounded-lg p-1.5 -ml-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">个人资料</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-2">
          <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,239,222,0.78))] p-4 ring-1 ring-white/75">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/12" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <img
                  src="/images/avatars/parent-mom.jpg"
                  alt={nickname}
                  className="h-20 w-20 rounded-[28px] object-cover ring-4 ring-white/80"
                />
                <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm" aria-label="更换头像">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-primary">家庭管理员</p>
                <h2 className="mt-1 text-xl font-bold">{nickname || '未设置昵称'}</h2>
                <p className="mt-1 text-xs text-muted-foreground">已创建「王女士的家庭」</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <h2 className="mb-2 text-sm font-semibold">基础信息</h2>
          <div className="space-y-3">
            <label className="block rounded-2xl bg-white/65 px-3 py-3 ring-1 ring-white/70">
              <span className="text-xs text-muted-foreground">昵称</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="请输入昵称"
                className="mt-1 w-full bg-transparent text-base font-semibold outline-none"
              />
            </label>

            <div className="rounded-2xl bg-white/65 px-3 py-3 ring-1 ring-white/70">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">家庭称谓</span>
                <span className="text-[10px] text-primary">家人加入后可自行修改</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {relations.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRelation(item)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      relation === item ? 'bg-primary text-primary-foreground' : 'bg-white/70 text-muted-foreground'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/65 px-3 py-3 ring-1 ring-white/70">
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">手机号</p>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="未绑定手机号"
                    className="mt-1 w-full bg-transparent text-sm font-medium outline-none"
                  />
                  {!phone && <p className="mt-1 text-[10px] text-muted-foreground">当前未绑定手机号</p>}
                </div>
                <button className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  {phone ? '修改' : '绑定'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <h2 className="mb-2 text-sm font-semibold">家庭权限</h2>
          <div className="overflow-hidden rounded-2xl bg-white/60 ring-1 ring-white/70">
            <button className="flex w-full items-center gap-3 px-3 py-3 text-left">
              <Crown className="h-4.5 w-4.5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">管理员</p>
                <p className="text-xs text-muted-foreground">可管理孩子、课程、机构与家庭成员</p>
              </div>
            </button>
            <button onClick={() => router.push('/parent/family-sharing')} className="flex w-full items-center gap-3 border-t border-white/70 px-3 py-3 text-left">
              <Users className="h-4.5 w-4.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">邀请家人加入家庭</p>
                <p className="text-xs text-muted-foreground">爸爸、妈妈等家人可共同查看孩子学习安排</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        <button
          onClick={handleSave}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
        >
          <Save className="h-4 w-4" />
          {saved ? '已保存' : '保存资料'}
        </button>

        <section className="pt-5">
          <h2 className="mb-2 text-sm font-semibold">账号安全</h2>
          <div className="overflow-hidden rounded-2xl bg-white/60 ring-1 ring-white/70">
            <button
              type="button"
              onClick={() => router.push('/parent/login')}
              className="flex w-full items-center gap-3 px-3 py-3 text-left text-red-500"
            >
              <LogOut className="h-4.5 w-4.5" />
              <p className="min-w-0 flex-1 text-sm font-medium">退出登录</p>
              <ChevronRight className="h-4 w-4 text-red-300" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
