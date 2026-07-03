'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Share2, QrCode, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InvitePosterPage() {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  
  const inviteCode = 'QCY-2026-ABCD'
  const orgName = '七彩培训中心'

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2000)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border bg-background">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">邀请海报</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        {/* Poster Preview */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-6 text-white shadow-2xl mb-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold">课</span>
            </div>
            <h2 className="text-xl font-bold mb-1">课小宝</h2>
            <p className="text-white/80 text-sm">AI教培管理平台</p>
          </div>

          {/* Invite info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
            <p className="text-white/70 text-xs text-center mb-2">诚邀您加入</p>
            <p className="text-xl font-bold text-center mb-1">{orgName}</p>
            <p className="text-white/70 text-xs text-center">成为我们的教师团队一员</p>
          </div>

          {/* QR Code placeholder */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="w-32 h-32 mx-auto bg-muted rounded-xl flex items-center justify-center mb-3">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
            <p className="text-foreground text-xs text-center">扫码或长按识别加入</p>
          </div>

          {/* Invite code */}
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1">或输入邀请码</p>
            <p className="text-2xl font-bold tracking-widest">{inviteCode}</p>
          </div>

          {/* Features */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '📱', label: '智能排课' },
                { icon: '🎯', label: 'AI点名' },
                { icon: '💰', label: '薪资结算' },
              ].map(item => (
                <div key={item.label} className="text-xs">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-white/80 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              'w-full h-12 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
              downloaded
                ? 'bg-green-500 text-white'
                : 'bg-primary text-primary-foreground'
            )}
          >
            {downloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                生成海报中...
              </>
            ) : downloaded ? (
              <>
                <CheckCircle className="w-5 h-5" />
                已保存到相册
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                保存海报到相册
              </>
            )}
          </button>

          <button
            onClick={() => {
              // 模拟分享
            }}
            className="w-full h-12 bg-secondary/10 text-secondary rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            分享给教师
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-background rounded-xl">
          <p className="text-sm font-medium mb-2">使用说明</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• 保存海报后可通过微信、朋友圈等分享给教师</li>
            <li>• 教师扫码后会跳转到加入页面，完成注册即可加入</li>
            <li>• 邀请码有效期30天，可在员工管理中重新生成</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
