import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md active:scale-[0.98] disabled:bg-brand-300',
  secondary:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 shadow-sm active:scale-[0.98] disabled:opacity-50',
  ghost:
    'text-brand-700 hover:bg-brand-50 active:scale-[0.98] disabled:opacity-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[0.98] disabled:opacity-50',
  outline:
    'border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50',
}

const sizes: Record<ButtonSize, string> = {
  sm:   'h-8 px-3 text-xs rounded-lg gap-1.5',
  md:   'h-10 px-5 text-sm rounded-xl gap-2',
  lg:   'h-12 px-7 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'

function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <svg
      className={cn('animate-spin', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
