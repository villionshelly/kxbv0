'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  ImageDown,
  MessageCircle,
  Megaphone,
  QrCode,
  X,
} from 'lucide-react'

const inviteData = {
  parentName: '王女士',
  inviteCode: 'KXB-WM-ABC123',
  serviceReward: '¥128',
}

export default function InviteInstitutionPage() {
  const router = useRouter()
  const [shareHint, setShareHint] = useState<'wechat' | 'poster' | null>(null)
  const [showPosterSheet, setShowPosterSheet] = useState(false)
  const [showPromoterSheet, setShowPromoterSheet] = useState(false)

  const handleWechatShare = () => {
    setShareHint('wechat')
    setTimeout(() => setShareHint(null), 2200)
  }

  const handlePosterShare = () => {
    setShareHint('poster')
    setShowPosterSheet(true)
  }

  const Poster = () => (
    <div className="relative mx-auto aspect-[3/4.55] w-full max-w-[330px] overflow-hidden rounded-[20px] bg-[#fff7ed] shadow-[0_18px_34px_-26px_rgba(121,70,34,0.52)] ring-1 ring-white/80">
      <img
        src="/images/posters/invite-home-school-visual-v2.png"
        alt="家校服务邀请海报背景"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,244,0.92)_0%,rgba(255,250,244,0.64)_34%,rgba(255,250,244,0.15)_58%,rgba(255,250,244,0.88)_100%)]" />

      <div className="relative flex h-full flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/78 px-2.5 py-1.5 shadow-sm ring-1 ring-white/80">
            <img src="/logo.png" alt="课小宝" className="h-5 w-5 object-contain" />
            <span className="text-xs font-bold text-[#182033]">课小宝</span>
          </div>
          <span className="rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold text-white">家长推荐</span>
        </div>

        <div className="mt-7 max-w-[235px]">
          <p className="text-[11px] font-bold text-primary">来自{inviteData.parentName}的推荐</p>
          <h2 className="mt-1.5 text-[30px] font-black leading-[1.03] text-[#182033]">
            家校沟通
            <br />
            更清楚
          </h2>
          <p className="mt-2 text-sm font-medium leading-5 text-[#52606f]">
            课表、课时、请假、反馈同步给家长。
          </p>
        </div>

        <div className="mt-auto">
          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {['服务透明', '沟通省时', '记录完整'].map(item => (
              <div key={item} className="rounded-full bg-white/84 px-2 py-1.5 text-center text-[11px] font-bold text-[#5f5248] shadow-sm ring-1 ring-white/80">
                {item}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-[16px] bg-white/88 px-3 py-3 shadow-sm ring-1 ring-white/85">
            <img
              src="/images/posters/invite-institution-qr.svg"
              alt="机构入驻邀请二维码"
              className="h-[68px] w-[68px] shrink-0 rounded-[13px] bg-white p-1 ring-1 ring-[#ead8c5]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#182033]">扫码开通家校服务</p>
              <p className="mt-1 text-[10px] text-[#7b6d63]">识别码 {inviteData.inviteCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col warm-bg">
      <header className="safe-area-top px-4 pb-1 warm-header">
        <div className="flex items-center gap-2 py-1">
          <button onClick={() => router.back()} className="-ml-1.5 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">邀请机构入驻</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 pb-28">
        <section className="pt-1">
          <div className="relative overflow-hidden rounded-[20px] bg-[#fffaf4] p-4 shadow-[0_16px_30px_-24px_rgba(248,126,49,0.55)] ring-1 ring-white/80">
            <img
              src="/images/posters/invite-home-school-visual-v2.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.96),rgba(255,250,244,0.72))]" />
            <div className="relative min-h-[196px]">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{inviteData.parentName}</span>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{inviteData.inviteCode}</span>
              </div>
              <h2 className="mt-5 text-[28px] font-black leading-tight text-foreground">
                邀请机构
                <br />
                开通家校服务
              </h2>
              <p className="mt-2 max-w-[230px] text-sm leading-5 text-muted-foreground">
                家长少操心，老师少重复。
              </p>

              <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleWechatShare}
                  className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#07C160] px-3 py-3 text-sm font-bold text-white shadow-[0_14px_24px_-18px_rgba(7,193,96,0.8)] active:scale-[0.98]"
                >
                  <MessageCircle className="h-5 w-5" />
                  发送微信好友
                </button>
                <button
                  type="button"
                  onClick={handlePosterShare}
                  className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-primary px-3 py-3 text-sm font-bold text-primary-foreground shadow-[0_14px_24px_-18px_rgba(248,126,49,0.8)] active:scale-[0.98]"
                >
                  <ImageDown className="h-5 w-5" />
                  分享海报
                </button>
              </div>

              {shareHint && (
                <div className="absolute bottom-14 left-0 right-0 flex items-center gap-2 rounded-[16px] bg-white/82 px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-white/85">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {shareHint === 'wechat' ? '微信邀请已带上你的识别码' : '海报已带上二维码和识别码'}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">海报预览</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">已带识别码</span>
          </div>
          <Poster />
        </section>

        <section className="pt-4">
          <button
            type="button"
            onClick={() => setShowPromoterSheet(true)}
            className="flex w-full items-center gap-3 rounded-[20px] bg-[linear-gradient(135deg,#fff7ed,#eef8ff)] px-4 py-4 text-left shadow-[0_16px_30px_-24px_rgba(248,126,49,0.5)] ring-1 ring-white/80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/10">
              <BadgePercent className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">成为家校服务推荐人</p>
              <p className="mt-0.5 text-xs text-muted-foreground">推荐机构开通后，可获得服务推荐奖励 {inviteData.serviceReward}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </section>
      </main>

      {showPosterSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/46">
          <div className="max-h-[92vh] w-full overflow-auto rounded-t-[24px] bg-background px-4 pb-8 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">分享海报</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">当前海报已带上你的识别码</p>
              </div>
              <button onClick={() => setShowPosterSheet(false)} className="rounded-full bg-muted p-2" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Poster />
            <button
              type="button"
              onClick={handleWechatShare}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#07C160] text-sm font-bold text-white"
            >
              <MessageCircle className="h-5 w-5" />
              发送给微信好友
            </button>
          </div>
        </div>
      )}

      {showPromoterSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/46">
          <div className="w-full rounded-t-[24px] bg-background px-4 pb-8 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">成为家校服务推荐人</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{inviteData.parentName} 的专属识别码：{inviteData.inviteCode}</p>
              </div>
              <button onClick={() => setShowPromoterSheet(false)} className="rounded-full bg-muted p-2" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Megaphone, label: '专属识别码' },
                { icon: BadgePercent, label: `${inviteData.serviceReward}/家` },
                { icon: QrCode, label: '推荐记录' },
              ].map((item) => (
                <div key={item.label} className="rounded-[16px] bg-white/65 px-2 py-3 text-center ring-1 ring-white/70">
                  <item.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-1.5 text-xs font-semibold">{item.label}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPromoterSheet(false)}
              className="mt-5 h-12 w-full rounded-[16px] bg-primary text-sm font-bold text-primary-foreground"
            >
              申请成为推荐人
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
