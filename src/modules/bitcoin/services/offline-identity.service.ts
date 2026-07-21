import { Signer } from "bip322-js";
import { sha256 } from "js-sha256";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { ECPairFactory } from "ecpair";

const ECPair = ECPairFactory(ecc);

export const offlineIdentityService = {
  /**
   * Génère une identité souveraine signée (BIP-322) pour un donneur.
   * La clinique signe les données essentielles du donneur (ID + Groupe Sanguin)
   * avec sa clé privée, permettant une vérification hors-ligne de ces données.
   */
  signDonorIdentity: (donorId: string, bloodType: string) => {
    // 1. Préparation du payload
    const payload = {
      donorId,
      bloodType,
      timestamp: new Date().toISOString(),
      issuer: "Bitcoin Blood Network (Clinic Signature)",
    };

    const payloadString = JSON.stringify(payload);

    // 2. Hashage des données
    const profileHash = sha256(payloadString);

    // 3. Récupération de la clé privée de la clinique
    // En production, chaque clinique aurait sa clé gérée par le backend ou un HSM.
    // Pour la démo, on utilise une variable d'environnement ou on génère une clé éphémère.
    let keyPair;
    if (process.env.CLINIC_PRIVATE_KEY_WIF) {
      keyPair = ECPair.fromWIF(process.env.CLINIC_PRIVATE_KEY_WIF);
    } else {
      keyPair = ECPair.makeRandom();
      console.warn(
        "[Offline Identity] Utilisation d'une clé privée éphémère pour signer l'identité.",
      );
    }

    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });

    // 4. Signature BIP-322 du hash du profil
    const signature = address
      ? Signer.sign(keyPair.toWIF(), address, profileHash)
      : "mock_signature_bip322";

    return {
      payload,
      profileHash,
      clinicAddress: address,
      signature,
    };
  },
};
