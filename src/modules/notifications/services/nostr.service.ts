import {
  generateSecretKey,
  finalizeEvent,
  verifyEvent,
  SimplePool,
} from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

export const nostrService = {
  /**
   * Publie une alerte d'urgence sur des relais Nostr publics via le Bot centralisé Bitcoin Blood.
   * Chaque événement contient des tags structurés (groupe sanguin, ville, hospital_id)
   * pour permettre un filtrage fin par les applications clientes.
   */
  publishEmergencyAlert: async (emergencyData: {
    hospitalName: string;
    hospitalId?: string;
    bloodType: string;
    quantity: number;
    city: string;
  }): Promise<string | null> => {
    try {
      console.warn(
        `[Nostr] Préparation de la publication Nostr pour ${emergencyData.hospitalName}...`,
      );

      const relays = [
        "wss://relay.damus.io",
        "wss://nos.lol",
        "wss://relay.snort.social",
      ];

      // Formatage du message d'urgence
      const message =
        `🚨 ALERTE URGENCE SANGUINE 🚨\n` +
        `Hôpital : ${emergencyData.hospitalName}\n` +
        `Besoin urgent : ${emergencyData.quantity} poche(s) de sang ${emergencyData.bloodType}\n` +
        `Localisation : ${emergencyData.city}\n\n` +
        `#UrgenceSang #BitcoinBlood #${emergencyData.city.replace(/\s+/g, "")}`;

      // Clé du bot centralisé Bitcoin Blood (la même pour tous les hôpitaux)
      let secretKey: Uint8Array;
      if (process.env.NOSTR_PRIVATE_KEY_HEX) {
        secretKey = hexToBytes(process.env.NOSTR_PRIVATE_KEY_HEX);
      } else {
        secretKey = generateSecretKey();
        console.warn(
          "[Nostr] Clé éphémère utilisée. Définissez NOSTR_PRIVATE_KEY_HEX dans .env pour une identité persistante.",
        );
      }

      // Création de l'événement Nostr (Kind 1 = Text Note)
      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["t", "UrgenceSang"],
          ["t", "BitcoinBlood"],
          ["blood_type", emergencyData.bloodType],
          ["city", emergencyData.city],
          ...(emergencyData.hospitalId
            ? [["hospital_id", emergencyData.hospitalId]]
            : []),
        ],
        content: message,
      };

      const signedEvent = finalizeEvent(eventTemplate, secretKey);

      const isGood = verifyEvent(signedEvent);
      if (!isGood) {
        throw new Error("L'événement Nostr généré est invalide.");
      }

      // En développement, on simule la publication pour ne pas spammer les relais publics.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[Nostr] Simulation mode - Événement ID: ${signedEvent.id} (non publié en dev).`,
        );
        return signedEvent.id;
      }

      // En production : publication réelle sur tous les relais
      const pool = new SimplePool();
      const pub = pool.publish(relays, signedEvent);

      try {
        await Promise.any(pub);
        console.warn(`[Nostr] Publié avec succès sur au moins un relais.`);
      } catch {
        console.warn(`[Nostr] Tous les relais ont échoué ou timeout.`);
      }

      pool.close(relays);

      return signedEvent.id;
    } catch (error) {
      console.error(
        "[Nostr Error] Erreur lors de la publication Nostr :",
        error,
      );
      return null;
    }
  },
};
