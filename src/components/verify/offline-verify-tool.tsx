"use client";

import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrScanner } from "@/components/ui/qr-scanner";
import { Textarea } from "@/components/ui/textarea";
import { verifyDonorSignature } from "@/lib/bitcoin/donor-identity";

type Result = { ok: boolean } | null;

/**
 * Vérification hors-ligne d'une carte de donneur, directement dans le
 * navigateur : un centre de don peut confirmer la carte même sans connexion,
 * en scannant le QR code ou en collant le code à la main.
 */
export function OfflineVerifyTool({
  defaultAddress = "",
  defaultMessage = "",
}: {
  defaultAddress?: string;
  defaultMessage?: string;
}) {
  const [address, setAddress] = useState(defaultAddress);
  const [message, setMessage] = useState(defaultMessage);
  const [signature, setSignature] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [scanOpen, setScanOpen] = useState(false);

  function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ ok: verifyDonorSignature(address, message, signature) });
  }

  // Le QR code de la carte contient l'adresse, le message et le code de
  // validation. On les remplit puis on vérifie automatiquement.
  function onScan(text: string) {
    try {
      const data = JSON.parse(text) as {
        address?: string;
        message?: string;
        signature?: string;
      };
      if (data.address && data.message && data.signature) {
        setAddress(data.address);
        setMessage(data.message);
        setSignature(data.signature);
        setResult({
          ok: verifyDonorSignature(data.address, data.message, data.signature),
        });
        return;
      }
    } catch {
      // Contenu non structuré : on le place dans le champ information.
    }
    setMessage(text);
    setResult(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="text-accent size-5" />
          Vérification hors-ligne
        </CardTitle>
        <span className="bg-accent/15 text-accent rounded-full px-2 py-0.5 text-[11px] font-medium">
          Sans internet
        </span>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-muted-foreground text-sm">
          Vérifiez la carte d'un donneur directement sur l'appareil, même sans
          connexion internet. Pratique en cas de coupure réseau.
        </p>

        <Button
          type="button"
          className="w-full"
          onClick={() => setScanOpen(true)}
        >
          <QrCode className="size-4" />
          Scanner le QR code de la carte
        </Button>

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">
            ou saisir à la main
          </span>
          <span className="bg-border h-px flex-1" />
        </div>

        <QrScanner
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          onResult={onScan}
          title="Scanner une carte de donneur"
          description="Placez le QR code du donneur devant la caméra."
        />

        <form onSubmit={onVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ov-address">Identifiant du centre</Label>
            <Input
              id="ov-address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setResult(null);
              }}
              placeholder="Collé depuis le QR code"
              className="font-mono text-xs"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ov-message">Information à vérifier</Label>
            <Input
              id="ov-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setResult(null);
              }}
              placeholder="Groupe sanguin ou identifiant du donneur"
              className="font-mono text-xs"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ov-signature">Code de validation</Label>
            <Textarea
              id="ov-signature"
              value={signature}
              onChange={(e) => {
                setSignature(e.target.value);
                setResult(null);
              }}
              placeholder="Collé depuis le QR code"
              rows={3}
              className="font-mono text-xs"
              required
            />
          </div>

          {result ? (
            result.ok ? (
              <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                Carte authentique, information confirmée.
              </p>
            ) : (
              <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <XCircle className="size-4 shrink-0" />
                Vérification échouée : la carte ou l'information ne correspond
                pas.
              </p>
            )
          ) : null}

          <Button type="submit" className="w-full">
            <ShieldCheck className="size-4" />
            Vérifier localement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
