'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, CheckCircle, Users, Sparkles, Upload, X, RefreshCcw } from 'lucide-react'
import { students, todayScheduleB } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function PhotoAttendancePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'select' | 'capture' | 'processing' | 'result'>('select')
  const [selectedClass, setSelectedClass] = useState<typeof todayScheduleB[0] | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [recognizedStudents, setRecognizedStudents] = useState<Array<{
    id: string
    name: string
    avatar: string
    recognized: boolean
    attendance: 'present' | 'absent'
  }>>([])

  const handleSelectClass = (classItem: typeof todayScheduleB[0]) => {
    setSelectedClass(classItem)
    setStep('capture')
  }

  const handleCapture = () => {
    // 模拟拍照
    setCapturedImage('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800')
    setStep('processing')
    
    // 模拟AI识别过程
    setTimeout(() => {
      // 模拟识别结果
      setRecognizedStudents([
        {
          id: '1',
          name: '朵朵',
          avatar: '/images/avatars/child-duoduo.jpg',
          recognized: true,
          attendance: 'present',
        },
        {
          id: '4',
          name: '豆豆',
          avatar: '/images/avatars/child-doudou.jpg',
          recognized: true,
          attendance: 'present',
        },
        {
          id: '2',
          name: '小明',
          avatar: '/images/avatars/child-xiaoming.jpg',
          recognized: false,
          attendance: 'absent',
        },
      ])
      setStep('result')
    }, 2500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
        setStep('processing')
        
        // 模拟AI识别
        setTimeout(() => {
          setRecognizedStudents([
            {
              id: '1',
              name: '朵朵',
              avatar: '/images/avatars/child-duoduo.jpg',
              recognized: true,
              attendance: 'present',
            },
            {
              id: '4',
              name: '豆豆',
              avatar: '/images/avatars/child-doudou.jpg',
              recognized: true,
              attendance: 'present',
            },
          ])
          setStep('result')
        }, 2500)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleAttendance = (studentId: string) => {
    setRecognizedStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, attendance: s.attendance === 'present' ? 'absent' : 'present' }
        : s
    ))
  }

  const handleConfirmAttendance = () => {
    // 模拟提交考勤
    alert('考勤已提交，已自动为到课学员销课')
    router.push('/institution')
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 pb-3 flex items-center gap-3">
        <button 
          onClick={() => {
            if (step === 'select') {
              router.back()
            } else if (step === 'capture') {
              setStep('select')
              setSelectedClass(null)
            } else {
              setStep('capture')
              setCapturedImage(null)
            }
          }}
          className="p-2 -ml-2 hover:bg-muted rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {step === 'select' && '拍照点名'}
          {step === 'capture' && '拍摄课堂'}
          {step === 'processing' && 'AI识别中'}
          {step === 'result' && '确认考勤'}
        </h1>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Step 1: Select Class */}
        {step === 'select' && (
          <div className="px-4 space-y-4">
            <div className="p-4 bg-secondary/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="font-medium text-secondary">AI智能点名</span>
              </div>
              <p className="text-sm text-muted-foreground">
                拍摄课堂照片，AI自动识别学员人脸，一键完成考勤和销课
              </p>
            </div>

            <h2 className="font-medium text-muted-foreground">选择课程</h2>
            
            <div className="space-y-3">
              {todayScheduleB.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectClass(item)}
                  className="w-full p-4 bg-muted/30 rounded-xl text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.className}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.time} | {item.classroom}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{item.student}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Capture Photo */}
        {step === 'capture' && selectedClass && (
          <div className="px-4 space-y-4">
            <div className="text-center py-2">
              <p className="font-medium">{selectedClass.className}</p>
              <p className="text-sm text-muted-foreground">{selectedClass.time}</p>
            </div>

            {/* Camera Preview Area */}
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">请拍摄课堂照片</p>
                <p className="text-xs text-muted-foreground mt-1">确保学员面部清晰可见</p>
              </div>
              
              {/* Corner guides */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />
            </div>

            {/* Capture Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                从相册选择
              </button>
              <button
                onClick={handleCapture}
                className="flex-1 py-3 institution-btn-primary rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                立即拍照
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <p className="text-center text-xs text-muted-foreground">
              照片仅用于考勤识别，不会被保存或分享
            </p>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="px-4 flex flex-col items-center justify-center min-h-[60vh]">
            {capturedImage && (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-6">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              </div>
            )}
            <p className="text-lg font-medium">AI正在识别学员...</p>
            <p className="text-sm text-muted-foreground mt-2">请稍候，这需要几秒钟</p>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && (
          <div className="px-4 space-y-4">
            {/* Captured Image */}
            {capturedImage && (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={() => {
                    setStep('capture')
                    setCapturedImage(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg"
                >
                  <RefreshCcw className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Recognition Summary */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700">
                  识别完成，发现 {recognizedStudents.filter(s => s.recognized).length} 位学员
                </span>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              <h3 className="font-medium text-muted-foreground">考勤确认</h3>
              {recognizedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                >
                  <div className="relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full bg-muted"
                    />
                    {student.recognized && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.recognized ? 'AI识别成功' : '未在照片中识别到'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      student.attendance === 'present'
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {student.attendance === 'present' ? '到课' : '缺勤'}
                  </button>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmAttendance}
              className="w-full py-4 institution-btn-primary rounded-xl font-medium"
            >
              确认并自动销课
            </button>

            <p className="text-center text-xs text-muted-foreground">
              确认后将自动为到课学员扣减课时
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
