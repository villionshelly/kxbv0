'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Calendar, Clock, MapPin, CheckCircle, History, X, MessageSquare, Plus, ArrowLeft, Mic, Keyboard, MicOff } from 'lucide-react'
import { schedule, courses, children } from '@/lib/mock-data'
import Image from 'next/image'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: {
    type: 'leave_request' | 'schedule_query' | 'course_info'
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
  { label: '帮我请假', icon: Calendar },
  { label: '查看今天课程', icon: Clock },
]

// 模拟历史会话
const historyChats: ChatSession[] = [
  { id: '1', title: '请假申请', timestamp: new Date('2026-03-27'), preview: '帮朵朵钢琴课请假...' },
  { id: '2', title: '课程查询', timestamp: new Date('2026-03-26'), preview: '查看本周课程安排...' },
  { id: '3', title: '课时咨询', timestamp: new Date('2026-03-25'), preview: '美术课还剩多少课时...' },
]

export default function ParentAssistantPage() {
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
        content: `您好！我是课小宝AI助理，可以帮您处理请假、查询课程等事务。试试说"帮朵朵请假"或"查看今天的课程"吧~`,
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
      '帮朵朵请假',
      '查看今天的课程',
      '钢琴课还剩多少课时',
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
    
    if (lowerText.includes('请假') || lowerText.includes('不去')) {
      const todaySchedule = schedule.filter(s => s.date === '2026-03-28')
      if (todaySchedule.length > 0) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `好的，我来帮您处理请假。${children[0].name}今天有以下课程，请选择需要请假的课程：`,
          timestamp: new Date(),
          action: {
            type: 'leave_request',
            data: todaySchedule,
          },
        }
      }
    }

    if (lowerText.includes('今天') && (lowerText.includes('课') || lowerText.includes('安排'))) {
      const todaySchedule = schedule.filter(s => s.date === '2026-03-28')
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${children[0].name}今天有${todaySchedule.length}节课：`,
        timestamp: new Date(),
        action: {
          type: 'schedule_query',
          data: todaySchedule,
        },
      }
    }

    if (lowerText.includes('课时') || lowerText.includes('剩余') || lowerText.includes('还有多少')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${children[0].name}的课时情况如下：`,
        timestamp: new Date(),
        action: {
          type: 'course_info',
          data: courses,
        },
      }
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: '我理解您的需求。您可以试试说"帮我请假"、"查看今天课程"或"查询剩余课时"，我会帮您处理。',
      timestamp: new Date(),
    }
  }

  const handleLeaveConfirm = (scheduleItem: typeof schedule[0]) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `已为您提交【${scheduleItem.courseName}】的请假申请，课程时间：${scheduleItem.date} ${scheduleItem.startTime}-${scheduleItem.endTime}。机构老师收到后会尽快确认并安排补课时间。`,
        timestamp: new Date(),
        action: {
          type: 'leave_request',
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
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-xl mb-4 hover:bg-primary/20 transition-colors"
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
          onClick={() => router.push('/parent')}
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
              <div className="w-full h-full rounded-full bg-primary/30" />
            </div>
            <div className="absolute -right-2 top-6 w-4 h-4 animate-wave-right origin-left">
              <div className="w-full h-full rounded-full bg-primary/30" />
            </div>
          </div>
          <h2 className="font-semibold text-lg">课小宝AI助理</h2>
          <p className="text-sm text-muted-foreground mt-1">智能处理请假、查询等事务</p>
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
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>

                {/* Action Cards */}
                {message.action?.type === 'leave_request' && !message.action.confirmed && message.action.data && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.map((item: typeof schedule[0]) => (
                      <div key={item.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-8 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="font-medium text-sm">{item.courseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.startTime}-{item.endTime} | {item.classroom}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLeaveConfirm(item)}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
                          >
                            请假
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.action?.type === 'leave_request' && message.action.confirmed && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>请假申请已提交</span>
                  </div>
                )}

                {message.action?.type === 'schedule_query' && message.action.data && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.map((item: typeof schedule[0]) => (
                      <div key={item.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.courseName}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.startTime}-{item.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.classroom}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.action?.type === 'course_info' && message.action.data && (
                  <div className="mt-2 space-y-2">
                    {message.action.data.map((course: typeof courses[0]) => (
                      <div key={course.id} className="bg-background border border-border rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: course.color }}
                            >
                              {course.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{course.name}</p>
                              <p className="text-xs text-muted-foreground">{course.institution}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{course.remainingClasses}</p>
                            <p className="text-xs text-muted-foreground">剩余课时</p>
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
              <action.icon className="w-3.5 h-3.5 text-primary" />
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
                    className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
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
              className="flex-1 px-4 py-2.5 bg-muted/50 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition-opacity flex-shrink-0"
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
