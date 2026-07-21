// `next/headers` est intrinsèquement réservé au serveur : son import échoue
// dans un composant client, ce qui garantit déjà l'usage côté serveur.
import { headers } from "next/headers";

import { clientEnv } from "@/lib/env/client";

const FALLBACK_ORIGIN = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

/**
 * Origine de la requête entrante, déduite des en-têtes de proxy
 * (`x-forwarded-host` / `x-forwarded-proto`), avec repli sur `host`.
 *
 * Permet aux liens générés côté serveur (e-mails de bienvenue et de
 * récompense…) de pointer vers le domaine de déploiement réel plutôt que vers
 * la valeur figée de `NEXT_PUBLIC_APP_URL`. Repli sur la configuration si les
 * en-têtes sont absents.
 */
export async function getServerOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return FALLBACK_ORIGIN;
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  } catch {
    // Hors contexte de requête (tests unitaires, tâches de fond…) :
    // `headers()` n'est pas disponible, on retombe sur la configuration.
    return FALLBACK_ORIGIN;
  }
}

/** Construit une URL publique absolue vers un chemin interne, côté serveur. */
export async function serverPublicUrl(path: string): Promise<string> {
  const origin = await getServerOrigin();
  return `${origin}/${path.replace(/^\/+/, "")}`;
}
