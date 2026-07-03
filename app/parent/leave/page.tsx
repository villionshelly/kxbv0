'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, HourglassIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// 模拟家长端的请假记录
const myLeaveRequests = [
  {
    id: '1',
    courseName: '钢琴启蒙',
    institution: '七彩音乐艺术中心',
    originalTime: '2026-03-28 10:00-11:00',
    reason: '孩子感冒发烧，需要在家休息',
    submitTime: '2026-03-27 20:30',
    status: 'pending',
  },
  {
    id: '2',
    courseName: '创意美术',
    institution: '小画家美术工作室',
    originalTime: '2026-03-25 14:00-15:30',
    reason: '学校有活动需要参加',
    submitTime: '2026-03-24 19:00',
    status: 'approved',
    makeupTime: '2026-03-31 14:00-15:30',
  },
  {
    id: '3',
    courseName: '跆拳道',
    institution: '龙武跆拳道馆',
    originalTime: '2026-03-20 16:00-17:30',
    reason: '家里有事外出',
    submitTime: '2026-03-19 21:00',
    status: 'approved',
    makeupTime: '已补完',
  },
]

export default function LeaveHistoryPage() {
  const router = useRouter()

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: HourglassIcon, label: '待审批', color: 'text-yellow-600', bg: 'bg-yellow-100' }
      case 'approved':
        return { icon: CheckCircle, label: '已同意', color: 'text-green-600', bg: 'bg-green-100' }
      case 'rejected':
        return { icon: XCircle, label: '已拒绝', color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { icon: HourglassIcon, label: '未知', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
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

      {/* List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          {myLeaveRequests.map((request) => {
            const statusConfig = getStatusConfig(request.status)
            const StatusIcon = statusConfig.icon
            return (
              <div key={request.id} className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{request.courseName}</h3>
                    <p className="text-sm text-muted-foreground">{request.institution}</p>
                  </div>
                  <span className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                    statusConfig.bg, statusConfig.color
                  )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>原定时间：{request.originalTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 mt-0.5" />
                    <span>请假原因：{request.reason}</span>
                  </div>
                  {request.status === 'approved' && request.makeupTime && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>补课时间：{request.makeupTime}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  申请时间：{request.submitTime}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
