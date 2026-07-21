import type { Metadata } from "next";

import { DonorSpace } from "@/components/donor/donor-space";

export const metadata: Metadata = { title: "Espace donneur" };

export default function DonorSpacePage() {
  return <DonorSpace />;
}
