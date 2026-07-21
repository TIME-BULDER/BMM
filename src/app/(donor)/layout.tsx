import { CalendarHeart } from "lucide-react";
import Link from "next/link";

import { DonorGuard } from "@/components/donor/donor-guard";
import { LogoutButton } from "@/components/donor/logout-button";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Habillage de l'espace donneur : en-tête sobre, distinct de l'espace
 * structures, avec accès aux campagnes publiques et déconnexion.
 */
export default function DonorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DonorGuard>
      <div className="flex min-h-dvh flex-col">
        <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
          <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/donneur" className="flex items-center">
              <Logo />
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/campagnes">
                  <CalendarHeart className="size-4" />
                  <span className="hidden sm:inline">Campagnes</span>
                </Link>
              </Button>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </DonorGuard>
  );
}
