"use client";

import { Check, Copy, Gift, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publicUrl } from "@/lib/url";

/**
 * Parrainage : le donneur partage son lien d'invitation. Chaque nouveau
 * donneur inscrit via ce lien enregistre une activité de parrainage à son
 * crédit (compte pour l'obtention de la carte au mérite).
 */
export function ReferralCard({ donorId }: { donorId: string }) {
  const [copied, setCopied] = useState(false);
  const link = publicUrl(`/donate?ref=${donorId}`);

  function copy() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="text-primary size-5" />
          Parrainez des donneurs
        </CardTitle>
        <Gift className="size-5 text-amber-500" />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-muted-foreground text-sm">
          Invitez vos proches à rejoindre le réseau. Chaque inscription via
          votre lien compte comme une activité - de quoi obtenir votre carte
          physique au mérite plus vite.
        </p>
        <div className="flex items-center gap-2">
          <Input readOnly value={link} className="font-mono text-xs" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Copier le lien de parrainage"
            onClick={copy}
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
