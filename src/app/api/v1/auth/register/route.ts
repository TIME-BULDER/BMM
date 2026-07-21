import { signUpSchema, authService } from "@/modules/auth";
import { handleApiError, success } from "@/lib/api/response";

/**
 * POST /api/v1/auth/register
 * Enregistre une nouvelle organisation et crée son compte administrateur
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation Zod
    const validatedData = signUpSchema.parse(body);

    const result = await authService.signUpOrganization(validatedData);

    return success(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
