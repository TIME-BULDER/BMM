import { donorService } from "@/modules/donors/services/donor.service";
import { authService } from "@/modules/auth";
import { otsService } from "@/modules/bitcoin";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";

/**
 * PATCH /api/v1/donors/[id]/validate
 * Valide un donneur (confirme qu'il a effectué un don physique).
 * Seuls les hôpitaux/admins authentifiés peuvent le valider.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const id = (await params).id;

    // Validation du format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    const donor = await donorService.getDonorById(id);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable", {
        status: 404,
      });
    }

    // Horodatage du profil sur Bitcoin via OpenTimestamps uniquement à la validation
    let otsProof = null;
    try {
      otsProof = await otsService.stampHash(donor.profileHash);
    } catch (e) {
      console.error("L'horodatage OpenTimestamps a échoué à la validation.", e);
    }

    const validatedDonor = await donorService.validateDonor(id, otsProof);
    if (!validatedDonor) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Erreur lors de la validation du donneur.",
        { status: 500 },
      );
    }

    // Enregistrer l'activité de don de sang
    await donorService.addActivity(
      id,
      "blood_donation",
      "Don de sang physique validé à la clinique.",
    );

    return success({
      message: "Donneur validé avec succès.",
      donor: validatedDonor,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
