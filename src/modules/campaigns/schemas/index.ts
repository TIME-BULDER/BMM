import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const createCampaignSchema = z
  .object({
    hospitalId: z.string().uuid().nullable(),
    title: z.string().min(5).max(255),
    type: z.enum(["targeted", "general"]),
    targetBloodType: z.enum(BLOOD_TYPES).optional(),
    city: z.string().min(1).max(255),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radiusKm: z.number().min(1).max(500).default(20),
    // Période de la campagne (dates ISO). Facultatives au niveau du schéma,
    // mais demandées dans le formulaire.
    startsAt: z.string().datetime().nullish(),
    endsAt: z.string().datetime().nullish(),
  })
  .refine(
    (data) => {
      // Si c'est une campagne ciblée, le groupe sanguin est obligatoire
      if (data.type === "targeted" && !data.targetBloodType) {
        return false;
      }
      return true;
    },
    {
      message: "targetBloodType is required for targeted campaigns",
      path: ["targetBloodType"],
    },
  );
