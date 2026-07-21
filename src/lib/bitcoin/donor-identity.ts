"use client";

import * as ecc from "@bitcoinerlab/secp256k1";
import { Signer, Verifier } from "bip322-js";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";

const ECPair = ECPairFactory(ecc);

export type DonorIdentity = {
  /** Adresse Bitcoin P2WPKH dérivée de la clé du donneur. */
  bitcoinAddress: string;
  /** SHA-256 (64 hex) du profil canonique - ancré ensuite sur Bitcoin. */
  profileHash: string;
  /** Signature BIP-322 du profileHash par l'adresse. */
  signature: string;
  /** Clé privée (WIF) à conserver par le donneur. Jamais envoyée au serveur. */
  wif: string;
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Produit l'identité cryptographique d'un donneur côté navigateur:
 * une paire de clés, l'empreinte SHA-256 de son profil et la signature
 * BIP-322 correspondante - exactement ce que vérifie le backend
 * (`walletService.verifySignature`).
 */
export async function createDonorIdentity(
  profile: Record<string, string | number | boolean>,
): Promise<DonorIdentity> {
  const sortedKeys = Object.keys(profile).sort();
  const canonical = JSON.stringify(profile, sortedKeys);
  const profileHash = await sha256Hex(canonical);

  const keyPair = ECPair.makeRandom();
  const wif = keyPair.toWIF();

  const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
  if (!address) {
    throw new Error("Impossible de générer l'adresse Bitcoin du donneur.");
  }

  const signature = Signer.sign(wif, address, profileHash);

  return {
    bitcoinAddress: address,
    profileHash,
    signature: signature.toString(),
    wif,
  };
}

export type OfflineAttestation = {
  payload: {
    donorId: string;
    bloodType: string;
    timestamp: string;
    issuer: string;
  };
  /** SHA-256 (message effectivement signé). */
  profileHash: string;
  /** Adresse ayant signé l'attestation (clé de la clinique). */
  clinicAddress: string;
  /** Signature BIP-322. */
  signature: string;
};

/**
 * Produit une attestation d'identité sanguine signée (BIP-322) côté client -
 * repli de démonstration quand le backend n'est pas joignable (mode démo).
 * Structure identique à celle du service serveur `offlineIdentityService`.
 */
export async function createOfflineAttestation(
  donorId: string,
  bloodType: string,
): Promise<OfflineAttestation> {
  const payload = {
    donorId,
    bloodType,
    timestamp: new Date().toISOString(),
    issuer: "Bitcoin Blood Network (Clinic Signature)",
  };
  const profileHash = await sha256Hex(JSON.stringify(payload));

  const keyPair = ECPair.makeRandom();
  const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
  if (!address) throw new Error("Impossible de générer l'adresse signataire.");

  const signature = Signer.sign(keyPair.toWIF(), address, profileHash);

  return {
    payload,
    profileHash,
    clinicAddress: address,
    signature: signature.toString(),
  };
}

/**
 * Vérifie une signature BIP-322 **entièrement côté navigateur**, sans aucun
 * appel réseau. C'est le cœur de « l'Identité Sanguine Souveraine » : une
 * clinique - même hors-ligne - peut confirmer qu'une attestation (groupe
 * sanguin, empreinte de profil…) a bien été signée par l'adresse indiquée.
 */
export function verifyDonorSignature(
  address: string,
  message: string,
  signature: string,
): boolean {
  try {
    return Verifier.verifySignature(address.trim(), message, signature.trim());
  } catch {
    return false;
  }
}
