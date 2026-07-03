'use client'

import { useSyncExternalStore } from 'react'

// 课程核销 + 反馈状态（客户端原型存储，刷新后仍保留）
// status: 'pending' 未点名 | 'checked' 已核销(已点名,进入账单) | 'completed' 已完成(全部到课学员都已反馈)

export type LessonStatus = 'pending' | 'checked' | 'completed'

export interface FeedbackContent {
  text: string
  images: string[]
}

export interface LessonRecord {
  // 已核销学员（到课）id 列表
  attendedIds: string[]
  // 缺勤学员 id 列表
  absentId: string[]
  // 已发送反馈的学员 id -> 反馈内容（文字 + 图片）
  feedbacks: Record<string, FeedbackContent>
  // 是否已点名核销
  checked: boolean
}

type Store = Record<string, LessonRecord>

const STORAGE_KEY = 'kxb_attendance_v1'

let store: Store = {}
let initialized = false
const listeners = new Set<() => void>()

function load() {
  if (initialized || typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) store = JSON.parse(raw)
  } catch {
    store = {}
  }
  initialized = true
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // ignore
  }
}

function emit() {
  listeners.forEach(l => l())
}

function subscribe(cb: () => void) {
  load()
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot(): Store {
  load()
  return store
}

// 服务端渲染时返回稳定的空对象
const SERVER_SNAPSHOT: Store = {}
function getServerSnapshot(): Store {
  return SERVER_SNAPSHOT
}

// —— 操作方法 ——

export function saveCheckIn(lessonId: string, attendedIds: string[], absentId: string[]) {
  load()
  const prev = store[lessonId]
  store = {
    ...store,
    [lessonId]: {
      attendedIds,
      absentId,
      feedbacks: prev?.feedbacks ?? {},
      checked: true,
    },
  }
  persist()
  emit()
}

export function saveFeedback(lessonId: string, studentId: string, text: string, images: string[] = []) {
  load()
  const prev = store[lessonId]
  if (!prev) return
  store = {
    ...store,
    [lessonId]: {
      ...prev,
      feedbacks: { ...prev.feedbacks, [studentId]: { text, images } },
    },
  }
  persist()
  emit()
}

// 计算课程状态
export function getLessonStatus(record: LessonRecord | undefined): LessonStatus {
  if (!record || !record.checked) return 'pending'
  // 全部到课学员都已反馈 → 已完成
  const allFeedback = record.attendedIds.every(id => !!record.feedbacks[id]?.text)
  if (record.attendedIds.length > 0 && allFeedback) return 'completed'
  return 'checked'
}

// —— React hooks ——

export function useAttendanceStore(): Store {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useLessonRecord(lessonId: string): LessonRecord | undefined {
  const s = useAttendanceStore()
  return s[lessonId]
}
