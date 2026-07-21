import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { AuthTabs } from "@/components/auth/auth-tabs";
import { OrganizationRegisterForm } from "@/components/auth/organization-register-form";

export const metadata: Metadata = { title: "Inscription structure" };

export default function RegisterPage() {
  return (
    <div className="space-y-7">
      <AuthTabs />

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Inscrire une structure
        </h1>
        <p className="text-muted-foreground text-sm">
          Hôpital, ONG ou centre de collecte : rejoignez le réseau et mobilisez
          les donneurs en quelques secondes.
        </p>
      </div>

      <OrganizationRegisterForm />

      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        Vous êtes un particulier ?{" "}
        <a href="/donate" className="text-primary font-medium hover:underline">
          Devenez donneur ici
        </a>
        . <ShieldCheck className="inline size-3.5 align-text-bottom" /> Vos
        données restent protégées.
      </p>
    </div>
  );
}
