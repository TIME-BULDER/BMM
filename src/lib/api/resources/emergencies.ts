import { httpClient } from "@/lib/api/http-client";

import type { BloodType, EmergencyRecord, EmergencyStatus } from "./types";

/** hospitalId est injecté côté serveur depuis la session: inutile ici. */
export type CreateEmergencyPayload = {
  bloodType: BloodType;
  quantityNeeded: number;
  city: string;
  latitude: number;
  longitude: number;
};

export const emergenciesApi = {
  /**
   * Liste les urgences. Sans `hospitalId`, renvoie toutes les urgences
   * actives de la plateforme; avec, celles de l'organisation (si autorisée).
   */
  list: (hospitalId?: string) =>
    httpClient.get<EmergencyRecord[]>("/emergencies", {
      searchParams: { hospitalId },
    }),

  get: (id: string) => httpClient.get<EmergencyRecord>(`/emergencies/${id}`),

  create: (payload: CreateEmergencyPayload) =>
    httpClient.post<EmergencyRecord>("/emergencies", payload),

  updateStatus: (id: string, status: EmergencyStatus) =>
    httpClient.patch<EmergencyRecord>(`/emergencies/${id}`, { status }),

  remove: (id: string) =>
    httpClient.delete<{ success: boolean }>(`/emergencies/${id}`),
};
