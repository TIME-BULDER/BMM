"use client";

import { Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/providers/auth-provider";

/**
 * Protège l'espace applicatif: redirige vers la connexion tant que la
 * session de l'organisation n'est pas établie.
 */
export function AppGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role === "donor") {
        router.replace("/donneur");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || user?.role === "donor") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Droplet className="text-primary size-8 animate-pulse" />
        <span className="sr-only">Chargement de la session…</span>
      </div>
    );
  }

  return <>{children}</>;
}
