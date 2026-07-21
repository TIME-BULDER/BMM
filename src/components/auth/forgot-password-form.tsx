"use client";

import { AlertCircle, ArrowLeft, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { AUTH_BYPASS } from "@/lib/dev/demo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const email = String(new FormData(event.currentTarget).get("email"));

    try {
      if (!AUTH_BYPASS) {
        const supabase = createSupabaseBrowserClient();
        const { error: err } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );
        if (err) throw err;
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Envoi impossible. Réessayez.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <MailCheck className="size-12 text-emerald-500" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-muted-foreground text-sm">
              Si un compte existe, un lien de réinitialisation vient d'être
              envoyé.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="text-muted-foreground text-sm">
          Entrez votre email : nous vous enverrons un lien pour le
          réinitialiser.
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
          placeholder="contact@hopital.bj"
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>

      <p className="text-center">
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
