import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  );
}

/**
 * Supabase client for browser/client-side usage
 * Uses the anon key for public access with RLS
 * Note: We use untyped client for flexibility; types are enforced at the application layer
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We're not using Supabase Auth (anonymous players only)
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttle real-time events
    },
  },
});

/**
 * Helper to get the current timestamp in ISO format
 */
export function now(): string {
  return new Date().toISOString();
}
