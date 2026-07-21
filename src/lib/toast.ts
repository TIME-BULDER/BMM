"use client";

import { useSyncExternalStore } from "react";

/**
 * Notifications (toasts) de la plateforme.
 *
 * Store réactif minimal, sans dépendance externe. Les erreurs de toutes les
 * actions sont notifiées automatiquement via le MutationCache de React Query
 * (voir le fournisseur de requêtes) ; les succès sont déclarés au cas par cas
 * avec `meta: { success: "..." }` sur la mutation, ou via `toast.success(...)`.
 */

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

const DURATION = 4500;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(variant: ToastVariant, message: string) {
  const text = message.trim();
  if (!text) return;
  const id = nextId++;
  toasts = [...toasts, { id, variant, message: text }];
  emit();
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismiss(id), DURATION);
  }
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
  dismiss,
};

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Liste réactive des toasts affichés. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => EMPTY,
  );
}

const EMPTY: Toast[] = [];
