import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const createTransferSchema = z.object({
  component: z.enum(["CGR", "Plasma", "Plaquettes"]),
  bloodType: z.enum(BLOOD_TYPES),
  quantity: z.number().int().min(1).max(100),
  urgency: z.enum(["vitale", "haute", "moderee"]),
});

export type CreateTransferDTO = z.infer<typeof createTransferSchema>;
