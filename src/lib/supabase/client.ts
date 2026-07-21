import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env/client";

/**
 * Client Supabase pour les Composants Client (navigateur).
 * Utilise uniquement la clé anonyme publique.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
