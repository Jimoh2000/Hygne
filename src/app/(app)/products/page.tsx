'use client'

import { useQuery, useMutation } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { ShoppingBag, Star, ExternalLink, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createHash } from 'crypto'

const CATEGORIES = ['All','Skincare','Body Wash','Deodorant','Perfume','Dental','Hair Care','Feminine',"Men's Care"]

export default function ProductsPage() {
  const searchParams   = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'All'

  const convexUser = useQuery(api.users.getMe)
  const allProducts = useQuery(api.products.list, activeCategory !== 'All' ? { category: activeCategory } : {})
  const isPro = convexUser?.plan === 'pro'

  const products  = allProducts ?? []
  const featured  = products.filter(p => p.isFeatured)
  const regular   = products.filter(p => !p.isFeatured)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-gray-900 mb-1">Curated Products</h1>
        <p className="text-gray-500 text-sm">Hand-picked hygiene essentials. We earn a small commission — at no extra cost to you.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Link key={cat} href={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeCategory === cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-cream-200 hover:border-brand-200 hover:text-brand-700'}`}>
            {cat}
          </Link>
        ))}
      </div>

      {featured.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-gray-900 mb-4">Editor's picks</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(p => <ProductCard key={p._id} product={p} isPro={isPro} featured />)}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-gray-900 mb-4">All products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map(p => <ProductCard key={p._id} product={p} isPro={isPro} />)}
          </div>
        </section>
      )}

      {products.length === 0 && !allProducts && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse h-64 bg-cream-100 rounded-2xl" />)}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, isPro, featured = false }: { product: any; isPro: boolean; featured?: boolean }) {
  const trackClick = useMutation(api.products.trackClick)
  const isLocked   = product.isPremium && !isPro

  async function handleClick() {
    if (isLocked) return
    // Hash a simple session identifier for privacy
    const sessionId = typeof window !== 'undefined' ? (sessionStorage.getItem('sid') ?? (() => { const s = Math.random().toString(36).slice(2); sessionStorage.setItem('sid', s); return s })()) : undefined
    await trackClick({ productId: product._id as Id<'products'>, sessionId })
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card hoverable={!isLocked} className="flex flex-col">
      <div className="relative w-full h-40 rounded-xl bg-cream-100 mb-4 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-12 h-12 text-brand-200" />}
        {featured && <div className="absolute top-2 left-2"><Badge variant="pro">Editor's pick</Badge></div>}
        {isLocked && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center"><Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro only</Badge></div>}
      </div>
      <div className="flex-1 flex flex-col">
        <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-brand-600">${product.priceUsd}</span>
          {product.rating && <span className="flex items-center gap-1 text-xs text-gray-400"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{product.rating}</span>}
        </div>
        {isLocked ? (
          <Link href="/settings?checkout=pro"><Button variant="secondary" size="sm" className="w-full" leftIcon={<Crown className="w-3.5 h-3.5" />}>Unlock with Pro</Button></Link>
        ) : (
          <Button variant="secondary" size="sm" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />} onClick={handleClick}>View product</Button>
        )}
      </div>
    </Card>
  )
}
