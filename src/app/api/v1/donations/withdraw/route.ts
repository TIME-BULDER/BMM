import { z } from "zod";

import { breezService } from "@/modules/bitcoin";
import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const withdrawSchema = z.object({
  bolt11: z.string().min(20, "La facture Lightning (BOLT11) est invalide."),
});

/**
 * POST /api/v1/donations/withdraw
 * Retire les fonds collectes en payant une facture Lightning fournie par
 * l'administrateur (destination externe). Reserve au super-admin.
 */
export async function POST(req: Request) {
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
        "Acces reserve au super-admin.",
        {
          status: 403,
        },
      );
    }

    const body = await req.json();
    const { bolt11 } = withdrawSchema.parse(body);

    const result = await breezService.payInvoice(bolt11.trim());
    if (!result) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Le retrait a echoue. Verifiez la facture et le solde du noeud.",
        { status: 502 },
      );
    }

    return success({ paymentHash: result.paymentHash });
  } catch (error) {
    return handleApiError(error);
  }
}
