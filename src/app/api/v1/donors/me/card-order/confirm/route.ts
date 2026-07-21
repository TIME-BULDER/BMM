import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const confirmSchema = z.object({
  orderId: z.string().uuid("L'identifiant de la commande est invalide."),
});

export async function POST(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user || user.role !== "donor" || !user.donor) {
      return failure(
        API_ERROR_CODE.UNAUTHORIZED,
        "Authentification en tant que donneur requise.",
        { status: 401 },
      );
    }

    const body = await req.json();
    const { orderId } = confirmSchema.parse(body);

    const isSuccess = await donorService.confirmCardOrderPayment(
      orderId,
      user.id,
    );
    if (!isSuccess) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "Impossible de confirmer la commande. Vérifiez si elle vous appartient ou si elle est déjà payée.",
        { status: 400 },
      );
    }

    return success({
      message: "Paiement de la carte physique confirmé avec succès !",
      physicalCardStatus: "ordered_paid",
      cardType: "physical",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
