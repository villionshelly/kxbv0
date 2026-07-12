'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, QrCode, RefreshCw, ShieldCheck } from 'lucide-react'
import { createAdminInvite, hasPermission, useInstitutionMembers, type AdminInviteToken } from '@/lib/institution-member-store'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

export default function AdminInvitePage() {
  const state = useInstitutionMembers()
  const { settings } = useInstitutionProfileSettings()
  const [invite, setInvite] = useState<AdminInviteToken | null>(null)
  const [now, setNow] = useState(Date.now())
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canInvite = hasPermission(state, 'invite_administrators')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [])

  const secondsLeft = invite ? Math.max(0, Math.ceil((invite.expiresAt - now) / 1000)) : 0
  const expired = Boolean(invite && secondsLeft === 0)
  const joinUrl = useMemo(() => {
    if (!invite) return ''
    const origin = typeof window === 'undefined' ? 'http://127.0.0.1:7777' : window.location.origin
    return `${origin}/institution/join?token=${encodeURIComponent(invite.token)}`
  }, [invite])

  useEffect(() => {
    if (!joinUrl) {
      setQrDataUrl('')
      return
    }
    let active = true
    import('qrcode').then(({ toDataURL }) => toDataURL(joinUrl, {
      width: 440,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#102a63', light: '#ffffff' },
    })).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl)
    }).catch(() => {
      if (active) setQrDataUrl('')
    })
    return () => { active = false }
  }, [joinUrl])

  if (!canInvite) {
    return <div className="flex h-full items-center justify-center px-7 text-center institution-dream-bg"><p className="rounded-2xl bg-card p-5 text-sm leading-6 text-muted-foreground card-dream">管理员邀请码只能由主账号生成。</p></div>
  }

  const generate = () => setInvite(createAdminInvite())

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-4">
        <section className="rounded-3xl bg-card p-4 card-dream">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-bold">邀请管理员</p><p className="mt-1 text-xs text-muted-foreground">扫码登录后获得机构端经营权限</p></div></div>
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">二维码仅在生成后 1 分钟内有效，成功加入后立即作废。请当面出示，不支持下载或转发。</p>
        </section>

        {!invite || expired ? (
          <section className="mt-4 flex flex-col items-center rounded-3xl bg-card px-5 py-10 text-center card-dream">
            <QrCode className="h-12 w-12 text-blue-600" />
            {/* <p className="mt-4 font-bold">{expired ? '二维码已失效' : '生成管理员二维码'}</p> */}
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">生成后请让同事立即扫码，二维码不会被保存或复用。</p>
            <button type="button" onClick={generate} className="mt-6 flex h-12 items-center gap-2 rounded-xl institution-btn-primary px-5 text-sm font-semibold"><RefreshCw className="h-4 w-4" />{expired ? '重新生成' : '生成动态邀请码'}</button>
          </section>
        ) : (
          <section className="mt-4 rounded-3xl bg-card p-5 text-center card-dream">
            <div className="mx-auto flex h-9 w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />有效期 {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</div>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="管理员动态邀请二维码" className="mx-auto mt-5 h-60 w-60 bg-white p-3 ring-1 ring-border" />
            ) : (
              <div className="mx-auto mt-5 flex h-60 w-60 items-center justify-center bg-white text-xs text-muted-foreground ring-1 ring-border">正在生成二维码</div>
            )}
            <p className="mt-4 font-semibold">{settings.institutionName}</p>
            <p className="mt-1 text-xs text-muted-foreground">同事扫码登录授权后即可成为管理员</p>
            <button type="button" onClick={generate} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground"><RefreshCw className="h-4 w-4" />重新生成二维码</button>
          </section>
        )}
      </main>
    </div>
  )
}
