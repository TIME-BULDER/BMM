"use client";

import { AlertCircle, Bitcoin, Heart, Wallet, Zap } from "lucide-react";
import { useState } from "react";

import { QrBadge } from "@/components/donor/qr-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDonation } from "@/lib/api/hooks";
import {
  DONATION_PURPOSE_HINTS,
  DONATION_PURPOSE_LABELS,
  type DonationInvoice,
  type DonationPurpose,
} from "@/lib/api/resources";

const PRESETS = [2_100, 10_000, 21_000, 100_000];
// Le soutien via cette page finance la plateforme uniquement. Le soutien à une
// campagne précise se fait depuis la page publique de cette campagne.
const PURPOSES: DonationPurpose[] = ["development", "operations", "emergency"];

function truncateMiddle(value: string, head = 14, tail = 10) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function DonationForm() {
  const create = useCreateDonation();
  const [purpose, setPurpose] = useState<DonationPurpose>("development");
  const [amount, setAmount] = useState<number>(21_000);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<DonationInvoice | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!amount || amount < 100) {
      setError("Le montant minimum est de 100 sats.");
      return;
    }
    try {
      const result = await create.mutateAsync({
        amountSats: amount,
        purpose,
        message: message.trim() || undefined,
      });
      setInvoice(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de generer la facture pour le moment.",
      );
    }
  }

  if (invoice) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Merci pour votre soutien</CardTitle>
          <Heart className="text-primary size-5" />
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <p className="text-muted-foreground text-sm">
            Scannez la facture Lightning ci-dessous avec votre portefeuille pour
            envoyer {invoice.amountSats.toLocaleString("fr-FR")} sats a{" "}
            {DONATION_PURPOSE_LABELS[invoice.purpose].toLowerCase()}.
          </p>

          {/* Avertissement de facture simulee, masque a la demande.
          {invoice.simulated ? (
            <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              Facture de demonstration (SDK Breez en mode simulation cote
              serveur). Configurez le noeud Breez pour des factures reelles.
            </p>
          ) : null} */}

          <div className="flex justify-center">
            <QrBadge
              value={invoice.bolt11}
              label="Facture Lightning (BOLT11)"
              caption={truncateMiddle(invoice.bolt11)}
              copyable
              size={168}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <a href={`lightning:${invoice.bolt11}`}>
                <Wallet className="size-4" />
                Ouvrir dans le portefeuille
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setInvoice(null)}
            >
              Faire un autre don
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Soutenir Bitcoin Blood</CardTitle>
        <Bitcoin className="size-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {error ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label>Objectif du don</Label>
            <div className="grid grid-cols-2 gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={
                    purpose === p
                      ? "border-primary bg-primary/10 text-primary rounded-md border px-3 py-2 text-left text-sm font-medium"
                      : "hover:bg-accent rounded-md border px-3 py-2 text-left text-sm transition-colors"
                  }
                >
                  {DONATION_PURPOSE_LABELS[p]}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              {DONATION_PURPOSE_HINTS[purpose]}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Montant (sats)</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={
                    amount === preset
                      ? "border-primary bg-primary/10 text-primary rounded-md border px-2 py-2 text-sm font-medium"
                      : "hover:bg-accent rounded-md border px-2 py-2 text-sm transition-colors"
                  }
                >
                  {preset.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Montant personnalise en sats"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Un mot pour l'equipe..."
              rows={2}
              maxLength={280}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={create.isPending}
          >
            <Zap className="size-4" />
            {create.isPending
              ? "Generation de la facture..."
              : "Generer la facture Lightning"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
