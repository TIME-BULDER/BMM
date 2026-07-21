import { authService } from "@/modules/auth";
import { donorService } from "@/modules/donors/services/donor.service";
import { API_ERROR_CODE } from "@/lib/api/errors";
import { failure, handleApiError, success } from "@/lib/api/response";
import { z } from "zod";

const cardRequestSchema = z.object({
  format: z.enum(["physical", "digital"]),
  // Photo en data URL (image compressée côté client). Limite ~1,5 Mo.
  photo: z.string().max(1_600_000).optional().nullable(),
});

async function requireDonor() {
  const user = await authService.getCurrentUser();
  if (!user || user.role !== "donor" || !user.donor) return null;
  return user;
}

/** GET /api/v1/donors/me/card-request : la demande de carte du donneur. */
export async function GET() {
  try {
    const user = await requireDonor();
    if (!user) {
      return failure(
        API_ERROR_CODE.UNAUTHORIZED,
        "Authentification en tant que donneur requise.",
        { status: 401 },
      );
    }
    const request = await donorService.getCardRequest(user.id);
    return success({ request });
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/v1/donors/me/card-request : demande (photo + format). */
export async function POST(req: Request) {
  try {
    const user = await requireDonor();
    if (!user) {
      return failure(
        API_ERROR_CODE.UNAUTHORIZED,
        "Authentification en tant que donneur requise.",
        { status: 401 },
      );
    }

    const body = await req.json();
    const { format, photo } = cardRequestSchema.parse(body);

    const request = await donorService.upsertCardRequest({
      donorId: user.id,
      photo: photo ?? null,
      format,
    });

    if (!request) {
      return failure(
        API_ERROR_CODE.INTERNAL_ERROR,
        "Impossible d'enregistrer la demande de carte.",
        { status: 500 },
      );
    }

    return success({ request }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
