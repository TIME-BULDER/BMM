export const izichangeService = {
  /**
   * Simule un cashout (retrait) de satoshis vers un numéro Mobile Money via l'API Izichange/Flash.
   * Dans un environnement de production, cela appellerait l'API REST du partenaire avec les clés d'authentification.
   */
  cashoutToMoMo: async (
    momoNumber: string,
    satsAmount: number,
  ): Promise<string> => {
    console.warn(`[Izichange Mock] Initiation du dépôt Mobile Money...`);
    console.warn(
      `[Izichange Mock] Numéro : ${momoNumber} | Montant : ${satsAmount} sats`,
    );

    // Simulation d'un délai réseau pour l'appel API (1 à 2 secondes)
    const delay = Math.floor(Math.random() * 1000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulation d'une erreur réseau ou de validation (5% de chance)
    if (Math.random() < 0.05) {
      console.error(
        "[Izichange Mock] Échec du paiement. Le numéro est potentiellement invalide ou le service indisponible.",
      );
      throw new Error("Izichange_API_Error: Unable to process MoMo cashout");
    }

    // Génération d'un faux identifiant de transaction (payment hash)
    const transactionId = `izichange_momo_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    console.warn(
      `[Izichange Mock] Dépôt MoMo réussi ! Transaction ID: ${transactionId}`,
    );
    return transactionId;
  },

  /**
   * Simule l'initiation d'un paiement Izichange Pay pour une carte physique.
   * Retourne une URL de checkout simulée.
   */
  initiateCardPayment: async (
    orderId: string,
    amountXof: number,
  ): Promise<{ checkoutUrl: string; paymentReference: string }> => {
    console.warn(
      `[Izichange Pay] Initiation du paiement pour la commande ${orderId}...`,
    );
    console.warn(`[Izichange Pay] Montant : ${amountXof} XOF`);

    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    const paymentReference = `izi_pay_${Math.random().toString(36).substring(2, 12)}`;
    const checkoutUrl = `https://checkout.izichange.com/pay/${paymentReference}?orderId=${orderId}&amount=${amountXof}`;

    return {
      checkoutUrl,
      paymentReference,
    };
  },
};
