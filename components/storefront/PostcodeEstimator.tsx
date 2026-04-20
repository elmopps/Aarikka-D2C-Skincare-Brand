'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Truck } from 'lucide-react'
import { formatPrice } from '@/lib/format'

export function PostcodeEstimator() {
  const [postcode, setPostcode]   = useState('')
  const [result, setResult]       = useState<{ label: string; cost: number; zoneName: string } | null>(null)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const check = async () => {
    if (!postcode.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/postcode/${encodeURIComponent(postcode.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.zone) {
        setError('Could not find that postcode. Please check and try again.')
      } else {
        setResult({ label: data.label, cost: data.zone.shippingCost, zoneName: data.zone.name })
      }
    } catch {
      setError('Delivery estimate unavailable right now. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-brand-charcoal">
        <Truck className="w-4 h-4 text-brand-green" />
        Delivery Estimate
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter postcode, e.g. EC1A 1BB"
          value={postcode}
          onChange={e => setPostcode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          className="flex-1"
        />
        <Button onClick={check} loading={loading} size="sm">Check</Button>
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {result && (
        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-btn text-sm">
          <MapPin className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-brand-green">
              {result.label} to {result.zoneName}
            </p>
            <p className="text-brand-sage text-xs mt-0.5">
              Delivery: {result.cost === 0 ? 'Free' : formatPrice(result.cost)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
