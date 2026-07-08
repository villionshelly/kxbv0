import type { TemplateContract } from '@/lib/contract-store'
import { buildTemplateContractDocument, type ContractParagraph } from '@/lib/contract-template'
import { cn } from '@/lib/utils'

type ContractTemplatePreviewProps = {
  contract: TemplateContract
  dense?: boolean
}

function ContractParagraphView({ paragraph }: { paragraph: ContractParagraph }) {
  return (
    <p className="text-xs leading-6 text-muted-foreground">
      {paragraph.map((run, index) => (
        <span
          key={`${run.text}-${index}`}
          className={cn(run.highlight && 'font-bold text-foreground underline underline-offset-4')}
        >
          {run.text}
        </span>
      ))}
    </p>
  )
}

export function ContractTemplatePreview({ contract, dense = false }: ContractTemplatePreviewProps) {
  const document = buildTemplateContractDocument(contract)

  return (
    <article className={cn('rounded-2xl bg-white text-foreground ring-1 ring-border', dense ? 'p-3' : 'p-4')}>
      <header className="text-center">
        <h3 className={cn('font-bold', dense ? 'text-base' : 'text-lg')}>{document.title}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">合同编号：{document.contractNo}</p>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        {document.partyRows.map(row => (
          <div key={row.label} className="rounded-xl bg-muted/35 px-3 py-2">
            <dt className="text-[10px] text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 font-semibold text-foreground underline underline-offset-4">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs leading-6 text-foreground">{document.intro}</p>

      <div className={cn('space-y-3', dense ? 'mt-3' : 'mt-4')}>
        {document.sections.map(section => (
          <section key={section.title}>
            <h4 className="text-sm font-bold text-foreground">{section.title}</h4>
            <div className="mt-1 space-y-1.5">
              {section.paragraphs.map(paragraph => (
                <ContractParagraphView key={paragraph.map(run => run.text).join('')} paragraph={paragraph} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-dashed border-border pt-3 text-xs">
        {document.signatureRows.map(row => (
          <div key={row.label}>
            <span className="text-muted-foreground">{row.label}：</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
        <div className="col-span-2">
          <span className="text-muted-foreground">{document.signatureStatus.label}：</span>
          <span className="font-semibold">{document.signatureStatus.value}</span>
        </div>
      </div>
    </article>
  )
}
