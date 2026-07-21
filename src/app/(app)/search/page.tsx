import type { Metadata } from "next";

import { MatchingExplorer } from "@/components/app/matching-explorer";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Recherche compatible" };

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Recherche de donneurs compatibles"
        description="Sélectionnez le groupe du receveur pour identifier les donneurs compatibles à mobiliser."
      />
      <MatchingExplorer />
    </>
  );
}
