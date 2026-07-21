import { authService } from "@/modules/auth";
import { organizationService } from "@/modules/organizations/services/organization.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const rechargeSchema = z.object({
  amountSats: z.number().int().min(1, "Le montant doit être supérieur à 0."),
});

/**
 * POST /api/v1/organizations/me/recharge
 * Recharge le compte d'approvisionnement de la structure connectée.
 */
export async function POST(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }
    if (!user.organizationId) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "Aucune structure rattachée à ce compte.",
        { status: 400 },
      );
    }

    const body = await req.json();
    const { amountSats } = rechargeSchema.parse(body);

    const balanceSats = await organizationService.adjustBalance(
      user.organizationId,
      amountSats,
    );
    if (balanceSats === null) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Rechargement impossible pour le moment.",
        { status: 500 },
      );
    }

    return success({ balanceSats });
  } catch (error) {
    return handleApiError(error);
  }
}
