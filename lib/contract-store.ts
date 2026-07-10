'use client'

import { useEffect, useState } from 'react'
import { institutionInfo } from '@/lib/mock-data'
import type { InstitutionVerification } from '@/lib/institution-profile-store'

const storageKey = 'kxb-contracts-v1'

export { contractEffectNotice } from '@/lib/contract-template'

export type ContractType = 'paper' | 'template'
export type ContractStatus = 'paper_uploaded' | 'pending' | 'signed' | 'sealed'

export type TemplateContractFields = {
  courseName: string
  packageName: string
  hours: string
  amount: string
  servicePeriod: string
  extraTerms: string
  signatoryName?: string
  signatoryPhone?: string
}

export type ContractPartyVerification = Exclude<InstitutionVerification, { status: 'unverified' }>

type ContractBase = {
  id: string
  type: ContractType
  title: string
  institutionName: string
  studentId: string
  studentName: string
  parentName: string
  createdAt: string
  status: ContractStatus
  updatedAt?: string
  archivedAt?: string
}

export type PaperContract = ContractBase & {
  type: 'paper'
  status: 'paper_uploaded'
  photos: string[]
}

export type TemplateContract = ContractBase & {
  type: 'template'
  status: 'pending' | 'signed' | 'sealed'
  templateFields: TemplateContractFields
  partyVerification?: ContractPartyVerification
  generatedAt: string
  signedAt?: string
  sealedPhoto?: string
}

export type ContractRecord = PaperContract | TemplateContract

export type NewPaperContractInput = {
  title: string
  studentId: string
  studentName: string
  parentName: string
  photo: string
}

export type NewTemplateContractInput = {
  title: string
  institutionName: string
  studentId: string
  studentName: string
  parentName: string
  fields: TemplateContractFields
  partyVerification: ContractPartyVerification
}

export type UpdatePaperContractInput = Omit<NewPaperContractInput, 'photo'> & {
  id: string
}

export type UpdateTemplateContractInput = NewTemplateContractInput & {
  id: string
}

export const paperPhotoMock =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <rect width="900" height="1200" fill="#f6f2e9"/>
    <rect x="90" y="80" width="720" height="1040" rx="18" fill="#fffdf8" stroke="#d6c5ad" stroke-width="8"/>
    <text x="450" y="170" text-anchor="middle" font-size="54" font-weight="700" fill="#1f2937">课程服务合同</text>
    <line x1="160" y1="230" x2="740" y2="230" stroke="#d6c5ad" stroke-width="4"/>
    <text x="160" y="310" font-size="34" fill="#374151">甲方：七彩培训中心</text>
    <text x="160" y="380" font-size="34" fill="#374151">乙方：王女士</text>
    <text x="160" y="450" font-size="34" fill="#374151">学员：朵朵</text>
    <text x="160" y="540" font-size="30" fill="#4b5563">本合同为线下纸质合同拍照上传件。</text>
    <text x="160" y="600" font-size="30" fill="#4b5563">请以机构留存原件为准。</text>
    <line x1="160" y1="860" x2="740" y2="860" stroke="#e5d9c8" stroke-width="3"/>
    <text x="160" y="930" font-size="30" fill="#4b5563">机构盖章：</text>
    <circle cx="640" cy="910" r="88" fill="none" stroke="#f87171" stroke-width="10" opacity="0.65"/>
    <text x="640" y="922" text-anchor="middle" font-size="26" font-weight="700" fill="#ef4444" opacity="0.72">七彩培训</text>
  </svg>`)

export const sealedPhotoMock =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <rect width="900" height="1200" fill="#f4f4f5"/>
    <rect x="86" y="72" width="728" height="1056" rx="16" fill="#fff" stroke="#d4d4d8" stroke-width="8"/>
    <text x="450" y="165" text-anchor="middle" font-size="52" font-weight="700" fill="#111827">盖章合同回传件</text>
    <text x="150" y="270" font-size="32" fill="#374151">甲方：七彩培训中心</text>
    <text x="150" y="340" font-size="32" fill="#374151">乙方：家长</text>
    <text x="150" y="430" font-size="30" fill="#4b5563">本页为机构打印、盖章后拍照回传示意。</text>
    <circle cx="610" cy="820" r="120" fill="none" stroke="#ef4444" stroke-width="12"/>
    <text x="610" y="832" text-anchor="middle" font-size="32" font-weight="700" fill="#ef4444">机构盖章</text>
  </svg>`)

