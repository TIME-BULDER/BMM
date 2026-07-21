"use client";

import { Check, Loader2, Plus, Wallet } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRechargeOrg } from "@/lib/api/hooks";
import { useDemoBalanceDelta } from "@/lib/org-balance";
import { useAuth } from "@/providers/auth-provider";

const PRESETS = [10_000, 50_000, 100_000, 500_000];

/**
 * Compte d'approvisionnement de la structure : solde de récompenses et
 * rechargement. Les récompenses versées aux donneurs y sont débitées.
 */
export function FundingAccountCard() {
  const { user, isDemo } = useAuth();
  const delta = useDemoBalanceDelta();
  const recharge = useRechargeOrg();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(50_000);
  const [done, setDone] = useState(false);

  const base = user?.organization?.balanceSats ?? 0;
  const balance = Math.max(0, base + (isDemo ? delta : 0));

  async function onRecharge() {
    await recharge.mutateAsync(amount).catch(() => {});
    setOpen(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Compte de récompenses</CardTitle>
        <Wallet className="text-primary size-5" />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="from-primary/10 flex items-center justify-between rounded-xl bg-linear-to-br to-transparent p-5">
          <div>
            <p className="text-3xl font-bold tracking-tight">
              {balance.toLocaleString("fr-FR")}{" "}
              <span className="text-base font-medium">sats</span>
            </p>
            <p className="text-muted-foreground text-xs">
              Solde disponible pour récompenser vos donneurs
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Recharger
          </Button>
        </div>

        {done ? (
          <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Compte rechargé.
          </p>
        ) : null}
      </CardContent>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Recharger le compte"
        description="Créditez votre compte pour financer les récompenses des donneurs."
      >
        <div className="space-y-4">
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
                      ? "border-primary bg-primary/10 text-primary rounded-md border px-2 py-2 text-xs font-medium"
                      : "hover:bg-accent rounded-md border px-2 py-2 text-xs transition-colors"
                  }
                >
                  {preset.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <Button
            className="w-full"
            onClick={onRecharge}
            disabled={recharge.isPending || amount < 1}
          >
            {recharge.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wallet className="size-4" />
            )}
            {recharge.isPending ? "Rechargement…" : "Recharger le compte"}
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
