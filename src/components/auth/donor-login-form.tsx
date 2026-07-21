"use client";

import { AlertCircle, Building2, Droplet, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/api/hooks";
import { authApi } from "@/lib/api/resources";

export function DonorLoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const [wrongSpace, setWrongSpace] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWrongSpace(false);
    const form = new FormData(event.currentTarget);
    try {
      await login.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      // Espace donneur : une structure qui se trompe d'espace est redirigée.
      // Les administrateurs (super_admin) sont dirigés vers leur tableau de bord.
      try {
        const me = await authApi.me();
        if (me.data.role === "org_admin") {
          setWrongSpace(true);
          return;
        }
        if (me.data.role === "super_admin") {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Profil indisponible (mode démo) : on poursuit normalement.
      }
      router.replace("/donneur");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    }
  }

  if (wrongSpace) {
    return (
      <div className="space-y-5 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
          <Building2 className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Vous êtes une structure de santé
          </h2>
          <p className="text-muted-foreground text-sm">
            Ce compte est un compte structure. Connectez-vous depuis
            l&apos;espace structures pour piloter vos alertes et vos donneurs.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Aller à l&apos;espace structures</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => setWrongSpace(false)}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <span className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
          <Droplet className="size-4" />
          Espace donneur
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Se connecter</h1>
        <p className="text-muted-foreground text-sm">
          Suivez vos dons et vos récompenses Lightning.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <AuthField
          label="Email"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vous@exemple.bj"
        />
        <PasswordField
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={login.isPending}
        >
          {login.isPending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Pas encore donneur ?{" "}
        <Link
          href="/donate"
          className="text-primary font-medium hover:underline"
        >
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
