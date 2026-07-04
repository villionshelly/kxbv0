'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Gift, Users, Share2, CheckCircle, Clock, Sparkles } from 'lucide-react'
import { referralActivities, referralRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function ReferralPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'activities' | 'records'>('activities')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGeneratePoster = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      alert('海报已生成，可保存分享')
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => router.push('/institution')}
          className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">老带新活动</h1>
          <p className="text-xs text-muted-foreground">设置转介绍奖励，促进口碑裂变</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2 institution-btn-primary rounded-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Stats */}
      <div className="px-4 py-4 bg-gradient-to-r from-green-500/10 to-primary/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">31</p>
            <p className="text-xs text-muted-foreground">总推荐人数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">24</p>
            <p className="text-xs text-muted-foreground">成功转化</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">48</p>
            <p className="text-xs text-muted-foreground">奖励课时</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('activities')}
          className={cn(
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'activities'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-muted-foreground'
          )}
        >
          活动管理
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={cn(
            'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'records'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-muted-foreground'
          )}
        >
          推荐记录
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {activeTab === 'activities' ? (
          <div className="space-y-4">
            {referralActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-muted/30 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{activity.name}</h3>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        activity.status === 'active'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {activity.status === 'active' ? '进行中' : '已结束'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.startDate} ~ {activity.endDate}
                    </p>
                  </div>
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    activity.type === 'referral' ? 'bg-green-500/20' : 'bg-primary/20'
                  )}>
                    {activity.type === 'referral' ? (
                      <Gift className="w-5 h-5 text-green-600" />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-background rounded-lg mb-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">老学员奖励：</span>
                    {activity.reward}
                  </p>
                  {activity.newStudentReward && (
                    <p className="text-sm mt-1">
                      <span className="text-muted-foreground">新学员优惠：</span>
                      {activity.newStudentReward}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">
                      推荐 <span className="text-foreground font-medium">{activity.totalReferrals}</span>
                    </span>
                    <span className="text-muted-foreground">
                      成功 <span className="text-green-600 font-medium">{activity.successReferrals}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleGeneratePoster}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 institution-btn-primary rounded-lg text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? '生成中...' : 'AI生成海报'}
                  </button>
                </div>
              </div>
            ))}

            {/* Create Activity Hint */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">创建新活动</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {referralRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 bg-muted/30 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{record.referrerName}</span>
                      <span className="text-muted-foreground">（{record.referrerStudent}家长）</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      推荐了 {record.newParentName} 的孩子 {record.newStudentName}
                    </p>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                    record.status === 'success'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-yellow-500/10 text-yellow-600'
                  )}>
                    {record.status === 'success' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        转化成功
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        待转化
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>报名课程：{record.courseName}</span>
                  {record.status === 'success' && (
                    <span className="text-green-600">奖励 +{record.rewardClasses}课时</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg bg-background rounded-t-2xl p-6 animate-in slide-in-from-bottom">
            <h2 className="text-lg font-semibold mb-4">创建新活动</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">活动名称</label>
                <input
                  type="text"
                  placeholder="如：暑期转介绍活动"
                  className="w-full mt-1 px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">活动类型</label>
                <div className="flex gap-3 mt-1">
                  <button className="flex-1 py-2 border-2 border-primary text-primary rounded-lg text-sm font-medium">
                    转介绍奖励
                  </button>
                  <button className="flex-1 py-2 border border-border text-muted-foreground rounded-lg text-sm">
                    拼团活动
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">老学员奖励</label>
                <input
                  type="text"
                  placeholder="如：推荐成功赠送2节课"
                  className="w-full mt-1 px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">新学员优惠</label>
                <input
                  type="text"
                  placeholder="如：首次报名9折优惠"
                  className="w-full mt-1 px-4 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <button className="w-full py-3 institution-btn-primary rounded-xl font-medium">
                创建活动
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
