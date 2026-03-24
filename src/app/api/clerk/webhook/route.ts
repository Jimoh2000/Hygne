import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { WebhookEvent } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Verify the webhook signature using svix
  const headerPayload = headers()
  const svix_id        = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload  = await req.json()
  const body     = JSON.stringify(payload)
  const wh       = new Webhook(WEBHOOK_SECRET)

  let event: WebhookEvent
  try {
    event = wh.verify(body, {
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { type, data } = event

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmail = data.email_addresses?.find(
          e => e.id === data.primary_email_address_id
        )?.email_address

        await convex.mutation(api.users.upsertFromClerk, {
          clerkId:     data.id,
          email:       primaryEmail ?? '',
          displayName: [data.first_name, data.last_name].filter(Boolean).join(' ') || undefined,
          avatarUrl:   data.image_url || undefined,
        })

        // Send welcome email on first creation
        if (type === 'user.created' && primaryEmail) {
          const name = data.first_name ?? primaryEmail.split('@')[0]
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/welcome`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email: primaryEmail, name }),
          })
        }
        break
      }

      case 'user.deleted': {
        if (data.id) {
          await convex.mutation(api.users.deleteByClerkId, { clerkId: data.id })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Clerk webhook processing error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
