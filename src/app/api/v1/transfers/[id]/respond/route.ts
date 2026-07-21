import { authService } from "@/modules/auth";
import { transferService } from "@/modules/transfers";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST /api/v1/transfers/[id]/respond
 * La structure connectée s'engage à fournir une demande du réseau.
 */
export async function POST(
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

    const id = (await params).id;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide.", {
        status: 400,
      });
    }

    const existing = await transferService.getTransferById(id);
    if (!existing) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Demande introuvable.", {
        status: 404,
      });
    }
    if (existing.requesterId === user.organizationId) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "Vous ne pouvez pas répondre à votre propre demande.",
        { status: 400 },
      );
    }
    if (existing.status !== "ouverte") {
      return failure(
        API_ERROR_CODE.CONFLICT,
        "Cette demande n'est plus ouverte.",
        { status: 409 },
      );
    }

    const transfer = await transferService.respondTransfer(
      id,
      user.organizationId ?? null,
      user.organization?.name ?? "Structure",
    );
    return success(transfer);
  } catch (error) {
    return handleApiError(error);
  }
}
