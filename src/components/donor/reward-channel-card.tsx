"use client";

import { Check, Smartphone, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneField } from "@/components/ui/phone-field";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import {
  MOBILE_MONEY_OPERATORS,
  type MobileMoneyOperator,
  type RewardMode,
  loadRewardPreference,
  operatorLabel,
  saveRewardPreference,
} from "@/lib/reward-preference";
import { cn } from "@/lib/utils";

/**
 * Carte « canal de récompense » de l'espace donneur : laisse le donneur
 * choisir de recevoir ses satoshis sur Mobile Money (via Izichange) ou sur
 * son portefeuille Lightning. La préférence est mémorisée côté client.
 */
export function RewardChannelCard({
  donorId,
  defaultPhone,
}: {
  donorId: string;
  defaultPhone?: string;
}) {
  const [mode, setMode] = useState<RewardMode>("mobile-money");
  const [operator, setOperator] = useState<MobileMoneyOperator>("mtn");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Hydratation depuis le stockage local, après montage (évite tout
    // décalage d'hydratation serveur/client).
    const pref = loadRewardPreference(donorId);
    if (pref) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setMode(pref.mode);
      if (pref.operator) setOperator(pref.operator);
      if (pref.phone) setPhone(pref.phone);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [donorId]);

  function persist() {
    saveRewardPreference(
      donorId,
      mode === "mobile-money" ? { mode, operator, phone } : { mode },
    );
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Canal de récompense</CardTitle>
        {mode === "mobile-money" ? (
          <Smartphone className="size-5 text-emerald-500" />
        ) : (
          <Zap className="size-5 text-amber-500" />
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {saved ? (
          <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="size-4" />
            Canal de récompense mis à jour.
          </p>
        ) : null}

        {!editing ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <div className="min-w-0">
              {mode === "mobile-money" ? (
                <>
                  <p className="text-sm font-medium">
                    {operatorLabel(operator)}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {phone || "Numéro non renseigné"} · dépôt sur votre compte
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Bitcoin</p>
                  <p className="text-muted-foreground text-xs">
                    Sur votre portefeuille Bitcoin
                  </p>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              Modifier
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ChannelOption
                active={mode === "mobile-money"}
                onClick={() => setMode("mobile-money")}
                icon={<Smartphone className="size-4" />}
                label="Mobile Money"
              />
              <ChannelOption
                active={mode === "lightning"}
                onClick={() => setMode("lightning")}
                icon={<Zap className="size-4" />}
                label="Bitcoin"
              />
            </div>

            {mode === "mobile-money" ? (
              <div className="animate-rise-in grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="channel-operator">Opérateur</Label>
                  <Select
                    id="channel-operator"
                    value={operator}
                    onValueChange={(v) => setOperator(v as MobileMoneyOperator)}
                  >
                    {MOBILE_MONEY_OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-phone">Numéro</Label>
                  <PhoneField
                    id="channel-phone"
                    value={phone}
                    onChange={setPhone}
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground animate-rise-in text-xs">
                Vous présenterez votre portefeuille Bitcoin au centre de don au
                moment de la récompense.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Annuler
              </Button>
              <Button size="sm" onClick={persist}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary/5 text-primary ring-primary/20 ring-2"
          : "hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
