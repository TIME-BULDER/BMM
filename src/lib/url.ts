import { clientEnv } from "@/lib/env/client";

/**
 * Origine publique de repli (build-time), sans slash final.
 * Utilisée uniquement quand l'origine réelle n'est pas disponible (rendu
 * serveur d'un composant client, avant hydratation).
 */
const FALLBACK_ORIGIN = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

/**
 * Origine réelle de l'application.
 *
 * Côté navigateur, retourne `window.location.origin` : les liens (QR codes,
 * partages…) pointent donc toujours vers le domaine réellement servi, en
 * local comme en production, sans dépendre de `NEXT_PUBLIC_APP_URL`.
 * Côté serveur, se rabat sur la valeur de configuration.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return FALLBACK_ORIGIN;
}

/** Construit une URL publique absolue vers un chemin interne (`/verify/…`). */
export function publicUrl(path: string): string {
  return `${getAppOrigin()}/${path.replace(/^\/+/, "")}`;
}
