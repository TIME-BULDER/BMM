import { authService } from "@/modules/auth";
import { organizationService } from "@/modules/organizations";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * PATCH /api/v1/organizations/[id]/reject
 * Rejette une organisation avec un motif. Réservé au super-admin.
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
    if (user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès réservé au super-admin.",
        {
          status: 403,
        },
      );
    }

    const id = (await params).id;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide.", {
        status: 400,
      });
    }

    const body = (await req.json().catch(() => ({}))) as { reason?: string };
    const reason = body.reason?.trim();
    if (!reason) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Motif de rejet requis.", {
        status: 400,
      });
    }

    const organization = await organizationService.rejectOrganization(
      id,
      reason,
    );
    return success(organization);
  } catch (error) {
    return handleApiError(error);
  }
}
