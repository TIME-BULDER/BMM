import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { OfflineVerifyTool } from "@/components/verify/offline-verify-tool";
import { VerifyPanel } from "@/components/verify/verify-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Carte de donneur souveraine",
  description: "Vérifiez l'intégrité d'un profil donneur ancré sur Bitcoin.",
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="py-16 sm:py-24">
      <div className="space-y-10">
        <div className="animate-rise-in max-w-2xl space-y-3">
          <Badge variant="primary">
            <ShieldCheck className="size-3.5" />
            Carte vérifiée
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Votre carte de donneur
          </h1>
          <p className="text-muted-foreground text-sm">
            Vérifiez en un instant que cette carte est authentique et n'a pas
            été modifiée.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <VerifyPanel id={id} />
            <OfflineVerifyTool defaultMessage={id} />
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src="/bitcoin-verified.png"
                    alt="Badge Vérifié par Bitcoin"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Carte certifiée</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Cette carte de donneur est authentique et sa validité peut
                    être vérifiée par n'importe qui, à tout moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-6">
              <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed p-4">
                <div className="relative size-48 rounded-lg bg-white p-2 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(id)}`}
                    alt="Code QR du donneur"
                    className="size-full object-contain"
                  />
                </div>
                <p className="text-muted-foreground mt-3 max-w-full truncate font-mono text-xs">
                  ID: {id}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Comment ça marche</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Les centres de don et hôpitaux scannent ce QR code pour
                    confirmer votre groupe sanguin et que votre carte est bien
                    la vôtre, sans jamais voir vos informations privées.
                  </p>
                </div>

                <div className="space-y-1 border-t pt-4">
                  <h3 className="text-base font-semibold">
                    Une carte inviolable
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Chaque don est enregistré de façon permanente. Personne ne
                    peut modifier votre carte ou vos données après coup :
                    l'historique reste fiable et vérifiable dans le temps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
