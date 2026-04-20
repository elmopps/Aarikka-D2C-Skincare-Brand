import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/storefront/ProductCard'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!cat) return { title: 'Category Not Found' }
  return { title: cat.name, description: cat.description }
}

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        include: { reviews: { select: { rating: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!category) notFound()

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="bg-brand-green text-white py-16">
        <div className="container-content">
          <p className="text-brand-gold text-xs uppercase tracking-widest mb-2">Aarrikka</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-3">{category.name}</h1>
          <p className="text-white/70 max-w-xl">{category.description}</p>
        </div>
      </div>

      <div className="container-content section-padding">
        {category.products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-sage text-lg">No products in this category yet.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-brand-sage mb-6">
              {category.products.length} product{category.products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
