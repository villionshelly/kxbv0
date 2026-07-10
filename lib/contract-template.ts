import type { ContractPartyVerification, TemplateContract } from '@/lib/contract-store'

export const contractEffectNotice = '合同为电子合同有同等效力，如需盖章合同，请联系机构出具。'

export type ContractLine = {
  label: string
  value: string
}

export type ContractTextRun = {
  text: string
  highlight?: boolean
}

export type ContractParagraph = ContractTextRun[]

export type ContractSection = {
  title: string
  paragraphs: ContractParagraph[]
}

export type ContractDocument = {
  title: string
  contractNo: string
  intro: string
  partyRows: ContractLine[]
  sections: ContractSection[]
  signatureRows: ContractLine[]
  signatureStatus: ContractLine
}

function compactDate(value: string) {
  return value.replace(/\D/g, '').slice(0, 8) || new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function contractSerial(id: string) {
  const source = id.replace(/\D/g, '')
  return (source || '000001').slice(-6).padStart(6, '0')
}

export function getTemplateContractNumber(contract: TemplateContract) {
  return `KXB-${compactDate(contract.generatedAt)}-${contractSerial(contract.id)}`
}

function run(text: string, highlight = false): ContractTextRun {
  return { text, highlight }
}

function resolvePartyVerification(contract: TemplateContract): ContractPartyVerification {
  return contract.partyVerification || {
    status: 'verified',
    type: 'company',
    verifiedAt: contract.generatedAt,
    licenseName: contract.institutionName,
    unifiedSocialCreditCode: '历史合同未记录',
    legalRepresentative: '李道一',
    phone: '0571-88888888',
    signatoryName: '李道一',
    signatoryPhone: '0571-88888888',
  }
}

export function buildTemplateContractDocument(contract: TemplateContract): ContractDocument {
  const fields = contract.templateFields
  const amount = fields.amount ? `人民币 ${fields.amount} 元` : '以双方确认金额为准'
  const hours = fields.hours ? `${fields.hours} 课时` : '以实际课包为准'
  const verification = resolvePartyVerification(contract)
  const isPersonal = verification.type === 'personal'
  const partyName = isPersonal ? verification.realName : verification.licenseName
  const defaultContactName = isPersonal ? verification.realName : verification.signatoryName
  const defaultContactPhone = isPersonal ? verification.phone : verification.signatoryPhone
  const contactName = fields.signatoryName?.trim() || defaultContactName
  const contactPhone = fields.signatoryPhone?.trim() || defaultContactPhone
  const partyRows: ContractLine[] = isPersonal
    ? [
        { label: '甲方（实名认证个人）', value: verification.realName },
        { label: '身份证号', value: verification.idNumber },
        { label: '签约联系人', value: `${contactName}（${contactPhone}）` },
      ]
    : [
        { label: '甲方（营业执照名称）', value: verification.licenseName },
        { label: '法定代表人', value: verification.legalRepresentative },
        { label: '签约联系人', value: `${contactName}（${contactPhone}）` },
      ]

  return {
    title: contract.title || '课程服务协议',
    contractNo: getTemplateContractNumber(contract),
    intro: `甲方已完成${isPersonal ? '个人实名认证' : '企业实名认证'}。甲乙双方基于平等、自愿、诚实信用原则，就甲方向乙方学员提供课程培训服务事宜，达成本协议。乙方通过家长端确认后，本协议即视为双方共同确认的课程服务约定。`,
    partyRows: [
      ...partyRows,
      { label: '乙方（家长/监护人）', value: contract.parentName },
      { label: '学员姓名', value: contract.studentName },
      { label: '生成日期', value: contract.generatedAt },
      { label: '确认时间', value: contract.signedAt || '待乙方确认' },
    ],
    sections: [
      {
        title: '第一条 课程服务内容',
        paragraphs: [
          [
            run('甲方为学员提供「'),
            run(fields.courseName || '课程服务', true),
            run('」相关教学服务，课程形式、上课地点、授课老师及排课安排以甲方课程系统或双方确认记录为准。'),
          ],
          [
            run('本次购买课包为「'),
            run(fields.packageName || '课程课包', true),
            run('」，共 '),
            run(hours, true),
            run('。课程服务周期为 '),
            run(fields.servicePeriod || '以双方确认周期为准', true),
            run('。'),
          ],
        ],
      },
      {
        title: '第二条 费用及支付',
        paragraphs: [
          [
            run('本协议课程费用合计为'),
            run(amount, true),
            run('。费用包含课程教学服务费用，不包含双方另行确认的教材、教具、考试、演出、赛事或第三方服务费用。'),
          ],
          [run('乙方应按甲方确认的收款方式完成支付。甲方收到对应款项后，为学员开通相应课程权益。')],
        ],
      },
      {
        title: '第三条 排课、请假与课时扣减',
        paragraphs: [
          [run('学员上课时间以甲方排课记录为准。乙方如需请假、调课，应按甲方公示规则或双方约定提前申请。')],
          [run('学员正常到课、迟到、缺勤、请假、补课及课时扣减，以甲方课程管理系统记录和双方沟通记录为依据。')],
        ],
      },
      {
        title: '第四条 服务周期与延期',
        paragraphs: [
          [run('乙方应在服务周期内合理安排学员完成课程。因法定节假日、机构统一调课、不可抗力或双方协商一致导致课程顺延的，服务周期可相应调整。')],
          [run('服务周期届满后仍有未消耗课时的，双方可根据甲方现行规则协商顺延、转课、续费或其他处理方式。')],
        ],
      },
      {
        title: '第五条 退费、转课与变更',
        paragraphs: [
          [run('乙方提出退费、转课、转让或课程变更申请的，双方按照甲方已公示且乙方已知悉的课程规则、实际消耗课时、优惠抵扣及已发生费用进行核算。')],
          [run('涉及赠课、优惠、活动价、教材教具等特殊项目的，以双方确认的补充约定或甲方对应活动规则为准。')],
        ],
      },
      {
        title: '第六条 双方权利义务',
        paragraphs: [
          [run('甲方应按照课程安排提供教学服务，维护正常教学秩序，并在合理范围内向乙方反馈学员学习情况。')],
          [run('乙方应保证填写信息真实准确，配合学员按时上课，并及时告知学员健康、接送、安全等与课程履行相关的重要信息。')],
        ],
      },
      {
        title: '第七条 补充约定',
        paragraphs: [
          [run(fields.extraTerms || '双方暂无其他补充约定。后续补充约定经双方确认后，与本协议具有同等效力。', Boolean(fields.extraTerms))],
        ],
      },
      {
        title: '第八条 电子确认与合同效力',
        paragraphs: [
          [
            run('本合同甲方签约主体为'),
            run(partyName, true),
            run('，签约联系人为'),
            run(`${contactName}（${contactPhone}）`, true),
            run('。甲方认证信息已由系统记录。'),
          ],
          [run('乙方在家长端点击“确认签约”即表示已阅读、理解并同意本协议全部内容，确认后系统记录确认时间。')],
          [run(contractEffectNotice)],
        ],
      },
      {
        title: '第九条 争议解决',
        paragraphs: [
          [run('因本协议履行产生争议的，双方应优先友好协商解决；协商不成的，可依法向有管辖权的人民法院提起诉讼。')],
        ],
      },
    ],
    signatureRows: [
      { label: '甲方', value: partyName },
      { label: '甲方签约人', value: `${contactName}（${contactPhone}）` },
      { label: '乙方', value: contract.parentName },
      { label: '学员', value: contract.studentName },
    ],
    signatureStatus: { label: '签约状态', value: contract.signedAt ? `已确认（${contract.signedAt}）` : '待乙方确认' },
  }
}
