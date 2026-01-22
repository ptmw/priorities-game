import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors during static page generation
let _supabase: SupabaseClient | null = null;

/**
 * Get the Supabase client (lazily initialized)
 * This ensures the client is only created at runtime when env vars are available
 */
function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

  return _supabase;
}

/**
 * Supabase client for browser/client-side usage
 * Uses the anon key for public access with RLS
 * Accessed via getter to ensure lazy initialization
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // Bind methods to preserve 'this' context
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/**
 * Helper to get the current timestamp in ISO format
 */
export function now(): string {
  return new Date().toISOString();
}
