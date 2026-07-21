"use client";

import {
  AlertCircle,
  Check,
  Clock,
  Droplet,
  Eye,
  Mail,
  MapPin,
  Navigation,
  Plus,
  Radio,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Select, SelectItem } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  useCreateEmergency,
  useDeleteEmergency,
  useEmergencies,
  useUpdateEmergencyStatus,
} from "@/lib/api/hooks";
import {
  BLOOD_TYPES,
  type BloodType,
  type EmergencyStatus,
} from "@/lib/api/resources";
import { useAuth } from "@/providers/auth-provider";

const statusBadge: Record<EmergencyStatus, "danger" | "success" | "neutral"> = {
  active: "danger",
  resolved: "success",
  cancelled: "neutral",
};

const statusLabel: Record<EmergencyStatus, string> = {
  active: "Active",
  resolved: "Résolue",
  cancelled: "Annulée",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function AlertsBoard() {
  const { user } = useAuth();
  const hospitalId = user?.organizationId ?? undefined;

  const {
    data: emergencies,
    isLoading,
    isError,
    error,
  } = useEmergencies(hospitalId);
  const createEmergency = useCreateEmergency();
  const updateStatus = useUpdateEmergencyStatus();
  const deleteEmergency = useDeleteEmergency();

  const { pageItems, page, setPage, totalPages, total } = usePagination(
    emergencies ?? [],
  );

  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    coords,
    status: geoStatus,
    request: requestLocation,
  } = useGeolocation(
    user?.organization
      ? {
          latitude: user.organization.latitude,
          longitude: user.organization.longitude,
        }
      : undefined,
  );

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!coords) {
      setFormError("Localisation requise pour cibler les donneurs proches.");
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      await createEmergency.mutateAsync({
        bloodType: String(form.get("bloodType")) as BloodType,
        quantityNeeded: Number(form.get("quantityNeeded")) || 1,
        city: String(form.get("city")),
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Création impossible.");
    }
  }

  return (
    <div className="space-y-6">
      {open ? (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onCreate} className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Nouvelle alerte d'urgence</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {formError ? (
                <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <AlertCircle className="size-4 shrink-0" />
                  {formError}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Groupe recherché</Label>
                  <Select id="bloodType" name="bloodType" defaultValue="O-">
                    {BLOOD_TYPES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityNeeded">Poches nécessaires</Label>
                  <Input
                    id="quantityNeeded"
                    name="quantityNeeded"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" required placeholder="Cotonou" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={requestLocation}
                disabled={geoStatus === "loading"}
              >
                <Navigation className="size-4" />
                {coords
                  ? `Position : ${coords.latitude}, ${coords.longitude}`
                  : geoStatus === "loading"
                    ? "Localisation…"
                    : "Définir la localisation"}
              </Button>

              {/* Canaux de diffusion de l'alerte (automatiques). */}
              <div className="space-y-2">
                <Label>Canaux de diffusion</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                    <Mail className="text-primary size-4" />
                    <span className="flex-1">E-mails ciblés</span>
                    <Badge variant="success">Actif</Badge>
                  </div>
                  <div className="border-accent/40 bg-accent/5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                    <Radio className="text-accent size-4" />
                    <span className="flex-1">Réseau Nostr</span>
                    <Badge variant="success">Actif</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs">
                  Chaque alerte est aussi diffusée sur un réseau public, gratuit
                  et fiable même en cas de panne des opérateurs télécoms.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createEmergency.isPending}>
                  {createEmergency.isPending
                    ? "Diffusion…"
                    : "Diffuser l'alerte"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nouvelle alerte
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Chargement des alertes…
        </p>
      ) : isError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm">
          <AlertCircle className="size-4" />
          {error instanceof Error ? error.message : "Chargement impossible."}
        </p>
      ) : !emergencies || emergencies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Droplet className="text-muted-foreground size-8" />
            <p className="font-medium">Aucune alerte en cours</p>
            <p className="text-muted-foreground text-sm">
              Déclenchez une alerte pour mobiliser les donneurs compatibles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pageItems.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-base font-semibold">
                    {alert.bloodType}
                  </span>
                  <div>
                    <p className="font-medium">
                      {alert.quantityNeeded} poche
                      {alert.quantityNeeded > 1 ? "s" : ""} recherchée
                      {alert.quantityNeeded > 1 ? "s" : ""}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {alert.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {dateFmt.format(new Date(alert.createdAt))}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={statusBadge[alert.status]}>
                    {statusLabel[alert.status]}
                  </Badge>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/alerts/${alert.id}`}>
                      <Eye className="size-4" />
                      Détails
                    </Link>
                  </Button>

                  {alert.status === "active" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateStatus.mutate({
                            id: alert.id,
                            status: "resolved",
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        <Check className="size-4" />
                        Résolue
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateStatus.mutate({
                            id: alert.id,
                            status: "cancelled",
                          })
                        }
                        disabled={updateStatus.isPending}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : null}

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer l'alerte"
                    onClick={() => deleteEmergency.mutate(alert.id)}
                    disabled={deleteEmergency.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
