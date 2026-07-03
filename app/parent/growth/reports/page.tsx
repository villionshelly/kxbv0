'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpenText, CalendarDays, ChevronRight, FileText, Sparkles } from 'lucide-react'
import { getChildGrowthReports } from '@/lib/parent-data'
import { useSelectedChild } from '@/hooks/use-selected-child'

export default function ParentGrowthReportsPage() {
  const router = useRouter()
  const { selectedChild } = useSelectedChild()
  const reports = getChildGrowthReports(selectedChild.id)
  const totalLessonCount = reports.reduce((sum, report) => sum + report.lessonCount, 0)
  const coveredCourses = Array.from(new Set(reports.map((report) => report.courseName)))
  const latestHighlights = reports.flatMap((report) => report.highlights).slice(0, 3)
  const overviewScore = reports.length > 0 ? (selectedChild.id === '1' ? 92 : 90) : 0
  const scoreDimensions = selectedChild.id === '1'
    ? [
        { label: '课堂专注', score: 94 },
        { label: '阶段进步', score: 92 },
        { label: '表达创作', score: 89 },
      ]
    : [
        { label: '课堂参与', score: 92 },
        { label: '动作协调', score: 90 },
        { label: '坚持训练', score: 88 },
      ]
  const aiSummary = reports.length > 0
    ? `AI总结：已汇总${reports.length}份阶段报告，覆盖${coveredCourses.join('、')}共${totalLessonCount}个课时。近期亮点集中在${latestHighlights.join('、')}。`
    : `AI总结：${selectedChild.name}暂时还没有阶段报告，完成阶段课程后会在这里沉淀老师反馈。`

  return (
    <div className="flex min-h-screen flex-col warm-bg pb-8">
      <header className="sticky top-0 z-10 warm-header px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="-ml-1 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold">成长报告</h1>
          <span className="w-8" />
        </div>
      </header>

      <main className="flex-1 px-4 pt-3">
        <section className="mb-5 px-1 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-primary">AI 总览</p>
              <h2 className="mt-1 text-2xl font-black leading-tight text-foreground">
                {selectedChild.name}的阶段成长总评
              </h2>
            </div>
            <img src={selectedChild.avatar} alt={selectedChild.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-white/80" />
          </div>
          <div className="mt-4 flex items-end gap-4">
            <div className="shrink-0">
              <p className="text-[48px] font-black leading-none tracking-normal text-primary">{overviewScore}</p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">综合成长分</p>
            </div>
            <div className="min-w-0 flex-1 space-y-2 pb-1">
              {scoreDimensions.map((item) => (
                <div key={item.label} className="grid grid-cols-[56px_1fr_28px] items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{item.label}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-border/70">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
                  </span>
                  <span className="text-right text-[11px] font-bold text-foreground">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{aiSummary}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 border-y border-border/60 py-3">
            <div>
              <p className="text-xl font-bold leading-none text-primary">{reports.length}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">阶段报告</p>
            </div>
            <div>
              <p className="text-xl font-bold leading-none text-primary">{coveredCourses.length}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">覆盖课程</p>
            </div>
            <div>
              <p className="text-xl font-bold leading-none text-primary">{totalLessonCount}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">统计课时</p>
            </div>
          </div>
        </section>

        {reports.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-foreground">老师成长报告</h2>
              <span className="text-[11px] text-muted-foreground">按生成时间排序</span>
            </div>
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => router.push(`/parent/growth/reports/${report.id}`)}
                className="w-full rounded-3xl bg-card p-4 text-left shadow-sm ring-1 ring-border/50 transition-transform active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <img src={report.teacherAvatar} alt={report.teacherName} className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{report.teacherName}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{report.courseName}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{report.institution}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                </div>

                <h2 className="mt-3 text-base font-bold text-foreground">{report.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{report.summary}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {report.highlights.slice(0, 3).map((highlight) => (
                    <span key={highlight} className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {report.month}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenText className="h-3.5 w-3.5" />
                    {report.lessonCount} 课时
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    已生成
                  </span>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl bg-card p-8 text-center card-warm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">暂时还没有成长报告</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">完成阶段课程后，老师会为孩子生成更完整的成长反馈。</p>
          </section>
        )}
      </main>
    </div>
  )
}
