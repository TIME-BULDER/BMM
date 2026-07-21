import type { BloodGroup } from "@/lib/mock/blood";

/**
 * Compte connecté simulé. Sert au bandeau applicatif et à la carte donneur.
 */

export type CurrentUser = {
  name: string;
  initials: string;
  email: string;
  role: string;
  group: BloodGroup;
  city: string;
  country: string;
};

export const currentUser: CurrentUser = {
  name: "Aïssatou Diallo",
  initials: "AD",
  email: "aissatou.diallo@bitcoinblood.africa",
  role: "Donneuse vérifiée",
  group: "O-",
  city: "Dakar",
  country: "Sénégal",
};
