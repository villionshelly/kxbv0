'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Users, CheckCircle, Clock, AlertCircle, History, X, MessageSquare, Plus, Mic, Keyboard, MicOff, Loader2 } from 'lucide-react'
import { institutionInfo, todayScheduleB, students, leaveRequests } from '@/lib/mock-data'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: {
    type: 'attendance' | 'leave_approval' | 'student_query' | 'reminder'
    data?: any
    confirmed?: boolean
  }
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  preview: string
}

const quickActions = [
  { label: '今天谁请假了', icon: Users },
  { label: '帮我点名', icon: CheckCircle },
  { label: '查看续费预警', icon: AlertCircle },
]

const assistantCrabSrc = '/images/ai/ai_crab_加油加油.gif'

const formatMessageTime = (date: Date) =>
  date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

// 模拟历史会话
const historyChats: ChatSession[] = [
  { id: '1', title: '课堂点名', timestamp: new Date('2026-03-27'), preview: '钢琴启蒙A班点名...' },
  { id: '2', title: '请假审批', timestamp: new Date('2026-03-26'), preview: '处理朵朵请假申请...' },
  { id: '3', title: '续费提醒', timestamp: new Date('2026-03-25'), preview: '小明课时即将用完...' },
]

export default function InstitutionAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [sessionId] = useState(() => Date.now().toString())
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasConversation = messages.length > 1 || isTyping
  const visibleMessages = hasConversation ? messages.filter((message, index) => !(index === 0 && message.role === 'assistant')) : []

  // 每次进入页面开始新会话
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '您好！我是课小宝AI助理，可以帮您快速处理点名、请假审批等事务。试试说"今天10点的课，除了朵朵都到了"或"审批请假申请"吧~',
        timestamp: new Date(),
      },
    ])
  }, [sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Voice recording handlers
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
    // Simulate voice recognition result
    const voiceTexts = [
      '今天的钢琴课，朵朵没来',
      '今天谁请假了',
      '查看续费预警的学员',
    ]
    const randomText = voiceTexts[Math.floor(Math.random() * voiceTexts.length)]
    handleSend(randomText)
  }

  const cancelRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = processMessage(messageText)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 800)
  }

  const processMessage = (text: string): Message => {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('点名') || lowerText.includes('没来') || lowerText.includes('都到了') || lowerText.includes('出勤')) {
      const absentStudents: string[] = []
      
      if (lowerText.includes('除了') || lowerText.includes('没来')) {
        students.forEach(s => {
          if (lowerText.includes(s.name)) {
            absentStudents.push(s.name)
          }
        })
      }

      const classInfo = todayScheduleB[0]
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: absentStudents.length > 0 
          ? `好的，我来帮您完成【${classInfo.className}】的点名。确认以下出勤情况：`
          : `请告诉我哪些学员缺勤，比如说"今天的钢琴课，小明没来"`,
        timestamp: new Date(),
        action: absentStudents.length > 0 ? {
          type: 'attendance',
          data: {
            className: classInfo.className,
            time: classInfo.time,
            absent: absentStudents,
            present: students.filter(s => !absentStudents.includes(s.name)).map(s => s.name).slice(0, 3),
          },
        } : undefined,
      }
    }

    if (lowerText.includes('请假') && (lowerText.includes('审批') || lowerText.includes('申请') || lowerText.includes('谁'))) {
      const pendingLeaves = leaveRequests.filter(l => l.status === 'pending')
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: pendingLeaves.length > 0 
          ? `目前有${pendingLeaves.length}条待审批的请假申请：`
          : '目前没有待审批的请假申请。',
        timestamp: new Date(),
        action: pendingLeaves.length > 0 ? {
          type: 'leave_approval',
          data: pendingLeaves,
        } : undefined,
      }
    }

    if (lowerText.includes('续费') || lowerText.includes('预警') || lowerText.includes('快到期')) {
      const warningStudents = students.filter(s => s.status === 'warning' || s.status === 'expired')
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `目前有${warningStudents.length}位学员需要关注续费：`,
        timestamp: new Date(),
        action: {
          type: 'reminder',
          data: warningStudents,
        },
      }
    }

    if (lowerText.includes('帮我点名')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `今天有${todayScheduleB.length}节课需要点名。请告诉我具体哪节课的出勤情况，比如"10点的钢琴课，朵朵没来"`,
        timestamp: new Date(),
        action: {
          type: 'attendance',
          data: {
            classes: todayScheduleB,
          },
        },
      }
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: '我理解您的需求。您可以试试说"帮我点名"、"今天谁请假了"或"查看续费预警"，我会帮您快速处理。',
      timestamp: new Date(),
    }
  }

  const handleAttendanceConfirm = (data: any) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `已完成【${data.className}】的点名！\n- 出勤：${data.present.length}人\n- 缺勤：${data.absent.join('、') || '无'}\n\n已自动为出勤学员扣减课时，缺勤学员标记为请假。`,
        timestamp: new Date(),
        action: {
          type: 'attendance',
          confirmed: true,
        },
      },
    ])
  }

  const handleLeaveApproval = (leave: typeof leaveRequests[0], approved: boolean) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: approved 
          ? `已同意【${leave.studentName}】的请假申请，系统会通知家长并安排补课。`
          : `已拒绝【${leave.studentName}】的请假申请，已通知家长。`,
        timestamp: new Date(),
        action: {
          type: 'leave_approval',
          confirmed: true,
        },
      },
    ])
  }

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `您好！我是课小宝AI助理，有什么可以帮您的？`,
        timestamp: new Date(),
      },
    ])
    setShowHistory(false)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-white">
      <div className="assistant-page-texture pointer-events-none absolute inset-0 z-0" />

      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed bottom-0 right-0 top-0 z-50 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-blue-100 p-4">
              <h2 className="font-semibold">历史会话</h2>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-blue-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={startNewChat}
                className="mb-4 flex w-full items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">新建会话</span>
              </button>
              <div className="space-y-2">
                {historyChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className="w-full rounded-2xl bg-slate-50 p-3 text-left transition-colors hover:bg-blue-50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{chat.title}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{chat.preview}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {chat.timestamp.toLocaleDateString('zh-CN')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setShowHistory(true)}
        className="absolute left-4 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-blue-600 shadow-sm ring-1 ring-blue-100"
        aria-label="历史会话"
      >
        <History className="w-5 h-5" />
      </button>

      <main className="scrollbar-quiet relative z-10 flex-1 overflow-auto px-4 pb-3 pt-14">
        {!hasConversation && (
          <section className="flex min-h-[50vh] flex-col items-center justify-center px-2 pb-4 pt-5 text-center">
            <img src={assistantCrabSrc} alt="课小宝 AI 助理" className="h-36 w-36 object-contain mix-blend-multiply" />
            <h1 className="mt-3 text-2xl font-black tracking-normal text-slate-950">课小宝AI助理</h1>
            <p className="mt-2 text-base leading-7 text-slate-500">智能处理点名、请假审批、续费预警</p>
            <div className="mt-7 flex w-full flex-wrap justify-center gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleSend(action.label)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/92 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm active:scale-[0.98]"
                >
                  <action.icon className="h-4 w-4 text-blue-600" />
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {hasConversation && (
        <section className="space-y-4">
          {visibleMessages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <img src={assistantCrabSrc} alt="课小宝AI" className="h-8 w-8 object-cover mix-blend-multiply" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">课小宝 AI · {formatMessageTime(message.timestamp)}</span>
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="mb-1 flex items-center justify-end gap-2">
                    <span className="text-[11px] font-medium text-slate-500">{institutionInfo.name} · {formatMessageTime(message.timestamp)}</span>
                    <img
                      src={institutionInfo.logo}
                      alt={institutionInfo.name}
                      className="h-8 w-8 rounded-full bg-white object-cover shadow-sm ring-1 ring-white/80"
                    />
                  </div>
                )}
                <div
                  className={`rounded-[20px] px-4 py-3 text-base font-medium leading-7 ${
                    message.role === 'user'
                      ? 'institution-chat-user-bubble rounded-br-md shadow-sm'
                      : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-blue-100/70'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>

                {/* 点名确认 */}
                {message.action?.type === 'attendance' && !message.action.confirmed && message.action.data?.absent && (
                  <div className="mt-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">课程：</span>
                        <span className="font-medium">{message.action.data.className}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">出勤：</span>
                        <span>{message.action.data.present.join('、')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500">缺勤：</span>
                        <span>{message.action.data.absent.join('、')}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttendanceConfirm(message.action?.data)}
                      className="w-full rounded-xl institution-btn-primary py-2 text-sm font-semibold transition-colors"
                    >
                      确认点名
                    </button>
                  </div>
                )}

                {/* 点名课程列表 */}
                {message.action?.type === 'attendance' && !message.action.confirmed && message.action.data?.classes && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.classes.map((cls: typeof todayScheduleB[0]) => (
                      <div key={cls.id} className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{cls.className}</p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {cls.time}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500">{cls.student}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.action?.type === 'attendance' && message.action.confirmed && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>点名完成，课时已扣减</span>
                  </div>
                )}

                {/* 请假审批 */}
                {message.action?.type === 'leave_approval' && !message.action.confirmed && message.action.data && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.map((leave: typeof leaveRequests[0]) => (
                      <div key={leave.id} className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={leave.studentAvatar}
                            alt={leave.studentName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-sm">{leave.studentName}</p>
                            <p className="text-xs text-slate-500">{leave.courseName}</p>
                          </div>
                        </div>
                        <p className="mb-1 text-xs text-slate-500">
                          原定时间：{leave.originalTime}
                        </p>
                        <p className="text-sm mb-3">请假原因：{leave.reason}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleLeaveApproval(leave, false)}
                            className="flex-1 rounded-xl bg-slate-100 py-1.5 text-xs font-medium text-slate-500"
                          >
                            拒绝
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLeaveApproval(leave, true)}
                            className="flex-1 rounded-xl institution-btn-primary py-1.5 text-xs font-semibold transition-colors"
                          >
                            同意
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.action?.type === 'leave_approval' && message.action.confirmed && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>已处理完成</span>
                  </div>
                )}

                {/* 续费提醒 */}
                {message.action?.type === 'reminder' && message.action.data && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.map((student: typeof students[0]) => (
                      <div key={student.id} className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-slate-500">{student.courses.join('、')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${student.remainingClasses <= 5 ? 'text-red-500' : 'text-yellow-600'}`}>
                              {student.remainingClasses}课时
                            </p>
                            <p className="text-xs text-muted-foreground">剩余</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <img src={assistantCrabSrc} alt="课小宝AI" className="h-8 w-8 object-cover mix-blend-multiply" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-blue-600 shadow-sm ring-1 ring-blue-100">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs font-medium text-slate-500">正在理解并办理</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>
        )}
      </main>

      <footer className="safe-area-bottom relative z-20 shrink-0 border-t border-blue-100/70 bg-white/95 px-3 pb-3 pt-2 shadow-[0_-14px_30px_-26px_rgba(37,99,235,0.55)] backdrop-blur">
        {hasConversation && (
          <div className="scrollbar-quiet mb-2 flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleSend(action.label)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {isRecording && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            正在听你说话 {formatRecordingTime(recordingTime)}
          </div>
        )}

        {inputMode === 'voice' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
              aria-label="切换键盘"
            >
              <Keyboard className="h-5 w-5" />
            </button>
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={cancelRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center rounded-full text-base font-semibold active:scale-[0.99] ${
                isRecording ? 'bg-[#2f5f9f] text-white' : 'bg-blue-50 text-slate-900'
              }`}
            >
              {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isRecording ? '松开发送' : '按住说话'}
            </button>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full institution-btn-primary disabled:opacity-35"
              aria-label="发送"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('voice')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"
              aria-label="切换语音"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="h-10 min-w-0 flex-1 rounded-full bg-blue-50 px-4 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full institution-btn-primary transition-opacity disabled:opacity-35"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </footer>

    </div>
  )
}
