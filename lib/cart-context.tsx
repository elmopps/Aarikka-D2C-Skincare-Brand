'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface CartItemWithProduct {
  id: string
  sessionId: string
  productId: string
  qty: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
    stock: number
  }
}

interface CartContextValue {
  items: CartItemWithProduct[]
  itemCount: number
  subtotal: number
  loading: boolean
  addToCart: (productId: string, qty?: number) => Promise<void>
  updateQty: (itemId: string, qty: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
  sessionId: string
}

const CartContext = createContext<CartContextValue | null>(null)

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('cart_session_id')
  if (!id) {
    id = uuidv4()
    localStorage.setItem('cart_session_id', id)
  }
  return id
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]     = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const id = getOrCreateSessionId()
    setSessionId(id)
  }, [])

  const fetchCart = useCallback(async (sid: string) => {
    if (!sid) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cart?sessionId=${sid}`)
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionId) fetchCart(sessionId)
  }, [sessionId, fetchCart])

  const addToCart = async (productId: string, qty = 1) => {
    const sid = sessionId || getOrCreateSessionId()
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, productId, qty }),
    })
    if (res.ok) fetchCart(sid)
  }

  const updateQty = async (itemId: string, qty: number) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
    })
    if (res.ok) fetchCart(sessionId)
  }

  const removeItem = async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
    if (res.ok) fetchCart(sessionId)
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal  = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, loading, addToCart, updateQty, removeItem, clearCart, sessionId }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
