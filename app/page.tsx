import Link from 'next/link'
import { ArrowRight, Building2, Monitor, Smartphone } from 'lucide-react'

const demoEntries = [
  {
    title: '家长小程序',
    tag: 'C端',
    href: '/parent',
    description: '跨机构课表管理、课时记账与成长记录工具，解决家长"管课乱、易忘课"的痛点。',
    features: ['多娃视图切换', '日历课表展示', '课时资产看板', '成长档案相册'],
    icon: Smartphone,
    accent: 'orange',
  },
  {
    title: '机构小程序',
    tag: 'B端',
    href: '/institution',
    description: '极低门槛的教务管理系统，AI赋能模块解决机构获客成本高、续费率低的痛点。',
    features: ['学员班级管理', '可视化排课点名', 'AI续费预警', '经营数据报表'],
    icon: Building2,
    accent: 'blue',
  },
  {
    title: '运营管理后台',
    tag: 'O端',
    href: '/admin',
    description: '平台运营管理中心，掌握全局数据，管理机构生命周期与商业变现。',
    features: ['数据大盘监控', '机构资质审核', '线索池管理', '订单财务中心'],
    icon: Monitor,
    accent: 'dark',
  },
] as const

const accentStyles = {
  orange: {
    iconWrap: 'bg-[#fff0e8] text-[#f26b21]',
    tag: 'bg-[#fff0e8] text-[#f26b21]',
    dot: 'bg-[#f26b21]',
    link: 'text-[#f26b21]',
  },
  blue: {
    iconWrap: 'bg-[#e5f4ff] text-[#0787d9]',
    tag: 'bg-[#e5f4ff] text-[#0787d9]',
    dot: 'bg-[#0787d9]',
    link: 'text-[#0787d9]',
  },
  dark: {
    iconWrap: 'bg-[#e8e8e8] text-[#101820]',
    tag: 'bg-[#e8e8e8] text-[#101820]',
    dot: 'bg-[#101820]',
    link: 'text-[#101820]',
  },
} as const

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] text-[#101820]">
      <header className="flex h-[92px] items-center justify-between border-b border-[#ececec] bg-white/80 px-8 backdrop-blur md:px-12">
        <Link href="/" className="flex items-center gap-4" aria-label="课小宝首页">
          <img src="/logo.png" alt="课小宝" className="h-14 w-14 object-contain" />
          <div>
            <p className="text-[26px] font-black leading-tight tracking-normal">课小宝</p>
            <p className="mt-1 text-[15px] font-medium text-[#777]">AI教培管理平台</p>
          </div>
        </Link>
        <span className="text-[22px] font-medium tracking-normal text-[#6d6d6d]">产品演示</span>
      </header>

      <section className="mx-auto flex w-full max-w-[1880px] flex-col px-8 pb-20 pt-24 md:px-12 lg:pt-28">
        <div className="mx-auto max-w-[1040px] text-center">
          <h1 className="text-[44px] font-black leading-[1.22] tracking-normal text-[#0b1520] md:text-[62px]">
            招生、续费、转介绍
            <span className="block text-[#f26b21]">一个平台全搞定</span>
          </h1>
          <p className="mx-auto mt-8 max-w-[1130px] text-[24px] font-medium leading-[1.7] tracking-normal text-[#707070] md:text-[30px]">
            家长管课更省心，机构增长更高效。聚焦 3-15 岁少儿课外教育场景的AI教培管理平台。
          </p>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-3">
          {demoEntries.map((entry) => {
            const Icon = entry.icon
            const styles = accentStyles[entry.accent]

            return (
              <Link
                key={entry.href}
                href={entry.href}
                className="group relative flex min-h-[585px] flex-col rounded-[28px] border border-[#e2e2e2] bg-white px-10 py-10 shadow-[0_1px_2px_rgba(16,24,32,0.02)] transition duration-200 hover:-translate-y-1 hover:border-[#d5d5d5] hover:shadow-[0_18px_45px_rgba(16,24,32,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f26b21]/20 md:px-11"
              >
                <span className={`absolute right-8 top-8 rounded-full px-4 py-2 text-[20px] font-bold ${styles.tag}`}>{entry.tag}</span>
                <span className={`flex h-24 w-24 items-center justify-center rounded-[24px] ${styles.iconWrap}`}>
                  <Icon className="h-12 w-12" strokeWidth={2.8} aria-hidden="true" />
                </span>

                <h2 className="mt-10 text-[36px] font-black leading-tight tracking-normal text-[#101820]">{entry.title}</h2>
                <p className="mt-6 min-h-[104px] text-[23px] font-medium leading-[1.55] tracking-normal text-[#707070]">{entry.description}</p>

                <ul className="mt-4 space-y-5">
                  {entry.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4 text-[22px] font-medium tracking-normal text-[#707070]">
                      <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <span className={`mt-auto flex items-center gap-4 pt-10 text-[24px] font-bold tracking-normal ${styles.link}`}>
                  进入演示
                  <ArrowRight className="h-7 w-7 transition group-hover:translate-x-1" strokeWidth={2.5} aria-hidden="true" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
