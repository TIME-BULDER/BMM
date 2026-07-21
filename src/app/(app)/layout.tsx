import { AppGuard } from "@/components/app/app-guard";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

/**
 * Espace applicatif (authentifié). Chrome dédié - barre latérale et bandeau -
 * indépendant du layout marketing. L'accès est protégé par la session.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppGuard>
      <div className="flex min-h-dvh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AppGuard>
  );
}
