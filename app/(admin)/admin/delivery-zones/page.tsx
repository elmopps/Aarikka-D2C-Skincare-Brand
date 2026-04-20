'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Zone { id: string; name: string; regions: string[]; minDays: number; maxDays: number; shippingCost: number }

export default function DeliveryZonesPage() {
  const [zones, setZones]     = useState<Zone[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm]       = useState<Partial<Zone>>({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch('/api/admin/delivery-zones').then(r => r.json()).then(setZones)
  }, [])

  const startEdit = (zone: Zone) => {
    setEditing(zone.id)
    setForm({ minDays: zone.minDays, maxDays: zone.maxDays, shippingCost: zone.shippingCost })
  }

  const save = async (id: string) => {
    setSaving(true)
    const res = await fetch('/api/admin/delivery-zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form }),
    })
    if (res.ok) {
      const updated = await res.json()
      setZones(z => z.map(zone => zone.id === id ? updated : zone))
      setEditing(null)
      toast.success('Delivery zone updated')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl text-brand-green">Delivery Zones</h1>
        <p className="text-sm text-brand-sage mt-1">
          Update delivery windows and shipping costs per region without code changes.
        </p>
      </div>

      <div className="space-y-3">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white rounded-card border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-brand-charcoal">{zone.name}</p>
                <p className="text-xs text-brand-sage mt-0.5">{zone.regions.join(', ')}</p>
              </div>
              {editing !== zone.id && (
                <Button variant="secondary" size="sm" onClick={() => startEdit(zone)}>Edit</Button>
              )}
            </div>

            {editing === zone.id ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Input
                  label="Min Days"
                  type="number"
                  value={form.minDays ?? ''}
                  onChange={e => setForm(f => ({ ...f, minDays: parseInt(e.target.value, 10) }))}
                />
                <Input
                  label="Max Days"
                  type="number"
                  value={form.maxDays ?? ''}
                  onChange={e => setForm(f => ({ ...f, maxDays: parseInt(e.target.value, 10) }))}
                />
                <Input
                  label="Shipping Cost (£)"
                  type="number"
                  step="0.01"
                  value={form.shippingCost !== undefined ? form.shippingCost / 100 : ''}
                  onChange={e => setForm(f => ({ ...f, shippingCost: Math.round(parseFloat(e.target.value) * 100) }))}
                />
                <div className="col-span-3 flex gap-2">
                  <Button onClick={() => save(zone.id)} loading={saving} size="sm">Save</Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-6 text-sm">
                <span className="text-brand-charcoal">
                  <span className="text-brand-sage">Delivery: </span>
                  {zone.minDays}–{zone.maxDays} working days
                </span>
                <span className="text-brand-charcoal">
                  <span className="text-brand-sage">Shipping: </span>
                  {zone.shippingCost === 0 ? 'Free' : formatPrice(zone.shippingCost)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
