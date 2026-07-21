import { HandHeart, HeartHandshake, Siren, Wrench, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { DonationForm } from "@/components/donate/donation-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Soutenir la plateforme",
  description:
    "Soutenez le fonctionnement de Bitcoin Blood. Pour aider une collecte précise, rendez-vous sur la page des campagnes.",
};

const ALLOCATION = [
  {
    icon: Wrench,
    title: "Fonctionnement de la plateforme",
    text: "Hébergement, développement continu et sécurité du service.",
  },
  {
    icon: Siren,
    title: "Fonds d'urgence",
    text: "Récompenses immédiates pour les donneurs qui répondent aux alertes vitales.",
  },
  {
    icon: HandHeart,
    title: "Animation du réseau",
    text: "Support aux structures, cartes de donneurs et actions de terrain.",
  },
];

export default function SupportPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="animate-rise-in space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <Badge variant="primary">
              <HeartHandshake className="size-3.5" />
              Soutien communautaire
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Soutenez <span className="text-primary">Bitcoin Blood</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-lg text-balance">
              Votre don en sats finance directement le réseau. Paiement
              instantané via Lightning, sans intermédiaire ni frais bancaires.
            </p>
          </div>

          <div className="space-y-5">
            {ALLOCATION.map((a) => (
              <div key={a.title} className="flex gap-4">
                <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <a.icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {a.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-accent/25 bg-accent/5 flex items-center gap-3 rounded-xl border p-4">
            <Zap className="text-accent size-5 shrink-0" />
            <p className="text-muted-foreground text-sm">
              Paiement instantané et sans intermédiaire : votre don part
              directement au réseau.
            </p>
          </div>

          <p className="text-muted-foreground text-sm">
            Vous souhaitez aider une collecte précise ?{" "}
            <Link
              href="/campagnes"
              className="text-primary font-medium hover:underline"
            >
              Découvrez les campagnes à venir
            </Link>
            .
          </p>
        </div>

        <div className="animate-rise-in [animation-delay:120ms]">
          <DonationForm />
        </div>
      </div>
    </Container>
  );
}
