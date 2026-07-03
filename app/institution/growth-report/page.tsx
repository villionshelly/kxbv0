'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Send, CheckCircle, Clock, FileText, RefreshCw, Eye } from 'lucide-react'
import { growthReports, students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function GrowthReportPage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState('2026年3月')
  const [generating, setGenerating] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [previewReport, setPreviewReport] = useState<typeof growthReports[0] | null>(null)

  const handleGenerate = (reportId: string) => {
    setGenerating(reportId)
    setTimeout(() => {
      setGenerating(null)
    }, 3000)
  }

  const handleSend = (reportId: string) => {
    setSending(reportId)
    setTimeout(() => {
      setSending(null)
      alert('报告已发送给家长')
    }, 1500)
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
          <h1 className="font-semibold">AI成长报告</h1>
          <p className="text-xs text-muted-foreground">为学员生成个性化月度成长报告</p>
        </div>
      </header>

      {/* Month Selector */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto">
          {['2026年3月', '2026年2月', '2026年1月'].map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedMonth === month
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 bg-gradient-to-r from-purple-500/10 to-secondary/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {growthReports.length}
            </p>
            <p className="text-xs text-muted-foreground">待生成报告</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">
              {growthReports.filter(r => r.status === 'generated').length}
            </p>
            <p className="text-xs text-muted-foreground">已生成</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {growthReports.filter(r => r.sentAt).length}
            </p>
            <p className="text-xs text-muted-foreground">已发送</p>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="px-4 py-3 flex gap-3 border-b border-border">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          一键生成全部
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium">
          <Send className="w-4 h-4" />
          一键发送全部
        </button>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          {growthReports.map((report) => (
            <div
              key={report.id}
              className="p-4 bg-muted/30 rounded-xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={report.studentAvatar}
                  alt={report.studentName}
                  className="w-12 h-12 rounded-full bg-muted"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{report.studentName}</h3>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      report.status === 'generated'
                        ? report.sentAt
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-purple-500/10 text-purple-600'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {report.status === 'generated'
                        ? report.sentAt ? '已发送' : '已生成'
                        : '待生成'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.courseName} | 出勤 {report.attendance}/{report.totalClasses}
                  </p>
                </div>
              </div>

              {report.status === 'generated' && (
                <div className="p-3 bg-background rounded-lg mb-3">
                  <p className="text-sm text-muted-foreground mb-2">AI摘要</p>
                  <p className="text-sm">{report.summary}</p>
                  {report.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {report.status === 'draft' ? (
                  <button
                    onClick={() => handleGenerate(report.id)}
                    disabled={generating === report.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium"
                  >
                    {generating === report.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        AI生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI生成报告
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted text-foreground rounded-lg text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      预览
                    </button>
                    {!report.sentAt && (
                      <button
                        onClick={() => handleSend(report.id)}
                        disabled={sending === report.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                      >
                        {sending === report.id ? (
                          '发送中...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            发送给家长
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewReport(null)}
          />
          <div className="relative w-full max-w-sm bg-background rounded-2xl overflow-hidden">
            {/* Report Preview */}
            <div className="p-6 bg-gradient-to-br from-purple-500 to-secondary text-white">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={previewReport.studentAvatar}
                  alt={previewReport.studentName}
                  className="w-16 h-16 rounded-full border-2 border-white/30"
                />
                <div>
                  <h2 className="text-xl font-bold">{previewReport.studentName}</h2>
                  <p className="text-white/80">{previewReport.month}成长报告</p>
                </div>
              </div>
              <p className="text-sm text-white/90">{previewReport.courseName}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">本月亮点</h3>
                <div className="flex flex-wrap gap-2">
                  {previewReport.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-sm px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">AI成长总结</h3>
                <p className="text-sm">{previewReport.summary}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">老师寄语</h3>
                <p className="text-sm">{previewReport.teacherComment}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <img src="/logo.png" alt="课小宝" className="w-6 h-6" />
                  <span>课小宝AI教培管理</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {previewReport.generatedAt?.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <button
                onClick={() => setPreviewReport(null)}
                className="w-full py-2 bg-muted rounded-lg text-sm font-medium"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Points Info */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">生成报告消耗AI积分</span>
          <span className="text-purple-600 font-medium">10积分/份</span>
        </div>
      </div>
    </div>
  )
}
