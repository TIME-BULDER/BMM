import type { BloodGroup } from "@/lib/mock/blood";

/**
 * Donneurs simulés. Remplacés par l'API Supabase une fois le backend branché.
 */

export type DonorStatus = "disponible" | "indisponible" | "recent";

export type Donor = {
  id: string;
  name: string;
  initials: string;
  group: BloodGroup;
  city: string;
  country: string;
  phone: string;
  status: DonorStatus;
  donations: number;
  lastDonation: string;
  verified: boolean;
};

export const donorStatusLabel: Record<DonorStatus, string> = {
  disponible: "Disponible",
  indisponible: "Indisponible",
  recent: "Don récent",
};

export const donorStatusBadge: Record<
  DonorStatus,
  "success" | "neutral" | "warning"
> = {
  disponible: "success",
  indisponible: "neutral",
  recent: "warning",
};

export const donors: Donor[] = [
  {
    id: "dnr_001",
    name: "Aïssatou Diallo",
    initials: "AD",
    group: "O-",
    city: "Dakar",
    country: "Sénégal",
    phone: "+221 77 123 45 67",
    status: "disponible",
    donations: 12,
    lastDonation: "2026-04-18",
    verified: true,
  },
  {
    id: "dnr_002",
    name: "Kwame Mensah",
    initials: "KM",
    group: "A+",
    city: "Accra",
    country: "Ghana",
    phone: "+233 20 555 12 34",
    status: "recent",
    donations: 7,
    lastDonation: "2026-06-12",
    verified: true,
  },
  {
    id: "dnr_003",
    name: "Fatou Bensouda",
    initials: "FB",
    group: "B+",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    phone: "+225 07 88 90 11",
    status: "disponible",
    donations: 4,
    lastDonation: "2026-03-02",
    verified: false,
  },
  {
    id: "dnr_004",
    name: "Chidi Okonkwo",
    initials: "CO",
    group: "O+",
    city: "Lagos",
    country: "Nigéria",
    phone: "+234 80 234 56 78",
    status: "disponible",
    donations: 21,
    lastDonation: "2026-05-29",
    verified: true,
  },
  {
    id: "dnr_005",
    name: "Amara Njoroge",
    initials: "AN",
    group: "AB-",
    city: "Nairobi",
    country: "Kenya",
    phone: "+254 71 345 67 89",
    status: "indisponible",
    donations: 2,
    lastDonation: "2026-01-15",
    verified: false,
  },
  {
    id: "dnr_006",
    name: "Jean-Paul Habimana",
    initials: "JH",
    group: "A-",
    city: "Kigali",
    country: "Rwanda",
    phone: "+250 78 456 78 90",
    status: "disponible",
    donations: 9,
    lastDonation: "2026-06-01",
    verified: true,
  },
  {
    id: "dnr_007",
    name: "Mariam Traoré",
    initials: "MT",
    group: "O-",
    city: "Bamako",
    country: "Mali",
    phone: "+223 65 12 34 56",
    status: "disponible",
    donations: 15,
    lastDonation: "2026-05-10",
    verified: true,
  },
  {
    id: "dnr_008",
    name: "Youssef El Amrani",
    initials: "YE",
    group: "B-",
    city: "Casablanca",
    country: "Maroc",
    phone: "+212 6 12 34 56 78",
    status: "recent",
    donations: 5,
    lastDonation: "2026-06-20",
    verified: false,
  },
];
