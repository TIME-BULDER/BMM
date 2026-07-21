import { authService } from "@/modules/auth";
import { rewardService } from "@/modules/bitcoin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/v1/donors/[id]/rewards
 * Historique des récompenses Lightning d'un donneur. Accessible au donneur
 * lui-même ou à une organisation authentifiée.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return failure(API_ERROR_CODE.UNAUTHORIZED, "Authentification requise.", {
        status: 401,
      });
    }

    const id = (await params).id;
    if (!id || !uuidRegex.test(id)) {
      return failure(API_ERROR_CODE.BAD_REQUEST, "Format d'ID invalide.", {
        status: 400,
      });
    }

    // Le donneur (soi) ou une organisation peut consulter ces récompenses.
    if (user.id !== id) {
      const org = await authService.getCurrentUser();
      if (!org) {
        return failure(API_ERROR_CODE.FORBIDDEN, "Accès refusé.", {
          status: 403,
        });
      }
    }

    const rewards = await rewardService.getDonorRewardLogs(id);
    return success(rewards);
  } catch (error) {
    return handleApiError(error);
  }
}
