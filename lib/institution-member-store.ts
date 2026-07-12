'use client'

import { useSyncExternalStore } from 'react'
import { teachers } from '@/lib/mock-data'

export type MemberRole = 'admin' | 'teacher'
export type InstitutionPermission =
  | 'manage_administrators'
  | 'invite_administrators'
  | 'manage_teachers'
  | 'manage_operations'
  | 'manage_money'
  | 'manage_verification'

export type InstitutionMember = {
  id: string
  name: string
  avatar: string
  phone: string
  roles: MemberRole[]
  status: 'active' | 'resigned'
  joinDate: string | null
  title?: string
  specialty?: string
  studentCount?: number
  weeklyClasses?: number
}

export type AdminInviteToken = {
  token: string
  createdAt: number
  expiresAt: number
  usedAt: number | null
}

export type CurrentInstitutionUser =
  | { kind: 'owner'; memberId: 'owner' }
  | { kind: 'member'; memberId: string }

type MemberStore = {
  members: InstitutionMember[]
  currentUser: CurrentInstitutionUser
  adminInvites: AdminInviteToken[]
}

const STORAGE_KEY = 'kxb-institution-member-store-v1'
const listeners = new Set<() => void>()
let initialized = false

const initialMembers: InstitutionMember[] = teachers.map((teacher) => ({
  id: teacher.id,
  name: teacher.name,
  avatar: teacher.avatar,
  phone: teacher.phone,
  roles: teacher.role === 'admin' ? ['admin', 'teacher'] : ['teacher'],
  status: 'active' as const,
  joinDate: teacher.joinDate,
  title: teacher.title,
  specialty: teacher.specialty,
  studentCount: teacher.studentCount,
  weeklyClasses: teacher.weeklyClasses,
}))

const defaultStore: MemberStore = {
  members: initialMembers,
  currentUser: { kind: 'owner', memberId: 'owner' },
  adminInvites: [],
}

let store: MemberStore = defaultStore

function load() {
  if (initialized || typeof window === 'undefined') return
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<MemberStore>
      store = {
        members: Array.isArray(parsed.members) ? parsed.members : initialMembers,
        currentUser: parsed.currentUser || defaultStore.currentUser,
        adminInvites: Array.isArray(parsed.adminInvites) ? parsed.adminInvites : [],
      }
    }
  } catch {
    store = defaultStore
  }
  initialized = true
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Mock persistence is best-effort only.
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

function commit(next: MemberStore) {
  store = next
  persist()
  emit()
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return store
}

function getServerSnapshot() {
  return defaultStore
}

export function getMemberRole(member: InstitutionMember | undefined) {
  return member?.roles || []
}

export function hasPermission(state: MemberStore, permission: InstitutionPermission) {
  if (state.currentUser.kind === 'owner') return true
  const member = state.members.find((item) => item.id === state.currentUser.memberId)
  const isAdmin = member?.status === 'active' && member.roles.includes('admin')
  const isTeacher = member?.status === 'active' && member.roles.includes('teacher')

  switch (permission) {
    case 'manage_operations':
    case 'manage_teachers':
      return Boolean(isAdmin)
    case 'manage_administrators':
    case 'invite_administrators':
    case 'manage_money':
    case 'manage_verification':
      return false
    default:
      return Boolean(isTeacher)
  }
}

export function useInstitutionMembers() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function getCurrentMember(state = store) {
  return state.currentUser.kind === 'member'
    ? state.members.find((member) => member.id === state.currentUser.memberId)
    : undefined
}

export function setCurrentInstitutionUser(currentUser: CurrentInstitutionUser) {
  load()
  commit({ ...store, currentUser })
}

export function updateMember(memberId: string, patch: Partial<InstitutionMember>) {
  load()
  commit({
    ...store,
    members: store.members.map((member) => member.id === memberId ? { ...member, ...patch } : member),
  })
}

export function setAdministrator(memberId: string, enabled: boolean) {
  load()
  const member = store.members.find((item) => item.id === memberId)
  if (!member) return
  const roles: MemberRole[] = enabled
    ? Array.from(new Set<MemberRole>([...member.roles, 'admin']))
    : member.roles.filter((role) => role !== 'admin')
  updateMember(memberId, { roles })
}

export function createAdminInvite() {
  load()
  const now = Date.now()
  const invite: AdminInviteToken = {
    token: `${Math.random().toString(36).slice(2, 10)}${now.toString(36).slice(-4)}`,
    createdAt: now,
    expiresAt: now + 60_000,
    usedAt: null,
  }
  commit({ ...store, adminInvites: [...store.adminInvites.filter((item) => item.expiresAt > now && !item.usedAt), invite] })
  return invite
}

export function getAdminInvite(token: string) {
  load()
  return store.adminInvites.find((invite) => invite.token === token)
}

export function acceptAdminInvite(token: string) {
  load()
  const invite = getAdminInvite(token)
  if (!invite || invite.usedAt || invite.expiresAt <= Date.now()) return null

  const member: InstitutionMember = {
    id: `admin-${Date.now()}`,
    name: '新管理员',
    avatar: '/images/avatars/teacher-lixue-photo.jpg',
    phone: '138****0000',
    roles: ['admin'],
    status: 'active',
    joinDate: new Date().toISOString().slice(0, 10),
  }
  commit({
    members: [...store.members, member],
    currentUser: { kind: 'member', memberId: member.id },
    adminInvites: store.adminInvites.map((item) => item.token === token ? { ...item, usedAt: Date.now() } : item),
  })
  return member
}

export function acceptTeacherInvite(input: Pick<InstitutionMember, 'name' | 'title' | 'specialty'> & { phone: string; avatar?: string }) {
  load()
  const existing = store.members.find((member) => member.phone.endsWith(input.phone.slice(-4)))
  const member: InstitutionMember = existing
    ? {
        ...existing,
        roles: Array.from(new Set([...existing.roles, 'teacher'])),
        name: input.name,
        title: input.title,
        specialty: input.specialty,
      }
    : {
        id: `teacher-${Date.now()}`,
        name: input.name,
        avatar: input.avatar || '/images/avatars/teacher-wangming-photo.jpg',
        phone: input.phone ? `${input.phone.slice(0, 3)}****${input.phone.slice(-4)}` : '未绑定手机号',
        roles: ['teacher'],
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        title: input.title,
        specialty: input.specialty,
        studentCount: 0,
        weeklyClasses: 0,
      }
  commit({
    ...store,
    members: existing ? store.members.map((item) => item.id === member.id ? member : item) : [...store.members, member],
    currentUser: { kind: 'member', memberId: member.id },
  })
  return member
}
