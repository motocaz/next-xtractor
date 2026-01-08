This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Clerk account with billing enabled
- Stripe account connected to Clerk (for billing)

### Environment Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Get your Clerk API keys from [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys) and add them to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET` (optional, for webhooks)

3. Set up Prisma Postgres database:
   - Create a Prisma Postgres database via Prisma MCP or use a local PostgreSQL instance
   - Get the connection string and add it to `.env.local` as `DATABASE_URL`
   - Run `npm run prisma:migrate` to create the database schema
   - Run `npm run prisma:generate` to generate Prisma Client

4. Configure billing in Clerk Dashboard:
   - Enable billing feature
   - Connect your Stripe account
   - Create subscription plans and features
   - Configure webhook endpoint: `https://your-domain.com/api/webhooks/clerk` (for production)

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`@fontsource/jetbrains-mono`](https://fontsource.org/fonts/jetbrains-mono) to load [JetBrains Mono](https://www.jetbrains.com/lp/mono/), a monospace font designed for developers.

## Database Setup

This project uses Prisma ORM with PostgreSQL to store user and billing data:

- **Schema**: Defined in `prisma/schema.prisma` with User, Subscription, and BillingHistory models
- **Migrations**: Run `npm run prisma:migrate` to apply schema changes
- **Prisma Studio**: Run `npm run prisma:studio` to view and edit database data
- **Webhooks**: Clerk webhooks automatically sync user and subscription data to the database

### Database Models

- **User**: Stores user information synced from Clerk
- **Subscription**: Tracks user subscription plans and status
- **BillingHistory**: Records payment history and invoices

## Clerk Billing Integration

This project uses Clerk Billing for subscription management:

- **Pricing Page**: `/pricing` - Displays subscription plans using Clerk's `<PricingTable />` component
- **Account Page**: `/account` - User profile and subscription management using Clerk's `<UserProfile />` component
- **Protected Content**: Use `<Protect>` component or `has()` method to restrict access based on subscription plans
- **API Routes**:
  - `/api/user` - Get current user data and subscription
  - `/api/user/subscription` - Get user's active subscription
  - `/api/user/billing-history` - Get user's payment history

### Protecting Content

**Server Components:**

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { has } = await auth();
  const hasPremiumPlan = has({ plan: 'premium' });

  if (!hasPremiumPlan) {
    return <div>Premium content only</div>;
  }

  return <div>Premium content here</div>;
}
```

**Client Components:**

```tsx
"use client";
import { Protect } from "@clerk/nextjs";

export default function Page() {
  return (
    <Protect plan="premium" fallback={<div>Premium content only</div>}>
      <div>Premium content here</div>
    </Protect>
  );
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
