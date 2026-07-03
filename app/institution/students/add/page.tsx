'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, QrCode, Link2, CheckCircle, ChevronDown, Plus } from 'lucide-react'
import { classes } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const coursePackages = [
  { id: 'p1', name: '钢琴启蒙', classes: 48, price: 7200 },
  { id: 'p2', name: '钢琴进阶', classes: 48, price: 9600 },
  { id: 'p3', name: '乐理基础', classes: 24, price: 2880 },
  { id: 'p4', name: '小提琴入门', classes: 36, price: 7200 },
]

export default function AddStudentPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'manual' | 'qr' | 'link' | null>(null)
  const [step, setStep] = useState<'method' | 'basic' | 'class' | 'course' | 'done'>('method')

  // Form fields
  const [name, setName] = useState('')
  const [parentName, setParentName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [birthYear, setBirthYear] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('')
  const [customClasses, setCustomClasses] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  // 个性化调整
  const [usePersonalized, setUsePersonalized] = useState(false)
  const [personalizedClasses, setPersonalizedClasses] = useState('')
  const [personalizedPrice, setPersonalizedPrice] = useState('')
  // 旧学员转移
  const [isTransfer, setIsTransfer] = useState(false)
  const [alreadyUsedClasses, setAlreadyUsedClasses] = useState('')

  const canProceedBasic = name.trim() && parentName.trim() && phone.trim().length === 11

  const handleDone = () => {
    setStep('done')
    setTimeout(() => router.push('/institution/students'), 2000)
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center bg-background">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">学员已添加</h2>
        <p className="text-muted-foreground text-sm">
          {name} 已成功入班，入班通知已发送给 {parentName}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="safe-area-top px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => {
            if (step === 'method') router.back()
            else if (step === 'basic') setStep('method')
            else if (step === 'class') setStep('basic')
            else if (step === 'course') setStep('class')
          }}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">添加学员</h1>
        {step !== 'method' && (
          <div className="ml-auto flex items-center gap-1">
            {(['basic', 'class', 'course'] as const).map((s, i) => (
              <div key={s} className={cn(
                'h-1 rounded-full transition-all',
                step === s ? 'w-5 bg-primary' :
                  ['basic', 'class', 'course'].indexOf(step) > i ? 'w-3 bg-primary/50' : 'w-3 bg-muted'
              )} />
            ))}
          </div>
        )}
      </div>

      {/* Step: Method */}
      {step === 'method' && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <p className="text-sm text-muted-foreground mb-5">选择添加方式</p>
          <div className="space-y-3">
            <button
              onClick={() => { setMethod('manual'); setStep('basic') }}
              className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">手动录入</p>
                <p className="text-xs text-muted-foreground mt-0.5">填写学员和家长基本信息</p>
              </div>
            </button>
            <button
              onClick={() => { setMethod('qr'); setStep('basic') }}
              className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-medium">扫码入班</p>
                <p className="text-xs text-muted-foreground mt-0.5">家长扫码自动填写信息</p>
              </div>
            </button>
            <button
              onClick={() => { setMethod('link'); setStep('basic') }}
              className="w-full flex items-center gap-4 p-4 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Link2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">发送链接</p>
                <p className="text-xs text-muted-foreground mt-0.5">发送入班链接给家长填写</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step: Basic Info */}
      {step === 'basic' && (
        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
          <p className="text-sm font-medium text-muted-foreground">学员信息</p>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">学员姓名 *</label>
            <input
              type="text"
              placeholder="请输入学员姓名"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">性别</label>
            <div className="flex gap-3">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    'flex-1 h-11 rounded-xl text-sm font-medium transition-colors',
                    gender === g ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'
                  )}
                >
                  {g === 'male' ? '男' : '女'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">出生年份（选填）</label>
            <input
              type="number"
              placeholder="如：2018"
              value={birthYear}
              onChange={e => setBirthYear(e.target.value)}
              className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">家长信息</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">家长姓名 *</label>
                <input
                  type="text"
                  placeholder="请输入家长姓名"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">手机号码 *</label>
                <input
                  type="tel"
                  placeholder="请输入11位手机号"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={11}
                  className="w-full h-11 px-4 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step: Select Class */}
      {step === 'class' && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <p className="text-sm text-muted-foreground mb-4">选择要加入的班级（可跳过，稍后再分配）</p>
          <div className="space-y-3 mb-4">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(selectedClass === cls.id ? '' : cls.id)}
                className={cn(
                  'w-full p-4 rounded-2xl text-left transition-all border-2',
                  selectedClass === cls.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/30 hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cls.course} · {cls.teacher}</p>
                    <p className="text-xs text-muted-foreground">{cls.schedule}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs',
                      cls.type === '1对1' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    )}>
                      {cls.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{cls.studentCount}/{cls.maxStudents}人</span>
                  </div>
                </div>
                {selectedClass === cls.id && (
                  <div className="mt-2 flex items-center gap-1 text-primary text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    已选择
                  </div>
                )}
              </button>
            ))}
            <button
              onClick={() => router.push('/institution/schedule?create=1')}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:bg-muted/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">新建班级课表</span>
            </button>
          </div>
        </div>
      )}

      {/* Step: Course Package */}
      {step === 'course' && (
        <div className="flex-1 overflow-auto px-4 py-4">
          <p className="text-sm text-muted-foreground mb-4">登记购买的课时包（可跳过，稍后再添加）</p>
          
          {/* 旧学员转移开关 */}
          <div className="mb-4 p-3 bg-amber-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransfer}
                onChange={e => setIsTransfer(e.target.checked)}
                className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-amber-800">旧学员转移</span>
                <p className="text-xs text-amber-600 mt-0.5">从其他系统转移过来的学员，需录入已上课时</p>
              </div>
            </label>
          </div>

          <div className="space-y-3 mb-4">
            {coursePackages.map(pkg => {
              const isSelected = selectedPackage === pkg.id
              const unitPrice = Math.round(pkg.price / pkg.classes)
              return (
                <div key={pkg.id}>
                  <button
                    onClick={() => {
                      setSelectedPackage(isSelected ? '' : pkg.id)
                      setUseCustom(false)
                      if (!isSelected) {
                        setPersonalizedClasses(String(pkg.classes))
                        setPersonalizedPrice(String(pkg.price))
                      }
                    }}
                    className={cn(
                      'w-full p-4 rounded-2xl text-left transition-all border-2',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          标准：{pkg.classes}课时 · ¥{unitPrice}/课时
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">¥{pkg.price.toLocaleString()}</p>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* 个性化调整区域 */}
                  {isSelected && (
                    <div className="mt-2 ml-2 p-3 bg-blue-50 rounded-xl space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePersonalized}
                          onChange={e => setUsePersonalized(e.target.checked)}
                          className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-800">个性化调整此学员的课时/金额</span>
                      </label>

                      {usePersonalized && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-blue-600 block mb-1">实际收费</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                              <input
                                type="number"
                                placeholder={String(pkg.price)}
                                value={personalizedPrice}
                                onChange={e => setPersonalizedPrice(e.target.value)}
                                className="w-full h-9 pl-6 pr-3 bg-white rounded-lg text-sm outline-none border border-blue-200 focus:border-blue-400"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-blue-600 block mb-1">购买课时</label>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder={String(pkg.classes)}
                                value={personalizedClasses}
                                onChange={e => setPersonalizedClasses(e.target.value)}
                                className="w-full h-9 px-3 pr-8 bg-white rounded-lg text-sm outline-none border border-blue-200 focus:border-blue-400"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 旧学员已上课时 */}
                      {isTransfer && (
                        <div>
                          <label className="text-xs text-amber-600 block mb-1">已上课时数（转移）</label>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="已经消耗的课时"
                              value={alreadyUsedClasses}
                              onChange={e => setAlreadyUsedClasses(e.target.value)}
                              className="w-full h-9 px-3 pr-8 bg-white rounded-lg text-sm outline-none border border-amber-200 focus:border-amber-400"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            剩余课时 = {personalizedClasses || pkg.classes} - {alreadyUsedClasses || 0} = {(Number(personalizedClasses) || pkg.classes) - (Number(alreadyUsedClasses) || 0)} 节
                          </p>
                        </div>
                      )}

                      {/* 计算结果 */}
                      {usePersonalized && personalizedPrice && personalizedClasses && (
                        <div className="p-2 bg-white rounded-lg">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">计算单价</span>
                            <span className="font-medium text-blue-600">
                              ¥{Math.round(Number(personalizedPrice) / Number(personalizedClasses))}/课时
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Custom */}
            <button
              onClick={() => { setUseCustom(!useCustom); setSelectedPackage('') }}
              className={cn(
                'w-full p-4 rounded-2xl text-left transition-all border-2',
                useCustom ? 'border-primary bg-primary/5' : 'border-dashed border-border hover:bg-muted/20'
              )}
            >
              <p className="text-sm font-medium text-muted-foreground">完全自定义课时包</p>
            </button>
            {useCustom && (
              <div className="space-y-3 px-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">总价</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">¥</span>
                      <input
                        type="number"
                        placeholder="7200"
                        value={customPrice}
                        onChange={e => setCustomPrice(e.target.value)}
                        className="w-full h-10 pl-6 pr-3 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">课时数</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="48"
                        value={customClasses}
                        onChange={e => setCustomClasses(e.target.value)}
                        className="w-full h-10 px-3 pr-8 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                    </div>
                  </div>
                </div>
                {/* 旧学员已上课时 */}
                {isTransfer && (
                  <div>
                    <label className="text-xs text-amber-600 block mb-1">已上课时数（转移）</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="已经消耗的课时"
                        value={alreadyUsedClasses}
                        onChange={e => setAlreadyUsedClasses(e.target.value)}
                        className="w-full h-10 px-3 pr-8 bg-muted/40 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">节</span>
                    </div>
                    <p className="text-xs text-amber-500 mt-1">
                      剩余课时 = {customClasses || 0} - {alreadyUsedClasses || 0} = {(Number(customClasses) || 0) - (Number(alreadyUsedClasses) || 0)} 节
                    </p>
                  </div>
                )}
                {customPrice && customClasses && Number(customClasses) > 0 && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">计算单价</span>
                      <span className="font-medium text-green-600">
                        ¥{Math.round(Number(customPrice) / Number(customClasses))}/课时
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Button */}
      {step !== 'method' && (
        <div className="px-4 py-4 border-t border-border bg-background">
          {step === 'basic' && (
            <button
              onClick={() => setStep('class')}
              disabled={!canProceedBasic}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 transition-opacity"
            >
              下一步
            </button>
          )}
          {step === 'class' && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep('course')}
                className="flex-1 h-12 bg-muted text-muted-foreground rounded-xl font-medium text-sm"
              >
                跳过，稍后分配
              </button>
              <button
                onClick={() => setStep('course')}
                disabled={!selectedClass}
                className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40"
              >
                下一步
              </button>
            </div>
          )}
          {step === 'course' && (
            <div className="flex gap-3">
              <button
                onClick={handleDone}
                className="flex-1 h-12 bg-muted text-muted-foreground rounded-xl font-medium text-sm"
              >
                跳过
              </button>
              <button
                onClick={handleDone}
                className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                完成
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
