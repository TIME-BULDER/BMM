"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { toast } from "@/lib/toast";

/** Message de succès facultatif porté par une mutation. */
type MutationMeta = { success?: string };

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Notifications centralisées : toute action échouée affiche une alerte
        // d'erreur ; les succès sont annoncés via `meta: { success: "..." }`.
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(
              error instanceof Error && error.message
                ? error.message
                : "Une erreur est survenue. Réessayez.",
            );
          },
          onSuccess: (_data, _vars, _ctx, mutation) => {
            const message = (mutation.meta as MutationMeta | undefined)
              ?.success;
            if (message) toast.success(message);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
