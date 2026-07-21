"use client";

import {
  AlertCircle,
  Bitcoin,
  CheckCircle2,
  Clock,
  Droplet,
  Loader2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useVerifyDonor } from "@/lib/api/hooks";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function VerifyPanel({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useVerifyDonor(id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16">
          <Loader2 className="text-primary size-5 animate-spin" />
          <span className="text-muted-foreground text-sm">
            Vérification en cours…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <XCircle className="text-destructive size-10" />
          <div className="space-y-1">
            <p className="font-medium">Donneur introuvable</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error
                ? error.message
                : "Aucune preuve ne correspond à cet identifiant."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { donor, verification } = data;
  const verified = verification.isTimestampVerified;

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-base font-semibold">
              {donor.bloodType}
            </span>
            <div>
              <p className="font-semibold">Profil donneur</p>
              <p className="text-muted-foreground font-mono text-xs">
                {donor.id}
              </p>
            </div>
          </div>
          {verified ? (
            <Badge variant="success">
              <CheckCircle2 className="size-3.5" />
              Vérifié
            </Badge>
          ) : donor.hasOtsProof ? (
            <Badge variant="warning">
              <Clock className="size-3.5" />
              En cours de validation
            </Badge>
          ) : (
            <Badge variant="neutral">
              <AlertCircle className="size-3.5" />
              Non confirmée
            </Badge>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Groupe sanguin" icon={Droplet}>
            {donor.bloodType || "Non renseigné"}
          </Detail>
          <Detail label="Inscrit le" icon={Clock}>
            {dateFmt.format(new Date(donor.createdAt))}
          </Detail>
        </dl>

        {verified && verification.details ? (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <Bitcoin className="mt-0.5 size-5 text-amber-500" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                Carte authentique et confirmée
              </p>
              <p className="text-muted-foreground text-xs">
                Confirmée le{" "}
                {dateFmt.format(
                  new Date(verification.details.timestamp * 1000),
                )}
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Detail({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Droplet;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
