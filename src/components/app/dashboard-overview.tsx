"use client";

import {
  AlertCircle,
  Bell,
  CalendarHeart,
  Droplet,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaigns, useEmergencies } from "@/lib/api/hooks";
import { useAuth } from "@/providers/auth-provider";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function DashboardOverview() {
  const { user } = useAuth();
  const hospitalId = user?.organizationId ?? undefined;

  const emergencies = useEmergencies(hospitalId);
  const campaigns = useCampaigns(hospitalId);

  const activeEmergencies =
    emergencies.data?.filter((e) => e.status === "active") ?? [];
  const pochesNeeded = activeEmergencies.reduce(
    (sum, e) => sum + e.quantityNeeded,
    0,
  );
  const totalResponses =
    campaigns.data?.reduce((sum, c) => sum + c.responsesCount, 0) ?? 0;

  const metrics = [
    {
      key: "active",
      label: "Urgences actives",
      value: emergencies.isLoading ? "…" : String(activeEmergencies.length),
      icon: Bell,
    },
    {
      key: "poches",
      label: "Poches recherchées",
      value: emergencies.isLoading ? "…" : String(pochesNeeded),
      icon: Droplet,
    },
    {
      key: "campaigns",
      label: "Campagnes",
      value: campaigns.isLoading ? "…" : String(campaigns.data?.length ?? 0),
      icon: CalendarHeart,
    },
    {
      key: "responses",
      label: "Réponses reçues",
      value: campaigns.isLoading ? "…" : String(totalResponses),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.key}>
              <CardContent className="space-y-2 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {metric.label}
                  </p>
                  <Icon className="text-primary size-5" />
                </div>
                <span className="text-3xl font-semibold tracking-tight">
                  {metric.value}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgences récentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes urgences</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alerts">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {emergencies.isLoading ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Chargement…
              </p>
            ) : emergencies.isError ? (
              <p className="text-destructive flex items-center gap-2 py-6 text-sm">
                <AlertCircle className="size-4" />
                Chargement impossible.
              </p>
            ) : !emergencies.data || emergencies.data.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Aucune urgence. Tout est sous contrôle.
              </p>
            ) : (
              emergencies.data.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-semibold">
                      {e.bloodType}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {e.quantityNeeded} poche
                        {e.quantityNeeded > 1 ? "s" : ""}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <MapPin className="size-3" />
                        {e.city} · {dateFmt.format(new Date(e.createdAt))}
                      </p>
                    </div>
                  </div>
                  <Badge variant={e.status === "active" ? "danger" : "success"}>
                    {e.status === "active" ? "Active" : "Résolue"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Campagnes récentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes campagnes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/campaigns">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {campaigns.isLoading ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Chargement…
              </p>
            ) : !campaigns.data || campaigns.data.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Aucune campagne en cours.
              </p>
            ) : (
              campaigns.data.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <MapPin className="size-3" />
                      {c.city} · {c.responsesCount} réponses
                    </p>
                  </div>
                  <Badge
                    variant={c.type === "targeted" ? "primary" : "neutral"}
                  >
                    {c.type === "targeted" ? "Ciblée" : "Générale"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
