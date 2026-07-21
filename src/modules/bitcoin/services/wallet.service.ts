import { Verifier } from "bip322-js";

export const walletService = {
  /**
   * Vérifie la signature BIP-322 d'un hash de profil avec l'adresse Bitcoin
   * @param profileHash Hash SHA-256 du profil
   * @param address Adresse Bitcoin du donneur
   * @param signature Signature BIP-322 fournie par le client
   * @returns boolean
   */
  verifySignature: (
    profileHash: string,
    address: string,
    signature: string,
  ): boolean => {
    try {
      return Verifier.verifySignature(address, profileHash, signature);
    } catch (e) {
      console.error("Signature verification failed:", e);
      return false;
    }
  },
};
