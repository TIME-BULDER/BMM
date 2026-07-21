"use client";

import { ArrowUpRight, Bitcoin, CheckCircle2, Gift, Heart } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDonationsHistory, useWithdrawDonations } from "@/lib/api/hooks";
import { DONATION_PURPOSE_LABELS } from "@/lib/api/resources";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const statusVariant: Record<string, "success" | "warning" | "neutral"> = {
  completed: "success",
  pending: "warning",
  simulated: "neutral",
};

export function DonationsPanel() {
  const { data, isLoading } = useDonationsHistory();
  const withdraw = useWithdrawDonations();
  const [invoice, setInvoice] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const donations = data?.donations ?? [];
  const totalSats = data?.totalSats ?? 0;

  async function onWithdraw() {
    setError(null);
    setFeedback(null);
    try {
      const result = await withdraw.mutateAsync(invoice.trim());
      setFeedback(
        `Retrait envoye. Reference: ${result.paymentHash.slice(0, 18)}...`,
      );
      setInvoice("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le retrait a echoue.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-primary size-5" />
          Dons a la plateforme
        </CardTitle>
        <Badge variant="success">
          <Bitcoin className="size-3.5" />
          {totalSats.toLocaleString("fr-FR")} sats
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {/* Historique */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Chargement...
            </p>
          ) : donations.length === 0 ? (
            <p className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
              <Gift className="size-4" />
              Aucun don recu pour le moment.
            </p>
          ) : (
            donations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                    <Bitcoin className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {d.amountSats.toLocaleString("fr-FR")} sats
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {DONATION_PURPOSE_LABELS[d.purpose]}
                      </span>
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {dateFmt.format(new Date(d.createdAt))}
                      {d.message ? ` · ${d.message}` : ""}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant[d.status] ?? "neutral"}>
                  {d.status}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Retrait des fonds */}
        <div className="space-y-2 rounded-lg border p-4">
          <Label htmlFor="withdraw-invoice">Retirer les fonds</Label>
          <p className="text-muted-foreground text-xs">
            Collez une facture Lightning (BOLT11) pour envoyer le solde collecte
            vers votre portefeuille.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="withdraw-invoice"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="lnbc..."
              className="font-mono text-xs"
            />
            <Button
              onClick={onWithdraw}
              disabled={invoice.trim().length < 20 || withdraw.isPending}
            >
              <ArrowUpRight className="size-4" />
              {withdraw.isPending ? "Envoi..." : "Retirer"}
            </Button>
          </div>
          {feedback ? (
            <p className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              {feedback}
            </p>
          ) : null}
          {error ? <p className="text-destructive text-xs">{error}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
