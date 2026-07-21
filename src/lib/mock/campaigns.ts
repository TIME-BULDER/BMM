/**
 * Campagnes de don simulées.
 */

export type CampaignState = "a_venir" | "en_cours" | "terminee";

export type Campaign = {
  id: string;
  title: string;
  organizer: string;
  city: string;
  country: string;
  venue: string;
  startDate: string;
  endDate: string;
  goal: number;
  registered: number;
  collected: number;
  state: CampaignState;
  cover: string;
};

export const campaignStateLabel: Record<CampaignState, string> = {
  a_venir: "À venir",
  en_cours: "En cours",
  terminee: "Terminée",
};

export const campaignStateBadge: Record<
  CampaignState,
  "primary" | "success" | "neutral"
> = {
  a_venir: "primary",
  en_cours: "success",
  terminee: "neutral",
};

export const campaigns: Campaign[] = [
  {
    id: "cmp_512",
    title: "Marathon du don - Dakar",
    organizer: "Croix-Rouge sénégalaise",
    city: "Dakar",
    country: "Sénégal",
    venue: "Place de l'Indépendance",
    startDate: "2026-07-05",
    endDate: "2026-07-07",
    goal: 500,
    registered: 312,
    collected: 0,
    state: "a_venir",
    cover:
      "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800&q=70&auto=format&fit=crop",
  },
  {
    id: "cmp_511",
    title: "Campus solidaire - Accra",
    organizer: "Université du Ghana",
    city: "Accra",
    country: "Ghana",
    venue: "Great Hall, Legon",
    startDate: "2026-06-28",
    endDate: "2026-07-02",
    goal: 300,
    registered: 268,
    collected: 184,
    state: "en_cours",
    cover:
      "https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=800&q=70&auto=format&fit=crop",
  },
  {
    id: "cmp_510",
    title: "Don entreprises - Abidjan",
    organizer: "Réseau Santé Abidjan",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    venue: "Plateau, Tour CRRAE",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    goal: 250,
    registered: 250,
    collected: 241,
    state: "terminee",
    cover:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=70&auto=format&fit=crop",
  },
];
