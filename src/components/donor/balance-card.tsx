"use client";

import { AlertCircle, ArrowDownToLine, Check, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { useWithdrawBalance } from "@/lib/api/hooks";

/**
 * Solde plateforme du donneur + retrait autonome vers Mobile Money (Izichange).
 * Le donneur laisse ses récompenses s'accumuler puis déclenche lui-même son
 * cash-out quand il le souhaite.
 */
export function BalanceCard({
  balanceSats,
  defaultPhone,
}: {
  balanceSats: number;
  defaultPhone?: string;
}) {
  const withdraw = useWithdrawBalance();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onWithdraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const amountSats = Number(form.get("amountSats"));
    const momoNumber = String(form.get("momoNumber"));
    if (!amountSats || amountSats < 1) {
      setError("Montant invalide.");
      return;
    }
    if (amountSats > balanceSats) {
      setError("Montant supérieur à votre solde disponible.");
      return;
    }
    try {
      await withdraw.mutateAsync({ amountSats, momoNumber });
      setDone(true);
      setOpen(false);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le retrait a échoué.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Mon solde retirable</CardTitle>
        <Wallet className="text-primary size-5" />
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="from-primary/10 flex items-end justify-between rounded-xl bg-linear-to-br to-transparent p-5">
          <div>
            <p className="text-3xl font-bold tracking-tight">
              {balanceSats.toLocaleString("fr-FR")}{" "}
              <span className="text-base font-medium">sats</span>
            </p>
            <p className="text-muted-foreground text-xs">
              Accumulés sur la plateforme, retirables à tout moment
            </p>
          </div>
          {!open ? (
            <Button
              size="sm"
              onClick={() => {
                setOpen(true);
                setDone(false);
              }}
              disabled={balanceSats < 1}
            >
              <ArrowDownToLine className="size-4" />
              Retirer
            </Button>
          ) : null}
        </div>

        {done ? (
          <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Retrait initié : vous recevrez un dépôt Mobile Money.
          </p>
        ) : null}

        {open ? (
          <form onSubmit={onWithdraw} className="animate-rise-in space-y-4">
            {error ? (
              <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="wd-phone">Numéro Mobile Money</Label>
              <PhoneField
                id="wd-phone"
                name="momoNumber"
                defaultValue={defaultPhone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wd-amount">Montant (sats)</Label>
              <Input
                id="wd-amount"
                name="amountSats"
                type="number"
                min={1}
                max={balanceSats}
                defaultValue={balanceSats}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={withdraw.isPending}>
                <ArrowDownToLine className="size-4" />
                {withdraw.isPending ? "Retrait…" : "Confirmer le retrait"}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
