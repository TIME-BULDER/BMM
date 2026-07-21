import { CalendarHeart } from "lucide-react";
import type { Metadata } from "next";

import { PublicCampaigns } from "@/components/campaigns/public-campaigns";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Campagnes à venir",
  description:
    "Découvrez les prochaines collectes de sang, inscrivez-vous ou soutenez-les.",
};

export default function CampagnesPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="animate-rise-in mb-10 max-w-2xl space-y-3">
        <Badge variant="primary">
          <CalendarHeart className="size-3.5" />
          Collectes à venir
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Les prochaines campagnes de don
        </h1>
        <p className="text-muted-foreground">
          Inscrivez-vous pour donner, ou soutenez financièrement une collecte
          avant son démarrage. Le compte à rebours indique le temps restant
          avant le début de chaque campagne.
        </p>
      </div>

      <PublicCampaigns />
    </Container>
  );
}
