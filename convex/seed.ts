import { mutation } from './_generated/server'
import { now } from './helpers'

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Only seed if empty
    const existing = await ctx.db.query('hygieneTips').first()
    if (existing) return { message: 'Database already seeded' }

    // Seed categories
    const categoryData = [
      { name: 'Body Care',   slug: 'body-care',  icon: '🧴', sortOrder: 1 },
      { name: 'Dental',      slug: 'dental',     icon: '🦷', sortOrder: 2 },
      { name: 'Skincare',    slug: 'skincare',   icon: '✨', sortOrder: 3 },
      { name: 'Hair Care',   slug: 'hair-care',  icon: '💆', sortOrder: 4 },
      { name: 'Feminine',    slug: 'feminine',   icon: '🌸', sortOrder: 5 },
      { name: 'Fragrance',   slug: 'fragrance',  icon: '🌿', sortOrder: 6 },
      { name: "Men's Care",  slug: 'mens-care',  icon: '🧔', sortOrder: 7 },
      { name: 'Gut & Diet',  slug: 'gut-diet',   icon: '🥗', sortOrder: 8 },
    ]
    for (const cat of categoryData) {
      await ctx.db.insert('categories', cat)
    }

    // Seed tips
    const tips = [
      {
        title: 'How to choose the right deodorant for your skin type',
        slug:  'choose-right-deodorant',
        excerpt: "Not all deodorants are created equal. Here's how to find the one that actually works for your body chemistry.",
        body: '<h2>Understanding deodorant vs antiperspirant</h2><p>Deodorants mask odour while antiperspirants block sweat. If you sweat heavily, look for a clinical-strength antiperspirant with at least 20% aluminium compounds.</p><h2>For sensitive skin</h2><p>Choose alcohol-free formulas with soothing ingredients like aloe vera or shea butter.</p>',
        category: 'Body Care', tags: ['deodorant', 'sweat', 'body odour'],
        isPremium: false, published: true, readTimeMinutes: 4,
      },
      {
        title: 'The complete guide to oil cleansing for every skin type',
        slug:  'oil-cleansing-guide',
        excerpt: "Oil cleansing dissolves makeup and sebum without stripping your skin's natural barrier.",
        body: '<h2>What is oil cleansing?</h2><p>The oil cleansing method uses oils to dissolve and remove dirt. Like dissolves like — facial oils bind to the oils on your skin.</p><h2>Best oils by skin type</h2><p>Dry skin: jojoba or rosehip. Oily skin: grapeseed or hemp seed.</p>',
        category: 'Skincare', tags: ['cleansing', 'skincare', 'oily skin'],
        isPremium: false, published: true, readTimeMinutes: 5,
      },
      {
        title: 'Why your teeth turn yellow and how to prevent it',
        slug:  'teeth-yellowing-prevention',
        excerpt: 'Tooth discolouration is often preventable. Here are the main culprits and what actually works.',
        body: '<h2>The main causes</h2><p>Coffee, tea, red wine, and tobacco are the biggest staining culprits.</p><h2>Prevention</h2><p>Rinse with water after staining drinks. Wait 30 minutes before brushing after acidic foods.</p>',
        category: 'Dental', tags: ['teeth', 'whitening', 'oral care'],
        isPremium: false, published: true, readTimeMinutes: 4,
      },
      {
        title: 'The science-backed hair washing schedule for your hair type',
        slug:  'hair-washing-schedule',
        excerpt: 'Washing too often strips natural oils. Washing too rarely causes buildup.',
        body: '<h2>Fine or oily hair</h2><p>Wash every 1–2 days. Fine hair gets weighed down quickly.</p><h2>Thick or coily hair</h2><p>Once a week or bi-weekly is fine. Over-washing strips moisture.</p>',
        category: 'Hair Care', tags: ['hair washing', 'scalp', 'sebum'],
        isPremium: true, published: true, readTimeMinutes: 6,
      },
    ]

    for (const tip of tips) {
      await ctx.db.insert('hygieneTips', { ...tip, createdAt: now(), updatedAt: now() })
    }

    // Seed products
    const products = [
      {
        name: 'Native Deodorant — Coconut & Vanilla', brand: 'Native',
        description: 'Aluminum-free deodorant with clean ingredients. Lasts all day without irritating sensitive skin.',
        affiliateUrl: 'https://native.com', category: 'Body Care',
        priceUsd: 12, currency: 'USD', isFeatured: true, isPremium: false,
        published: true, clickCount: 0, rating: 4.5,
      },
      {
        name: 'CeraVe Hydrating Cleanser', brand: 'CeraVe',
        description: 'Gentle daily facial cleanser with ceramides and hyaluronic acid. Dermatologist recommended.',
        affiliateUrl: 'https://cerave.com', category: 'Skincare',
        priceUsd: 15, currency: 'USD', isFeatured: true, isPremium: false,
        published: true, clickCount: 0, rating: 4.8,
      },
      {
        name: "Listerine Total Care Mouthwash", brand: 'Listerine',
        description: 'Kills 99.9% of germs that cause bad breath, plaque, and gingivitis.',
        affiliateUrl: 'https://listerine.com', category: 'Dental',
        priceUsd: 8, currency: 'USD', isFeatured: false, isPremium: false,
        published: true, clickCount: 0, rating: 4.6,
      },
    ]

    for (const product of products) {
      await ctx.db.insert('products', { ...product, createdAt: now(), updatedAt: now() })
    }

    return { message: 'Database seeded successfully' }
  },
})
