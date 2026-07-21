import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const activityPayloadSchema = z.object({
  activityType: z.enum(["blood_donation", "referral", "awareness_session"]),
  description: z.string().max(1000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authentification & Autorisation : Uniquement org_admin ou super_admin
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    if (user.role !== "org_admin" && user.role !== "super_admin") {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès réservé aux administrateurs ou structures de santé.",
        { status: 403 },
      );
    }

    const donorId = (await params).id;

    // Validation UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!donorId || !uuidRegex.test(donorId)) {
      return failure(
        API_ERROR_CODE.BAD_REQUEST,
        "Format d'ID donneur invalide",
        {
          status: 400,
        },
      );
    }

    // 2. Vérifier que le donneur existe
    const donor = await donorService.getDonorById(donorId);
    if (!donor) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Donneur introuvable", {
        status: 404,
      });
    }

    // 3. Valider le corps de la requête
    const body = await req.json();
    const { activityType, description } = activityPayloadSchema.parse(body);

    // 4. Ajouter l'activité
    const defaultDesc =
      activityType === "awareness_session"
        ? "Participation à une séance de sensibilisation."
        : activityType === "referral"
          ? "Parrainage d'un nouveau donneur."
          : "Don de sang physique validé.";

    const isSuccess = await donorService.addActivity(
      donorId,
      activityType,
      description || defaultDesc,
    );

    if (!isSuccess) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Impossible d'ajouter l'activité.",
        { status: 500 },
      );
    }

    return success(
      {
        message: "Activité enregistrée avec succès.",
        activityType,
        donorId,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
