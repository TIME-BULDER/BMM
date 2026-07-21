"use client";

import { Droplet, ShieldCheck, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { cn } from "@/lib/utils";

/**
 * Carte de donneur au format carte d'identité (recto). Utilisée à l'écran
 * (espace donneur) comme à l'impression (validation physique par l'admin).
 */
export function DonorCard({
  name,
  bloodType,
  donorId,
  city,
  photo,
  verifyUrl,
  className,
}: {
  name: string;
  bloodType?: string;
  donorId: string;
  city?: string;
  photo?: string;
  verifyUrl: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-2xl text-white shadow-xl",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, #7a0f1a 0%, #b91c2b 45%, #7a0f1a 100%)",
      }}
    >
      {/* Motif décoratif */}
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-black/20 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between p-5">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="size-5" />
            <span className="text-sm font-semibold tracking-wide">
              Bitcoin Blood
            </span>
          </div>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
            Carte de donneur
          </span>
        </div>

        {/* Corps */}
        <div className="flex items-center gap-4">
          <div className="size-20 shrink-0 overflow-hidden rounded-xl border-2 border-white/70 bg-white/10">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <User className="size-8 text-white/70" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg leading-tight font-semibold">
              {name}
            </p>
            {city ? (
              <p className="truncate text-xs text-white/80">{city}</p>
            ) : null}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1">
              <Droplet className="size-3.5" />
              <span className="text-sm font-bold">
                {bloodType || "Groupe à confirmer"}
              </span>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-white p-1.5">
            <QRCodeSVG value={verifyUrl} size={68} level="M" marginSize={0} />
          </div>
        </div>

        {/* Pied */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-wider text-white/70 uppercase">
              Identifiant
            </p>
            <p className="font-mono text-[11px] tracking-tight">
              {donorId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/80">
            <ShieldCheck className="size-3.5" />
            Vérifiable en ligne
          </div>
        </div>
      </div>
    </div>
  );
}
