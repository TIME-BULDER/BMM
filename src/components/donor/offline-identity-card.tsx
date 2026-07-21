"use client";

import { AlertCircle, Fingerprint, WifiOff } from "lucide-react";
import { useState } from "react";

import { QrBadge } from "@/components/donor/qr-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonorOfflineIdentity } from "@/lib/api/hooks";
import type { OfflineIdentityResponse } from "@/lib/api/resources";

/**
 * « Identité Sanguine Souveraine » côté donneur : génère une attestation
 * signée (BIP-322) de son groupe sanguin, encodée en QR Code. N'importe
 * quelle clinique peut la vérifier hors-ligne, sans internet.
 */
export function OfflineIdentityCard({
  donorId,
  bloodType,
}: {
  donorId: string;
  bloodType: string;
}) {
  const generate = useDonorOfflineIdentity();
  const [identity, setIdentity] = useState<OfflineIdentityResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    try {
      const result = await generate.mutateAsync({ id: donorId, bloodType });
      setIdentity(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Génération impossible.");
    }
  }

  // Charge utile encodée dans le QR - tout ce qu'il faut pour une vérification
  // BIP-322 hors-ligne : adresse signataire, message signé, signature.
  const qrValue = identity
    ? JSON.stringify({
        address: identity.clinicAddress,
        message: identity.profileHash,
        signature: identity.signature,
        bloodType: identity.payload.bloodType,
      })
    : "";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="text-accent size-5" />
          Ma carte groupe sanguin
        </CardTitle>
        <span className="bg-accent/15 text-accent flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <WifiOff className="size-3" />
          Sans internet
        </span>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-muted-foreground text-sm">
          Créez un QR code qui prouve votre groupe sanguin. N'importe quel
          centre de don peut le scanner pour confirmer votre groupe {bloodType},
          même sans connexion et sans refaire de test.
        </p>

        {error ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {identity ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <QrBadge
                value={qrValue}
                label={`Groupe ${identity.payload.bloodType}`}
                caption="Vérifiable sans internet"
                size={168}
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={onGenerate}
              disabled={generate.isPending}
            >
              {generate.isPending ? "Génération…" : "Régénérer le QR code"}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={onGenerate}
            disabled={generate.isPending}
          >
            <Fingerprint className="size-4" />
            {generate.isPending ? "Génération…" : "Créer mon QR groupe sanguin"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
