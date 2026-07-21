import { httpClient } from "@/lib/api/http-client";

import type { VerifyResult } from "./types";

export type RewardPayload = {
  /** Facture Lightning BOLT11 du donneur (versement Lightning). */
  bolt11Invoice?: string;
  /** Numéro Mobile Money du donneur (cash-out via Izichange). */
  momoNumber?: string;
  /** Attribue des points de fidélité au lieu d'un versement monétaire. */
  awardPoints?: boolean;
  /** Crédite le solde plateforme du donneur (retirable plus tard par lui). */
  creditBalance?: boolean;
  satsAmount?: number;
};

export const verifyApi = {
  /** Statut de vérification publique d'un donneur (ancrage OpenTimestamps). */
  get: (id: string) => httpClient.get<VerifyResult>(`/verify/${id}`),

  /**
   * Récompense Lightning d'un donneur après validation physique d'un don.
   * Réservé aux organisations connectées.
   */
  reward: (id: string, payload: RewardPayload) =>
    httpClient.post<{ message: string; reward: unknown }>(
      `/verify/${id}`,
      payload,
    ),
};
