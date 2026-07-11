'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, AlertCircle, TrendingDown, ArrowDownRight, Plus, ArrowLeft, Sparkles } from 'lucide-react'
import { children, classRecords } from '@/lib/mock-data'
import { useParentCourseStore } from '@/lib/parent-course-store'
import { useSelectedChild } from '@/hooks/use-selected-child'
import { cn } from '@/lib/utils'
import { DraggablePageActionFab } from '@/components/draggable-page-action-fab'

export default function ParentAssetsPage() {
  const router = useRouter()
  const { selectedChild, setSelectedChildId } = useSelectedChild()
  const { courses } = useParentCourseStore()
  const [showChildSelector, setShowChildSelector] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'records'>('overview')

  const childCourses = courses.filter((course) => course.childId === selectedChild.id)
  const childClassRecords = classRecords
    .filter((record) => record.childId === selectedChild.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
  const totalRemaining = childCourses.reduce((acc, c) => acc + c.remainingClasses, 0)
  const totalValue = childCourses.reduce((acc, c) => acc + c.remainingClasses * c.price, 0)
  const totalConsumed = childClassRecords.reduce((acc, r) => acc + (r.deduction || 0), 0)
  const lowClassesCourses = childCourses.filter(c => c.remainingClasses / c.totalClasses < 0.2)

  return (
    <div className="flex flex-col h-full warm-bg">
      {/* Header */}
      <header className="safe-area-top px-4 pb-2 warm-header">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/parent')}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-card/60"
              aria-label="返回首页"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => setShowChildSelector(!showChildSelector)}
              className="flex items-center gap-2 py-2"
            >
              <img
                src={selectedChild.avatar}
                alt={selectedChild.name}
                className="w-8 h-8 rounded-full bg-card ring-2 ring-primary/15"
              />
              <span className="font-bold text-foreground">{selectedChild.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Big stat */}
        <div className="text-center pt-2 pb-1">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            剩余总课时
          </p>
          <p className="text-5xl font-bold text-primary mt-1 tracking-tight">
            {totalRemaining}
            <span className="text-xl font-semibold text-primary/70 ml-1">课时</span>
          </p>
        </div>

        {/* Summary row */}
        <div className="flex items-center bg-card rounded-2xl card-warm mt-2 mb-1 overflow-hidden">
          <div className="flex-1 text-center py-3">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              累计消耗
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5">{totalConsumed} 课时</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center py-3">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              剩余价值
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5">¥{totalValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Child Selector Dropdown */}
        {showChildSelector && (
          <div className="absolute top-24 left-4 right-4 bg-card border border-border rounded-2xl shadow-lg z-40 p-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id)
                  setShowChildSelector(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                  selectedChild.id === child.id ? 'bg-primary/10' : 'hover:bg-muted'
                )}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-10 h-10 rounded-full bg-muted"
                />
                <div className="text-left">
                  <p className="font-medium text-foreground">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.grade}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex bg-card/70 rounded-2xl p-1 card-warm">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-xl transition-colors',
              activeTab === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            课时总览
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-xl transition-colors',
              activeTab === 'records'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            消课记录
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {activeTab === 'overview' ? (
          <div className="space-y-4">
            {/* Warning Alert */}
            {lowClassesCourses.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    {lowClassesCourses.length}门课程课时即将耗尽
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    建议尽快续费，避免影响正常上课
                  </p>
                </div>
              </div>
            )}

            {/* Course List */}
            <div className="space-y-3">
              {childCourses.map((course) => {
                const percentage = (course.remainingClasses / course.totalClasses) * 100
                const isLow = percentage < 20
                
                return (
                  <div
                    key={course.id}
                    className="p-4 bg-card rounded-2xl card-warm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-xs text-muted-foreground">{course.institution}</p>
                        </div>
                      </div>
                      {isLow && (
                        <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-3 h-3" />
                          即将耗尽
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">剩余/总课时</span>
                        <span className="font-semibold">
                          {course.remainingClasses}/{course.totalClasses}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: isLow ? '#ef4444' : course.color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        单价 ¥{course.price}/课时 | 剩余价值 ¥{(course.remainingClasses * course.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {childClassRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 p-3.5 bg-card rounded-2xl card-warm"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{record.courseName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {record.source === 'self' ? '自主记账' : '机构同步'} | {record.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">-{record.deduction}</p>
                  <p className="text-xs text-muted-foreground">课时</p>
                </div>
              </div>
            ))}

            {childClassRecords.length === 0 && (
              <div className="rounded-2xl bg-card py-8 text-center text-sm text-muted-foreground card-warm">
                暂无消课记录
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground py-4">
              仅显示近30天记录
            </p>
          </div>
        )}
      </div>
      <DraggablePageActionFab
        actionId="parent-assets-add-course"
        label="添加课程"
        icon={Plus}
        reservedBottom={96}
        onClick={() => router.push('/parent/add-course')}
      />
    </div>
  )
}
