'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Sparkles, Mic, MicOff, Keyboard, CheckCircle, Users, AlertCircle, Clock } from 'lucide-react'
import { classSessions, students, leaveRecords } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ME_ID = '1'
const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const todayDow = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
const mySessions = classSessions.filter(cs => cs.teacherId === ME_ID)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  card?: {
    type: 'checkin' | 'leave' | 'students'
    data?: any
  }
}

const quickPrompts = [
  { label: '今天谁请假了', icon: Users },
  { label: '帮我完成今日点名', icon: CheckCircle },
  { label: '课时不足的学员', icon: AlertCircle },
  { label: '本周课程安排', icon: Clock },
]

function simulateReply(input: string): Message {
  const id = Date.now().toString()
  const lowerInput = input.toLowerCase()

  if (lowerInput.includes('请假')) {
    const leaves = leaveRecords.filter(l =>
      mySessions.some(cs => cs.id === l.sessionId) && l.dayOfWeek === todayDow
    )
    if (leaves.length === 0) {
      return { id, role: 'assistant', content: '今天您的课程暂无学员请假，所有学员预计正常出勤。' }
    }
    const names = leaves.map(l => {
      const s = students.find(x => x.id === l.studentId)
      const cs = mySessions.find(x => x.id === l.sessionId)
      return `${s?.name}（${cs?.name}·${weekDayNames[todayDow]}）`
    })
    return {
      id,
      role: 'assistant',
      content: `今天有 ${leaves.length} 位学员请假：\n${names.join('\n')}\n\n请假学员不扣除课时，已自动标记。`,
    }
  }

  if (lowerInput.includes('点名') || lowerInput.includes('核销')) {
    const todaySessions = mySessions.filter(cs => cs.sessions.some(s => s.dayOfWeek === todayDow))
    if (todaySessions.length === 0) {
      return { id, role: 'assistant', content: '今天您没有安排课程，无需点名。' }
    }
    const session = todaySessions[0]
    const leaves = leaveRecords.filter(l => l.sessionId === session.id && l.dayOfWeek === todayDow)
    const present = session.studentIds.length - leaves.length
    return {
      id,
      role: 'assistant',
      content: `已为您预填今日「${session.name}」点名：\n\n- 应到：${session.studentIds.length} 人\n- 请假：${leaves.length} 人\n- 预计到课：${present} 人\n\n请在首页「今日核销」确认各学员到课情况后提交。`,
      card: { type: 'checkin', data: { session, present, leaveCount: leaves.length } },
    }
  }

  if (lowerInput.includes('课时') || lowerInput.includes('不足') || lowerInput.includes('续费')) {
    const myStudentIds = [...new Set(mySessions.flatMap(cs => cs.studentIds))]
    const lowStudents = students.filter(s => myStudentIds.includes(s.id) && s.remainingClasses <= 4)
    if (lowStudents.length === 0) {
      return { id, role: 'assistant', content: '您的学员中暂无课时不足（≤4节）的情况，大家的课时都很充裕。' }
    }
    const list = lowStudents.map(s => `${s.name}：剩余 ${s.remainingClasses} 课时`).join('\n')
    return {
      id,
      role: 'assistant',
      content: `以下学员课时即将不足，建议提醒续费：\n\n${list}\n\n需要我帮您生成续费提醒话术吗？`,
    }
  }

  if (lowerInput.includes('本周') || lowerInput.includes('课程')) {
    const schedule = mySessions.flatMap(cs =>
      cs.sessions.map(s => `${weekDayNames[s.dayOfWeek]} ${s.time} - ${cs.name}（${cs.classroom}）共${cs.studentIds.length}人`)
    ).join('\n')
    return { id, role: 'assistant', content: `您本周的课程安排：\n\n${schedule}` }
  }

  return {
    id,
    role: 'assistant',
    content: `收到！我是您的专属AI助理，可以帮您处理点名核销、请假审批、学员课时查询、续费提醒等事务。\n\n试试问我：\n• "今天谁请假了"\n• "帮我完成今日点名"\n• "课时不足的学员有哪些"`,
  }
}

export default function TeacherAssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `您好，${['李雪', '王明'][0]}老师！我是课小宝AI助理，可以帮您快速处理点名、请假审批、学员课时查询等教学事务。`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, simulateReply(text)])
    }, 900)
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => sendMessage('帮我完成今日点名'), 400)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/institution/teacher')}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI助理</p>
              <p className="text-xs text-muted-foreground">课小宝教师版</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Quick prompts on first load */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            {quickPrompts.map(q => (
              <button key={q.label} onClick={() => sendMessage(q.label)}
                className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl text-left hover:bg-muted/70 transition-colors">
                <q.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-foreground">{q.label}</span>
              </button>
            ))}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
            )}
            <div className={cn('max-w-[80%] space-y-2')}>
              <div className={cn(
                'px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed',
                msg.role === 'user'
                  ? 'institution-btn-primary rounded-tr-sm'
                  : 'bg-muted/60 text-foreground rounded-tl-sm'
              )}>
                {msg.content}
              </div>
              {/* Checkin card */}
              {msg.card?.type === 'checkin' && msg.card.data && (
                <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-semibold mb-2 text-secondary">{msg.card.data.session.name} · 今日点名预填</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 font-medium">{msg.card.data.present} 人到课</span>
                    {msg.card.data.leaveCount > 0 && (
                      <span className="text-amber-600">{msg.card.data.leaveCount} 人请假</span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push('/institution/teacher')}
                    className="mt-2 w-full h-8 institution-btn-primary rounded-lg text-xs font-medium"
                  >
                    前往确认核销
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="bg-muted/60 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-10">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border bg-background safe-area-bottom">
        {inputMode === 'text' ? (
          <div className="flex items-end gap-2">
            <button onClick={() => setInputMode('voice')}
              className="p-2.5 bg-muted/40 rounded-xl text-muted-foreground hover:bg-muted transition-colors shrink-0">
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-end bg-muted/40 rounded-2xl px-3 py-2 gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder="问我任何教学问题..."
                rows={1}
                className="flex-1 bg-transparent text-sm outline-none resize-none leading-5 max-h-24 text-foreground placeholder:text-muted-foreground"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim()}
                className={cn('p-1.5 rounded-xl transition-colors shrink-0',
                  input.trim() ? 'institution-btn-primary' : 'text-muted-foreground/40')}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={() => isRecording && stopRecording()}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                isRecording ? 'bg-red-500 scale-110 shadow-lg' : 'bg-primary'
              )}
            >
              {isRecording ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
            </button>
            <p className="text-xs text-muted-foreground">
              {isRecording ? `松开发送 · ${recordingTime}s` : '按住说话'}
            </p>
            <button onClick={() => setInputMode('text')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Keyboard className="w-3.5 h-3.5" />
              切换键盘
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
