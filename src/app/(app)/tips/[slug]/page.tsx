'use client'

import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../../../../convex/_generated/api'
import { ArrowLeft, Clock, Crown, Lock, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default function TipPage() {
  const { slug }   = useParams<{ slug: string }>()
  const convexUser = useQuery(api.users.getMe)
  const tip        = useQuery(api.tips.getBySlug, { slug })
  const related    = useQuery(
    api.tips.getRelated,
    tip ? { category: tip.category, excludeId: tip._id } : 'skip'
  )

  const isPro    = convexUser?.plan === 'pro'
  const isLocked = tip?.isPremium && !isPro

  if (tip === undefined) return <div className="animate-pulse h-96 bg-cream-100 rounded-2xl" />
  if (tip === null) return <div className="text-center py-20"><p className="text-gray-500">Tip not found.</p></div>

  return (
    <article className="max-w-2xl mx-auto animate-fade-in">
      <Link href="/tips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Back to tips
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="default">{tip.category}</Badge>
        {tip.isPremium && <Badge variant="premium" icon={<Crown className="w-3 h-3" />}>Pro</Badge>}
        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {tip.readTimeMinutes} min read</span>
        <span className="text-xs text-gray-400 ml-auto">{formatDate(tip.createdAt)}</span>
      </div>

      <h1 className="font-serif text-4xl text-gray-900 leading-tight mb-4">{tip.title}</h1>
      <p className="text-lg text-gray-500 mb-8 leading-relaxed">{tip.excerpt}</p>

      {tip.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tip.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 text-xs text-gray-600">
              <Tag className="w-3 h-3" /> {tag}
            </span>
          ))}
        </div>
      )}

      {isLocked ? (
        <div className="relative">
          <div className="prose-hgyne blur-sm select-none pointer-events-none" aria-hidden>
            <p>{tip.body.slice(0, 400)}...</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card-base p-8 text-center max-w-sm mx-4 shadow-card-hover">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-brand-500" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Pro members only</h2>
              <p className="text-gray-500 text-sm mb-6">Upgrade to Pro for unlimited access to all premium tips.</p>
              <Link href="/settings?checkout=pro">
                <Button className="w-full" leftIcon={<Crown className="w-4 h-4" />}>Unlock with Pro — $7/mo</Button>
              </Link>
              <p className="text-xs text-gray-400 mt-3">7-day free trial · Cancel anytime</p>
            </div>
          </div>
          <div className="h-72" />
        </div>
      ) : (
        <div className="prose-hgyne" dangerouslySetInnerHTML={{ __html: tip.body }} />
      )}

      {related && related.length > 0 && (
        <section className="mt-16 pt-8 border-t border-cream-200">
          <h2 className="font-serif text-2xl text-gray-900 mb-4">More {tip.category} tips</h2>
          <div className="space-y-3">
            {related.map(r => (
              <Link key={r._id} href={`/tips/${r.slug}`}
                className="flex items-center justify-between p-4 rounded-xl border border-cream-200 bg-white hover:border-brand-200 hover:bg-brand-50 transition-all">
                <span className="text-sm font-medium text-gray-800">{r.title}</span>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{r.readTimeMinutes} min</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
