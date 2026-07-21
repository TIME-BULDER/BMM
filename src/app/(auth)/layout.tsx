import Link from "next/link";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Habillage des écrans d'authentification: volet « moniteur de signes
 * vitaux » à gauche, panneau de formulaire épuré à droite.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-2">
      <AuthBrandPanel />

      <main className="relative flex flex-col">
        {/* En-tête mobile + bascule de thème toujours accessible. */}
        <div className="flex items-center justify-between p-5 sm:p-6">
          <Link href="/" className="flex items-center lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
