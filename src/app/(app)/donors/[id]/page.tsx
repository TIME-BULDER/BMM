import type { Metadata } from "next";

import { DonorProfileView } from "@/components/app/donor-profile-view";

export const metadata: Metadata = { title: "Fiche donneur" };

export default async function DonorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DonorProfileView id={id} />;
}
