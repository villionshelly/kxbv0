'use client'

import { useRouter } from 'next/navigation'
import { Bell, ChevronRight, Users, BookOpen, Wallet, AlertTriangle, Sparkles, Clock, FileText, Camera, Video, MessageSquare, CheckCircle } from 'lucide-react'
import { institutionInfo, todayScheduleB, warningStudents, leaveRequests } from '@/lib/mock-data'
import { useAttendanceStore, getLessonStatus } from '@/lib/attendance-store'
import Image from 'next/image'

export default function InstitutionHomePage() {
  const router = useRouter()
  const attendanceStore = useAttendanceStore()
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="safe-area-top px-4 pb-4 bg-gradient-to-br from-secondary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-sm">
                <Image 
                  src="/logo.png" 
                  alt="课小宝" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{institutionInfo.name}</h1>
                <p className="text-xs text-secondary">AI增长版</p>
              </div>
            </div>
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-background rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">学员</span>
              </div>
              <p className="text-xl font-bold">{institutionInfo.studentCount}</p>
            </div>
            <div className="bg-background rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs">班级</span>
              </div>
              <p className="text-xl font-bold">{institutionInfo.classCount}</p>
            </div>
            <button 
              onClick={() => router.push('/institution/finance')}
              className="bg-background rounded-xl p-3 shadow-sm text-left hover:bg-muted/50 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-xs">本月收入</span>
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
              <p className="text-xl font-bold">¥{(institutionInfo.monthlyRevenue / 10000).toFixed(1)}w</p>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
        {/* AI Warning Card */}
        {warningStudents.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-destructive/10 to-warning/10 rounded-2xl border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="font-semibold text-destructive">续费预警</h3>
              <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                {warningStudents.length}人待跟进
              </span>
            </div>
            <div className="space-y-2">
              {warningStudents.slice(0, 2).map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-2 bg-background/80 rounded-lg">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-destructive">{student.reason}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    student.level === 'red' ? 'bg-destructive' : 'bg-yellow-500'
                  }`} />
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/institution/ai/warning')}
              className="w-full mt-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              查看全部预警
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Leave Requests */}
        {leaveRequests.filter(l => l.status === 'pending').length > 0 && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-700">请假申请</h3>
              <span className="ml-auto text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                {leaveRequests.filter(l => l.status === 'pending').length}条待处理
              </span>
            </div>
            <div className="space-y-2">
              {leaveRequests.filter(l => l.status === 'pending').slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-2 bg-background/80 rounded-lg">
                  <img
                    src={request.studentAvatar}
                    alt={request.studentName}
                    className="w-8 h-8 rounded-full bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{request.studentName}</p>
                    <p className="text-xs text-muted-foreground">{request.courseName} | {request.originalTime.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/institution/leave')}
              className="w-full mt-3 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-500/10 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              处理请假申请
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => router.push('/institution/photo-attendance')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl hover:from-secondary/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">拍照点名</p>
              <p className="text-xs text-muted-foreground">AI识���自动销课</p>
            </div>
          </button>
          <button 
            onClick={() => router.push('/institution/highlights')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl hover:from-primary/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">精彩瞬间</p>
              <p className="text-xs text-muted-foreground">AI生成发给家长</p>
            </div>
          </button>
        </div>

        {/* Today Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              今日课程
            </h2>
            <span className="text-sm text-muted-foreground">{todayScheduleB.length}节</span>
          </div>
          <div className="space-y-2">
            {todayScheduleB.map((item) => {
              const status = getLessonStatus(attendanceStore[item.id])
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-semibold text-secondary">{item.time.split('-')[0]}</p>
                    <p className="text-xs text-muted-foreground">{item.time.split('-')[1]}</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium truncate">{item.className}</p>
                      {status === 'completed' && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium shrink-0">已完成</span>
                      )}
                      {status === 'checked' && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-medium shrink-0">待反馈</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.student} | {item.classroom}
                    </p>
                  </div>
                  {status === 'pending' ? (
                    <button
                      onClick={() => router.push(`/institution/schedule/${item.id}`)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium shrink-0"
                    >
                      点名
                    </button>
                  ) : status === 'checked' ? (
                    <button
                      onClick={() => router.push(`/institution/schedule/${item.id}`)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shrink-0 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      课程反馈
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push(`/institution/schedule/${item.id}`)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium shrink-0 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      查看
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Tools */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI工具
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/institution/ai')}
              className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-left group hover:from-primary/20 hover:to-primary/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-sm">AI智能排课</h4>
              <p className="text-xs text-muted-foreground mt-0.5">一键生成最优排课</p>
            </button>
            <button 
              onClick={() => router.push('/institution/leads')}
              className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl text-left group hover:from-secondary/20 hover:to-secondary/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mb-2 group-hover:bg-secondary/30 transition-colors">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <h4 className="font-medium text-sm">线索广场</h4>
              <p className="text-xs text-muted-foreground mt-0.5">周边3km有8条新线索</p>
            </button>
            <button 
              onClick={() => router.push('/institution/referral')}
              className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl text-left group hover:from-green-500/20 hover:to-green-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-2 group-hover:bg-green-500/30 transition-colors">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">老带新活动</h4>
              <p className="text-xs text-muted-foreground mt-0.5">设置转介绍奖励</p>
            </button>
            <button 
              onClick={() => router.push('/institution/growth-report')}
              className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl text-left group hover:from-purple-500/20 hover:to-purple-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-2 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">AI成长报告</h4>
              <p className="text-xs text-muted-foreground mt-0.5">为学员生成月度报告</p>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
