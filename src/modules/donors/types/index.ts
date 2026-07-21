import { z } from "zod";
import { donorSchema, createDonorSchema } from "../schemas";

export type DonorProfile = z.infer<typeof donorSchema>;
export type CreateDonorDTO = z.infer<typeof createDonorSchema>;

export type DonorRecord = DonorProfile & {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bitcoinAddress: string;
  profileHash: string;
  otsProof: string | null;
  validated: boolean;
  createdAt: Date;
  balanceSats: number;
  cardType: string;
  physicalCardStatus: string;
  referredBy: string | null;
};
