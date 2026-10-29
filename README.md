# RX MOD

Responsive course marketplace starter built with Next.js, React, TypeScript and Lucide icons.

## Current status
- Premium responsive customer-facing catalogue prototype with sample course details.
- Search and category filters.
- Supabase project created and core database tables/RLS policies configured.
- Supabase browser client helper and environment-variable template added.
- Login, payment flow, real course loading, course unlocking, file storage, admin panel and deployment are not connected yet.

## Run locally
1. Copy .env.example to .env.local.
2. Add the RX-MOD project publishable key to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
3. Run npm install, then npm run dev.

## Backend plan
- Supabase Auth for accounts.
- Course/category/lesson tables with row-level security.
- Manual UPI payment requests; admin must independently verify payments.
- Private Storage policies for payment proofs and support attachments.
- Separate admin panel and trusted server/Edge Functions for privileged actions.

## Security
- Never commit service-role or secret keys to GitHub.
- NEXT_PUBLIC_ variables are visible in browser code; only use the Supabase publishable key there.
- Admin role must be granted securely through trusted server-side tooling, not a user-editable profile field.

See docs/database-schema.md for the current schema and remaining setup.