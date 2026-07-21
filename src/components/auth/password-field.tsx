"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordFieldProps = Omit<ComponentProps<"input">, "type"> & {
  label?: string;
  /** Lien optionnel affiché en regard du libellé (ex: « Oublié ? »). */
  hint?: ReactNode;
};

/** Champ mot de passe avec bascule d'affichage. */
export function PasswordField({
  label = "Mot de passe",
  hint,
  className,
  id,
  name,
  ...props
}: PasswordFieldProps) {
  const fieldId = id ?? name ?? "password";
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>{label}</Label>
        {hint}
      </div>
      <div className="relative">
        <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={fieldId}
          name={name}
          type={visible ? "text" : "password"}
          className={cn("h-11 px-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-colors"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
