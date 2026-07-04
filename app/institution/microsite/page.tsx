'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, BookOpen, ChevronRight, Clock, Eye, Globe2, MapPin, Megaphone, Newspaper, Phone, Plus, Settings2, Star, Tags, Users } from 'lucide-react'
import { micrositeConfig } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const configEntrances = [
  { id: 'basic', label: '机构基础信息', desc: '地址电话、卖点标签', icon: Settings2 },
  { id: 'courses', label: '课程列表', desc: '重点配置试听营销课', icon: BookOpen },
  { id: 'teachers', label: '教师列表', desc: '头像、职称、擅长方向', icon: Users },
  { id: 'updates', label: '机构动态', desc: '活动、报告、课堂成果', icon: Newspaper },
] as const

export default function MicrositePage() {
  const router = useRouter()
  const [activeConfig, setActiveConfig] = useState<typeof configEntrances[number]['id']>('basic')
  const [notice, setNotice] = useState('当前预览为家长访问微官网时看到的内容')
  const { basicInfo, trialCourses, courses, teachers, updates } = micrositeConfig

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="safe-area-top flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => router.push('/institution')}
          className="rounded-xl p-2 -ml-2 transition-colors hover:bg-muted"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold">我的动态</h1>
          <p className="truncate text-xs text-muted-foreground">微官网配置入口与家长侧预览</p>
        </div>
        <Globe2 className="h-5 w-5 text-orange-600" />
      </header>

      <div className="flex-1 overflow-auto px-4 py-4 pb-8">
        <section className="mb-4 rounded-3xl bg-gradient-to-br from-orange-50 to-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">微官网状态</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">试听营销课已重点展示</h2>
              <p className="mt-2 text-sm text-slate-600">{notice}</p>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">已发布</span>
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-950">页面配置入口</h2>
            <button
              type="button"
              onClick={() => setNotice('已新建一条机构动态草稿，可继续编辑封面和正文')}
              className="flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              新动态
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {configEntrances.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveConfig(item.id)
                  setNotice(`${item.label}配置入口已打开`)
                }}
                className={cn(
                  'rounded-3xl p-4 text-left transition-colors',
                  activeConfig === item.id ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-700'
                )}
              >
                <item.icon className="mb-3 h-5 w-5" />
                <p className="text-sm font-bold">{item.label}</p>
                <p className="mt-1 text-xs opacity-70">{item.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">微官网预览</h2>
              <p className="mt-0.5 text-xs text-slate-500">家长看到的公开页面</p>
            </div>
            <Eye className="h-5 w-5 text-orange-600" />
          </div>

          <div className="overflow-hidden rounded-[32px] border-4 border-slate-900 bg-white shadow-xl">
            <div className="bg-slate-900 px-4 py-2 text-center text-[10px] font-medium text-white/80">qicai.kexiaobao.cn</div>
            <div className="max-h-[620px] overflow-auto bg-white">
              <div className="bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm">
                    <Image src={basicInfo.logo} alt={basicInfo.name} width={56} height={56} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-950">{basicInfo.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{basicInfo.slogan}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {basicInfo.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-orange-700 shadow-sm">
                      <Tags className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2 rounded-3xl bg-white/80 p-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-orange-600" />{basicInfo.address}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-orange-600" />{basicInfo.phone}</p>
                  <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-orange-600" />{basicInfo.openingHours}</p>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-bold text-slate-950">试听营销课</h4>
                  <Megaphone className="h-4 w-4 text-orange-600" />
                </div>
                <div className="space-y-3">
                  {trialCourses.map(course => (
                    <div key={course.id} className="rounded-3xl border border-orange-100 bg-orange-50 p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-950">{course.name}</p>
                          <p className="mt-1 text-xs text-slate-600">{course.desc}</p>
                        </div>
                        <span className="rounded-full bg-orange-600 px-2 py-1 text-[10px] font-medium text-white">试听</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p>
                          <span className="text-lg font-bold text-orange-600">¥{course.price}</span>
                          <span className="ml-1 text-xs text-slate-400 line-through">¥{course.originalPrice}</span>
                        </p>
                        <button className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white">立即预约</button>
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500">{course.booked} 位家长已预约</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-4">
                <h4 className="mb-3 font-bold text-slate-950">课程列表</h4>
                <div className="space-y-2">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-950">{course.name}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{course.teacher} · {course.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-950">¥{course.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-4">
                <h4 className="mb-3 font-bold text-slate-950">教师列表</h4>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="w-32 shrink-0 rounded-3xl bg-slate-50 p-3 text-center">
                      <Image src={teacher.avatar} alt={teacher.name} width={56} height={56} className="mx-auto h-14 w-14 rounded-full object-cover" />
                      <p className="mt-2 text-sm font-semibold text-slate-950">{teacher.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{teacher.title}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{teacher.specialty}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-5">
                <h4 className="mb-3 font-bold text-slate-950">机构动态</h4>
                <div className="space-y-2">
                  {updates.map(update => (
                    <div key={update.id} className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-start gap-2">
                        <Star className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{update.title}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{update.date}</p>
                          <p className="mt-1 text-xs text-slate-500">{update.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="sticky bottom-3 mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-1.5 rounded-full bg-orange-600 py-3 text-sm font-bold text-white shadow-lg">
                预约试听课
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
