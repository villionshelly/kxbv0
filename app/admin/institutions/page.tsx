'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Plus, MoreHorizontal, Building2, Users, Calendar, Crown, AlertCircle } from 'lucide-react'
import { allInstitutions, pendingInstitutions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function AdminInstitutionsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'frozen'>('all')

  const filteredInstitutions = allInstitutions.filter((inst) => {
    const matchesSearch = inst.name.includes(searchQuery) || inst.contact.includes(searchQuery)
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">机构管理</h1>
          <p className="text-muted-foreground mt-1">管理平台入驻机构</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          添加机构
        </button>
      </div>

      {/* Pending Review Alert */}
      {pendingInstitutions.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-700">有 {pendingInstitutions.length} 家机构等待审核</p>
            <p className="text-sm text-yellow-600">请及时处理，避免影响机构入驻体验</p>
          </div>
          <button 
            onClick={() => setActiveTab('pending')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            立即审核
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索机构名称、联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex bg-muted/50 rounded-lg p-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待审核' },
            { key: 'active', label: '正常' },
            { key: 'frozen', label: '已冻结' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key ? 'bg-background shadow-sm' : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm hover:bg-muted/50 transition-colors">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* Pending Institutions */}
      {activeTab === 'pending' && (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">待审核机构</h3>
          </div>
          <div className="divide-y divide-border">
            {pendingInstitutions.map((inst) => (
              <div key={inst.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{inst.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inst.contact} | {inst.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">{inst.address}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                          {inst.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          提交时间：{inst.submitTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
                      查看资质
                    </button>
                    <button className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors">
                      拒绝
                    </button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                      通过审核
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institutions Table */}
      {activeTab !== 'pending' && (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">机构信息</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">版本</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">学员数</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">入驻时间</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">到期时间</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">状态</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInstitutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.contact} | {inst.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      inst.version === 'AI增长版' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {inst.version === 'AI增长版' && <Crown className="w-3 h-3" />}
                      {inst.version}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{inst.studentCount}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{inst.joinDate}</td>
                  <td className="p-4 text-sm text-muted-foreground">{inst.expireDate}</td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      inst.status === 'active' 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-destructive/10 text-destructive'
                    )}>
                      {inst.status === 'active' ? '正常' : '已冻结'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => router.push(`/admin/institutions/${inst.id}`)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
