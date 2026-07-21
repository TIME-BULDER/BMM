import { authService } from "@/modules/auth";
import { handleApiError, success } from "@/lib/api/response";

/**
 * POST /api/v1/auth/logout
 * Ferme la session de l'utilisateur courant
 */
export async function POST() {
  try {
    await authService.logout();
    return success({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
