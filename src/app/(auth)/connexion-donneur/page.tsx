import type { Metadata } from "next";

import { DonorLoginForm } from "@/components/auth/donor-login-form";

export const metadata: Metadata = { title: "Connexion donneur" };

export default function DonorLoginPage() {
  return <DonorLoginForm />;
}
