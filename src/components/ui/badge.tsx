import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'pro' | 'premium' | 'success' | 'warning' | 'danger' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-cream-100 text-brand-700',
  pro:      'bg-brand-100 text-brand-700',
  premium:  'bg-amber-50 text-amber-700 border border-amber-200',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-orange-50 text-orange-700',
  danger:   'bg-red-50 text-red-600',
  outline:  'border border-gray-200 text-gray-600',
}

export function Badge({ variant = 'default', icon, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  )
}
