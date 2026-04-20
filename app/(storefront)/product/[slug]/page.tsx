import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/format'
import { IngredientCard } from '@/components/storefront/IngredientCard'
import { PostcodeEstimator } from '@/components/storefront/PostcodeEstimator'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/storefront/AddToCartButton'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: product.images[0] ? [product.images[0]] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      ingredients: {
        where: { isFeatured: true },
        include: { ingredient: true },
      },
    },
  })

  if (!product) notFound()

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: product.reviews.filter(r => r.rating === star).length,
  }))

  return (
    <div className="pt-20">
      <div className="container-content section-padding">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-card overflow-hidden bg-gray-50">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-brand-sage text-sm">No image</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative aspect-square rounded bg-gray-50 overflow-hidden">
                    <Image src={img} alt={`${product.name} view ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <p className="text-xs text-brand-sage">
              <a href={`/category/${product.category.slug}`} className="hover:text-brand-green">
                {product.category.name}
              </a>{' '}
              / {product.name}
            </p>

            <div>
              <p className="text-xs text-brand-sage uppercase tracking-wider mb-1">SKU: {product.sku}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-brand-green font-semibold mb-2">
                {product.name}
              </h1>

              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={avgRating} size="md" />
                  <span className="text-sm text-brand-sage">
                    {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            <p className="font-sans text-3xl font-bold text-brand-charcoal">
              {formatPrice(product.price)}
            </p>

            <p className="text-brand-charcoal/80 text-sm leading-relaxed">
              {product.shortDescription}
            </p>

            <AddToCartButton productId={product.id} stock={product.stock} />

            <PostcodeEstimator />

            {/* Payment note */}
            <div className="flex items-center gap-2 text-xs text-brand-sage border border-gray-100 rounded-btn px-3 py-2">
              <span>💳</span>
              <span>Cash on Delivery — pay when your order arrives</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl text-brand-green mb-4">About This Product</h2>
            <p className="text-sm text-brand-charcoal/80 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Featured Ingredients */}
        {product.ingredients.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <p className="text-brand-gold text-xs uppercase tracking-widest mb-1">Traced to Source</p>
              <h2 className="font-serif text-2xl text-brand-green">Key Ancient Ingredients</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.ingredients.map(pi => (
                <IngredientCard key={pi.ingredientId} ingredient={pi.ingredient} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-brand-green mb-6">
            Customer Reviews ({product.reviews.length})
          </h2>

          {product.reviews.length === 0 ? (
            <p className="text-brand-sage text-sm">No reviews yet. Be the first to review this product.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Rating summary */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-serif text-5xl font-bold text-brand-green">{avgRating.toFixed(1)}</p>
                  <StarRating rating={avgRating} size="md" className="justify-center mt-1" />
                  <p className="text-xs text-brand-sage mt-1">{product.reviews.length} reviews</p>
                </div>
                <div className="space-y-2">
                  {ratingBreakdown.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-brand-sage">{star}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-brand-gold rounded-full"
                          style={{ width: product.reviews.length > 0 ? `${(count / product.reviews.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="w-4 text-brand-sage text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="md:col-span-2 space-y-6">
                {product.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-brand-charcoal">
                          {review.user?.name ?? review.guestName ?? 'Anonymous'}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        {review.verifiedPurchase && (
                          <Badge variant="success">Verified Purchase</Badge>
                        )}
                        <p className="text-xs text-brand-sage">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-brand-charcoal/80 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
