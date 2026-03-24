import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import { AppSidebar } from '@/components/layout/app-sidebar'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  // We don't need to pass user here — sidebar uses useUser() from Clerk directly
  return (
    <div className="min-h-screen bg-cream-50 flex">
      <AppSidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
