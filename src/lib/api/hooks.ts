"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  setCardStatus as localDecideCardRequest,
  upsertCardRequest as localUpsertCardRequest,
  useCardRequest as useLocalCardRequest,
  useCardRequests as useLocalCardRequests,
  type CardRequest as LocalCardRequest,
} from "@/lib/card-request";
import { debitDemoBalance, rechargeDemoBalance } from "@/lib/org-balance";
import {
  AUTH_BYPASS,
  DEMO_CURRENT_ORG_ID,
  demoCampaigns,
  demoDonations,
  demoDonorAccount,
  demoDonors,
  demoEmergencies,
  demoMatches,
  demoOrganizations,
  demoRewards,
  demoStock,
  demoTransfers,
  type BloodComponent,
  type DonorAccount,
  type RewardEntry,
  type TransferRequest,
} from "@/lib/dev/demo";

import {
  authApi,
  campaignsApi,
  cardRequestsApi,
  donationsApi,
  donorsApi,
  emergenciesApi,
  organizationsApi,
  searchApi,
  stockApi,
  transfersApi,
  verifyApi,
  type ActivityType,
  type CampaignRecord,
  type CardOrderMethod,
  type CardOrderResult,
  type CardRequestRecord,
  type SubmitCardRequestPayload,
  type CreateCampaignPayload,
  type CreateDonationPayload,
  type DonationInvoice,
  type DonationsHistory,
  type CreateDonorPayload,
  type CreateEmergencyPayload,
  type DonorRecord,
  type EmergencyRecord,
  type EmergencyStatus,
  type LoginPayload,
  type OfflineIdentityResponse,
  type Organization,
  type OrgDocument,
  type OrgDocumentType,
  type RegisterOrganizationPayload,
  type RewardLog,
  type RewardPayload,
  type SearchParams,
  type TransferUrgency,
  type UpdateDonorPayload,
  type VerifyResult,
} from "./resources";

/** Convertit un DonorRecord (API) vers la vue riche de l'espace donneur. */
function toDonorAccount(rec: DonorRecord): DonorAccount {
  return {
    id: rec.id,
    firstName: rec.firstName,
    lastName: rec.lastName,
    email: rec.email,
    phoneNumber: rec.phoneNumber,
    city: rec.city,
    bloodType: rec.bloodType,
    phenotype: rec.bloodType,
    rarity: "Commun",
    cmvNegative: false,
    preferredDonation: "Sang total",
    available: rec.available,
    eligibility: {
      status: "éligible",
      nextEligibleDate: new Date().toISOString().slice(0, 10),
    },
    totalDonations: 0,
    lastDonation: rec.createdAt,
    bitcoinAddress: rec.bitcoinAddress,
    verified: rec.validated,
    balanceSats: rec.balanceSats ?? 0,
    cardType: rec.cardType ?? "digital",
    physicalCardStatus: rec.physicalCardStatus ?? "none",
  };
}

function toRewardEntry(log: RewardLog): RewardEntry {
  const status =
    log.status === "completed"
      ? "Envoyée"
      : log.status === "failed"
        ? "Échouée"
        : "En attente";
  return {
    id: log.id,
    date: log.createdAt.slice(0, 10),
    sats: log.satsAmount,
    status,
    label: "Récompense de don",
  };
}

/** Délai simulé pour que les états de chargement restent visibles en démo. */
const demoDelay = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), 350));

/**
 * Fonctionnalités qui tournent en local (données de démo + navigateur) tant que
 * leur backend n'est pas finalisé. Actives même hors bypass d'authentification,
 * pour que la démo fonctionne de bout en bout.
 */
const DEMO_CARDS = true;
const DEMO_NETWORK = true;
// Paiements et flux Bitcoin/Lightning/Mobile Money (Izichange, Nostr, Breez) :
// récompense, approvisionnement du compte, retraits et dons plateforme.
const DEMO_PAYMENTS = true;
const LOCAL_CARDS = AUTH_BYPASS || DEMO_CARDS;
const LOCAL_NETWORK = AUTH_BYPASS || DEMO_NETWORK;
const LOCAL_PAYMENTS = AUTH_BYPASS || DEMO_PAYMENTS;

