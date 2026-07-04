'use client'

import { useState } from 'react'
import { Download, MessageCircle, X } from 'lucide-react'
import { parentInvitePosterSrc, parentInviteQrSrc, parentInviteWechatPreviewSrc } from '@/lib/invite-assets'

export interface ParentBindingInviteStudent {
  name: string
}

interface InstitutionParentBindingInviteModalProps {
  student: ParentBindingInviteStudent
  institutionName: string
  onClose: () => void
  position?: 'fixed' | 'absolute'
}

export function InstitutionParentBindingInviteModal({
  student,
  institutionName,
  onClose,
  position = 'fixed',
}: InstitutionParentBindingInviteModalProps) {
  const [showWechatPreview, setShowWechatPreview] = useState(false)
  const overlayPositionClass = position === 'absolute' ? 'absolute' : 'fixed'

  const loadPosterImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = src
    })

  const handleDownloadPoster = async () => {
    const link = document.createElement('a')
    link.download = `${student.name}-家长绑定邀请海报.png`

    try {
      const [posterImage, qrImage] = await Promise.all([
        loadPosterImage(parentInvitePosterSrc),
        loadPosterImage(parentInviteQrSrc),
      ])
      const canvas = document.createElement('canvas')
      canvas.width = posterImage.naturalWidth
      canvas.height = posterImage.naturalHeight
      const context = canvas.getContext('2d')

      if (!context) throw new Error('Canvas context unavailable')

      context.drawImage(posterImage, 0, 0, canvas.width, canvas.height)

      const qrBoxSize = canvas.width * 0.0945
      const qrBoxX = canvas.width * 0.52825
      const qrBoxY = canvas.height - canvas.height * 0.0345 - qrBoxSize
      const qrPadding = canvas.width * 0.004
      context.fillStyle = '#ffffff'
      context.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
      context.drawImage(
        qrImage,
        qrBoxX + qrPadding,
        qrBoxY + qrPadding,
        qrBoxSize - qrPadding * 2,
        qrBoxSize - qrPadding * 2,
      )

      context.fillStyle = '#ff7a1a'
      context.font = `900 ${Math.round(canvas.width * 0.024)}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      context.textBaseline = 'middle'
      context.fillText(institutionName, canvas.width * 0.642, canvas.height * 0.932)

      link.href = canvas.toDataURL('image/png')
    } catch {
      link.href = parentInvitePosterSrc
    }

    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <>
      <div className={`${overlayPositionClass} inset-0 z-50 flex items-end bg-black/45`}>
        <div className="max-h-[92vh] w-full overflow-auto rounded-t-[26px] bg-background px-4 pb-8 pt-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">发送家长绑定邀请</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {student.name} · {institutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-auto max-w-[320px]">
            <div className="relative overflow-hidden rounded-[18px] bg-white shadow-[0_20px_40px_-26px_rgba(25,39,65,0.48)] ring-1 ring-border">
              <img
                src={parentInvitePosterSrc}
                alt="家长绑定邀请海报"
                className="block aspect-[2/3] w-full object-cover"
              />
              <div className="absolute bottom-[3.45%] left-[52.825%] flex w-[9.45%] items-center justify-center rounded-[7px] bg-white p-[0.35%]">
                <img src={parentInviteQrSrc} alt="家长绑定邀请二维码" className="block w-full" />
              </div>
              <div className="absolute left-[64.2%] right-[5.5%] top-[92.45%]">
                <p className="truncate text-left text-[11px] font-black leading-none text-[#ff7a1a]">
                  {institutionName}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowWechatPreview(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#07C160] text-sm font-bold text-white shadow-[0_14px_24px_-18px_rgba(7,193,96,0.8)]"
            >
              <MessageCircle className="h-5 w-5" />
              发送微信
            </button>
            <button
              type="button"
              onClick={handleDownloadPoster}
              className="flex h-12 items-center justify-center gap-2 rounded-[16px] institution-btn-primary text-sm font-bold"
            >
              <Download className="h-5 w-5" />
              下载图片
            </button>
          </div>
        </div>
      </div>

      {showWechatPreview && (
        <div className={`${overlayPositionClass} inset-0 z-[60] bg-[#ededed]`}>
          <img
            src={parentInviteWechatPreviewSrc}
            alt="机构邀请家长微信分享预览"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => setShowWechatPreview(false)}
            className="absolute right-4 top-[calc(var(--kxb-mp-status-bar-height)+10px)] z-[70] flex h-9 w-9 items-center justify-center rounded-full bg-white/75 text-slate-700 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.55)] ring-1 ring-black/10 backdrop-blur"
            aria-label="关闭微信分享预览"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
