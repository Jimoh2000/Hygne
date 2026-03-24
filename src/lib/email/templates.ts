import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM_EMAIL ?? 'hello@hgyne.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hgyne.com'

// ── Base HTML template ─────────────────────────────────────────────────────
function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HGyne</title>
</head>
<body style="margin:0;padding:0;background:#fdfcf8;font-family:'DM Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfcf8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <a href="${APP_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
                <div style="width:32px;height:32px;background:#23724d;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="color:white;font-size:16px;">🌿</span>
                </div>
                <span style="font-size:20px;font-weight:700;color:#0f3522;font-family:Georgia,serif;">HGyne</span>
              </a>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;border:1px solid #f4eddb;padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888780;">
                © ${new Date().getFullYear()} HGyne · 
                <a href="${APP_URL}/privacy" style="color:#23724d;text-decoration:none;">Privacy</a> · 
                <a href="${APP_URL}/unsubscribe" style="color:#888780;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Email: Welcome ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  const content = `
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#0f3522;margin:0 0 12px;">
      Welcome to HGyne, ${name}! 🎉
    </h1>
    <p style="font-size:15px;color:#5f5e5a;line-height:1.6;margin:0 0 20px;">
      You've joined a judgment-free space for all things hygiene. Here's what you can do right now:
    </p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${[
        ['🌿', 'Explore hygiene tips', 'Browse expert advice across body care, skincare, dental, and more.', '/tips'],
        ['🛍️', 'Discover products',    'Check out our curated picks for every hygiene need.',              '/products'],
        ['💬', 'Join the community',   'Ask questions anonymously and get real answers.',                  '/community'],
      ].map(([emoji, title, desc, href]) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f4eddb;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40px;font-size:20px;vertical-align:top;padding-right:12px;">${emoji}</td>
                <td>
                  <a href="${APP_URL}${href}" style="font-size:14px;font-weight:600;color:#23724d;text-decoration:none;">${title}</a>
                  <p style="font-size:13px;color:#888780;margin:2px 0 0;">${desc}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('')}
    </table>
    <div style="margin-top:28px;">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#23724d;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:600;">
        Go to your dashboard →
      </a>
    </div>
  `

  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Welcome to HGyne, ${name}! 🌿`,
    html:    baseTemplate(content),
  })
}

// ── Email: Pro subscription confirmation ──────────────────────────────────
export async function sendProWelcomeEmail(to: string, name: string, planType: 'monthly' | 'yearly') {
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#e0f0e6;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">👑</div>
    </div>
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#0f3522;margin:0 0 12px;text-align:center;">
      You're now a Pro member!
    </h1>
    <p style="font-size:15px;color:#5f5e5a;line-height:1.6;margin:0 0 24px;text-align:center;">
      Thanks ${name}! Your ${planType} Pro membership is now active. Here's what you've unlocked:
    </p>
    ${['Unlimited access to all premium hygiene tips', 'Exclusive product deals and early access', 'Priority community support', 'Ad-free experience', 'Cancel anytime from your settings'].map(feat => `
      <p style="display:flex;align-items:center;gap:8px;font-size:14px;color:#3d3d3a;margin:8px 0;">
        <span style="color:#23724d;font-weight:bold;">✓</span> ${feat}
      </p>
    `).join('')}
    <div style="margin-top:28px;text-align:center;">
      <a href="${APP_URL}/tips"
         style="display:inline-block;background:#23724d;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;font-weight:600;">
        Explore premium tips →
      </a>
    </div>
    <p style="font-size:12px;color:#b4b2a9;margin-top:20px;text-align:center;">
      Manage your subscription anytime at <a href="${APP_URL}/settings" style="color:#23724d;">${APP_URL}/settings</a>
    </p>
  `

  return resend.emails.send({
    from:    FROM,
    to,
    subject: `You're a Pro member now! 👑`,
    html:    baseTemplate(content),
  })
}

// ── Email: Weekly tip digest ───────────────────────────────────────────────
export async function sendWeeklyDigest(
  to:   string,
  name: string,
  tips: Array<{ title: string; slug: string; category: string; excerpt: string }>
) {
  const tipRows = tips.map(tip => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f4eddb;">
        <p style="font-size:11px;color:#888780;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">${tip.category}</p>
        <a href="${APP_URL}/tips/${tip.slug}"
           style="font-family:Georgia,serif;font-size:16px;color:#0f3522;text-decoration:none;font-weight:600;">
          ${tip.title}
        </a>
        <p style="font-size:13px;color:#5f5e5a;margin:6px 0 0;line-height:1.5;">${tip.excerpt}</p>
        <a href="${APP_URL}/tips/${tip.slug}" style="font-size:13px;color:#23724d;text-decoration:none;margin-top:6px;display:inline-block;">
          Read more →
        </a>
      </td>
    </tr>
  `).join('')

  const content = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:#0f3522;margin:0 0 8px;">
      Your weekly hygiene digest 🌿
    </h1>
    <p style="font-size:14px;color:#888780;margin:0 0 24px;">Hi ${name}, here's what's new this week.</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${tipRows}
    </table>
    <div style="margin-top:24px;text-align:center;">
      <a href="${APP_URL}/tips"
         style="display:inline-block;background:#23724d;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;">
        View all tips →
      </a>
    </div>
  `

  return resend.emails.send({
    from:    FROM,
    to,
    subject: `Your weekly hygiene tips from HGyne 🌿`,
    html:    baseTemplate(content),
  })
}
