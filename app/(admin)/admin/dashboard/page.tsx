import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import { ShoppingCart, TrendingUp, AlertTriangle, Package } from 'lucide-react'

async function getData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersToday, revenueData, lowStock, totalOrders, recentOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      select: { id: true, name: true, stock: true, sku: true },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
    prisma.order.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { select: { productName: true, qty: true } } },
    }),
  ])

  return {
    ordersToday,
    revenueMTD: revenueData._sum.total ?? 0,
    lowStock,
    totalOrders,
    recentOrders,
  }
}

export default async function AdminDashboard() {
  const { ordersToday, revenueMTD, lowStock, totalOrders, recentOrders } = await getData()

  const stats = [
    { label: 'Orders Today',      value: String(ordersToday),        icon: ShoppingCart, colour: 'text-blue-600'  },
    { label: 'Revenue MTD',       value: formatPrice(revenueMTD),    icon: TrendingUp,   colour: 'text-green-600' },
    { label: 'Total Orders',      value: String(totalOrders),        icon: Package,      colour: 'text-purple-600'},
    { label: 'Low Stock Alerts',  value: String(lowStock.length),    icon: AlertTriangle,colour: 'text-amber-600' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-brand-green">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-card p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-brand-sage uppercase tracking-wide">{label}</p>
              <Icon className={`w-4 h-4 ${colour}`} />
            </div>
            <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-card p-5 border border-gray-100 shadow-sm">
          <h2 className="font-medium text-brand-charcoal mb-4 text-sm uppercase tracking-wide">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-brand-sage text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-brand-charcoal">{order.orderRef}</p>
                    <p className="text-xs text-brand-sage">{order.guestName ?? order.userId ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'SHIPPED'   ? 'bg-blue-100 text-blue-700'   :
                      order.status === 'PROCESSING'? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-card p-5 border border-gray-100 shadow-sm">
          <h2 className="font-medium text-brand-charcoal mb-4 text-sm uppercase tracking-wide">Low Stock</h2>
          {lowStock.length === 0 ? (
            <p className="text-brand-sage text-sm">All products well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-brand-charcoal line-clamp-1">{p.name}</p>
                    <p className="text-xs text-brand-sage">SKU: {p.sku}</p>
                  </div>
                  <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
