import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BloodComponent = "CGR" | "Plasma" | "Plaquettes";

export type StockRecord = {
  id: string;
  hospitalId: string;
  component: BloodComponent;
  bloodType: string;
  units: number;
  expiringSoon: number;
  updatedAt: Date;
};

type StockRow = {
  id: string;
  hospital_id: string;
  component: BloodComponent;
  blood_type: string;
  units: number;
  expiring_soon: number;
  updated_at: string;
};

function mapStock(row: StockRow): StockRecord {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    component: row.component,
    bloodType: row.blood_type,
    units: row.units,
    expiringSoon: row.expiring_soon,
    updatedAt: new Date(row.updated_at),
  };
}

export const stockService = {
  /** Stock d'une structure, par composant et groupe sanguin. */
  getHospitalStock: async (hospitalId: string): Promise<StockRecord[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .select("*")
      .eq("hospital_id", hospitalId);

    if (error || !data) return [];
    return (data as StockRow[]).map(mapStock);
  },

  /** Ajuste le niveau d'un poste de stock. */
  updateUnits: async (
    id: string,
    units: number,
  ): Promise<StockRecord | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock")
      .update({ units, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error updating stock:", error);
      throw new Error("Erreur lors de la mise à jour du stock");
    }
    return mapStock(data as StockRow);
  },
};
