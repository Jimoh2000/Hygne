import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'HGyne Terms of Service — read our terms before using the platform.',
}

export default function TermsPage() {
  const lastUpdated = 'January 1, 2025'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-12">
        <p className="section-label mb-3">Legal</p>
        <h1 className="font-serif text-4xl text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose-hgyne space-y-8">

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using HGyne ("the Service"), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use the Service. HGyne is
            operated by HGyne ("we", "us", or "our").
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            HGyne provides hygiene advice, curated product recommendations, and an anonymous
            community platform. The Service includes both free and paid subscription tiers.
            Content on the platform is for informational purposes only and does not constitute
            medical advice.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You must create an account to access certain features. You are responsible for
            maintaining the confidentiality of your account credentials and for all activity
            that occurs under your account. You must be at least 18 years old to create an
            account.
          </p>
          <p>
            You agree to provide accurate and complete information when creating your account
            and to update this information to keep it current.
          </p>
        </section>

        <section>
          <h2>4. Subscriptions and Payments</h2>
          <p>
            HGyne offers a Pro subscription plan with access to premium content. Subscription
            fees are billed in advance on a monthly or annual basis. All payments are processed
            securely by Paddle, our payment provider.
          </p>
          <p>
            You may cancel your subscription at any time. Cancellation takes effect at the end
            of your current billing period, and you will retain access to Pro features until
            that date. We do not offer refunds for partial subscription periods.
          </p>
        </section>

        <section>
          <h2>5. User Content and Community</h2>
          <p>
            Users may post questions and replies in our community forum. By posting content,
            you grant HGyne a non-exclusive, royalty-free licence to display and distribute
            that content within the platform.
          </p>
          <p>You agree not to post content that is:</p>
          <ul>
            <li>Illegal, harmful, threatening, or abusive</li>
            <li>Defamatory or invasive of another's privacy</li>
            <li>Spam, advertising, or promotional material without authorisation</li>
            <li>Impersonating another person or entity</li>
            <li>Medically inaccurate advice presented as professional guidance</li>
          </ul>
          <p>
            We reserve the right to remove content and suspend accounts that violate these
            guidelines, at our sole discretion.
          </p>
        </section>

        <section>
          <h2>6. Affiliate Links and Product Recommendations</h2>
          <p>
            Some product links on HGyne are affiliate links. This means we may earn a small
            commission if you purchase through these links, at no additional cost to you.
            Product recommendations are based on editorial judgment and are not influenced by
            affiliate relationships.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <p>
            All content on HGyne — including text, graphics, logos, and software — is the
            property of HGyne or its content suppliers and is protected by applicable
            intellectual property laws. You may not reproduce, distribute, or create derivative
            works without our express written permission.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" without warranty of any kind, express or implied.
            HGyne does not warrant that the Service will be uninterrupted, error-free, or
            completely secure. Hygiene information provided is for general informational
            purposes only and is not a substitute for professional medical advice.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, HGyne shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of the
            Service, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of
            material changes via email or a prominent notice on the platform. Continued use
            of the Service after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with applicable law.
            Any disputes arising from these Terms shall be resolved through binding arbitration
            or in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:hello@hgyne.com" className="text-brand-600 hover:underline">
              hello@hgyne.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
