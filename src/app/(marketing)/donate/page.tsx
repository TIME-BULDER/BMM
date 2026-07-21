import { Bell, Droplet, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { DonorRegistrationForm } from "@/components/donate/donor-registration-form";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Devenir donneur",
  description:
    "Inscrivez-vous comme donneur de sang volontaire. Profil signé et ancré sur Bitcoin.",
};

const BENEFITS = [
  {
    icon: Bell,
    title: "Alerté uniquement si vous êtes utile",
    text: "Vous n'êtes sollicité qu'en cas de besoin compatible avec votre groupe sanguin, près de chez vous.",
  },
  {
    icon: Smartphone,
    title: "Récompensé simplement",
    text: "Recevez votre récompense directement sur votre Mobile Money, par un simple dépôt, sans rien à installer.",
  },
  {
    icon: ShieldCheck,
    title: "Une carte de confiance",
    text: "Votre carte de donneur ne peut pas être falsifiée et vos informations médicales restent privées.",
  },
  {
    icon: MapPin,
    title: "Un réseau panafricain",
    text: "Rejoignez une communauté de donneurs qui répond aux urgences vitales en moins d'une heure.",
  },
];

export default function DonatePage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Volet valeur - reste visible pendant le remplissage du formulaire. */}
        <div className="animate-rise-in space-y-8 lg:sticky lg:top-28">
          <div className="space-y-4">
            <Badge variant="primary">
              <Droplet className="size-3.5" />
              Réseau panafricain du don
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Devenez donneur,{" "}
              <span className="text-primary">sauvez des vies</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-lg text-balance">
              Quelques minutes pour rejoindre le réseau. Votre geste peut sauver
              jusqu'à trois vies à chaque don.
            </p>
          </div>

          <ul className="space-y-5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <b.icon className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium">{b.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {b.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground text-sm">
            Déjà donneur ?{" "}
            <Link
              href="/connexion-donneur"
              className="text-primary font-medium hover:underline"
            >
              Accéder à mon espace
            </Link>
          </p>
        </div>

        {/* Volet action - formulaire d'inscription. */}
        <div className="animate-rise-in [animation-delay:120ms]">
          <Suspense fallback={null}>
            <DonorRegistrationForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
