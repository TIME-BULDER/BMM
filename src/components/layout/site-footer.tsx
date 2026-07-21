import Link from "next/link";

import { Logo } from "@/components/shared/logo";

import { Container } from "@/components/layout/container";
import { footerNav } from "@/config/navigation";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions" },
];

export function SiteFooter() {
  return (
    <footer className="bg-secondary/30 border-t">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">
            Mieux gérer les donneurs de sang pour sauver plus de vies, partout
            en Afrique.
          </p>
        </div>

        {footerNav.map((group) => (
          <div key={group.title} className="flex flex-col gap-3">
            <span className="text-sm font-medium">{group.title}</span>
            <ul className="flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="text-muted-foreground flex flex-col items-center justify-between gap-3 border-t py-6 text-sm sm:flex-row">
        <span>
          {new Date().getFullYear()} Bitcoin Blood. Tous droits réservés.
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
