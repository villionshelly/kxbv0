'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MessageSquare, Clock, CheckCircle, XCircle, Filter, Search, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaveStatus = 'leave' | 'attended' | 'cancelled'

interface LeaveRecord {
  id: string
  studentName: string
  studentAvatar: string
  courseName: string
  originalTime: string
  reason: string
  submitTime: string
  status: LeaveStatus
  finalResult?: string
}

const mockLeaveRecords: LeaveRecord[] = [
  {
    id: '1',
    studentName: '王小明',
    studentAvatar: '/images/avatars/child-xiaoming.jpg',
    courseName: '钢琴启蒙班',
    originalTime: '2024-05-20 14:00-15:00',
    reason: '感冒发烧',
    submitTime: '2024-05-19 10:30',
    status: 'leave',
    finalResult: '请假生效',
  },
  {
    id: '2',
    studentName: '李小红',
    studentAvatar: '/images/avatars/child-xiaohong.jpg',
    courseName: '钢琴进阶班',
    originalTime: '2024-05-18 16:00-17:00',
    reason: '临时外出',
    submitTime: '2024-05-17 18:00',
    status: 'attended',
    finalResult: '正常上课（请假失效）',
  },
  {
    id: '3',
    studentName: '张小华',
    studentAvatar: '/images/avatars/child-tiantian.jpg',
    courseName: '乐理基础',
    originalTime: '2024-05-15 10:00-11:00',
    reason: '家中有事',
    submitTime: '2024-05-14 09:00',
    status: 'cancelled',
    finalResult: '班次取消（请假失效）',
  },
  {
    id: '4',
    studentName: '刘小刚',
    studentAvatar: '/images/avatars/child-doudou.jpg',
    courseName: '钢琴启蒙班',
    originalTime: '2024-05-22 14:00-15:00',
    reason: '身体不适',
    submitTime: '2024-05-21 20:00',
    status: 'leave',
    finalResult: '请假生效',
  },
]

export default function LeaveManagementPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2024-05')

  const filters: { id: 'all' | LeaveStatus; label: string; color: string }[] = [
    { id: 'all', label: '全部', color: '' },
    { id: 'leave', label: '请假生效', color: 'text-amber-600' },
    { id: 'attended', label: '正常上课', color: 'text-green-600' },
    { id: 'cancelled', label: '班次取消', color: 'text-gray-500' },
  ]

  const filteredRecords = mockLeaveRecords.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter
    const matchesSearch = r.studentName.includes(searchQuery) || r.courseName.includes(searchQuery)
    return matchesFilter && matchesSearch
  })

  // Stats
  const stats = {
    total: mockLeaveRecords.length,
    leave: mockLeaveRecords.filter(r => r.status === 'leave').length,
    attended: mockLeaveRecords.filter(r => r.status === 'attended').length,
    cancelled: mockLeaveRecords.filter(r => r.status === 'cancelled').length,
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">请假记录</h1>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-muted/40 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">总请假</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{stats.leave}</p>
            <p className="text-xs text-amber-600/70">已生效</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-600">{stats.attended}</p>
            <p className="text-xs text-green-600/70">正常上课</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-500">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">班次取消</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          统计以最终实际生效结果为准
        </p>
      </div>

      {/* Search & Filter */}
      <div className="px-4 pb-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索学员或课程"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-muted/50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-muted/50 rounded-xl text-sm outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === f.id
                  ? 'institution-btn-primary'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map(record => (
              <div key={record.id} className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={record.studentAvatar}
                    alt={record.studentName}
                    className="w-10 h-10 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{record.studentName}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        record.status === 'leave' && 'bg-amber-100 text-amber-700',
                        record.status === 'attended' && 'bg-green-100 text-green-700',
                        record.status === 'cancelled' && 'bg-gray-200 text-gray-600'
                      )}>
                        {record.status === 'leave' && '请假生效'}
                        {record.status === 'attended' && '正常上课'}
                        {record.status === 'cancelled' && '班次取消'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{record.courseName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>原定时间：{record.originalTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MessageSquare className="w-4 h-4 mt-0.5" />
                    <span>请假原因：{record.reason}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>申请时间：{record.submitTime}</span>
                  </div>
                </div>

                {/* Final result */}
                <div className={cn(
                  'mt-3 pt-3 border-t border-border/50 flex items-center gap-2',
                  record.status === 'leave' ? 'text-amber-600' :
                  record.status === 'attended' ? 'text-green-600' : 'text-gray-500'
                )}>
                  {record.status === 'leave' && <CheckCircle className="w-4 h-4" />}
                  {record.status === 'attended' && <BookOpen className="w-4 h-4" />}
                  {record.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">{record.finalResult}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">暂无请假记录</p>
          </div>
        )}
      </div>

      {/* Info tip */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-600 text-center">
          已请假的学生若正常上课，系统将自动标记为"正常上课"；若班次被取消，系统将自动标记为"班次取消"
        </p>
      </div>
    </div>
  )
}
