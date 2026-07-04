'use client'

import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpenText,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  History,
  ImagePlus,
  Keyboard,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  UserPlus,
  Wand2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AssistantStage = 'idle' | 'waiting_teacher_evaluation' | 'waiting_course_name' | 'waiting_course_info' | 'waiting_consumed_lessons' | 'waiting_invite_confirm'
type MessageRole = 'user' | 'assistant'
type MessageSource = 'text' | 'voice' | 'upload' | 'system'
type QuickPhrase = {
  label: string
  text: string
}

type EmbeddedPage = {
  title: string
  href: string
}

interface EnglishCourseDraft {
  name: string
  childName: string
  teacherName: string
  scheduleText: string
  price: string
  totalLessons: number
  duration: string
}

interface AssistantDemoReport {
  id: string
  studentName: string
  courseName: string
  teacherName: string
  lessonCount: number
  summary: string
  highlights: string[]
}

type AssistantAction =
  | {
      type: 'leave_result'
      variant: 'self' | 'institution'
      title: string
      status: string
      courseName: string
      childName: string
      time: string
      teacher: string
      note: string
    }
  | {
      type: 'image_preview'
      title: string
      description: string
      evaluation: string
    }
  | {
      type: 'course_prompt'
      missingFields: string[]
    }
  | {
      type: 'course_created'
      course: EnglishCourseDraft
    }
  | {
      type: 'report_created'
      report: AssistantDemoReport
    }
  | {
      type: 'invite_poster'
      teacherName: string
    }
  | {
      type: 'progress'
      title: string
      steps: Array<{ label: string; done: boolean }>
    }

interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  source?: MessageSource
  imageUrl?: string
  imageName?: string
  isStreaming?: boolean
  action?: AssistantAction
}

type StoredMessage = Omit<Message, 'timestamp'> & {
  timestamp: string
}

type StoredAssistantChat = {
  stage: AssistantStage
  messages: StoredMessage[]
}

type AssistantWindow = Window & {
  __kxbParentAssistantChatState?: StoredAssistantChat
  __kxbParentAssistantRestoreChat?: boolean
}

const demoReportStorageKey = 'kxb-parent-assistant-demo-report'
const assistantChatStateKey = 'kxb-parent-assistant-current-chat'
const assistantRestoreFlagKey = 'kxb-parent-assistant-restore-chat'
const assistantReportId = 'assistant-english'
const assistantCrabSrc = '/images/ai/ai_crab_playful_360.gif'
const parentAvatarSrc = '/images/avatars/parent-mom.jpg'
const sampleEnglishImageSrc = '/images/growth-feed/english-reading-feedback.svg'

const defaultEnglishLessonCount = 25
const englishEvaluation = `Dear Parents,
I would like to share some positive feedback about your Duoduo's progress in class.
George is a very diligent and independent learner who always tries his best to complete tasks on his own. While I continue to guide and support him throughout our lessons, I am pleased to see that he takes initiative and makes a genuine effort to think and respond independently.
Another wonderful quality is that he is very open to corrections and feedback. He listens carefully, applies what he learns, and shows a positive attitude toward improving his English skills.
We only have two more units remaining in Level 4, and he is making steady progress toward completing them. Once finished, he will be ready to advance to Level 5 lessons.
Overall, I am very happy with his progress and learning attitude. I look forward to seeing his continued growth and success in English.
Today will be his 25th class. I'd like to ask if you renew and add more classes for George?
Kind regards,
Teacher Evee ❤️❤️`
const englishEvaluationInsight = '识别到：Teacher Evee 表扬孩子学习勤奋、能独立思考，愿意接受纠正并应用反馈；Level 4 还剩 2 个单元，今天是第 25 节课，同时带有续课提醒。'

const quickPhrases: QuickPhrase[] = [
  { label: '帮我请假', text: '帮我请假' },
  { label: '查今天课程', text: '查看今天课程' },
  { label: '整理老师评价', text: '整理老师评价' },
  { label: '生成成长报告', text: '生成成长报告' },
  { label: '推荐课程', text: '推荐课程' },
]

const phoneKeyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

const englishCourseDraft: EnglishCourseDraft = {
  name: '英语课',
  childName: '朵朵',
  teacherName: 'Teacher Evee',
  scheduleText: '每周二 19:00、周四 19:00、周六 09:00',
  price: '3000元',
  totalLessons: 30,
  duration: '25分钟',
}

