'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, MapPin, Clock, Calendar, FileText, CalendarDays, Wallet, MessageSquare, ChevronRight, ChevronDown, GraduationCap } from 'lucide-react'
import { children, parentProfile, growthFeed } from '@/lib/mock-data'
import { getLessonDisplayStatus, getLessonStatusClassName, lessonStatusLabels } from '@/lib/parent-data'
import { useSelectedChild } from '@/hooks/use-selected-child'
import { cn } from '@/lib/utils'
import { useParentCourseStore, type ParentScheduleItem } from '@/lib/parent-course-store'

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

type ScheduleItem = ParentScheduleItem

function getWeekDates() {
  const today = new Date()
  const currentDay = today.getDay()
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + mondayOffset + i)
    dates.push({
      day: weekDays[i],
      date: date.getDate(),
      fullDate: date.toISOString().split('T')[0],
      isToday: date.toDateString() === today.toDateString(),
    })
  }
  return dates
}

export default function ParentHomePage() {
  const router = useRouter()
  const { selectedChild, switchChild } = useSelectedChild()
  const { schedule } = useParentCourseStore()
  const weekDates = getWeekDates()
  const todayDate = weekDates.find(d => d.isToday)?.fullDate || weekDates[0].fullDate

  const weekSchedule = schedule.filter(s => s.childId === selectedChild.id && weekDates.some(d => d.fullDate === s.date))
  const [selectedWeekDate, setSelectedWeekDate] = useState(todayDate)

  const quickActions = [
    { icon: CalendarDays, label: '课表', color: 'text-primary', bg: 'bg-primary/10', onClick: () => router.push('/parent/schedule') },
    { icon: Wallet, label: '课时', color: 'text-amber-500', bg: 'bg-amber-100', onClick: () => router.push('/parent/assets') },
    { icon: MessageSquare, label: '消息', color: 'text-sky-500', bg: 'bg-sky-100', onClick: () => router.push('/parent/messages') },
    { icon: GraduationCap, label: '成长档案', color: 'text-emerald-500', bg: 'bg-emerald-100', onClick: () => router.push('/parent/growth') },
  ]

  const weekScheduleByDate = weekDates.map((day) => ({
    ...day,
    lessons: weekSchedule.filter((item) => item.date === day.fullDate),
  }))
  const selectedWeekDay = weekScheduleByDate.find((day) => day.fullDate === selectedWeekDate) || weekScheduleByDate[0]
  const selectedDaySchedule = selectedWeekDay.lessons
  const childGrowthFeed = growthFeed.filter((feed) => feed.childId === selectedChild.id)

  return (
    <div className="flex flex-col h-full warm-bg relative">
      {/* Header */}
      <header className="safe-area-top px-4 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={switchChild}
              className="relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`切换当前学员，当前为${selectedChild.name}`}
            >
              <img
                src={selectedChild.avatar || "/placeholder.svg"}
                alt={selectedChild.name}
                className="w-12 h-12 rounded-2xl bg-card object-cover ring-2 ring-primary/15 shadow-sm"
              />
              {children.length > 1 && (
                <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <ChevronDown className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">
                Hi，{selectedChild.name}{parentProfile.nickname}
              </h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/parent/profile')}
            className="w-10 h-10 rounded-full bg-card/70 backdrop-blur flex items-center justify-center shadow-sm"
            aria-label="设置与个人中心"
          >
            <Settings className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-28">
        {/* Schedule Card */}
        <div className="bg-card rounded-3xl p-3 mb-3 card-warm">
          <div className="grid grid-cols-7 gap-1.5">
            {weekScheduleByDate.map((day) => (
              <button
                key={day.fullDate}
                type="button"
                onClick={() => setSelectedWeekDate(day.fullDate)}
                className={cn(
                  'flex min-h-[66px] flex-col items-center justify-center rounded-2xl px-1 py-1.5 transition-colors',
                  selectedWeekDate === day.fullDate
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/45 text-foreground'
                )}
                aria-label={`${day.day}${day.date}日${day.lessons.length > 0 ? `，${day.lessons.length}节课` : '，无课'}`}
              >
                <span className={cn(
                  'text-xs font-medium leading-none',
                  selectedWeekDate === day.fullDate ? 'text-primary-foreground/90' : 'text-muted-foreground'
                )}>
                  {day.day}
                </span>
                <span className="mt-1 text-lg font-bold leading-none">{day.date}</span>
                <span
                  className={cn(
                    'mt-2 h-1.5 w-1.5 rounded-full',
                    day.lessons.length > 0
                      ? selectedWeekDate === day.fullDate ? 'bg-primary-foreground' : 'bg-primary'
                      : 'invisible'
                  )}
                />
              </button>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-border" />

          {selectedDaySchedule.length > 0 ? (
            <div className="space-y-2.5">
              {selectedDaySchedule.map((item: ScheduleItem) => {
                const lessonStatus = getLessonDisplayStatus(item)
                const isUpcoming = lessonStatus === 'upcoming'

                return (
                <div key={item.id} className="bg-gradient-to-br from-primary/5 to-amber-50 rounded-2xl overflow-hidden border border-primary/10">
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/parent/course/${item.courseId}`)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-base font-bold text-foreground">
                            {item.courseName}
                          </p>
                          <span className={cn(
                            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                            getLessonStatusClassName(lessonStatus)
                          )}>
                            {lessonStatusLabels[lessonStatus]}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-medium text-primary">
                          {item.startTime}-{item.endTime}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">授课老师：{item.teacher}</p>
                      </button>
                      {isUpcoming && (
                        <button
                          type="button"
                          onClick={() => router.push(`/parent/leave/${item.id}`)}
                          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/10 bg-card/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          请假
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/parent/course/${item.courseId}`)}
                      className="mt-2.5 flex w-full items-center gap-4 text-left text-xs text-muted-foreground"
                    >
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.locationName || item.classroom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.className}
                      </span>
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-muted/40 rounded-2xl py-6 text-center">
              <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-card flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground">这天没有课程安排</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-3xl p-4 mb-4 card-warm">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 py-1"
              >
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', action.bg)}>
                  <action.icon className={cn('w-6 h-6', action.color)} />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Growth Feed */}
        <div className="bg-card rounded-3xl p-4 card-warm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-primary" />
              <h2 className="text-base font-bold text-foreground">成长动态</h2>
            </div>
            <button
              onClick={() => router.push('/parent/growth')}
              className="text-xs text-muted-foreground flex items-center gap-0.5"
            >
              查看全部
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {childGrowthFeed.map((feed, idx) => (
              <div
                key={feed.id}
                onClick={() => router.push('/parent/growth')}
                className={cn('cursor-pointer', idx > 0 && 'pt-4 border-t border-border/60')}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={feed.teacherAvatar || "/placeholder.svg"}
                    alt={feed.teacher}
                    className="w-9 h-9 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{feed.teacher}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">{feed.course}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{feed.date}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed mt-2.5">{feed.content}</p>
                {feed.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {feed.images.map((url, i) => (
                      <img
                        key={i}
                        src={url || "/placeholder.svg"}
                        alt={`${feed.childName}的课堂照片 ${i + 1}`}
                        className="w-full aspect-square rounded-xl object-cover bg-muted"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
