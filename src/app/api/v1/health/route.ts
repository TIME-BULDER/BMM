import { handleApiError, success } from "@/lib/api/response";

/**
 * Sonde de disponibilité. Ne dépend d'aucune ressource métier:
 * sert à vérifier que l'application répond et à valider la chaîne
 * d'enveloppe API de bout en bout.
 */
export async function GET() {
  try {
    return success(
      { status: "ok" },
      { meta: { timestamp: new Date().toISOString() } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
