'use client'

import { useEffect, useState } from 'react'
import { institutionInfo } from '@/lib/mock-data'

const storageKey = 'kxb-institution-profile-settings'

export type InstitutionProfileSettings = {
  institutionName: string
  institutionLogo: string
  accountNickname: string
  accountAvatar: string
  accountPhone: string
}

export const defaultInstitutionProfileSettings: InstitutionProfileSettings = {
  institutionName: institutionInfo.name,
  institutionLogo: institutionInfo.logo,
  accountNickname: '李道一',
  accountAvatar: '/images/avatars/sea-sailboat-avatar.png',
  accountPhone: '138****8888',
}

function readSettings() {
  if (typeof window === 'undefined') return defaultInstitutionProfileSettings

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultInstitutionProfileSettings
    const parsed = { ...defaultInstitutionProfileSettings, ...JSON.parse(raw) }
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
