import type { Metadata } from "next";

import { DashboardRouter } from "@/components/app/dashboard-router";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return <DashboardRouter />;
}
