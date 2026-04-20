import { ShieldCheck, Leaf, FlaskConical, BookOpen } from 'lucide-react'

const items = [
  { icon: BookOpen,     label: 'Traced to Source',       sub: 'Every formula references its ancient text' },
  { icon: Leaf,         label: '100% Organic',            sub: 'No synthetics, ever. Certified ingredients' },
  { icon: FlaskConical, label: 'Dermatologist Reviewed',  sub: 'Formulated and verified by skin specialists' },
  { icon: ShieldCheck,  label: 'No Greenwashing',         sub: 'We name the source, not just the claim' },
]

export function TrustBar() {
  return (
    <div className="border-y border-brand-gold/20 bg-brand-cream py-6">
      <div className="container-content grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-brand-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-brand-charcoal">{label}</p>
              <p className="text-xs text-brand-sage mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
