'use client'

import { useEffect, useState } from 'react'

const storageKey = 'kxb-parent-profile-settings'

export type ParentProfileSettings = {
  nickname: string
  avatar: string
  phone: string
  relation: string
  customRelation: string
}

export const defaultParentProfileSettings: ParentProfileSettings = {
  nickname: '王女士',
  avatar: '/images/avatars/parent-mom.jpg',
  phone: '',
  relation: '妈妈',
  customRelation: '',
}

function readSettings() {
  if (typeof window === 'undefined') return defaultParentProfileSettings

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultParentProfileSettings
    return { ...defaultParentProfileSettings, ...JSON.parse(raw) }
  } catch {
    return defaultParentProfileSettings
  }
}

export function useParentProfileSettings() {
  const [settings, setSettings] = useState(defaultParentProfileSettings)

  useEffect(() => {
    setSettings(readSettings())
  }, [])

  const updateSettings = (next: Partial<ParentProfileSettings>) => {
    setSettings((current) => {
      const merged = { ...current, ...next }
      window.localStorage.setItem(storageKey, JSON.stringify(merged))
      window.dispatchEvent(new CustomEvent('kxb-parent-profile-settings-updated', { detail: merged }))
      return merged
    })
  }

  useEffect(() => {
    const handleStorage = () => setSettings(readSettings())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('kxb-parent-profile-settings-updated', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('kxb-parent-profile-settings-updated', handleStorage)
    }
  }, [])

  return { settings, updateSettings }
}