export const defaultContracts: ContractRecord[] = [
  {
    id: 'paper-1',
    type: 'paper',
    title: '钢琴启蒙线下纸质合同',
    institutionName: institutionInfo.name,
    studentId: '1',
    studentName: '朵朵',
    parentName: '王女士',
    createdAt: '2026-03-18',
    status: 'paper_uploaded',
    photos: [paperPhotoMock],
  },
  {
    id: 'template-1',
    type: 'template',
    title: '钢琴启蒙课程服务协议',
    institutionName: institutionInfo.name,
    studentId: '1',
    studentName: '朵朵',
    parentName: '王女士',
    createdAt: '2026-07-01',
    generatedAt: '2026-07-01',
    signedAt: '2026-07-02 10:24',
    status: 'signed',
    partyVerification: {
      status: 'verified',
      type: 'company',
      verifiedAt: '2026-06-30 09:00',
      licenseName: '杭州七彩艺术培训有限公司',
      unifiedSocialCreditCode: '91330106MA2KXB001A',
      legalRepresentative: '李道一',
      phone: '13888888888',
      signatoryName: '李道一',
      signatoryPhone: '13888888888',
    },
    templateFields: {
      courseName: '钢琴启蒙',
      packageName: '48课时课包',
      hours: '48',
      amount: '8640',
      servicePeriod: '2026-07-01 至 2027-06-30',
      extraTerms: '如遇法定节假日或机构统一调课，以双方沟通后的排课为准。',
    },
  },
  {
    id: 'template-2',
    type: 'template',
    title: '少儿编程续费确认单',
    institutionName: '酷码编程',
    studentId: '2',
    studentName: '小明',
    parentName: '李先生',
    createdAt: '2026-07-04',
    generatedAt: '2026-07-04',
    status: 'pending',
    partyVerification: {
      status: 'verified',
      type: 'company',
      verifiedAt: '2026-07-03 14:30',
      licenseName: '杭州酷码教育科技有限公司',
      unifiedSocialCreditCode: '91330106MA2KXB002B',
      legalRepresentative: '陈明',
      phone: '13966666666',
      signatoryName: '王老师',
      signatoryPhone: '13955555555',
    },
    templateFields: {
      courseName: '少儿编程',
      packageName: '24课时续费包',
      hours: '24',
      amount: '5280',
      servicePeriod: '2026-07-10 至 2027-01-10',
      extraTerms: '续费课时有效期内使用，未消耗课时可按机构规则顺延一次。',
    },
  },
]

function readContracts() {
  if (typeof window === 'undefined') return defaultContracts

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return defaultContracts
    return JSON.parse(raw) as ContractRecord[]
  } catch {
    return defaultContracts
  }
}

function todayText() {
  return new Date().toISOString().slice(0, 10)
}

function nowText() {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export function useContractStore() {
  const [contracts, setContracts] = useState<ContractRecord[]>(defaultContracts)

  useEffect(() => {
    setContracts(readContracts())
  }, [])

  const commit = (next: ContractRecord[]) => {
    setContracts(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('kxb-contracts-updated', { detail: next }))
  }

  const addPaperContract = (input: NewPaperContractInput) => {
    const nextContract: PaperContract = {
      id: `paper-${Date.now()}`,
      type: 'paper',
      title: input.title,
      institutionName: institutionInfo.name,
      studentId: input.studentId,
      studentName: input.studentName,
      parentName: input.parentName,
      createdAt: todayText(),
      status: 'paper_uploaded',
      photos: [input.photo],
    }
    commit([nextContract, ...contracts])
  }

  const addTemplateContract = (input: NewTemplateContractInput) => {
    const nextContract: TemplateContract = {
      id: `template-${Date.now()}`,
      type: 'template',
      title: input.title,
      institutionName: input.institutionName,
      studentId: input.studentId,
      studentName: input.studentName,
      parentName: input.parentName,
      createdAt: todayText(),
      generatedAt: todayText(),
      status: 'pending',
      templateFields: input.fields,
      partyVerification: input.partyVerification,
    }
    commit([nextContract, ...contracts])
  }

  const updatePaperContract = (input: UpdatePaperContractInput) => {
    commit(contracts.map(contract => {
      if (contract.id !== input.id || contract.type !== 'paper') return contract
      return {
        ...contract,
        title: input.title,
        studentId: input.studentId,
        studentName: input.studentName,
        parentName: input.parentName,
        updatedAt: nowText(),
      }
    }))
  }

  const updateTemplateContract = (input: UpdateTemplateContractInput) => {
    commit(contracts.map(contract => {
      if (contract.id !== input.id || contract.type !== 'template') return contract
      return {
        ...contract,
        title: input.title,
        studentId: input.studentId,
        studentName: input.studentName,
        parentName: input.parentName,
        status: 'pending',
        templateFields: input.fields,
        institutionName: input.institutionName,
        partyVerification: input.partyVerification,
        generatedAt: todayText(),
        updatedAt: nowText(),
        signedAt: undefined,
        sealedPhoto: undefined,
      }
    }))
  }

  const signContract = (id: string) => {
    commit(contracts.map(contract => {
      if (contract.id !== id || contract.type !== 'template' || contract.archivedAt) return contract
      return { ...contract, status: 'signed', signedAt: nowText() }
    }))
  }

  const uploadSealedPhoto = (id: string, sealedPhoto = sealedPhotoMock) => {
    commit(contracts.map(contract => {
      if (contract.id !== id || contract.type !== 'template' || contract.archivedAt) return contract
      return { ...contract, status: 'sealed', sealedPhoto }
    }))
  }

  const archiveContract = (id: string) => {
    commit(contracts.map(contract => (
      contract.id === id ? { ...contract, archivedAt: nowText(), updatedAt: nowText() } : contract
    )))
  }

  const deleteContract = (id: string) => {
    commit(contracts.filter(contract => !(contract.id === id && contract.type === 'template' && contract.status === 'pending')))
  }

  useEffect(() => {
    const handleStorage = () => setContracts(readContracts())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('kxb-contracts-updated', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('kxb-contracts-updated', handleStorage)
    }
  }, [])

  return {
    contracts,
    addPaperContract,
    addTemplateContract,
    updatePaperContract,
    updateTemplateContract,
    signContract,
    uploadSealedPhoto,
    archiveContract,
    deleteContract,
  }
}
