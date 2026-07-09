'use client'

import { useEffect, useState } from 'react'
import { institutionInfo } from '@/lib/mock-data'

const storageKey = 'kxb-institution-profile-settings'

export type InstitutionVerification =
  | {
      status: 'unverified'
      type: null
    }
  | {
      status: 'verified'
      type: 'personal'
      verifiedAt: string
      realName: string
      idNumber: string
      phone: string
      idCardFrontImageName?: string
      idCardBackImageName?: string
    }
  | {
      status: 'verified'
      type: 'company'
      verifiedAt: string
      licenseName: string
      unifiedSocialCreditCode: string
      legalRepresentative: string
      phone: string
      signatoryName: string
      signatoryPhone: string
      businessLicenseImageName?: string
    }

export type InstitutionProfileSettings = {
  institutionName: string
  institutionLogo: string
  institutionPhone: string
  institutionAddress: string
  institutionPoiName: string
  institutionPoiAddress: string
  institutionAddressDetail: string
  institutionLatitude: number
  institutionLongitude: number
  accountNickname: string
  accountAvatar: string
  accountPhone: string
  verification: InstitutionVerification
}

export const defaultInstitutionProfileSettings: InstitutionProfileSettings = {
  institutionName: institutionInfo.name,
  institutionLogo: institutionInfo.logo,
  institutionPhone: institutionInfo.phone,
  institutionAddress: '杭州市西湖区文三路168号',
  institutionPoiName: '文三路168号',
  institutionPoiAddress: '杭州市西湖区文三路168号',
  institutionAddressDetail: '',
  institutionLatitude: 30.281943,
  institutionLongitude: 120.130663,
  accountNickname: '李道一',
  accountAvatar: '/images/avatars/sea-sailboat-avatar.png',
  accountPhone: '138****8888',
  verification: {
    status: 'unverified',
    type: null,
  },
}

function readSettings() {
  if (typeof window === 'undefined') return defaultInstitutionProfileSettings

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultInstitutionProfileSettings
    const saved = JSON.parse(raw) as Partial<InstitutionProfileSettings>
    const parsed = {
      ...defaultInstitutionProfileSettings,
      ...saved,
      verification: saved.verification || defaultInstitutionProfileSettings.verification,
    }
    if (['王可乐妈妈', '可乐妈妈'].includes(parsed.accountNickname)) {
      parsed.accountNickname = defaultInstitutionProfileSettings.accountNickname
    }
    if (['/images/avatars/parent-mom.jpg', '/images/avatars/teacher-lixue-photo.jpg'].includes(parsed.accountAvatar)) {
      parsed.accountAvatar = defaultInstitutionProfileSettings.accountAvatar
    }
    return parsed
  } catch {
    return defaultInstitutionProfileSettings
  }
}

export function useInstitutionProfileSettings() {
  const [settings, setSettings] = useState(defaultInstitutionProfileSettings)

  useEffect(() => {
    setSettings(readSettings())
  }, [])

  const updateSettings = (next: Partial<InstitutionProfileSettings>) => {
    setSettings((current) => {
      const merged = { ...current, ...next }
      window.localStorage.setItem(storageKey, JSON.stringify(merged))
      window.dispatchEvent(new CustomEvent('kxb-institution-profile-settings-updated', { detail: merged }))
      return merged
    })
  }

  useEffect(() => {
    const handleStorage = () => setSettings(readSettings())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('kxb-institution-profile-settings-updated', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('kxb-institution-profile-settings-updated', handleStorage)
    }
  }, [])

  return { settings, updateSettings }
}
