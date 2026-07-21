import { clientEnv } from "@/lib/env/client";

export const siteConfig = {
  name: "Bitcoin Blood",
  description:
    "Plateforme panafricaine de gestion des donneurs de sang: enregistrement, recherche de donneurs compatibles, alertes d'urgence et campagnes de don.",
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  locale: "fr",
} as const;

export type SiteConfig = typeof siteConfig;