/** Facture Lightning simulée (le QR reste scannable en démo). */
function demoDonationInvoice(payload: CreateDonationPayload): DonationInvoice {
  return {
    bolt11: `lnbc${payload.amountSats}n1demo${Math.random()
      .toString(36)
      .slice(2, 10)}xqzdemobitcoinbloodsimulatedinvoiceforpresentationonly`,
    amountSats: payload.amountSats,
    purpose: payload.purpose,
    feesSat: 0,
    simulated: true,
  };
}

/** Historique de dons plateforme simulé (vue super-admin). */
const demoDonationsHistory: DonationsHistory = {
  donations: [
    {
      id: "don-demo-1",
      amountSats: 100_000,
      purpose: "development",
      message: "Bravo pour le projet !",
      bolt11: null,
      status: "completed",
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
      id: "don-demo-2",
      amountSats: 21_000,
      purpose: "emergency",
      message: null,
      bolt11: null,
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
    {
      id: "don-demo-3",
      amountSats: 10_000,
      purpose: "operations",
      message: "Continuez comme ça.",
      bolt11: null,
      status: "completed",
      createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    },
  ],
  totalSats: 131_000,
  count: 3,
};

export const queryKeys = {
  me: ["auth", "me"] as const,
  emergencies: (hospitalId?: string) =>
    ["emergencies", hospitalId ?? "all"] as const,
  emergency: (id: string) => ["emergencies", "detail", id] as const,
  campaigns: (hospitalId?: string) =>
    ["campaigns", hospitalId ?? "mine"] as const,
  verify: (id: string) => ["verify", id] as const,
};

/* ----------------------------- Session ----------------------------- */

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authApi.me().then((r) => r.data),
    enabled: !AUTH_BYPASS,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Connexion réussie." },
    mutationFn: (payload: LoginPayload) =>
      AUTH_BYPASS ? Promise.resolve(null) : authApi.login(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useRegisterOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Compte de votre structure créé." },
    mutationFn: (payload: RegisterOrganizationPayload) =>
      AUTH_BYPASS ? Promise.resolve(null) : authApi.register(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

/* ---------------------------- Urgences ----------------------------- */

export function useEmergencies(hospitalId?: string) {
  return useQuery({
    queryKey: queryKeys.emergencies(hospitalId),
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoEmergencies)
        : emergenciesApi.list(hospitalId).then((r) => r.data),
  });
}

/** Détail d'une urgence unique (`GET /api/v1/emergencies/[id]`). */
export function useEmergency(id: string) {
  return useQuery({
    queryKey: ["emergency", id],
    enabled: id.length > 0,
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoEmergencies.find((e) => e.id === id) ?? null)
        : emergenciesApi.get(id).then((r) => r.data),
  });
}

export function useCreateEmergency() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Alerte d'urgence publiée." },
    mutationFn: (payload: CreateEmergencyPayload) => {
      if (AUTH_BYPASS) {
        const record: EmergencyRecord = {
          id: `demo-${Date.now()}`,
          hospitalId: "demo",
          status: "active",
          createdAt: new Date().toISOString(),
          ...payload,
        };
        qc.setQueriesData<EmergencyRecord[]>(
          { queryKey: ["emergencies"] },
          (old) => [record, ...(old ?? [])],
        );
        return Promise.resolve(record);
      }
      return emergenciesApi.create(payload).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
}

export function useUpdateEmergencyStatus() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Statut de l'urgence mis à jour." },
    mutationFn: ({ id, status }: { id: string; status: EmergencyStatus }) => {
      if (AUTH_BYPASS) {
        qc.setQueriesData<EmergencyRecord[]>(
          { queryKey: ["emergencies"] },
          (old) => old?.map((e) => (e.id === id ? { ...e, status } : e)),
        );
        return Promise.resolve(null);
      }
      return emergenciesApi.updateStatus(id, status).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
}

export function useDeleteEmergency() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Urgence supprimée." },
    mutationFn: (id: string) => {
      if (AUTH_BYPASS) {
        qc.setQueriesData<EmergencyRecord[]>(
          { queryKey: ["emergencies"] },
          (old) => old?.filter((e) => e.id !== id),
        );
        return Promise.resolve({ success: true });
      }
      return emergenciesApi.remove(id).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
}

/* ---------------------------- Campagnes ---------------------------- */

export function useCampaigns(hospitalId?: string) {
  return useQuery({
    queryKey: queryKeys.campaigns(hospitalId),
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoCampaigns)
        : campaignsApi.list(hospitalId).then((r) => r.data),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Campagne créée." },
    mutationFn: (payload: CreateCampaignPayload) => {
      if (AUTH_BYPASS) {
        const record: CampaignRecord = {
          ...payload,
          id: `demo-${Date.now()}`,
          hospitalId: "demo",
          targetBloodType: payload.targetBloodType ?? null,
          emailsSent: 0,
          responsesCount: 0,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        qc.setQueriesData<CampaignRecord[]>(
          { queryKey: ["campaigns"] },
          (old) => [record, ...(old ?? [])],
        );
        return Promise.resolve(record);
      }
      return campaignsApi.create(payload).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

/* ----------------------------- Recherche --------------------------- */

export function useSearchDonors() {
  return useMutation({
    mutationFn: (params: SearchParams) =>
      AUTH_BYPASS
        ? demoDelay({
            ai: !!params.ai,
            matches: demoMatches.filter((d) => d.available),
          })
        : searchApi.donors(params),
  });
}

/* ----------------------------- Donneurs ---------------------------- */

/** Annuaire des donneurs validés (endpoint réel `GET /api/v1/donors`). */
export function useDonors() {
  return useQuery({
    queryKey: ["donors", "directory"],
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoDonors)
        : donorsApi.list().then((r) => r.data),
  });
}

export function useCreateDonor() {
  return useMutation({
    meta: { success: "Donneur enregistré." },
    mutationFn: (payload: CreateDonorPayload): Promise<DonorRecord> => {
      if (AUTH_BYPASS) {
        return demoDelay({
          ...payload,
          bloodType: payload.bloodType ?? "O+",
          latitude: payload.latitude ?? 0,
          longitude: payload.longitude ?? 0,
          id: `demo-${Date.now()}`,
          otsProof: null,
          validated: false,
          createdAt: new Date().toISOString(),
        });
      }
      return donorsApi.create(payload).then((r) => r.data);
    },
  });
}

export function useValidateDonor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Donneur validé." },
    mutationFn: (id: string) => {
      if (AUTH_BYPASS) {
        qc.setQueriesData<DonorRecord[]>({ queryKey: ["donors"] }, (old) =>
          old?.map((d) => (d.id === id ? { ...d, validated: true } : d)),
        );
        return Promise.resolve(null);
      }
      return donorsApi.validate(id).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

/* ---------------------------- Vérification -------------------------- */

export function useVerifyDonor(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.verify(id),
    queryFn: () => {
      if (AUTH_BYPASS) {
        const donor = demoDonors[0];
        return demoDelay<VerifyResult>({
          donor: {
            id,
            bloodType: donor.bloodType,
            bitcoinAddress: donor.bitcoinAddress,
            profileHash: donor.profileHash,
            hasOtsProof: true,
            createdAt: donor.createdAt,
            balanceSats: 12_000,
            cardType: "digital",
            physicalCardStatus: "none",
            activityCount: 4,
          },
          verification: {
            isTimestampVerified: true,
            details: {
              height: 842119,
              timestamp: Math.floor(Date.now() / 1000),
            },
          },
        });
      }
      return verifyApi.get(id).then((r) => r.data);
    },
    enabled: enabled && id.length > 0,
    retry: false,
  });
}

export function useRewardDonor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Récompense envoyée au donneur." },
    mutationFn: ({ id, ...payload }: { id: string } & RewardPayload) => {
      if (LOCAL_PAYMENTS) {
        // Débit du compte d'approvisionnement en démo (sauf points, gratuits).
        if (!payload.awardPoints) {
          debitDemoBalance(payload.satsAmount ?? 1000);
        }
        return demoDelay({
          message: "Récompense simulée envoyée.",
          reward: null,
        });
      }
      return verifyApi.reward(id, payload).then((r) => r.data);
    },
    onSuccess: () => {
      // Le solde de la structure a été débité côté serveur : on le rafraîchit.
      if (!LOCAL_PAYMENTS) qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

/** Recharge le compte d'approvisionnement de la structure connectée. */
export function useRechargeOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amountSats: number) => {
      if (LOCAL_PAYMENTS) {
        rechargeDemoBalance(amountSats);
        return Promise.resolve({ balanceSats: 0 });
      }
      return organizationsApi.recharge(amountSats).then((r) => r.data);
    },
    onSuccess: () => {
      if (!LOCAL_PAYMENTS) qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

/* ------------------------- Super-admin (orgs) ---------------------- */

/**
 * Liste des organisations (vue super-admin). En attente d'un endpoint
 * backend `GET /api/v1/organizations`: pour l'instant données simulées.
 */
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoOrganizations)
        : organizationsApi.list().then((r) => r.data),
  });
}

