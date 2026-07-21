import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Habillage des pages publiques (vitrine): en-tête et pied de page
 * marketing. Les espaces applicatif et d'authentification ont leur
 * propre chrome et ne passent pas par ce layout.
 */
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
