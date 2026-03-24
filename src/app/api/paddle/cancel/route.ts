import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPaddleClient } from '@/lib/paddle/client'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { subscriptionId } = body

  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 })
  }

  // Verify the subscription belongs to this user
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, paddle_subscription_id')
    .eq('paddle_subscription_id', subscriptionId)
    .eq('user_id', user.id)
    .single()

  if (!sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  try {
    const paddle = getPaddleClient()
    await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: 'next_billing_period',
    })

    // Mark as cancel_at_period_end in our DB
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('paddle_subscription_id', subscriptionId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Paddle cancel error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
