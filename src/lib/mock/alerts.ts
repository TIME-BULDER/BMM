import type { BloodGroup } from "@/lib/mock/blood";

/**
 * Alertes d'urgence simulées.
 */

export type AlertUrgency = "vitale" | "haute" | "moderee";
export type AlertState = "ouverte" | "en_cours" | "resolue";

export type EmergencyAlert = {
  id: string;
  group: BloodGroup;
  unitsNeeded: number;
  unitsCollected: number;
  hospital: string;
  city: string;
  country: string;
  urgency: AlertUrgency;
  state: AlertState;
  createdAt: string;
  responders: number;
};

export const urgencyLabel: Record<AlertUrgency, string> = {
  vitale: "Vitale",
  haute: "Haute",
  moderee: "Modérée",
};

export const urgencyBadge: Record<
  AlertUrgency,
  "danger" | "warning" | "neutral"
> = {
  vitale: "danger",
  haute: "warning",
  moderee: "neutral",
};

export const alertStateLabel: Record<AlertState, string> = {
  ouverte: "Ouverte",
  en_cours: "En cours",
  resolue: "Résolue",
};

export const alertStateBadge: Record<
  AlertState,
  "danger" | "warning" | "success"
> = {
  ouverte: "danger",
  en_cours: "warning",
  resolue: "success",
};

export const emergencyAlerts: EmergencyAlert[] = [
  {
    id: "alt_2041",
    group: "O-",
    unitsNeeded: 6,
    unitsCollected: 2,
    hospital: "Hôpital Principal",
    city: "Dakar",
    country: "Sénégal",
    urgency: "vitale",
    state: "ouverte",
    createdAt: "2026-06-30T08:12:00Z",
    responders: 9,
  },
  {
    id: "alt_2040",
    group: "AB-",
    unitsNeeded: 3,
    unitsCollected: 1,
    hospital: "Korle Bu Teaching Hospital",
    city: "Accra",
    country: "Ghana",
    urgency: "haute",
    state: "en_cours",
    createdAt: "2026-06-30T06:45:00Z",
    responders: 5,
  },
  {
    id: "alt_2039",
    group: "B+",
    unitsNeeded: 4,
    unitsCollected: 4,
    hospital: "CHU de Treichville",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    urgency: "moderee",
    state: "resolue",
    createdAt: "2026-06-29T15:30:00Z",
    responders: 12,
  },
  {
    id: "alt_2038",
    group: "O+",
    unitsNeeded: 8,
    unitsCollected: 3,
    hospital: "Lagos University Teaching Hospital",
    city: "Lagos",
    country: "Nigéria",
    urgency: "haute",
    state: "ouverte",
    createdAt: "2026-06-29T11:05:00Z",
    responders: 7,
  },
];
