import { childGrowthProfiles, children, classRecords, courses, growthReports, medals, schedule } from '@/lib/mock-data'

export type CourseItem = (typeof courses)[number]
export type ScheduleItem = (typeof schedule)[number]
export type ClassRecordItem = (typeof classRecords)[number]
export type ChildItem = (typeof children)[number]
export type GrowthReportItem = (typeof growthReports)[number]
export type MedalItem = (typeof medals.duoduo)[number] | (typeof medals.xiaobao)[number]
export type LessonDisplayStatus = 'upcoming' | 'completed' | 'leave'

export const allChildrenValue = 'all'

export const lessonStatusLabels: Record<LessonDisplayStatus, string> = {
  upcoming: '待上课',
  completed: '消课完成',
  leave: '已请假',
}

export function getChildById(childId: string) {
  return children.find((child) => child.id === childId) || children[0]
}

export function getChildCourses(childId: string) {
  return courses.filter((course) => course.childId === childId)
}

export function getChildClassRecords(childId: string) {
  return classRecords.filter((record) => record.childId === childId)
}

export function getChildSchedule(childId: string) {
  return schedule.filter((item) => item.childId === childId)
}

export function getMedalKey(childId: string) {
  return childId === '1' ? 'duoduo' : 'xiaobao'
}

export function getChildMedals(childId: string) {
  return medals[getMedalKey(childId)] || []
}

export function getChildGrowthProfile(childId: string) {
  return childGrowthProfiles[childId as keyof typeof childGrowthProfiles] || childGrowthProfiles['1']
}

export function getChildGrowthReports(childId: string) {
  return growthReports
    .filter((report) => report.childId === childId && report.status === 'generated')
    .sort((a, b) => String(b.generatedAt || '').localeCompare(String(a.generatedAt || '')))
}

export function getGrowthReportById(reportId: string) {
  return growthReports.find((report) => report.id === reportId) || growthReports[0]
}

export function getLessonDisplayStatus(item: ScheduleItem): LessonDisplayStatus {
  const hasLeaveRecord = classRecords.some(
    (record) =>
      record.childId === item.childId &&
      record.courseId === item.courseId &&
      record.date === item.date &&
      record.status === 'leave',
  )

  if (item.status === 'leave' || hasLeaveRecord) {
    return 'leave'
  }

  const lessonEndAt = new Date(`${item.date}T${item.endTime}:00`)
  const isExpired = lessonEndAt.getTime() < Date.now()

  return isExpired || item.status === 'completed' ? 'completed' : 'upcoming'
}

export function getLessonStatusClassName(status: LessonDisplayStatus) {
  if (status === 'leave') {
    return 'border-amber-100 bg-amber-50 text-amber-600'
  }

  if (status === 'completed') {
    return 'border-emerald-100 bg-emerald-50 text-emerald-600'
  }

  return 'border-border/70 bg-card/70 text-muted-foreground'
}
