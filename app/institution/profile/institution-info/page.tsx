'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Building2, CheckCircle2, ImageIcon, MapPin, Phone } from 'lucide-react'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'
import { Input } from '@/components/ui/input'

export default function InstitutionInfoPage() {
  const router = useRouter()
  const { settings, updateSettings } = useInstitutionProfileSettings()

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="safe-area-top flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-muted" aria-label="返回">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">机构信息</h1>
      </header>

      <main className="scrollbar-quiet flex-1 overflow-auto px-4 py-5">
        <section className="rounded-3xl bg-card p-4 card-dream">
          <div className="flex items-center gap-4">
            <div className="h-[72px] w-[72px] overflow-hidden rounded-3xl bg-muted shadow-sm ring-2 ring-white">
              <Image
                src={settings.institutionLogo}
                alt={settings.institutionName}
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{settings.institutionName}</p>
              <p className="mt-1 text-xs text-muted-foreground">修改后会同步到机构首页展示</p>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-4 rounded-3xl bg-card p-4 card-dream">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              机构名称
            </label>
            <Input
              value={settings.institutionName}
              onChange={(event) => updateSettings({ institutionName: event.target.value })}
              className="h-11 rounded-xl bg-muted/35"
              placeholder="请输入机构名称"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              机构 Logo 图片路径
            </label>
            <Input
              value={settings.institutionLogo}
              onChange={(event) => updateSettings({ institutionLogo: event.target.value })}
              className="h-11 rounded-xl bg-muted/35"
              placeholder="/images/institutions/qicai.png"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              联系电话
            </label>
            <Input className="h-11 rounded-xl bg-muted/35" defaultValue="0571-88888888" />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              机构地址
            </label>
            <Input className="h-11 rounded-xl bg-muted/35" defaultValue="杭州市西湖区文三路168号" />
          </div>
        </section>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          机构名称和 Logo 会同步展示在首页头部。
        </div>
      </main>
    </div>
  )
}
