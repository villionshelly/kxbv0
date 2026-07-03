'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Users, CheckCircle, Clock, AlertCircle, History, X, MessageSquare, Plus, ArrowLeft, Mic, Keyboard, MicOff } from 'lucide-react'
import { todayScheduleB, students, leaveRequests } from '@/lib/mock-data'
import Image from 'next/image'

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

// 模拟历史会话
const historyChats: ChatSession[] = [
  { id: '1', title: '课堂点名', timestamp: new Date('2026-03-27'), preview: '钢琴启蒙A班点名...' },
  { id: '2', title: '请假审批', timestamp: new Date('2026-03-26'), preview: '处理朵朵请假申请...' },
  { id: '3', title: '续费提醒', timestamp: new Date('2026-03-25'), preview: '小明课时即将用完...' },
]

export default function InstitutionAssistantPage() {
  const router = useRouter()
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
    <div className="flex flex-col h-full bg-background relative">
      {/* History Sidebar */}
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-72 bg-background z-50 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">历史会话</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-secondary/10 text-secondary rounded-xl mb-4 hover:bg-secondary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">新建会话</span>
              </button>
              <div className="space-y-2">
                {historyChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full text-left p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{chat.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.preview}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {chat.timestamp.toLocaleDateString('zh-CN')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header with back button and history */}
      <header className="safe-area-top px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/institution')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <History className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Mascot Welcome */}
      {messages.length <= 1 && (
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className="relative w-20 h-20 mb-3">
            <Image
              src="/logo.png"
              alt="课小宝"
              fill
              className="object-contain animate-bounce-slow"
            />
            {/* Waving claws animation */}
            <div className="absolute -left-2 top-6 w-4 h-4 animate-wave-left origin-right">
              <div className="w-full h-full rounded-full bg-secondary/30" />
            </div>
            <div className="absolute -right-2 top-6 w-4 h-4 animate-wave-right origin-left">
              <div className="w-full h-full rounded-full bg-secondary/30" />
            </div>
          </div>
          <h2 className="font-semibold text-lg">课小宝AI助理</h2>
          <p className="text-sm text-muted-foreground mt-1">智能处理点名、审批等事务</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="relative w-7 h-7">
                      <Image
                        src="/logo.png"
                        alt="课小宝"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">课小宝</span>
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted/50'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>

                {/* 点名确认 */}
                {message.action?.type === 'attendance' && !message.action.confirmed && message.action.data?.absent && (
                  <div className="mt-2 bg-background border border-border rounded-xl p-3">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">课程：</span>
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
                      onClick={() => handleAttendanceConfirm(message.action?.data)}
                      className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                    >
                      确认点名
                    </button>
                  </div>
                )}

                {/* 点名课程列表 */}
                {message.action?.type === 'attendance' && !message.action.confirmed && message.action.data?.classes && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.classes.map((cls: typeof todayScheduleB[0]) => (
                      <div key={cls.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{cls.className}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cls.time}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">{cls.student}</span>
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
                      <div key={leave.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={leave.studentAvatar}
                            alt={leave.studentName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-sm">{leave.studentName}</p>
                            <p className="text-xs text-muted-foreground">{leave.courseName}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          原定时间：{leave.originalTime}
                        </p>
                        <p className="text-sm mb-3">请假原因：{leave.reason}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLeaveApproval(leave, false)}
                            className="flex-1 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium"
                          >
                            拒绝
                          </button>
                          <button
                            onClick={() => handleLeaveApproval(leave, true)}
                            className="flex-1 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium"
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
                      <div key={student.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.courses.join('、')}</p>
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
            <div className="flex justify-start">
              <div className="flex items-center gap-2 mb-1">
                <div className="relative w-7 h-7">
                  <Image
                    src="/logo.png"
                    alt="课小宝"
                    fill
                    className="object-contain animate-pulse"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-2xl ml-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleSend(action.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-xs font-medium whitespace-nowrap hover:bg-muted transition-colors"
            >
              <action.icon className="w-3.5 h-3.5 text-secondary" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background safe-area-bottom">
        {inputMode === 'voice' ? (
          <div className="flex flex-col items-center">
            {isRecording ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      正在录音 {formatRecordingTime(recordingTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={cancelRecording}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse"
                  >
                    <MicOff className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setInputMode('text')}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Keyboard className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">按住说话，松开发送</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setInputMode('text')}
                    className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Keyboard className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={cancelRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12" />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMode('voice')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              className="flex-1 px-4 py-2.5 bg-muted/50 rounded-full text-sm outline-none focus:ring-2 focus:ring-secondary/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes wave-left {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes wave-right {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-wave-left {
          animation: wave-left 1s ease-in-out infinite;
        }
        .animate-wave-right {
          animation: wave-right 1s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  )
}
