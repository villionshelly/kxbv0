'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  userName: '王女士',
  inviteCode: '42859317',
  qrSrc: '/images/posters/invite-institution-qr.svg',
  posterBgSrc: '/images/posters/invite-institution-template-20260703.png',
  serviceReward: '¥128',
}

export default function InviteInstitutionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAssistantEmbed = searchParams.get('assistantEmbed') === '1'
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
    <div className="relative mx-auto aspect-[2/3] w-full max-w-[360px] overflow-hidden rounded-[18px] bg-white shadow-[0_22px_42px_-28px_rgba(69,86,116,0.45)] ring-1 ring-white/90">
      <img
        src={inviteData.posterBgSrc}
        alt="机构入驻邀请海报底图"
        className="absolute inset-0 h-full w-full object-contain"
      />

      <div className="absolute left-[3.2%] top-[2.4%] flex items-center gap-2 rounded-[14px] bg-white/92 px-[3.4%] py-[1.8%] shadow-[0_12px_28px_-22px_rgba(20,35,58,0.72)] ring-1 ring-white/90">
        <img src="/logo.png" alt="课小宝AI" className="h-8 w-8 object-contain" />
        <span className="text-[18px] font-black leading-none tracking-normal text-[#112039]">课小宝AI</span>
      </div>

      <div className="absolute bottom-[8.5%] left-[6.4%] flex w-[20.2%] items-center justify-center rounded-[12px] bg-white p-[1.2%] ring-1 ring-[#ff8b31]">
        <img src={inviteData.qrSrc} alt="机构入驻邀请二维码" className="block w-full" />
      </div>

      <div className="absolute left-[30%] right-[27%] top-[82.4%] flex flex-col items-start">
        <p className="flex items-center gap-1 whitespace-nowrap text-[clamp(9px,2.35vw,12px)] font-bold leading-none tracking-[0.04em] text-[#b8651e]">
          <span className="text-[0.86em] text-[#f59b2b]">✦</span>
          <span className="text-[#c97922]">❬</span>
          <span>来自 {inviteData.userName} 推荐</span>
          <span className="text-[#c97922]">❭</span>
          <span className="text-[0.86em] text-[#f59b2b]">✦</span>
        </p>
        <div className="mt-[4.2%] flex w-full items-center gap-1.5 rounded-full bg-[#fff2df]/95 px-3 py-[2.5%] shadow-[0_10px_20px_-18px_rgba(115,67,29,0.55)]">
          <span className="whitespace-nowrap text-[clamp(9px,2.4vw,11px)] font-black text-[#192338]">邀请码</span>
          <span className="font-mono text-[clamp(10px,3.2vw,16px)] font-black tracking-[0.08em] text-[#101c31]">
            {inviteData.inviteCode}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col warm-bg">
      {!isAssistantEmbed && (
        <header className="safe-area-top px-4 pb-1 warm-header">
          <div className="flex items-center gap-2 py-1">
            <button onClick={() => router.back()} className="-ml-1.5 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">邀请机构入驻</h1>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-auto px-4 pb-40">
        <section className={`px-1 ${isAssistantEmbed ? 'pt-5' : 'pt-2'}`}>
          <div className="py-2">
            <h2 className="text-[28px] font-black leading-tight text-foreground">
              邀请机构
              <br />
              开通家校服务
            </h2>
            <p className="mt-2 max-w-[230px] text-sm leading-5 text-muted-foreground">
              家长少操心，老师少重复。
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
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
              <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-white/70 px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-white/80">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {shareHint === 'wechat' ? '微信邀请已带上你的识别码' : '海报已带上二维码和识别码'}
              </div>
            )}
          </div>
        </section>

        <section className="pt-4">
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-foreground">海报预览</h2>
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
                <p className="mt-0.5 text-xs text-muted-foreground">{inviteData.userName} 的专属识别码：{inviteData.inviteCode}</p>
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
