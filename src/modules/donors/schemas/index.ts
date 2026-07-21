import { z } from "zod";

export const donorSchema = z.object({
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  city: z.string().min(1).max(255),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  age: z.number().min(18).max(120),
  available: z.boolean().default(true),
});

export const createDonorSchema = donorSchema.extend({
  // Groupe sanguin optionnel à l'inscription : un donneur qui ne le connaît
  // pas encore peut le laisser vide (renseigné plus tard, après un test).
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  // Position facultative : le donneur n'est pas obligé de la partager.
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  firstName: z.string().min(1, "Le prénom est requis").max(255),
  lastName: z.string().min(1, "Le nom est requis").max(255),
  email: z.string().email("Adresse email invalide"),
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis").max(50),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128),
  bitcoinAddress: z.string().min(1).max(255),
  profileHash: z.string().length(64),
  signature: z.string().min(1),
  referredById: z
    .string()
    .uuid("L'identifiant du parrain doit être un UUID valide")
    .optional(),
});

export const donorProfileBaseSchema = donorSchema;

/** Champs qu'un donneur peut mettre à jour depuis son espace. */
export const updateDonorSchema = z
  .object({
    phoneNumber: z.string().min(1).max(50),
    email: z.string().email(),
    city: z.string().min(1).max(255),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    available: z.boolean(),
  })
  .partial();

export type UpdateDonorDTO = z.infer<typeof updateDonorSchema>;
