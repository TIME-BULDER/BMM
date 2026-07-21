import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { izichangeService } from "@/modules/bitcoin/services/izichange.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const cardOrderSchema = z.object({
  method: z.enum(["merit", "pay"]),
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

    const donorId = user.id;
    const body = await req.json();
    const { method } = cardOrderSchema.parse(body);

    if (method === "merit") {
      const activitiesCount = await donorService.getActivitiesCount(donorId);
      if (activitiesCount < 3) {
        return failure(
          API_ERROR_CODE.BAD_REQUEST,
          `Vous n'avez pas assez d'activités pour obtenir la carte gratuitement. Requis : 3, Actuel : ${activitiesCount}`,
          { status: 400 },
        );
      }

      const order = await donorService.createCardOrder({
        donorId,
        status: "merited",
        paymentMethod: "merit",
        amountPaid: 0,
      });

      if (!order) {
        return failure(
          API_ERROR_CODE.INTERNAL_ERROR,
          "Impossible de créer la commande de carte.",
          { status: 500 },
        );
      }

      return success(
        {
          message: "Carte physique accordée au mérite avec succès !",
          status: "merited",
          orderId: order.id,
        },
        { status: 201 },
      );
    } else {
      // mode 'pay'
      const order = await donorService.createCardOrder({
        donorId,
        status: "pending",
        paymentMethod: "izichange_pay",
        amountPaid: 5000, // 5000 XOF
      });

      if (!order) {
        return failure(
          API_ERROR_CODE.INTERNAL_ERROR,
          "Impossible de créer la commande de carte.",
          { status: 500 },
        );
      }

      const payment = await izichangeService.initiateCardPayment(
        order.id,
        5000,
      );

      return success(
        {
          message:
            "Commande de carte payante initiée avec succès. Veuillez procéder au paiement.",
          status: "pending",
          orderId: order.id,
          checkoutUrl: payment.checkoutUrl,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
