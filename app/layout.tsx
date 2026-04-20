import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'Aarrikka — Ancient Skincare, Modern Skin',
    template: '%s | Aarrikka',
  },
  description:
    'Premium organic skincare formulated from ancient texts and household traditions. Every ingredient traced to its historical source.',
  keywords: ['organic skincare', 'ayurvedic skincare', 'natural skincare UK', 'ancient beauty secrets'],
  openGraph: {
    type:        'website',
    locale:      'en_GB',
    siteName:    'Aarrikka',
    title:       'Aarrikka — Ancient Skincare, Modern Skin',
    description: 'Premium organic skincare formulated from ancient texts and household traditions.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </CartProvider>
      </body>
    </html>
  )
}
