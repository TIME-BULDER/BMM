import type { Metadata } from "next";

import { OrganizationsReview } from "@/components/app/organizations-review";
import { PageHeader } from "@/components/app/page-header";

export const metadata: Metadata = { title: "Organisations" };

export default function OrganisationsPage() {
  return (
    <>
      <PageHeader
        title="Organisations"
        description="Vérifiez les structures qui rejoignent le réseau et gérez leur accès."
      />
      <OrganizationsReview />
    </>
  );
}
