'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building, Users, Calendar, CreditCard, Phone, MapPin, Mail, Shield, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { allInstitutions } from '@/lib/mock-data'

export default function InstitutionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const institution = allInstitutions.find(i => i.id === params.id) || allInstitutions[0]

  const monthlyData = [
    { label: '本月营收', value: '¥89,600', change: '+12%' },
    { label: '活跃学员', value: '142', change: '+5' },
    { label: '本月消课', value: '486', change: '+8%' },
    { label: '续费率', value: '78%', change: '+3%' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回机构列表</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{institution.name}</h1>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    institution.version === 'AI增长版' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {institution.version}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    institution.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {institution.status === 'active' ? '正常' : '已停用'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{institution.type}</span>
                  <span>·</span>
                  <span>入驻于 {institution.joinDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">编辑信息</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">停用机构</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {monthlyData.map((item, index) => (
            <div key={index} className="bg-white rounded-xl p-4">
              <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-sm text-green-600 mb-1">{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">基本信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">联系电话</div>
                    <div className="font-medium">{institution.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">联系人</div>
                    <div className="font-medium">{institution.contact}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">机构地址</div>
                    <div className="font-medium">{institution.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">订阅信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{institution.version}</div>
                      <div className="text-sm text-muted-foreground">到期时间: {institution.expireDate}</div>
                    </div>
                  </div>
                  <Button size="sm">续费</Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">AI积分余额</div>
                    <div className="text-xl font-bold mt-1">1,580</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground">本月AI使用</div>
                    <div className="text-xl font-bold mt-1">420</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">运营概况</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">学员总数</span>
                  <span className="font-bold">{institution.studentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">教师数量</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">班级数量</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">课程种类</span>
                  <span className="font-bold">6</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">最近动态</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <div className="text-sm">新增学员 3 名</div>
                    <div className="text-xs text-muted-foreground">2小时前</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <div className="text-sm">完成课时消耗 12 节</div>
                    <div className="text-xs text-muted-foreground">今天</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <div className="text-sm">使用AI续费话术</div>
                    <div className="text-xs text-muted-foreground">昨天</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
