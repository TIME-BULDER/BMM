import { donorService } from "@/modules/donors";
import { offlineIdentityService } from "@/modules/bitcoin/services/offline-identity.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";
import { authService } from "@/modules/auth";

/**
 * GET /api/v1/donors/[id]/offline-identity
 * Génère une identité souveraine signée (BIP-322) pour le donneur.
 * Utilisable pour générer un QR Code vérifiable hors-ligne par n'importe quelle clinique.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authentification & Autorisation
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const id = (await params).id;

    // 2. Validation de l'ID UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    // 3. Récupération du donneur
    const donor = await donorService.getDonorById(id);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable", {
        status: 404,
      });
    }

    if (!donor.bloodType) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "Le donneur n'a pas de groupe sanguin défini",
        {
          status: 400,
        },
      );
    }

    // 4. Génération de la signature d'identité hors-ligne
    const offlineIdentity = offlineIdentityService.signDonorIdentity(
      donor.id,
      donor.bloodType,
    );

    return success({
      message: "Identité hors-ligne générée avec succès.",
      identity: offlineIdentity,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
