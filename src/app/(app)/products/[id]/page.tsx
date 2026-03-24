'use client'

import { useQuery, useMutation } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'
import { ArrowLeft, ExternalLink, Star, ShoppingBag, Shield, Crown, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ProductPage() {
  const { id }      = useParams<{ id: string }>()
  const convexUser  = useQuery(api.users.getMe)
  const product     = useQuery(api.products.getById, { id: id as Id<'products'> })
  const related     = useQuery(
    api.products.getRelated,
    product ? { category: product.category, excludeId: product._id } : 'skip'
  )
  const trackClick  = useMutation(api.products.trackClick)

  const isPro      = convexUser?.plan === 'pro'

  if (product === undefined) return <div className="animate-pulse h-96 bg-cream-100 rounded-2xl" />
  if (product === null) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Product not found.</p>
      <Link href="/products" className="text-brand-600 text-sm hover:underline mt-2 block">Back to products</Link>
    </div>
  )

  const isLocked = product.isPremium && !isPro

  async function handleBuy() {
    if (isLocked) return
    const sessionId = typeof window !== 'undefined'
      ? (sessionStorage.getItem('sid') ?? (() => {
          const s = Math.random().toString(36).slice(2)
          sessionStorage.setItem('sid', s)
          return s
        })())
      : undefined
    await trackClick({ productId: product._id, sessionId })
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl bg-cream-100 flex items-center justify-center overflow-hidden">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : <ShoppingBag className="w-20 h-20 text-brand-200" />}
          {product.isFeatured && (
            <div className="absolute top-4 left-4"><Badge variant="pro">Editor's pick</Badge></div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">{product.category}</Badge>
            {product.isPremium && <Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro</Badge>}
          </div>

          <p className="text-sm text-gray-400 font-medium mb-1">{product.brand}</p>
          <h1 className="font-serif text-3xl text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {product.rating && (
            <div className="flex items-center gap-1.5 mb-4">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-sm text-gray-400 ml-1">{product.rating}/5</span>
            </div>
          )}

          <p className="text-gray-600 leading-relaxed mb-6 text-sm">{product.description}</p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-serif text-4xl font-bold text-brand-700">${product.priceUsd}</span>
            <span className="text-sm text-gray-400">{product.currency}</span>
          </div>

          {isLocked ? (
            <div className="space-y-3">
              <Link href="/settings?checkout=pro">
                <Button className="w-full" size="lg" leftIcon={<Crown className="w-4 h-4" />}>Unlock with Pro — $7/mo</Button>
              </Link>
              <p className="text-xs text-center text-gray-400">7-day free trial · Cancel anytime</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button className="w-full" size="lg" rightIcon={<ExternalLink className="w-4 h-4" />} onClick={handleBuy}>
                Shop this product
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                Affiliate link — we may earn a small commission at no extra cost to you
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-cream-100 grid grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, label: 'Hand-picked' },
              { icon: Shield,       label: 'Trusted brands' },
              { icon: Star,         label: 'Editor approved' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <item.icon className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl text-gray-900 mb-6">More {product.category} picks</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r._id} href={`/products/${r._id}`}>
                <Card hoverable className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cream-100 mx-auto mb-3 flex items-center justify-center">
                    {r.imageUrl
                      ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover rounded-2xl" />
                      : <ShoppingBag className="w-6 h-6 text-brand-200" />}
                  </div>
                  <p className="text-xs text-gray-400 mb-0.5">{r.brand}</p>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{r.name}</p>
                  <p className="text-brand-600 font-semibold text-sm mt-1">${r.priceUsd}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
