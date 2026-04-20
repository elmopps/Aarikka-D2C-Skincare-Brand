import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { StarRating } from '@/components/ui/star-rating'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    shortDescription: string
    images: string[]
    reviews: { rating: number }[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-gray-50 mb-3">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-cream">
            <span className="text-brand-sage text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-brand-sage uppercase tracking-wide">Aarikka Elixirs</p>
        <h3 className="text-brand-charcoal font-medium text-sm leading-snug group-hover:text-brand-green transition-colors">
          {product.name}
        </h3>
        {product.reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={avgRating} />
            <span className="text-xs text-brand-sage">({product.reviews.length})</span>
          </div>
        )}
        <p className="font-sans font-semibold text-brand-charcoal">{formatPrice(product.price)}</p>
      </div>
    </Link>
  )
}
