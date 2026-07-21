import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateEmergencyDTO, EmergencyRecord } from "../types";

export const emergencyService = {
  /**
   * Crée une nouvelle alerte d'urgence dans la base de données Supabase
   */
  createEmergency: async (
    data: CreateEmergencyDTO,
  ): Promise<EmergencyRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const { data: newEmergency, error } = await supabase
      .from("emergencies")
      .insert([
        {
          hospital_id: data.hospitalId,
          blood_type: data.bloodType,
          quantity_needed: data.quantityNeeded,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating emergency:", error);
      throw new Error("Erreur lors de la création de l'urgence");
    }

    return {
      id: newEmergency.id,
      hospitalId: newEmergency.hospital_id,
      bloodType: newEmergency.blood_type,
      quantityNeeded: newEmergency.quantity_needed,
      city: newEmergency.city,
      latitude: newEmergency.latitude,
      longitude: newEmergency.longitude,
      status: newEmergency.status,
      createdAt: new Date(newEmergency.created_at),
    };
  },

  /**
   * Récupère une alerte d'urgence par son ID
   */
  getEmergencyById: async (id: string): Promise<EmergencyRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const { data: emergency, error } = await supabase
      .from("emergencies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !emergency) {
      return null;
    }

    return {
      id: emergency.id,
      hospitalId: emergency.hospital_id,
      bloodType: emergency.blood_type,
      quantityNeeded: emergency.quantity_needed,
      city: emergency.city,
      latitude: emergency.latitude,
      longitude: emergency.longitude,
      status: emergency.status,
      createdAt: new Date(emergency.created_at),
    };
  },

  /**
   * Récupère toutes les alertes d'urgence d'un hôpital
   */
  getHospitalEmergencies: async (
    hospitalId: string,
  ): Promise<EmergencyRecord[]> => {
    const supabase = await createSupabaseServerClient();

    const { data: emergencies, error } = await supabase
      .from("emergencies")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (error || !emergencies) {
      return [];
    }

    return emergencies.map((e) => ({
      id: e.id,
      hospitalId: e.hospital_id,
      bloodType: e.blood_type,
      quantityNeeded: e.quantity_needed,
      city: e.city,
      latitude: e.latitude,
      longitude: e.longitude,
      status: e.status,
      createdAt: new Date(e.created_at),
    }));
  },

  /**
   * Récupère toutes les alertes d'urgence actives de la plateforme
   */
  getAllActiveEmergencies: async (): Promise<EmergencyRecord[]> => {
    const supabase = await createSupabaseServerClient();

    const { data: emergencies, error } = await supabase
      .from("emergencies")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !emergencies) {
      return [];
    }

    return emergencies.map((e) => ({
      id: e.id,
      hospitalId: e.hospital_id,
      bloodType: e.blood_type,
      quantityNeeded: e.quantity_needed,
      city: e.city,
      latitude: e.latitude,
      longitude: e.longitude,
      status: e.status,
      createdAt: new Date(e.created_at),
    }));
  },

  /**
   * Met à jour le statut d'une alerte d'urgence
   */
  updateEmergencyStatus: async (
    id: string,
    status: "active" | "resolved" | "cancelled",
  ): Promise<EmergencyRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const { data: updatedEmergency, error } = await supabase
      .from("emergencies")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating emergency status:", error);
      throw new Error("Erreur lors de la mise à jour du statut de l'urgence");
    }

    return {
      id: updatedEmergency.id,
      hospitalId: updatedEmergency.hospital_id,
      bloodType: updatedEmergency.blood_type,
      quantityNeeded: updatedEmergency.quantity_needed,
      city: updatedEmergency.city,
      latitude: updatedEmergency.latitude,
      longitude: updatedEmergency.longitude,
      status: updatedEmergency.status,
      createdAt: new Date(updatedEmergency.created_at),
    };
  },

  /**
   * Supprime une alerte d'urgence
   */
  deleteEmergency: async (id: string): Promise<boolean> => {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("emergencies").delete().eq("id", id);

    if (error) {
      console.error("Error deleting emergency:", error);
      return false;
    }

    return true;
  },
};
