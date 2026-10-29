import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

// Supabase publishable keys are intended for browser use. Database RLS remains mandatory.
// Environment variables can override these public project settings in local/deployed environments.
const PROJECT_URL = "https://fkkslrhiqgratcpotjif.supabase.co";
const PROJECT_PUBLISHABLE_KEY = "sb_publishable_ZB8C0cEN9VyibLaShcFrfw_g60O217q";

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || PROJECT_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || PROJECT_PUBLISHABLE_KEY;
    browserClient = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return browserClient;
}
