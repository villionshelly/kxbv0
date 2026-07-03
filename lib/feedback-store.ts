'use client'

import { useSyncExternalStore } from 'react'

// 通用课程反馈存储（按记录 id 索引），用于教师端近期核销记录等场景
export interface FeedbackEntry {
  text: string
  images: string[]
  sentAt: string
}

type Store = Record<string, FeedbackEntry>

const STORAGE_KEY = 'kxb_feedback_v1'

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

const SERVER_SNAPSHOT: Store = {}
function getServerSnapshot(): Store {
  return SERVER_SNAPSHOT
}

export function saveRecordFeedback(recordId: string, text: string, images: string[] = []) {
  load()
  store = {
    ...store,
    [recordId]: {
      text,
      images,
      sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    },
  }
  persist()
  emit()
}

export function useFeedbackStore(): Store {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
