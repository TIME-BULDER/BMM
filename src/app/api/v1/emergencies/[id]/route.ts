import {
  emergencyService,
  updateEmergencyStatusSchema,
} from "@/modules/emergencies";
import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";

/**
 * GET /api/v1/emergencies/[id]
 * Récupère les détails d'une alerte d'urgence spécifique
 */
export async function GET(
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

    const id = (await params).id;

    // Validation du format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    const emergency = await emergencyService.getEmergencyById(id);
    if (!emergency) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Urgence introuvable", {
        status: 404,
      });
    }

    return success(emergency);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/emergencies/[id]
 * Modifie le statut d'une alerte (ex: active -> resolved / cancelled)
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

    const id = (await params).id;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    const body = await req.json();
    const validatedData = updateEmergencyStatusSchema.parse(body);

    const emergency = await emergencyService.getEmergencyById(id);
    if (!emergency) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Urgence introuvable", {
        status: 404,
      });
    }

    // Sécurité: Seul le super admin ou un admin de la même organisation peut modifier l'urgence
    if (
      user.role !== "super_admin" &&
      user.organizationId !== emergency.hospitalId
    ) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès refusé. Vous ne pouvez modifier que les urgences de votre propre organisation.",
        { status: 403 },
      );
    }

    const updated = await emergencyService.updateEmergencyStatus(
      id,
      validatedData.status,
    );
    return success(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/emergencies/[id]
 * Supprime une alerte d'urgence
 */
export async function DELETE(
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

    const id = (await params).id;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide", {
        status: 400,
      });
    }

    const emergency = await emergencyService.getEmergencyById(id);
    if (!emergency) {
      return failure(API_ERROR_CODE.NOT_FOUND, "Urgence introuvable", {
        status: 404,
      });
    }

    // Sécurité: Seul le super admin ou un admin de la même organisation peut supprimer l'urgence
    if (
      user.role !== "super_admin" &&
      user.organizationId !== emergency.hospitalId
    ) {
      return failure(
        API_ERROR_CODE.FORBIDDEN,
        "Accès refusé. Vous ne pouvez supprimer que les urgences de votre propre organisation.",
        { status: 403 },
      );
    }

    const deleted = await emergencyService.deleteEmergency(id);
    if (!deleted) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Erreur lors de la suppression de l'urgence",
        { status: 500 },
      );
    }

    return success({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
