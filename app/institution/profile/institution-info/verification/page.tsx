'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  ImagePlus,
  Phone,
  ScanLine,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  type InstitutionVerification,
  useInstitutionProfileSettings,
} from '@/lib/institution-profile-store'
import { cn } from '@/lib/utils'

type VerificationType = 'personal' | 'company'
type CredentialKind = 'idCardFront' | 'idCardBack' | 'businessLicense'
type UploadedCredential = {
  name: string
  preview: string
}

const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
const businessLicensePattern = /^[159Y][1239]\d{6}[0-9ABCDEFGHJKLMNPQRTUWXY]{10}$/
const mobilePattern = /^1[3-9]\d{9}$/

function nowText() {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export default function InstitutionVerificationPage() {
  const router = useRouter()
  const { settings, updateSettings } = useInstitutionProfileSettings()
  const initialType: VerificationType = settings.verification.type || 'company'
  const [type, setType] = useState<VerificationType>(initialType)
  const [realName, setRealName] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'personal'
      ? settings.verification.realName
      : settings.accountNickname
  )
  const [idNumber, setIdNumber] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'personal'
      ? settings.verification.idNumber
      : ''
  )
  const [personalPhone, setPersonalPhone] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'personal'
      ? settings.verification.phone
      : ''
  )
  const [licenseName, setLicenseName] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.licenseName
      : settings.institutionName
  )
  const [creditCode, setCreditCode] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.unifiedSocialCreditCode
      : ''
  )
  const [legalRepresentative, setLegalRepresentative] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.legalRepresentative
      : settings.accountNickname
  )
  const [companyPhone, setCompanyPhone] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.phone
      : settings.institutionPhone.replace(/\D/g, '').slice(0, 11)
  )
  const [signatoryName, setSignatoryName] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.signatoryName
      : settings.accountNickname
  )
  const [signatoryPhone, setSignatoryPhone] = useState(
    settings.verification.status === 'verified' && settings.verification.type === 'company'
      ? settings.verification.signatoryPhone
      : ''
  )
  const [idCardFront, setIdCardFront] = useState<UploadedCredential | null>(null)
  const [idCardBack, setIdCardBack] = useState<UploadedCredential | null>(null)
  const [businessLicense, setBusinessLicense] = useState<UploadedCredential | null>(null)
  const [error, setError] = useState('')
  const isVerified = settings.verification.status === 'verified'
  const isPersonalVerified = isVerified && settings.verification.type === 'personal'
  const isCompanyVerified = isVerified && settings.verification.type === 'company'
  const showVerificationForm = !isVerified || (isPersonalVerified && type === 'company')

  useEffect(() => {
    if (settings.verification.status !== 'verified') return

    setType(settings.verification.type)
    if (settings.verification.type === 'personal') {
      setRealName(settings.verification.realName)
      setIdNumber(settings.verification.idNumber)
      setPersonalPhone(settings.verification.phone)
      if (settings.verification.idCardFrontImageName) {
        setIdCardFront({ name: settings.verification.idCardFrontImageName, preview: '' })
      }
      if (settings.verification.idCardBackImageName) {
        setIdCardBack({ name: settings.verification.idCardBackImageName, preview: '' })
      }
      return
    }

    setLicenseName(settings.verification.licenseName)
    setCreditCode(settings.verification.unifiedSocialCreditCode)
    setLegalRepresentative(settings.verification.legalRepresentative)
    setCompanyPhone(settings.verification.phone)
    setSignatoryName(settings.verification.signatoryName)
    setSignatoryPhone(settings.verification.signatoryPhone)
    if (settings.verification.businessLicenseImageName) {
      setBusinessLicense({ name: settings.verification.businessLicenseImageName, preview: '' })
    }
  }, [settings.verification])

  const handleCredentialUpload = (kind: CredentialKind, file?: File) => {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('证件仅支持 JPG、PNG、WEBP 等图片格式。')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('单张证件图片不能超过 10MB。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const credential = {
        name: file.name,
        preview: typeof reader.result === 'string' ? reader.result : '',
      }
      if (kind === 'idCardFront') {
        setIdCardFront(credential)
        setRealName('李道一')
        setIdNumber('330106199001011234')
      } else if (kind === 'idCardBack') {
        setIdCardBack(credential)
      } else {
        setBusinessLicense(credential)
        setLicenseName('杭州七彩艺术培训有限公司')
        setCreditCode('91330106MA2KXB001A')
      }
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    setError('')
    if (isCompanyVerified || (isPersonalVerified && type === 'personal')) {
      setError('已认证主体不支持修改。')
      return
    }
    if (type === 'personal') {
      if (!idCardFront || !idCardBack) {
        setError('请先上传身份证人像面和国徽面。')
        return
      }
      if (!realName.trim()) {
        setError('请填写身份证上的真实姓名。')
        return
      }
      if (!idCardPattern.test(idNumber.trim())) {
        setError('身份证号格式不正确，请输入合法的18位身份证号。')
        return
      }
      if (!mobilePattern.test(personalPhone)) {
        setError('联系电话格式不正确，请输入合法的11位中国大陆手机号。')
        return
      }
      updateSettings({
        verification: {
          status: 'verified',
          type: 'personal',
          verifiedAt: nowText(),
          realName: realName.trim(),
          idNumber: idNumber.trim().toUpperCase(),
          phone: personalPhone,
          idCardFrontImageName: idCardFront.name,
          idCardBackImageName: idCardBack.name,
        },
      })
    } else {
      if (!businessLicense) {
        setError('请先上传营业执照图片。')
        return
      }
      if (!licenseName.trim()) {
        setError('请填写营业执照上的主体名称。')
        return
      }
      if (!businessLicensePattern.test(creditCode.trim().toUpperCase())) {
        setError('统一社会信用代码格式不正确，请输入合法的18位代码。')
        return
      }
      if (!legalRepresentative.trim()) {
        setError('请填写营业执照上的法定代表人。')
        return
      }
      if (!mobilePattern.test(companyPhone)) {
        setError('主体联系电话格式不正确，请输入合法的11位中国大陆手机号。')
        return
      }
      if (!signatoryName.trim()) {
        setError('请填写合同签约联系人姓名。')
        return
      }
      if (!mobilePattern.test(signatoryPhone)) {
        setError('签约联系人电话格式不正确，请输入合法的11位中国大陆手机号。')
        return
      }
      updateSettings({
        institutionName: licenseName.trim(),
        verification: {
          status: 'verified',
          type: 'company',
          verifiedAt: nowText(),
          licenseName: licenseName.trim(),
          unifiedSocialCreditCode: creditCode.trim().toUpperCase(),
          legalRepresentative: legalRepresentative.trim(),
          phone: companyPhone,
          signatoryName: signatoryName.trim(),
          signatoryPhone,
          businessLicenseImageName: businessLicense.name,
        },
      })
    }
    router.replace('/institution/profile/institution-info')
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="safe-area-top flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-muted" aria-label="返回">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">机构实名认证</h1>
      </header>

      <main className="scrollbar-quiet flex-1 overflow-auto px-4 py-4">
        <section className="rounded-3xl bg-card p-4 card-dream">
          <p className="text-sm font-bold">
            {isCompanyVerified ? '认证主体' : isPersonalVerified ? '认证状态' : '选择认证主体'}
          </p>
          {isCompanyVerified ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Building2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">企业实名认证已完成</p>
                <p className="mt-0.5 text-xs">认证主体已锁定，不支持修改或更换。</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('personal')
                  setError('')
                }}
                disabled={!isPersonalVerified && isVerified}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50',
                  type === 'personal'
                    ? 'border-primary bg-orange-50 text-primary'
                    : 'border-border bg-white text-muted-foreground'
                )}
              >
                <UserRound className="h-4 w-4" />
                {isPersonalVerified ? '已认证个人' : '个人认证'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('company')
                  setError('')
                }}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold',
                  type === 'company'
                    ? 'border-primary bg-orange-50 text-primary'
                    : 'border-border bg-white text-muted-foreground'
                )}
              >
                <Building2 className="h-4 w-4" />
                {isPersonalVerified ? '升级企业认证' : '企业认证'}
              </button>
            </div>
          )}
          {isPersonalVerified && (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              个人认证资料不可修改，可上传营业执照升级为企业实名认证；升级完成后不可退回个人认证。
            </p>
          )}
        </section>

        {showVerificationForm ? (
        <section className="mt-4 space-y-4 rounded-3xl bg-card p-4 card-dream">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">1. 上传认证证件</p>
                <p className="mt-1 text-xs text-muted-foreground">上传完成后自动识别名称和号码</p>
              </div>
              <ScanLine className="h-5 w-5 text-primary" />
            </div>
            {type === 'personal' ? (
              <div className="grid grid-cols-2 gap-3">
                <CredentialUpload
                  id="id-card-front"
                  label="身份证人像面"
                  credential={idCardFront}
                  onChange={file => handleCredentialUpload('idCardFront', file)}
                />
                <CredentialUpload
                  id="id-card-back"
                  label="身份证国徽面"
                  credential={idCardBack}
                  onChange={file => handleCredentialUpload('idCardBack', file)}
                />
              </div>
            ) : (
              <CredentialUpload
                id="business-license"
                label="营业执照"
                credential={businessLicense}
                onChange={file => handleCredentialUpload('businessLicense', file)}
                wide
              />
            )}
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">支持 JPG、PNG、WEBP，单张不超过 10MB。证件文字需清晰完整、无遮挡。</p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">2. 核对识别信息</p>
                <p className="mt-1 text-xs text-muted-foreground">识别结果支持手动修改</p>
              </div>
              {(type === 'personal' ? idCardFront && idCardBack : businessLicense) && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">已识别</span>
              )}
            </div>
          {type === 'personal' ? (
            <>
              <Field icon={UserRound} label="真实姓名">
                <Input value={realName} onChange={event => setRealName(event.target.value)} placeholder="请输入身份证姓名" />
              </Field>
              <Field icon={CreditCard} label="身份证号">
                <Input value={idNumber} onChange={event => setIdNumber(event.target.value.replace(/[^0-9Xx]/g, '').slice(0, 18))} placeholder="请输入18位身份证号" />
              </Field>
              <Field icon={Phone} label="联系电话">
                <Input value={personalPhone} inputMode="numeric" onChange={event => setPersonalPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="请输入11位手机号" />
              </Field>
            </>
          ) : (
            <>
              <Field icon={Building2} label="营业执照名称">
                <Input value={licenseName} onChange={event => setLicenseName(event.target.value)} placeholder="请输入营业执照主体全称" />
              </Field>
              <Field icon={CreditCard} label="统一社会信用代码">
                <Input value={creditCode} onChange={event => setCreditCode(event.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 18))} placeholder="请输入18位统一社会信用代码" />
              </Field>
              <Field icon={UserRound} label="法定代表人">
                <Input value={legalRepresentative} onChange={event => setLegalRepresentative(event.target.value)} placeholder="请输入法人姓名" />
              </Field>
              <Field icon={Phone} label="主体联系电话">
                <Input value={companyPhone} inputMode="numeric" onChange={event => setCompanyPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="请输入11位手机号" />
              </Field>
              <div className="border-t border-border pt-4">
                <p className="mb-3 text-xs leading-5 text-muted-foreground">合同签约人可以是机构联系人，姓名和手机号将显示在合同中。</p>
                <div className="space-y-4">
                  <Field icon={UserRound} label="签约联系人">
                    <Input value={signatoryName} onChange={event => setSignatoryName(event.target.value)} placeholder="请输入签约联系人姓名" />
                  </Field>
                  <Field icon={Phone} label="签约联系人电话">
                    <Input value={signatoryPhone} inputMode="numeric" onChange={event => setSignatoryPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="请输入11位手机号" />
                  </Field>
                </div>
              </div>
            </>
          )}
          </div>
        </section>
        ) : (
          <VerifiedIdentityDetails verification={settings.verification} />
        )}

        {error && <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-700">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
          认证信息用于确认合同甲方主体。重新认证仅影响之后新发起或重新发起的合同，历史已签约合同保留原认证信息。
        </div>

        {showVerificationForm && (
          <button type="button" onClick={submit} className="mt-4 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            {isPersonalVerified && type === 'company' ? '提交企业认证升级' : '提交实名认证'}
          </button>
        )}
      </main>
    </div>
  )
}

