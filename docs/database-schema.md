# RX MOD database schema

Supabase project: RX-MOD (Mumbai region)

## Tables created

- profiles: public profile data linked to Supabase Auth user IDs.
- categories: course categories.
- courses: course details, price in paise, publish/feature flags.
- lessons: YouTube, PDF, Drive, text, and external-link lessons.
- purchase_requests: manual UPI payment submissions and review state.
- course_access: admin-granted course access; revoked access is represented by revoked_at.
- support_messages: customer support conversations and attachment paths.
- app_settings: editable brand, home, and payment settings.

Row Level Security is enabled on all eight public tables. Public users can read published catalog information and preview lessons. Authenticated users can read their own profile, purchase requests, access grants, and support messages. Admin-only operations still need a trusted server/Edge Function and must never use a service-role key in browser code.

## Authentication note

Supabase phone/password sign-in may require phone verification depending on Auth configuration. Do not store plaintext passwords or build a custom password table. Choose and configure a supported Supabase Auth flow before enabling account creation.

## Important next steps

1. Configure Auth and test sign-up/sign-in.
2. Configure private Storage buckets and ownership policies for payment proofs and support attachments.
3. Add trusted admin Edge Functions for course/category CRUD, payment review, access grant/revoke, and settings changes.
4. Set the project URL and publishable key in .env.local and Vercel environment variables.
5. Run security advisors after policies/functions are complete.
