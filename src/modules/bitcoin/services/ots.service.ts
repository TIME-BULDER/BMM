import * as OpenTimestamps from "javascript-opentimestamps";

export const otsService = {
  /**
   * Crée une preuve OpenTimestamps pour un hash donné
   * @param profileHash Hash SHA-256 hexadécimal
   * @returns Preuve OTS encodée en base64
   */
  stampHash: async (profileHash: string): Promise<string> => {
    const hashBuffer = Buffer.from(profileHash, "hex");
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(
      new OpenTimestamps.Ops.OpSHA256(),
      hashBuffer,
    );

    // Appel aux serveurs de calendrier OTS (async)
    await OpenTimestamps.stamp(detached);

    const otsProofBytes = detached.serializeToBytes();
    return Buffer.from(otsProofBytes).toString("base64");
  },

  /**
   * Vérifie une preuve OTS
   * @param profileHash Hash SHA-256 hexadécimal
   * @param otsProofBase64 Preuve OTS encodée en base64
   * @returns Le résultat de vérification ou null si invalide
   */
  verifyTimestamp: async (
    profileHash: string,
    otsProofBase64: string,
  ): Promise<unknown> => {
    try {
      const hashBuffer = Buffer.from(profileHash, "hex");
      const otsProofBytes = Buffer.from(otsProofBase64, "base64");
      const detached =
        OpenTimestamps.DetachedTimestampFile.deserialize(otsProofBytes);

      const verifyResult = await OpenTimestamps.verify(detached, hashBuffer);
      return verifyResult;
    } catch (e) {
      console.error("OTS verification failed:", e);
      return null;
    }
  },
};
