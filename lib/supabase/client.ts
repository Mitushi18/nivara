import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabaseUrl = rawUrl
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");

  return createBrowserClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}