/**
 * Types côté frontend reflétant les ressources exposées par l'API.
 * Découplés des modules serveur pour ne jamais importer de code serveur
 * dans le bundle client. Les dates transitent en chaîne ISO via JSON.
 */

export const BLOOD_TYPES = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

export type OrganizationType = "hospital" | "ngo" | "blood_center";

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  latitude: number;
  longitude: number;
  city: string;
  contactEmail: string;
  verified: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  /** Solde du compte d'approvisionnement (récompenses), en satoshis. */
  balanceSats?: number;
};

export type UserProfile = {
  id: string;
  email: string | undefined;
  role: "super_admin" | "org_admin" | "donor";
  organizationId: string | null;
  organization?: Organization | null;
};

export type EmergencyStatus = "active" | "resolved" | "cancelled";

export type EmergencyRecord = {
  id: string;
  hospitalId: string;
  bloodType: BloodType;
  quantityNeeded: number;
  city: string;
  latitude: number;
  longitude: number;
  status: EmergencyStatus;
  createdAt: string;
};

export type CampaignType = "targeted" | "general";

export type CampaignRecord = {
  id: string;
  hospitalId: string;
  title: string;
  type: CampaignType;
  targetBloodType: BloodType | null;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  startsAt?: string | null;
  endsAt?: string | null;
  emailsSent: number;
  responsesCount: number;
  status: string;
  createdAt: string;
};

export type DonorRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bloodType: BloodType;
  city: string;
  latitude: number;
  longitude: number;
  age: number;
  available: boolean;
  bitcoinAddress: string;
  profileHash: string;
  otsProof: string | null;
  validated: boolean;
  createdAt: string;
  /** Solde de satoshis accumulé sur la plateforme (retirable par le donneur). */
  balanceSats?: number;
  /** Type de carte : "digital" par défaut, "physical" une fois obtenue. */
  cardType?: string;
  /** Statut de la commande de carte physique (none | merited | pending | ordered_paid…). */
  physicalCardStatus?: string;
  /** Identifiant du donneur parrain, le cas échéant. */
  referredBy?: string | null;
};

/** Donneur renvoyé par /search, enrichi de la distance (et du score en IA). */
export type MatchingDonor = DonorRecord & {
  distanceKm: number;
  score?: number;
  explanation?: string;
  historyCount?: number;
};

/* ---------------------- Réseau inter-centres ----------------------- */

export type BloodComponent = "CGR" | "Plasma" | "Plaquettes";
export type StockStatus = "critique" | "faible" | "stable";

export type StockItem = {
  component: BloodComponent;
  bloodType: string;
  units: number;
  expiringSoon: number;
};

export type TransferUrgency = "vitale" | "haute" | "moderee";
export type TransferStatus =
  "ouverte" | "acceptée" | "en_transit" | "reçue" | "annulée";

export type TransferRequest = {
  id: string;
  component: BloodComponent;
  bloodType: string;
  quantity: number;
  urgency: TransferUrgency;
  requesterId: string;
  requesterName: string;
  requesterCity: string;
  responderId?: string | null;
  responderName?: string | null;
  status: TransferStatus;
  createdAt: string;
};

export type RewardLog = {
  id: string;
  donorId: string;
  hospitalId: string;
  satsAmount: number;
  status: string;
  bolt11Invoice?: string | null;
  paymentHash?: string | null;
  errorMessage?: string | null;
  createdAt: string;
};

export type VerifyResult = {
  donor: {
    id: string;
    bloodType: BloodType;
    bitcoinAddress: string;
    profileHash: string;
    hasOtsProof: boolean;
    createdAt: string;
    balanceSats?: number;
    cardType?: string;
    physicalCardStatus?: string;
    activityCount?: number;
  };
  verification: {
    isTimestampVerified: boolean;
    details: { height: number; timestamp: number } | null;
  };
};
