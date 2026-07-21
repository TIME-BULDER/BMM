import { donorService } from "@/modules/donors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";

/**
 * GET /api/v1/donors/me
 * Profil du donneur connecté. L'identifiant du donneur est l'identifiant
 * du compte Supabase (donors.id === auth.users.id).
 */
export async function GET() {
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

    const donor = await donorService.getDonorById(user.id);
    if (!donor) {
      return failure(
        API_ERROR_CODE.NOT_FOUND,
        "Aucun profil donneur associé à ce compte.",
        { status: 404 },
      );
    }

    return success(donor);
  } catch (error) {
    return handleApiError(error);
  }
}
