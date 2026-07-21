"use client";

import { Logo } from "@/components/shared/logo";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { primaryNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const spaceHref = user?.role === "donor" ? "/donneur" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center">
          <Logo />
        </a>

        {isAuthenticated ? null : (
          <nav className="hidden items-center gap-8 md:flex">
            {primaryNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/campagnes">Campagnes</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={spaceHref}>Mon espace</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/soutenir">Soutenir</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/donate">Devenir donneur</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
