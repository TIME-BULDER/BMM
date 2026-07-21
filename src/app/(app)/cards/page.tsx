import type { Metadata } from "next";

import { PageHeader } from "@/components/app/page-header";
import { RewardConsole } from "@/components/app/reward-console";

export const metadata: Metadata = { title: "Récompenses donneurs" };

export default function RewardsPage() {
  return (
    <>
      <PageHeader
        title="Récompenser un donneur"
        description="Après un don validé, envoyez une récompense Lightning au donneur via sa preuve Bitcoin."
      />
      <RewardConsole />
    </>
  );
}
