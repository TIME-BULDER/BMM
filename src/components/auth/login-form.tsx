"use client";

import { AlertCircle, Droplet, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/api/hooks";
import { authApi } from "@/lib/api/resources";

export function LoginForm() {
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
      // Espace structures : un donneur qui se trompe d'espace est redirigé.
      try {
        const me = await authApi.me();
        if (me.data.role === "donor") {
          setWrongSpace(true);
          return;
        }
      } catch {
        // Profil indisponible (mode démo) : on poursuit normalement.
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    }
  }

  if (wrongSpace) {
    return (
      <div className="space-y-5 text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
          <Droplet className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Vous êtes un donneur</h2>
          <p className="text-muted-foreground text-sm">
            Ce compte est un compte donneur. Connectez-vous depuis l&apos;espace
            donneur pour suivre vos dons et vos récompenses.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/connexion-donneur">Aller à l&apos;espace donneur</Link>
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
    <form className="space-y-5" onSubmit={onSubmit}>
      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <AuthField
        label="Email professionnel"
        icon={Mail}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="contact@hopital.bj"
      />
      <PasswordField
        name="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        hint={
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Mot de passe oublié ?
          </Link>
        }
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
  );
}
