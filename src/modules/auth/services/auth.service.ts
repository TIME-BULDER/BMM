import { ApiError } from "@/lib/api/errors";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { LoginDTO, SignUpDTO, UserProfile } from "../types";

export const authService = {
  /**
   * Connecte un utilisateur existant
   */
  login: async (data: LoginDTO) => {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Login failed:", error);
      throw ApiError.unauthorized("Email ou mot de passe incorrect.");
    }

    return authData;
  },

  /**
   * Déconnecte l'utilisateur courant et nettoie sa session
   */
  logout: async () => {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      throw new Error("Erreur de déconnexion");
    }
  },

  /**
   * Inscrit une nouvelle organisation et lui associe un administrateur
   */
  signUpOrganization: async (data: SignUpDTO) => {
    const supabase = await createSupabaseServerClient();

    // Les insertions de bootstrap (organisation + profil) contournent RLS via
    // le client administrateur: au moment de l'inscription, l'utilisateur n'a
    // pas encore de rôle, donc les politiques réservées au super_admin
    // bloqueraient l'insertion (œuf/poule). On vérifie sa disponibilité avant
    // de créer le compte pour éviter un utilisateur auth orphelin.
    const admin = createSupabaseAdminClient();
    if (!admin) {
      throw new Error(
        "Inscription indisponible: SUPABASE_SERVICE_ROLE_KEY n'est pas configurée.",
      );
    }

    // 1. Inscription dans Supabase Auth (crée le compte)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError || !authData.user) {
      console.error("Auth signUp failed:", signUpError);
      // Remonte la cause réelle (email invalide, rate limit, déjà inscrit…)
      // au lieu de la masquer derrière une erreur interne générique.
      throw ApiError.badRequest(
        signUpError?.message || "Erreur lors de la création du compte.",
      );
    }

    const userId = authData.user.id;

    try {
      // 2. Création de l'organisation dans la base
      const { data: newOrg, error: orgError } = await admin
        .from("organizations")
        .insert([
          {
            name: data.name,
            type: data.type,
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            contact_email: data.contactEmail,
            verified: false, // Non vérifié par défaut
          },
        ])
        .select()
        .single();

      if (orgError || !newOrg) {
        console.error("Org insertion failed:", orgError);
        await admin.auth.admin.deleteUser(userId);
        throw new Error("Erreur lors de la création de l'organisation");
      }

      // 3. Rattachement du profil utilisateur à l'organisation.
      // Un trigger `handle_new_user` peut déjà avoir créé la ligne
      // `user_profiles` lors du signUp Auth: on fait donc un upsert sur la
      // clé primaire `id` (au lieu d'un insert qui violerait la PK) pour
      // renseigner l'organisation et le rôle, que le trigger existe ou non.
      const { error: profileError } = await admin.from("user_profiles").upsert(
        [
          {
            id: userId,
            organization_id: newOrg.id,
            role: "org_admin",
          },
        ],
        { onConflict: "id" },
      );

      if (profileError) {
        console.error("Profile insertion failed:", profileError);
        // Nettoyage de l'organisation puis de l'utilisateur auth créés.
        await admin.from("organizations").delete().eq("id", newOrg.id);
        await admin.auth.admin.deleteUser(userId);

        throw new Error("Erreur lors de la création du profil utilisateur");
      }

      return {
        user: authData.user,
        organization: newOrg,
      };
    } catch (err) {
      console.error("Database initialization failed during signup:", err);
      throw err;
    }
  },

  /**
   * Récupère les informations et le profil de l'utilisateur connecté
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Récupère le rôle et l'organisation associée via le client admin: la
    // session est déjà authentifiée (JWT validé par getUser ci-dessus), et
    // lire le profil avec le service-role rend /auth/me insensible aux
    // défauts de politiques RLS sur user_profiles (ex: récursion). On ne lit
    // que la ligne de l'utilisateur courant, identifiée par son id vérifié.
    const db = createSupabaseAdminClient() ?? supabase;

    // Détection du rôle : un compte présent dans `donors` est un donneur, même
    // s'il possède par ailleurs une ligne user_profiles (créée par un trigger).
    // On vérifie donc `donors` en premier, ce qui évite qu'un donneur soit pris
    // pour un membre d'organisation et accède aux espaces d'administration.
    const { data: donor } = await db
      .from("donors")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (donor) {
      return {
        id: user.id,
        email: user.email || undefined,
        role: "donor",
        organizationId: null,
        organization: null,
        donor: {
          id: donor.id,
          firstName: donor.first_name,
          lastName: donor.last_name,
          bloodType: donor.blood_type,
          city: donor.city,
          latitude: donor.latitude,
          longitude: donor.longitude,
          age: donor.age,
          available: donor.available,
          bitcoinAddress: donor.bitcoin_address,
          profileHash: donor.profile_hash,
          otsProof: donor.ots_proof,
          validated: donor.validated,
          createdAt: new Date(donor.created_at),
          balanceSats: donor.balance_sats,
          cardType: donor.card_type,
          physicalCardStatus: donor.physical_card_status,
          referredBy: donor.referred_by,
        },
      };
    }

    const { data: profile, error: profileError } = await db
      .from("user_profiles")
      .select("*, organization:organizations(*)")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      if (profileError) {
        console.error(
          "getCurrentUser: lecture du profil utilisateur échouée:",
          profileError,
        );
      }
      return null;
    }

    const org = profile.organization;

    return {
      id: user.id,
      email: user.email,
      role: profile.role as "super_admin" | "org_admin",
      organizationId: profile.organization_id,
      organization: org
        ? {
            id: org.id,
            name: org.name,
            type: org.type,
            latitude: org.latitude,
            longitude: org.longitude,
            city: org.city,
            contactEmail: org.contact_email,
            verified: org.verified,
            rejectionReason: org.rejection_reason ?? null,
            createdAt: new Date(org.created_at),
            balanceSats: org.balance_sats ?? 0,
          }
        : null,
    };
  },
};
