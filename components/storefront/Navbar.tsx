'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/category/cleansers',    label: 'Cleansers' },
  { href: '/category/moisturisers', label: 'Moisturisers' },
  { href: '/category/face-oils',    label: 'Face Oils' },
  { href: '/category/face-masks',   label: 'Face Masks' },
  { href: '/category/eye-lip-care', label: 'Eye & Lip' },
]

export function Navbar() {
  const { itemCount } = useCart()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white border-b border-gray-100 shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container-content flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className={cn('font-serif text-xl font-semibold tracking-wide', scrolled ? 'text-brand-green' : 'text-white')}>
          Aarrikka
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-sm hover:text-brand-gold transition-colors',
                  scrolled ? 'text-brand-charcoal' : 'text-white/90'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingBag
              className={cn('w-5 h-5', scrolled ? 'text-brand-charcoal' : 'text-white')}
            />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X className={cn('w-5 h-5', scrolled ? 'text-brand-charcoal' : 'text-white')} />
              : <Menu className={cn('w-5 h-5', scrolled ? 'text-brand-charcoal' : 'text-white')} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-brand-charcoal text-sm py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
