'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Sparkles, CheckCircle, Send, ChevronRight, Star } from 'lucide-react'
import { classSessions, students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ME_ID = '1'
const mySessions = classSessions.filter(cs => cs.teacherId === ME_ID)
const myStudentIds = [...new Set(mySessions.flatMap(cs => cs.studentIds))]
const myStudents = students.filter(s => myStudentIds.includes(s.id))

type GenStep = 'idle' | 'generating' | 'done'

const sampleReport = (name: string) => `尊敬的家长您好：

${name}同学本月共上课 8 节，出勤率 100%，表现优秀！

**学习进展**
本月重点学习了《小星星》变奏曲和拜厄钢琴基础教程第18-22课，手型保持良好，节奏感有明显提升，右手旋律流畅自然。

**亮点时刻**
在本月课堂展示中，${name}同学主动演奏了自己练习的曲目，获得同学们的热烈掌声，充分体现了对钢琴学习的热情与自信。

**下月目标**
1. 继续巩固《小星星》变奏，加强左右手配合练习
2. 开始学习《小奏鸣曲》第一乐章
3. 每日练习保持 30 分钟以上

感谢您对孩子学习的支持与陪伴，我们一起见证${name}的成长！

李雪老师`

export default function TeacherGrowthReportPage() {
  const router = useRouter()
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [genStep, setGenStep] = useState<GenStep>('idle')
  const [reportContent, setReportContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [sent, setSent] = useState<string[]>([])

  const student = myStudents.find(s => s.id === selectedStudent)

  const handleGenerate = () => {
    if (!student) return
    setGenStep('generating')
    setTimeout(() => {
      setReportContent(sampleReport(student.name))
      setGenStep('done')
    }, 1800)
  }

  const handleSend = () => {
    if (!selectedStudent) return
    setSent(prev => [...prev, selectedStudent])
    setGenStep('idle')
    setSelectedStudent(null)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="safe-area-top px-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/institution/teacher')}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <p className="font-semibold">AI成长报告</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Student list */}
        {genStep === 'idle' && (
          <div>
            <p className="text-sm font-semibold mb-3">选择学员生成报告</p>
            <div className="space-y-2">
              {myStudents.map(s => {
                const isSent = sent.includes(s.id)
                return (
                  <button key={s.id}
                    onClick={() => { setSelectedStudent(s.id); setGenStep('idle') }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left',
                      selectedStudent === s.id
                        ? 'border-purple-400 bg-purple-50/50'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}>
                    <img src={s.avatar} alt={s.name} className="w-11 h-11 rounded-full bg-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{s.name}</p>
                        {isSent && (
                          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">已发送</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.courses.join('、')}</p>
                    </div>
                    {selectedStudent === s.id
                      ? <CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    }
                  </button>
                )
              })}
            </div>

            {selectedStudent && (
              <button onClick={handleGenerate}
                className="w-full mt-4 h-12 bg-purple-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI生成 {student?.name} 的成长报告
              </button>
            )}
          </div>
        )}

        {genStep === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            <p className="font-medium">AI正在生成报告...</p>
            <p className="text-sm text-muted-foreground text-center px-8">
              分析本月出勤数据、课堂表现和学习进度中
            </p>
          </div>
        )}

        {genStep === 'done' && student && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl">
              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <p className="font-semibold text-sm">{student.name} · 2026年4月成长报告</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">AI综合评分 ★★★★★</span>
                </div>
              </div>
            </div>

            {editing ? (
              <textarea
                value={reportContent}
                onChange={e => setReportContent(e.target.value)}
                className="w-full min-h-[320px] p-4 bg-muted/30 rounded-2xl text-sm leading-relaxed outline-none resize-none"
              />
            ) : (
              <div className="p-4 bg-muted/30 rounded-2xl">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">{reportContent}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)}
                className="flex-1 h-11 bg-muted text-muted-foreground rounded-2xl text-sm font-medium">
                {editing ? '完成编辑' : '编辑报告'}
              </button>
              <button onClick={handleSend}
                className="flex-1 h-11 bg-purple-600 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                发送给家长
              </button>
            </div>
            <button onClick={() => { setGenStep('idle'); setSelectedStudent(null) }}
              className="w-full h-10 text-sm text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors">
              重新选择学员
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
