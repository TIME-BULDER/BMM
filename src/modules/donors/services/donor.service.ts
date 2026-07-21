import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import { CreateDonorDTO, DonorRecord } from "../types";
import type { UpdateDonorDTO } from "../schemas";

interface DBDonorRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  city: string;
  latitude: number;
  longitude: number;
  age: number;
  available: boolean;
  bitcoin_address: string;
  profile_hash: string;
  ots_proof: string | null;
  validated?: boolean;
  created_at: string | Date;
  balance_sats?: number;
  card_type?: string;
  physical_card_status?: string;
  referred_by?: string | null;
}

/**
 * Mappe un enregistrement brut de la base de données donors vers le type DonorRecord
 */
function mapDonor(donor: DBDonorRow): DonorRecord {
  return {
    id: donor.id,
    firstName: donor.first_name,
    lastName: donor.last_name,
    email: donor.email,
    phoneNumber: donor.phone_number,
    bloodType: donor.blood_type,
    city: donor.city,
    latitude: donor.latitude,
    longitude: donor.longitude,
    age: donor.age,
    available: donor.available,
    bitcoinAddress: donor.bitcoin_address,
    profileHash: donor.profile_hash,
    otsProof: donor.ots_proof,
    validated: donor.validated ?? false,
    createdAt: new Date(donor.created_at),
    balanceSats: donor.balance_sats ?? 0,
    cardType: donor.card_type ?? "virtual",
    physicalCardStatus: donor.physical_card_status ?? "none",
    referredBy: donor.referred_by ?? null,
  };
}

