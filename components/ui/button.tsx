'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm',
  {
    variants: {
      variant: {
        primary:   'bg-brand-green text-white hover:bg-opacity-90 focus:ring-brand-green rounded-btn',
        secondary: 'border border-brand-green text-brand-green hover:bg-brand-green hover:text-white focus:ring-brand-green rounded-btn',
        ghost:     'text-brand-charcoal hover:bg-gray-100 rounded-btn',
        danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 rounded-btn',
      },
      size: {
        sm:   'px-4 py-2 text-xs',
        md:   'px-6 py-3',
        lg:   'px-8 py-4 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
