import type { Metadata } from "next";

import { CampaignsBoard } from "@/components/app/campaigns-board";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Campagnes de don" };

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        title="Campagnes de don"
        description="Organisez et suivez les campagnes de collecte de votre structure."
      />
      <CampaignsBoard />
    </>
  );
}
