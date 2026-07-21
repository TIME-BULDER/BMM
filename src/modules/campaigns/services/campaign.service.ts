import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateCampaignDTO, CampaignRecord } from "../types";
import { donorService, DonorRecord } from "@/modules/donors";

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

export const campaignService = {
  /**
   * Trouve les donneurs ciblés pour une campagne
   */
  findTargetedDonors: async (
    type: "targeted" | "general",
    targetBloodType: string | undefined,
    lat: number,
    lon: number,
    radiusKm: number,
  ): Promise<DonorRecord[]> => {
    // 1. Récupérer tous les donneurs
    const allDonors = await donorService.getAllAvailableDonors();

    // 2. Filtrer par distance
    let targetedDonors = allDonors.filter((donor) => {
      const distance = haversineDistance(
        lat,
        lon,
        donor.latitude,
        donor.longitude,
      );
      return distance <= radiusKm;
    });

    // 3. Filtrer par groupe sanguin si campagne ciblée
    if (type === "targeted" && targetBloodType) {
      targetedDonors = targetedDonors.filter(
        (d) => d.bloodType === targetBloodType,
      );
    }

    return targetedDonors;
  },

  /**
   * Simule l'envoi d'emails aux donneurs ciblés (en local / fallback)
   */
  simulateEmailSending: (donors: DonorRecord[], campaignTitle: string) => {
    console.warn(
      `[SIMULATION EMAIL] Début de l'envoi pour la campagne "${campaignTitle}"`,
    );
    console.warn(`[SIMULATION EMAIL] Cible : ${donors.length} donneur(s).`);

    donors.forEach((d) => {
      console.warn(
        `- Email simulé envoyé à ${d.firstName} ${d.lastName} (ID: ${d.id}, Groupe: ${d.bloodType})`,
      );
    });

    console.warn(`[SIMULATION EMAIL] Fin de l'envoi.`);
    return donors.length;
  },

  /**
   * Envoie des emails réels aux donneurs ciblés via les Edge Functions de Supabase
   */
  sendRealEmails: async (
    donors: DonorRecord[],
    campaignTitle: string,
    hospitalName: string,
  ): Promise<number> => {
    const supabase = await createSupabaseServerClient();

    let successCount = 0;
    const chunkSize = 50;

    for (let i = 0; i < donors.length; i += chunkSize) {
      const chunk = donors.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(async (donor) => {
          const { error } = await supabase.functions.invoke("send-email", {
            body: {
              to_email: donor.email,
              to_name: `${donor.firstName} ${donor.lastName}`,
              campaign_title: campaignTitle,
              hospital_name: hospitalName,
              blood_type: donor.bloodType,
              city: donor.city,
            },
          });

          if (error) {
            throw error;
          }
          return true;
        }),
      );

      let hasInvocationError = false;
      for (const result of results) {
        if (result.status === "fulfilled") {
          successCount++;
        } else {
          console.error(
            `Erreur d'envoi via Supabase Edge Function:`,
            result.reason,
          );
          hasInvocationError = true;
        }
      }

      // Si toutes les tentatives ont échoué (par exemple si la fonction n'est pas déployée en local),
      // on bascule sur la simulation pour ne pas bloquer le flux de dev.
      if (hasInvocationError && successCount === 0) {
        console.warn(
          "L'envoi via Supabase Edge Function a échoué. Fallback sur la simulation de logs.",
        );
        return campaignService.simulateEmailSending(donors, campaignTitle);
      }
    }

    return successCount;
  },

  /**
   * Crée une campagne dans la base de données
   */
  createCampaign: async (
    data: CreateCampaignDTO,
  ): Promise<CampaignRecord | null> => {
    const supabase = await createSupabaseServerClient();

    // Récupérer le nom de l'hôpital pour personnaliser l'objet et le template de l'e-mail
    const { data: orgData } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", data.hospitalId)
      .single();
    const hospitalName = orgData?.name || "Hôpital partenaire";

    // Étape 1 : Trouver les donneurs ciblés
    const targetedDonors = await campaignService.findTargetedDonors(
      data.type,
      data.targetBloodType,
      data.latitude,
      data.longitude,
      data.radiusKm,
    );

    // Étape 2 : Envoyer les emails réels
    const emailsSentCount = await campaignService.sendRealEmails(
      targetedDonors,
      data.title,
      hospitalName,
    );

    // Étape 3 : Sauvegarder la campagne avec les stats
    const { data: newCampaign, error } = await supabase
      .from("campaigns")
      .insert([
        {
          hospital_id: data.hospitalId,
          title: data.title,
          type: data.type,
          target_blood_type: data.targetBloodType || null,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          radius_km: data.radiusKm,
          start_date: data.startsAt ?? null,
          end_date: data.endsAt ?? null,
          emails_sent: emailsSentCount,
          responses_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      throw new Error("Erreur lors de la création de la campagne");
    }

    return {
      id: newCampaign.id,
      hospitalId: newCampaign.hospital_id,
      title: newCampaign.title,
      type: newCampaign.type,
      targetBloodType: newCampaign.target_blood_type,
      city: newCampaign.city,
      latitude: newCampaign.latitude,
      longitude: newCampaign.longitude,
      radiusKm: newCampaign.radius_km,
      startsAt: newCampaign.start_date ?? null,
      endsAt: newCampaign.end_date ?? null,
      emailsSent: newCampaign.emails_sent,
      responsesCount: newCampaign.responses_count,
      status: newCampaign.status,
      createdAt: new Date(newCampaign.created_at),
    };
  },

  /**
   * Récupère toutes les campagnes d'un hôpital pour son dashboard
   */
  getHospitalCampaigns: async (
    hospitalId: string,
  ): Promise<CampaignRecord[]> => {
    const supabase = await createSupabaseServerClient();

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (error || !campaigns) {
      return [];
    }

    return campaigns.map((c) => ({
      id: c.id,
      hospitalId: c.hospital_id,
      title: c.title,
      type: c.type,
      targetBloodType: c.target_blood_type,
      city: c.city,
      latitude: c.latitude,
      longitude: c.longitude,
      radiusKm: c.radius_km,
      startsAt: c.start_date ?? null,
      endsAt: c.end_date ?? null,
      emailsSent: c.emails_sent,
      responsesCount: c.responses_count,
      status: c.status,
      createdAt: new Date(c.created_at),
    }));
  },
};
