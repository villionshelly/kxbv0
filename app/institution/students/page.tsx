'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Phone, AlertCircle, Link2, Send } from 'lucide-react'
import { institutionInfo, students } from '@/lib/mock-data'
import { InstitutionParentBindingInviteModal } from '@/components/institution-parent-binding-invite-modal'
import { cn } from '@/lib/utils'

type Student = typeof students[number]

export default function InstitutionStudentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'warning' | 'expired' | 'unbound'>('all')
  const [inviteStudent, setInviteStudent] = useState<Student | null>(null)

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.includes(searchQuery) || 
                         student.parentName.includes(searchQuery)
    if (activeFilter === 'all') return matchesSearch
    if (activeFilter === 'unbound') return matchesSearch && student.isBound === false
    return matchesSearch && student.status === activeFilter
  })

  const statusCounts = {
    all: students.length,
    normal: students.filter(s => s.status === 'normal').length,
    warning: students.filter(s => s.status === 'warning').length,
    expired: students.filter(s => s.status === 'expired').length,
    unbound: students.filter(s => s.isBound === false).length,
  }

  return (
    <div className="flex h-full flex-col institution-dream-bg">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">学员管理</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{students.length} 位学员 · {statusCounts.warning + statusCounts.expired} 位需跟进</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 flex items-center gap-2 rounded-3xl bg-card p-2 card-dream">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索学员或家长姓名"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-muted/45 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => router.push('/institution/students/add')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl institution-btn-primary"
            aria-label="新增学员"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
          {[
            { key: 'all', label: '全部' },
            { key: 'normal', label: '正常' },
            { key: 'warning', label: '待续费' },
            { key: 'expired', label: '已过期' },
            { key: 'unbound', label: '未绑定' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shadow-sm',
                activeFilter === filter.key
                  ? 'institution-btn-primary'
                  : 'bg-card/80 text-muted-foreground'
              )}
            >
              {filter.label}
              <span className="ml-1 text-xs opacity-70">
                {statusCounts[filter.key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="scrollbar-quiet flex-1 overflow-auto px-4 pb-32 pt-1">
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={cn(
                'relative rounded-3xl p-4 card-dream',
                student.remainingClasses <= 5
                  ? student.status === 'expired'
                    ? 'bg-rose-50/90 ring-1 ring-rose-100'
                    : 'bg-amber-50/90 ring-1 ring-amber-100'
                  : 'bg-card'
              )}
            >
              {student.remainingClasses <= 5 && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-destructive shadow-sm ring-1 ring-rose-100">
                  <AlertCircle className="h-3.5 w-3.5" />
                  需跟进续费
                </div>
              )}
              <div className="flex items-start gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-12 h-12 rounded-2xl bg-muted object-cover ring-2 ring-primary/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap pr-24">
                    <h4 className="font-medium">{student.name}</h4>
                    {/* 绑定状态 */}
                    {student.isBound !== false ? (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-0.5">
                        <Link2 className="w-3 h-3" />
                        已绑定
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        未绑定
                      </span>
                    )}
                    {student.status === 'warning' && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs rounded-full">
                        待续费
                      </span>
                    )}
                    {student.status === 'expired' && (
                      <span className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                        已过期
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {student.parentName}{student.parentPhone ? ` | ${student.parentPhone}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {student.courses.map((course, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">剩余课时</p>
                    <p className={cn(
                      'text-sm font-semibold',
                      student.remainingClasses <= 5 ? 'text-destructive' : 'text-foreground'
                    )}>
                      {student.remainingClasses}/{student.totalClasses}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.407-.032zM13.12 12.653c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982zm4.844 0c.536 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.433-.982.97-.982z"/>
                    </svg>
                  </button>
                  {student.isBound === false && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setInviteStudent(student)
                      }}
                      className="px-2.5 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      发送绑定
                    </button>
                  )}
                  <button 
                      onClick={() => router.push(`/institution/students/${student.id}`)}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    详情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">没有找到符合条件的学员</p>
          </div>
        )}
      </div>

      {inviteStudent && (
        <InstitutionParentBindingInviteModal
          student={{ name: inviteStudent.name }}
          institutionName={institutionInfo.name}
          onClose={() => setInviteStudent(null)}
        />
      )}
    </div>
  )
}
