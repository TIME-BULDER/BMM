import { z } from "zod";

/** Objectifs possibles d'un don a la plateforme. */
export const DONATION_PURPOSES = [
  "campaign",
  "development",
  "operations",
  "emergency",
] as const;

export type DonationPurpose = (typeof DONATION_PURPOSES)[number];

export const createDonationSchema = z.object({
  amountSats: z
    .number()
    .int("Le montant doit etre un entier de satoshis.")
    .min(100, "Le montant minimum est de 100 sats.")
    .max(100_000_000, "Montant trop eleve."),
  purpose: z.enum(DONATION_PURPOSES),
  message: z.string().max(280).optional(),
});

export type CreateDonationDTO = z.infer<typeof createDonationSchema>;
