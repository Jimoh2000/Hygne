'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { User, CreditCard, Globe, Shield, Crown, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { api } from '../../../../convex/_generated/api'

declare global { interface Window { Paddle: any } }

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },  { code: 'zh', label: '中文' },
]

export default function SettingsPage() {
  const params       = useSearchParams()
  const { user }     = useUser()
  const convexUser   = useQuery(api.users.getMe)
  const subscription = useQuery(api.users.getMySubscription)
  const updateProfile = useMutation(api.users.updateProfile)

  const [activeTab, setActiveTab]     = useState('profile')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [language, setLanguage]       = useState('en')
  const [paddleReady, setPaddleReady] = useState(false)

  // Sync form state from Convex user
  useEffect(() => {
    if (convexUser) {
      setDisplayName(convexUser.displayName ?? '')
      setLanguage(convexUser.preferredLanguage ?? 'en')
    }
  }, [convexUser])

  // Load Paddle.js
  useEffect(() => {
    const script    = document.createElement('script')
    script.src      = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload   = () => {
      window.Paddle.Environment.set(process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox')
      window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN })
      setPaddleReady(true)
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Auto-open checkout if redirected with ?checkout=pro
  useEffect(() => {
    if (params.get('checkout') === 'pro' && paddleReady) {
      setActiveTab('billing')
      setTimeout(() => openCheckout('monthly'), 500)
    }
  }, [params, paddleReady])

  function openCheckout(period: 'monthly' | 'yearly') {
    if (!paddleReady || !convexUser) return
    window.Paddle.Checkout.open({
      items: [{ priceId: period === 'monthly' ? process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID : process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID, quantity: 1 }],
      customData: { user_id: convexUser._id },
      customer: { email: convexUser.email },
    })
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile({ displayName, preferredLanguage: language })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleCancelSubscription() {
    if (!subscription || !confirm('Cancel your Pro subscription? Access continues until the end of your billing period.')) return
    await fetch('/api/paddle/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: subscription.paddleSubscriptionId }),
    })
    window.location.reload()
  }

  const isPro = convexUser?.plan === 'pro'
  const tabs  = [
    { id: 'profile',  label: 'Profile',   icon: User },
    { id: 'billing',  label: 'Billing',   icon: CreditCard },
    { id: 'language', label: 'Language',  icon: Globe },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-1 p-1 bg-cream-100 rounded-xl w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card className="max-w-lg space-y-5">
          <h2 className="font-serif text-xl text-gray-900 mb-4">Profile information</h2>
          <FormField label="Email address">
            <Input value={convexUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? ''} disabled className="opacity-60" />
          </FormField>
          <FormField label="Display name">
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
          </FormField>
          <Button onClick={handleSave} loading={saving} leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : undefined} variant={saved ? 'secondary' : 'primary'}>
            {saved ? 'Saved!' : 'Save changes'}
          </Button>
        </Card>
      )}

      {activeTab === 'billing' && (
        <div className="max-w-lg space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-gray-900">Current plan</h2>
              <Badge variant={isPro ? 'pro' : 'default'} icon={isPro ? <Crown className="w-3 h-3" /> : undefined}>{isPro ? 'Pro' : 'Free'}</Badge>
            </div>
            {isPro && subscription ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`font-medium ${subscription.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>{subscription.status}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Billing</span><span className="font-medium capitalize">{subscription.plan}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Next renewal</span><span className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span></div>
                {subscription.cancelAtPeriodEnd && <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-600"><AlertCircle className="w-4 h-4 flex-shrink-0" />Cancels at end of billing period</div>}
                {!subscription.cancelAtPeriodEnd && <button onClick={handleCancelSubscription} className="text-xs text-red-400 hover:text-red-600 transition-colors mt-2">Cancel subscription</button>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Upgrade to Pro for $7/month to unlock all premium content.</p>
            )}
          </Card>

          {!isPro && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ period: 'monthly' as const, price: '$7', sub: '/month', badge: null }, { period: 'yearly' as const, price: '$59', sub: '/year', badge: 'Save 30%' }].map(plan => (
                <Card key={plan.period} className={plan.period === 'yearly' ? 'border-brand-300 relative overflow-hidden' : ''}>
                  {plan.badge && <div className="absolute top-3 right-3"><Badge variant="success">{plan.badge}</Badge></div>}
                  <p className="text-xs text-gray-400 capitalize mb-1">{plan.period}</p>
                  <p className="font-serif text-3xl font-bold text-gray-900 mb-1">{plan.price}</p>
                  <p className="text-xs text-gray-400 mb-4">{plan.sub}</p>
                  <Button className="w-full" variant={plan.period === 'yearly' ? 'primary' : 'secondary'} onClick={() => openCheckout(plan.period)} disabled={!paddleReady}>
                    {paddleReady ? `Start ${plan.period} trial` : 'Loading…'}
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Shield className="w-3.5 h-3.5" />Payments secured by Paddle. Cancel anytime.
          </div>
        </div>
      )}

      {activeTab === 'language' && (
        <Card className="max-w-lg">
          <h2 className="font-serif text-xl text-gray-900 mb-4">Language preference</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${language === lang.code ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-cream-200 text-gray-600 hover:border-brand-200'}`}>
                {lang.label}
              </button>
            ))}
          </div>
          <Button onClick={handleSave} loading={saving}>{saved ? 'Saved!' : 'Save preference'}</Button>
        </Card>
      )}
    </div>
  )
}
