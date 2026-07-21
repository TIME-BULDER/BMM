import { createSupabaseServerClient } from "@/lib/supabase/server";
import { donorService, DonorRecord } from "../../donors";

const compatibility: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Rayon de la terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type MatchingResult = DonorRecord & { distanceKm: number };

export type AIMatchingResult = DonorRecord & {
  distanceKm: number;
  score: number;
  explanation: string;
  historyCount: number;
};

export const matchingService = {
  /**
   * Trouve les donneurs compatibles les plus proches (algorithme classique)
   */
  findMatchingDonors: (
    requestedType: string,
    lat: number,
    lon: number,
    donors: DonorRecord[],
  ): MatchingResult[] => {
    const compatibleTypes = compatibility[requestedType] || [];

    return donors
      .filter((d) => compatibleTypes.includes(d.bloodType) && d.available)
      .map((d) => ({
        ...d,
        distanceKm: haversineDistance(lat, lon, d.latitude, d.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10);
  },

  /**
   * Blood Emergency AI
   * Recherche avancée optimisée par notation intelligente (Score de compatibilité,
   * préservation des groupes rares, et historique d'engagement).
   */
  findAIEmergencyMatching: async (
    requestedType: string,
    lat: number,
    lon: number,
  ): Promise<AIMatchingResult[]> => {
    // 1. Récupérer les donneurs disponibles
    const donors = await donorService.getAllAvailableDonors();
    const compatibleTypes = compatibility[requestedType] || [];

    // Filtrer directement par compatibilité biologique de base
    const candidates = donors.filter(
      (d) => compatibleTypes.includes(d.bloodType) && d.available,
    );

    if (candidates.length === 0) return [];

    // 2. Récupérer l'historique des récompenses pour mesurer la fidélité/réactivité
    const supabase = await createSupabaseServerClient();
    const { data: rewards } = await supabase
      .from("reward_logs")
      .select("donor_id")
      .eq("status", "completed");

    const donationCounts: Record<string, number> = {};
    if (rewards) {
      rewards.forEach((r) => {
        donationCounts[r.donor_id] = (donationCounts[r.donor_id] || 0) + 1;
      });
    }

    // 3. Calculer le score et l'explication pour chaque candidat
    const scoredResults: AIMatchingResult[] = candidates.map((d) => {
      const distance = haversineDistance(lat, lon, d.latitude, d.longitude);

      // A. Score de distance (100 points max, -5 points par km de distance)
      const distanceScore = Math.max(0, 100 - distance * 5);

      // B. Préservation des groupes sanguins rares (Poids de compatibilité parfaite)
      // Si le receveur est A+ et le donneur est A+, on préfère utiliser le A+ (+30 pts)
      // plutôt que de gaspiller du O- universel (+0 pts) qui doit rester réservé aux urgences critiques O-.
      const isExactMatch = d.bloodType === requestedType;
      const bloodRarityWeight = isExactMatch ? 30 : 0;

      // C. Bonus d'historique (+10 points par don validé, max 40 points)
      const historyCount = donationCounts[d.id] || 0;
      const historyBonus = Math.min(40, historyCount * 10);

      // D. Score d'urgence global
      const rawScore = distanceScore + bloodRarityWeight + historyBonus;
      const score = Math.round(Math.min(100, Math.max(0, rawScore)));

      // E. Générer une explication claire
      let explanation = "";
      if (isExactMatch) {
        explanation += `Compatibilité parfaite (${d.bloodType}). `;
      } else {
        explanation += `Compatibilité de substitution (${d.bloodType} vers receveur ${requestedType}). `;
      }
      explanation += `Distance : ${distance.toFixed(1)} km. `;

      if (historyCount > 0) {
        explanation += `Donneur régulier et fiable (${historyCount} don(s) historique(s) validé(s)).`;
      } else {
        explanation += `Nouveau donneur volontaire enregistré dans la zone.`;
      }

      return {
        ...d,
        distanceKm: distance,
        score,
        explanation,
        historyCount,
      };
    });

    // Trier par score décroissant
    return scoredResults.sort((a, b) => b.score - a.score).slice(0, 10);
  },
};
