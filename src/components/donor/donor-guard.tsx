"use client";

import { Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/providers/auth-provider";

/**
 * Protège l'espace donneur : redirige vers la connexion donneur si personne
 * n'est connecté, et renvoie une structure/administrateur vers son tableau de
 * bord (séparation stricte des rôles). En mode démo, l'accès reste ouvert.
 */
export function DonorGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user, isDemo } = useAuth();
  const router = useRouter();

  const blocked =
    !isDemo &&
    !isLoading &&
    (!isAuthenticated ||
      user?.role === "org_admin" ||
      user?.role === "super_admin");

  useEffect(() => {
    if (isDemo || isLoading) return;
    if (!isAuthenticated) {
      router.replace("/connexion-donneur");
    } else if (user?.role === "org_admin" || user?.role === "super_admin") {
      router.replace("/dashboard");
    }
  }, [isDemo, isLoading, isAuthenticated, user, router]);

  if (!isDemo && (isLoading || blocked)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Droplet className="text-primary size-8 animate-pulse" />
        <span className="sr-only">Chargement de votre espace…</span>
      </div>
    );
  }

  return <>{children}</>;
}
