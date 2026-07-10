'use client'

import { useEffect, useMemo, useState } from 'react'
import { classSessions, courses as mockCourses, institutionInfo, schedule as mockSchedule } from '@/lib/mock-data'

const storageKey = 'kxb-parent-courses-v1'

export type ParentCourseSource = 'self' | 'institution'

export type ParentCourseSessionRule = {
  id: string
  courseId: string
  classSessionId?: string
  className: string
  type: string
  teacher: string
  classroom: string
  locationName: string
  address: string
  latitude?: number
  longitude?: number
  dayOfWeek: number
  time: string
  duration: number
  source: ParentCourseSource
}

export type ParentCourse = {
  id: string
  childId: string
  name: string
  institution: string
  teacher: string
  color: string
  totalClasses: number
  remainingClasses: number
  price: number
  courseType: ParentCourseSource
  institutionId?: string
  institutionCourseId?: string
  classSessionId?: string
  notes?: string
  sessions: ParentCourseSessionRule[]
}

export type ParentScheduleItem = {
  id: string
  courseId: string
  courseName: string
  institution: string
  teacher: string
  classroom: string
  locationName: string
  address: string
  latitude?: number
  longitude?: number
  className: string
  classSessionId?: string
  startTime: string
  endTime: string
  date: string
  childId: string
  status: 'upcoming' | 'completed' | 'leave'
  color: string
  courseType: ParentCourseSource
}

export type NewParentCourseInput = Omit<ParentCourse, 'id' | 'sessions'> & {
  sessions: Omit<ParentCourseSessionRule, 'id' | 'courseId'>[]
}

type ParentCourseStore = {
  courses: ParentCourse[]
  schedule: ParentScheduleItem[]
}

const institutionAddresses: Record<string, string> = {
  '七彩培训中心': institutionInfo.address,
  '小画家美术工作室': '杭州市西湖区西溪路550号',
  '酷码编程': '杭州市拱墅区大关路88号',
  '跃动篮球训练营': '杭州市滨江区江南大道200号',
  '龙武跆拳道馆': '杭州市上城区解放路100号',
}

const institutionIds: Record<string, string> = {
  '七彩培训中心': '1',
  '小画家美术工作室': '2',
}

function getEndTime(startTime: string, duration: number) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

function getDateDayOfWeek(date: string) {
  return new Date(`${date}T00:00:00`).getDay()
}

function getSessionForOccurrence(courseName: string, item: typeof mockSchedule[number]) {
  return classSessions.find(session =>
    session.courseName === courseName &&
    session.sessions.some(slot => slot.dayOfWeek === getDateDayOfWeek(item.date) && slot.time === item.startTime)
  )
}

function buildDefaultStore(): ParentCourseStore {
  const defaultCourses: ParentCourse[] = mockCourses.map(course => {
    const courseSchedule = mockSchedule.filter(item => item.courseId === course.id)
    const firstOccurrence = courseSchedule[0]
    const sessionRules = courseSchedule.reduce<ParentCourseSessionRule[]>((rules, item) => {
      const session = getSessionForOccurrence(course.name, item)
      const ruleKey = `${getDateDayOfWeek(item.date)}-${item.startTime}-${item.endTime}-${session?.id ?? item.classroom}`
      if (rules.some(rule => `${rule.dayOfWeek}-${rule.time}-${getEndTime(rule.time, rule.duration)}-${rule.classSessionId ?? rule.classroom}` === ruleKey)) {
        return rules
      }

      const duration = Math.max(30, (Number(item.endTime.slice(0, 2)) * 60 + Number(item.endTime.slice(3)) - Number(item.startTime.slice(0, 2)) * 60 - Number(item.startTime.slice(3))))
      rules.push({
        id: `${course.id}-rule-${rules.length + 1}`,
        courseId: course.id,
        classSessionId: session?.id,
        className: session?.name ?? `${course.name}个人班次`,
        type: session?.type ?? (courseSchedule.some(current => current.courseType === 'self') ? '个人安排' : '机构课程'),
        teacher: item.teacher,
        classroom: item.classroom,
        locationName: item.classroom,
        address: courseSchedule.some(current => current.courseType === 'institution') ? institutionAddresses[course.institution] || '' : '',
        dayOfWeek: getDateDayOfWeek(item.date),
        time: item.startTime,
        duration,
        source: courseSchedule.some(current => current.courseType === 'self') ? 'self' : 'institution',
      })
      return rules
    }, [])

    const firstSession = firstOccurrence ? getSessionForOccurrence(course.name, firstOccurrence) : undefined
    return {
      ...course,
      courseType: courseSchedule.some(item => item.courseType === 'self') ? 'self' : 'institution',
      institutionId: institutionIds[course.institution],
      institutionCourseId: firstSession?.courseId,
      classSessionId: firstSession?.id,
      sessions: sessionRules,
    }
  })

  const defaultSchedule: ParentScheduleItem[] = mockSchedule.map(item => {
    const course = defaultCourses.find(current => current.id === item.courseId)
    const session = course ? getSessionForOccurrence(course.name, item) : undefined
    const address = item.courseType === 'institution' ? institutionAddresses[item.institution] || '' : ''
    return {
      ...item,
      locationName: item.classroom,
      address,
      className: session?.name ?? `${item.courseName}个人班次`,
      classSessionId: session?.id,
    }
  })

  return { courses: defaultCourses, schedule: defaultSchedule }
}

