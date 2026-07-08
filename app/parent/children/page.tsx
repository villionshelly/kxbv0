'use client'

import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronRight, GraduationCap, Plus, UserRoundCog } from 'lucide-react'
import { children, courses, medals } from '@/lib/mock-data'

export default function ParentChildrenPage() {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col warm-bg">
      <main className="flex-1 overflow-auto px-4 pb-24">
        <section className="pt-2">
          <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,248,255,0.76))] p-4 ring-1 ring-white/75">
            <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-secondary/12" />
            <div className="relative">
              <p className="text-[11px] font-medium text-primary">家庭学员</p>
              <h2 className="mt-1 text-2xl font-bold">共 {children.length} 位孩子</h2>
              <p className="mt-1 text-sm text-muted-foreground">管理孩子资料、成长档案和课程绑定</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4">
          {children.map((child) => {
            const childMedals = child.id === '1' ? medals.duoduo : medals.xiaobao
            const childCourses = courses.filter((course) => course.childId === child.id)
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => router.push('/parent/growth')}
                className="w-full rounded-[26px] bg-white/68 p-3 text-left ring-1 ring-white/75 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <img src={child.avatar} alt={child.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{child.grade}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/75 pt-3">
                  <div>
                    <CalendarDays className="mb-1 h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">课程</p>
                    <p className="text-sm font-semibold">{childCourses.length} 门</p>
                  </div>
                  <div>
                    <GraduationCap className="mb-1 h-4 w-4 text-secondary" />
                    <p className="text-xs text-muted-foreground">成长档案</p>
                    <p className="text-sm font-semibold">已开启</p>
                  </div>
                  <div>
                    <UserRoundCog className="mb-1 h-4 w-4 text-emerald-600" />
                    <p className="text-xs text-muted-foreground">勋章</p>
                    <p className="text-sm font-semibold">{childMedals.length} 枚</p>
                  </div>
                </div>
              </button>
            )
          })}
        </section>

        <button
          type="button"
          onClick={() => router.push('/parent/add-child')}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 text-sm font-semibold text-primary"
        >
          <Plus className="h-4 w-4" />
          添加孩子
        </button>
      </main>
    </div>
  )
}
