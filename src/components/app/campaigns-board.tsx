"use client";

import {
  AlertCircle,
  CalendarHeart,
  Mail,
  MapPin,
  Navigation,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCampaigns, useCreateCampaign } from "@/lib/api/hooks";
import {
  BLOOD_TYPES,
  type BloodType,
  type CampaignType,
} from "@/lib/api/resources";
import { useAuth } from "@/providers/auth-provider";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CampaignsBoard() {
  const { user } = useAuth();
  const {
    data: campaigns,
    isLoading,
    isError,
    error,
  } = useCampaigns(user?.organizationId ?? undefined);
  const createCampaign = useCreateCampaign();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CampaignType>("general");
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
      setFormError("Localisation requise pour définir le rayon de campagne.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const targetBloodType = form.get("targetBloodType");
    const startInput = String(form.get("startsAt") || "");
    const endInput = String(form.get("endsAt") || "");
    if (!startInput || !endInput) {
      setFormError("Indiquez la date de début et la date de fin.");
      return;
    }
    const startsAt = new Date(startInput).toISOString();
    const endsAt = new Date(endInput).toISOString();
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError("La date de fin doit être après la date de début.");
      return;
    }
    try {
      await createCampaign.mutateAsync({
        title: String(form.get("title")),
        type,
        targetBloodType:
          type === "targeted"
            ? (String(targetBloodType) as BloodType)
            : undefined,
        city: String(form.get("city")),
        radiusKm: Number(form.get("radiusKm")) || 20,
        latitude: coords.latitude,
        longitude: coords.longitude,
        startsAt,
        endsAt,
      });
      setOpen(false);
      setType("general");
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
                <h2 className="font-semibold">Nouvelle campagne</h2>
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

              <div className="space-y-2">
                <Label htmlFor="title">Titre de la campagne</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  minLength={5}
                  placeholder="Collecte solidaire de juillet"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    id="type"
                    name="type"
                    value={type}
                    onValueChange={(v) => setType(v as CampaignType)}
                  >
                    <SelectItem value="general">Générale</SelectItem>
                    <SelectItem value="targeted">Ciblée</SelectItem>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetBloodType">Groupe ciblé</Label>
                  <Select
                    id="targetBloodType"
                    name="targetBloodType"
                    defaultValue="O-"
                    disabled={type !== "targeted"}
                  >
                    {BLOOD_TYPES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" required placeholder="Cotonou" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radiusKm">Rayon (km)</Label>
                  <Input
                    id="radiusKm"
                    name="radiusKm"
                    type="number"
                    min={1}
                    max={500}
                    defaultValue={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Début de la campagne</Label>
                  <Input
                    id="startsAt"
                    name="startsAt"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Fin de la campagne</Label>
                  <Input
                    id="endsAt"
                    name="endsAt"
                    type="datetime-local"
                    required
                  />
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createCampaign.isPending}>
                  {createCampaign.isPending
                    ? "Lancement…"
                    : "Lancer la campagne"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Créer une campagne
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          Chargement des campagnes…
        </p>
      ) : isError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm">
          <AlertCircle className="size-4" />
          {error instanceof Error ? error.message : "Chargement impossible."}
        </p>
      ) : !campaigns || campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <CalendarHeart className="text-muted-foreground size-8" />
            <p className="font-medium">Aucune campagne</p>
            <p className="text-muted-foreground text-sm">
              Lancez votre première campagne de collecte.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="leading-tight font-semibold">
                    {campaign.title}
                  </h3>
                  <Badge
                    variant={
                      campaign.type === "targeted" ? "primary" : "neutral"
                    }
                  >
                    {campaign.type === "targeted"
                      ? `Ciblée ${campaign.targetBloodType ?? ""}`
                      : "Générale"}
                  </Badge>
                </div>

                <div className="text-muted-foreground space-y-1.5 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5" />
                    {campaign.city} · rayon {campaign.radiusKm} km
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarHeart className="size-3.5" />
                    {dateFmt.format(new Date(campaign.createdAt))} ·{" "}
                    {campaign.status}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t pt-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Mail className="text-muted-foreground size-3.5" />
                    {campaign.emailsSent} envoyés
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="text-muted-foreground size-3.5" />
                    {campaign.responsesCount} réponses
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
