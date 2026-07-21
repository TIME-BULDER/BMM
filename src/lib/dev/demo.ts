import type {
  BloodComponent,
  CampaignRecord,
  DonorRecord,
  EmergencyRecord,
  MatchingDonor,
  Organization,
  StockItem,
  StockStatus,
  TransferRequest,
  UserProfile,
} from "@/lib/api/resources";

export type {
  BloodComponent,
  StockItem,
  StockStatus,
  TransferRequest,
  TransferStatus,
  TransferUrgency,
} from "@/lib/api/resources";

/**
 * Mode démo / bypass d'authentification.
 *
 * Activé via `NEXT_PUBLIC_AUTH_BYPASS=true` dans `.env`. Quand il est actif,
 * l'espace applicatif s'ouvre sans session et les écrans sont alimentés par
 * des données simulées - utile pour parcourir l'UI tant que l'authentification
 * Supabase n'est pas opérationnelle. À laisser désactivé en production.
 */
export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

const DEMO_ORG_ID = "11111111-1111-4111-8111-111111111111";

export const BYPASS_USER: UserProfile = {
  id: "00000000-0000-4000-8000-000000000000",
  email: "demo@bitcoinblood.bj",
  role: "org_admin",
  organizationId: DEMO_ORG_ID,
  organization: {
    id: DEMO_ORG_ID,
    name: "CNHU-HKM de Cotonou",
    type: "hospital",
    latitude: 6.3703,
    longitude: 2.4256,
    city: "Cotonou",
    contactEmail: "contact@cnhu-cotonou.bj",
    verified: true,
    createdAt: new Date().toISOString(),
    balanceSats: 75_000,
  },
};

const now = Date.now();
const iso = (minutesAgo: number) =>
  new Date(now - minutesAgo * 60_000).toISOString();

export const demoEmergencies: EmergencyRecord[] = [
  {
    id: "aaaaaaa1-0000-4000-8000-000000000001",
    hospitalId: DEMO_ORG_ID,
    bloodType: "O-",
    quantityNeeded: 6,
    city: "Cotonou",
    latitude: 6.3703,
    longitude: 2.4256,
    status: "active",
    createdAt: iso(12),
  },
  {
    id: "aaaaaaa1-0000-4000-8000-000000000002",
    hospitalId: DEMO_ORG_ID,
    bloodType: "AB-",
    quantityNeeded: 3,
    city: "Cotonou",
    latitude: 6.39,
    longitude: 2.41,
    status: "active",
    createdAt: iso(48),
  },
  {
    id: "aaaaaaa1-0000-4000-8000-000000000003",
    hospitalId: DEMO_ORG_ID,
    bloodType: "B+",
    quantityNeeded: 4,
    city: "Porto-Novo",
    latitude: 6.4969,
    longitude: 2.6283,
    status: "resolved",
    createdAt: iso(1440),
  },
];

export const demoCampaigns: CampaignRecord[] = [
  {
    id: "bbbbbbb1-0000-4000-8000-000000000001",
    hospitalId: DEMO_ORG_ID,
    title: "Collecte solidaire de Cotonou",
    type: "general",
    targetBloodType: null,
    city: "Cotonou",
    latitude: 6.3703,
    longitude: 2.4256,
    radiusKm: 25,
    emailsSent: 1240,
    responsesCount: 312,
    status: "active",
    createdAt: iso(2880),
  },
  {
    id: "bbbbbbb1-0000-4000-8000-000000000002",
    hospitalId: DEMO_ORG_ID,
    title: "Urgence O- - appel ciblé",
    type: "targeted",
    targetBloodType: "O-",
    city: "Cotonou",
    latitude: 6.3703,
    longitude: 2.4256,
    radiusKm: 15,
    emailsSent: 480,
    responsesCount: 96,
    status: "active",
    createdAt: iso(720),
  },
];

