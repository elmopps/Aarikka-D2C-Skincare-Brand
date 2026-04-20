'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, loading } = useCart()

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <ShoppingBag className="w-16 h-16 text-brand-sage" />
        <h1 className="font-serif text-3xl text-brand-green">Your bag is empty</h1>
        <p className="text-brand-sage max-w-sm">
          Discover our range of ancient-formula skincare and find something your skin will love.
        </p>
        <Link href="/" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-content section-padding">
        <h1 className="font-serif text-3xl text-brand-green mb-8">Your Bag</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-24 shrink-0 rounded bg-gray-50 overflow-hidden">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-medium text-brand-charcoal hover:text-brand-green text-sm leading-snug line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-brand-charcoal font-semibold mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-btn overflow-hidden">
                      <button
                        onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeItem(item.id)}
                        className="px-2.5 py-1.5 hover:bg-gray-50"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item total + remove */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        {formatPrice(item.product.price * item.qty)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-brand-sage hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit space-y-4">
            <h2 className="font-serif text-xl text-brand-green">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-charcoal/70">
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-charcoal/70">
                <span>Shipping</span>
                <span className="text-brand-sage text-xs">Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-brand-charcoal">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
            <Link href="/" className="btn-secondary w-full text-center block">
              Continue Shopping
            </Link>
            <p className="text-xs text-brand-sage text-center">
              Cash on Delivery — pay when your order arrives
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
