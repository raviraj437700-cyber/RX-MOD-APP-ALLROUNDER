# RX MOD

Responsive course marketplace starter built with Next.js, React, TypeScript and Lucide icons.

## Current status
- Premium responsive customer-facing catalogue and sample course details.
- Search and category filters.
- Sample data only. Login, payment, database, course unlocking and admin tools are not connected yet.

## Run locally
```bash
npm install
npm run dev
```

## Planned backend
1. Configure Supabase authentication, database, storage and row-level security.
2. Add courses, categories, lessons, purchase requests, payment proofs, support messages and user profiles.
3. Implement manual UPI payment and admin-side verification. Screenshots alone are not proof of payment.
4. Build a separate responsive admin panel with server-side role checks.
5. Configure Vercel environment variables and deploy.

## Environment variables (later)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never commit service-role keys or other secrets to GitHub or expose them in browser code.
