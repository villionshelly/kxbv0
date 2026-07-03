'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Award, BookOpenText, CalendarCheck, ChevronRight, Target, UserRound, X } from 'lucide-react'
import { getChildMedals, type MedalItem } from '@/lib/parent-data'
import { useSelectedChild } from '@/hooks/use-selected-child'

const lockedMedalImage = '/images/medals/medal-locked.png'

const medalImageMap: Record<string, string> = {
  persistence: '/images/medals/medal-persistence.png',
  milestone: '/images/medals/medal-milestone.png',
  attendance: '/images/medals/medal-attendance.png',
  creative: '/images/medals/medal-creative.png',
  progress: '/images/medals/medal-progress.png',
  engagement: '/images/medals/medal-engagement.png',
  attitude: '/images/medals/medal-attitude.png',
}

type MedalTask = MedalItem & {
  locked?: boolean
}

const lockedTasksByChild: Record<string, MedalTask[]> = {
  '1': [
    {
      id: 'locked-duoduo-1',
      name: '舞台小明星',
      icon: '✨',
      description: '完成一次课堂展示',
      earnedAt: '',
      color: '#F59E0B',
      category: 'attitude',
      childId: '1',
      institution: '七彩音乐艺术中心',
      courseName: '钢琴启蒙',
      teacherName: '李老师',
      teacherAvatar: '/images/avatars/teacher-lixue-photo.jpg',
      ruleName: '课堂展示任务',
      ruleDescription: '在阶段课上完整展示一首练习曲',
      targetCount: 1,
      currentCount: 0,
      locked: true,
    },
    {
      id: 'locked-duoduo-2',
      name: '编程闯关',
      icon: '💡',
      description: '完成 3 次逻辑闯关',
      earnedAt: '',
      color: '#10B981',
      category: 'progress',
      childId: '1',
      institution: '酷码编程',
      courseName: '少儿编程',
      teacherName: '王老师',
      teacherAvatar: '/images/avatars/teacher-wangming-photo.jpg',
      ruleName: '逻辑闯关任务',
      ruleDescription: '独立完成 3 次课堂编程挑战',
      targetCount: 3,
      currentCount: 1,
      locked: true,
    },
  ],
  '2': [
    {
      id: 'locked-xiaobao-1',
      name: '坚持之星',
      icon: '⭐',
      description: '坚持上课 5 次',
      earnedAt: '',
      color: '#EF4444',
      category: 'attendance',
      childId: '2',
      institution: '跃动篮球训练营',
      courseName: '篮球课',
      teacherName: '周教练',
      teacherAvatar: '/images/avatars/coach-basketball-zhou.png',
      ruleName: '坚持上课任务',
      ruleDescription: '连续到课完成 5 次篮球基础训练',
      targetCount: 5,
      currentCount: 3,
      locked: true,
    },
    {
      id: 'locked-xiaobao-2',
      name: '品势小能手',
      icon: '🥋',
      description: '品势组合达标',
      earnedAt: '',
      color: '#8B5CF6',
      category: 'progress',
      childId: '2',
      institution: '龙武跆拳道馆',
      courseName: '跆拳道',
      teacherName: '陈教练',
      teacherAvatar: '/images/avatars/coach-taekwondo-chen.png',
      ruleName: '品势组合任务',
      ruleDescription: '完成 4 次品势组合练习并达到老师要求',
      targetCount: 4,
      currentCount: 2,
      locked: true,
    },
  ],
}

function getMedalImage(category: string, locked?: boolean) {
  return locked ? lockedMedalImage : medalImageMap[category] || lockedMedalImage
}

export default function ParentGrowthMedalsPage() {
  const router = useRouter()
  const { selectedChild } = useSelectedChild()
  const earnedMedals = getChildMedals(selectedChild.id).map((medal) => ({ ...medal, locked: false }))
  const lockedTasks = lockedTasksByChild[selectedChild.id] || []
  const medalTasks = [...earnedMedals, ...lockedTasks]
  const [selectedMedal, setSelectedMedal] = useState<MedalTask | null>(null)

  return (
    <div className="flex min-h-screen flex-col warm-bg pb-8">
      <header className="sticky top-0 z-10 warm-header px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="-ml-1 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold">勋章任务</h1>
          <span className="w-8" />
        </div>
      </header>

      <main className="flex-1 px-4 pt-3">
        <section className="mb-4 rounded-3xl bg-card p-4 card-warm">
          <div className="flex items-center gap-3">
            <img src={selectedChild.avatar} alt={selectedChild.name} className="h-12 w-12 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{selectedChild.name}的机构勋章墙</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">勋章由机构按课程配置任务规则，达成后自动点亮。</p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center">
              <p className="text-xl font-bold leading-none text-primary">{earnedMedals.length}</p>
              <p className="mt-1 text-[10px] font-medium text-primary/70">已获得</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {medalTasks.map((medal) => {
            const progress = Math.min(100, Math.round((medal.currentCount / medal.targetCount) * 100))
            return (
              <button
                key={medal.id}
                type="button"
                onClick={() => setSelectedMedal(medal)}
                className="w-full rounded-3xl bg-card p-3 text-left shadow-sm ring-1 ring-border/50 transition-transform active:scale-[0.99]"
              >
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted/30">
                    <img
                      src={getMedalImage(medal.category, medal.locked)}
                      alt={medal.name}
                      className="h-14 w-14 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.14)]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">{medal.name}</p>
                      <span className={medal.locked ? 'rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground' : 'rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'}>
                        {medal.locked ? '进行中' : '已点亮'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{medal.ruleDescription}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <img src={medal.teacherAvatar} alt={medal.teacherName} className="h-5 w-5 rounded-full object-cover" />
                      <span>{medal.teacherName}</span>
                      <span>·</span>
                      <span className="truncate">{medal.courseName}</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{medal.ruleName}</span>
                    <span>{medal.currentCount}/{medal.targetCount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </button>
            )
          })}
        </section>
      </main>

      {selectedMedal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45 p-4" onClick={() => setSelectedMedal(null)}>
          <div className="w-full rounded-3xl bg-background p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">勋章来源</span>
              <button type="button" onClick={() => setSelectedMedal(null)} className="rounded-full bg-muted p-1.5" aria-label="关闭勋章详情">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-muted/30">
                <img
                  src={getMedalImage(selectedMedal.category, selectedMedal.locked)}
                  alt={selectedMedal.name}
                  className="h-20 w-20 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-foreground">{selectedMedal.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedMedal.description}</p>
                <span className={selectedMedal.locked ? 'mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground' : 'mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary'}>
                  {selectedMedal.locked ? '任务进行中' : `${selectedMedal.earnedAt} 获得`}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-muted/30 p-3 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Award className="h-4 w-4 text-primary" />
                {selectedMedal.ruleName}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                {selectedMedal.ruleDescription}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <BookOpenText className="h-4 w-4" />
                {selectedMedal.institution} · {selectedMedal.courseName}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="h-4 w-4" />
                {selectedMedal.teacherName} 提供
              </p>
              {!selectedMedal.locked && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  完成进度 {selectedMedal.currentCount}/{selectedMedal.targetCount}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
