import type { Metadata } from "next";

import { CardRequestsPanel } from "@/components/app/card-requests-panel";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Demandes de cartes" };

export default function DemandesCartesPage() {
  return (
    <>
      <PageHeader
        title="Demandes de cartes"
        description="Validez ou refusez les demandes de carte des donneurs, puis imprimez les cartes physiques."
      />
      <CardRequestsPanel />
    </>
  );
}
