"use client";

import {
  BadgeCheck,
  Bitcoin,
  CalendarClock,
  CheckCircle2,
  Droplet,
  Gift,
  History,
  KeyRound,
  LogIn,
  MapPin,
  ScanLine,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BalanceCard } from "@/components/donor/balance-card";
import { DonorCardSection } from "@/components/donor/donor-card-section";
import { OfflineIdentityCard } from "@/components/donor/offline-identity-card";
import { QrBadge } from "@/components/donor/qr-badge";
import { ReferralCard } from "@/components/donor/referral-card";
import { RewardChannelCard } from "@/components/donor/reward-channel-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { Select, SelectItem } from "@/components/ui/select";
import {
  useDonorDonations,
  useDonorProfile,
  useDonorRewardsList,
  useUpdateDonorProfile,
} from "@/lib/api/hooks";
import type { DonationComponent } from "@/lib/dev/demo";
import { publicUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

/** Tronque une longue chaîne au milieu (adresse, hash) pour l'affichage. */
function truncateMiddle(value: string, head = 10, tail = 6) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const rarityBadge: Record<string, "neutral" | "warning" | "danger"> = {
  Commun: "neutral",
  Rare: "warning",
  "Très rare": "danger",
};

export function DonorSpace() {
  const { data: donor, isLoading, isError } = useDonorProfile();
  const { data: donations = [] } = useDonorDonations();
  const { data: rewards = [] } = useDonorRewardsList(donor?.id);
  const update = useUpdateDonorProfile();

  const [availableOverride, setAvailableOverride] = useState<boolean | null>(
    null,
  );
  const [preferredOverride, setPreferredOverride] =
    useState<DonationComponent | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24">
        <Droplet className="text-primary size-6 animate-pulse" />
        <span className="text-muted-foreground text-sm">
          Chargement de votre espace…
        </span>
      </div>
    );
  }

  if (isError || !donor) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <LogIn className="text-muted-foreground size-10" />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Connectez-vous</h1>
            <p className="text-muted-foreground text-sm">
              Accédez à votre espace donneur pour suivre vos dons et
              récompenses.
            </p>
          </div>
          <Button asChild>
            <Link href="/connexion-donneur">Se connecter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const available = availableOverride ?? donor.available;
  const preferred = preferredOverride ?? donor.preferredDonation;
  const rewardTotal = rewards
    .filter((r) => r.status === "Envoyée")
    .reduce((sum, r) => sum + r.sats, 0);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!donor) return;
    const form = new FormData(event.currentTarget);
    await update
      .mutateAsync({
        id: donor.id,
        phoneNumber: String(form.get("phone")),
        email: String(form.get("email")),
        city: String(form.get("city")),
        available,
      })
      .catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* En-tête profil */}
      <Card className="overflow-hidden">
        <div className="from-primary/15 flex flex-col gap-4 bg-gradient-to-br to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={`${donor.firstName[0]}${donor.lastName[0]}`}
              className="size-14 text-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {donor.firstName} {donor.lastName}
                </h1>
                {donor.verified ? (
                  <BadgeCheck className="text-primary size-5" />
                ) : null}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin className="size-3.5" />
                {donor.city}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary text-4xl font-bold">
              {donor.bloodType}
            </span>
            <p className="text-muted-foreground font-mono text-xs">
              {donor.phenotype}
            </p>
          </div>
        </div>

        <CardContent className="flex flex-wrap items-center gap-2 p-6 pt-4">
          <Badge variant={rarityBadge[donor.rarity]}>
            <Sparkles className="size-3.5" />
            Phénotype {donor.rarity.toLowerCase()}
          </Badge>
          {donor.cmvNegative ? (
            <Badge variant="success">CMV négatif</Badge>
          ) : null}
          <Badge
            variant={
              donor.eligibility.status === "éligible" ? "success" : "warning"
            }
          >
            {donor.eligibility.status === "éligible"
              ? "Éligible au don"
              : `Ajourné jusqu'au ${dateFmt.format(new Date(donor.eligibility.nextEligibleDate))}`}
          </Badge>
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href={`/verify/${donor.id}`}>
              <ScanLine className="size-4" />
              Ouvrir ma preuve
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Droplet}
          label="Dons réalisés"
          value={String(donor.totalDonations)}
        />
        <StatCard
          icon={Zap}
          label="Sats gagnés"
          value={rewardTotal.toLocaleString("fr-FR")}
        />
        <StatCard
          icon={CalendarClock}
          label="Dernier don"
          value={dateFmt.format(new Date(donor.lastDonation))}
        />
      </div>

      {/* Cartes fonctionnelles en disposition masonry pleine largeur. */}
      <div className="gap-6 *:mb-6 *:break-inside-avoid xl:columns-2">
        {/* Ma carte de donneur - QR codes à faire scanner */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Ma carte de donneur</CardTitle>
            <ScanLine className="text-primary size-5" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground mb-4 text-sm">
              Faites scanner ces QR codes en centre de don pour prouver votre
              identité. Vos informations sensibles ne sont jamais partagées.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <QrBadge
                value={publicUrl(`/verify/${donor.id}`)}
                label="Ma preuve de donneur"
                caption={truncateMiddle(donor.id, 8, 6)}
              />
              <QrBadge
                value={donor.bitcoinAddress}
                label="Mon identifiant de récompense"
                caption={truncateMiddle(donor.bitcoinAddress)}
                copyable
              />
            </div>
            <p className="text-muted-foreground mt-4 flex items-center gap-1.5 text-xs">
              <KeyRound className="size-3.5" />
              Gardez bien la clé téléchargée à votre inscription : elle prouve
              que ce profil est le vôtre. Vous vous connectez avec votre email
              et votre mot de passe.
            </p>
          </CardContent>
        </Card>

        {/* Informations modifiables */}
        <Card>
          <CardHeader>
            <CardTitle>Mes informations</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-5">
              {saved ? (
                <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Informations mises à jour.
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <PhoneField
                    id="phone"
                    name="phone"
                    defaultValue={donor.phoneNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={donor.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" defaultValue={donor.city} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred">Don préféré</Label>
                  <Select
                    id="preferred"
                    value={preferred}
                    onValueChange={(v) =>
                      setPreferredOverride(v as DonationComponent)
                    }
                  >
                    <SelectItem value="Sang total">Sang total</SelectItem>
                    <SelectItem value="Plasma">Plasma</SelectItem>
                    <SelectItem value="Plaquettes">Plaquettes</SelectItem>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Disponible pour un don</p>
                  <p className="text-muted-foreground text-xs">
                    Vous ne serez alerté qu'en cas de besoin compatible proche.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={available}
                  onClick={() => setAvailableOverride(!available)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                    available ? "bg-primary" : "bg-input",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white transition-transform",
                      available ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Historique des dons */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Historique de mes dons</CardTitle>
            <History className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {donations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                    <Droplet className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {d.component} · {d.volumeMl} ml
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {d.centerName}, {d.city} ·{" "}
                      {dateFmt.format(new Date(d.date))}
                    </p>
                  </div>
                </div>
                <Badge variant="success">{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Solde plateforme + retrait autonome vers Mobile Money */}
        <BalanceCard
          balanceSats={donor.balanceSats}
          defaultPhone={donor.phoneNumber}
        />

        {/* Ma carte de donneur (photo + demande + validation admin) */}
        <DonorCardSection
          donor={{
            id: donor.id,
            firstName: donor.firstName,
            lastName: donor.lastName,
            bloodType: donor.bloodType,
            city: donor.city,
          }}
        />

        {/* Parrainage */}
        <ReferralCard donorId={donor.id} />

        {/* Identité sanguine hors-ligne - attestation BIP-322 */}
        <OfflineIdentityCard donorId={donor.id} bloodType={donor.bloodType} />

        {/* Canal de récompense - Mobile Money (Izichange) ou Lightning */}
        <RewardChannelCard
          donorId={donor.id}
          defaultPhone={donor.phoneNumber}
        />

        {/* Récompenses */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes récompenses</CardTitle>
            <Gift className="size-5 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <Bitcoin className="size-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {rewardTotal.toLocaleString("fr-FR")}{" "}
                  <span className="text-base font-medium">sats</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Gagnés grâce à vos dons
                </p>
              </div>
            </div>

            {rewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Zap className="size-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {dateFmt.format(new Date(r.date))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    +{r.sats.toLocaleString("fr-FR")} sats
                  </p>
                  <Badge variant="success">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
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