export const donorService = {
  /**
   * Enregistre un nouveau donneur dans la base de données Supabase et lui crée un compte Auth
   */
  createDonor: async (
    data: CreateDonorDTO & { otsProof: string | null },
    options?: { asAdmin?: boolean },
  ): Promise<DonorRecord | null> => {
    // Mode admin : une structure/administrateur inscrit un donneur sans que sa
    // propre session soit affectée (création via l'API admin, pas via signUp
    // qui écrirait les cookies de session du nouveau compte).
    const asAdmin = options?.asAdmin ?? false;
    const adminClient = asAdmin ? createSupabaseAdminClient() : null;
    if (asAdmin && !adminClient) {
      throw ApiError.badRequest(
        "Inscription administrateur indisponible : clé service role non configurée.",
      );
    }

    const supabase = await createSupabaseServerClient();

    // 1. Création du compte Auth
    let userId: string;
    if (asAdmin && adminClient) {
      const { data: created, error: authError } =
        await adminClient.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
        });
      if (authError || !created.user) {
        const message =
          authError?.message || "Erreur lors de la création du compte donneur";
        if (
          /already registered|already been registered|exists/i.test(message)
        ) {
          throw ApiError.conflict(
            "Un compte existe déjà avec cet email. Utilisez une autre adresse.",
          );
        }
        throw ApiError.badRequest(message);
      }
      userId = created.user.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError || !authData.user) {
        console.error("Auth signUp for donor failed:", authError);
        const message =
          authError?.message || "Erreur lors de la création du compte donneur";
        if (
          /already registered|already been registered|exists/i.test(message)
        ) {
          throw ApiError.conflict(
            "Un compte existe déjà avec cet email. Connectez-vous ou utilisez une autre adresse.",
          );
        }
        throw ApiError.badRequest(message);
      }
      userId = authData.user.id;
    }

    // 2. Insertion du profil de donneur (service role en mode admin pour
    // contourner la RLS liée à la session).
    const db = asAdmin && adminClient ? adminClient : supabase;
    const { data: newDonor, error } = await db
      .from("donors")
      .insert([
        {
          id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber,
          blood_type: data.bloodType ?? null,
          city: data.city,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          age: data.age,
          available: data.available,
          bitcoin_address: data.bitcoinAddress,
          profile_hash: data.profileHash,
          ots_proof: data.otsProof,
          referred_by: data.referredById || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "Error creating donor profile:",
        error.message,
        error.code,
        error.details,
      );
      const adminClient = createSupabaseAdminClient();
      if (adminClient) {
        await adminClient.auth.admin.deleteUser(userId);
      }
      if (error.code === "23505") {
        throw ApiError.conflict(
          "Un donneur existe déjà avec ces informations (email ou identité Bitcoin).",
        );
      }
      throw ApiError.badRequest(
        `Erreur lors de l'enregistrement du profil de donneur: ${error.message}`,
      );
    }

    // 3. Si le donneur a été parrainé, ajouter une activité au parrain
    if (data.referredById) {
      await donorService.addActivity(
        data.referredById,
        "referral",
        `A parrainé un nouveau donneur : ${data.firstName} ${data.lastName}.`,
      );
    }

    return mapDonor(newDonor);
  },

  /**
   * Récupère un donneur par son ID
   */
  getDonorById: async (id: string): Promise<DonorRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const { data: donor, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !donor) {
      return null;
    }

    return mapDonor(donor);
  },

  /**
   * Récupère tous les donneurs mobilisables : validés par un centre ET
   * disponibles. Un donneur non validé n'appartient pas encore à la base
   * opérationnelle et ne doit donc jamais remonter dans la recherche/matching.
   */
  getAllAvailableDonors: async (): Promise<DonorRecord[]> => {
    const supabase = await createSupabaseServerClient();

    const { data: donors, error } = await supabase
      .from("donors")
      .select("*")
      .eq("validated", true)
      .eq("available", true)
      .limit(200);

    if (error || !donors) {
      return [];
    }

    return donors.map(mapDonor);
  },

  /**
   * Récupère tous les donneurs validés (donneur ayant déjà effectué au moins un don réel)
   */
  getValidatedDonors: async (): Promise<DonorRecord[]> => {
    const supabase = await createSupabaseServerClient();

    const { data: donors, error } = await supabase
      .from("donors")
      .select("*")
      .eq("validated", true)
      .limit(200);

    if (error || !donors) {
      return [];
    }

    return donors.map(mapDonor);
  },

  /**
   * Récupère tous les donneurs (validés ou non), pour l'annuaire des
   * structures et administrateurs : un donneur récemment inscrit doit être
   * visible afin d'être validé.
   */
  getAllDonors: async (): Promise<DonorRecord[]> => {
    const admin = createSupabaseAdminClient();
    const supabase = admin ?? (await createSupabaseServerClient());

    const { data: donors, error } = await supabase
      .from("donors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !donors) {
      return [];
    }

    return donors.map(mapDonor);
  },

  /**
   * Valide le profil d'un donneur (effectué par l'administrateur d'un hôpital après un don)
   */
  validateDonor: async (
    id: string,
    otsProof?: string | null,
  ): Promise<DonorRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const updateFields: { validated: boolean; ots_proof?: string | null } = {
      validated: true,
    };
    if (otsProof !== undefined) {
      updateFields.ots_proof = otsProof;
    }

    const { data: donor, error } = await supabase
      .from("donors")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error || !donor) {
      console.error("Error validating donor profile:", error);
      return null;
    }

    return mapDonor(donor);
  },

  /**
   * Met à jour les informations d'un donneur (depuis son espace).
   */
  updateDonor: async (
    id: string,
    data: UpdateDonorDTO,
  ): Promise<DonorRecord | null> => {
    const supabase = await createSupabaseServerClient();

    const patch: Record<string, unknown> = {};
    if (data.phoneNumber !== undefined) patch.phone_number = data.phoneNumber;
    if (data.email !== undefined) patch.email = data.email;
    if (data.city !== undefined) patch.city = data.city;
    if (data.latitude !== undefined) patch.latitude = data.latitude;
    if (data.longitude !== undefined) patch.longitude = data.longitude;
    if (data.available !== undefined) patch.available = data.available;

    const { data: donor, error } = await supabase
      .from("donors")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error || !donor) {
      console.error("Error updating donor profile:", error);
      throw new Error("Erreur lors de la mise à jour du profil de donneur");
    }

    return mapDonor(donor);
  },

  /**
   * Ajoute une activité pour un donneur.
   */
  addActivity: async (
    donorId: string,
    activityType: "blood_donation" | "referral" | "awareness_session",
    description?: string,
  ): Promise<boolean> => {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from("donor_activities").insert([
        {
          donor_id: donorId,
          activity_type: activityType,
          description: description || null,
        },
      ]);

      if (error) {
        console.error("Error adding donor activity:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error adding donor activity:", err);
      return false;
    }
  },

  /**
   * Récupère le nombre d'activités validées d'un donneur
   */
  getActivitiesCount: async (donorId: string): Promise<number> => {
    try {
      const supabase = await createSupabaseServerClient();
      const { count, error } = await supabase
        .from("donor_activities")
        .select("*", { count: "exact", head: true })
        .eq("donor_id", donorId);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("Error getting activities count:", err);
      return 0;
    }
  },

  /**
   * Crée une commande de carte physique
   */
  createCardOrder: async (data: {
    donorId: string;
    status: "pending" | "paid" | "merited";
    paymentMethod: "izichange_pay" | "merit";
    paymentReference?: string;
    amountPaid?: number;
  }): Promise<{ id: string; status: string } | null> => {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: order, error } = await supabase
        .from("card_orders")
        .insert([
          {
            donor_id: data.donorId,
            status: data.status,
            payment_method: data.paymentMethod,
            payment_reference: data.paymentReference || null,
            amount_paid: data.amountPaid || 0,
          },
        ])
        .select()
        .single();

      if (error || !order) {
        console.error("Error creating card order:", error);
        return null;
      }

      // Si c'est mérité, mettre directement à jour le statut physique de la carte du donneur
      if (data.status === "merited") {
        await supabase
          .from("donors")
          .update({
            physical_card_status: "requested_merit",
            card_type: "physical",
          })
          .eq("id", data.donorId);
      }

      return {
        id: order.id,
        status: order.status,
      };
    } catch (err) {
      console.error("Error creating card order:", err);
      return null;
    }
  },

  /**
   * Confirme le paiement d'une commande et active la carte du donneur
   */
  confirmCardOrderPayment: async (
    orderId: string,
    donorId: string,
  ): Promise<boolean> => {
    try {
      const supabase = await createSupabaseServerClient();

      const { error: orderError } = await supabase
        .from("card_orders")
        .update({ status: "paid" })
        .eq("id", orderId)
        .eq("donor_id", donorId);

      if (orderError) {
        console.error("Error updating card order to paid:", orderError);
        return false;
      }

      const { error: donorError } = await supabase
        .from("donors")
        .update({
          physical_card_status: "ordered_paid",
          card_type: "physical",
        })
        .eq("id", donorId);

      if (donorError) {
        console.error(
          "Error updating donor card status to ordered_paid:",
          donorError,
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error confirming card payment:", err);
      return false;
    }
  },

  /**
   * Modifie le solde de satoshis d'un donneur (addition ou soustraction)
   */
  updateDonorBalance: async (
    donorId: string,
    amountChange: number,
  ): Promise<number | null> => {
    try {
      const supabase = await createSupabaseServerClient();

      const { data: donor, error: fetchError } = await supabase
        .from("donors")
        .select("balance_sats")
        .eq("id", donorId)
        .single();

      if (fetchError || !donor) {
        console.error("Error fetching donor balance:", fetchError);
        return null;
      }

      const newBalance = Math.max(0, donor.balance_sats + amountChange);

      const { data: updated, error: updateError } = await supabase
        .from("donors")
        .update({ balance_sats: newBalance })
        .eq("id", donorId)
        .select("balance_sats")
        .single();

      if (updateError || !updated) {
        console.error("Error updating donor balance:", updateError);
        return null;
      }

      return updated.balance_sats;
    } catch (err) {
      console.error("Error updating donor balance:", err);
      return null;
    }
  },

  /* ------------------------- Demandes de carte ------------------------- */

  /** Demande de carte d'un donneur (ou null). */
  getCardRequest: async (
    donorId: string,
  ): Promise<CardRequestRecord | null> => {
    const db =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await db
      .from("card_requests")
      .select("*")
      .eq("donor_id", donorId)
      .maybeSingle();
    if (error || !data) return null;
    return mapCardRequest(data);
  },

  /** Crée ou met à jour la demande de carte d'un donneur (statut 'requested'). */
  upsertCardRequest: async (data: {
    donorId: string;
    photo?: string | null;
    format: "physical" | "digital";
  }): Promise<CardRequestRecord | null> => {
    const db =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data: row, error } = await db
      .from("card_requests")
      .upsert(
        {
          donor_id: data.donorId,
          photo: data.photo ?? null,
          format: data.format,
          status: "requested",
          reviewed_by: null,
          reviewed_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "donor_id" },
      )
      .select("*")
      .single();
    if (error || !row) {
      console.error("Error upserting card request:", error);
      return null;
    }
    return mapCardRequest(row);
  },

  /** Toutes les demandes de carte, enrichies du nom et du groupe (admin). */
  listCardRequests: async (): Promise<CardRequestRecord[]> => {
    const db =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await db
      .from("card_requests")
      .select("*, donors(first_name, last_name, blood_type)")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapCardRequest);
  },

  /** Valide ou refuse une demande de carte (admin). */
  updateCardRequestStatus: async (
    id: string,
    status: "approved" | "rejected",
    reviewerId: string,
  ): Promise<CardRequestRecord | null> => {
    const db =
      createSupabaseAdminClient() ?? (await createSupabaseServerClient());
    const { data, error } = await db
      .from("card_requests")
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, donors(first_name, last_name, blood_type)")
      .single();
    if (error || !data) {
      console.error("Error updating card request status:", error);
      return null;
    }
    return mapCardRequest(data);
  },
};

export type CardRequestRecord = {
  id: string;
  donorId: string;
  donorName: string;
  bloodType: string | null;
  photo: string | null;
  format: "physical" | "digital";
  status: "requested" | "approved" | "rejected";
  updatedAt: string;
};

type DBCardRequestRow = {
  id: string;
  donor_id: string;
  photo: string | null;
  format: "physical" | "digital";
  status: "requested" | "approved" | "rejected";
  updated_at: string | Date;
  donors?: {
    first_name?: string;
    last_name?: string;
    blood_type?: string | null;
  } | null;
};

function mapCardRequest(row: DBCardRequestRow): CardRequestRecord {
  const name = [row.donors?.first_name, row.donors?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    id: row.id,
    donorId: row.donor_id,
    donorName: name,
    bloodType: row.donors?.blood_type ?? null,
    photo: row.photo,
    format: row.format,
    status: row.status,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
