import { otsService } from "@/modules/bitcoin";
import { sha256 } from "js-sha256";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const pointsService = {
  /**
   * Attribue des points de fidélité à un donneur.
   * Hache la transaction et l'ancre sur Bitcoin via OpenTimestamps pour la rendre immuable.
   */
  awardPoints: async (
    donorId: string,
    points: number,
    hospitalId?: string,
  ): Promise<{ success: boolean; proofBase64?: string }> => {
    try {
      console.warn(
        `[Points System] Attribution de ${points} points au donneur ${donorId}...`,
      );

      const supabase = await createSupabaseServerClient();

      // 1. Préparer les données de la transaction
      const transactionData = {
        donorId,
        hospitalId: hospitalId || null,
        pointsAwarded: points,
        timestamp: new Date().toISOString(),
        action: "AWARD",
      };

      // 2. Hacher la transaction
      const transactionHash = sha256(JSON.stringify(transactionData));

      // 3. Ancrer sur Bitcoin (OpenTimestamps)
      console.warn(
        `[Points System] Ancrage de la transaction (hash: ${transactionHash}) sur Bitcoin...`,
      );
      const proofBase64 = await otsService.stampHash(transactionHash);

      // 4. Insertion réelle dans la base de données
      const { error } = await supabase.from("donor_points_ledger").insert([
        {
          donor_id: donorId,
          hospital_id: hospitalId || null,
          amount: points,
          action: "AWARD",
          transaction_hash: transactionHash,
          ots_proof: proofBase64,
        },
      ]);

      if (error) {
        throw error;
      }

      console.warn(
        `[Points System] Points attribués et ancrés ! Preuve OTS générée.`,
      );

      return { success: true, proofBase64 };
    } catch (error) {
      console.error(
        "[Points System Error] Échec de l'attribution des points:",
        error,
      );
      return { success: false };
    }
  },

  /**
   * Dépense des points de fidélité (par ex. pour des bons de santé).
   */
  redeemPoints: async (
    donorId: string,
    pointsToRedeem: number,
    method: "satoshis" | "voucher",
  ): Promise<{ success: boolean; proofBase64?: string }> => {
    try {
      console.warn(
        `[Points System] Échange de ${pointsToRedeem} points contre ${method} pour le donneur ${donorId}...`,
      );

      const supabase = await createSupabaseServerClient();

      // 1. Préparer les données de la transaction
      const transactionData = {
        donorId,
        pointsRedeemed: pointsToRedeem,
        method,
        timestamp: new Date().toISOString(),
        action: "REDEEM",
      };

      // 2. Hacher la transaction
      const transactionHash = sha256(JSON.stringify(transactionData));

      console.warn(
        `[Points System] Ancrage de la dépense sur Bitcoin via OTS...`,
      );
      const proofBase64 = await otsService.stampHash(transactionHash);

      // 3. Insertion réelle dans la base de données (montant négatif pour la dépense)
      const { error } = await supabase.from("donor_points_ledger").insert([
        {
          donor_id: donorId,
          hospital_id: null,
          amount: -pointsToRedeem,
          action: "REDEEM",
          transaction_hash: transactionHash,
          ots_proof: proofBase64,
        },
      ]);

      if (error) {
        throw error;
      }

      console.warn(`[Points System] Points dépensés et ancrés avec succès.`);

      return { success: true, proofBase64 };
    } catch (error) {
      console.error(
        "[Points System Error] Échec de la dépense des points:",
        error,
      );
      return { success: false };
    }
  },

  /**
   * Récupère le solde total des points accumulés par un donneur.
   */
  getDonorPointsBalance: async (donorId: string): Promise<number> => {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("donor_points_ledger")
        .select("amount")
        .eq("donor_id", donorId);

      if (error) throw error;

      const totalPoints = (data || []).reduce(
        (acc, row) => acc + row.amount,
        0,
      );
      return totalPoints;
    } catch (error) {
      console.error(
        "[Points System Error] Échec de la récupération de la balance de points:",
        error,
      );
      return 0;
    }
  },
};
