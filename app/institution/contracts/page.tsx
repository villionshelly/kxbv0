'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Archive,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  FileImage,
  FilePlus2,
  FileSignature,
  FileText,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { ContractTemplatePreview } from '@/components/contract-template-preview'
import { students } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  paperPhotoMock,
  sealedPhotoMock,
  type ContractRecord,
  type TemplateContract,
  useContractStore,
} from '@/lib/contract-store'
import { downloadTemplateContractDocx } from '@/lib/contract-docx'
import { type PurchaseRecord, useStudentPurchaseRecords } from '@/lib/purchase-record-store'
import { useInstitutionProfileSettings } from '@/lib/institution-profile-store'

type ComposerMode = 'paper' | 'template' | null

function getStatusText(contract: ContractRecord) {
  if (contract.archivedAt) return '已归档'
  if (contract.type === 'paper') return '纸质已上传'
  if (contract.status === 'pending') return '待家长签约'
  if (contract.status === 'sealed') return '已盖章回传'
  return '已签约'
}

function getStatusClass(contract: ContractRecord) {
  if (contract.archivedAt) return 'bg-slate-100 text-slate-500'
  if (contract.type === 'template' && contract.status === 'pending') return 'bg-amber-100 text-amber-700'
  if (contract.type === 'template' && contract.status === 'sealed') return 'bg-blue-100 text-blue-700'
  return 'bg-emerald-100 text-emerald-700'
}

