import { createCampaignSchema, campaignService } from "@/modules/campaigns";
import { authService } from "@/modules/auth";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { handleApiError, success, failure } from "@/lib/api/response";

/**
 * POST /api/v1/campaigns
 * Lance une nouvelle campagne de don
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

    // Rattachement à l'organisation de la session si elle existe (facultatif).
    body.hospitalId = user.organizationId ?? null;

    const validatedData = createCampaignSchema.parse(body);
    const campaign = await campaignService.createCampaign(validatedData);

    return success(campaign, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/campaigns
 * Récupère les campagnes associées à l'hôpital de l'utilisateur connecté
 */
export async function GET(req: Request) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    // Le super admin peut spécifier un hospitalId en paramètre, l'admin d'organisation est restreint à la sienne
    const targetHospitalId =
      user.role === "super_admin"
        ? new URL(req.url).searchParams.get("hospitalId") || user.organizationId
        : user.organizationId;

    // Sans organisation liée, il n'y a pas de campagne à lister.
    if (!targetHospitalId) {
      return success([]);
    }

    const campaigns =
      await campaignService.getHospitalCampaigns(targetHospitalId);

    return success(campaigns);
  } catch (error) {
    return handleApiError(error);
  }
}
