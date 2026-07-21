"use client";

import {
  ArrowLeftRight,
  Check,
  Clock,
  MapPin,
  Plus,
  Send,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import {
  useCreateTransfer,
  useRespondTransfer,
  useStock,
  useTransfers,
} from "@/lib/api/hooks";
import { BLOOD_TYPES, type BloodType } from "@/lib/api/resources";
import {
  DEMO_CURRENT_ORG_ID,
  stockStatusOf,
  type BloodComponent,
  type TransferStatus,
  type TransferUrgency,
} from "@/lib/dev/demo";
import { cn } from "@/lib/utils";

const components: BloodComponent[] = ["CGR", "Plasma", "Plaquettes"];

const urgencyBadge: Record<TransferUrgency, "danger" | "warning" | "neutral"> =
  {
    vitale: "danger",
    haute: "warning",
    moderee: "neutral",
  };
const urgencyLabel: Record<TransferUrgency, string> = {
  vitale: "Vitale",
  haute: "Haute",
  moderee: "Modérée",
};

const statusMeta: Record<
  TransferStatus,
  {
    label: string;
    variant: "danger" | "warning" | "primary" | "success" | "neutral";
  }
> = {
  ouverte: { label: "Ouverte", variant: "danger" },
  acceptée: { label: "Acceptée", variant: "primary" },
  en_transit: { label: "En transit", variant: "warning" },
  reçue: { label: "Reçue", variant: "success" },
  annulée: { label: "Annulée", variant: "neutral" },
};

const dotByStatus = {
  critique: "bg-destructive",
  faible: "bg-amber-500",
  stable: "bg-emerald-500",
} as const;

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NetworkBoard() {
  const stock = useStock();
  const transfers = useTransfers();
  const createTransfer = useCreateTransfer();
  const respond = useRespondTransfer();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"reseau" | "miennes">("reseau");

  function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createTransfer.mutate({
      component: String(form.get("component")) as BloodComponent,
      bloodType: String(form.get("bloodType")),
      quantity: Number(form.get("quantity")) || 1,
      urgency: String(form.get("urgency")) as TransferUrgency,
    });
    setOpen(false);
    setTab("miennes");
  }

  // Pivot du stock: [bloodType][component] = item
  const stockMap = new Map<
    string,
    Map<BloodComponent, { units: number; expiringSoon: number }>
  >();
  for (const item of stock.data ?? []) {
    if (!stockMap.has(item.bloodType)) stockMap.set(item.bloodType, new Map());
    stockMap.get(item.bloodType)!.set(item.component, {
      units: item.units,
      expiringSoon: item.expiringSoon,
    });
  }

  const allTransfers = transfers.data ?? [];
  const visible = allTransfers.filter((t) =>
    tab === "miennes"
      ? t.requesterId === DEMO_CURRENT_ORG_ID
      : t.requesterId !== DEMO_CURRENT_ORG_ID,
  );

  return (
    <div className="space-y-8">
      {/* Stock par composant */}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Mon stock de sang</CardTitle>
            <p className="text-muted-foreground text-sm">
              Poches disponibles par groupe sanguin et par composant, avec les
              poches qui arrivent bientôt à expiration.
            </p>
          </div>
          <Warehouse className="text-muted-foreground size-5 shrink-0" />
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full min-w-120 border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr className="text-muted-foreground text-left text-xs">
                <th className="px-3 py-1 font-medium">Groupe</th>
                {components.map((c) => (
                  <th key={c} className="px-3 py-1 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOOD_TYPES.map((bt) => (
                <tr key={bt}>
                  <td className="px-3 py-2">
                    <span className="bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold">
                      {bt}
                    </span>
                  </td>
                  {components.map((c) => {
                    const cell = stockMap.get(bt)?.get(c);
                    const units = cell?.units ?? 0;
                    const status = stockStatusOf(units);
                    return (
                      <td key={c} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              dotByStatus[status],
                            )}
                          />
                          <span className="font-medium">{units}</span>
                          {cell && cell.expiringSoon > 0 ? (
                            <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                              <Clock className="size-3" />
                              {cell.expiringSoon}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="bg-destructive size-2 rounded-full" /> critique
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> faible
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> stable
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> poches expirant sous 7 j
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Transferts inter-centres */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Réseau d'entraide entre centres
          </h2>
          <p className="text-muted-foreground text-sm">
            Demandez du sang à d'autres centres quand vous en manquez, ou
            répondez aux demandes des centres proches. « Réseau » liste les
            demandes ouvertes ; « Mes demandes » suit les vôtres.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="bg-muted/60 flex gap-1 rounded-lg p-1">
            {(
              [
                { key: "reseau", label: "Réseau" },
                { key: "miennes", label: "Mes demandes" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setOpen((v) => !v)}>
            {open ? <X className="size-4" /> : <Plus className="size-4" />}
            {open ? "Fermer" : "Demander un transfert"}
          </Button>
        </div>

        {open ? (
          <Card>
            <CardContent className="p-6">
              <form
                onSubmit={onCreate}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
              >
                <div className="space-y-2">
                  <Label htmlFor="component">Composant</Label>
                  <Select id="component" name="component" defaultValue="CGR">
                    {components.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Groupe</Label>
                  <Select id="bloodType" name="bloodType" defaultValue="O-">
                    {BLOOD_TYPES.map((g: BloodType) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Poches</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgence</Label>
                  <Select id="urgency" name="urgency" defaultValue="haute">
                    <SelectItem value="vitale">Vitale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="moderee">Modérée</SelectItem>
                  </Select>
                </div>
                <Button type="submit">
                  <Send className="size-4" />
                  Publier
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {transfers.isLoading ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            Chargement du réseau…
          </p>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
              <ArrowLeftRight className="text-muted-foreground size-8" />
              <p className="font-medium">
                {tab === "reseau"
                  ? "Aucune demande dans le réseau"
                  : "Vous n'avez aucune demande"}
              </p>
              <p className="text-muted-foreground text-sm">
                {tab === "reseau"
                  ? "Les besoins des autres centres apparaîtront ici."
                  : "Publiez une demande pour solliciter le réseau."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((t) => {
              const mine = t.requesterId === DEMO_CURRENT_ORG_ID;
              const status = statusMeta[t.status];
              return (
                <Card key={t.id}>
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-sm font-semibold">
                        {t.bloodType}
                      </span>
                      <div>
                        <p className="font-medium">
                          {t.quantity} {t.component}
                          {t.quantity > 1 ? "s" : ""}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1 text-sm">
                          <MapPin className="size-3.5" />
                          {mine ? "Vous" : t.requesterName} · {t.requesterCity}{" "}
                          · {dateFmt.format(new Date(t.createdAt))}
                        </p>
                        {t.responderName ? (
                          <p className="text-muted-foreground text-xs">
                            Pris en charge par {t.responderName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={urgencyBadge[t.urgency]}>
                        {urgencyLabel[t.urgency]}
                      </Badge>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {!mine && t.status === "ouverte" ? (
                        <Button
                          size="sm"
                          onClick={() => respond.mutate(t.id)}
                          disabled={respond.isPending}
                        >
                          <Check className="size-4" />
                          Proposer
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
