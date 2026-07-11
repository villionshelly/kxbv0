'use client'

import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, MapPin } from 'lucide-react'
import { classSessions } from '@/lib/mock-data'

// Mock teacher's sessions mapping
const teacherSessions: Record<string, string[]> = {
  '1': ['cs1', 'cs2', 'cs3'],
  '2': ['cs4', 'cs5'],
  '3': [],
}

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function TeacherClassesPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string

  const sessionIds = teacherSessions[teacherId] || ['cs1']
  const teacherSessionList = classSessions.filter(s => sessionIds.includes(s.id))

  // Calculate total weekly hours
  const totalHours = teacherSessionList.reduce(
    (acc, s) => acc + s.sessions.reduce((sum, item) => sum + item.duration / 60, 0),
    0
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Summary */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{teacherSessionList.length} 个班次</span>
          <span className="font-bold text-primary">本周 {totalHours.toFixed(1)} 小时</span>
        </div>
      </div>

      {/* Class List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {teacherSessionList.map(session => (
          <div
            key={session.id}
            className="bg-background border border-border rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: session.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{session.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{session.courseName}</p>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {session.sessions.map(item => `${weekDays[item.dayOfWeek]} ${item.time}`).join('、')}
                    </span>
                    <span className="text-primary font-medium">
                      ({session.sessions[0]?.duration || 60}分钟)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{session.studentIds.length} 名学员</span>
                  </div>
                  {session.classroom && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{session.classroom}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {teacherSessionList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无班次</p>
          </div>
        )}
      </div>
    </div>
  )
}
