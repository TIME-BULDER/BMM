import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/** GET /api/v1/card-requests : liste des demandes de carte (admin). */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (user.role !== "org_admin" && user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès réservé aux administrateurs.",
        { status: 403 },
      );
    }

    const requests = await donorService.listCardRequests();
    return success(requests);
  } catch (error) {
    return handleApiError(error);
  }
}
