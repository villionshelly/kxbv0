'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Sparkles, Copy, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { students } from '@/lib/mock-data'

function AIRenewalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('student')
  const student = students.find(s => s.id === studentId) || students[1]

  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const sampleResults = [
    `${student.parentName}您好！${student.name}在咱们这学了有段时间了，进步真的很明显。最近看孩子基本功越来越扎实，正是巩固提升的关键期。\n\n现在课时剩余不多了，我们这边正好有个续费活动：续24课时送2节，续48课时送6节，性价比很高。\n\n您看这两天方便过来聊聊吗？我帮您规划一下${student.name}下阶段的学习计划。`,
    `${student.parentName}，${student.name}最近的表现我都看在眼里，真的很棒！尤其是上节课的表现，进步特别大。\n\n我看咱们课时快用完了，趁着孩子现在状态好、兴趣高，建议继续学下去。中途断开的话，前面的努力就可惜了。\n\n最近有个老学员专属活动，续费有额外赠课。您方便的话，我把详情发您看看？`,
  ]

  const handleGenerate = () => {
    setGenerating(true)
    setResult('')
    const fullText = sampleResults[Math.floor(Math.random() * sampleResults.length)]
    let index = 0
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setResult(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setGenerating(false)
      }
    }, 30)
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(result)
    } catch {
      // Clipboard API may be blocked
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    handleGenerate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">AI续费话术</h1>
      </div>

      <div className="p-4">
        <div className="bg-muted/20 rounded-xl p-4 mb-4">
          <div className="text-sm text-muted-foreground mb-2">生成对象</div>
          <div className="flex items-center gap-3">
            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-medium">{student.name}</div>
              <div className="text-sm text-muted-foreground">
                剩余{student.remainingClasses}课时 · 家长: {student.parentName}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>本次消耗 5 积分</span>
          </div>
          <div className="text-sm text-muted-foreground">余额: 1,580</div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-2xl p-4 mb-4 min-h-[200px]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI生成话术</span>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {result}
            {generating && <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleGenerate} disabled={generating}>
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            重新生成
          </Button>
          <Button className="flex-1 gap-2" onClick={handleCopy} disabled={!result || generating}>
            <Copy className="w-4 h-4" />
            {copied ? '已复制' : '复制话术'}
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground text-center">
          AI生成内容仅供参考，请根据实际情况适当调整
        </div>
      </div>
    </div>
  )
}

export default function AIRenewalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AIRenewalContent />
    </Suspense>
  )
}
