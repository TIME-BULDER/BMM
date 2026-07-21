import { httpClient } from "@/lib/api/http-client";

import type { BloodComponent, TransferRequest, TransferUrgency } from "./types";

export type CreateTransferPayload = {
  component: BloodComponent;
  bloodType: string;
  quantity: number;
  urgency: TransferUrgency;
};

export const transfersApi = {
  /** Demandes de transfert pertinentes pour la structure. */
  list: () => httpClient.get<TransferRequest[]>("/transfers"),

  /** Publie une demande de transfert vers le réseau. */
  create: (payload: CreateTransferPayload) =>
    httpClient.post<TransferRequest>("/transfers", payload),

  /** S'engage à fournir une demande du réseau. */
  respond: (id: string) =>
    httpClient.post<TransferRequest>(`/transfers/${id}/respond`),
};
