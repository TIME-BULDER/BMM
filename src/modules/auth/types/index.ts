import { z } from "zod";
import { loginSchema, signUpSchema } from "../schemas";

export type LoginDTO = z.infer<typeof loginSchema>;
export type SignUpDTO = z.infer<typeof signUpSchema>;

export type UserProfile = {
  id: string;
  email: string | undefined;
  role: "super_admin" | "org_admin" | "donor";
  organizationId: string | null;
  organization?: {
    id: string;
    name: string;
    type: "hospital" | "ngo" | "blood_center";
    latitude: number;
    longitude: number;
    city: string;
    contactEmail: string;
    verified: boolean;
    rejectionReason: string | null;
    createdAt: Date;
    balanceSats: number;
  } | null;
  donor?: {
    id: string;
    firstName: string;
    lastName: string;
    bloodType: string;
    city: string;
    latitude: number;
    longitude: number;
    age: number;
    available: boolean;
    bitcoinAddress: string;
    profileHash: string;
    otsProof: string | null;
    validated: boolean;
    createdAt: Date;
    balanceSats: number;
    cardType: string;
    physicalCardStatus: string;
    referredBy: string | null;
  } | null;
};
