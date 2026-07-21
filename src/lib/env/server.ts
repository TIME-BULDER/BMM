import { z } from "zod";

/**
 * Variables d'environnement réservées au serveur. Ne doivent jamais être
 * importées depuis un Composant Client: ce module n'est consommé que par
 * le code serveur (accès base de données, clients Supabase serveur) et
 * l'outillage (Drizzle Kit).
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const parsed = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Variables d'environnement serveur invalides:\n${issues}`);
}

export const serverEnv = parsed.data;

export type ServerEnv = typeof serverEnv;
