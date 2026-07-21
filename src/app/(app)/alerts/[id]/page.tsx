import type { Metadata } from "next";

import { EmergencyDetail } from "@/components/app/emergency-detail";

export const metadata: Metadata = { title: "Détail de l'urgence" };

export default async function EmergencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmergencyDetail id={id} />;
}