/** Vérifie une organisation (vue super-admin). Démo en attendant l'endpoint. */
export function useVerifyOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Organisation vérifiée." },
    mutationFn: (id: string) => {
      if (AUTH_BYPASS) {
        qc.setQueriesData<Organization[]>(
          { queryKey: ["organizations"] },
          (old) =>
            old?.map((o) => (o.id === id ? { ...o, verified: true } : o)),
        );
        return Promise.resolve(null);
      }
      return organizationsApi.verify(id).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

/** Rejette une organisation avec un motif (vue super-admin). */
export function useRejectOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Organisation rejetée." },
    mutationFn: ({ id, reason }: { id: string; reason: string }) => {
      if (AUTH_BYPASS) {
        qc.setQueriesData<Organization[]>(
          { queryKey: ["organizations"] },
          (old) =>
            old?.map((o) =>
              o.id === id
                ? { ...o, verified: false, rejectionReason: reason }
                : o,
            ),
        );
        return Promise.resolve(null);
      }
      return organizationsApi.reject(id, reason).then((r) => r.data);
    },
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

/** Justificatifs déposés par la structure connectée. */
export function useMyOrgDocuments() {
  return useQuery({
    queryKey: ["org-documents", "me"],
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay<OrgDocument[]>([])
        : organizationsApi.myDocuments().then((r) => r.data),
  });
}

/** Justificatifs d'une structure avec URLs signées (vue super-admin). */
export function useOrgDocuments(id: string | undefined) {
  return useQuery({
    queryKey: ["org-documents", id],
    enabled: Boolean(id) && !AUTH_BYPASS,
    queryFn: () => organizationsApi.documentsForOrg(id!).then((r) => r.data),
  });
}

/** Téléverse un justificatif pour la structure connectée. */
export function useUploadOrgDocument() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Justificatif téléversé." },
    mutationFn: ({ docType, file }: { docType: OrgDocumentType; file: File }) =>
      organizationsApi.uploadDocument(docType, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-documents", "me"] });
    },
  });
}

