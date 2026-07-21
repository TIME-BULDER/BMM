import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const emergencySchema = z.object({
  bloodType: z.enum(BLOOD_TYPES),
  quantityNeeded: z.number().min(1).max(100).default(1),
  city: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createEmergencySchema = emergencySchema.extend({
  hospitalId: z.string().uuid().nullable(),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum(["active", "resolved", "cancelled"]),
});
