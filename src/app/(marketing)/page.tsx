import React from 'react'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Sparkles, Users, BookOpen, ShoppingBag, CheckCircle, Lock, Globe, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Expert Hygiene Tips',
    description: 'Science-backed advice across body care, dental, skincare, and more. Updated weekly by health professionals.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: 'Curated Products',
    description: 'Handpicked perfumes, creams, pads, and personal care essentials — no ads, just honest recommendations.',
    color: 'bg-blush-50 text-blush-600',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Anonymous Community',
    description: 'Ask sensitive hygiene questions without fear. Get real answers from a supportive, judgment-free community.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Multilingual',
    description: 'Available in English, Portuguese, Spanish, French, Japanese, and Chinese — hygiene advice for everyone.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Privacy First',
    description: 'Anonymous posting, encrypted data, and zero data selling. Your health questions stay private — always.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Pro Insights',
    description: 'Unlock premium tips, in-depth guides, and exclusive product deals with a Pro membership.',
    color: 'bg-brand-50 text-brand-600',
  },
]

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started.',
    features: [
      'Access to free hygiene tips',
      'Browse curated products',
      'Community posts & replies',
      'Anonymous Q&A',
      '5 premium tip previews/month',
    ],
    cta: 'Get started free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$7',
    period: 'per month',
    yearlyPrice: '$59',
    description: 'For those serious about their hygiene routine.',
    features: [
      'Everything in Free',
      'Unlimited premium tips',
      'Exclusive product deals',
      'Early access to new content',
      'Priority community support',
      'No advertisements',
      'Cancel any time',
    ],
    cta: 'Start 7-day free trial',
    href: '/signup?plan=pro',
    highlight: true,
  },
]

const testimonials = [
  {
    quote: "HGyne changed how I think about my daily routine. The anonymous community is such a safe space.",
    name: "Amara K.",
    role: "Pro member",
    avatar: "AK",
  },
  {
    quote: "Finally, hygiene advice that doesn't feel like it was written by a robot. The product recommendations are genuinely good.",
    name: "Lucas M.",
    role: "Free member",
    avatar: "LM",
  },
  {
    quote: "I asked a question I was too embarrassed to Google and got 12 helpful replies within an hour.",
    name: "Yuki T.",
    role: "Pro member",
    avatar: "YT",
  },
]

const categories = [
  { label: 'Body Care',    emoji: '🧴' },
  { label: 'Dental',       emoji: '🦷' },
  { label: 'Skincare',     emoji: '✨' },
  { label: 'Hair Care',    emoji: '💆' },
  { label: 'Feminine',     emoji: '🌸' },
  { label: 'Fragrance',    emoji: '🌿' },
  { label: 'Men\'s Care',  emoji: '🧔' },
  { label: 'Gut & Diet',   emoji: '🥗' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-blush-100/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Your personal hygiene advisor
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-brand-900 leading-[1.08] tracking-tight mb-6 animate-slide-up">
              Feel confident
              <span className="block text-gradient mt-1">in your skin.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Expert hygiene tips, curated product recommendations, and an
              anonymous community — all in one judgment-free space.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start for free
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="secondary">
                  Browse community
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex -space-x-2">
                {['AK', 'LM', 'YT', 'RB'].map(init => (
                  <div key={init} className="w-8 h-8 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center text-xs font-medium text-brand-700">
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-gray-500">Trusted by 12,000+ people worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-cream-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <Link
                key={cat.label}
                href={`/tips?category=${cat.label.toLowerCase().replace(' ', '-')}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Everything you need</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-4">
            Hygiene advice, simplified
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            No more scattered Google searches. HGyne brings everything together — evidence-based, beautifully organised, and always respectful.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="card-base p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                {feat.icon}
              </div>
              <h3 className="font-serif text-lg text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community Snippet ─────────────────────────────────────────────── */}
      <section className="bg-brand-900 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label text-brand-400 mb-3">Anonymous community</p>
              <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6">
                Ask the questions you're afraid to Google
              </h2>
              <p className="text-brand-200 text-lg leading-relaxed mb-8">
                Body odour, intimate hygiene, skin conditions — nothing is off limits.
                Our community answers with empathy, not judgment.
              </p>
              <Link href="/community">
                <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Browse questions
                </Button>
              </Link>
            </div>

            {/* Community preview cards */}
            <div className="space-y-3">
              {[
                { q: 'What deodorant actually works for hyperhidrosis?', replies: 14, tag: 'Body Care' },
                { q: 'How often should I really wash my hair?', replies: 23, tag: 'Hair Care' },
                { q: 'Best feminine wash that isn\'t too harsh?', replies: 18, tag: 'Feminine' },
              ].map(post => (
                <div key={post.q} className="bg-brand-800 rounded-2xl p-4 border border-brand-700 hover:border-brand-500 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-white text-sm font-medium leading-snug flex-1">{post.q}</p>
                    <Badge variant="default" className="bg-brand-700 text-brand-200 flex-shrink-0">{post.tag}</Badge>
                  </div>
                  <p className="text-brand-400 text-xs mt-2">{post.replies} replies · Anonymous</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Loved by members</p>
            <h2 className="font-serif text-4xl text-gray-900">What people are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card-base p-6">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Simple pricing</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-4">
            Start free, upgrade when ready
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            No credit card required. Cancel anytime. Payments handled securely by Paddle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {tiers.map(tier => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 border transition-all ${
                tier.highlight
                  ? 'bg-brand-900 border-brand-700 shadow-glow'
                  : 'bg-white border-cream-200 shadow-card'
              }`}
            >
              {tier.highlight && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-700 text-brand-200 text-xs font-medium mb-4">
                  <Sparkles className="w-3 h-3" />
                  Most popular
                </div>
              )}
              <h3 className={`font-serif text-2xl mb-1 ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mb-6 ${tier.highlight ? 'text-brand-300' : 'text-gray-500'}`}>
                {tier.description}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`font-serif text-5xl font-bold ${tier.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ${tier.highlight ? 'text-brand-300' : 'text-gray-400'}`}>
                  / {tier.period}
                </span>
              </div>

              <Link href={tier.href} className="block mb-8">
                <Button
                  className="w-full"
                  variant={tier.highlight ? 'secondary' : 'primary'}
                  size="lg"
                >
                  {tier.cta}
                </Button>
              </Link>

              <ul className="space-y-3">
                {tier.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-brand-400' : 'text-brand-500'}`} />
                    <span className={`text-sm ${tier.highlight ? 'text-brand-200' : 'text-gray-600'}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400">
          <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure payments</div>
          <div className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Cancel anytime</div>
          <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 180+ countries</div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-5">
            Ready to feel your best?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Join 12,000+ people building better hygiene habits. Free forever.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-brand-700 hover:bg-cream-50"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create your free account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
