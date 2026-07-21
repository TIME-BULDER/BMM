"use client";

import { AlertCircle, Building2 } from "lucide-react";

import { OrgReviewRow } from "@/components/app/super-admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganizations } from "@/lib/api/hooks";

/** Liste des organisations à valider / gérer (réservé au super-administrateur). */
export function OrganizationsReview() {
  const orgs = useOrganizations();
  const pending = orgs.data?.filter((o) => !o.verified) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Organisations</CardTitle>
        <div className="flex items-center gap-2">
          {pending.length > 0 ? (
            <Badge variant="warning">{pending.length} à vérifier</Badge>
          ) : null}
          <Building2 className="text-primary size-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {orgs.isLoading ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Chargement…
          </p>
        ) : orgs.isError ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center gap-2 rounded-lg border px-4 py-8 text-sm">
            <AlertCircle className="size-4" />
            Chargement impossible.
          </p>
        ) : (orgs.data?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Aucune organisation pour l'instant.
          </p>
        ) : (
          orgs.data?.map((org) => <OrgReviewRow key={org.id} org={org} />)
        )}
      </CardContent>
    </Card>
  );
}