/* ----------------------- Dons a la plateforme --------------------- */

/** Genere une facture Lightning pour un don a la plateforme. */
export function useCreateDonation() {
  return useMutation({
    mutationFn: (payload: CreateDonationPayload) =>
      LOCAL_PAYMENTS
        ? demoDelay(demoDonationInvoice(payload))
        : donationsApi.create(payload).then((r) => r.data),
  });
}

/** Historique des dons + total collecte (super-admin). */
export function useDonationsHistory() {
  return useQuery({
    queryKey: ["donations", "history"],
    enabled: LOCAL_PAYMENTS || !AUTH_BYPASS,
    refetchInterval: LOCAL_PAYMENTS ? false : 30_000,
    queryFn: () =>
      LOCAL_PAYMENTS
        ? demoDelay(demoDonationsHistory)
        : donationsApi.history().then((r) => r.data),
  });
}

/** Retire les fonds collectes vers une facture Lightning (super-admin). */
export function useWithdrawDonations() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Retrait des dons initié." },
    mutationFn: (bolt11: string) =>
      LOCAL_PAYMENTS
        ? demoDelay({ paymentHash: `demo${Date.now().toString(16)}` })
        : donationsApi.withdraw(bolt11).then((r) => r.data),
    onSuccess: () => {
      if (!LOCAL_PAYMENTS) qc.invalidateQueries({ queryKey: ["donations"] });
    },
  });
}

