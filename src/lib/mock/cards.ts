/**
 * Carte donneur vérifiable et preuve d'intégrité Bitcoin simulées.
 */

export type DonorCard = {
  cardId: string;
  holder: string;
  group: string;
  issuedAt: string;
  validUntil: string;
  donations: number;
  verifyUrl: string;
};

export const donorCard: DonorCard = {
  cardId: "BB-SN-0001-2480",
  holder: "Aïssatou Diallo",
  group: "O-",
  issuedAt: "2025-09-14",
  validUntil: "2027-09-14",
  donations: 12,
  verifyUrl: "https://verify.bitcoinblood.africa/c/BB-SN-0001-2480",
};

export type BitcoinProof = {
  id: string;
  label: string;
  txid: string;
  block: number;
  anchoredAt: string;
  records: number;
  confirmed: boolean;
};

export const bitcoinProofs: BitcoinProof[] = [
  {
    id: "prf_318",
    label: "Lot de dons - semaine 26",
    txid: "9f2c4b7e1a3d5f6089ab12cd34ef5678a1b2c3d4e5f60718293a4b5c6d7e8f90",
    block: 842119,
    anchoredAt: "2026-06-30T07:01:00Z",
    records: 1925,
    confirmed: true,
  },
  {
    id: "prf_317",
    label: "Lot de dons - semaine 25",
    txid: "1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70819a2b3c4d5e6f7081",
    block: 841104,
    anchoredAt: "2026-06-23T06:54:00Z",
    records: 1788,
    confirmed: true,
  },
  {
    id: "prf_316",
    label: "Lot de dons - semaine 24",
    txid: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    block: 840090,
    anchoredAt: "2026-06-16T07:12:00Z",
    records: 1640,
    confirmed: true,
  },
];
