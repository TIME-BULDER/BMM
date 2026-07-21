import type { Metadata } from "next";

import { AlertsBoard } from "@/components/app/alerts-board";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Alertes d'urgence" };

export default function AlertsPage() {
  return (
    <>
      <PageHeader
        title="Alertes d'urgence"
        description="Déclenchez et suivez les alertes ciblées vers les donneurs compatibles."
      />
      <AlertsBoard />
    </>
  );
}
