import { authService } from "@/modules/auth";
import { organizationService } from "@/modules/organizations";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/organizations
 * Liste toutes les organisations. Réservé au super-admin.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès réservé au super-admin.",
        {
          status: 403,
        },
      );
    }

    const organizations = await organizationService.getAllOrganizations();
    return success(organizations);
  } catch (error) {
    return handleApiError(error);
  }
}
