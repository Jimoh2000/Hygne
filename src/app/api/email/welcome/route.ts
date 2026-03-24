import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  const { email, name } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  try {
    await sendWelcomeEmail(email, name ?? email.split('@')[0])
    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}
