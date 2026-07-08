'use client'

import { useEffect, useMemo, useState } from 'react'
import { students } from '@/lib/mock-data'

const storageKey = 'kxb-purchase-records-v1'

export type PurchaseRecordStatus = 'active' | 'completed' | 'refunded'

export type PurchaseRecord = {
  id: string
  studentId: string
  date: string
  courseName: string
  packageName: string
  amount: number
  totalClasses: number
  usedClasses: number
  remainingClasses: number
  unitPrice: number
  validFrom: string
  validTo: string
  validPeriod: string
  status: PurchaseRecordStatus
  note: string
  source: 'manual' | 'system'
}

type RecordsByStudent = Record<string, PurchaseRecord[]>

function createRecord(input: Omit<PurchaseRecord, 'unitPrice'>): PurchaseRecord {
  return {
    ...input,
    unitPrice: input.totalClasses > 0 ? Math.round(input.amount / input.totalClasses) : 0,
  }
}

export const defaultPurchaseRecordsByStudent: RecordsByStudent = {
  '4': [
    createRecord({
      id: 'pr4-1',
      studentId: '4',
      date: '2026-07-04',
      courseName: '钢琴启蒙',
      packageName: '钢琴启蒙课包',
      amount: 3600,
      totalClasses: 24,
      usedClasses: 6,
      remainingClasses: 18,
      validFrom: '2026-07-04',
      validTo: '2027-07-03',
      validPeriod: '2026-07-04 至 2027-07-03',
      status: 'active',
      note: '新学员首购课包，已同步家长绑定邀请。',
      source: 'system',
    }),
  ],
  '1': [
    createRecord({
      id: 'pr1',
      studentId: '1',
      date: '2025-01-15',
      courseName: '钢琴启蒙',
      packageName: '钢琴启蒙课包',
      amount: 3000,
      totalClasses: 34,
      usedClasses: 34,
      remainingClasses: 0,
      validFrom: '2025-01-15',
      validTo: '2025-09-30',
      validPeriod: '2025-01-15 至 2025-09-30',
      status: 'completed',
      note: '首次购买，9月消费完成',
      source: 'manual',
    }),
    createRecord({
      id: 'pr2',
      studentId: '1',
      date: '2025-10-08',
      courseName: '钢琴启蒙',
      packageName: '钢琴启蒙续费',
      amount: 1000,
      totalClasses: 12,
      usedClasses: 0,
      remainingClasses: 12,
      validFrom: '2025-10-08',
      validTo: '2026-04-07',
      validPeriod: '2025-10-08 至 2026-04-07',
      status: 'active',
      note: '迁移系统后续费，课时在系统消课',
      source: 'manual',
    }),
    createRecord({
      id: 'pr3',
      studentId: '1',
      date: '2026-03-20',
      courseName: '钢琴进阶',
      packageName: '钢琴进阶课包',
      amount: 4800,
      totalClasses: 48,
      usedClasses: 6,
      remainingClasses: 42,
      validFrom: '2026-03-20',
      validTo: '2027-03-19',
      validPeriod: '2026-03-20 至 2027-03-19',
      status: 'active',
      note: '系统续费邀请成功',
      source: 'system',
    }),
  ],
  '2': [
    createRecord({
      id: 'pr2-1',
      studentId: '2',
      date: '2026-07-04',
      courseName: '少儿编程',
      packageName: '少儿编程续费包',
      amount: 5280,
      totalClasses: 24,
      usedClasses: 0,
      remainingClasses: 24,
      validFrom: '2026-07-10',
      validTo: '2027-01-10',
      validPeriod: '2026-07-10 至 2027-01-10',
      status: 'active',
      note: '续费待家长确认。',
      source: 'system',
    }),
  ],
}

function fallbackRecordsForStudent(studentId: string): PurchaseRecord[] {
  const student = students.find(item => item.id === studentId)
  if (!student) return []

  return student.courses.map((courseName, index) => createRecord({
    id: `fallback-${studentId}-${index}`,
    studentId,
    date: student.joinDate || '2026-07-01',
    courseName,
    packageName: `${courseName}课包`,
    amount: Math.max(student.totalClasses, 1) * 120,
    totalClasses: student.totalClasses,
    usedClasses: Math.max(student.totalClasses - student.remainingClasses, 0),
    remainingClasses: student.remainingClasses,
    validFrom: student.joinDate || '2026-07-01',
    validTo: '2027-06-30',
    validPeriod: `${student.joinDate || '2026-07-01'} 至 2027-06-30`,
    status: student.remainingClasses > 0 ? 'active' : 'completed',
    note: '系统根据学员课时生成的默认购买记录。',
    source: 'system',
  }))
}

function sortRecords(records: PurchaseRecord[]) {
  return [...records].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'active') return -1
      if (b.status === 'active') return 1
    }
    return b.date.localeCompare(a.date)
  })
}

function readRecordsByStudent() {
  if (typeof window === 'undefined') return defaultPurchaseRecordsByStudent

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultPurchaseRecordsByStudent
    const parsed = JSON.parse(raw) as RecordsByStudent
    return Object.fromEntries(
      Object.entries(parsed).map(([studentId, records]) => [
        studentId,
        records.map(record => {
          const [periodStart, periodEnd] = (record.validPeriod || '').split(' 至 ')
          const validFrom = record.validFrom || periodStart || record.date
          const validTo = record.validTo || periodEnd || '2027-06-30'

          return {
            ...record,
            studentId: record.studentId || studentId,
            courseName: record.courseName || record.packageName.replace(/(课包|续费|课程)$/g, ''),
            validFrom,
            validTo,
            validPeriod: record.validPeriod || `${validFrom} 至 ${validTo}`,
          }
        }),
      ])
    ) as RecordsByStudent
  } catch {
    return defaultPurchaseRecordsByStudent
  }
}

export function useStudentPurchaseRecords(studentId: string) {
  const [recordsByStudent, setRecordsByStudent] = useState<RecordsByStudent>(defaultPurchaseRecordsByStudent)

  useEffect(() => {
    setRecordsByStudent(readRecordsByStudent())
  }, [])

  const records = useMemo(() => {
    const storedRecords = recordsByStudent[studentId]
    return sortRecords(storedRecords && storedRecords.length > 0 ? storedRecords : fallbackRecordsForStudent(studentId))
  }, [recordsByStudent, studentId])

  const commit = (next: RecordsByStudent) => {
    setRecordsByStudent(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('kxb-purchase-records-updated', { detail: next }))
  }

  const setPurchaseRecords = (update: PurchaseRecord[] | ((current: PurchaseRecord[]) => PurchaseRecord[])) => {
    const current = recordsByStudent[studentId] || fallbackRecordsForStudent(studentId)
    const nextRecords = typeof update === 'function' ? update(current) : update
    commit({ ...recordsByStudent, [studentId]: sortRecords(nextRecords) })
  }

  useEffect(() => {
    const handleStorage = () => setRecordsByStudent(readRecordsByStudent())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('kxb-purchase-records-updated', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('kxb-purchase-records-updated', handleStorage)
    }
  }, [])

  return { records, setPurchaseRecords }
}
