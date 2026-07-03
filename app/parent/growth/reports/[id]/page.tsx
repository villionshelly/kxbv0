'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpenText, CalendarDays, Download, Image as ImageIcon, Share2, Sparkles, X } from 'lucide-react'
import { getGrowthReportById } from '@/lib/parent-data'

export default function ParentGrowthReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const report = getGrowthReportById(String(params.id))
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [generatingPoster, setGeneratingPoster] = useState(false)

  const handleGeneratePoster = () => {
    setShowShareSheet(true)
    setGeneratingPoster(true)
    setTimeout(() => setGeneratingPoster(false), 1600)
  }

  return (
    <div className="min-h-screen warm-bg pb-8">
      <header className="sticky top-0 z-10 warm-header px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="-ml-1 rounded-lg p-1.5 hover:bg-card/60" aria-label="返回">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold">报告详情</h1>
          <button onClick={handleGeneratePoster} className="rounded-lg p-1.5 hover:bg-card/60" aria-label="分享成长报告">
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </header>

      <main className="px-4 pt-3">
        <section className="overflow-hidden rounded-3xl bg-card card-warm">
          <div className="bg-[linear-gradient(135deg,rgba(248,126,49,0.12),rgba(14,112,192,0.1))] p-4">
            <div className="flex items-start gap-3">
              <img src={report.studentAvatar} alt={report.studentName} className="h-14 w-14 rounded-full object-cover ring-2 ring-white" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary">{report.month}</p>
                <h2 className="mt-1 text-xl font-bold leading-tight text-foreground">{report.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{report.studentName} · {report.courseName}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/70 px-2 py-2 text-center">
                <BookOpenText className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-sm font-bold text-foreground">{report.lessonCount}</p>
                <p className="text-[10px] text-muted-foreground">阶段课时</p>
              </div>
              <div className="rounded-2xl bg-white/70 px-2 py-2 text-center">
                <Sparkles className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-sm font-bold text-foreground">{report.highlights.length}</p>
                <p className="text-[10px] text-muted-foreground">成长亮点</p>
              </div>
              <div className="rounded-2xl bg-white/70 px-2 py-2 text-center">
                <CalendarDays className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-sm font-bold text-foreground">{report.attendance}/{report.totalClasses}</p>
                <p className="text-[10px] text-muted-foreground">到课情况</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-muted/35 p-3">
              <img src={report.teacherAvatar} alt={report.teacherName} className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{report.teacherName}</p>
                <p className="truncate text-xs text-muted-foreground">{report.institution}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{report.coveredLessonRange}</span>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-foreground">阶段总结</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{report.summary}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">成长亮点</h3>
              <div className="mt-2 space-y-2">
                {report.highlights.map((highlight, index) => (
                  <div key={highlight} className="flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{index + 1}</span>
                    <span className="text-sm text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">老师评语</h3>
              <p className="mt-2 rounded-2xl bg-muted/35 p-3 text-sm leading-7 text-muted-foreground">{report.teacherComment}</p>
            </section>

            <section>
              <div className="mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">相关课堂图片</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {report.images.map((url, index) => (
                  <img key={url} src={url} alt={`${report.studentName}课堂图片 ${index + 1}`} className="aspect-square rounded-2xl object-cover" />
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleGeneratePoster}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
            >
              <Share2 className="h-4 w-4" />
              分享成长报告
            </button>
          </div>
        </section>
      </main>

      {showShareSheet && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4" onClick={() => setShowShareSheet(false)}>
          <div className="max-h-[92vh] w-full max-w-sm overflow-auto rounded-2xl bg-background" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">成长报告海报</h3>
              <button onClick={() => setShowShareSheet(false)} className="rounded-full bg-muted p-2" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 pt-0">
              {generatingPoster ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <p className="text-sm text-muted-foreground">AI正在整理成长报告...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-[30px] bg-[#fff7ed] p-3.5 text-[#182033] shadow-sm ring-1 ring-black/5">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_18%_0%,rgba(248,126,49,0.16),transparent_45%),radial-gradient(circle_at_92%_10%,rgba(14,112,192,0.12),transparent_38%)]" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(255,223,186,0.72))]" />

                    <div className="relative space-y-3">
                      <div className="flex items-start justify-between gap-3 px-0.5">
                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-semibold text-primary">{report.month} 成长报告</p>
                            <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-[#9a4c20] ring-1 ring-white/70">{report.courseName}</span>
                          </div>
                          <h4 className="mt-1 whitespace-nowrap text-[24px] font-bold leading-tight tracking-normal">{report.studentName}又进步了一点点</h4>
                        </div>
                        <img
                          src={report.studentAvatar}
                          alt={report.studentName}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/80"
                        />
                      </div>

                      <div className="relative overflow-hidden rounded-[26px]">
                        <div className="relative h-[228px] overflow-hidden rounded-[26px]">
                          <img
                            src={report.images[0]}
                            alt={report.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-sm font-semibold text-white">{report.title}</p>
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 flex gap-1.5">
                          {report.images.slice(1, 3).map((url, index) => (
                            <div key={url} className="h-[66px] w-[66px] overflow-hidden rounded-2xl shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)] ring-2 ring-white/90">
                              <img
                                src={url}
                                alt={`${report.studentName}课堂图片 ${index + 2}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="px-1">
                        <p className="text-[15px] font-semibold leading-6">{report.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {report.highlights.slice(0, 3).map((highlight) => (
                            <span key={highlight} className="rounded-full bg-[#fff0e4] px-2 py-1 text-[11px] font-medium text-[#9a4c20]">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-[#efd8c4] pt-3">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-[#9a4c20]">{report.teacherName} · {report.institution}</p>
                            <p className="mt-0.5 text-[10px] text-[#7b6d63]">
                              {report.coveredLessonRange} · {report.lessonCount} 课时
                            </p>
                          </div>
                          <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-primary shadow-sm">
                            {report.attendance}/{report.totalClasses} 到课
                          </span>
                        </div>
                      </div>

                      <div className="relative mt-1 overflow-hidden rounded-[22px] bg-[linear-gradient(100deg,rgba(255,240,220,0.88),rgba(236,249,255,0.76))] px-3 py-2">
                        <div className="relative flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2 text-[#8a6b55]">
                            <img src="/logo.png" alt="课小宝" className="h-6 w-6 shrink-0 object-contain opacity-95" />
                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-semibold">课小宝成长报告</p>
                              <p className="text-[9px] text-[#9d8069]">每一次进步都值得被看见</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#8a6b55]">
                            <span>扫码生成</span>
                            <img src="/images/posters/growth-report-qr.svg" alt="成长报告二维码" className="h-11 w-11 opacity-80" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-muted text-sm font-medium">
                      <Download className="h-4 w-4" />
                      保存图片
                    </button>
                    <button className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#07C160] text-sm font-medium text-white">
                      <Share2 className="h-4 w-4" />
                      分享朋友圈
                    </button>
                  </div>
                </div>
              )}
              </div>
          </div>
        </div>
      )}
    </div>
  )
}