const assistantEnglishReport = {
  id: assistantReportId,
  childId: '1',
  studentName: '朵朵',
  studentAvatar: '/images/avatars/child-duoduo-photo.jpg',
  institution: '家长自建课程',
  courseName: '英语课',
  teacherName: 'Teacher Evee',
  teacherAvatar: '',
  title: '英语课 25节阶段成长报告',
  period: '2026.05.05-2026.07.03',
  lessonCount: defaultEnglishLessonCount,
  coveredLessonRange: '第 1-25 课时',
  month: '2026年7月',
  status: 'generated',
  generatedAt: '2026-07-03 20:18',
  sentAt: '2026-07-03 20:18',
  summary: 'Teacher Evee 反馈朵朵在英语课中学习态度稳定，能主动独立完成任务，也愿意接受纠正并把反馈应用到后续练习中。Level 4 仅剩 2 个单元，完成后可衔接 Level 5。',
  highlights: ['主动独立完成任务', '能听取纠正并应用反馈', 'Level 4 稳步推进'],
  attendance: defaultEnglishLessonCount,
  totalClasses: defaultEnglishLessonCount,
  teacherComment: englishEvaluation,
  aiSuggestion: '建议家长优先安排 Level 4 最后 2 个单元的复习与衔接，并结合老师的续课提醒，提前规划 Level 5 课程。',
  images: [
    sampleEnglishImageSrc,
  ],
}

function makeId(prefix = 'msg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function persistAssistantReport() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(demoReportStorageKey, JSON.stringify(assistantEnglishReport))
}

function looksLikeEnglishEvaluation(text: string) {
  const lowerText = text.toLowerCase()
  return /[a-z]/i.test(text) && (
    lowerText.includes('mrs evee') ||
    lowerText.includes('duoduo') ||
    lowerText.includes('teacher') ||
    lowerText.includes('classroom') ||
    lowerText.includes('reading') ||
    lowerText.includes('sentences') ||
    lowerText.includes('complete sentences')
  )
}

function buildMessage(
  role: MessageRole,
  content: string,
  action?: AssistantAction,
  source: MessageSource = 'text',
  media?: Pick<Message, 'imageUrl' | 'imageName'>,
): Message {
  return {
    id: makeId(role),
    role,
    content,
    timestamp: new Date(),
    source,
    ...media,
    action,
  }
}

function serializeMessages(messages: Message[]): StoredMessage[] {
  return messages.map((message) => ({
    ...message,
    timestamp: message.timestamp.toISOString(),
    isStreaming: false,
  }))
}

function deserializeMessages(messages: StoredMessage[]): Message[] {
  return messages.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
    isStreaming: false,
  }))
}

function getAssistantWindow() {
  return window as AssistantWindow
}

