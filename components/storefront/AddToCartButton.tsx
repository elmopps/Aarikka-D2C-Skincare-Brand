'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { ShoppingBag, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  productId: string
  stock: number
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [qty, setQty]       = useState(1)
  const [loading, setLoading] = useState(false)
  const { addToCart }       = useCart()

  const handleAdd = async () => {
    if (stock === 0) return
    setLoading(true)
    await addToCart(productId, qty)
    setLoading(false)
    toast.success('Added to bag')
  }

  return (
    <div className="space-y-3">
      {/* Qty selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-brand-charcoal font-medium">Quantity</span>
        <div className="flex items-center border border-brand-sage rounded-btn overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-gray-50 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5 text-brand-charcoal" />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-brand-charcoal min-w-[2.5rem] text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty(q => Math.min(stock, q + 1))}
            className="px-3 py-2 hover:bg-gray-50 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5 text-brand-charcoal" />
          </button>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        loading={loading}
        disabled={stock === 0}
        size="lg"
        className="w-full gap-2"
      >
        <ShoppingBag className="w-4 h-4" />
        {stock === 0 ? 'Out of Stock' : 'Add to Bag'}
      </Button>
    </div>
  )
}