const baseDonor = (
  i: number,
  data: Pick<
    DonorRecord,
    "firstName" | "lastName" | "bloodType" | "city" | "age"
  > &
    Partial<DonorRecord>,
): DonorRecord => ({
  id: `ccccccc1-0000-4000-8000-00000000000${i}`,
  email: `${data.firstName.toLowerCase()}@exemple.bj`,
  phoneNumber: "+229 01 97 00 00 0" + i,
  latitude: 6.37 + i * 0.01,
  longitude: 2.42 + i * 0.01,
  available: true,
  bitcoinAddress: `bc1qdemo${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
  profileHash: "0".repeat(63) + i,
  otsProof: null,
  validated: true,
  createdAt: iso(5000 + i * 100),
  ...data,
});

export const demoDonors: DonorRecord[] = [
  baseDonor(1, {
    firstName: "Carmelle",
    lastName: "Dossou",
    bloodType: "O-",
    city: "Cotonou",
    age: 29,
  }),
  baseDonor(2, {
    firstName: "Rodrigue",
    lastName: "Houngbédji",
    bloodType: "O+",
    city: "Cotonou",
    age: 35,
  }),
  baseDonor(3, {
    firstName: "Nadège",
    lastName: "Gbaguidi",
    bloodType: "A+",
    city: "Porto-Novo",
    age: 41,
    validated: false,
  }),
  baseDonor(4, {
    firstName: "Wenceslas",
    lastName: "Aïvodji",
    bloodType: "B+",
    city: "Abomey-Calavi",
    age: 24,
  }),
  baseDonor(5, {
    firstName: "Florentine",
    lastName: "Sossou",
    bloodType: "AB-",
    city: "Parakou",
    age: 38,
    available: false,
  }),
];

export const demoMatches: MatchingDonor[] = demoDonors
  .filter((d) => d.available)
  .map((d, i) => ({
    ...d,
    distanceKm: 1.2 + i * 2.4,
    score: 92 - i * 7,
    explanation:
      i === 0
        ? "Compatible, très proche et donneur régulier."
        : "Compatible et disponible à proximité.",
    historyCount: 5 - i,
  }));

/* --------------------- Espace donneur (démo) ----------------------- */

export type DonationComponent = "Sang total" | "Plasma" | "Plaquettes";
export type DonationRarity = "Commun" | "Rare" | "Très rare";

export type DonorEligibility = {
  status: "éligible" | "ajourné";
  /** Date à partir de laquelle un nouveau don est possible (ISO court). */
  nextEligibleDate: string;
  reason?: string;
};

export type DonationEntry = {
  id: string;
  date: string;
  centerName: string;
  city: string;
  component: DonationComponent;
  volumeMl: number;
  status: "Validé" | "En attente";
};

export type RewardEntry = {
  id: string;
  date: string;
  sats: number;
  status: "Envoyée" | "En attente" | "Échouée";
  label: string;
};

export type DonorAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  bloodType: string;
  /** Phénotype étendu (Rh, Kell…). */
  phenotype: string;
  rarity: DonationRarity;
  cmvNegative: boolean;
  preferredDonation: DonationComponent;
  available: boolean;
  eligibility: DonorEligibility;
  totalDonations: number;
  lastDonation: string;
  bitcoinAddress: string;
  verified: boolean;
  /** Solde de satoshis accumulé sur la plateforme (retirable via MoMo). */
  balanceSats: number;
  /** "digital" ou "physical". */
  cardType: string;
  /** Statut de commande de carte physique (none | merited | pending | ordered_paid). */
  physicalCardStatus: string;
};

const day = (daysAgo: number) =>
  new Date(now - daysAgo * 86_400_000).toISOString().slice(0, 10);

export const demoDonorAccount: DonorAccount = {
  id: "ccccccc1-0000-4000-8000-000000000001",
  firstName: "Carmelle",
  lastName: "Dossou",
  email: "carmelle.dossou@exemple.bj",
  phoneNumber: "+229 01 97 12 34 56",
  city: "Cotonou",
  bloodType: "O-",
  phenotype: "O Rh− (ccddee, K−)",
  rarity: "Rare",
  cmvNegative: true,
  preferredDonation: "Sang total",
  available: true,
  eligibility: {
    status: "éligible",
    nextEligibleDate: day(0),
  },
  totalDonations: 7,
  lastDonation: day(96),
  bitcoinAddress: "bc1qdemo1xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  verified: true,
  balanceSats: 12_000,
  cardType: "digital",
  physicalCardStatus: "none",
};

export const demoDonations: DonationEntry[] = [
  {
    id: "don-1",
    date: day(96),
    centerName: "CNHU-HKM",
    city: "Cotonou",
    component: "Sang total",
    volumeMl: 450,
    status: "Validé",
  },
  {
    id: "don-2",
    date: day(210),
    centerName: "Hôpital de Zone",
    city: "Porto-Novo",
    component: "Sang total",
    volumeMl: 450,
    status: "Validé",
  },
  {
    id: "don-3",
    date: day(320),
    centerName: "Croix-Rouge Béninoise",
    city: "Abomey-Calavi",
    component: "Plasma",
    volumeMl: 600,
    status: "Validé",
  },
];

export const demoRewards: RewardEntry[] = [
  {
    id: "rw-1",
    date: day(96),
    sats: 2000,
    status: "Envoyée",
    label: "Don validé - CNHU Cotonou",
  },
  {
    id: "rw-2",
    date: day(210),
    sats: 1500,
    status: "Envoyée",
    label: "Don validé - Porto-Novo",
  },
  {
    id: "rw-3",
    date: day(320),
    sats: 1500,
    status: "Envoyée",
    label: "Don plasma - Abomey-Calavi",
  },
];

export const demoRewardTotalSats = demoRewards
  .filter((r) => r.status === "Envoyée")
  .reduce((sum, r) => sum + r.sats, 0);

/* ------------------ Réseau inter-centres (démo) -------------------- */

export function stockStatusOf(units: number): StockStatus {
  if (units < 5) return "critique";
  if (units < 12) return "faible";
  return "stable";
}

const stockSeed: Record<BloodComponent, number[]> = {
  // O-, O+, A-, A+, B-, B+, AB-, AB+
  CGR: [3, 24, 9, 31, 6, 18, 2, 11],
  Plasma: [14, 40, 16, 28, 10, 22, 7, 19],
  Plaquettes: [4, 12, 6, 15, 3, 9, 2, 8],
};

const bloodOrder = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export const demoStock: StockItem[] = (
  Object.keys(stockSeed) as BloodComponent[]
).flatMap((component) =>
  stockSeed[component].map((units, i) => ({
    component,
    bloodType: bloodOrder[i],
    units,
    expiringSoon: units > 14 ? 2 : units > 6 ? 1 : 0,
  })),
);

export const demoTransfers: TransferRequest[] = [
  {
    id: "trf-1",
    component: "CGR",
    bloodType: "O-",
    quantity: 4,
    urgency: "vitale",
    requesterId: "ddddddd1-0000-4000-8000-000000000002",
    requesterName: "Hôpital de Zone de Porto-Novo",
    requesterCity: "Porto-Novo",
    status: "ouverte",
    createdAt: iso(35),
  },
  {
    id: "trf-2",
    component: "Plaquettes",
    bloodType: "AB-",
    quantity: 2,
    urgency: "haute",
    requesterId: "ddddddd1-0000-4000-8000-000000000004",
    requesterName: "Centre de collecte de Parakou",
    requesterCity: "Parakou",
    status: "ouverte",
    createdAt: iso(120),
  },
  {
    id: "trf-3",
    component: "CGR",
    bloodType: "B+",
    quantity: 6,
    urgency: "moderee",
    requesterId: DEMO_ORG_ID,
    requesterName: "CNHU-HKM de Cotonou",
    requesterCity: "Cotonou",
    responderId: "ddddddd1-0000-4000-8000-000000000003",
    responderName: "Croix-Rouge Béninoise - Abomey-Calavi",
    status: "en_transit",
    createdAt: iso(300),
  },
  {
    id: "trf-4",
    component: "Plasma",
    bloodType: "A+",
    quantity: 8,
    urgency: "moderee",
    requesterId: DEMO_ORG_ID,
    requesterName: "CNHU-HKM de Cotonou",
    requesterCity: "Cotonou",
    responderId: "ddddddd1-0000-4000-8000-000000000002",
    responderName: "Hôpital de Zone de Porto-Novo",
    status: "reçue",
    createdAt: iso(2880),
  },
];

/** Identifiant de l'organisation « courante » en mode démo. */
export const DEMO_CURRENT_ORG_ID = DEMO_ORG_ID;

/** Organisations simulées pour la vue super-admin (pas d'endpoint dédié). */
export const demoOrganizations: Organization[] = [
  {
    id: DEMO_ORG_ID,
    name: "CNHU-HKM de Cotonou",
    type: "hospital",
    latitude: 6.3703,
    longitude: 2.4256,
    city: "Cotonou",
    contactEmail: "contact@cnhu-cotonou.bj",
    verified: true,
    createdAt: iso(43200),
  },
  {
    id: "ddddddd1-0000-4000-8000-000000000002",
    name: "Hôpital de Zone de Porto-Novo",
    type: "hospital",
    latitude: 6.4969,
    longitude: 2.6283,
    city: "Porto-Novo",
    contactEmail: "contact@hz-portonovo.bj",
    verified: true,
    createdAt: iso(40000),
  },
  {
    id: "ddddddd1-0000-4000-8000-000000000003",
    name: "Croix-Rouge Béninoise - Abomey-Calavi",
    type: "ngo",
    latitude: 6.4486,
    longitude: 2.3556,
    city: "Abomey-Calavi",
    contactEmail: "calavi@croixrouge.bj",
    verified: false,
    createdAt: iso(2880),
  },
  {
    id: "ddddddd1-0000-4000-8000-000000000004",
    name: "Centre de collecte de Parakou",
    type: "blood_center",
    latitude: 9.337,
    longitude: 2.6303,
    city: "Parakou",
    contactEmail: "don@collecte-parakou.bj",
    verified: false,
    createdAt: iso(1440),
  },
];
