import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { clientEnv } from "@/lib/env/client";

/**
 * Client Supabase pour le serveur (Server Components, Route Handlers,
 * Server Actions). Synchronise la session via les cookies de la requête.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appelé depuis un Server Component: la mutation des cookies
            // est ignorée, le middleware se charge du rafraîchissement.
          }
        },
      },
    },
  );
}

/**
 * Client administratif Supabase (Service Role).
 * Utilisé uniquement côté serveur pour des tâches d'administration privilégiées
 * comme la suppression d'utilisateurs Auth lors d'un rollback.
 */
export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
