import { createEmergencySchema, emergencyService } from "@/modules/emergencies";
import { nostrService } from "@/modules/notifications/services/nostr.service";
import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";

/**
 * POST /api/v1/emergencies
 * Déclare une nouvelle alerte de manque de sang
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

    // On rattache l'organisation de la session si elle existe ; l'action reste
    // possible sans organisation liée.
    body.hospitalId = user.organizationId ?? null;

    const validatedData = createEmergencySchema.parse(body);
    const emergency = await emergencyService.createEmergency(validatedData);

    // Publication asynchrone sur Nostr
    void nostrService
      .publishEmergencyAlert({
        hospitalName: user.organization?.name ?? "Centre Partenaire",
        hospitalId: user.organizationId ?? "",
        bloodType: validatedData.bloodType,
        quantity: validatedData.quantityNeeded,
        city: validatedData.city,
      })
      .catch((e) => console.error("Nostr publish failed:", e));

    return success(emergency, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/emergencies
 * Récupère les alertes d'urgence (toutes les actives ou filtrées par hospitalId de manière sécurisée)
 */
export async function GET(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");

    let emergencies;

    if (hospitalId) {
      // Sécurité: Un administrateur d'organisation ne peut voir que sa propre organisation
      if (user.role !== "super_admin" && user.organizationId !== hospitalId) {
        return failure(
          API_ERROR_CODE.FORBIDDEN,
          "Accès refusé. Vous ne pouvez consulter que les urgences de votre propre organisation.",
          { status: 403 },
        );
      }
      emergencies = await emergencyService.getHospitalEmergencies(hospitalId);
    } else {
      // Renvoie l'ensemble des alertes d'urgences actives sur la plateforme
      emergencies = await emergencyService.getAllActiveEmergencies();
    }

    return success(emergencies);
  } catch (error) {
    return handleApiError(error);
  }
}