export default function ParentAssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [stage, setStage] = useState<AssistantStage>('idle')
  const [isTyping, setIsTyping] = useState(false)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [showKeyboardPanel, setShowKeyboardPanel] = useState(false)
  const [embeddedPage, setEmbeddedPage] = useState<EmbeddedPage | null>(null)
  const voiceIndexRef = useRef(0)
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const assistantTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const keyboardInputRef = useRef<HTMLTextAreaElement>(null)
  const objectUrlsRef = useRef<string[]>([])
  const hasConversation = messages.length > 0 || isTyping
  const assistantBusy = isTyping || messages.some((message) => message.isStreaming)

  useEffect(() => {
    const assistantWindow = getAssistantWindow()
    const memoryChat = assistantWindow.__kxbParentAssistantChatState
    let storedChat: StoredAssistantChat | null = memoryChat || null
    let shouldRestore = Boolean(assistantWindow.__kxbParentAssistantRestoreChat)

    try {
      shouldRestore = shouldRestore || window.localStorage.getItem(assistantRestoreFlagKey) === '1'
      const rawStoredChat = window.localStorage.getItem(assistantChatStateKey)
      storedChat = storedChat || (rawStoredChat ? JSON.parse(rawStoredChat) as StoredAssistantChat : null)
    } catch {
      // Keep the in-memory navigation state as the reliable fallback.
    }

    if (shouldRestore && storedChat) {
      try {
        setMessages(deserializeMessages(storedChat.messages || []))
        setStage(storedChat.stage || 'idle')
      } catch {
        setMessages([])
        setStage('idle')
      }
    } else {
      setMessages([])
      setStage('idle')
    }

    assistantWindow.__kxbParentAssistantRestoreChat = false
    try {
      window.localStorage.removeItem(assistantRestoreFlagKey)
    } catch {
      // Ignore storage availability issues in embedded preview browsers.
    }

    return () => {
      assistantTimersRef.current.forEach((timer) => clearTimeout(timer))
      assistantTimersRef.current = []
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!showKeyboardPanel) return

    const focusTimer = setTimeout(() => {
      keyboardInputRef.current?.focus()
    }, 80)

    return () => clearTimeout(focusTimer)
  }, [showKeyboardPanel])

  useEffect(() => {
    if (messages.length === 0 || isTyping || messages.some((message) => message.isStreaming)) {
      return
    }

    const chatState: StoredAssistantChat = {
      stage,
      messages: serializeMessages(messages),
    }
    const assistantWindow = getAssistantWindow()
    assistantWindow.__kxbParentAssistantChatState = chatState
    assistantWindow.__kxbParentAssistantRestoreChat = true

    try {
      window.localStorage.setItem(assistantChatStateKey, JSON.stringify(chatState))
      window.localStorage.setItem(assistantRestoreFlagKey, '1')
    } catch {
      // The in-memory copy is enough for same-tab route returns.
    }
  }, [messages, stage, isTyping])

  const appendAssistant = (content: string, action?: AssistantAction, delay = 1050) => {
    setIsTyping(true)
    const delayTimer = setTimeout(() => {
      setIsTyping(false)
      const messageId = makeId('assistant')
      setMessages((prev) => [
        ...prev,
        {
          ...buildMessage('assistant', '', undefined, 'system'),
          id: messageId,
          isStreaming: true,
        },
      ])

      let cursor = 0
      const streamNext = () => {
        cursor += 1
        setMessages((prev) => prev.map((message) => (
          message.id === messageId
            ? { ...message, content: content.slice(0, cursor) }
            : message
        )))

        if (cursor < content.length) {
          const streamTimer = setTimeout(streamNext, 44)
          assistantTimersRef.current.push(streamTimer)
          return
        }

        setMessages((prev) => prev.map((message) => (
          message.id === messageId
            ? { ...message, content, action, isStreaming: false }
            : message
        )))
      }

      streamNext()
    }, delay)
    assistantTimersRef.current.push(delayTimer)
  }

  const saveCurrentChatState = () => {
    const chatState: StoredAssistantChat = {
      stage,
      messages: serializeMessages(messages),
    }
    const assistantWindow = getAssistantWindow()
    assistantWindow.__kxbParentAssistantChatState = chatState
    assistantWindow.__kxbParentAssistantRestoreChat = true

    try {
      window.localStorage.setItem(assistantChatStateKey, JSON.stringify(chatState))
      window.localStorage.setItem(assistantRestoreFlagKey, '1')
    } catch {
      // The in-memory copy is enough for same-tab route returns.
    }
  }

  const clearCurrentChatState = () => {
    const assistantWindow = getAssistantWindow()
    assistantWindow.__kxbParentAssistantChatState = undefined
    assistantWindow.__kxbParentAssistantRestoreChat = false

    try {
      window.localStorage.removeItem(assistantChatStateKey)
      window.localStorage.removeItem(assistantRestoreFlagKey)
    } catch {
      // Ignore storage availability issues in embedded preview browsers.
    }
  }

  const handleAssistantNavigation = (href: string) => {
    saveCurrentChatState()
    router.push(href)
  }

  const openEmbeddedPage = (page: EmbeddedPage) => {
    setShowKeyboardPanel(false)
    setShowHistory(false)
    setEmbeddedPage(page)
  }

  const sendText = (text?: string, source: MessageSource = 'text', media?: Pick<Message, 'imageUrl' | 'imageName'>) => {
    if (assistantBusy) return
    const messageText = (text || input).trim()
    if (!messageText) return

    setShowKeyboardPanel(false)
    setMessages((prev) => [...prev, buildMessage('user', messageText, undefined, source, media)])
    setInput('')
    handleUserIntent(messageText)
  }

  const submitCurrentInput = () => {
    if (assistantBusy || !input.trim()) return
    sendText(input)
  }

  const handleKeyboardKey = (key: string) => {
    setInput((prev) => {
      if (key === 'backspace') return prev.slice(0, -1)
      if (key === 'space') return `${prev} `
      return `${prev}${key.toLowerCase()}`
    })

    setTimeout(() => {
      keyboardInputRef.current?.focus()
    }, 0)
  }

  const handleUserIntent = (text: string) => {
    const lowerText = text.toLowerCase()
    const isEnglishCourseName = text.includes('英语') || lowerText.includes('english')
    const isTeacherEvaluation = looksLikeEnglishEvaluation(text)

    const appendEvaluationRecognized = () => {
      setStage('waiting_course_name')
      appendAssistant(
        '我已按 Teacher Evee 的反馈做了初步解读，但还没确认对应哪门课程。请告诉我是什么课？',
        {
          type: 'image_preview',
          title: '老师评价已识别',
          description: '已识别学生：朵朵；老师：Teacher Evee；课程：待确认',
          evaluation: englishEvaluationInsight,
        },
      )
    }

    if (stage === 'waiting_course_name') {
      if (isEnglishCourseName) {
        setStage('waiting_course_info')
        appendAssistant(
          '暂未发现朵朵有英语课。请补充这些信息，我来帮你创建课程。',
          {
            type: 'course_prompt',
            missingFields: ['英语老师姓名', '每周几几点上课', '订购价格', '包含课时', '每节课时长'],
          },
        )
        return
      }

      appendAssistant('我还没识别到课程名称。请告诉我是哪个课程，比如“英语课”。')
      return
    }

    if (stage === 'waiting_teacher_evaluation') {
      if (isTeacherEvaluation || text.length > 24) {
        appendEvaluationRecognized()
        return
      }

      appendAssistant('可以，直接把老师的文字评价粘贴过来，我会先识别孩子、老师和课程线索。')
      return
    }

    if (stage === 'waiting_course_info') {
      setStage('waiting_consumed_lessons')
      appendAssistant(
        '已经创建了这个课程。需要我帮你编写成长报告，还是继续告诉我这个课程已经销课情况？',
        {
          type: 'course_created',
          course: englishCourseDraft,
        },
      )
      return
    }

    if (stage === 'waiting_consumed_lessons') {
      if (text.includes('25') || text.includes('26') || text.includes('成长报告') || text.includes('销课') || text.includes('消课') || lowerText.includes('lesson') || lowerText.includes('report')) {
        persistAssistantReport()
        setStage('waiting_invite_confirm')
        appendAssistant(
          '好的，已按25节课补齐消课记录，并生成成长报告。你可以先查看报告，也可以继续邀请 Teacher Evee 开通课小宝服务。',
          {
            type: 'report_created',
            report: {
              id: assistantReportId,
              studentName: '朵朵',
              courseName: '英语课',
              teacherName: 'Teacher Evee',
              lessonCount: defaultEnglishLessonCount,
              summary: assistantEnglishReport.summary,
              highlights: assistantEnglishReport.highlights,
            },
          },
        )
        return
      }

      appendAssistant('好的，我已经记录课程。您可以继续告诉我已上了多少节课，我来补齐消课记录并生成成长报告。')
      return
    }

    if (stage === 'waiting_invite_confirm') {
      if (text.includes('邀请') || lowerText.includes('invite')) {
        handleInviteTeacher(false)
        return
      }
    }

    if (text.includes('朵朵') && text.includes('钢琴') && text.includes('请假')) {
      appendAssistant(
        '已经帮你提交请假请求。检测到这个课程为您自建课程，请假自动通过。',
        {
          type: 'leave_result',
          variant: 'self',
          title: '自建课请假已通过',
          status: '自动通过',
          courseName: '钢琴课',
          childName: '朵朵',
          time: '明天 10:00-11:00',
          teacher: '李老师',
          note: '该课程由家长自建记录，系统已同步到朵朵的个人课表。',
        },
      )
      return
    }

    if (text.includes('小宝') && text.includes('篮球') && text.includes('请假')) {
      appendAssistant(
        '已经帮你提交请假请求。机构老师已收到小宝请假信息，若老师未拒绝您的请求，请假自动审核通过。',
        {
          type: 'leave_result',
          variant: 'institution',
          title: '机构课请假已发送',
          status: '等待老师确认',
          courseName: '篮球课',
          childName: '小宝',
          time: '明天 17:00-18:00',
          teacher: '周教练',
          note: '请假信息已同步给机构老师，超时未拒绝将自动审核通过。',
        },
      )
      return
    }

    if (isTeacherEvaluation) {
      appendEvaluationRecognized()
      return
    }

    if (text.includes('整理老师评价') || text.includes('老师评价') || lowerText.includes('teacher evaluation') || lowerText.includes('teacher feedback')) {
      setStage('waiting_teacher_evaluation')
      appendAssistant('可以，把老师的评价文字发给我。我会识别孩子、课程和成长点，必要时再追问缺失信息。')
      return
    }

    if (text.includes('请假') || lowerText.includes('leave')) {
      appendAssistant('可以的，请告诉我孩子、课程和请假时间，例如“朵朵明天钢琴课请假”或“小宝明天篮球课请假”。')
      return
    }

    if ((text.includes('创建') && text.includes('课程')) || lowerText.includes('create course')) {
      setStage('waiting_course_info')
      appendAssistant(
        '可以，我需要课程名、老师姓名、每周几几点上课、课程价格、包含多少课时、每节课多长时间。你可以一次发给我。',
        {
          type: 'course_prompt',
          missingFields: ['课程名', '老师姓名', '上课时间', '课程价格', '总课时', '每节时长'],
        },
      )
      return
    }

    if (text.includes('成长报告') || lowerText.includes('growth report')) {
      appendAssistant('可以帮你生成。请告诉我是哪个孩子、哪门课，以及目前已经上了多少节课，我会整理消课记录和阶段报告。')
      return
    }

    if (text.includes('推荐课程') || (text.includes('推荐') && text.includes('课程')) || lowerText.includes('recommend')) {
      appendAssistant('可以，我会结合孩子年龄、兴趣、当前课程和时间安排来推荐。你想给朵朵还是小宝推荐？也可以直接告诉我兴趣方向。')
      return
    }

    if (text.includes('今天课程') || text.includes('查看今天') || (lowerText.includes('today') && (lowerText.includes('course') || lowerText.includes('class')))) {
      appendAssistant('今天课程我可以帮你查。当前可继续指定“朵朵”或“小宝”，我会按孩子筛选课程安排。')
      return
    }

    appendAssistant('我可以帮你处理请假、整理老师评价、创建自建课程、生成成长报告。你可以直接按自然语言告诉我要办理的事。')
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = () => {
    if (!isRecording) return
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }

    const voiceTexts = [
      '帮忙给朵朵明天的钢琴课请假发送',
      '帮我明天小宝的篮球课请假',
      '今天正好已经上了25节课了，你一起帮我创建成长报告',
    ]
    const text = voiceTexts[voiceIndexRef.current % voiceTexts.length]
    voiceIndexRef.current += 1
    sendText(text, 'voice')
  }

  const cancelRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
    }
  }

  const startEnglishFlow = (imageUrl = sampleEnglishImageSrc, imageName = 'English-class-feedback.svg') => {
    setStage('waiting_course_name')
    setMessages((prev) => [
      ...prev,
      buildMessage(
        'user',
        `上传了一张课堂图片，并粘贴英语老师评价：${englishEvaluation}`,
        undefined,
        'upload',
        { imageUrl, imageName },
      ),
    ])
    appendAssistant(
      '我已按 Teacher Evee 的反馈做了初步解读，但还没确认课程名称。请问这是什么课？',
      {
        type: 'image_preview',
        title: '课堂反馈识别结果',
        description: '已识别学生：朵朵；老师：Teacher Evee；课程：待确认',
        evaluation: englishEvaluationInsight,
      },
    )
  }

  const handleInviteTeacher = (addUserMessage = true) => {
    if (addUserMessage) {
      setMessages((prev) => [...prev, buildMessage('user', '那帮我邀请她吧')])
    }
    setStage('idle')
    appendAssistant(
      '好的，邀请海报已创建好。您可以发送给 Teacher Evee，邀请她开通课小宝家校服务。',
      {
        type: 'invite_poster',
        teacherName: 'Teacher Evee',
      },
      980,
    )
  }

  const startNewChat = () => {
    assistantTimersRef.current.forEach((timer) => clearTimeout(timer))
    assistantTimersRef.current = []
    setIsTyping(false)
    setStage('idle')
    setMessages([])
    clearCurrentChatState()
    setShowHistory(false)
  }

  const handleQuickPhrase = (phrase: QuickPhrase) => {
    setShowKeyboardPanel(false)
    sendText(phrase.text)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    objectUrlsRef.current.push(imageUrl)
    startEnglishFlow(imageUrl, file.name)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden warm-bg">
      <div className="assistant-page-texture pointer-events-none absolute inset-0 z-0" />
      <button
        type="button"
        onClick={() => setShowHistory(true)}
        className="absolute left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-card/92 text-primary shadow-sm ring-1 ring-border/60"
        style={{ top: 8 }}
        aria-label="历史会话"
      >
        <History className="h-[18px] w-[18px]" />
      </button>

      <main className={cn('scrollbar-quiet relative z-10 flex-1 overflow-auto px-4 pb-3', hasConversation ? 'pt-[52px]' : 'pt-2')}>
        {!hasConversation && (
          <section className="flex min-h-[48vh] flex-col items-center justify-center px-2 pb-4 pt-5 text-center">
            <img src={assistantCrabSrc} alt="课小宝 AI 助理" className="h-32 w-32 object-contain mix-blend-multiply" />
            <h2 className="mt-4 text-2xl font-black tracking-normal text-foreground">课小宝AI助理</h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">智能处理请假、查询课程、整理成长报告</p>
            <div className="mt-7 flex w-full flex-wrap justify-center gap-2">
              {quickPhrases.map((phrase) => (
                <button
                  key={phrase.label}
                  type="button"
                  onClick={() => handleQuickPhrase(phrase)}
                  disabled={assistantBusy}
                  className="rounded-full border border-border/70 bg-card/90 px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm active:scale-[0.98] disabled:opacity-45"
                >
                  {phrase.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              routerPush={handleAssistantNavigation}
              openEmbeddedPage={openEmbeddedPage}
              inviteTeacher={handleInviteTeacher}
            />
          ))}

          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
                <img src={assistantCrabSrc} alt="课小宝" className="h-8 w-8 object-cover mix-blend-multiply" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-sm ring-1 ring-border/60">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium text-muted-foreground">正在理解并办理</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>
      </main>

      <footer className="safe-area-bottom relative z-20 shrink-0 border-t border-border/55 bg-card/95 px-3 pb-3 pt-2 shadow-[0_-14px_30px_-26px_rgba(248,126,49,0.6)] backdrop-blur">
        {hasConversation && (
          <div className="scrollbar-quiet mb-2 flex gap-2 overflow-x-auto pb-1">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase.label}
                type="button"
                onClick={() => handleQuickPhrase(phrase)}
                disabled={assistantBusy}
                className="shrink-0 rounded-full bg-muted/55 px-3 py-1.5 text-xs font-medium text-muted-foreground disabled:opacity-45"
              >
                {phrase.label}
              </button>
            ))}
          </div>
        )}

        {isRecording && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            正在听你说话 {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode((mode) => mode === 'voice' ? 'text' : 'voice')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/65 text-muted-foreground"
            aria-label={inputMode === 'voice' ? '切换键盘' : '切换语音'}
          >
            {inputMode === 'voice' ? <Keyboard className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {inputMode === 'voice' ? (
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={cancelRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={cn(
                'flex h-10 min-w-0 flex-1 items-center justify-center rounded-full text-base font-semibold active:scale-[0.99]',
                isRecording ? 'bg-primary text-primary-foreground' : 'bg-muted/65 text-foreground',
              )}
            >
              {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isRecording ? '松开发送' : '按住说话'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowKeyboardPanel(true)}
              className="flex h-10 min-w-0 flex-1 items-center rounded-full bg-muted/65 px-4 text-left text-base font-medium text-[#172033] outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className={cn('min-w-0 flex-1 truncate', !input && 'text-[#7a6f68]')}>
                {input || '发消息'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={assistantBusy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/65 text-muted-foreground disabled:opacity-45"
            aria-label="上传图片"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={submitCurrentInput}
            disabled={assistantBusy || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-45"
            aria-label="发送"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>

      {showKeyboardPanel && inputMode === 'text' && (
        <div className="absolute inset-0 z-[210] flex items-end bg-black/10" onClick={() => setShowKeyboardPanel(false)}>
          <div
            className="safe-area-bottom w-full rounded-t-[26px] bg-[#f5f6f8] px-3 pb-3 pt-3 shadow-[0_-18px_42px_-24px_rgba(15,23,42,0.45)] ring-1 ring-black/5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-end gap-2 rounded-[22px] bg-card p-2 shadow-sm ring-1 ring-border/70">
              <textarea
                ref={keyboardInputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submitCurrentInput()
                  }
                }}
                rows={1}
                placeholder="发消息"
                className="max-h-24 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-base font-medium leading-6 text-[#172033] outline-none placeholder:text-[#7a6f68]"
              />
              <button
                type="button"
                onClick={submitCurrentInput}
                disabled={assistantBusy || !input.trim()}
                className="mb-0.5 flex h-9 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-45"
              >
                发送
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              {phoneKeyboardRows.map((row, rowIndex) => (
                <div key={row.join('')} className={cn('flex justify-center gap-1.5', rowIndex === 1 && 'px-4', rowIndex === 2 && 'px-9')}>
                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyboardKey(key)}
                      className="h-10 min-w-0 flex-1 rounded-lg bg-white text-sm font-semibold text-[#202a39] shadow-[0_1px_0_rgba(15,23,42,0.12)] active:bg-primary/10"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="h-10 w-14 rounded-lg bg-[#dfe3ea] text-sm font-semibold text-[#202a39]"
                  onClick={() => keyboardInputRef.current?.focus()}
                >
                  中/英
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyboardKey('space')}
                  className="h-10 flex-1 rounded-lg bg-white text-sm font-semibold text-[#202a39] shadow-[0_1px_0_rgba(15,23,42,0.12)] active:bg-primary/10"
                >
                  空格
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyboardKey('backspace')}
                  className="h-10 w-16 rounded-lg bg-[#dfe3ea] text-sm font-semibold text-[#202a39] active:bg-primary/10"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[220] flex justify-end bg-black/35" onClick={() => setShowHistory(false)}>
          <aside className="relative z-[230] h-full w-[78%] max-w-[320px] bg-background px-4 pt-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">历史会话</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">最近处理过的事项</p>
              </div>
              <button type="button" onClick={() => setShowHistory(false)} className="rounded-full bg-muted p-2" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={startNewChat}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
            >
              <Sparkles className="h-4 w-4" />
              新建会话
            </button>
            <div className="mt-4 space-y-2">
              {[
                { title: '英语课成长报告', desc: '已生成25节阶段报告' },
                { title: '小宝篮球请假', desc: '老师已收到请假信息' },
                { title: '朵朵钢琴请假', desc: '自建课程自动通过' },
              ].map((item) => (
                <button key={item.title} type="button" className="w-full rounded-2xl bg-muted/55 p-3 text-left">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      {embeddedPage && (
        <div className="absolute inset-0 z-[240] flex flex-col">
          <div className="safe-area-top shrink-0 bg-black/38 px-4 pb-2 text-white shadow-[0_12px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm">
            <div className="flex h-11 items-center justify-between">
              <div className="w-12" aria-hidden />
              <p className="text-base font-bold text-white">{embeddedPage.title}</p>
              <button
                type="button"
                onClick={() => setEmbeddedPage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white ring-1 ring-white/22 active:scale-95"
                aria-label="关闭临时页面"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <iframe
            key={embeddedPage.href}
            src={embeddedPage.href}
            title={embeddedPage.title}
            className="min-h-0 flex-1 border-0 bg-background"
          />
        </div>
      )}
    </div>
  )
}

function MessageBubble({
  message,
  routerPush,
  openEmbeddedPage,
  inviteTeacher,
}: {
  message: Message
  routerPush: (href: string) => void
  openEmbeddedPage: (page: EmbeddedPage) => void
  inviteTeacher: (addUserMessage?: boolean) => void
}) {
  const isUser = message.role === 'user'
  const isSingleLineUserBubble = isUser && !message.imageUrl && !message.action && !message.isStreaming && message.content.length <= 18 && !message.content.includes('\n')

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'justify-end' : 'justify-start',
        isSingleLineUserBubble ? 'items-center' : 'items-start',
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
          <img src={assistantCrabSrc} alt="课小宝" className="h-8 w-8 object-cover mix-blend-multiply" />
        </div>
      )}

      <div className={cn('max-w-[82%]', isUser && 'order-1')}>
        {!isUser && <p className="mb-1 text-[11px] font-medium text-muted-foreground">课小宝 AI · {formatTime(message.timestamp)}</p>}
        {isUser && message.imageUrl && (
          <div className="mb-2 overflow-hidden rounded-[18px] bg-card shadow-sm ring-1 ring-border/60">
            <img src={message.imageUrl} alt={message.imageName || '已上传图片'} className="max-h-48 w-full object-cover" />
            <p className="truncate px-3 py-1.5 text-[11px] text-muted-foreground">{message.imageName || '已上传图片'}</p>
          </div>
        )}

        <div
          className={cn(
            'rounded-[20px] px-4 py-3 text-base font-medium leading-7 shadow-sm',
            isUser
              ? 'rounded-br-md border border-[#ffd9bd] bg-[#fff8f1] text-[#2f2118]'
              : 'rounded-bl-md bg-card text-[#172033] ring-1 ring-border/60',
          )}
        >
          {message.content}
          {message.isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-primary/70 align-middle" />
          )}
        </div>

        {message.action && !message.isStreaming && (
          <div className={cn('mt-2', isUser ? 'ml-auto' : '')}>
            <ActionCard
              action={message.action}
              routerPush={routerPush}
              openEmbeddedPage={openEmbeddedPage}
              inviteTeacher={inviteTeacher}
            />
          </div>
        )}
      </div>

      {isUser && (
        <img src={parentAvatarSrc} alt="家长头像" className="order-2 h-8 w-8 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-white" />
      )}
    </div>
  )
}

function ActionCard({
  action,
  routerPush,
  openEmbeddedPage,
  inviteTeacher,
}: {
  action: AssistantAction
  routerPush: (href: string) => void
  openEmbeddedPage: (page: EmbeddedPage) => void
  inviteTeacher: (addUserMessage?: boolean) => void
}) {
  if (action.type === 'leave_result') {
    const isSelf = action.variant === 'self'
    return (
      <div className="w-full rounded-[22px] bg-card p-3 card-warm">
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', isSelf ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-[#172033]">{action.title}</p>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', isSelf ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600')}>
                {action.status}
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[#46515f]">{action.note}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {[
            ['孩子', action.childName],
            ['课程', action.courseName],
            ['时间', action.time],
            ['老师', action.teacher],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-muted/45 px-3 py-2">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="mt-0.5 font-semibold text-[#172033]">{value}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => routerPush('/parent/leave')}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 text-xs font-bold text-primary"
        >
          查看请假记录
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (action.type === 'image_preview') {
    return (
      <div className="rounded-[22px] bg-card p-3 card-warm">
        <p className="text-base font-bold text-[#172033]">{action.title}</p>
        <p className="mt-1 text-sm text-[#46515f]">{action.description}</p>
        <p className="mt-2 rounded-2xl bg-muted/45 px-3 py-2 text-sm leading-6 text-[#46515f]">
          {action.evaluation}
        </p>
      </div>
    )
  }

  if (action.type === 'course_prompt') {
    return (
      <div className="rounded-[22px] bg-card p-3 card-warm">
        <div className="mb-2 flex items-center gap-2">
          <BookOpenText className="h-4 w-4 text-primary" />
          <p className="text-base font-bold text-[#172033]">创建课程还需要</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {action.missingFields.map((field) => (
            <div key={field} className="rounded-2xl bg-muted/45 px-3 py-2 text-sm font-medium text-[#172033]">
              {field}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (action.type === 'course_created') {
    return (
      <div className="rounded-[22px] bg-card p-3 card-warm">
        <div className="flex items-start gap-3">
          <TeacherNameAvatar name={action.course.teacherName} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-[#172033]">{action.course.name}</p>
            <p className="mt-1 text-sm font-medium text-[#46515f]">{action.course.childName} · {action.course.teacherName} · 家长自建课程</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">已创建</span>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <InfoLine icon={Clock} label="上课时间" value={action.course.scheduleText} />
          <InfoLine icon={CalendarCheck} label="课包" value={`${action.course.price} / ${action.course.totalLessons}节 / 每节${action.course.duration}`} />
        </div>
      </div>
    )
  }

  if (action.type === 'report_created') {
    return (
      <div className="rounded-[22px] bg-card p-3 card-warm">
        <div className="rounded-[18px] bg-[linear-gradient(135deg,#fff7ed,#eef7ff)] p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-[#172033]">{action.report.courseName}成长报告</p>
              <p className="mt-1 text-sm text-[#46515f]">{action.report.teacherName} · 已补齐 {action.report.lessonCount} 节消课记录</p>
            </div>
          </div>
          <p className="mt-3 text-base leading-7 text-[#172033]">{action.report.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {action.report.highlights.map((highlight) => (
              <span key={highlight} className="rounded-full bg-card/75 px-2 py-1 text-[11px] font-medium text-primary">
                {highlight}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openEmbeddedPage({
              title: '成长报告',
              href: `/parent/growth/reports/${action.report.id}?assistantEmbed=1`,
            })}
            className="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-primary text-xs font-bold text-primary-foreground"
          >
            一键查看报告
          </button>
          <button
            type="button"
            onClick={() => inviteTeacher(true)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-muted text-xs font-bold text-foreground"
          >
            邀请老师
          </button>
        </div>
      </div>
    )
  }

  if (action.type === 'invite_poster') {
    return (
      <div className="rounded-[22px] bg-card p-3 card-warm">
        <div className="flex gap-3">
          <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-2xl bg-[#fff7ed] ring-1 ring-primary/20">
            <img src="/images/posters/invite-institution-template-20260703.png" alt="邀请机构海报" className="h-full w-full object-cover" />
            <div className="absolute inset-x-2 bottom-2 rounded-xl bg-card/90 px-2 py-1 text-center text-[9px] font-bold text-primary">{action.teacherName}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <p className="text-base font-bold text-[#172033]">邀请海报已生成</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#46515f]">海报已带上您的家校服务识别码，可直接发送给 {action.teacherName}。</p>
            <button
              type="button"
              onClick={() => openEmbeddedPage({
                title: '邀请机构',
                href: '/parent/invite?assistantEmbed=1',
              })}
              className="mt-3 flex h-9 w-full items-center justify-center gap-1 rounded-2xl bg-primary text-xs font-bold text-primary-foreground"
            >
              打开邀请海报
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[22px] bg-card p-3 card-warm">
      <div className="mb-2 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <p className="text-base font-bold text-[#172033]">{action.title}</p>
      </div>
      <div className="space-y-2">
        {action.steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-sm text-[#46515f]">
            <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', step.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
              {step.done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            </span>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-muted/45 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="shrink-0 text-[#5d6875]">{label}</span>
      <span className="min-w-0 flex-1 text-right font-semibold text-[#172033]">{value}</span>
    </div>
  )
}

function getTeacherAvatarLabel(name: string) {
  return name.replace(/^teacher\s+/i, '').trim().split(/\s+/).filter(Boolean).pop() || name
}

function TeacherNameAvatar({ name }: { name: string }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fff2df,#dff2ff_52%,#ffe8f2)] text-[13px] font-black text-[#0e4f86] shadow-sm ring-1 ring-white/80">
      <span className="absolute -right-3 -top-4 h-10 w-10 rounded-full bg-white/50" />
      <span className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary/12" />
      <span className="relative tracking-normal">{getTeacherAvatarLabel(name)}</span>
    </div>
  )
}