function VerifiedIdentityDetails({ verification }: { verification: InstitutionVerification }) {
  if (verification.status !== 'verified') return null

  const rows = verification.type === 'personal'
    ? [
        { label: '真实姓名', value: verification.realName },
        { label: '身份证号', value: verification.idNumber },
        { label: '联系电话', value: verification.phone },
        { label: '身份证人像面', value: verification.idCardFrontImageName || '认证证件已存档' },
        { label: '身份证国徽面', value: verification.idCardBackImageName || '认证证件已存档' },
      ]
    : [
        { label: '营业执照名称', value: verification.licenseName },
        { label: '统一社会信用代码', value: verification.unifiedSocialCreditCode },
        { label: '法定代表人', value: verification.legalRepresentative },
        { label: '主体联系电话', value: verification.phone },
        { label: '签约联系人', value: `${verification.signatoryName}（${verification.signatoryPhone}）` },
        { label: '营业执照', value: verification.businessLicenseImageName || '认证证件已存档' },
      ]

  return (
    <section className="mt-4 rounded-3xl bg-card p-4 card-dream">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-sm font-bold">已认证资料</p>
          <p className="mt-0.5 text-xs text-muted-foreground">认证时间：{verification.verifiedAt}</p>
        </div>
      </div>
      <dl className="mt-4 divide-y divide-border">
        {rows.map(row => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-3 text-sm">
            <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 break-all text-right font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        已认证主体不支持修改。认证资料如存在错误，请联系平台人工核验处理。
      </div>
    </section>
  )
}

function CredentialUpload({
  id,
  label,
  credential,
  onChange,
  wide = false,
}: {
  id: string
  label: string
  credential: UploadedCredential | null
  onChange: (file?: File) => void
  wide?: boolean
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-dashed', credential ? 'border-emerald-300 bg-emerald-50/40' : 'border-border bg-muted/20', wide && 'w-full')}>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={event => {
          onChange(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <label htmlFor={id} className={cn('flex cursor-pointer items-center gap-3 p-3', wide ? 'min-h-28' : 'min-h-32 flex-col justify-center text-center')}>
        {credential?.preview ? (
          <img src={credential.preview} alt={label} className={cn('rounded-xl object-cover', wide ? 'h-20 w-28' : 'h-16 w-24')} />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            {credential ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <ImagePlus className="h-5 w-5" />}
          </span>
        )}
        <span className={cn('min-w-0', wide && 'flex-1 text-left')}>
          <span className="block text-xs font-semibold text-foreground">{label}</span>
          <span className="mt-1 block truncate text-[10px] text-muted-foreground">
            {credential ? credential.name : '点击上传图片'}
          </span>
          {credential && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
              <UploadCloud className="h-3 w-3" />
              已上传，点击可重选
            </span>
          )}
        </span>
      </label>
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound
  label: string
  children: ReactNode
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