/* ------------------ Réseau inter-centres (démo) -------------------- */

/** Stock de la structure par composant. Démo en attendant `GET /stock`. */
export function useStock() {
  return useQuery({
    queryKey: ["stock"],
    queryFn: () =>
      LOCAL_NETWORK
        ? demoDelay(demoStock)
        : stockApi.list().then((r) => r.data),
  });
}

/** Demandes de transfert du réseau. */
export function useTransfers() {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: () =>
      LOCAL_NETWORK
        ? demoDelay(demoTransfers)
        : transfersApi.list().then((r) => r.data),
  });
}

export type CreateTransferInput = {
  component: BloodComponent;
  bloodType: string;
  quantity: number;
  urgency: TransferUrgency;
};

/** Publie une demande de transfert vers le réseau (démo). */
export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de transfert publiée." },
    mutationFn: (input: CreateTransferInput) => {
      if (LOCAL_NETWORK) {
        const record: TransferRequest = {
          ...input,
          id: `trf-${Date.now()}`,
          requesterId: DEMO_CURRENT_ORG_ID,
          requesterName: "CNHU-HKM de Cotonou",
          requesterCity: "Cotonou",
          status: "ouverte",
          createdAt: new Date().toISOString(),
        };
        qc.setQueriesData<TransferRequest[]>(
          { queryKey: ["transfers"] },
          (old) => [record, ...(old ?? [])],
        );
        return Promise.resolve(record);
      }
      return transfersApi.create(input).then((r) => r.data);
    },
    onSuccess: () => {
      if (!LOCAL_NETWORK) qc.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

/** Répond favorablement à une demande du réseau. */
export function useRespondTransfer() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Proposition envoyée au centre demandeur." },
    mutationFn: (id: string) => {
      if (LOCAL_NETWORK) {
        qc.setQueriesData<TransferRequest[]>(
          { queryKey: ["transfers"] },
          (old) =>
            old?.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: "acceptée" as const,
                    responderId: DEMO_CURRENT_ORG_ID,
                    responderName: "CNHU-HKM de Cotonou",
                  }
                : t,
            ),
        );
        return Promise.resolve(null);
      }
      return transfersApi.respond(id).then((r) => r.data);
    },
    onSuccess: () => {
      if (!LOCAL_NETWORK) qc.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

/* ------------------------- Espace donneur -------------------------- */

/** Profil du donneur connecté (vue riche). Repli démo si bypass. */
export function useDonorProfile() {
  return useQuery({
    queryKey: ["donor", "me"],
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoDonorAccount)
        : donorsApi.me().then((r) => {
            const account = toDonorAccount(r.data);
            // En démo paiements, on crédite un solde retirable pour pouvoir
            // dérouler le retrait Mobile Money même sans historique réel.
            if (DEMO_PAYMENTS && account.balanceSats < 1) {
              account.balanceSats = 45_000;
            }
            return account;
          }),
    retry: false,
  });
}

/** Historique des dons. Aucun endpoint dédié: données simulées. */
export function useDonorDonations() {
  return useQuery({
    queryKey: ["donor", "donations"],
    queryFn: () => demoDelay(demoDonations),
  });
}

