import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { HideNextDevIndicator } from '@/components/hide-next-dev-indicator'
import './globals.css'

export const metadata: Metadata = {
  title: '课小宝 - AI教培管理平台',
  description: '招生、续费、转介绍，一个平台全搞定。家长管课更省心，机构增长更高效。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <HideNextDevIndicator />
        <Analytics />
      </body>
    </html>
  )
}
