'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, MapPin, Baby, MessageCircle, Building, Clock, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { leadPool, allInstitutions } from '@/lib/mock-data'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lead = leadPool.find(l => l.id === params.id) || leadPool[0]
  const [selectedInstitution, setSelectedInstitution] = useState('')
  const [note, setNote] = useState('')
  const [assigned, setAssigned] = useState(false)

  // Filter relevant institutions
  const relevantInstitutions = allInstitutions.filter(i => 
    i.status === 'active' && i.address.includes(lead.location.replace('区', ''))
  )

  const handleAssign = () => {
    setAssigned(true)
    setTimeout(() => {
      router.push('/admin/leads')
    }, 1500)
  }

  if (assigned) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">线索已派发</h2>
          <p className="text-muted-foreground">已通知机构及时跟进</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回线索池</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{lead.parentName}</h1>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  lead.status === 'new' 
                    ? 'bg-green-100 text-green-700' 
                    : lead.status === 'contacted'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {lead.status === 'new' ? '新线索' : lead.status === 'contacted' ? '已联系' : '已派发'}
                </span>
              </div>
              <div className="text-muted-foreground mt-1">提交于 {lead.submitTime}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">线索信息</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">联系电话</div>
                    <div className="font-medium">{lead.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Baby className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">孩子年龄</div>
                    <div className="font-medium">{lead.childAge}岁</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">所在区域</div>
                    <div className="font-medium">{lead.location}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">家长需求</div>
                <div className="font-medium">{lead.demand}</div>
              </div>
            </div>

            {/* Assign to Institution */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">派发给机构</h2>
              <div className="space-y-3 mb-4">
                {allInstitutions.slice(0, 3).map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedInstitution(inst.id)}
                    className={`w-full p-4 rounded-lg text-left transition-colors flex items-center gap-4 ${
                      selectedInstitution === inst.id
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-sm text-muted-foreground">{inst.type} · {inst.studentCount}名学员</div>
                    </div>
                    {selectedInstitution === inst.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">备注信息</label>
                <Textarea
                  placeholder="添加备注信息给机构..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-muted/30 border-0"
                />
              </div>

              <Button 
                className="w-full gap-2"
                disabled={!selectedInstitution}
                onClick={handleAssign}
              >
                <Send className="w-4 h-4" />
                确认派发
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">跟进记录</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm">线索进入系统</div>
                    <div className="text-xs text-muted-foreground">{lead.submitTime}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">快捷操作</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  拨打电话
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageCircle className="w-4 h-4" />
                  发送短信
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
