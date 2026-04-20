import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, Truck } from 'lucide-react'

const nav = [
  { href: '/admin/dashboard',       label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/products',        label: 'Products',       icon: Package },
  { href: '/admin/orders',          label: 'Orders',         icon: ShoppingCart },
  { href: '/admin/delivery-zones',  label: 'Delivery Zones', icon: Truck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-brand-green text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="font-serif text-lg font-semibold">Aarikka Elixirs</Link>
          <p className="text-xs text-white/50 mt-0.5">Admin Panel</p>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
            ← Back to store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
