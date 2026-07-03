'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Phone, MessageCircle, ChevronRight, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { warningStudents } from '@/lib/mock-data'

export default function AIWarningPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">流失预警</h1>
      </div>

      <div className="p-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">高风险</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {warningStudents.filter(s => s.level === 'red').length}
            </div>
            <div className="text-xs text-red-500 mt-1">需立即跟进</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-600">中风险</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {warningStudents.filter(s => s.level === 'yellow').length}
            </div>
            <div className="text-xs text-yellow-500 mt-1">建议关注</div>
          </div>
        </div>

        {/* Warning List */}
        <div className="space-y-3">
          {warningStudents.map((student) => (
            <div 
              key={student.id}
              className={`rounded-xl p-4 ${
                student.level === 'red' ? 'bg-red-50' : 'bg-yellow-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={student.avatar} 
                  alt={student.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{student.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      student.level === 'red' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {student.level === 'red' ? '高风险' : '中风险'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{student.reason}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span>剩余 {student.remainingClasses}/{student.totalClasses} 课时</span>
                <span>最近联系: {student.lastContact}</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 gap-1 bg-white"
                  onClick={() => router.push(`/institution/ai/renewal?student=${student.id}`)}
                >
                  <MessageCircle className="w-4 h-4" />
                  生成话术
                </Button>
                <Button size="sm" className="flex-1 gap-1">
                  <Phone className="w-4 h-4" />
                  立即联系
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div className="mt-6 p-4 bg-muted/20 rounded-xl">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">AI分析建议</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                本周有3名学员存在流失风险，建议优先跟进高风险学员。根据历史数据，在课时剩余20%时及时沟通，续费成功率可提升40%。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
