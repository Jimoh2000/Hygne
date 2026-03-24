import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox:    'w-full max-w-md',
            card:       'rounded-2xl shadow-card border border-cream-200 bg-white',
            headerTitle: 'font-serif text-2xl text-gray-900',
          },
        }}
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  )
}
