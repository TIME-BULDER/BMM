"use client";

import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { appNav } from "@/config/app-navigation";
import { useLogout } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const flatNav = appNav.flatMap((group) => group.items);

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "BB"
  );
}

const demoRoles = [
  { value: "org_admin", label: "Structure" },
  { value: "super_admin", label: "Super-admin" },
] as const;

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isDemo, setDemoRole } = useAuth();
  const logout = useLogout();

  const orgName =
    user?.role === "super_admin"
      ? "Administration plateforme"
      : (user?.organization?.name ?? user?.email ?? "Mon organisation");

  async function handleLogout() {
    await logout.mutateAsync().catch(() => {});
    router.replace("/login");
  }

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Navigation horizontale repliée sur mobile */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto lg:hidden">
          {flatNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                <Icon className="size-4" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-1 lg:block" />

        {/* Bascule de rôle - visible uniquement en mode démo */}
        {isDemo && setDemoRole ? (
          <div className="bg-muted/60 hidden items-center gap-0.5 rounded-lg p-0.5 md:flex">
            {demoRoles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDemoRole(r.value)}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  user?.role === r.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          {user?.role !== "super_admin" ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/alerts">
                <Plus className="size-4" />
                Nouvelle alerte
              </Link>
            </Button>
          ) : null}
          <ThemeToggle />
          <div className="flex items-center gap-2 pl-1">
            <Avatar initials={initialsOf(orgName)} className="size-9" />
            <span className="hidden max-w-40 truncate text-sm font-medium md:inline">
              {orgName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={logout.isPending}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
