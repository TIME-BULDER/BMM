"use client";

import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type QrBadgeProps = {
  /** Contenu encodé dans le QR (URL, adresse Bitcoin…). */
  value: string;
  /** Titre affiché sous le QR. */
  label: string;
  /** Texte court affiché (souvent une version tronquée du contenu). */
  caption?: string;
  /** Affiche un bouton de copie du contenu brut. */
  copyable?: boolean;
  size?: number;
  className?: string;
};

/**
 * Carte QR réutilisable: encode une valeur dans un QR scannable (fond blanc
 * pour rester lisible en thème sombre) avec un libellé et une copie optionnelle.
 */
export function QrBadge({
  value,
  label,
  caption,
  copyable = false,
  size = 132,
  className,
}: QrBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible: on ignore */
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border p-4 text-center",
        className,
      )}
    >
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG
          value={value}
          size={size}
          // Niveau H (correction d'erreur max) pour rester scannable malgré
          // le logo incrusté au centre.
          level="H"
          marginSize={0}
          imageSettings={{
            // Icône carrée pour rester nette et non déformée au centre du QR.
            src: "/icons/icon-192.png",
            height: Math.round(size * 0.22),
            width: Math.round(size * 0.22),
            excavate: true,
          }}
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        {caption ? (
          <p className="text-muted-foreground font-mono text-xs break-all">
            {caption}
          </p>
        ) : null}
      </div>
      {copyable ? (
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Copié
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copier
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
