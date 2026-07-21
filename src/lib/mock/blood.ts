/**
 * Référentiel sanguin partagé par les écrans applicatifs.
 * Données simulées: aucune source réseau pour l'instant.
 */

export const bloodGroups = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;

export type BloodGroup = (typeof bloodGroups)[number];

export type StockStatus = "critique" | "faible" | "stable";

/**
 * Compatibilité receveur → donneurs. Permet aux écrans de recherche
 * et d'alerte de déterminer quels donneurs solliciter.
 */
export const compatibility: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": bloodGroups.slice(),
};

export function stockStatus(level: number): StockStatus {
  if (level < 25) return "critique";
  if (level < 50) return "faible";
  return "stable";
}

export const stockStatusBadge: Record<
  StockStatus,
  "danger" | "warning" | "success"
> = {
  critique: "danger",
  faible: "warning",
  stable: "success",
};
