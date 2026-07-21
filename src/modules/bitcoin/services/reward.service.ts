import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RewardLogRecord = {
  id: string;
  donorId: string;
  hospitalId: string | null;
  satsAmount: number;
  status: "pending" | "completed" | "failed";
  bolt11Invoice: string | null; // Peut aussi stocker 'momo:<numero>' ou 'points'
  paymentHash: string | null;
  errorMessage: string | null;
  createdAt: Date;
};

export const rewardService = {
  /**
   * Enregistre une trace de récompense en statut 'pending'
   */
  createRewardLog: async (data: {
    donorId: string;
    hospitalId: string | null;
    satsAmount: number;
    bolt11Invoice?: string;
  }): Promise<RewardLogRecord> => {
    const supabase = await createSupabaseServerClient();
    const { data: record, error } = await supabase
      .from("reward_logs")
      .insert([
        {
          donor_id: data.donorId,
          hospital_id: data.hospitalId,
          sats_amount: data.satsAmount,
          bolt11_invoice: data.bolt11Invoice || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error || !record) {
      console.error("Error creating reward log:", error);
      throw new Error("Erreur lors de la création de la trace de récompense");
    }

    return {
      id: record.id,
      donorId: record.donor_id,
      hospitalId: record.hospital_id,
      satsAmount: record.sats_amount,
      status: record.status,
      bolt11Invoice: record.bolt11_invoice,
      paymentHash: record.payment_hash,
      errorMessage: record.error_message,
      createdAt: new Date(record.created_at),
    };
  },

  /**
   * Met à jour le statut final d'une transaction de récompense (succès ou échec)
   */
  updateRewardStatus: async (
    id: string,
    status: "completed" | "failed",
    paymentHash?: string,
    errorMessage?: string,
  ): Promise<RewardLogRecord> => {
    const supabase = await createSupabaseServerClient();
    const { data: record, error } = await supabase
      .from("reward_logs")
      .update({
        status,
        payment_hash: paymentHash || null,
        error_message: errorMessage || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !record) {
      console.error("Error updating reward status:", error);
      throw new Error("Erreur lors de la mise à jour de la récompense");
    }

    return {
      id: record.id,
      donorId: record.donor_id,
      hospitalId: record.hospital_id,
      satsAmount: record.sats_amount,
      status: record.status,
      bolt11Invoice: record.bolt11_invoice,
      paymentHash: record.payment_hash,
      errorMessage: record.error_message,
      createdAt: new Date(record.created_at),
    };
  },

  /**
   * Récupère l'historique des récompenses attribuées par un hôpital
   */
  getHospitalRewardLogs: async (
    hospitalId: string,
  ): Promise<RewardLogRecord[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("reward_logs")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reward logs:", error);
      throw new Error(
        "Erreur lors de la récupération des traces de récompense",
      );
    }

    return (data || []).map((record) => ({
      id: record.id,
      donorId: record.donor_id,
      hospitalId: record.hospital_id,
      satsAmount: record.sats_amount,
      status: record.status,
      bolt11Invoice: record.bolt11_invoice,
      paymentHash: record.payment_hash,
      errorMessage: record.error_message,
      createdAt: new Date(record.created_at),
    }));
  },

  /**
   * Récupère l'historique des récompenses reçues par un donneur
   */
  getDonorRewardLogs: async (donorId: string): Promise<RewardLogRecord[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("reward_logs")
      .select("*")
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching donor reward logs:", error);
      throw new Error(
        "Erreur lors de la récupération des récompenses du donneur",
      );
    }

    return (data || []).map((record) => ({
      id: record.id,
      donorId: record.donor_id,
      hospitalId: record.hospital_id,
      satsAmount: record.sats_amount,
      status: record.status,
      bolt11Invoice: record.bolt11_invoice,
      paymentHash: record.payment_hash,
      errorMessage: record.error_message,
      createdAt: new Date(record.created_at),
    }));
  },

  /**
   * Vérifie si le donneur a reçu une récompense complétée au cours des N derniers jours
   */
  hasRecentCompletedReward: async (
    donorId: string,
    days: number,
  ): Promise<boolean> => {
    const supabase = await createSupabaseServerClient();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    const { data, error } = await supabase
      .from("reward_logs")
      .select("id")
      .eq("donor_id", donorId)
      .eq("status", "completed")
      .gte("created_at", thresholdDate.toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking recent completed reward:", error);
    }

    return !!data;
  },
};
