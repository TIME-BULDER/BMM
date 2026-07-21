"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { AUTH_BYPASS } from "@/lib/dev/demo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    try {
      if (!AUTH_BYPASS) {
        const supabase = createSupabaseBrowserClient();
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
      }
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Lien expiré ou invalide. Redemandez un email.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Mot de passe mis à jour
          </h1>
          <p className="text-muted-foreground text-sm">
            Redirection vers la connexion…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Nouveau mot de passe
        </h1>
        <p className="text-muted-foreground text-sm">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {error ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <PasswordField
          name="password"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          required
          placeholder="8 caractères minimum"
        />
        <PasswordField
          name="confirm"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          required
          placeholder="Répétez le mot de passe"
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Mise à jour…" : "Réinitialiser le mot de passe"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="hover:text-foreground">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
