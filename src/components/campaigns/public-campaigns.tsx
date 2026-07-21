"use client";

import {
  CalendarClock,
  Check,
  Droplet,
  HandHeart,
  Loader2,
  MapPin,
  Target,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Suspense, useState } from "react";

import { CampaignCountdown } from "@/components/campaigns/campaign-countdown";
import { DonorRegistrationForm } from "@/components/donate/donor-registration-form";
import { QrBadge } from "@/components/donor/qr-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDonation } from "@/lib/api/hooks";
import type { DonationInvoice } from "@/lib/api/resources";
import {
  upcomingCampaigns,
  type UpcomingCampaign,
} from "@/lib/campaigns/upcoming";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function PublicCampaigns() {
  const [supportOf, setSupportOf] = useState<UpcomingCampaign | null>(null);
  const [registerFor, setRegisterFor] = useState<UpcomingCampaign | null>(null);

  return (
    <div className="space-y-6">
      {upcomingCampaigns.map((campaign) => (
        <Card key={campaign.id} className="overflow-hidden">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">À venir</Badge>
                  {campaign.bloodTypes.map((b) => (
                    <Badge key={b} variant="neutral">
                      <Droplet className="size-3" />
                      {b}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {campaign.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Organisée par {campaign.organizer}
                </p>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {campaign.description}
              </p>

              <div className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4 shrink-0" />
                  {dateFmt.format(new Date(campaign.startsAt))}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0" />
                  {campaign.address}
                </span>
                <span className="flex items-center gap-2">
                  <Target className="size-4 shrink-0" />
                  Objectif : {campaign.goalDonors} donneurs
                </span>
                <span className="flex items-center gap-2">
                  <Users className="size-4 shrink-0" />
                  {campaign.registered} inscrits
                </span>
              </div>
            </div>

            <div className="bg-muted/30 flex flex-col justify-between gap-4 rounded-xl border p-5">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Début dans</p>
                <CampaignCountdown startsAt={campaign.startsAt} />
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setRegisterFor(campaign)}>
                  <UserPlus className="size-4" />
                  S'inscrire à la collecte
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSupportOf(campaign)}
                >
                  <HandHeart className="size-4" />
                  Soutenir cette campagne
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={!!supportOf}
        onClose={() => setSupportOf(null)}
        title={supportOf ? `Soutenir : ${supportOf.title}` : ""}
        description="Votre don finance directement cette collecte."
      >
        {supportOf ? <CampaignSupport campaign={supportOf} /> : null}
      </Dialog>

      <Dialog
        open={!!registerFor}
        onClose={() => setRegisterFor(null)}
        title={registerFor ? `S'inscrire : ${registerFor.title}` : ""}
        description="Rejoignez cette collecte, que vous soyez déjà donneur ou non."
        className="max-w-xl"
      >
        {registerFor ? (
          <CampaignRegister
            campaign={registerFor}
            onClose={() => setRegisterFor(null)}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

function CampaignRegister({
  campaign,
  onClose,
}: {
  campaign: UpcomingCampaign;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"choice" | "existing" | "new">("choice");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (step === "choice") {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Êtes-vous déjà inscrit comme donneur ?
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStep("existing")}
            className="hover:border-primary/40 hover:bg-muted/40 flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all"
          >
            <span className="flex items-center gap-2 font-medium">
              <UserCheck className="text-primary size-4" />
              Je suis déjà donneur
            </span>
            <span className="text-muted-foreground text-xs">
              Recevez les détails de la collecte par email.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStep("new")}
            className="hover:border-primary/40 hover:bg-muted/40 flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all"
          >
            <span className="flex items-center gap-2 font-medium">
              <UserPlus className="text-primary size-4" />
              Je suis nouveau
            </span>
            <span className="text-muted-foreground text-xs">
              Inscrivez-vous comme donneur en quelques minutes.
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "existing") {
    if (sent) {
      return (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Check className="size-6" />
          </div>
          <p className="text-sm">
            Merci ! Nous vous enverrons par email les détails de la collecte «{" "}
            {campaign.title} ».
          </p>
          <Button className="w-full" onClick={onClose}>
            Fermer
          </Button>
        </div>
      );
    }
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) setSent(true);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="camp-email">Votre email de donneur</Label>
          <Input
            id="camp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.bj"
          />
        </div>
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("choice")}
          >
            Retour
          </Button>
          <Button type="submit">M'inscrire à la collecte</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setStep("choice")}
      >
        Retour
      </Button>
      <Suspense fallback={null}>
        <DonorRegistrationForm variant="public" />
      </Suspense>
    </div>
  );
}

const PRESETS = [2_100, 10_000, 21_000, 100_000];

function truncateMiddle(value: string, head = 14, tail = 10) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function CampaignSupport({ campaign }: { campaign: UpcomingCampaign }) {
  const create = useCreateDonation();
  const [amount, setAmount] = useState(21_000);
  const [invoice, setInvoice] = useState<DonationInvoice | null>(null);

  async function onSupport() {
    const result = await create.mutateAsync({
      amountSats: amount,
      purpose: "campaign",
      message: `Soutien à la campagne : ${campaign.title} (${campaign.city})`,
    });
    setInvoice(result);
  }

  if (invoice) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Merci ! Scannez pour envoyer{" "}
          {invoice.amountSats.toLocaleString("fr-FR")} sats à la collecte.
        </p>
        <div className="flex justify-center">
          <QrBadge
            value={invoice.bolt11}
            label="Paiement Bitcoin"
            caption={truncateMiddle(invoice.bolt11)}
            copyable
            size={168}
          />
        </div>
        <Button variant="outline" onClick={() => setInvoice(null)}>
          Faire un autre don
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={
              amount === preset
                ? "border-primary bg-primary/10 text-primary rounded-md border px-2 py-2 text-sm font-medium"
                : "hover:bg-accent rounded-md border px-2 py-2 text-sm transition-colors"
            }
          >
            {preset.toLocaleString("fr-FR")}
          </button>
        ))}
      </div>
      <Button
        className="w-full"
        onClick={onSupport}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wallet className="size-4" />
        )}
        {create.isPending ? "Génération..." : "Soutenir la collecte"}
      </Button>
    </div>
  );
}