export const defaultParentCourseStore = buildDefaultStore()

function readStore() {
  if (typeof window === 'undefined') return defaultParentCourseStore

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultParentCourseStore
    const parsed = JSON.parse(raw) as ParentCourseStore
    if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.schedule)) return defaultParentCourseStore
    return parsed
  } catch {
    return defaultParentCourseStore
  }
}

function addWeeks(date: Date, weeks: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + weeks * 7)
  return next
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function generateScheduleItems(course: ParentCourse, rules: ParentCourseSessionRule[], startDate = new Date()): ParentScheduleItem[] {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const items: ParentScheduleItem[] = []

  rules.forEach(rule => {
    for (let week = 0; week < 26; week += 1) {
      const weekStart = addWeeks(start, week)
      const offset = (rule.dayOfWeek - weekStart.getDay() + 7) % 7
      const lessonDate = new Date(weekStart)
      lessonDate.setDate(weekStart.getDate() + offset)
      const date = formatDate(lessonDate)
      items.push({
        id: `${course.id}-${rule.id}-${date}`,
        courseId: course.id,
        courseName: course.name,
        institution: course.institution,
        teacher: rule.teacher || course.teacher,
        classroom: rule.classroom || rule.locationName || '待补充',
        locationName: rule.locationName || rule.classroom || '待补充',
        address: rule.address,
        latitude: rule.latitude,
        longitude: rule.longitude,
        className: rule.className,
        classSessionId: rule.classSessionId,
        startTime: rule.time,
        endTime: getEndTime(rule.time, rule.duration),
        date,
        childId: course.childId,
        status: 'upcoming',
        color: course.color,
        courseType: course.courseType,
      })
    }
  })

  return items
}

function normalizeCourse(input: NewParentCourseInput, id: string): ParentCourse {
  const sessions = input.sessions.map((session, index) => ({
    ...session,
    id: `${id}-rule-${index + 1}`,
    courseId: id,
  }))
  return { ...input, id, sessions }
}

export function useParentCourseStore() {
  const [store, setStore] = useState<ParentCourseStore>(defaultParentCourseStore)

  useEffect(() => {
    setStore(readStore())
  }, [])

  const commit = (next: ParentCourseStore) => {
    setStore(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('kxb-parent-courses-updated', { detail: next }))
  }

  const addCourse = (input: NewParentCourseInput) => {
    const id = `parent-course-${Date.now()}`
    const course = normalizeCourse(input, id)
    commit({
      courses: [course, ...store.courses],
      schedule: [...generateScheduleItems(course, course.sessions), ...store.schedule],
    })
    return course
  }

  const updateCourse = (id: string, input: NewParentCourseInput) => {
    const course = normalizeCourse(input, id)
    const today = formatDate(new Date())
    const previousSchedule = store.schedule.filter(item => item.courseId !== id || item.date < today)
    commit({
      courses: store.courses.map(current => current.id === id ? course : current),
      schedule: [...generateScheduleItems(course, course.sessions), ...previousSchedule],
    })
  }

  const updateCourseNotes = (id: string, notes: string) => {
    commit({
      ...store,
      courses: store.courses.map(course => course.id === id ? { ...course, notes } : course),
    })
  }

  const deleteCourse = (id: string) => {
    commit({
      courses: store.courses.filter(course => course.id !== id),
      schedule: store.schedule.filter(item => item.courseId !== id),
    })
  }

  useEffect(() => {
    const handleUpdate = () => setStore(readStore())
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('kxb-parent-courses-updated', handleUpdate)
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('kxb-parent-courses-updated', handleUpdate)
    }
  }, [])

  return { ...store, addCourse, updateCourse, updateCourseNotes, deleteCourse }
}

export function useParentCourse(courseId: string) {
  const store = useParentCourseStore()
  return useMemo(() => ({
    ...store,
    course: store.courses.find(course => course.id === courseId) || store.courses[0],
    courseSchedule: store.schedule.filter(item => item.courseId === courseId),
  }), [courseId, store])
}
