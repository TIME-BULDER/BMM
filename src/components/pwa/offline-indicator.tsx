"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Bandeau discret signalant la perte de connexion. Rassure le personnel
 * hospitalier lors des micro-coupures fréquentes : la vérification de carte
 * hors-ligne (BIP-322) reste disponible même sans réseau.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="animate-rise-in fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950 shadow-lg"
    >
      <WifiOff className="size-4 shrink-0" />
      Hors-ligne - la vérification de carte reste disponible localement.
    </div>
  );
}
