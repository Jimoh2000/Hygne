import { Paddle, Environment } from '@paddle/paddle-node-sdk'

let paddle: Paddle | null = null

export function getPaddleClient(): Paddle {
  if (!paddle) {
    paddle = new Paddle(process.env.PADDLE_API_KEY!, {
      environment:
        process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
          ? Environment.Production
          : Environment.Sandbox,
    })
  }
  return paddle
}

export async function createPaddleCustomer(email: string, name?: string) {
  const client = getPaddleClient()
  const customer = await client.customers.create({ email, name })
  return customer
}

export async function cancelPaddleSubscription(subscriptionId: string) {
  const client = getPaddleClient()
  await client.subscriptions.cancel(subscriptionId, { effectiveFrom: 'next_billing_period' })
}

export async function getPaddleSubscription(subscriptionId: string) {
  const client = getPaddleClient()
  return client.subscriptions.get(subscriptionId)
}

export function verifyPaddleWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  // Paddle uses SHA-256 HMAC
  const crypto = require('crypto')
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )
}
