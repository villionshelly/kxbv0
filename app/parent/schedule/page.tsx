'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Search,
} from 'lucide-react'
import { children } from '@/lib/mock-data'
import {
  allChildrenValue,
  getChildById,
  getLessonDisplayStatus,
  getLessonStatusClassName,
  lessonStatusLabels,
  type ScheduleItem,
} from '@/lib/parent-data'
import { useSelectedChild } from '@/hooks/use-selected-child'
import { cn } from '@/lib/utils'
import { useParentCourseStore } from '@/lib/parent-course-store'

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const fullWeekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function startOfWeek(date: Date) {
  const result = new Date(date)
  const day = result.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + mondayOffset)
  return result
}

function getWeekDates(date: Date) {
  const start = startOfWeek(date)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function getMonthDates(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = startOfWeek(firstDayOfMonth)

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function isSameDay(a: Date, b: Date) {
  return formatDate(a) === formatDate(b)
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function getMonthTitle(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function getWeekTitle(date: Date) {
  const weekDates = getWeekDates(date)
  const start = weekDates[0]
  const end = weekDates[6]
  return `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`
}

function getLessonDateLabel(date: string) {
  const parsed = parseDate(date)
  return `${parsed.getMonth() + 1}/${parsed.getDate()} ${fullWeekDays[parsed.getDay()]}`
}

export default function ParentSchedulePage() {
  const router = useRouter()
  const { selectedChild, setSelectedChildId } = useSelectedChild()
  const { schedule } = useParentCourseStore()
  const today = useMemo(() => new Date(), [])
  const todayDate = formatDate(today)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [cursorDate, setCursorDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [childFilter, setChildFilter] = useState(selectedChild.id)
  const [query, setQuery] = useState('')
  const [leaveOnly, setLeaveOnly] = useState(false)

  useEffect(() => {
    if (childFilter !== allChildrenValue) {
      setChildFilter(selectedChild.id)
    }
  }, [childFilter, selectedChild.id])

  const visibleDates = viewMode === 'month' ? getMonthDates(cursorDate) : getWeekDates(cursorDate)
  const visibleDateSet = new Set(visibleDates.map(formatDate))
  const normalizedQuery = query.trim().toLowerCase()

  const filteredSchedule = schedule
    .filter((item) => childFilter === allChildrenValue || item.childId === childFilter)
    .filter((item) => {
      if (!normalizedQuery) return true
      return [item.courseName, item.institution, item.teacher, item.classroom, item.className, item.locationName, item.address]
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    })
    .filter((item) => !leaveOnly || getLessonDisplayStatus(item) === 'leave')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const selectedDayLessons = filteredSchedule.filter((item) => item.date === selectedDate)
  const visibleRangeLessons = filteredSchedule.filter((item) => {
    if (viewMode === 'week') {
      return visibleDateSet.has(item.date)
    }

    return isSameMonth(parseDate(item.date), cursorDate)
  })
  const displayedLessons = viewMode === 'week' ? visibleRangeLessons : selectedDayLessons

  const shiftMonth = (offset: number) => {
    const next = new Date(cursorDate)
    next.setMonth(next.getMonth() + offset)
    setCursorDate(next)
    setSelectedDate(formatDate(next))
  }

  const shiftWeek = (offset: number) => {
    const next = new Date(cursorDate)
    next.setDate(next.getDate() + offset * 7)
    setCursorDate(next)
    setSelectedDate(formatDate(next))
  }

  const handleChildFilterChange = (childId: string) => {
    setChildFilter(childId)
    if (childId !== allChildrenValue) {
      setSelectedChildId(childId)
    }
  }

  const handleDateSelect = (date: Date) => {
    setCursorDate(date)
    setSelectedDate(formatDate(date))
  }

  const renderCourseCard = (item: ScheduleItem) => {
    const status = getLessonDisplayStatus(item)
    const child = getChildById(item.childId)

    return (
      <div key={item.id} className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-amber-50">
        <div className="p-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.push(`/parent/course/${item.courseId}`)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="truncate text-sm font-bold text-foreground">{item.courseName}</p>
                <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium', getLessonStatusClassName(status))}>
                  {lessonStatusLabels[status]}
                </span>
              </div>
              <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                {viewMode === 'week' && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{getLessonDateLabel(item.date)}</span>
                )}
                <img src={child.avatar} alt={child.name} className="h-5 w-5 rounded-full object-cover" />
                <span className="text-xs font-medium text-muted-foreground">{child.name}</span>
                <span className="text-xs font-semibold text-primary">{item.startTime}-{item.endTime}</span>
                <span className="truncate text-xs text-muted-foreground">{item.teacher}</span>
              </div>
            </button>
            {status === 'upcoming' && (
              <button
                type="button"
                onClick={() => router.push(`/parent/leave/${item.id}`)}
                className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/10 bg-card/80 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm"
              >
                <FileText className="h-3 w-3" />
                请假
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push(`/parent/course/${item.courseId}`)}
            className="mt-1.5 flex w-full items-center gap-3 text-left text-[11px] text-muted-foreground"
          >
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.locationName || item.classroom}</span>
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.className}</span>
              </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col warm-bg">
      <main className="flex-1 overflow-auto px-4 pb-24 pt-2">
        <div className="space-y-2.5">
          <div className="px-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => handleChildFilterChange(allChildrenValue)}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium shadow-sm',
                  childFilter === allChildrenValue ? 'bg-primary text-primary-foreground' : 'bg-card/72 text-muted-foreground',
                )}
              >
                全部孩子
              </button>
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildFilterChange(child.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium shadow-sm',
                    childFilter === child.id ? 'bg-primary text-primary-foreground' : 'bg-card/72 text-muted-foreground',
                  )}
                >
                  <img src={child.avatar} alt={child.name} className="h-5 w-5 rounded-full object-cover" />
                  {child.name}
                </button>
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-card/72 px-3 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索课程、机构、老师"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button
                type="button"
                onClick={() => setLeaveOnly((value) => !value)}
                className={cn(
                  'h-9 shrink-0 rounded-2xl px-3 text-xs font-medium shadow-sm',
                  leaveOnly ? 'bg-amber-500 text-white' : 'bg-card/72 text-muted-foreground',
                )}
              >
                已请假
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-card p-2.5 card-warm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex rounded-2xl bg-muted/50 p-0.5">
                {(['month', 'week'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'h-7 rounded-xl px-2.5 text-xs font-medium transition-colors',
                      viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                    )}
                  >
                    {mode === 'month' ? '月视图' : '周视图'}
                  </button>
                ))}
              </div>

              <div className="inline-flex h-7 items-center gap-1 rounded-xl bg-muted/45 px-2.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {viewMode === 'month' ? '本月' : '本周'} {visibleRangeLessons.length} 节课
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => viewMode === 'month' ? shiftMonth(-1) : shiftWeek(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
                aria-label={viewMode === 'month' ? '上月' : '上周'}
              >
                <ChevronLeft className="h-[18px] w-[18px]" />
              </button>
              <p className="text-sm font-bold text-foreground">
                {viewMode === 'month' ? getMonthTitle(cursorDate) : getWeekTitle(cursorDate)}
              </p>
              <button
                type="button"
                onClick={() => viewMode === 'month' ? shiftMonth(1) : shiftWeek(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground"
                aria-label={viewMode === 'month' ? '下月' : '下周'}
              >
                <ChevronRight className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 pb-1.5">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-[10px] font-medium text-muted-foreground">
                  {day.replace('周', '')}
                </div>
              ))}
            </div>
            <div className={cn('grid grid-cols-7 gap-1', viewMode === 'week' && 'pb-0.5')}>
              {visibleDates.map((date) => {
                const fullDate = formatDate(date)
                const lessons = filteredSchedule.filter((item) => item.date === fullDate)
                const isSelected = selectedDate === fullDate
                const isToday = isSameDay(date, today)
                const isDimmed = viewMode === 'month' && !isSameMonth(date, cursorDate)

                return (
                  <button
                    key={fullDate}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={cn(
                      'flex min-h-[46px] flex-col items-center justify-center rounded-xl px-0.5 py-1 transition-colors',
                      isToday
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isSelected
                          ? 'bg-sky-100 text-sky-700 ring-1 ring-sky-300'
                          : 'bg-muted/40 text-foreground',
                      isDimmed && !isSelected && !isToday && 'opacity-45',
                    )}
                    aria-label={`${fullDate}${lessons.length > 0 ? `，${lessons.length}节课` : '，无课'}`}
                  >
                    <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                    <div className="mt-1.5 flex h-2 max-w-full items-center justify-center gap-0.5">
                      {lessons.slice(0, 3).map((lesson) => (
                        <span
                          key={lesson.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isToday && 'bg-white',
                            isSelected && !isToday && 'bg-sky-500',
                          )}
                          style={isSelected || isToday ? undefined : { backgroundColor: lesson.color }}
                        />
                      ))}
                      {lessons.length > 3 && (
                        <span className={cn('text-[9px] leading-none', isToday ? 'text-white/85' : isSelected ? 'text-sky-600' : 'text-muted-foreground')}>
                          +{lessons.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            {displayedLessons.length > 0 ? (
              displayedLessons.map(renderCourseCard)
            ) : (
              <div className="rounded-3xl bg-card py-7 text-center card-warm">
                <CalendarDays className="mx-auto h-7 w-7 text-primary/55" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewMode === 'week' ? '本周没有符合条件的课程' : '这天没有符合条件的课程'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
