import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const decisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

/** PATCH /api/v1/card-requests/[id] : valider ou refuser une demande (admin). */
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
    if (user.role !== "org_admin" && user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès réservé aux administrateurs.",
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = decisionSchema.parse(body);

    const request = await donorService.updateCardRequestStatus(
      id,
      status,
      user.id,
    );

    if (!request) {
      return failure(
        API_ERROR_CODE.NOT_FOUND,
        "Demande de carte introuvable.",
        { status: 404 },
      );
    }

    return success({ request });
  } catch (error) {
    return handleApiError(error);
  }
}
