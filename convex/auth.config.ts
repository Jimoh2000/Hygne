// This tells Convex to trust JWTs issued by Clerk
// Replace the domain with your actual Clerk Frontend API URL
// Found at: Clerk Dashboard → API Keys → Advanced → Frontend API
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? 'https://your-app.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
}
