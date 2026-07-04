'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { students, courseCatalog } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function RenewPage() {
  const params = useParams()
  const router = useRouter()
  const student = students.find(s => s.id === params.id) || students[0]
  
  // Get available courses for this student's existing courses
  const studentCourses = courseCatalog.filter(c => 
    student.courses.some(sc => c.name.includes(sc.replace('班', '')))
  )
  // If no matching courses, show all courses
  const availableCourses = studentCourses.length > 0 ? studentCourses : courseCatalog

  const [selectedCourse, setSelectedCourse] = useState(availableCourses[0]?.id || '')
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const [customClasses, setCustomClasses] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const course = availableCourses.find(c => c.id === selectedCourse)
  const coursePrice = course?.price ?? 0
  
  // Package options based on selected course
  const packages = course ? [
    { id: '1', classes: 12, price: Math.round(coursePrice * 12 * 0.95), perClass: Math.round(coursePrice * 0.95), tag: '' },
    { id: '2', classes: 24, price: Math.round(coursePrice * 24 * 0.9), perClass: Math.round(coursePrice * 0.9), tag: '热门' },
    { id: '3', classes: 48, price: Math.round(coursePrice * 48 * 0.85), perClass: Math.round(coursePrice * 0.85), tag: '超值' },
    { id: 'custom', classes: 0, price: 0, perClass: 0, tag: '自定义' },
  ] : []

  const [selectedPackage, setSelectedPackage] = useState(packages[1]?.id || '2')

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      router.push(`/institution/students/${params.id}`)
    }, 1500)
  }

  const selected = packages.find(p => p.id === selectedPackage)
  const isCustom = selectedPackage === 'custom'
  const finalClasses = isCustom ? (Number(customClasses) || 0) : (selected?.classes || 0)
  const finalPrice = isCustom ? (Number(customPrice) || 0) : (selected?.price || 0)
  const finalPerClass = finalClasses > 0 ? Math.round(finalPrice / finalClasses) : 0

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">续费登记成功</h2>
          <p className="text-muted-foreground">课时已添加到学员账户</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">续费登记</h1>
      </div>

      <div className="p-4">
        {/* Student Info */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-muted/20 rounded-xl">
          <img 
            src={student.avatar} 
            alt={student.name}
            className="w-12 h-12 rounded-full bg-muted"
          />
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-muted-foreground">当前剩余 {student.remainingClasses} 课时</div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3">选择课程 *</h3>
          <div className="relative">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className="w-full h-12 px-4 bg-muted/40 rounded-xl text-sm text-left flex items-center justify-between"
            >
              <span className={course ? 'text-foreground' : 'text-muted-foreground'}>
                {course ? course.name : '请选择课程'}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showCourseDropdown && 'rotate-180')} />
            </button>
            {showCourseDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                {availableCourses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCourse(c.id); setShowCourseDropdown(false); setSelectedPackage('2') }}
                    className={cn(
                      'w-full px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors flex items-center justify-between',
                      selectedCourse === c.id && 'bg-secondary/10'
                    )}
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.category} · ¥{c.price}/课时</p>
                    </div>
                    {selectedCourse === c.id && <CheckCircle className="w-4 h-4 text-secondary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            只能选择已有课程，不支持自定义课程名称
          </p>
        </div>

        {/* Package Selection */}
        {course && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">选择课时包</h3>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`w-full p-4 rounded-xl text-left transition-colors relative ${
                    selectedPackage === pkg.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/20 border-2 border-transparent'
                  }`}
                >
                  {pkg.tag && pkg.tag !== '自定义' && (
                    <span className="absolute -top-2 right-4 px-2 py-0.5 institution-btn-primary text-xs rounded-full">
                      {pkg.tag}
                    </span>
                  )}
                  {pkg.id === 'custom' ? (
                    <div className="text-center py-1">
                      <span className="text-muted-foreground">自定义课时与金额</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{pkg.classes} 课时</div>
                        <div className="text-sm text-muted-foreground">约 ¥{pkg.perClass}/课时</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-primary">¥{pkg.price}</div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom input */}
            {isCustom && (
              <div className="mt-4 p-4 bg-muted/20 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">课时数量 *</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="如：30"
                        value={customClasses}
                        onChange={e => setCustomClasses(e.target.value)}
                        className="w-full h-11 px-4 pr-10 bg-background rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">收费金额 *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                      <input
                        type="number"
                        placeholder="如：2800"
                        value={customPrice}
                        onChange={e => setCustomPrice(e.target.value)}
                        className="w-full h-11 pl-7 pr-4 bg-background rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
                {customClasses && customPrice && Number(customClasses) > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">计算单价</span>
                      <span className="text-lg font-bold text-green-600">
                        ¥{Math.round(Number(customPrice) / Number(customClasses))}/课时
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {course && finalClasses > 0 && (
          <div className="bg-muted/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">所选课程</span>
              <span className="font-medium">{course.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">购买课时</span>
              <span className="font-medium">{finalClasses} 课时</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">单价</span>
              <span className="font-medium">¥{finalPerClass}/课时</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">续费后总课时</span>
              <span className="font-medium">{student.remainingClasses + finalClasses} 课时</span>
            </div>
            <div className="border-t pt-2 mt-2 flex items-center justify-between">
              <span className="font-medium">应收金额</span>
              <span className="font-bold text-xl text-primary">¥{finalPrice}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          className="w-full h-12 text-base"
          onClick={handleSubmit}
          disabled={!course || finalClasses === 0 || finalPrice === 0}
        >
          确认登记
        </Button>
      </div>
    </div>
  )
}
