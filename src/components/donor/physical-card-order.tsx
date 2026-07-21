"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmCardOrder, useOrderCard } from "@/lib/api/hooks";

const CARD_PRICE_XOF = 5000;

/**
 * Commande de la carte physique de donneur : gratuite au mérite (≥ 3 activités)
 * ou payante via Izichange Pay. Reflète le statut de commande courant.
 */
export function PhysicalCardOrder({
  cardType,
  physicalCardStatus,
}: {
  cardType: string;
  physicalCardStatus: string;
}) {
  const order = useOrderCard();
  const confirm = useConfirmCardOrder();
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const status = pendingOrderId ? "pending" : physicalCardStatus;
  const alreadyPhysical = cardType === "physical" || status === "ordered_paid";

  async function onOrder(method: "merit" | "pay") {
    setError(null);
    try {
      const result = await order.mutateAsync(method);
      if (method === "pay") {
        setPendingOrderId(result.orderId);
        setCheckoutUrl(result.checkoutUrl ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commande impossible.");
    }
  }

  async function onConfirm() {
    if (!pendingOrderId) return;
    setError(null);
    try {
      await confirm.mutateAsync(pendingOrderId);
      setPendingOrderId(null);
      setCheckoutUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation impossible.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Carte physique de donneur</CardTitle>
        <CreditCard className="text-primary size-5" />
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {error ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {alreadyPhysical ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
            <div>
              <p className="font-medium">Carte physique commandée</p>
              <p className="text-muted-foreground text-sm">
                Elle est en préparation et vous sera remise par votre centre.
              </p>
            </div>
          </div>
        ) : status === "merited" ? (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <Award className="size-6 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium">Carte accordée au mérite</p>
              <p className="text-muted-foreground text-sm">
                Bravo pour votre engagement ! Votre carte gratuite est en
                préparation.
              </p>
            </div>
          </div>
        ) : status === "pending" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <Clock className="size-6 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium">Paiement en attente</p>
                <p className="text-muted-foreground text-sm">
                  Réglez {CARD_PRICE_XOF.toLocaleString("fr-FR")} XOF par
                  paiement mobile, puis confirmez.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {checkoutUrl ? (
                <Button asChild variant="outline" className="flex-1">
                  <a href={checkoutUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Procéder au paiement
                  </a>
                </Button>
              ) : null}
              <Button
                className="flex-1"
                onClick={onConfirm}
                disabled={confirm.isPending}
              >
                {confirm.isPending ? "Confirmation…" : "J'ai payé"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Obtenez votre carte physique vérifiable : gratuitement en
              récompense de votre engagement, ou à l'achat.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onOrder("merit")}
                disabled={order.isPending}
                className="hover:border-primary/40 hover:bg-muted/40 flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all disabled:opacity-60"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Award className="size-4 text-amber-500" />
                  Au mérite
                  <Badge variant="success">Gratuit</Badge>
                </span>
                <span className="text-muted-foreground text-xs">
                  Offerte dès 3 activités validées (dons, parrainages,
                  sensibilisation).
                </span>
              </button>
              <button
                type="button"
                onClick={() => onOrder("pay")}
                disabled={order.isPending}
                className="hover:border-primary/40 hover:bg-muted/40 flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all disabled:opacity-60"
              >
                <span className="flex items-center gap-2 font-medium">
                  <CreditCard className="text-primary size-4" />À l'achat
                </span>
                <span className="text-muted-foreground text-xs">
                  {CARD_PRICE_XOF.toLocaleString("fr-FR")} XOF par paiement
                  mobile, livraison immédiate.
                </span>
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
