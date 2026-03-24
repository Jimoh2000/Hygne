import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'HGyne Privacy Policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2025'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <div className="mb-12">
        <p className="section-label mb-3">Legal</p>
        <h1 className="font-serif text-4xl text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose-hgyne space-y-8">

        <section>
          <h2>1. Introduction</h2>
          <p>
            HGyne ("we", "us", or "our") is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our platform. Please read this policy carefully.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li><strong>Account information:</strong> name, email address, and profile photo (via Google OAuth or email signup)</li>
            <li><strong>Payment information:</strong> billing details processed by Paddle — we never store your card number</li>
            <li><strong>Community content:</strong> questions and replies you post, including anonymous posts</li>
            <li><strong>Preferences:</strong> language settings and notification preferences</li>
          </ul>
          <p>We also collect information automatically, including:</p>
          <ul>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP addresses (stored as irreversible hashes for security purposes)</li>
            <li>Affiliate link click data (anonymised)</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process subscription payments and send receipts</li>
            <li>Send transactional emails (account confirmation, password reset)</li>
            <li>Send product updates and hygiene tips (you can opt out anytime)</li>
            <li>Moderate community content and enforce our Terms of Service</li>
            <li>Detect and prevent fraudulent or abusive activity</li>
            <li>Analyse usage patterns to improve the platform</li>
          </ul>
        </section>

        <section>
          <h2>4. Anonymous Community Posts</h2>
          <p>
            When you post anonymously, your display name is hidden from other users. However,
            your account is still linked to the post internally for moderation purposes. This
            means we can identify and act on posts that violate our community guidelines, even
            if they appear anonymous to other users.
          </p>
          <p>
            We will never voluntarily reveal your identity behind an anonymous post to other
            users, unless required to do so by law.
          </p>
        </section>

        <section>
          <h2>5. Information Sharing</h2>
          <p>We do not sell your personal information. We share information only in these circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> Convex (database), Clerk (authentication), Paddle (payments), Resend (email), Google Cloud (hosting). Each is bound by data processing agreements.</li>
            <li><strong>Legal requirements:</strong> If required by law, court order, or government authority.</li>
            <li><strong>Business transfers:</strong> In the event of a merger or acquisition, your data may be transferred. We will notify you in advance.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active. If you delete
            your account, we will delete your personal information within 30 days, except where
            we are required to retain it for legal or financial compliance purposes.
          </p>
          <p>
            Community posts you authored will be anonymised (not deleted) when you close your
            account, to preserve the integrity of community discussions.
          </p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use essential cookies to keep you logged in and remember your preferences.
            We do not use advertising or tracking cookies. You can disable cookies in your
            browser settings, though some features may not function correctly without them.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to or restrict our processing of your data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@hgyne.com" className="text-brand-600 hover:underline">
              privacy@hgyne.com
            </a>
          </p>
        </section>

        <section>
          <h2>9. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption at rest and
            in transit, access controls, and regular security reviews. However, no method of
            transmission over the internet is 100% secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            HGyne is not directed at children under 18 years of age. We do not knowingly
            collect personal information from anyone under 18. If we become aware that a child
            under 18 has provided us with personal information, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            material changes by email or by posting a notice on the platform. Your continued
            use of the Service after changes are posted constitutes acceptance of the updated
            policy.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data, contact
            us at{' '}
            <a href="mailto:privacy@hgyne.com" className="text-brand-600 hover:underline">
              privacy@hgyne.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
