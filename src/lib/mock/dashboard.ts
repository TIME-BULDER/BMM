import type { BloodGroup } from "@/lib/mock/blood";

/**
 * Indicateurs et activité simulés pour le tableau de bord.
 */

export type DashboardMetric = {
  key: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  hint: string;
};

export const dashboardMetrics: DashboardMetric[] = [
  {
    key: "donors",
    label: "Donneurs actifs",
    value: "12 480",
    delta: "+4,2 %",
    trend: "up",
    hint: "30 derniers jours",
  },
  {
    key: "alerts",
    label: "Alertes ouvertes",
    value: "2",
    delta: "+1",
    trend: "up",
    hint: "Temps réel",
  },
  {
    key: "units",
    label: "Poches collectées",
    value: "1 925",
    delta: "+8,1 %",
    trend: "up",
    hint: "Ce mois-ci",
  },
  {
    key: "response",
    label: "Délai moyen d'alerte",
    value: "47 s",
    delta: "-6 s",
    trend: "down",
    hint: "Diffusion → 1ʳᵉ réponse",
  },
];

export type StockLevel = {
  group: BloodGroup;
  level: number;
};

export const stockLevels: StockLevel[] = [
  { group: "O-", level: 18 },
  { group: "O+", level: 64 },
  { group: "A-", level: 32 },
  { group: "A+", level: 71 },
  { group: "B-", level: 27 },
  { group: "B+", level: 58 },
  { group: "AB-", level: 15 },
  { group: "AB+", level: 49 },
];

export type ActivityItem = {
  id: string;
  kind: "alerte" | "don" | "campagne" | "preuve";
  text: string;
  time: string;
};

export const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    kind: "alerte",
    text: "Alerte vitale O- déclenchée - Hôpital Principal, Dakar",
    time: "Il y a 8 min",
  },
  {
    id: "act_2",
    kind: "don",
    text: "Aïssatou Diallo a confirmé un don à Dakar",
    time: "Il y a 22 min",
  },
  {
    id: "act_3",
    kind: "preuve",
    text: "Preuve d'intégrité ancrée sur Bitcoin (bloc 842 119)",
    time: "Il y a 1 h",
  },
  {
    id: "act_4",
    kind: "campagne",
    text: "Campus solidaire - Accra a dépassé 60 % de son objectif",
    time: "Il y a 3 h",
  },
  {
    id: "act_5",
    kind: "don",
    text: "Chidi Okonkwo a rejoint le réseau des donneurs O+",
    time: "Il y a 5 h",
  },
];
