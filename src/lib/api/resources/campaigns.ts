import { httpClient } from "@/lib/api/http-client";

import type { BloodType, CampaignRecord, CampaignType } from "./types";

/** hospitalId est injecté côté serveur depuis la session: inutile ici. */
export type CreateCampaignPayload = {
  title: string;
  type: CampaignType;
  targetBloodType?: BloodType;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  /** Période de la campagne (dates ISO). */
  startsAt?: string | null;
  endsAt?: string | null;
};

export const campaignsApi = {
  /** Campagnes de l'organisation connectée. */
  list: (hospitalId?: string) =>
    httpClient.get<CampaignRecord[]>("/campaigns", {
      searchParams: { hospitalId },
    }),

  create: (payload: CreateCampaignPayload) =>
    httpClient.post<CampaignRecord>("/campaigns", payload),
};
