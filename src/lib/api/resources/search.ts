import { API_ERROR_CODE } from "@/lib/api/errors";
import { HttpError } from "@/lib/api/http-client";

import type { BloodType, MatchingDonor } from "./types";

export type SearchParams = {
  bloodType: BloodType;
  lat: number;
  lon: number;
  /** Active l'algorithme de matching intelligent (Blood Emergency AI). */
  ai?: boolean;
};

type SearchResponse = {
  success: boolean;
  ai: boolean;
  matches: MatchingDonor[];
};

/**
 * Recherche de donneurs compatibles via `/search`. Cet endpoint renvoie un
 * format brut (`{ success, ai, matches }`) hors enveloppe standard: on le
 * traite donc ici sans passer par `httpClient`.
 */
export const searchApi = {
  donors: async ({
    bloodType,
    lat,
    lon,
    ai,
  }: SearchParams): Promise<{ ai: boolean; matches: MatchingDonor[] }> => {
    const params = new URLSearchParams({
      bloodType,
      lat: String(lat),
      lon: String(lon),
    });
    if (ai) params.set("ai", "true");

    const response = await fetch(`/api/v1/search?${params.toString()}`);
    const payload = (await response.json().catch(() => null)) as
      SearchResponse | { error?: string } | null;

    if (!response.ok || !payload || !("matches" in payload)) {
      const message =
        payload && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "La recherche a échoué.";
      throw new HttpError(
        response.status,
        API_ERROR_CODE.BAD_REQUEST,
        message === "Invalid search parameters"
          ? "Paramètres de recherche invalides."
          : message,
      );
    }

    return { ai: payload.ai, matches: payload.matches };
  },
};
