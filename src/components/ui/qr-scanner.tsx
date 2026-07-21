"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Dialog } from "@/components/ui/dialog";

/**
 * Scanner de QR code par la caméra (mobile et desktop). Ouvre la caméra dans
 * une modale et renvoie le contenu décodé via `onResult`.
 */
export function QrScanner({
  open,
  onClose,
  onResult,
  title = "Scanner un QR code",
  description = "Placez le QR code de la carte devant la caméra.",
}: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  title?: string;
  description?: string;
}) {
  const regionId = "qr-reader-" + useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  // Réf pour éviter de déclencher plusieurs résultats sur un même scan.
  const handled = useRef(false);

  useEffect(() => {
    if (!open) return;
    handled.current = false;
    // Réinitialisation à l'ouverture (reset volontaire lié à `open`).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(regionId);
        scanner = instance as unknown as {
          stop: () => Promise<void>;
          clear: () => void;
        };
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => {
            if (handled.current) return;
            handled.current = true;
            onResult(decodedText);
            instance
              .stop()
              .then(() => instance.clear())
              .catch(() => {});
            onClose();
          },
          () => {},
        );
      } catch {
        if (!cancelled) {
          setError(
            "Impossible d'accéder à la caméra. Autorisez l'accès ou saisissez le code à la main.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner?.clear())
          .catch(() => {});
      }
    };
  }, [open, regionId, onResult, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        <div
          id={regionId}
          className="overflow-hidden rounded-lg border [&_video]:w-full"
        />
      )}
    </Dialog>
  );
}
