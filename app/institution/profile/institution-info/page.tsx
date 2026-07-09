'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BadgeCheck,
  Building2,
  Camera,
  Check,
  ChevronRight,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'
import { cn } from '@/lib/utils'

type Poi = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

const poiOptions: Poi[] = [
  {
    id: 'wensan-168',
    name: '文三路168号',
    address: '杭州市西湖区文三路168号',
    latitude: 30.281943,
    longitude: 120.130663,
  },
  {
    id: 'huanglong-vanke',
    name: '黄龙万科中心',
    address: '杭州市西湖区学院路77号',
    latitude: 30.276453,
    longitude: 120.133459,
  },
  {
    id: 'xixi-yintai',
    name: '西溪银泰城',
    address: '杭州市西湖区双龙街588号',
    latitude: 30.293212,
    longitude: 120.078934,
  },
  {
    id: 'zijingang',
    name: '紫金港商务中心',
    address: '杭州市西湖区古墩路656号',
    latitude: 30.318526,
    longitude: 120.101024,
  },
]

function compressLogo(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败'))
    reader.onload = () => {
      const image = new window.Image()
      image.onerror = () => reject(new Error('图片解析失败'))
      image.onload = () => {
        const maxSize = 512
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('图片处理失败'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', 0.86))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export default function InstitutionInfoPage() {
  const router = useRouter()
  const { settings, updateSettings } = useInstitutionProfileSettings()
  const [logoError, setLogoError] = useState('')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [poiQuery, setPoiQuery] = useState('')
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null)
  const [addressDetail, setAddressDetail] = useState('')

  const filteredPois = useMemo(() => {
    const keyword = poiQuery.trim().toLowerCase()
    if (!keyword) return poiOptions
    return poiOptions.filter(poi =>
      `${poi.name}${poi.address}`.toLowerCase().includes(keyword)
    )
  }, [poiQuery])

  const openLocationPicker = () => {
    const currentPoi = poiOptions.find(poi =>
      poi.latitude === settings.institutionLatitude &&
      poi.longitude === settings.institutionLongitude
    ) || poiOptions[0]
    setSelectedPoi(currentPoi)
    setAddressDetail(settings.institutionAddressDetail)
    setPoiQuery('')
    setShowLocationPicker(true)
  }

  const handleLogoUpload = async (file?: File) => {
    if (!file) return
    setLogoError('')
    if (!file.type.startsWith('image/')) {
      setLogoError('请选择图片文件')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('图片不能超过 5MB')
      return
    }

    try {
      const imageSrc = await compressLogo(file)
      updateSettings({ institutionLogo: imageSrc })
    } catch {
      setLogoError('图片上传失败，请重试')
    }
  }

  const confirmLocation = () => {
    if (!selectedPoi) return
    const detail = addressDetail.trim()
    updateSettings({
      institutionPoiName: selectedPoi.name,
      institutionPoiAddress: selectedPoi.address,
      institutionAddressDetail: detail,
      institutionAddress: detail ? `${selectedPoi.address} ${detail}` : selectedPoi.address,
      institutionLatitude: selectedPoi.latitude,
      institutionLongitude: selectedPoi.longitude,
    })
    setShowLocationPicker(false)
  }

  const navigationHref =
    `https://uri.amap.com/marker?position=${settings.institutionLongitude},${settings.institutionLatitude}` +
    `&name=${encodeURIComponent(settings.institutionPoiName)}&src=kxb&coordinate=gaode&callnative=0`

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-4">
        <button
          type="button"
          onClick={() => router.push('/institution/profile/institution-info/verification')}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left',
            settings.verification.status === 'verified'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-orange-50 text-primary'
          )}
        >
          {settings.verification.status === 'verified'
            ? <BadgeCheck className="h-5 w-5 shrink-0" />
            : <ShieldAlert className="h-5 w-5 shrink-0" />}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">
              {settings.verification.status === 'verified' ? '当前主体已认证' : '机构主体未认证'}
            </span>
            <span className="mt-0.5 block truncate text-xs font-medium opacity-80">
              {settings.verification.status === 'verified'
                ? settings.verification.type === 'personal'
                  ? `${settings.verification.realName} · 个人实名认证`
                  : `${settings.verification.licenseName} · 企业实名认证`
                : '完成认证后可发起模板合同'}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
        </button>

        <section className="mt-4 rounded-3xl bg-card p-4 card-dream">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">机构 Logo</p>
              <p className="mt-1 text-xs text-muted-foreground">点击图片更换</p>
            </div>
            <div className="relative">
              <input
                id="institution-logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={event => {
                  void handleLogoUpload(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <label
                htmlFor="institution-logo-upload"
                className="relative block h-[72px] w-[72px] cursor-pointer overflow-hidden rounded-2xl bg-muted shadow-sm ring-2 ring-white"
                aria-label="上传机构 Logo"
              >
                <img
                  src={settings.institutionLogo}
                  alt={settings.institutionName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-white shadow-sm">
                  <Camera className="h-3.5 w-3.5" />
                </span>
              </label>
            </div>
          </div>
          {logoError && <p className="mt-2 text-right text-xs text-red-600">{logoError}</p>}

          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <Field icon={Building2} label="机构名称">
              <Input
                value={settings.institutionName}
                onChange={event => updateSettings({ institutionName: event.target.value })}
                className="h-11 rounded-xl bg-muted/35"
                placeholder="请输入机构名称"
              />
            </Field>
            <Field icon={Phone} label="联系电话">
              <Input
                value={settings.institutionPhone}
                onChange={event => updateSettings({ institutionPhone: event.target.value })}
                className="h-11 rounded-xl bg-muted/35"
                placeholder="请输入联系电话"
              />
            </Field>
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-card p-4 card-dream">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">机构地址</p>
            <button
              type="button"
              onClick={openLocationPicker}
              className="flex h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700"
            >
              <LocateFixed className="h-3.5 w-3.5" />
              选择位置
            </button>
          </div>

          <button
            type="button"
            onClick={openLocationPicker}
            className="mt-3 flex w-full items-start gap-3 rounded-2xl bg-muted/30 p-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{settings.institutionPoiName}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{settings.institutionAddress}</span>
            </span>
          </button>

          <a
            href={navigationHref}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-xs font-semibold text-foreground"
          >
            <Navigation className="h-3.5 w-3.5" />
            导航到机构
          </a>
        </section>
      </main>

      {showLocationPicker && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/40">
          <div className="max-h-[88vh] w-full overflow-auto rounded-t-[26px] bg-background px-4 pb-8 pt-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">选择机构位置</h2>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 h-36 overflow-hidden rounded-2xl bg-[#eef3ec] ring-1 ring-border">
              <div className="absolute inset-0 opacity-70" style={{
                backgroundImage:
                  'linear-gradient(24deg, transparent 46%, #d5ded1 47%, #d5ded1 51%, transparent 52%), linear-gradient(112deg, transparent 43%, #dce5d8 44%, #dce5d8 49%, transparent 50%)',
                backgroundSize: '92px 72px, 120px 86px',
              }} />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <MapPin className="h-8 w-8 fill-primary text-primary" />
                <span className="mt-1 max-w-48 truncate rounded-full bg-white px-2 py-1 text-[10px] font-semibold shadow-sm">
                  {selectedPoi?.name || '选择位置'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex h-11 items-center gap-2 rounded-xl bg-muted/35 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={poiQuery}
                onChange={event => setPoiQuery(event.target.value)}
                placeholder="搜索地点"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <div className="mt-3 max-h-52 space-y-2 overflow-auto">
              {filteredPois.map(poi => (
                <button
                  key={poi.id}
                  type="button"
                  onClick={() => setSelectedPoi(poi)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3 text-left',
                    selectedPoi?.id === poi.id
                      ? 'border-primary bg-orange-50'
                      : 'border-border bg-white'
                  )}
                >
                  <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', selectedPoi?.id === poi.id ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{poi.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{poi.address}</span>
                  </span>
                  {selectedPoi?.id === poi.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))}
              {filteredPois.length === 0 && (
                <p className="py-5 text-center text-xs text-muted-foreground">未找到地点</p>
              )}
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">详细地址</span>
              <Input
                value={addressDetail}
                onChange={event => setAddressDetail(event.target.value)}
                className="h-11 rounded-xl bg-muted/35"
                placeholder="楼栋、楼层、门牌号"
              />
            </label>

            <button
              type="button"
              onClick={confirmLocation}
              disabled={!selectedPoi}
              className="mt-4 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              确认位置
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      {children}
    </label>
  )
}
