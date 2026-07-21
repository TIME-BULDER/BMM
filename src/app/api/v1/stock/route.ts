import { authService } from "@/modules/auth";
import { stockService } from "@/modules/stock";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/stock
 * Stock de la structure connectée, par composant et groupe sanguin.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Sans organisation liée, le stock est vide (aucune structure rattachée).
    if (!user.organizationId) {
      return success([]);
    }

    const stock = await stockService.getHospitalStock(user.organizationId);
    return success(stock);
  } catch (error) {
    return handleApiError(error);
  }
}
