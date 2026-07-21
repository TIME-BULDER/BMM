"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ComponentType } from "react";

import { toast, useToasts, type ToastVariant } from "@/lib/toast";
import { cn } from "@/lib/utils";

const meta: Record<
  ToastVariant,
  { icon: ComponentType<{ className?: string }>; accent: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    accent: "text-destructive",
  },
  info: {
    icon: Info,
    accent: "text-primary",
  },
};

/**
 * Pile de notifications, ancrée en bas (mobile) / bas-droite (desktop).
 * Montée une fois dans la mise en page racine.
 */
export function Toaster() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
      {toasts.map((t) => {
        const { icon: Icon, accent } = meta[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className="animate-in slide-in-from-bottom-4 fade-in bg-background/95 pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur duration-300"
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              aria-label="Fermer"
              className="text-muted-foreground hover:text-foreground -mt-0.5 shrink-0 cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
