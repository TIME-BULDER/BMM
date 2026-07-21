"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  KeyRound,
  Navigation,
  ShieldCheck,
  Smartphone,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { Select, SelectItem } from "@/components/ui/select";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCreateDonor } from "@/lib/api/hooks";
import {
  BLOOD_TYPES,
  type BloodType,
  type DonorRecord,
} from "@/lib/api/resources";
import { createDonorIdentity } from "@/lib/bitcoin/donor-identity";
import { cn } from "@/lib/utils";
import {
  MOBILE_MONEY_OPERATORS,
  type MobileMoneyOperator,
  type RewardMode,
  saveRewardPreference,
} from "@/lib/reward-preference";

type Success = { donor: DonorRecord; wif: string };

/** Télécharge la clé privée en fichier local. Aucune transmission réseau. */
function downloadKey({ donor, wif }: Success) {
  const content = [
    "Bitcoin Blood - Cle privee du donneur",
    "",
    `Donneur : ${donor.firstName} ${donor.lastName}`,
    `Identifiant : ${donor.id}`,
    `Adresse Bitcoin : ${donor.bitcoinAddress}`,
    `Cle privee (WIF) : ${wif}`,
    "",
    "Important : conservez ce fichier en lieu sur et ne le partagez avec personne.",
    "Cette cle prouve la propriete de votre profil de donneur.",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bitcoin-blood-cle-${donor.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function DonorRegistrationForm({
  variant = "public",
}: {
  variant?: "public" | "admin";
}) {
  const isAdmin = variant === "admin";
  const createDonor = useCreateDonor();
  const searchParams = useSearchParams();
  // Parrainage : `?ref=<uuid>` transmis via le lien d'un donneur existant.
  const ref = searchParams.get("ref");
  const referredById = isAdmin
    ? undefined
    : ref && UUID_RE.test(ref)
      ? ref
      : undefined;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const [rewardMode, setRewardMode] = useState<RewardMode>("mobile-money");
  const [consent, setConsent] = useState(false);
  const {
    coords,
    status: geoStatus,
    request: requestLocation,
  } = useGeolocation();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isAdmin && !consent) {
      setError(
        "Merci de confirmer votre consentement au traitement de vos données.",
      );
      return;
    }

    const form = new FormData(event.currentTarget);
    // La position est facultative : 0,0 sert uniquement à l'empreinte locale,
    // les coordonnées réelles (ou aucune) sont envoyées au serveur.
    const profile = {
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      email: String(form.get("email")),
      phoneNumber: String(form.get("phoneNumber")),
      bloodType: String(form.get("bloodType")),
      city: String(form.get("city")),
      age: Number(form.get("age")),
      latitude: coords?.latitude ?? 0,
      longitude: coords?.longitude ?? 0,
    };

    setBusy(true);
    try {
      // Génère l'identité Bitcoin (clé, empreinte, signature BIP-322) en local.
      const identity = await createDonorIdentity(profile);

      const donor = await createDonor.mutateAsync({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        password: String(form.get("password")),
        bloodType: profile.bloodType
          ? (profile.bloodType as BloodType)
          : undefined,
        city: profile.city,
        age: profile.age,
        available: true,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        bitcoinAddress: identity.bitcoinAddress,
        profileHash: identity.profileHash,
        signature: identity.signature,
        referredById,
      });

      // « Récompense Invisible » : on mémorise le canal de versement choisi
      // (Lightning ou Mobile Money via Izichange) pour l'espace donneur.
      saveRewardPreference(
        donor.id,
        rewardMode === "mobile-money"
          ? {
              mode: "mobile-money",
              operator:
                (form.get("momoOperator") as MobileMoneyOperator) || undefined,
              phone: String(form.get("momoPhone") || profile.phoneNumber),
            }
          : { mode: "lightning" },
      );

      setSuccess({ donor, wif: identity.wif });
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'inscription a échoué.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                {isAdmin
                  ? "Donneur inscrit avec succès"
                  : "Vous êtes enregistré comme donneur volontaire !"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isAdmin
                  ? "Le donneur est bien inscrit. Remettez-lui sa clé ci-dessous : elle lui servira à se connecter à son espace."
                  : "Bienvenue dans le réseau. Votre carte de donneur est prête et un email de bienvenue vient de vous être envoyé."}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <KeyRound className="size-4" />
              {isAdmin
                ? "Clé personnelle à remettre au donneur"
                : "Gardez bien votre clé personnelle"}
            </p>
            <p className="text-muted-foreground text-xs">
              {isAdmin
                ? "Elle prouve que le profil lui appartient et protège ses récompenses. Il se connecte, lui, avec son email et son mot de passe. Nous ne gardons pas la clé : téléchargez-la et remettez-la lui."
                : "Elle prouve que ce profil est bien le vôtre et protège vos récompenses. Vous, vous vous connectez avec votre email et votre mot de passe. Nous ne gardons pas cette clé : copiez-la ou téléchargez-la et conservez-la en lieu sûr."}
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-background flex-1 truncate rounded border px-2 py-1.5 font-mono text-xs">
                {success.wif}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copier la clé"
                onClick={() => navigator.clipboard?.writeText(success.wif)}
              >
                <Copy className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Télécharger la clé"
                onClick={() => downloadKey(success)}
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isAdmin ? (
              <>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setSuccess(null);
                    setConsent(false);
                  }}
                >
                  <UserPlus className="size-4" />
                  Inscrire un autre donneur
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/donors/${success.donor.id}`}>
                    <ShieldCheck className="size-4" />
                    Voir la fiche du donneur
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/donneur">Accéder à mon espace donneur</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/verify/${success.donor.id}`}>
                    <ShieldCheck className="size-4" />
                    Voir ma preuve d'intégrité
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          {referredById ? (
            <p className="border-primary/25 bg-primary/5 text-primary flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Users className="size-4 shrink-0" />
              Vous avez été parrainé - votre parrain sera crédité d'une
              activité.
            </p>
          ) : null}

          {error ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" htmlFor="firstName">
              <Input
                id="firstName"
                name="firstName"
                required
                placeholder="Carmelle"
              />
            </Field>
            <Field label="Nom" htmlFor="lastName">
              <Input
                id="lastName"
                name="lastName"
                required
                placeholder="Dossou"
              />
            </Field>
            <Field label="Groupe sanguin (optionnel)" htmlFor="bloodType">
              <Select id="bloodType" name="bloodType" defaultValue="">
                <SelectItem value="">Je ne le connais pas encore</SelectItem>
                {BLOOD_TYPES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </Select>
              <p className="text-muted-foreground text-xs">
                Laissez vide si vous ne le connaissez pas : il sera déterminé
                lors de votre premier don.
              </p>
            </Field>
            <Field label="Âge" htmlFor="age">
              <Input
                id="age"
                name="age"
                type="number"
                min={18}
                max={120}
                required
                placeholder="28"
              />
            </Field>
            <Field label="Téléphone" htmlFor="phoneNumber">
              <PhoneField id="phoneNumber" name="phoneNumber" />
            </Field>
            <Field label="Ville" htmlFor="city">
              <Input id="city" name="city" required placeholder="Cotonou" />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="vous@exemple.bj"
              />
            </Field>
            <Field label="Mot de passe" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="8 caractères minimum"
              />
            </Field>
          </div>

          {/* Mode de récompense - « la Récompense Invisible ».
              Masqué en inscription par une structure (non obligatoire ici :
              le donneur choisira son canal depuis son espace). */}
          {isAdmin ? null : (
            <div className="space-y-3">
              <Label>Comment recevoir vos récompenses ?</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <RewardModeCard
                  active={rewardMode === "mobile-money"}
                  onClick={() => setRewardMode("mobile-money")}
                  icon={<Smartphone className="size-5" />}
                  title="Mobile Money"
                  subtitle="Reçu par SMS, sur votre numéro"
                />
                <RewardModeCard
                  active={rewardMode === "lightning"}
                  onClick={() => setRewardMode("lightning")}
                  icon={<Zap className="size-5" />}
                  title="Bitcoin"
                  subtitle="Si vous avez déjà un portefeuille"
                />
              </div>

              {rewardMode === "mobile-money" ? (
                <div className="animate-rise-in grid gap-4 sm:grid-cols-2">
                  <Field label="Opérateur" htmlFor="momoOperator">
                    <Select
                      id="momoOperator"
                      name="momoOperator"
                      defaultValue="mtn"
                    >
                      {MOBILE_MONEY_OPERATORS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Numéro Mobile Money" htmlFor="momoPhone">
                    <PhoneField id="momoPhone" name="momoPhone" />
                  </Field>
                  <p className="text-muted-foreground flex items-center gap-2 text-xs sm:col-span-2">
                    <ShieldCheck className="size-3.5 shrink-0" />
                    Vous recevez votre récompense par un simple dépôt Mobile
                    Money, comme un transfert d'argent habituel.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-1.5">
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
                  : "Partager ma position (facultatif)"}
            </Button>
            <p className="text-muted-foreground text-xs">
              Facultatif. La position permet d'alerter le donneur en priorité
              quand un besoin proche survient.
            </p>
          </div>

          {isAdmin ? null : (
            <label className="text-muted-foreground flex cursor-pointer items-start gap-2.5 text-xs">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="accent-primary mt-0.5 size-4 shrink-0 rounded"
              />
              <span>
                J'autorise Bitcoin Blood à traiter mes données de santé pour
                être alerté en cas de besoin compatible, conformément à la
                réglementation sur la protection des données.
              </span>
            </label>
          )}

          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <ShieldCheck className="size-3.5 shrink-0" />
            Vos données sont protégées et vos informations médicales restent
            privées.
          </p>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy
              ? "Inscription en cours"
              : isAdmin
                ? "Inscrire le donneur"
                : "Devenir donneur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function RewardModeCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 space-y-0.5">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {badge ? (
            <span className="bg-accent/15 text-accent rounded-full px-1.5 py-0.5 text-[10px] font-medium">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-muted-foreground block text-xs leading-snug">
          {subtitle}
        </span>
      </span>
    </button>
  );
}
