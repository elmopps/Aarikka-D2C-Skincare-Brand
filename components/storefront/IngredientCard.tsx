interface IngredientCardProps {
  ingredient: {
    name: string
    historicalSource: string
    originRegion: string
    skinBenefit: string
  }
}

export function IngredientCard({ ingredient }: IngredientCardProps) {
  return (
    <div className="border border-brand-gold/30 bg-brand-cream rounded-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-serif text-base font-semibold text-brand-green">{ingredient.name}</h4>
        <span className="text-[10px] text-brand-gold uppercase tracking-widest whitespace-nowrap">Ancient Origin</span>
      </div>
      <p className="text-xs text-brand-sage italic">{ingredient.historicalSource}</p>
      <p className="text-xs text-brand-sage">From: {ingredient.originRegion}</p>
      <p className="text-sm text-brand-charcoal">{ingredient.skinBenefit}</p>
    </div>
  )
}
