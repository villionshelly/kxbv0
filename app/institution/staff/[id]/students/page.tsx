'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { students } from '@/lib/mock-data'

// Mock teacher's students
const teacherStudents: Record<string, string[]> = {
  '1': ['1', '2', '4'],
  '2': ['2', '3'],
  '3': ['1', '3', '5'],
}

export default function TeacherStudentsPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string

  const studentIds = teacherStudents[teacherId] || ['s1', 's2']
  const teacherStudentList = students.filter(s => studentIds.includes(s.id))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">学员名单</h1>
          <span className="text-sm text-muted-foreground">({teacherStudentList.length}人)</span>
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {teacherStudentList.map(student => (
          <button
            key={student.id}
            onClick={() => router.push(`/institution/students/${student.id}`)}
            className="w-full bg-muted/30 rounded-xl p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
          >
            <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.courses.join('、')}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  剩余 {student.remainingClasses}/{student.totalClasses} 课时
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                student.remainingClasses < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {student.remainingClasses < 10 ? '课时不足' : '正常'}
              </span>
            </div>
          </button>
        ))}

        {teacherStudentList.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无学员</p>
          </div>
        )}
      </div>
    </div>
  )
}
