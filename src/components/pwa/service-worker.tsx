"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker pour rendre l'application installable (PWA)
 * et fournir un repli hors-ligne. L'échec d'enregistrement est silencieux:
 * l'app reste pleinement fonctionnelle sans service worker.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
