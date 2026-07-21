import { loginSchema, authService } from "@/modules/auth";
import { handleApiError, success } from "@/lib/api/response";

/**
 * POST /api/v1/auth/login
 * Connecte un utilisateur (structure de santé)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation Zod
    const validatedData = loginSchema.parse(body);

    const session = await authService.login(validatedData);

    return success(session);
  } catch (error) {
    return handleApiError(error);
  }
}
