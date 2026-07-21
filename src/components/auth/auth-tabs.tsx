"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Inscrire une structure" },
];

/**
 * Contrôle segmenté entre connexion et inscription. Conserve des routes
 * distinctes (deep-link) tout en donnant la sensation d'un onglet unique.
 */
export function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-muted/60 grid grid-cols-2 gap-1 rounded-lg p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md py-2 text-center text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
