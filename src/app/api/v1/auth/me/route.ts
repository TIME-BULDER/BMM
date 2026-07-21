import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/auth/me
 * Renvoie le profil de l'utilisateur (organisation) actuellement connecté.
 * Sert au frontend à hydrater la session et à protéger l'espace applicatif.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();

    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    return success(user);
  } catch (error) {
    return handleApiError(error);
  }
}
