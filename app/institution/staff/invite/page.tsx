'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, QrCode, Share2, X } from 'lucide-react'
import { parentInviteQrSrc } from '@/lib/invite-assets'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

const posterSrc = '/images/posters/invite-institution-teacher.png'

function loadPosterImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    const timer = window.setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`))
    }, 2400)
    image.onload = () => {
      window.clearTimeout(timer)
      resolve(image)
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error(`Image load failed: ${src}`))
    }
    image.src = src
  })
}

function fitFontSize(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
) {
  let size = initialSize
  while (size > minSize) {
    context.font = `900 ${size}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    if (context.measureText(text).width <= maxWidth) return size
    size -= 4
  }
  return minSize
}

export default function InstitutionStaffInvitePage() {
  const { settings } = useInstitutionProfileSettings()
  const displayInstitutionName = settings.institutionName.trim() || '七彩培训中心'
  const rawInstitutionCode = settings.institutionCode.replace(/\D/g, '')
  const displayInstitutionCode = rawInstitutionCode.length === 8 ? rawInstitutionCode : '73918426'
  const [showQr, setShowQr] = useState(false)
  const [showWechatShare, setShowWechatShare] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [composedPosterSrc, setComposedPosterSrc] = useState(posterSrc)

  useEffect(() => {
    let cancelled = false

    const composePoster = async (): Promise<string> => {
      try {
        const [posterImage, qrImage] = await Promise.all([
          loadPosterImage(posterSrc),
          loadPosterImage(parentInviteQrSrc),
        ])
        const canvas = document.createElement('canvas')
        canvas.width = posterImage.naturalWidth
        canvas.height = posterImage.naturalHeight
        const context = canvas.getContext('2d')

        if (!context) throw new Error('Canvas context unavailable')

        context.drawImage(posterImage, 0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const institutionName = displayInstitutionName
        const institutionCode = displayInstitutionCode
        const nameMaxWidth = canvas.width * 0.52
        const nameFontSize = fitFontSize(context, institutionName, nameMaxWidth, Math.round(canvas.width * 0.045), Math.round(canvas.width * 0.031))

        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = '#15327a'
        context.font = `900 ${nameFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        context.fillText(institutionName, centerX, canvas.height * 0.268)

        context.fillStyle = '#ff741c'
        context.font = `1000 ${Math.round(canvas.width * 0.044)}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        context.letterSpacing = `${Math.round(canvas.width * 0.004)}px`
        context.fillText(institutionCode, centerX, canvas.height * 0.438)
        context.letterSpacing = '0px'

        // Keep the source poster's dashed positioning frame visible around the QR code.
        const qrBoxSize = canvas.width * 0.152
        const qrBoxX = canvas.width * 0.1765
        const qrBoxY = canvas.height * 0.812
        const qrPadding = canvas.width * 0.019
        context.fillStyle = '#ffffff'
        context.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
        context.drawImage(qrImage, qrBoxX + qrPadding, qrBoxY + qrPadding, qrBoxSize - qrPadding * 2, qrBoxSize - qrPadding * 2)

        return canvas.toDataURL('image/png')
      } catch {
        return posterSrc
      }
    }

    composePoster().then((nextSrc) => {
      if (!cancelled) setComposedPosterSrc(nextSrc)
    })

    return () => {
      cancelled = true
    }
  }, [displayInstitutionCode, displayInstitutionName])

  const handleDownload = () => {
    const anchor = document.createElement('a')
    anchor.href = composedPosterSrc
    anchor.download = `${settings.institutionName || '课小宝'}-教师邀请海报.png`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setDownloaded(true)
    window.setTimeout(() => setDownloaded(false), 1800)
  }

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-4">
        <section className="rounded-2xl bg-card/90 px-4 py-3.5 card-dream">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-bold text-foreground">选择教师邀请方式</p>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">机构代码长期有效</span>
          </div>
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">现场可直接出示二维码；远程邀请可发送或下载下方海报，老师微信授权后即可加入团队。</p>
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl institution-btn-primary text-sm font-semibold transition-transform active:scale-[0.99]"
          >
            <QrCode className="h-[18px] w-[18px]" />
            出示二维码，邀请教师扫码加入
          </button>
        </section>

        <section className="mt-4 overflow-hidden rounded-3xl bg-card p-2 card-dream">
          <img src={composedPosterSrc} alt="教师邀请海报" className="block w-full rounded-2xl" />
        </section>

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-foreground">远程发送邀请海报</p>
            <p className="text-xs text-muted-foreground">内容已固定生成</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setShowWechatShare(true)}
            className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 text-xs font-semibold text-emerald-700 card-dream transition-transform active:scale-[0.98]"
          >
            <Share2 className="h-5 w-5" />
            发送微信
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl institution-btn-primary text-xs font-semibold transition-transform active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            下载海报
          </button>
          </div>
        </section>

        {downloaded && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            邀请海报已保存
          </div>
        )}
      </main>

      {showQr && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/40 p-5" onClick={() => setShowQr(false)}>
          <div className="max-h-full w-full max-w-xs overflow-auto rounded-3xl bg-background p-5 text-center shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between text-left">
              <div>
                <p className="font-semibold">出示教师邀请二维码</p>
                <p className="mt-1 text-xs text-muted-foreground">请老师使用微信扫码授权</p>
              </div>
              <button type="button" onClick={() => setShowQr(false)} className="rounded-full p-2 hover:bg-muted" aria-label="关闭">
                <X className="h-5 w-5" />
              </button>
            </div>
            <img src={parentInviteQrSrc} alt="教师邀请二维码" className="mx-auto h-44 w-44 bg-white p-3 ring-1 ring-border" />
            <div className="mt-4 rounded-2xl bg-blue-50/80 p-3 text-left">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-700">教师扫码后页面预览</p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-blue-600">教师端</span>
              </div>
              <div className="rounded-xl bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <img src={settings.institutionLogo} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{displayInstitutionName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">邀请你加入教师团队</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-2">
                  <span className="text-xs text-muted-foreground">机构代码</span>
                  <span className="font-mono text-sm font-bold tracking-[0.14em] text-foreground">{displayInstitutionCode}</span>
                </div>
                <div className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#07C160] text-xs font-semibold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  微信授权登录并加入
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">老师确认授权后，会自动加入当前机构的教师团队。</p>
            </div>
          </div>
        </div>
      )}

      {showWechatShare && (
        <div className="absolute inset-0 z-[110] flex items-end bg-black/40" onClick={() => setShowWechatShare(false)}>
          <div className="safe-area-bottom w-full rounded-t-3xl bg-background px-5 pb-5 pt-5" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted" />
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
              <img src={settings.institutionLogo} alt="" className="h-11 w-11 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{settings.institutionName}邀请您加入教师团队</p>
                <p className="mt-1 text-xs text-muted-foreground">微信授权后即可完成加入</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowWechatShare(false)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07C160] text-sm font-semibold text-white">
              <Share2 className="h-5 w-5" />
              发送微信好友
            </button>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              将以教师授权卡片发送
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
