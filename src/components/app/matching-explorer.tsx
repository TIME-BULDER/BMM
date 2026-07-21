"use client";

import {
  AlertCircle,
  BadgeCheck,
  Navigation,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Select, SelectItem } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useSearchDonors } from "@/lib/api/hooks";
import {
  BLOOD_TYPES,
  type BloodType,
  type MatchingDonor,
} from "@/lib/api/resources";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function initialsOf(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "DN";
}

export function MatchingExplorer() {
  const { user } = useAuth();
  const search = useSearchDonors();
  const [bloodType, setBloodType] = useState<BloodType>("O-");
  const [useAi, setUseAi] = useState(false);

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

  const matches: MatchingDonor[] = search.data?.matches ?? [];
  const { pageItems, page, setPage, totalPages, total } =
    usePagination(matches);

  function onSearch() {
    if (!coords) {
      requestLocation();
      return;
    }
    search.mutate({
      bloodType,
      lat: coords.latitude,
      lon: coords.longitude,
      ai: useAi,
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
          <div className="space-y-2 lg:w-44">
            <Label htmlFor="bloodType">Groupe receveur</Label>
            <Select
              id="bloodType"
              value={bloodType}
              onValueChange={(v) => setBloodType(v as BloodType)}
            >
              {BLOOD_TYPES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label>Localisation</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={requestLocation}
              disabled={geoStatus === "loading"}
            >
              <Navigation className="size-4" />
              {coords
                ? `${coords.latitude}, ${coords.longitude}`
                : geoStatus === "loading"
                  ? "Localisation…"
                  : "Définir le point de recherche"}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setUseAi((v) => !v)}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
              useAi
                ? "border-primary/30 bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
            aria-pressed={useAi}
          >
            <Sparkles className="size-4" />
            Matching IA
          </button>

          <Button onClick={onSearch} disabled={search.isPending}>
            <Search className="size-4" />
            {search.isPending ? "Recherche…" : "Rechercher"}
          </Button>
        </CardContent>
      </Card>

      {search.isError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertCircle className="size-4" />
          {search.error instanceof Error
            ? search.error.message
            : "Recherche impossible."}
        </p>
      ) : null}

      {search.isSuccess ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          {matches.length} donneur{matches.length > 1 ? "s" : ""} compatible
          {matches.length > 1 ? "s" : ""} avec {bloodType}
          {search.data?.ai ? (
            <Badge variant="primary">
              <Sparkles className="size-3" />
              IA
            </Badge>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((donor) => (
          <Card key={donor.id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <Avatar
                  initials={initialsOf(donor.firstName, donor.lastName)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {donor.firstName} {donor.lastName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {donor.city} · {donor.distanceKm.toFixed(1)} km
                  </p>
                </div>
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-semibold">
                  {donor.bloodType}
                </span>
              </div>

              {donor.explanation ? (
                <p className="bg-primary/5 text-primary/90 flex items-start gap-2 rounded-md p-2 text-xs">
                  <Sparkles className="mt-0.5 size-3 shrink-0" />
                  {donor.explanation}
                </p>
              ) : null}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <BadgeCheck className="text-primary size-4" />
                  {donor.available ? "Disponible" : "Indisponible"}
                </span>
                {typeof donor.score === "number" ? (
                  <span className="text-muted-foreground">
                    Score {Math.round(donor.score)}
                  </span>
                ) : null}
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}>
                  <Phone className="size-4" />
                  Contacter
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}

        {search.isSuccess && matches.length === 0 ? (
          <p className="text-muted-foreground col-span-full py-12 text-center text-sm">
            Aucun donneur compatible trouvé à proximité.
          </p>
        ) : null}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
