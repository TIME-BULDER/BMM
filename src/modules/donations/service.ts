import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { CreateDonationDTO, DonationPurpose } from "./schemas";

export type DonationRecord = {
  id: string;
  amountSats: number;
  purpose: DonationPurpose;
  message: string | null;
  bolt11: string | null;
  status: string;
  createdAt: string;
};

type DonationRow = {
  id: string;
  amount_sats: number;
  purpose: DonationPurpose;
  message: string | null;
  bolt11: string | null;
  status: string;
  created_at: string;
};

function mapDonation(row: DonationRow): DonationRecord {
  return {
    id: row.id,
    amountSats: row.amount_sats,
    purpose: row.purpose,
    message: row.message,
    bolt11: row.bolt11,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * Journalisation et consultation des dons a la plateforme. Toutes les
 * lectures/ecritures passent par la cle service-role (RLS ferme).
 */
export const donationService = {
  logDonation: async (
    data: CreateDonationDTO & { bolt11: string; simulated: boolean },
  ): Promise<void> => {
    const admin = createSupabaseAdminClient();
    if (!admin) return;

    const { error } = await admin.from("platform_donations").insert([
      {
        amount_sats: data.amountSats,
        purpose: data.purpose,
        message: data.message ?? null,
        bolt11: data.bolt11,
        status: data.simulated ? "simulated" : "pending",
      },
    ]);

    if (error) {
      console.warn(
        "[Donations] Journalisation ignoree (table absente ?):",
        error.message,
      );
    }
  },

  /** Historique des dons, du plus recent au plus ancien. */
  listDonations: async (): Promise<DonationRecord[]> => {
    const admin = createSupabaseAdminClient();
    if (!admin) return [];

    const { data, error } = await admin
      .from("platform_donations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data) {
      if (error) {
        console.warn("[Donations] Lecture impossible:", error.message);
      }
      return [];
    }
    return (data as DonationRow[]).map(mapDonation);
  },

  /** Total collecte et nombre de dons. */
  getSummary: async (): Promise<{ totalSats: number; count: number }> => {
    const donations = await donationService.listDonations();
    return {
      totalSats: donations.reduce((sum, d) => sum + d.amountSats, 0),
      count: donations.length,
    };
  },
};
