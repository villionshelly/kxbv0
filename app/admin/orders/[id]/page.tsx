'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building, CreditCard, Calendar, FileText, Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { recentOrders, allInstitutions } from '@/lib/mock-data'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const order = recentOrders.find(o => o.id === params.id) || recentOrders[0]
  const institution = allInstitutions.find(i => i.name === order.institution)

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
            <span>返回订单列表</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">订单详情</h1>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  已支付
                </span>
              </div>
              <div className="text-muted-foreground mt-1">订单号: {order.id}</div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              下载发票
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">订单信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">购买商品</div>
                      <div className="font-medium">{order.product}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">订单金额</div>
                    <div className="text-2xl font-bold text-primary">
                      {order.amount > 0 ? `¥${order.amount.toLocaleString()}` : '免费'}
                    </div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">支付方式</div>
                    <div className="text-lg font-medium">{order.payMethod}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">支付时间</div>
                    <div className="font-medium">{order.payTime}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Info */}
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">购买机构</h2>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{order.institution}</div>
                  <div className="text-sm text-muted-foreground">{institution?.type || '教育培训'}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => institution && router.push(`/admin/institutions/${institution.id}`)}
                >
                  查看详情
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">订单状态</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">支付成功</div>
                    <div className="text-xs text-muted-foreground">{order.payTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">服务已开通</div>
                    <div className="text-xs text-muted-foreground">{order.payTime}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="font-semibold mb-4">相关操作</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  申请退款
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  开具发票
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
