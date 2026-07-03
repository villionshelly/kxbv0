'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Share2, Download, X, Image as ImageIcon, ChevronRight, CalendarCheck, BadgeCheck, CircleHelp } from 'lucide-react'
import { children, growthPhotos, medals, classRecords } from '@/lib/mock-data'
import { getChildGrowthProfile, getMedalKey } from '@/lib/parent-data'
import { useSelectedChild } from '@/hooks/use-selected-child'
import { cn } from '@/lib/utils'

type MedalItem = (typeof medals.duoduo)[number] | (typeof medals.xiaobao)[number]

const lockedMedalImage = '/images/medals/medal-locked.png'

const medalImageMap: Record<string, string> = {
  persistence: '/images/medals/medal-persistence.png',
  milestone: '/images/medals/medal-milestone.png',
  attendance: '/images/medals/medal-attendance.png',
  creative: '/images/medals/medal-creative.png',
  progress: '/images/medals/medal-progress.png',
  engagement: '/images/medals/medal-engagement.png',
  attitude: '/images/medals/medal-attitude.png',
}

const lockedMedalHints = [
  { name: '舞台小明星', description: '完成一次课堂展示' },
  { name: '目标达成', description: '完成一个阶段目标' },
  { name: '闪光时刻', description: '获得老师特别表扬' },
]

function getMedalImage(category: string) {
  return medalImageMap[category] || lockedMedalImage
}

