import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import { EventName } from '@paddle/paddle-node-sdk'
import { createHmac, timingSafeEqual } from 'crypto'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: Request) {
  const rawBody   = await request.text()
  const signature = request.headers.get('paddle-signature') ?? ''
  const secret    = process.env.PADDLE_WEBHOOK_SECRET!

  // Verify Paddle webhook signature
  const [tsPart, h1Part] = signature.split(';')
  const ts = tsPart?.replace('ts=', '')
  const h1 = h1Part?.replace('h1=', '')

  if (!ts || !h1) {
    return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 })
  }

  const expectedHash = createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex')

  try {
    if (!timingSafeEqual(Buffer.from(h1, 'hex'), Buffer.from(expectedHash, 'hex'))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  try {
    switch (event.event_type) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        const sub    = event.data
        const userId = sub.custom_data?.user_id
        if (!userId) break

        // Find user in Convex by their Convex ID stored in Paddle custom_data
        const plan      = sub.items?.[0]?.price?.billing_cycle?.interval === 'year' ? 'yearly' : 'monthly'
        const isActive  = sub.status === 'active' || sub.status === 'trialing'
        const periodEnd = new Date(sub.current_billing_period?.ends_at).getTime()

        await convex.mutation(api.subscriptions.upsertSubscription, {
          userId,
          paddleSubscriptionId: sub.id,
          status:               sub.status,
          plan,
          currentPeriodStart:   new Date(sub.current_billing_period?.starts_at).getTime(),
          currentPeriodEnd:     periodEnd,
          cancelAtPeriodEnd:    sub.scheduled_change?.action === 'cancel',
        })

        if (isActive) {
          await convex.mutation(api.users.upgradeToPro, {
            userId,
            paddleCustomerId: sub.customer_id,
            planExpiresAt:    periodEnd,
          })
        }
        break
      }

      case EventName.SubscriptionCanceled: {
        const sub    = event.data
        const userId = sub.custom_data?.user_id
        if (!userId) break

        await convex.mutation(api.subscriptions.cancelSubscription, {
          paddleSubscriptionId: sub.id,
        })
        await convex.mutation(api.users.downgradeToFree, { userId })
        break
      }

      case EventName.SubscriptionPastDue: {
        const sub = event.data
        if (sub.id) {
          await convex.mutation(api.subscriptions.upsertSubscription, {
            userId:               sub.custom_data?.user_id,
            paddleSubscriptionId: sub.id,
            status:               'past_due',
            plan:                 'monthly',
            currentPeriodStart:   Date.now(),
            currentPeriodEnd:     Date.now(),
            cancelAtPeriodEnd:    false,
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Paddle webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
