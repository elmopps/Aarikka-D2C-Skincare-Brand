'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Category { id: string; name: string }
interface Ingredient { id: string; name: string; historicalSource: string }

export default function ProductFormPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'

  const [categories, setCategories]   = useState<Category[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const [form, setForm] = useState({
    name: '', slug: '', sku: '', categoryId: '', shortDescription: '',
    description: '', price: '', stock: '', images: '',
    featured: false, ingredientIds: [] as string[], featuredIngredientIds: [] as string[],
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
    fetch('/api/admin/ingredients').then(r => r.json()).then(setIngredients)
    if (!isNew) {
      fetch(`/api/admin/products/${id}`).then(r => r.json()).then(p => {
        setForm({
          name:             p.name,
          slug:             p.slug,
          sku:              p.sku,
          categoryId:       p.categoryId,
          shortDescription: p.shortDescription,
          description:      p.description,
          price:            String(p.price / 100),
          stock:            String(p.stock),
          images:           p.images.join('\n'),
          featured:         p.featured,
          ingredientIds:    p.ingredients.map((pi: { ingredientId: string }) => pi.ingredientId),
          featuredIngredientIds: p.ingredients.filter((pi: { isFeatured: boolean }) => pi.isFeatured).map((pi: { ingredientId: string }) => pi.ingredientId),
        })
      })
    }
  }, [id, isNew])

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(v => ({ ...v, [field]: e.target.value }))

  const toggleIngredient = (ingId: string) => {
    setForm(v => ({
      ...v,
      ingredientIds: v.ingredientIds.includes(ingId)
        ? v.ingredientIds.filter(i => i !== ingId)
        : [...v.ingredientIds, ingId],
    }))
  }

  const toggleFeatured = (ingId: string) => {
    setForm(v => ({
      ...v,
      featuredIngredientIds: v.featuredIngredientIds.includes(ingId)
        ? v.featuredIngredientIds.filter(i => i !== ingId)
        : [...v.featuredIngredientIds, ingId],
    }))
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      price:  Math.round(parseFloat(form.price) * 100),
      stock:  parseInt(form.stock, 10),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
    }
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(isNew ? 'Product created' : 'Product updated')
      router.push('/admin/products')
    } else {
      const err = await res.json()
      toast.error(err.error || 'Save failed')
    }
  }

  const deleteProduct = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setDeleting(false)
    toast.success('Product deleted')
    router.push('/admin/products')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-brand-green">{isNew ? 'New Product' : 'Edit Product'}</h1>
        {!isNew && (
          <Button variant="danger" size="sm" onClick={deleteProduct} loading={deleting}>Delete</Button>
        )}
      </div>

      <div className="bg-white rounded-card p-6 border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" required value={form.name} onChange={f('name')} />
          <Input label="Slug" required value={form.slug} onChange={f('slug')} placeholder="product-name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" required value={form.sku} onChange={f('sku')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-charcoal">Category</label>
            <select value={form.categoryId} onChange={f('categoryId')} className="input-field">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (£)" type="number" step="0.01" required value={form.price} onChange={f('price')} placeholder="24.99" />
          <Input label="Stock" type="number" required value={form.stock} onChange={f('stock')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-brand-charcoal">Short Description</label>
          <textarea value={form.shortDescription} onChange={f('shortDescription')} rows={2} className="input-field resize-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-brand-charcoal">Full Description</label>
          <textarea value={form.description} onChange={f('description')} rows={5} className="input-field resize-none" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-brand-charcoal">Image URLs (one per line)</label>
          <textarea value={form.images} onChange={f('images')} rows={3} className="input-field resize-none font-mono text-xs" placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="featured"
            type="checkbox"
            checked={form.featured}
            onChange={e => setForm(v => ({ ...v, featured: e.target.checked }))}
            className="w-4 h-4 accent-brand-green"
          />
          <label htmlFor="featured" className="text-sm text-brand-charcoal">Featured on homepage</label>
        </div>
      </div>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="bg-white rounded-card p-6 border border-gray-100 space-y-3">
          <h2 className="font-medium text-brand-charcoal text-sm">Ingredients</h2>
          <div className="space-y-2">
            {ingredients.map(ing => (
              <div key={ing.id} className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ingredientIds.includes(ing.id)}
                    onChange={() => toggleIngredient(ing.id)}
                    className="w-4 h-4 accent-brand-green"
                  />
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-brand-sage text-xs">{ing.historicalSource}</span>
                </label>
                {form.ingredientIds.includes(ing.id) && (
                  <label className="flex items-center gap-1.5 text-xs text-brand-gold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featuredIngredientIds.includes(ing.id)}
                      onChange={() => toggleFeatured(ing.id)}
                      className="w-3.5 h-3.5 accent-brand-gold"
                    />
                    Feature on page
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => router.push('/admin/products')} variant="secondary">Cancel</Button>
        <Button onClick={save} loading={saving}>
          {isNew ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