export default function ParentGrowthPage() {
  const router = useRouter()
  const { selectedChild, setSelectedChildId } = useSelectedChild()
  const [showChildSelector, setShowChildSelector] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<typeof growthPhotos[0] | null>(null)
  const [activeTab, setActiveTab] = useState<'timeline' | 'medals'>('timeline')
  const [showPosterModal, setShowPosterModal] = useState(false)
  const [posterPhoto, setPosterPhoto] = useState<typeof growthPhotos[0] | null>(null)
  const [posterMode, setPosterMode] = useState<'report' | 'moment'>('report')
  const [generatingPoster, setGeneratingPoster] = useState(false)
  const [posterGenerated, setPosterGenerated] = useState(false)
  const [selectedMedal, setSelectedMedal] = useState<MedalItem | null>(null)

  const childPhotos = growthPhotos.filter((photo) => photo.childId === selectedChild.id)
  const reportPhoto = childPhotos[0] || growthPhotos[0]
  const childGrowthProfile = getChildGrowthProfile(selectedChild.id)
  // 学习课时 = 已消课（到课 + 调休补课）记录数，一节课记 1 课时
  const totalLessons = classRecords.filter(
    r => r.childId === selectedChild.id && (r.status === 'attended' || r.status === 'makeup')
  ).length
  const growthMomentCount = childPhotos.length * 12
  const childMedals = medals[getMedalKey(selectedChild.id)] || []
  const medalSlots = Math.max(6, childMedals.length)
  const lockedMedalCount = Math.max(0, medalSlots - childMedals.length)
  const medalProgress = Math.round((childMedals.length / medalSlots) * 100)
  const nextMedal = lockedMedalHints[childMedals.length % lockedMedalHints.length]

  const handleGeneratePoster = (photo: typeof growthPhotos[0], mode: 'report' | 'moment' = 'moment') => {
    setPosterPhoto(photo)
    setPosterMode(mode)
    setShowPosterModal(true)
    setGeneratingPoster(true)
    setPosterGenerated(false)
    
    // 模拟AI生成海报
    setTimeout(() => {
      setGeneratingPoster(false)
      setPosterGenerated(true)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full warm-bg">
      {/* Header */}
      <header className="safe-area-top px-4 pb-2">
        <div className="flex items-center">
          <div className="flex items-center">
            <button
              onClick={() => setShowChildSelector(!showChildSelector)}
              className="-ml-1 flex items-center gap-2 rounded-xl py-2 pr-2"
            >
              <img
                src={selectedChild.avatar}
                alt={selectedChild.name}
                className="w-8 h-8 rounded-full bg-muted"
              />
              <span className="font-semibold text-foreground">{selectedChild.name}的成长档案</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Child Selector Dropdown */}
        {showChildSelector && (
          <div className="absolute top-20 left-4 right-4 bg-background border border-border rounded-lg shadow-lg z-40 p-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id)
                  setShowChildSelector(false)
                  setSelectedMedal(null)
                  setSelectedPhoto(null)
                  setPosterPhoto(null)
                  setShowPosterModal(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  selectedChild.id === child.id ? 'bg-primary/10' : 'hover:bg-muted'
                )}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className="w-10 h-10 rounded-full bg-muted"
                />
                <div className="text-left">
                  <p className="font-medium">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.grade}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Stats Summary */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between p-3 bg-card rounded-2xl card-warm">
          <button
            onClick={() => router.push('/parent/feedback')}
            className="text-center flex-1 group"
          >
            <p className="text-xl font-bold text-primary flex items-center justify-center gap-0.5">
              {totalLessons}
              <ChevronRight className="w-4 h-4 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-xs text-muted-foreground">学习课时</p>
          </button>
          <div className="w-px h-8 bg-border" />
          <button
            onClick={() => setActiveTab('medals')}
            className="text-center flex-1 group"
          >
            <p className="text-xl font-bold text-primary flex items-center justify-center gap-0.5">
              {childMedals.length}
              <ChevronRight className="w-4 h-4 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-xs text-muted-foreground">获得勋章</p>
          </button>
          <div className="w-px h-8 bg-border" />
          <button
            onClick={() => setActiveTab('timeline')}
            className="text-center flex-1 group"
          >
            <p className="text-xl font-bold text-foreground flex items-center justify-center gap-0.5">
              {growthMomentCount}
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-xs text-muted-foreground">成长瞬间</p>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex bg-muted/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'timeline' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
          >
            成长时光轴
          </button>
          <button
            onClick={() => setActiveTab('medals')}
            className={cn(
              'flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1',
              activeTab === 'medals' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
          >
            <img src={lockedMedalImage} alt="" className="h-4 w-4 object-contain" />
            勋章墙
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 pb-8">
        {activeTab === 'medals' ? (
          /* Medals Section */
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl bg-card p-3 card-warm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">勋章收集进度</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold leading-none text-foreground">{childMedals.length}</span>
                    <span className="text-sm font-semibold text-muted-foreground">/ {medalSlots} 已点亮</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {lockedMedalCount > 0 ? `下一枚：${nextMedal.name} · ${nextMedal.description}` : '本阶段勋章已全部点亮'}
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-primary/10 px-3 py-2 text-right">
                  <span className="block text-[10px] font-medium text-primary/70">完成度</span>
                  <span className="block text-lg font-bold leading-tight text-primary">{medalProgress}%</span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${medalProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {childMedals.map((medal) => {
                const medalImage = getMedalImage(medal.category)
                return (
                  <button
                    type="button"
                    key={medal.id}
                    onClick={() => setSelectedMedal(medal)}
                    className="flex min-h-[122px] flex-col items-center rounded-2xl bg-card p-2 text-center shadow-sm ring-1 ring-border/60 transition-transform active:scale-[0.98]"
                  >
                    <span className="mb-1.5 flex h-16 w-16 items-center justify-center">
                      <img
                        src={medalImage}
                        alt=""
                        className="h-16 w-16 object-contain drop-shadow-[0_9px_11px_rgba(0,0,0,0.18)]"
                      />
                    </span>
                    <span className="line-clamp-2 min-h-[32px] text-xs font-semibold leading-4 text-foreground">{medal.name}</span>
                    <span className="mt-1 text-[10px] text-muted-foreground">{medal.earnedAt.slice(5)}</span>
                  </button>
                )
              })}

              {Array.from({ length: lockedMedalCount }).map((_, i) => {
                const locked = lockedMedalHints[i % lockedMedalHints.length]
                return (
                  <div
                    key={`locked-${i}`}
                    className="flex min-h-[122px] flex-col items-center rounded-2xl bg-muted/25 p-2 text-center ring-1 ring-border/40"
                  >
                    <span className="mb-1.5 flex h-16 w-16 items-center justify-center opacity-80 grayscale-[18%]">
                      <img
                        src={lockedMedalImage}
                        alt=""
                        className="h-16 w-16 object-contain drop-shadow-[0_7px_9px_rgba(0,0,0,0.12)]"
                      />
                    </span>
                    <span className="line-clamp-2 min-h-[32px] text-xs font-medium leading-4 text-muted-foreground">{locked.name}</span>
                    <span className="mt-1 text-[10px] text-muted-foreground/80">待解锁</span>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-muted py-2 text-xs font-medium text-muted-foreground"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                看成长记录
              </button>
              <button
                type="button"
                onClick={() => setSelectedMedal(childMedals[0] || null)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-xs font-medium text-primary disabled:opacity-50"
                disabled={childMedals.length === 0}
              >
                <CircleHelp className="h-3.5 w-3.5" />
                勋章说明
              </button>
            </div>
          </div>
        ) : (
          /* Timeline Section */
          <div className="space-y-4">
            {/* AI Growth Report Card */}
            <div className="p-3 bg-card rounded-2xl card-warm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">AI</span>
                </div>
                <h3 className="font-semibold text-primary">{childGrowthProfile.reportTitle}</h3>
                <span className="ml-auto text-xs text-muted-foreground">刚刚生成</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {childGrowthProfile.reportSummary}
              </p>
              <button
                onClick={() => handleGeneratePoster(reportPhoto, 'report')}
                className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium pill-warm"
              >
                分享成长报告
              </button>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">成长时光轴</h2>
              
              {childPhotos.map((photo, index) => (
                <div key={photo.id} className="relative">
                  {/* Timeline line */}
                  {index < childPhotos.length - 1 && (
                    <div className="absolute left-[7px] top-10 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <div className="flex gap-3">
                    {/* Timeline dot */}
                    <div className="w-4 h-4 rounded-full bg-primary shrink-0 mt-1" />
                    
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary">{photo.course}</span>
                        <span className="text-xs text-muted-foreground">{photo.date}</span>
                      </div>
                      
                      <div 
                        className="relative rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.url}
                          alt={photo.description}
                          className="w-full h-44 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <p className="absolute bottom-3 left-3 right-3 text-white text-sm">
                          {photo.description}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGeneratePoster(photo, 'moment')
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-lg text-xs font-medium"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          生成海报
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-muted text-muted-foreground rounded-lg text-xs font-medium">
                          <Share2 className="w-3.5 h-3.5" />
                          分享
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-center text-xs text-muted-foreground py-4">
                已展示全部成长记录
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Medal Detail Modal */}
      {selectedMedal && (() => {
        const medalImage = getMedalImage(selectedMedal.category)
        return (
          <div
            className="fixed inset-0 z-50 flex items-end bg-black/45 p-4"
            onClick={() => setSelectedMedal(null)}
          >
            <div
              className="w-full rounded-3xl bg-background p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">勋章详情</span>
                <button
                  type="button"
                  onClick={() => setSelectedMedal(null)}
                  className="rounded-full bg-muted p-1.5"
                  aria-label="关闭勋章详情"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-muted/30">
                  <img
                    src={medalImage}
                    alt={selectedMedal.name}
                    className="h-20 w-20 object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground">{selectedMedal.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedMedal.description}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    {selectedMedal.earnedAt} 获得
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMedal(null)
                  setActiveTab('timeline')
                }}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground"
              >
                <BadgeCheck className="h-4 w-4" />
                查看相关成长记录
              </button>
            </div>
          </div>
        )
      })()}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-full max-h-full p-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.description}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{selectedPhoto.description}</p>
              <p className="text-white/60 text-sm mt-1">
                {selectedPhoto.course} | {selectedPhoto.date}
              </p>
              <div className="flex gap-3 justify-center mt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGeneratePoster(selectedPhoto, 'moment')
                    setSelectedPhoto(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-primary-foreground"
                >
                  <ImageIcon className="w-4 h-4" />
                  生成海报
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-white">
                  <Download className="w-4 h-4" />
                  保存到相册
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poster Generation Modal */}
      {showPosterModal && posterPhoto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-background rounded-2xl max-w-sm w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">{posterMode === 'report' ? '成长报告海报' : '成长瞬间海报'}</h3>
              <button 
                onClick={() => setShowPosterModal(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {generatingPoster ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {posterMode === 'report' ? 'AI正在整理成长报告...' : 'AI正在生成精美海报...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Generated Poster Preview */}
                  {posterMode === 'report' ? (
                    <div className="relative overflow-hidden rounded-[30px] bg-[#fff7ed] p-3.5 text-[#182033] shadow-sm ring-1 ring-black/5">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_18%_0%,rgba(248,126,49,0.16),transparent_45%),radial-gradient(circle_at_92%_10%,rgba(14,112,192,0.12),transparent_38%)]" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(255,223,186,0.72))]" />

                      <div className="relative space-y-3">
                        <div className="flex items-start justify-between gap-3 px-0.5">
                          <div className="min-w-0 pt-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-semibold text-primary">{childGrowthProfile.reportTitle}</p>
                              <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-[#9a4c20] ring-1 ring-white/70">2026</span>
                            </div>
                            <h4 className="mt-1 whitespace-nowrap text-[24px] font-bold leading-tight tracking-normal">{selectedChild.name}又长大了一点点</h4>
                          </div>
                          <img
                            src={selectedChild.avatar}
                            alt={selectedChild.name}
                            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/80"
                          />
                        </div>

                        <div className="relative overflow-hidden rounded-[26px]">
                          <div className="relative h-[228px] overflow-hidden rounded-[26px]">
                            <img
                              src={posterPhoto.url}
                              alt={posterPhoto.description}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                              <p className="text-sm font-semibold text-white">{posterPhoto.description}</p>
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 flex gap-1.5">
                            {childPhotos.filter((photo) => photo.id !== posterPhoto.id).slice(0, 2).map((photo) => (
                              <div key={photo.id} className="h-[66px] w-[66px] overflow-hidden rounded-2xl ring-2 ring-white/90 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)]">
                                <img
                                  src={photo.url}
                                  alt={photo.description}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="px-1">
                          <p className="text-[15px] font-semibold leading-6">
                            {childGrowthProfile.posterSummary}
                          </p>
                          <div className="mt-2 flex gap-1.5">
                            {childGrowthProfile.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-[#fff0e4] px-2 py-1 text-[11px] font-medium text-[#9a4c20]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-[#efd8c4] pt-3">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-[#9a4c20]">点亮勋章墙</p>
                              <p className="mt-0.5 text-[10px] text-[#7b6d63]">
                                {totalLessons} 节课 · {growthMomentCount} 个成长瞬间
                              </p>
                            </div>
                            <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-primary shadow-sm">
                              {childMedals.length} 枚
                            </span>
                          </div>

                          <div className="relative mt-3">
                            <div className="absolute inset-x-3 bottom-0 h-8 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(248,126,49,0.24),transparent_72%)]" />
                            <div className="relative grid grid-cols-5 gap-1.5 rounded-full bg-white/24 px-1 py-1">
                            {(childMedals.length > 0 ? childMedals : [{ id: 'locked', name: '成长勋章', category: 'locked' }]).map((medal) => (
                              <div key={medal.id} className="flex h-[58px] items-center justify-center">
                                <img
                                  src={getMedalImage(medal.category)}
                                  alt=""
                                  className="h-[52px] w-[52px] object-contain drop-shadow-[0_9px_10px_rgba(0,0,0,0.18)]"
                                />
                              </div>
                            ))}
                            </div>
                          </div>
                        </div>

                        <div className="relative mt-1 overflow-hidden rounded-[22px] bg-[linear-gradient(100deg,rgba(255,240,220,0.88),rgba(236,249,255,0.76))] px-3 py-2">
                          <div className="pointer-events-none absolute -left-4 -top-6 h-16 w-16 rounded-full bg-white/35" />
                          <div className="pointer-events-none absolute bottom-1 left-1/2 h-1.5 w-1.5 rounded-full bg-primary/35" />
                          <div className="pointer-events-none absolute bottom-3 left-[58%] h-1 w-1 rounded-full bg-secondary/35" />
                          <div className="relative flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2 text-[#8a6b55]">
                              <img src="/logo.png" alt="课小宝" className="h-6 w-6 shrink-0 object-contain opacity-95" />
                              <div className="min-w-0">
                                <p className="truncate text-[10px] font-semibold">课小宝成长报告</p>
                                <p className="text-[9px] text-[#9d8069]">每一次进步都值得被看见</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#8a6b55]">
                              <span>扫码生成</span>
                              <img src="/images/posters/growth-report-qr.svg" alt="成长报告二维码" className="h-11 w-11 opacity-80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-[28px] bg-[#fff9f1] p-4 text-[#182033] shadow-sm ring-1 ring-black/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-primary">成长瞬间</p>
                          <h4 className="mt-1 text-xl font-bold">{posterPhoto.description}</h4>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">{posterPhoto.course}</span>
                      </div>

                      <img
                        src={posterPhoto.url}
                        alt={posterPhoto.description}
                        className="mt-3 h-48 w-full rounded-3xl object-cover"
                      />

                      <div className="mt-3 flex items-center gap-2">
                        <img
                          src={selectedChild.avatar}
                          alt={selectedChild.name}
                          className="h-8 w-8 rounded-full bg-white object-cover ring-2 ring-white"
                        />
                        <div>
                          <p className="text-sm font-semibold">{selectedChild.name}</p>
                          <p className="text-xs text-[#6d7481]">{posterPhoto.date}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-3xl bg-white p-3">
                        <span className="text-xs text-[#6d7481]">扫码生成孩子的成长记录</span>
                        <img src="/images/posters/growth-report-qr.svg" alt="成长记录二维码" className="h-14 w-14 rounded-lg" />
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      保存图片
                    </button>
                    <button className="flex-1 py-3 bg-[#07C160] text-white rounded-xl font-medium flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      分享朋友圈
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
