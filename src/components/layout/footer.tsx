import React from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Hygiene Tips',   href: '/tips' },
    { label: 'Products',       href: '/products' },
    { label: 'Community',      href: '/community' },
    { label: 'Pricing',        href: '/#pricing' },
  ],
  Company: [
    { label: 'About',          href: '/about' },
    { label: 'Blog',           href: '/blog' },
    { label: 'Careers',        href: '/careers' },
    { label: 'Contact',        href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy',  href: '/cookies' },
    { label: 'Refund Policy',  href: '/refunds' },
  ],
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
]

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-xl font-semibold">HGyne</span>
            </Link>
            <p className="text-brand-200 text-sm leading-relaxed max-w-xs">
              Your trusted hygiene advisor. Evidence-based tips, curated products,
              and an anonymous community — always in your corner.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className="px-2.5 py-1 rounded-md bg-brand-800 text-brand-200 text-xs hover:bg-brand-700 hover:text-white transition-colors"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-brand-400 mb-4">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-200 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-brand-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-400 text-xs">
            © {new Date().getFullYear()} HGyne. All rights reserved.
          </p>
          <p className="text-brand-500 text-xs">
            Payments secured by{' '}
            <span className="text-brand-300 font-medium">Paddle</span>
            {' · '}
            Data protected by{' '}
            <span className="text-brand-300 font-medium">Supabase</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
