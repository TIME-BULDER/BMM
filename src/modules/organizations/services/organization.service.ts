import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

export type OrganizationRecord = {
  id: string;
  name: string;
  type: "hospital" | "ngo" | "blood_center";
  latitude: number;
  longitude: number;
  city: string;
  contactEmail: string;
  verified: boolean;
  rejectionReason: string | null;
  createdAt: Date;
};

type OrgRow = {
  id: string;
  name: string;
  type: OrganizationRecord["type"];
  latitude: number;
  longitude: number;
  city: string;
  contact_email: string;
  verified: boolean;
  rejection_reason: string | null;
  created_at: string;
};

function mapOrg(row: OrgRow): OrganizationRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    latitude: row.latitude,
    longitude: row.longitude,
    city: row.city,
    contactEmail: row.contact_email,
    verified: row.verified,
    rejectionReason: row.rejection_reason ?? null,
    createdAt: new Date(row.created_at),
  };
}

export const organizationService = {
  /** Liste toutes les organisations (réservé au super-admin). */
  getAllOrganizations: async (): Promise<OrganizationRecord[]> => {
    // Réservé au super-admin (contrôle d'accès dans la route). On lit via le
    // client admin pour être insensible au RLS.
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as OrgRow[]).map(mapOrg);
  },

  /** Marque une organisation comme vérifiée. */
  verifyOrganization: async (
    id: string,
  ): Promise<OrganizationRecord | null> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .update({ verified: true, rejection_reason: null })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error verifying organization:", error);
      throw new Error("Erreur lors de la vérification de l'organisation");
    }
    return mapOrg(data as OrgRow);
  },

  /** Rejette une organisation en consignant le motif. */
  rejectOrganization: async (
    id: string,
    reason: string,
  ): Promise<OrganizationRecord | null> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await supabase
      .from("organizations")
      .update({ verified: false, rejection_reason: reason })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error rejecting organization:", error);
      throw new Error("Erreur lors du rejet de l'organisation");
    }
    return mapOrg(data as OrgRow);
  },

  /* --------------------- Compte d'approvisionnement -------------------- */

  /** Solde de récompenses de la structure (en satoshis). */
  getBalance: async (id: string): Promise<number> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data } = await supabase
      .from("organizations")
      .select("balance_sats")
      .eq("id", id)
      .maybeSingle();
    return data?.balance_sats ?? 0;
  },

  /**
   * Ajuste le solde de la structure. `amount` positif recharge, négatif débite.
   * Le solde ne descend jamais sous zéro. Renvoie le nouveau solde, ou null.
   */
  adjustBalance: async (id: string, amount: number): Promise<number | null> => {
    const supabase =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data: org } = await supabase
      .from("organizations")
      .select("balance_sats")
      .eq("id", id)
      .maybeSingle();
    if (!org) return null;
    const next = Math.max(0, (org.balance_sats ?? 0) + amount);
    const { data: updated, error } = await supabase
      .from("organizations")
      .update({ balance_sats: next })
      .eq("id", id)
      .select("balance_sats")
      .single();
    if (error || !updated) {
      console.error("Error adjusting organization balance:", error);
      return null;
    }
    return updated.balance_sats;
  },
};
