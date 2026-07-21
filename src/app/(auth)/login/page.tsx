import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { AuthTabs } from "@/components/auth/auth-tabs";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <AuthTabs />

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-muted-foreground text-sm">
          Connectez votre structure pour piloter urgences et campagnes.
        </p>
      </div>

      <LoginForm />

      <p className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
        <ShieldCheck className="size-3.5" />
        Connexion chiffrée · dons ancrés sur Bitcoin
      </p>
    </div>
  );
}
