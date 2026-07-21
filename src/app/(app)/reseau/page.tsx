import type { Metadata } from "next";

import { NetworkBoard } from "@/components/app/network-board";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Réseau & stock" };

export default function NetworkPage() {
  return (
    <>
      <PageHeader
        title="Réseau & stock"
        description="Suivez votre stock par composant et échangez des poches avec les autres centres."
      />
      <NetworkBoard />
    </>
  );
}