/** Récompenses Lightning du donneur. */
export function useDonorRewardsList(donorId?: string) {
  return useQuery({
    queryKey: ["donor", "rewards", donorId ?? "me"],
    queryFn: () =>
      AUTH_BYPASS
        ? demoDelay(demoRewards)
        : donorsApi
            .rewards(donorId as string)
            .then((r) => r.data.map(toRewardEntry)),
    enabled: AUTH_BYPASS || !!donorId,
  });
}

/**
 * Génère à la demande l'attestation d'identité sanguine signée (BIP-322),
 * vérifiable hors-ligne. En mode démo, l'attestation est signée côté client.
 */
export function useDonorOfflineIdentity() {
  return useMutation({
    mutationFn: async ({
      id,
      bloodType,
    }: {
      id: string;
      bloodType: string;
    }): Promise<OfflineIdentityResponse> => {
      if (LOCAL_PAYMENTS) {
        const { createOfflineAttestation } =
          await import("@/lib/bitcoin/donor-identity");
        return createOfflineAttestation(id, bloodType);
      }
      const res = await donorsApi.offlineIdentity(id);
      return res.data.identity;
    },
  });
}

/** Retrait autonome du solde plateforme vers Mobile Money (Izichange). */
export function useWithdrawBalance() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Retrait vers Mobile Money initié." },
    mutationFn: async (payload: { amountSats: number; momoNumber: string }) => {
      if (LOCAL_PAYMENTS) {
        qc.setQueryData<DonorAccount>(["donor", "me"], (old) =>
          old
            ? {
                ...old,
                balanceSats: Math.max(0, old.balanceSats - payload.amountSats),
              }
            : old,
        );
        return demoDelay({
          message: "Retrait simulé.",
          balanceSats: 0,
          reward: null,
        });
      }
      const res = await donorsApi.withdraw(payload);
      return res.data;
    },
    onSuccess: () => {
      if (!LOCAL_PAYMENTS) qc.invalidateQueries({ queryKey: ["donor", "me"] });
    },
  });
}

/** Commande de carte physique (au mérite ou à l'achat). */
export function useOrderCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (method: CardOrderMethod): Promise<CardOrderResult> => {
      if (LOCAL_CARDS) {
        const status = method === "merit" ? "merited" : "pending";
        qc.setQueryData<DonorAccount>(["donor", "me"], (old) =>
          old ? { ...old, physicalCardStatus: status } : old,
        );
        return demoDelay({
          message:
            method === "merit"
              ? "Carte accordée au mérite (démo)."
              : "Commande payante initiée (démo).",
          status,
          orderId: `demo-order-${Date.now()}`,
          checkoutUrl: method === "pay" ? "#demo-checkout" : undefined,
        });
      }
      const res = await donorsApi.orderCard(method);
      return res.data;
    },
    onSuccess: () => {
      if (!LOCAL_CARDS) qc.invalidateQueries({ queryKey: ["donor", "me"] });
    },
  });
}

/** Confirme le paiement d'une commande de carte physique. */
export function useConfirmCardOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (LOCAL_CARDS) {
        qc.setQueryData<DonorAccount>(["donor", "me"], (old) =>
          old
            ? {
                ...old,
                cardType: "physical",
                physicalCardStatus: "ordered_paid",
              }
            : old,
        );
        return demoDelay({
          message: "Paiement confirmé (démo).",
          physicalCardStatus: "ordered_paid",
          cardType: "physical",
        });
      }
      const res = await donorsApi.confirmCardOrder(orderId);
      return res.data;
    },
    onSuccess: () => {
      if (!LOCAL_CARDS) qc.invalidateQueries({ queryKey: ["donor", "me"] });
    },
  });
}

/** Ajoute une activité à un donneur (réservé aux structures connectées). */
export function useAddDonorActivity() {
  return useMutation({
    meta: { success: "Activité enregistrée." },
    mutationFn: ({
      id,
      activityType,
      description,
    }: {
      id: string;
      activityType: ActivityType;
      description?: string;
    }) =>
      AUTH_BYPASS
        ? demoDelay({ message: "Activité enregistrée (démo).", activityType })
        : donorsApi
            .addActivity(id, { activityType, description })
            .then((r) => r.data),
  });
}