export default function InstitutionContractsPage() {
  const router = useRouter()
  const { settings } = useInstitutionProfileSettings()
  const {
    contracts,
    addPaperContract,
    addTemplateContract,
    updatePaperContract,
    updateTemplateContract,
    uploadSealedPhoto,
    archiveContract,
    deleteContract,
  } = useContractStore()
  const [composerMode, setComposerMode] = useState<ComposerMode>(null)
  const [editingContract, setEditingContract] = useState<ContractRecord | null>(null)
  const [activeTemplateContract, setActiveTemplateContract] = useState<TemplateContract | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [paperTitle, setPaperTitle] = useState('线下纸质合同')
  const [templateTitle, setTemplateTitle] = useState('课程服务协议')
  const [studentId, setStudentId] = useState(students[1]?.id || students[0]?.id || '')
  const [studentQuery, setStudentQuery] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [selectedPurchaseRecordId, setSelectedPurchaseRecordId] = useState('')
  const [manualEntry, setManualEntry] = useState(false)
  const [formError, setFormError] = useState('')
  const [showVerificationGate, setShowVerificationGate] = useState(false)
  const [courseName, setCourseName] = useState('钢琴启蒙')
  const [packageName, setPackageName] = useState('48课时课包')
  const [hours, setHours] = useState('48')
  const [amount, setAmount] = useState('8640')
  const [servicePeriod, setServicePeriod] = useState('2026-07-01 至 2027-06-30')
  const [extraTerms, setExtraTerms] = useState('如遇法定节假日或机构统一调课，以双方沟通后的排课为准。')
  const selectedStudent = useMemo(
    () => students.find(student => student.id === studentId) || students[0],
    [studentId]
  )
  const { records: selectedStudentPurchaseRecords } = useStudentPurchaseRecords(studentId)
  const selectedPurchaseRecord = useMemo(
    () => selectedStudentPurchaseRecords.find(record => record.id === selectedPurchaseRecordId) || null,
    [selectedPurchaseRecordId, selectedStudentPurchaseRecords]
  )
  const studentOptions = useMemo(() => {
    const keyword = studentQuery.trim().toLowerCase()
    if (!keyword) return students
    return students.filter(student => (
      student.name.toLowerCase().includes(keyword) ||
      student.parentName.toLowerCase().includes(keyword) ||
      student.courses.join(' ').toLowerCase().includes(keyword)
    ))
  }, [studentQuery])
  const templatePreviewContract = useMemo<TemplateContract | null>(() => {
    if (!selectedStudent) return null

    return {
      id: 'template-preview',
      type: 'template',
      title: templateTitle.trim() || `${courseName}课程服务协议`,
      institutionName: settings.institutionName,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentName: selectedStudent.parentName,
      createdAt: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
      partyVerification: settings.verification.status === 'verified'
        ? settings.verification
        : undefined,
      templateFields: {
        courseName: courseName.trim(),
        packageName: packageName.trim(),
        hours: hours.trim(),
        amount: amount.trim(),
        servicePeriod: servicePeriod.trim(),
        extraTerms: extraTerms.trim(),
      },
    }
  }, [amount, courseName, extraTerms, hours, packageName, selectedStudent, servicePeriod, settings.institutionName, settings.verification, templateTitle])
  const filteredContracts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) return contracts

    return contracts.filter(contract => {
      const fields = [
        contract.title,
        contract.studentName,
        contract.parentName,
        contract.institutionName,
        contract.type === 'paper' ? '纸质合同' : '电子合同',
        getStatusText(contract),
        contract.type === 'template' ? contract.templateFields.courseName : '',
        contract.type === 'template' ? contract.templateFields.packageName : '',
      ]
      return fields.some(field => field.toLowerCase().includes(keyword))
    })
  }, [contracts, searchQuery])
  const pendingCount = contracts.filter(contract => !contract.archivedAt && contract.type === 'template' && contract.status === 'pending').length

  const closeComposer = () => {
    setComposerMode(null)
    setEditingContract(null)
    setShowStudentDropdown(false)
    setSelectedPurchaseRecordId('')
    setManualEntry(false)
    setFormError('')
  }

  const selectStudent = (id: string) => {
    const nextStudent = students.find(student => student.id === id)
    if (!nextStudent) return
    setStudentId(nextStudent.id)
    setStudentQuery(`${nextStudent.name} · ${nextStudent.parentName}`)
    setSelectedPurchaseRecordId('')
    setShowStudentDropdown(false)
    if (composerMode === 'template') {
      setManualEntry(true)
      setCourseName('')
      setPackageName('')
      setHours('')
      setAmount('')
      setServicePeriod('')
      setTemplateTitle('课程服务协议')
      setFormError('')
    }
  }

  const applyPurchaseRecord = (record: PurchaseRecord) => {
    setSelectedPurchaseRecordId(record.id)
    setManualEntry(false)
    setFormError('')
    setCourseName(record.courseName)
    setPackageName(record.packageName)
    setHours(String(record.totalClasses))
    setAmount(String(record.amount))
    setServicePeriod(record.validPeriod)
    if (!templateTitle.trim() || templateTitle === '课程服务协议') {
      setTemplateTitle(`${record.courseName}课程服务协议`)
    }
  }

  const openCreateComposer = (mode: Exclude<ComposerMode, null>) => {
    if (mode === 'template' && settings.verification.status !== 'verified') {
      setShowVerificationGate(true)
      return
    }
    setEditingContract(null)
    setComposerMode(mode)
    if (selectedStudent) {
      setStudentQuery(`${selectedStudent.name} · ${selectedStudent.parentName}`)
    }
  }

  const openEditContract = (contract: ContractRecord) => {
    if (contract.type === 'template' && settings.verification.status !== 'verified') {
      setShowVerificationGate(true)
      return
    }
    setEditingContract(contract)
    setComposerMode(contract.type)
    setStudentId(contract.studentId)
    setStudentQuery(`${contract.studentName} · ${contract.parentName}`)
    if (contract.type === 'paper') {
      setPaperTitle(contract.title)
      return
    }

    setTemplateTitle(contract.title)
    setManualEntry(true)
    setCourseName(contract.templateFields.courseName)
    setPackageName(contract.templateFields.packageName)
    setHours(contract.templateFields.hours)
    setAmount(contract.templateFields.amount)
    setServicePeriod(contract.templateFields.servicePeriod)
    setExtraTerms(contract.templateFields.extraTerms)
  }

  const submitPaperContract = () => {
    if (!selectedStudent) return
    if (editingContract?.type === 'paper') {
      updatePaperContract({
        id: editingContract.id,
        title: paperTitle.trim() || `${selectedStudent.name}纸质合同`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        parentName: selectedStudent.parentName,
      })
      closeComposer()
      return
    }

    addPaperContract({
      title: paperTitle.trim() || `${selectedStudent.name}纸质合同`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentName: selectedStudent.parentName,
      photo: paperPhotoMock,
    })
    closeComposer()
  }

  const submitTemplateContract = () => {
    if (!selectedStudent) return
    if (settings.verification.status !== 'verified') {
      setShowVerificationGate(true)
      return
    }
    if (!courseName.trim() || !packageName.trim() || !hours.trim() || !amount.trim() || !servicePeriod.trim()) {
      setFormError('请完整填写课程名称、课包、课时、金额和服务周期后再发起合同。')
      return
    }
    const nextTitle = templateTitle.trim() || `${courseName}课程服务协议`
    const nextFields = {
      courseName: courseName.trim(),
      packageName: packageName.trim(),
      hours: hours.trim(),
      amount: amount.trim(),
      servicePeriod: servicePeriod.trim(),
      extraTerms: extraTerms.trim(),
    }

    if (editingContract?.type === 'template') {
      updateTemplateContract({
        id: editingContract.id,
        title: nextTitle,
        institutionName: settings.institutionName,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        parentName: selectedStudent.parentName,
        fields: nextFields,
        partyVerification: settings.verification,
      })
      closeComposer()
      return
    }

    addTemplateContract({
      title: nextTitle,
      institutionName: settings.institutionName,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentName: selectedStudent.parentName,
      fields: nextFields,
      partyVerification: settings.verification,
    })
    closeComposer()
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className="scrollbar-quiet flex-1 overflow-auto px-4 pb-8 pt-3">
        <section className="relative overflow-hidden rounded-[28px] bg-card p-4 card-dream">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/70" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileSignature className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">合同管理</p>
              <p className="text-2xl font-bold text-foreground">{contracts.length} 份</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-2 text-center">
              <p className="text-base font-bold text-amber-600">{pendingCount}</p>
              <p className="text-[10px] text-muted-foreground">待签约</p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={() => router.push('/institution/profile/institution-info/verification')}
          className={cn(
            'mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left',
            settings.verification.status === 'verified'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          )}
        >
          {settings.verification.status === 'verified'
            ? <BadgeCheck className="h-5 w-5 shrink-0" />
            : <ShieldCheck className="h-5 w-5 shrink-0" />}
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold">
              {settings.verification.status === 'verified'
                ? settings.verification.type === 'personal' ? '个人主体已认证' : '企业主体已认证'
                : '机构主体未实名认证'}
            </span>
            <span className="mt-0.5 block truncate text-[10px] opacity-80">
              {settings.verification.status === 'verified'
                ? settings.verification.type === 'personal'
                  ? settings.verification.realName
                  : settings.verification.licenseName
                : '完成认证后才可发起模板合同'}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>

        <section className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openCreateComposer('paper')}
            className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-card p-3 text-left card-dream"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UploadCloud className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">上传纸质合同</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">拍照上传</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => openCreateComposer('template')}
            className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-card p-3 text-left card-dream"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-primary">
              <FilePlus2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">发起模板合同</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">生成待签约</span>
            </span>
          </button>
        </section>

        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">合同列表</h2>
            <span className="text-xs text-muted-foreground">搜索 / 修改 / 归档</span>
          </div>

          <div className="mb-3 flex h-11 items-center gap-2 rounded-2xl bg-card px-3 ring-1 ring-border/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索合同、学员、家长、课程"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-muted-foreground">
                清空
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredContracts.map(contract => {
              const isTemplate = contract.type === 'template'
              const templateContract = isTemplate ? contract as TemplateContract : null
              const Icon = contract.type === 'paper' ? FileImage : contract.status === 'pending' ? Clock3 : CheckCircle2

              return (
                <article key={contract.id} className="rounded-3xl bg-card p-4 card-dream">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', contract.type === 'paper' ? 'bg-blue-100 text-blue-600' : contract.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold">{contract.title}</h3>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', getStatusClass(contract))}>
                          {getStatusText(contract)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {contract.type === 'paper' ? '纸质合同' : '电子合同'} · {contract.studentName} · {contract.parentName}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {contract.archivedAt ? `归档时间：${contract.archivedAt}` : `发起时间：${contract.createdAt}`}
                        {contract.updatedAt ? ` · 最近修改：${contract.updatedAt}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {!contract.archivedAt && (
                      <button
                        type="button"
                        onClick={() => openEditContract(contract)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-foreground ring-1 ring-border"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        修改
                      </button>
                    )}
                    {isTemplate && templateContract && (
                      <button
                        type="button"
                        onClick={() => setActiveTemplateContract(templateContract)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-foreground ring-1 ring-border"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        查看合同
                      </button>
                    )}
                    {isTemplate && templateContract && (
                      <button
                        type="button"
                        onClick={() => downloadTemplateContractDocx(templateContract)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        下载DOCX
                      </button>
                    )}
                    {isTemplate && templateContract && templateContract.status !== 'sealed' && !templateContract.archivedAt && (
                      <button
                        type="button"
                        onClick={() => uploadSealedPhoto(templateContract.id, sealedPhotoMock)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-orange-50 px-3 text-xs font-semibold text-primary"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        上传盖章回传
                      </button>
                    )}
                    {contract.type === 'paper' && (
                      <a
                        href={contract.photos[0]}
                        download={`${contract.studentName}-${contract.title}.png`}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-xs font-semibold text-blue-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        下载照片
                      </a>
                    )}
                    {!contract.archivedAt && (
                      <button
                        type="button"
                        onClick={() => archiveContract(contract.id)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-slate-50 px-3 text-xs font-semibold text-slate-600"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        归档
                      </button>
                    )}
                    {isTemplate && templateContract && templateContract.status === 'pending' && !templateContract.archivedAt && (
                      <button
                        type="button"
                        onClick={() => deleteContract(templateContract.id)}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-red-50 px-3 text-xs font-semibold text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
            {filteredContracts.length === 0 && (
              <div className="rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground">
                没有找到匹配的合同
              </div>
            )}
          </div>
        </section>
      </main>

      {composerMode && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40">
          <div className="max-h-[90vh] w-full overflow-auto rounded-t-[26px] bg-background px-4 pb-8 pt-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingContract
                  ? composerMode === 'paper' ? '修改纸质合同' : '修改模板合同'
                  : composerMode === 'paper' ? '上传纸质合同' : '发起模板合同'}
              </h2>
              <button type="button" onClick={closeComposer} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">学员</span>
                <div className="flex h-11 items-center gap-2 rounded-xl bg-muted/35 px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={studentQuery}
                    onFocus={() => setShowStudentDropdown(true)}
                    onChange={(event) => {
                      setStudentQuery(event.target.value)
                      setShowStudentDropdown(true)
                    }}
                    placeholder="搜索学员或家长姓名"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                {showStudentDropdown && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-2xl border border-border bg-background p-1 shadow-xl">
                    {studentOptions.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => selectStudent(student.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/50',
                          student.id === studentId && 'bg-orange-50 text-primary'
                        )}
                      >
                        <span>
                          <span className="font-semibold">{student.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground">{student.parentName}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">{student.courses.join('、')}</span>
                      </button>
                    ))}
                    {studentOptions.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-muted-foreground">没有找到学员</p>
                    )}
                  </div>
                )}
              </div>

              {composerMode === 'paper' ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">合同标题</span>
                    <input value={paperTitle} onChange={(event) => setPaperTitle(event.target.value)} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                  </label>
                  <div className="rounded-2xl bg-muted/35 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">纸质合同照片 mock</p>
                    <img src={paperPhotoMock} alt="纸质合同照片" className="max-h-56 w-full rounded-xl object-cover ring-1 ring-border" />
                  </div>
                  <button type="button" onClick={submitPaperContract} className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                    {editingContract ? '保存修改' : '提交并同步给家长'}
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground">选择购买记录自动回填</p>
                      <span className="text-[10px] text-muted-foreground">进行中优先</span>
                    </div>
                    {selectedStudentPurchaseRecords.length > 0 ? (
                      <div className="space-y-2">
                        {selectedStudentPurchaseRecords.map(record => (
                          <button
                            key={record.id}
                            type="button"
                            onClick={() => applyPurchaseRecord(record)}
                            className={cn(
                              'w-full rounded-2xl border bg-white px-3 py-2 text-left text-xs transition',
                              selectedPurchaseRecord?.id === record.id ? 'border-primary ring-2 ring-primary/15' : 'border-border'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{record.packageName}</p>
                                <p className="mt-0.5 text-muted-foreground">{record.courseName} · {record.totalClasses}课时 · ￥{record.amount}</p>
                                <p className="mt-0.5 text-muted-foreground">有效期：{record.validPeriod}</p>
                              </div>
                              <span className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                record.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                record.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                                'bg-red-100 text-red-600'
                              )}>
                                {record.status === 'active' ? '进行中' : record.status === 'completed' ? '已完成' : '已退课'}
                              </span>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPurchaseRecordId('')
                            setManualEntry(true)
                            setFormError('')
                          }}
                          className={cn(
                            'flex h-10 w-full items-center justify-center rounded-xl border border-dashed text-xs font-semibold',
                            manualEntry
                              ? 'border-primary bg-orange-50 text-primary'
                              : 'border-border bg-white text-muted-foreground'
                          )}
                        >
                          不关联购买记录，手动填写
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="text-xs font-semibold text-foreground">该学员暂无购买记录</p>
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                              不影响创建合同，请在下方手动填写课程、课包、金额和服务周期。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-sm font-bold">合同字段</p>
                    <span className={cn(
                      'rounded-full px-2 py-1 text-[10px] font-semibold',
                      selectedPurchaseRecord ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-primary'
                    )}>
                      {selectedPurchaseRecord ? '购买记录已回填' : '机构手动填写'}
                    </span>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">合同标题</span>
                    <input value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">课程名称</span>
                    <input value={courseName} onChange={(event) => setCourseName(event.target.value)} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">课包</span>
                      <input value={packageName} onChange={(event) => setPackageName(event.target.value)} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">课时</span>
                      <input value={hours} onChange={(event) => setHours(event.target.value.replace(/\D/g, '').slice(0, 4))} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">金额</span>
                    <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, '').slice(0, 10))} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">服务周期</span>
                    <input value={servicePeriod} onChange={(event) => setServicePeriod(event.target.value)} className="h-11 w-full rounded-xl bg-muted/35 px-3 text-sm outline-none" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">补充约定</span>
                    <textarea value={extraTerms} onChange={(event) => setExtraTerms(event.target.value)} className="min-h-20 w-full rounded-xl bg-muted/35 px-3 py-2 text-sm outline-none" />
                  </label>
                  {formError && (
                    <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs leading-5 text-red-600">{formError}</p>
                  )}
                  {templatePreviewContract && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">合同正文预览</p>
                      <div className="max-h-[420px] overflow-auto rounded-2xl">
                        <ContractTemplatePreview contract={templatePreviewContract} dense />
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={submitTemplateContract} className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                    {editingContract ? '保存并重新发起签约' : '确认发起签约'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTemplateContract && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/40">
          <div className="max-h-[90vh] w-full overflow-auto rounded-t-[26px] bg-background px-4 pb-8 pt-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary">系统模板电子合同</p>
                <h2 className="mt-1 text-lg font-bold">合同正文</h2>
              </div>
              <button type="button" onClick={() => setActiveTemplateContract(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted" aria-label="关闭">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ContractTemplatePreview contract={activeTemplateContract} />
          </div>
        </div>
      )}

      {showVerificationGate && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-5">
          <div className="w-full max-w-sm rounded-3xl bg-background p-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-center text-lg font-bold">请先完成机构实名认证</h2>
            <p className="mt-2 text-center text-sm leading-6 text-muted-foreground">
              模板合同需要明确真实签约主体。个人实名认证或企业实名认证通过后，才可以发起及重新发起合同。
            </p>
            <button
              type="button"
              onClick={() => router.push('/institution/profile/institution-info/verification')}
              className="mt-5 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              前往实名认证
            </button>
            <button
              type="button"
              onClick={() => setShowVerificationGate(false)}
              className="mt-2 h-11 w-full text-sm font-medium text-muted-foreground"
            >
              暂不认证
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
