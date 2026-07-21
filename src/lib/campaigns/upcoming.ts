/**
 * Campagnes de collecte à venir, affichées publiquement.
 *
 * Jeu de données de démonstration : le modèle backend des campagnes n'expose
 * pas encore de date de début ni de liste publique. Cette structure est prête
 * à être branchée sur un futur endpoint `GET /api/v1/campaigns/public`.
 */
export type UpcomingCampaign = {
  id: string;
  title: string;
  organizer: string;
  city: string;
  address: string;
  /** Date et heure de début (ISO). */
  startsAt: string;
  description: string;
  bloodTypes: string[];
  goalDonors: number;
  registered: number;
};

// Dates calculées à partir d'aujourd'hui pour que le décompte reste crédible.
const inDays = (days: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const upcomingCampaigns: UpcomingCampaign[] = [
  {
    id: "camp-cotonou-cnhu",
    title: "Grande collecte de rentrée",
    organizer: "CNHU-HKM",
    city: "Cotonou",
    address: "Centre National Hospitalier, Cotonou",
    startsAt: inDays(6, 8),
    description:
      "Collecte ouverte à tous pour reconstituer les réserves avant la saison des fortes demandes. Un moment convivial, encadré par l'équipe médicale.",
    bloodTypes: ["O-", "O+", "B-"],
    goalDonors: 300,
    registered: 128,
  },
  {
    id: "camp-porto-novo-campus",
    title: "Don au campus",
    organizer: "Croix-Rouge Béninoise",
    city: "Porto-Novo",
    address: "Université, Porto-Novo",
    startsAt: inDays(13, 9),
    description:
      "Journée de sensibilisation et de don sur le campus. Venez donner, parrainer un ami et gagner votre carte de donneur.",
    bloodTypes: ["Tous groupes"],
    goalDonors: 200,
    registered: 74,
  },
  {
    id: "camp-parakou-urgence",
    title: "Mobilisation Parakou",
    organizer: "Hôpital de Parakou",
    city: "Parakou",
    address: "Hôpital départemental, Parakou",
    startsAt: inDays(24, 8),
    description:
      "Collecte de soutien pour le service de maternité, particulièrement demandeur en sang rare. Chaque don compte.",
    bloodTypes: ["O-", "AB-"],
    goalDonors: 150,
    registered: 41,
  },
];
