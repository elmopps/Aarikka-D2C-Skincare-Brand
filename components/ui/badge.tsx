import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'sage' | 'success'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-brand-charcoal text-white': variant === 'default',
          'bg-brand-gold text-white':     variant === 'gold',
          'bg-brand-sage text-white':     variant === 'sage',
          'bg-green-100 text-green-800':  variant === 'success',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
