import { NextResponse } from "next/server";
import { donorService } from "@/modules/donors";
import { matchingService } from "@/modules/matching";
import { z } from "zod";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const searchParamsSchema = z.object({
  bloodType: z.enum(BLOOD_TYPES),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  ai: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      bloodType: searchParams.get("bloodType"),
      lat: searchParams.get("lat"),
      lon: searchParams.get("lon"),
      ai: searchParams.get("ai") || undefined,
    };

    const validatedParams = searchParamsSchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: validatedParams.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { bloodType, lat, lon, ai } = validatedParams.data;

    let matches;
    if (ai) {
      // Exécuter l'algorithme intelligent Blood Emergency AI
      matches = await matchingService.findAIEmergencyMatching(
        bloodType,
        lat,
        lon,
      );
    } else {
      // Algorithme classique de tri purement par distance géographique
      const donors = await donorService.getAllAvailableDonors();
      matches = matchingService.findMatchingDonors(bloodType, lat, lon, donors);
    }

    return NextResponse.json({ success: true, ai: !!ai, matches });
  } catch (error) {
    console.error("GET /api/v1/search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
