import { z } from "zod";
import { createCampaignSchema } from "../schemas";

export type CreateCampaignDTO = z.infer<typeof createCampaignSchema>;

export type CampaignRecord = {
  id: string;
  hospitalId: string;
  title: string;
  type: "targeted" | "general";
  targetBloodType: string | null;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  startsAt: string | null;
  endsAt: string | null;
  emailsSent: number;
  responsesCount: number;
  status: string;
  createdAt: Date;
};
