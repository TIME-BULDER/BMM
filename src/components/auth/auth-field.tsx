import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = ComponentProps<"input"> & {
  label: string;
  icon: LucideIcon;
};

/**
 * Champ texte premium: libellé, icône en tête, hauteur confortable.
 * Composant serveur - l'icône est rendue ici, jamais transmise à un
 * composant client (contrainte RSC).
 */
export function AuthField({
  label,
  icon: Icon,
  className,
  id,
  name,
  ...props
}: AuthFieldProps) {
  const fieldId = id ?? name;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <Icon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={fieldId}
          name={name}
          className={cn("h-11 pl-10", className)}
          {...props}
        />
      </div>
    </div>
  );
}
