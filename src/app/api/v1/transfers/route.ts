import { authService } from "@/modules/auth";
import { createTransferSchema, transferService } from "@/modules/transfers";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/transfers
 * Demandes de transfert pertinentes pour la structure connectée.
 */
export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Sans organisation liée, aucun transfert du réseau à afficher.
    if (!user.organizationId) {
      return success([]);
    }

    const transfers = await transferService.getNetworkTransfers(
      user.organizationId,
    );
    return success(transfers);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/transfers
 * Publie une demande de transfert vers le réseau.
 */
export async function POST(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const body = await req.json();
    const validated = createTransferSchema.parse(body);

    const transfer = await transferService.createTransfer({
      ...validated,
      requesterId: user.organizationId ?? null,
      requesterName: user.organization?.name ?? "Structure",
      requesterCity: user.organization?.city ?? "",
    });

    return success(transfer, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
