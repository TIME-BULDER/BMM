import { authService } from "@/modules/auth";
import { documentService } from "@/modules/organizations";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/v1/organizations/[id]/documents
 * Justificatifs d'une structure, avec URLs signées. Réservé au super-admin.
 */
export async function GET(
  _req: Request,
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

    const documents = await documentService.listSignedDocuments(id);
    return success(documents);
  } catch (error) {
    return handleApiError(error);
  }
}
