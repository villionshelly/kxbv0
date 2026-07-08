import type { TemplateContract } from '@/lib/contract-store'
import { buildTemplateContractDocument, type ContractParagraph } from '@/lib/contract-template'

const encoder = new TextEncoder()

function escapeXml(value: string | undefined) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

type ParagraphOptions = {
  bold?: boolean
  align?: 'left' | 'center'
  size?: number
  underline?: boolean
}

function runXml(text: string, options: ParagraphOptions = {}) {
  const runStyle = options.bold || options.size || options.underline
    ? `<w:rPr>${options.bold ? '<w:b/>' : ''}${options.underline ? '<w:u w:val="single"/>' : ''}${options.size ? `<w:sz w:val="${options.size}"/>` : ''}</w:rPr>`
    : ''

  return `<w:r>${runStyle}<w:t>${escapeXml(text)}</w:t></w:r>`
}

function paragraph(text: string, options: ParagraphOptions = {}) {
  const justify = options.align === 'center' ? '<w:pPr><w:jc w:val="center"/></w:pPr>' : ''

  return `<w:p>${justify}${runXml(text, options)}</w:p>`
}

function contractParagraph(paragraphRuns: ContractParagraph) {
  const runs = paragraphRuns
    .map(item => runXml(item.text, item.highlight ? { bold: true, underline: true } : {}))
    .join('')

  return `<w:p>${runs}</w:p>`
}

function labeledParagraph(label: string, value: string, underlineValue = false) {
  return `<w:p>${runXml(`${label}：`)}${runXml(value, underlineValue ? { bold: true, underline: true } : { bold: true })}</w:p>`
}

function buildDocumentXml(contract: TemplateContract) {
  const document = buildTemplateContractDocument(contract)
  const lines = [
    paragraph(document.title, { bold: true, align: 'center', size: 34 }),
    paragraph(`合同编号：${document.contractNo}`, { align: 'center', size: 20 }),
    paragraph(''),
    ...document.partyRows.map(row => labeledParagraph(row.label, row.value, true)),
    paragraph(''),
    paragraph(document.intro),
    paragraph(''),
    ...document.sections.flatMap(section => [
      paragraph(section.title, { bold: true }),
      ...section.paragraphs.map(text => contractParagraph(text)),
      paragraph(''),
    ]),
    paragraph('签署确认', { bold: true }),
    ...document.signatureRows.map(row => labeledParagraph(row.label, row.value)),
    labeledParagraph(document.signatureStatus.label, document.signatureStatus.value),
  ].join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${lines}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function crc32(bytes: Uint8Array) {
  let crc = -1
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ -1) >>> 0
}

function dosDateTime(date = new Date()) {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f)
  const day = Math.max(1, date.getDate())
  const dosDate =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (day & 0x1f)
  return { time, date: dosDate }
}

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff)
}

function pushUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff)
}

function concatBytes(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  chunks.forEach((chunk) => {
    output.set(chunk, offset)
    offset += chunk.length
  })
  return output
}

function createZip(files: Array<{ path: string; content: string }>) {
  const chunks: Uint8Array[] = []
  const centralDirectory: Uint8Array[] = []
  let offset = 0
  const { time, date } = dosDateTime()

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path)
    const data = encoder.encode(file.content)
    const crc = crc32(data)
    const local: number[] = []

    pushUint32(local, 0x04034b50)
    pushUint16(local, 20)
    pushUint16(local, 0)
    pushUint16(local, 0)
    pushUint16(local, time)
    pushUint16(local, date)
    pushUint32(local, crc)
    pushUint32(local, data.length)
    pushUint32(local, data.length)
    pushUint16(local, nameBytes.length)
    pushUint16(local, 0)

    const localHeader = concatBytes([new Uint8Array(local), nameBytes, data])
    chunks.push(localHeader)

    const central: number[] = []
    pushUint32(central, 0x02014b50)
    pushUint16(central, 20)
    pushUint16(central, 20)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, time)
    pushUint16(central, date)
    pushUint32(central, crc)
    pushUint32(central, data.length)
    pushUint32(central, data.length)
    pushUint16(central, nameBytes.length)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint16(central, 0)
    pushUint32(central, 0)
    pushUint32(central, offset)
    centralDirectory.push(concatBytes([new Uint8Array(central), nameBytes]))

    offset += localHeader.length
  })

  const centralStart = offset
  const centralBytes = concatBytes(centralDirectory)
  chunks.push(centralBytes)

  const eocd: number[] = []
  pushUint32(eocd, 0x06054b50)
  pushUint16(eocd, 0)
  pushUint16(eocd, 0)
  pushUint16(eocd, files.length)
  pushUint16(eocd, files.length)
  pushUint32(eocd, centralBytes.length)
  pushUint32(eocd, centralStart)
  pushUint16(eocd, 0)
  chunks.push(new Uint8Array(eocd))

  return concatBytes(chunks)
}

export function buildTemplateContractDocxBlob(contract: TemplateContract) {
  const bytes = createZip([
    {
      path: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      path: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      path: 'word/document.xml',
      content: buildDocumentXml(contract),
    },
  ])

  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export function getContractDocxFileName(contract: TemplateContract) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeTitle = contract.title.replace(/[\\/:*?"<>|]/g, '')
  return `${contract.studentName}-${safeTitle}-${date}.docx`
}

export function downloadTemplateContractDocx(contract: TemplateContract) {
  const blob = buildTemplateContractDocxBlob(contract)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = getContractDocxFileName(contract)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
