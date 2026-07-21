"use client";

import { useSyncExternalStore } from "react";

/**
 * Solde du compte d'approvisionnement d'une structure, côté démo.
 *
 * En mode réel, le solde vient du profil (`organization.balanceSats`) et les
 * variations passent par l'API. En démo, on mémorise une variation nette
 * (rechargements moins débits) appliquée au solde de base, de façon réactive.
 */

const KEY = "bmm.org-balance-delta";
const EVENT = "bmm:org-balance";

function readDelta(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

function writeDelta(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, String(value));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Ignoré (mode privé / quota).
  }
}

export function rechargeDemoBalance(amount: number) {
  writeDelta(readDelta() + amount);
}

export function debitDemoBalance(amount: number) {
  writeDelta(readDelta() - amount);
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Variation nette du solde en démo (réactive). */
export function useDemoBalanceDelta(): number {
  return useSyncExternalStore(
    subscribe,
    () => readDelta(),
    () => 0,
  );
}
