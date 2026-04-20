import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import { Plus, Pencil } from 'lucide-react'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { reviews: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-brand-green">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-card border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs text-brand-sage uppercase tracking-wide font-medium">Product</th>
              <th className="text-left px-4 py-3 text-xs text-brand-sage uppercase tracking-wide font-medium">Category</th>
              <th className="text-left px-4 py-3 text-xs text-brand-sage uppercase tracking-wide font-medium">Price</th>
              <th className="text-left px-4 py-3 text-xs text-brand-sage uppercase tracking-wide font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-xs text-brand-sage uppercase tracking-wide font-medium">Reviews</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-charcoal">{p.name}</p>
                  <p className="text-xs text-brand-sage">SKU: {p.sku}</p>
                </td>
                <td className="px-4 py-3 text-brand-sage">{p.category.name}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-amber-600' : 'text-green-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-sage">{p._count.reviews}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-green hover:text-brand-gold">
                    <Pencil className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-brand-sage">No products yet. Add your first product.</div>
        )}
      </div>
    </div>
  )
}
