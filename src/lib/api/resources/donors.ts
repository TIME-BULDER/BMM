import { httpClient } from "@/lib/api/http-client";

import type { BloodType, DonorRecord, RewardLog } from "./types";

/** Champs qu'un donneur peut mettre à jour depuis son espace. */
export type UpdateDonorPayload = Partial<{
  phoneNumber: string;
  email: string;
  city: string;
  latitude: number;
  longitude: number;
  available: boolean;
}>;

/**
 * Inscription d'un donneur. Les champs cryptographiques (adresse Bitcoin,
 * profileHash SHA-256 et signature BIP-322) sont produits côté client par
 * `@/lib/bitcoin/donor-identity` avant l'envoi.
 */
export type CreateDonorPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  /** Optionnel : vide si le donneur ne connaît pas encore son groupe. */
  bloodType?: BloodType;
  city: string;
  /** Optionnels : la position n'est pas obligatoire à l'inscription. */
  latitude?: number;
  longitude?: number;
  age: number;
  available: boolean;
  bitcoinAddress: string;
  profileHash: string;
  signature: string;
  /** UUID du donneur parrain (parrainage), le cas échéant. */
  referredById?: string;
};

export type ActivityType = "blood_donation" | "referral" | "awareness_session";

export type CardOrderMethod = "merit" | "pay";

export type CardOrderResult = {
  message: string;
  status: string;
  orderId: string;
  /** Présent uniquement pour une commande payante (redirection Izichange). */
  checkoutUrl?: string;
};

export type WithdrawResult = {
  message: string;
  balanceSats: number;
  reward: RewardLog;
};

export const donorsApi = {
  create: (payload: CreateDonorPayload) =>
    httpClient.post<DonorRecord>("/donors", payload),

  /** Donneurs validés (≥ 1 don confirmé). Réservé aux structures connectées. */
  list: () => httpClient.get<DonorRecord[]>("/donors"),

  /** Valide un donneur après confirmation d'un don physique. */
  validate: (id: string) =>
    httpClient.patch<{ message: string; donor: DonorRecord }>(
      `/donors/${id}/validate`,
    ),

  /** Profil du donneur connecté. */
  me: () => httpClient.get<DonorRecord>("/donors/me"),

  /** Met à jour le profil du donneur. */
  update: (id: string, payload: UpdateDonorPayload) =>
    httpClient.patch<DonorRecord>(`/donors/${id}`, payload),

  /** Historique des récompenses Lightning d'un donneur. */
  rewards: (id: string) => httpClient.get<RewardLog[]>(`/donors/${id}/rewards`),

  /** Attestation d'identité sanguine signée (BIP-322), vérifiable hors-ligne. */
  offlineIdentity: (id: string) =>
    httpClient.get<{ message: string; identity: OfflineIdentityResponse }>(
      `/donors/${id}/offline-identity`,
    ),

  /** Retrait autonome du solde plateforme vers Mobile Money (Izichange). */
  withdraw: (payload: { amountSats: number; momoNumber: string }) =>
    httpClient.post<WithdrawResult>("/donors/me/withdraw", payload),

  /** Commande de carte physique : au mérite (gratuite) ou à l'achat. */
  orderCard: (method: CardOrderMethod) =>
    httpClient.post<CardOrderResult>("/donors/me/card-order", { method }),

  /** Confirme le paiement d'une commande de carte (callback simulé). */
  confirmCardOrder: (orderId: string) =>
    httpClient.post<{
      message: string;
      physicalCardStatus: string;
      cardType: string;
    }>("/donors/me/card-order/confirm", { orderId }),

  /** Ajoute une activité au donneur (réservé aux structures). */
  addActivity: (
    id: string,
    payload: { activityType: ActivityType; description?: string },
  ) =>
    httpClient.post<{ message: string; activityType: ActivityType }>(
      `/donors/${id}/activities`,
      payload,
    ),
};

export type OfflineIdentityResponse = {
  payload: {
    donorId: string;
    bloodType: string;
    timestamp: string;
    issuer: string;
  };
  profileHash: string;
  clinicAddress: string;
  signature: string;
};
