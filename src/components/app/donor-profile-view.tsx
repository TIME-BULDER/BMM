"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bitcoin,
  Clock,
  CreditCard,
  Droplet,
  Loader2,
  MapPin,
  Phone,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDonors, useVerifyDonor } from "@/lib/api/hooks";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const CARD_LABEL: Record<string, string> = {
  none: "Numérique",
  virtual: "Numérique",
  digital: "Numérique",
  merited: "Physique (au mérite)",
  pending: "Physique (paiement en attente)",
  ordered_paid: "Physique (commandée)",
  physical: "Physique",
};

/** Fiche complète d'un donneur, réservée aux structures et administrateurs. */
export function DonorProfileView({ id }: { id: string }) {
  const { data, isLoading, isError } = useVerifyDonor(id);
  const { data: donors } = useDonors();
  const record = donors?.find((d) => d.id === id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-16">
          <Loader2 className="text-primary size-5 animate-spin" />
          <span className="text-muted-foreground text-sm">
            Chargement de la fiche donneur
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="text-destructive size-10" />
          <div className="space-y-1">
            <p className="font-medium">Donneur introuvable</p>
            <p className="text-muted-foreground text-sm">
              Aucun profil ne correspond à cet identifiant.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/donors">Retour à l&apos;annuaire</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { donor, verification } = data;
  const fullName = record
    ? `${record.firstName} ${record.lastName}`
    : "Donneur";
  const cardLabel = donor.cardType ? CARD_LABEL[donor.cardType] : undefined;
  const physicalLabel = donor.physicalCardStatus
    ? CARD_LABEL[donor.physicalCardStatus]
    : undefined;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/donors">
          <ArrowLeft className="size-4" />
          Annuaire des donneurs
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="from-primary/15 flex flex-col gap-4 bg-linear-to-br to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={
                record
                  ? `${record.firstName[0] ?? ""}${record.lastName[0] ?? ""}`
                  : "DN"
              }
              className="size-14 text-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {fullName}
                </h1>
                {verification.isTimestampVerified ? (
                  <BadgeCheck className="text-primary size-5" />
                ) : null}
              </div>
              <p className="text-muted-foreground flex items-center gap-3 text-sm">
                {record ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {record.city}
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Inscrit le {dateFmt.format(new Date(donor.createdAt))}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary text-4xl font-bold">
              {donor.bloodType || "?"}
            </span>
            <p className="text-muted-foreground text-xs">Groupe sanguin</p>
          </div>
        </div>

        <CardContent className="flex flex-wrap items-center gap-2 p-6 pt-4">
          {verification.isTimestampVerified ? (
            <Badge variant="success">
              <Bitcoin className="size-3.5" />
              Carte authentique
            </Badge>
          ) : (
            <Badge variant="warning">
              <Clock className="size-3.5" />
              En cours de validation
            </Badge>
          )}
          {cardLabel ? (
            <Badge variant="neutral">
              <CreditCard className="size-3.5" />
              Carte {cardLabel.toLowerCase()}
            </Badge>
          ) : null}
          {record ? (
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <a href={`tel:${record.phoneNumber.replace(/\s/g, "")}`}>
                <Phone className="size-4" />
                Contacter
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Solde plateforme"
          value={`${(donor.balanceSats ?? 0).toLocaleString("fr-FR")} sats`}
        />
        <StatCard
          icon={Activity}
          label="Activités validées"
          value={String(donor.activityCount ?? 0)}
        />
        <StatCard
          icon={CreditCard}
          label="Carte physique"
          value={physicalLabel ?? "Aucune"}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Authenticité de la carte</CardTitle>
          <Droplet className="text-primary size-5" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-sm">
          {verification.isTimestampVerified ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <Bitcoin className="mt-0.5 size-5 text-amber-500" />
              <div className="space-y-1">
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  Carte authentique et confirmée
                </p>
                {verification.details ? (
                  <p className="text-muted-foreground text-xs">
                    Confirmée le{" "}
                    {dateFmt.format(
                      new Date(verification.details.timestamp * 1000),
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              La carte de ce donneur est en cours de validation.
            </p>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/verify/${donor.id}`}>Voir la preuve publique</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplet;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <Icon className="text-primary size-5" />
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
