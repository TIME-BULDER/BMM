import { createDonorSchema } from "@/modules/donors";
import { donorService } from "@/modules/donors/services/donor.service";
import { walletService } from "@/modules/bitcoin";
import { authService } from "@/modules/auth";
import { emailService } from "@/modules/notifications";
import { serverPublicUrl } from "@/lib/url.server";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";

/**
 * POST /api/v1/donors
 * Inscrit un nouveau donneur avec son identité nominative, ses identifiants d'accès
 * et ses preuves cryptographiques Bitcoin (signature BIP-322 & horodatage OTS).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation des données avec Zod
    const validatedData = createDonorSchema.parse(body);

    // Vérification cryptographique de la signature BIP-322
    const isValidSignature = walletService.verifySignature(
      validatedData.profileHash,
      validatedData.bitcoinAddress,
      validatedData.signature,
    );

    if (!isValidSignature) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "La signature cryptographique BIP-322 est invalide.",
        { status: 400 },
      );
    }

    // Si l'appelant est une structure/administrateur connecté, on inscrit le
    // donneur sans affecter sa session (création via l'API admin).
    const caller = await authService.getCurrentUser();
    const asAdmin =
      caller?.role === "org_admin" || caller?.role === "super_admin";

    // Enregistrement dans la base de données (Supabase Auth + Table donors) sans preuve OTS initiale
    const newDonor = await donorService.createDonor(
      {
        ...validatedData,
        otsProof: null,
      },
      { asAdmin },
    );

    if (!newDonor) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Échec de l'enregistrement du donneur.",
        { status: 500 },
      );
    }

    // Email de bienvenue (best-effort: n'échoue jamais l'inscription).
    void emailService
      .sendDonorWelcome({
        toEmail: newDonor.email,
        toName: `${newDonor.firstName} ${newDonor.lastName}`,
        bloodType: newDonor.bloodType,
        city: newDonor.city,
        verifyUrl: await serverPublicUrl(`/verify/${newDonor.id}`),
      })
      .catch((e) => console.error("Welcome email failed:", e));

    return success(newDonor, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/donors
 * Récupère tous les donneurs validés (ayant effectué au moins un don).
 * Accessible uniquement aux utilisateurs authentifiés (Hôpitaux/Admins).
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Tous les donneurs (validés ou non) pour que les structures et
    // administrateurs puissent voir et valider les nouveaux inscrits.
    const donors = await donorService.getAllDonors();
    return success(donors);
  } catch (error) {
    return handleApiError(error);
  }
}
