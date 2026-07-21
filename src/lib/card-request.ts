"use client";

import { useSyncExternalStore } from "react";

/**
 * Demandes de carte de donneur (photo, format, statut de validation).
 *
 * Le backend n'expose pas encore de stockage de photo ni d'endpoint de
 * validation de carte : cet état vit côté client (localStorage) pour la démo,
 * avec une mise à jour réactive dans l'onglet. Prêt à être remplacé par un
 * endpoint (voir la migration `card_requests` documentée).
 */

export type CardFormat = "physical" | "digital";
export type CardStatus = "none" | "requested" | "approved" | "rejected";

export type CardRequest = {
  donorId: string;
  donorName: string;
  bloodType?: string;
  /** Photo du donneur en data URL (redimensionnée). */
  photo?: string;
  format: CardFormat;
  status: CardStatus;
  requestedAt?: string;
  updatedAt: string;
};

const KEY = "bmm.card-requests";
const EVENT = "bmm:card-requests";

// Demandes de démonstration : peuplent l'interface admin même sans requête
// locale, pour montrer le parcours de validation.
export const DEMO_CARD_REQUESTS: CardRequest[] = [
  {
    donorId: "demo-req-1",
    donorName: "Ariel Adjovi",
    bloodType: "O-",
    format: "physical",
    status: "requested",
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    donorId: "demo-req-2",
    donorName: "Fatou Bako",
    bloodType: "A+",
    format: "digital",
    status: "requested",
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function readAll(): Record<string, CardRequest> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, CardRequest>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Quota / mode privé : on ignore.
  }
}

export function loadCardRequest(donorId: string): CardRequest | null {
  return readAll()[donorId] ?? null;
}

export function upsertCardRequest(
  patch: Partial<CardRequest> & { donorId: string },
): void {
  const map = readAll();
  const base = { ...map[patch.donorId], ...patch };
  map[patch.donorId] = {
    ...base,
    donorName: base.donorName ?? "",
    format: base.format ?? "digital",
    status: base.status ?? "none",
    updatedAt: new Date().toISOString(),
  };
  writeAll(map);
}

export function setCardStatus(donorId: string, status: CardStatus): void {
  const map = readAll();
  const current = map[donorId];
  if (current) {
    map[donorId] = { ...current, status, updatedAt: new Date().toISOString() };
    writeAll(map);
  }
}

function snapshot(): CardRequest[] {
  return Object.values(readAll()).sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1,
  );
}

let cache: CardRequest[] = [];
let cacheKey = "";
function getServerSnapshot(): CardRequest[] {
  return cache;
}
function getSnapshot(): CardRequest[] {
  const next = snapshot();
  const key = JSON.stringify(next);
  if (key !== cacheKey) {
    cache = next;
    cacheKey = key;
  }
  return cache;
}
function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Liste réactive de toutes les demandes de carte (interface admin). */
export function useCardRequests(): CardRequest[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Demande de carte d'un donneur donné (réactive). */
export function useCardRequest(donorId: string): CardRequest | null {
  const all = useCardRequests();
  return all.find((r) => r.donorId === donorId) ?? null;
}

/**
 * Charge une image, la recadre en carré et la compresse en data URL pour
 * rester légère (photo d'identité de la carte).
 */
export function fileToPhotoDataUrl(file: File, size = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible."));
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
