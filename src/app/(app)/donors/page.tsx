import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import { DonorsExplorer } from "@/components/app/donors-explorer";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Annuaire des donneurs" };

export default function DonorsPage() {
  return (
    <>
      <PageHeader
        title="Annuaire des donneurs"
        description="Donneurs validés du réseau. Recherchez, filtrez et validez après un don confirmé."
        actions={
          <Button asChild variant="outline">
            <Link href="/donate">
              <UserPlus className="size-4" />
              Lien d'inscription donneur
            </Link>
          </Button>
        }
      />
      <DonorsExplorer />
    </>
  );
}
