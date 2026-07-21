"use client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDeleteEmergency,
  useEmergency,
  useSearchDonors,
  useUpdateEmergencyStatus,
} from "@/lib/api/hooks";
import type { EmergencyStatus, MatchingDonor } from "@/lib/api/resources";

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
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function initialsOf(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "DN";
}

export function EmergencyDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: emergency, isLoading, isError } = useEmergency(id);
  const search = useSearchDonors();
  const updateStatus = useUpdateEmergencyStatus();
  const deleteEmergency = useDeleteEmergency();

  // Lance le matching des donneurs compatibles dès que l'urgence est chargée.
  useEffect(() => {
    if (emergency) {
      search.mutate({
        bloodType: emergency.bloodType,
        lat: emergency.latitude,
        lon: emergency.longitude,
        ai: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergency?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16">
          <Loader2 className="text-primary size-5 animate-spin" />
          <span className="text-muted-foreground text-sm">
            Chargement de l'urgence…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !emergency) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="text-destructive size-10" />
          <div className="space-y-1">
            <p className="font-medium">Urgence introuvable</p>
            <p className="text-muted-foreground text-sm">
              Cette alerte n'existe plus ou a été supprimée.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/alerts">Retour aux alertes</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const matches: MatchingDonor[] = search.data?.matches ?? [];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/alerts">
          <ArrowLeft className="size-4" />
          Toutes les alertes
        </Link>
      </Button>

      {/* Carte de l'urgence */}
      <Card className="overflow-hidden">
        <div className="from-primary/15 flex flex-col gap-4 bg-gradient-to-br to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-2xl text-xl font-bold">
              {emergency.bloodType}
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                {emergency.quantityNeeded} poche
                {emergency.quantityNeeded > 1 ? "s" : ""} de{" "}
                {emergency.bloodType}
              </h1>
              <p className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {emergency.city}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {dateFmt.format(new Date(emergency.createdAt))}
                </span>
              </p>
            </div>
          </div>
          <Badge variant={statusBadge[emergency.status]}>
            {statusLabel[emergency.status]}
          </Badge>
        </div>

        {emergency.status === "active" ? (
          <CardContent className="flex flex-wrap items-center gap-2 p-6 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateStatus.mutate({ id: emergency.id, status: "resolved" })
              }
              disabled={updateStatus.isPending}
            >
              <Check className="size-4" />
              Marquer résolue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updateStatus.mutate({ id: emergency.id, status: "cancelled" })
              }
              disabled={updateStatus.isPending}
            >
              Annuler l'alerte
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive ml-auto"
              onClick={async () => {
                await deleteEmergency.mutateAsync(emergency.id).catch(() => {});
                router.push("/alerts");
              }}
              disabled={deleteEmergency.isPending}
            >
              <Trash2 className="size-4" />
              Supprimer
            </Button>
          </CardContent>
        ) : null}
      </Card>

      {/* Donneurs compatibles (Blood Emergency AI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="text-primary size-4" />
            Donneurs compatibles
          </h2>
          {search.isSuccess ? (
            <span className="text-muted-foreground text-sm">
              {matches.length} trouvé{matches.length > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>

        {search.isPending ? (
          <p className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Recherche des donneurs compatibles…
          </p>
        ) : search.isError ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
            <AlertCircle className="size-4" />
            Impossible de charger les donneurs compatibles.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((donor) => (
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

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
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
        )}
      </div>
    </div>
  );
}
