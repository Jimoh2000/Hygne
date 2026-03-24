import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const pxSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 }

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function getColor(name: string): string {
  const colors = [
    'bg-brand-100 text-brand-700',
    'bg-blush-100 text-blush-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = pxSizes[size]

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizes[size], className)}>
        <Image src={src} alt={name ?? 'User'} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }

  const initials = name ? getInitials(name) : '?'
  const colorClass = name ? getColor(name) : 'bg-gray-100 text-gray-500'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium flex-shrink-0',
        sizes[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
