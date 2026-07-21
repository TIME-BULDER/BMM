import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateTransferDTO } from "../schemas";

export type TransferStatus =
  "ouverte" | "acceptée" | "en_transit" | "reçue" | "annulée";

export type TransferRecord = {
  id: string;
  component: "CGR" | "Plasma" | "Plaquettes";
  bloodType: string;
  quantity: number;
  urgency: "vitale" | "haute" | "moderee";
  requesterId: string;
  requesterName: string;
  requesterCity: string;
  responderId: string | null;
  responderName: string | null;
  status: TransferStatus;
  createdAt: Date;
};

type TransferRow = {
  id: string;
  component: TransferRecord["component"];
  blood_type: string;
  quantity: number;
  urgency: TransferRecord["urgency"];
  requester_id: string;
  requester_name: string;
  requester_city: string;
  responder_id: string | null;
  responder_name: string | null;
  status: TransferStatus;
  created_at: string;
};

function mapTransfer(row: TransferRow): TransferRecord {
  return {
    id: row.id,
    component: row.component,
    bloodType: row.blood_type,
    quantity: row.quantity,
    urgency: row.urgency,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterCity: row.requester_city,
    responderId: row.responder_id,
    responderName: row.responder_name,
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

export const transferService = {
  /**
   * Demandes pertinentes pour une organisation: les siennes (émises ou
   * acceptées) et toutes les demandes ouvertes du réseau.
   */
  getNetworkTransfers: async (orgId: string): Promise<TransferRecord[]> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transfer_requests")
      .select("*")
      .or(`requester_id.eq.${orgId},responder_id.eq.${orgId},status.eq.ouverte`)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as TransferRow[]).map(mapTransfer);
  },

  createTransfer: async (
    data: CreateTransferDTO & {
      requesterId: string | null;
      requesterName: string;
      requesterCity: string;
    },
  ): Promise<TransferRecord | null> => {
    const supabase = await createSupabaseServerClient();
    const { data: row, error } = await supabase
      .from("transfer_requests")
      .insert([
        {
          component: data.component,
          blood_type: data.bloodType,
          quantity: data.quantity,
          urgency: data.urgency,
          requester_id: data.requesterId,
          requester_name: data.requesterName,
          requester_city: data.requesterCity,
          status: "ouverte",
        },
      ])
      .select()
      .single();

    if (error || !row) {
      console.error("Error creating transfer:", error);
      throw new Error("Erreur lors de la création de la demande de transfert");
    }
    return mapTransfer(row as TransferRow);
  },

  getTransferById: async (id: string): Promise<TransferRecord | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transfer_requests")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapTransfer(data as TransferRow);
  },

  /** Un centre s'engage à fournir la demande (statut → acceptée). */
  respondTransfer: async (
    id: string,
    responderId: string | null,
    responderName: string,
  ): Promise<TransferRecord | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("transfer_requests")
      .update({
        responder_id: responderId,
        responder_name: responderName,
        status: "acceptée",
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Error responding to transfer:", error);
      throw new Error("Erreur lors de la réponse à la demande de transfert");
    }
    return mapTransfer(data as TransferRow);
  },
};
