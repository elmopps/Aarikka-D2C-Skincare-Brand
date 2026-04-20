import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-green text-white">
      <div className="container-content py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <p className="font-serif text-xl font-semibold mb-3">Aarikka Elixirs</p>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Ancient skincare wisdom, rigorously sourced and made for modern skin.
            Every formulation is traced to its historical origin.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-white/80">
            {[
              ['Cleansers', '/category/cleansers'],
              ['Moisturisers', '/category/moisturisers'],
              ['Face Oils', '/category/face-oils'],
              ['Face Masks', '/category/face-masks'],
              ['Eye & Lip', '/category/eye-lip-care'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-brand-gold transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10">
        <div className="container-content py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Aarikka Elixirs. All rights reserved.</span>
          <span>Formulated from ancient wisdom. Made in the UK.</span>
        </div>
      </div>
    </footer>
  )
}
