"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/api/hooks";

/** Déconnecte le donneur puis le renvoie à l'accueil public. */
export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  async function onLogout() {
    await logout.mutateAsync().catch(() => {});
    router.replace("/");
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onLogout}
      disabled={logout.isPending}
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Se déconnecter</span>
    </Button>
  );
}