/* -------------------------- Cartes de donneur ------------------------- */

function localToCardRecord(r: LocalCardRequest): CardRequestRecord {
  return {
    id: r.donorId,
    donorId: r.donorId,
    donorName: r.donorName,
    bloodType: r.bloodType ?? null,
    photo: r.photo ?? null,
    format: r.format,
    status: r.status === "none" ? "requested" : r.status,
    updatedAt: r.updatedAt,
  };
}

/** Demande de carte du donneur connecté (repli démo localStorage). */
export function useMyCardRequest(donorId: string): CardRequestRecord | null {
  const local = useLocalCardRequest(donorId);
  const query = useQuery({
    queryKey: ["card-request", "me"],
    enabled: !LOCAL_CARDS && donorId.length > 0,
    queryFn: () => cardRequestsApi.mine().then((r) => r.data.request),
  });
  if (LOCAL_CARDS) return local ? localToCardRecord(local) : null;
  return query.data ?? null;
}

/** Soumet la demande de carte (photo + format). */
export function useSubmitCardRequest(donorId: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de carte envoyée." },
    mutationFn: (
      vars: SubmitCardRequestPayload & {
        donorName?: string;
        bloodType?: string;
      },
    ) => {
      if (LOCAL_CARDS) {
        localUpsertCardRequest({
          donorId,
          donorName: vars.donorName ?? "",
          bloodType: vars.bloodType,
          photo: vars.photo ?? undefined,
          format: vars.format,
          status: "requested",
          requestedAt: new Date().toISOString(),
        });
        return Promise.resolve(null);
      }
      return cardRequestsApi
        .submit({ format: vars.format, photo: vars.photo })
        .then((r) => r.data.request);
    },
    onSuccess: () => {
      if (!LOCAL_CARDS)
        qc.invalidateQueries({ queryKey: ["card-request", "me"] });
    },
  });
}

/** Liste des demandes de carte (admin ; repli démo localStorage). */
export function useCardRequestsList(): CardRequestRecord[] {
  const local = useLocalCardRequests();
  const query = useQuery({
    queryKey: ["card-requests"],
    enabled: !LOCAL_CARDS,
    queryFn: () => cardRequestsApi.list().then((r) => r.data),
  });
  if (LOCAL_CARDS) return local.map(localToCardRecord);
  return query.data ?? [];
}

/** Valide ou refuse une demande de carte (admin). */
export function useDecideCardRequest() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de carte mise à jour." },
    mutationFn: ({
      request,
      status,
    }: {
      request: CardRequestRecord;
      status: "approved" | "rejected";
    }) => {
      if (LOCAL_CARDS) {
        localUpsertCardRequest({
          donorId: request.donorId,
          donorName: request.donorName,
          bloodType: request.bloodType ?? undefined,
          photo: request.photo ?? undefined,
          format: request.format,
          status,
        });
        // Sécurité : garantit le statut même si la demande existait déjà.
        localDecideCardRequest(request.donorId, status);
        return Promise.resolve(null);
      }
      return cardRequestsApi
        .decide(request.id, status)
        .then((r) => r.data.request);
    },
    onSuccess: () => {
      if (!LOCAL_CARDS) qc.invalidateQueries({ queryKey: ["card-requests"] });
    },
  });
}

/** Mise à jour du profil donneur. */
export function useUpdateDonorProfile() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Profil mis à jour." },
    mutationFn: ({ id, ...payload }: { id: string } & UpdateDonorPayload) =>
      AUTH_BYPASS
        ? demoDelay(null)
        : donorsApi.update(id, payload).then((r) => r.data),
    onSuccess: () => {
      if (!AUTH_BYPASS) qc.invalidateQueries({ queryKey: ["donor"] });
    },
  });
}
