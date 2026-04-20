'use client'

import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/format'
import { toast } from 'sonner'

interface Order {
  id: string
  orderRef: string
  guestName?: string
  guestEmail?: string
  status: string
  total: number
  createdAt: string
  estimatedDelivery: string
  items: { productName: string; qty: number }[]
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusColour: Record<string, string> = {
  PENDING:    'bg-gray-100 text-gray-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED:    'bg-blue-100 text-blue-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(o => o.map(ord => ord.id === id ? { ...ord, status } : ord))
      toast.success('Order updated')
    }
  }

  if (loading) return <div className="animate-pulse text-brand-sage">Loading orders...</div>

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-brand-green">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-brand-sage">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-serif font-semibold text-brand-green">{order.orderRef}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColour[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-brand-charcoal">{order.guestName ?? '—'}</p>
                  <p className="text-xs text-brand-sage">{order.guestEmail}</p>
                  <p className="text-xs text-brand-sage mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-charcoal">{formatPrice(order.total)}</p>
                  <p className="text-xs text-brand-sage mt-1">Est: {order.estimatedDelivery}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-4">
                <p className="text-xs text-brand-sage">
                  {order.items.map(i => `${i.productName} ×${i.qty}`).join(', ')}
                </p>
                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
