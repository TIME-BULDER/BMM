import { httpClient } from "@/lib/api/http-client";

export type CardFormat = "physical" | "digital";
export type CardRequestStatus = "requested" | "approved" | "rejected";

export type CardRequestRecord = {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: string | null;
  photo: string | null;
  format: CardFormat;
  status: CardRequestStatus;
  updatedAt: string;
};

export type SubmitCardRequestPayload = {
  format: CardFormat;
  /** Photo en data URL (compressée côté client). */
  photo?: string | null;
};

export const cardRequestsApi = {
  /** Demande de carte du donneur connecté. */
  mine: () =>
    httpClient.get<{ request: CardRequestRecord | null }>(
      "/donors/me/card-request",
    ),

  /** Soumet (ou met à jour) sa demande de carte. */
  submit: (payload: SubmitCardRequestPayload) =>
    httpClient.post<{ request: CardRequestRecord }>(
      "/donors/me/card-request",
      payload,
    ),

  /** Liste des demandes de carte (admin). */
  list: () => httpClient.get<CardRequestRecord[]>("/card-requests"),

  /** Valide ou refuse une demande (admin). */
  decide: (id: string, status: "approved" | "rejected") =>
    httpClient.patch<{ request: CardRequestRecord }>(`/card-requests/${id}`, {
      status,
    }),
};
