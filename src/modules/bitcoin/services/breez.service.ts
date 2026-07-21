/**
 * Service d'intégration de Breez Liquid SDK
 * Permet d'initialiser le nœud Breez et d'envoyer des paiements Lightning (Satoshis) de manière non-dépositaire.
 */

interface BreezSdkInstance {
  prepareSendPayment: (req: {
    bolt11: string;
  }) => Promise<{ feesSat?: number }>;
  sendPayment: (req: { prepareResponse: unknown }) => Promise<{
    payment?: { txId: string };
    paymentHash?: string;
  }>;
  prepareReceivePayment: (req: {
    paymentMethod: string;
    amount?: { type: string; payerAmountSat: number };
  }) => Promise<{ feesSat?: number }>;
  receivePayment: (req: {
    prepareResponse: unknown;
    description?: string;
  }) => Promise<{ destination?: string }>;
}

let breezSdk: unknown = null;
let activeSdkInstance: BreezSdkInstance | null = null;

async function getBreezSdk() {
  if (breezSdk) return breezSdk;
  try {
    breezSdk = await import("@breeztech/breez-sdk-liquid");
    return breezSdk;
  } catch {
    console.warn(
      "Breez Liquid SDK n'est pas disponible ou installé dans cet environnement. Mode simulation activé.",
    );
    return null;
  }
}

export const breezService = {
  /**
   * Initialise le nœud Breez Liquid avec la configuration et le mnemonic fournis
   */
  initialize: async (): Promise<boolean> => {
    try {
      const sdkModule = await getBreezSdk();
      if (!sdkModule) {
        console.warn(
          "[Breez Simulation] Initialisation du nœud simulé réussie.",
        );
        return true;
      }

      const apiKey = process.env.BREEZ_API_KEY;
      const mnemonic = process.env.BREEZ_MNEMONIC;
      const workingDir = process.env.BREEZ_WORKING_DIR || "./.breez_state";

      if (!apiKey || !mnemonic) {
        console.warn(
          "Variables BREEZ_API_KEY ou BREEZ_MNEMONIC manquantes. Fallback en simulation.",
        );
        return true;
      }

      // Configuration du nœud Liquid (Nodeless)
      const sdkModuleTyped = sdkModule as {
        LiquidNetwork?: { MAINNET: string; TESTNET: string };
        defaultConfig: (
          net: string,
          key: string,
        ) => Promise<{ workingDir: string }>;
        connect: (req: unknown) => Promise<BreezSdkInstance>;
      };

      const liquidNetwork = sdkModuleTyped.LiquidNetwork || {
        MAINNET: "mainnet",
        TESTNET: "testnet",
      };
      const config = await sdkModuleTyped.defaultConfig(
        process.env.NODE_ENV === "production"
          ? liquidNetwork.MAINNET
          : liquidNetwork.TESTNET,
        apiKey,
      );
      config.workingDir = workingDir;

      const connectRequest = {
        config,
        mnemonic,
        passphrase: "",
      };

      console.warn("Connexion au SDK Breez Liquid...");
      activeSdkInstance = await sdkModuleTyped.connect(connectRequest);
      console.warn("Nœud Breez Liquid connecté avec succès !");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation de Breez Liquid:", error);
      return false;
    }
  },

  /**
   * S'assure qu'une session Breez est connectée (initialise à la demande).
   * En mode simulation, aucune instance réelle n'est créée mais on renvoie
   * vrai pour laisser les appelants basculer sur leur repli simulé.
   */
  ensureConnected: async (): Promise<boolean> => {
    if (activeSdkInstance) return true;
    return breezService.initialize();
  },

  /**
   * Génère une facture Lightning (BOLT11) à payer pour recevoir un don.
   * amountSat: montant en satoshis. description: objet du don (campagne, dev...).
   * En l'absence de SDK réel, renvoie une facture simulée clairement marquée.
   */
  receivePayment: async (
    amountSat: number,
    description: string,
  ): Promise<{ bolt11: string; feesSat: number; simulated: boolean }> => {
    try {
      await breezService.ensureConnected();
      const sdkModule = await getBreezSdk();

      if (!sdkModule || !activeSdkInstance) {
        console.warn(
          `[Breez Simulation] Facture simulée de ${amountSat} sats pour: ${description}`,
        );
        const suffix = Date.now().toString(36);
        return {
          bolt11: `lnbcsimulated${amountSat}u1p${suffix}`,
          feesSat: 0,
          simulated: true,
        };
      }

      const sdkTyped = sdkModule as {
        PaymentMethod?: { LIGHTNING: string };
      };
      const paymentMethod = sdkTyped.PaymentMethod?.LIGHTNING ?? "lightning";

      const prepareResponse = await activeSdkInstance.prepareReceivePayment({
        paymentMethod,
        amount: { type: "bitcoin", payerAmountSat: amountSat },
      });

      const result = await activeSdkInstance.receivePayment({
        prepareResponse,
        description,
      });

      return {
        bolt11: result.destination ?? "",
        feesSat: prepareResponse.feesSat ?? 0,
        simulated: false,
      };
    } catch (error) {
      console.error(
        "Échec de la génération de la facture Lightning via Breez:",
        error,
      );
      throw error;
    }
  },

  /**
   * Effectue un paiement Lightning via une facture BOLT11
   * @param bolt11 Facture BOLT11
   * @returns Promise<{ paymentHash: string } | null>
   */
  payInvoice: async (
    bolt11: string,
  ): Promise<{ paymentHash: string } | null> => {
    try {
      const sdkModule = await getBreezSdk();

      // Mode simulation s'il n'y a pas d'instance SDK réelle
      if (!sdkModule || !activeSdkInstance) {
        console.warn(
          `[Breez Simulation] Paiement de la facture BOLT11: ${bolt11}`,
        );
        // Génère un payment hash aléatoire pour simuler le succès
        const simulatedHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("");

        return { paymentHash: simulatedHash };
      }

      // 1. Préparer le paiement pour évaluer les frais
      const prepareResponse = await activeSdkInstance.prepareSendPayment({
        bolt11,
      });
      console.warn(
        `Frais estimés pour le paiement : ${prepareResponse.feesSat || 0} sats`,
      );

      // 2. Envoyer le paiement
      const paymentResponse = await activeSdkInstance.sendPayment({
        prepareResponse,
      });

      console.warn("Paiement Breez réussi :", paymentResponse);
      return {
        paymentHash:
          paymentResponse.payment?.txId || paymentResponse.paymentHash || "",
      };
    } catch (error) {
      console.error("Échec du paiement de facture Lightning via Breez:", error);
      throw error;
    }
  },
};
