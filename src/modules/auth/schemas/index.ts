import { z } from "zod";

const ORG_TYPES = ["hospital", "ngo", "blood_center"] as const;

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128),
});

export const signUpSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128),
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(255),
  type: z.enum(ORG_TYPES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().min(1, "La ville est requise").max(255),
  contactEmail: z.string().email("Adresse email de contact invalide"),
});
