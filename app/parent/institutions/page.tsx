'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, CheckCircle, Clock, XCircle, Link2, Send, ChevronRight, Plus, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Institution {
  id: string
  name: string
  type: string
  logo?: string
  status: 'bound' | 'pending' | 'unbound'
  bindTime?: string
  childrenCount?: number
}

export default function MyInstitutionsPage() {
  const router = useRouter()
  const [institutions, setInstitutions] = useState<Institution[]>([
    { id: '1', name: '七彩音乐艺术中心', type: '音乐培训', status: 'bound', bindTime: '2024-01-15', childrenCount: 2 },
    { id: '2', name: '启明星舞蹈学校', type: '舞蹈培训', status: 'bound', bindTime: '2024-03-20', childrenCount: 1 },
    { id: '3', name: '小天才美术工作室', type: '美术培训', status: 'pending', bindTime: '2024-05-01' },
  ])
  const [showUnbindConfirm, setShowUnbindConfirm] = useState<Institution | null>(null)
  const [showBindSheet, setShowBindSheet] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [bindSuccess, setBindSuccess] = useState(false)

  const handleUnbind = (inst: Institution) => {
    setInstitutions(prev => prev.map(i =>
      i.id === inst.id ? { ...i, status: 'unbound' as const } : i
    ))
    setShowUnbindConfirm(null)
  }

  const handleRebind = (inst: Institution) => {
    setInstitutions(prev => prev.map(i =>
      i.id === inst.id ? { ...i, status: 'pending' as const } : i
    ))
  }

  const handleBindNew = () => {
    if (inviteCode.trim()) {
      setBindSuccess(true)
      setTimeout(() => {
        setShowBindSheet(false)
        setBindSuccess(false)
        setInviteCode('')
        // Add new pending institution
        setInstitutions(prev => [...prev, {
          id: Date.now().toString(),
          name: '新机构',
          type: '培训机构',
          status: 'pending',
        }])
      }, 1500)
    }
  }

  const boundCount = institutions.filter(i => i.status === 'bound').length
  const pendingCount = institutions.filter(i => i.status === 'pending').length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="safe-area-top px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">我的机构</h1>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600">{boundCount}</p>
            <p className="text-xs text-green-600/70">已绑定</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-amber-600/70">待绑定</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-gray-500">{institutions.filter(i => i.status === 'unbound').length}</p>
            <p className="text-xs text-gray-500">已解绑</p>
          </div>
        </div>
      </div>

      {/* Institution List */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="space-y-3">
          {institutions.map(inst => (
            <div
              key={inst.id}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
                inst.status === 'bound' ? 'border-green-200 bg-green-50/30' :
                inst.status === 'pending' ? 'border-amber-200 bg-amber-50/30' :
                'border-gray-200 bg-gray-50/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  inst.status === 'bound' ? 'bg-green-100' :
                  inst.status === 'pending' ? 'bg-amber-100' : 'bg-gray-200'
                )}>
                  <Building2 className={cn(
                    'w-6 h-6',
                    inst.status === 'bound' ? 'text-green-600' :
                    inst.status === 'pending' ? 'text-amber-600' : 'text-gray-400'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{inst.name}</p>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      inst.status === 'bound' ? 'bg-green-100 text-green-700' :
                      inst.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-200 text-gray-600'
                    )}>
                      {inst.status === 'bound' ? '已绑定' :
                       inst.status === 'pending' ? '待绑定' : '已解绑'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inst.type}</p>
                  {inst.bindTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {inst.status === 'unbound' ? '解绑于' : '绑定于'} {inst.bindTime}
                    </p>
                  )}
                  {inst.status === 'bound' && inst.childrenCount && (
                    <p className="text-xs text-green-600 mt-1">
                      {inst.childrenCount} 个孩子在学
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                {inst.status === 'bound' && (
                  <>
                    <button
                      onClick={() => router.push(`/parent/course/${inst.id}`)}
                      className="flex-1 py-2 text-sm font-medium text-secondary bg-secondary/10 rounded-lg"
                    >
                      查看课程
                    </button>
                    <button
                      onClick={() => setShowUnbindConfirm(inst)}
                      className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg"
                    >
                      解绑
                    </button>
                  </>
                )}
                {inst.status === 'pending' && (
                  <div className="flex-1 flex items-center gap-2 text-amber-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">等待机构确认绑定...</span>
                  </div>
                )}
                {inst.status === 'unbound' && (
                  <button
                    onClick={() => handleRebind(inst)}
                    className="flex-1 py-2 text-sm font-medium text-secondary bg-secondary/10 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Link2 className="w-4 h-4" />
                    重新绑定
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add new binding */}
          <button
            onClick={() => setShowBindSheet(true)}
            className="w-full p-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加新机构</span>
          </button>
        </div>
      </div>

      {/* Unbind Confirm Modal */}
      {showUnbindConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowUnbindConfirm(null)}>
          <div className="bg-background w-full rounded-t-2xl px-4 pt-6 pb-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-1">确认解除绑定</h3>
            <p className="text-sm text-muted-foreground mb-4">
              确定要解除与「{showUnbindConfirm.name}」的绑定关系吗？
            </p>
            <div className="bg-amber-50 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>解绑后将无法查看该机构的课程和消课记录</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>历史购课数据仍会保留，可重新绑定后恢复</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowUnbindConfirm(null)} className="flex-1 h-12 bg-muted rounded-xl font-medium">取消</button>
              <button onClick={() => handleUnbind(showUnbindConfirm)} className="flex-1 h-12 bg-gray-700 text-white rounded-xl font-medium">确认解绑</button>
            </div>
          </div>
        </div>
      )}

      {/* Bind New Sheet */}
      {showBindSheet && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowBindSheet(false)}>
          <div className="bg-background w-full rounded-t-2xl px-4 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            {bindSuccess ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-semibold">绑定申请已发送</p>
                <p className="text-sm text-muted-foreground">等待机构确认后即可绑定成功</p>
              </div>
            ) : (
              <>
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">绑定新机构</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  输入机构提供的邀请码，或通过机构分享的链接绑定
                </p>

                <div className="mb-4">
                  <label className="text-xs text-muted-foreground block mb-2">邀请码</label>
                  <input
                    type="text"
                    placeholder="请输入机构邀请码"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full h-12 px-4 bg-muted/40 rounded-xl text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <button
                  onClick={handleBindNew}
                  disabled={!inviteCode.trim()}
                  className="w-full h-12 bg-secondary text-secondary-foreground rounded-xl font-medium disabled:opacity-40"
                >
                  申请绑定
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
